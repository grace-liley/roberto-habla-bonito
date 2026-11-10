// The chat as phones and tablets get it (picked in src/pages/Index.tsx).
// Laptops and desktops get ChatInterface.tsx, which already works for them.
// This is a separate copy while the iPhone mic problem is being fixed, so
// changes made for phones can't break the laptop version. The main
// difference: every turn opens a fresh mic and closes it before Roberto
// speaks, and the app recovers when the phone cuts the mic off. Once phones
// are fixed and proven, fold the two back into one file.
import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Mic, Send } from 'lucide-react'
import robertoChat from '@/assets/roberto-chat.png'

type Message = { role: 'user' | 'assistant'; content: string }
type Mode = 'immersion' | 'study'

const SILENCE_THRESHOLD = 8    // audio level (0-255) below which is "silent"
const SILENCE_DURATION = 1800  // ms of silence before auto-submitting
const MIN_SPEECH_MS = 400      // ms of speech required before silence detection kicks in
const MIN_RECORDING_MS = 700   // recordings shorter than this are discarded — too short to contain real speech, and Whisper hallucinates on near-empty audio
const MAX_RECORDING_MS = 30000 // failsafe: auto-submit if silence detection never triggers (iOS auto-gain can keep room noise above any fixed threshold). A learner's turn is rarely this long; 60s felt frozen
const MAX_AUTO_RETRIES = 2     // immersion: times to quietly reopen a mic the phone shut off, before asking for a tap
const CALIBRATION_MS = 300     // sample ambient noise at recording start to set the silence threshold
const MAX_THRESHOLD = 24       // threshold ceiling so speech during calibration can't push it unreachably high

// The password is typed once (after picking a mode) and remembered on the
// device. It's sent with every request and the server checks it before
// spending anything. 401 is the server's answer when it's missing or wrong.
const PASSWORD_KEY = 'roberto-password'
const LOCKED = 401
const loadSavedPassword = () => {
  try { return localStorage.getItem(PASSWORD_KEY) || '' } catch { return '' }
}
const savePassword = (password: string) => {
  try { localStorage.setItem(PASSWORD_KEY, password) } catch { /* private browsing: just won't be remembered */ }
}
const forgetSavedPassword = () => {
  try { localStorage.removeItem(PASSWORD_KEY) } catch { /* nothing to forget */ }
}

export default function ChatInterfaceMobile() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [heardNothing, setHeardNothing] = useState(false)
  const [micStopped, setMicStopped] = useState(false)

  // Password step: shown after a mode is picked, until the right password is entered
  const [pendingMode, setPendingMode] = useState<Mode | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [checkingPassword, setCheckingPassword] = useState(false)
  const passwordRef = useRef<string | null>(null)
  if (passwordRef.current === null) passwordRef.current = loadSavedPassword()

  const apiHeaders = () => ({
    'Content-Type': 'application/json',
    'x-roberto-password': encodeURIComponent(passwordRef.current || ''),
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  // How each recording should end, noted just before we stop it ourselves.
  // A recording that stops with no note was stopped by the phone behind our
  // back (iPhones do this to the mic), and we recover instead of leaving the
  // button stuck on "listening".
  const stopModesRef = useRef(new WeakMap<MediaRecorder, 'send' | 'discard'>())
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startingRef = useRef(false)
  const autoRetriesRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldListenRef = useRef(false)
  const messagesRef = useRef<Message[]>([])
  const modeRef = useRef<Mode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      }
    } catch {
      console.log('Wake lock unavailable')
    }
  }

  const closeAudioContext = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  const clearFailsafe = () => {
    if (failsafeRef.current) {
      clearTimeout(failsafeRef.current)
      failsafeRef.current = null
    }
  }

  // Let go of the microphone completely, so the next recording gets a fresh one
  const releaseMic = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  // A fresh mic for every turn, closed again the moment the recording ends,
  // so Roberto never speaks while it's open. On iPhone, keeping one mic open
  // while his voice played made the next recording come out empty (every
  // phone test on 2026-11-08: the first turn worked, the turn after Roberto's
  // first reply didn't). The trade-off: Safari may ask for the mic more often.
  const openMic = async () => {
    releaseMic()
    const fresh = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = fresh
    return fresh
  }

  // Stop the current recording and throw the audio away (Roberto is about to
  // speak, or the conversation is over)
  const discardRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder?.state === 'recording') {
      stopModesRef.current.set(recorder, 'discard')
      recorder.stop()
    }
  }

  // Nothing usable was recorded. Say so, then: immersion listens again by
  // itself; study waits for the next tap
  const nothingHeard = () => {
    setIsLoading(false)
    if (!modeRef.current) return // conversation already ended
    setHeardNothing(true)
    if (modeRef.current === 'immersion') {
      shouldListenRef.current = true
      startRecording()
    }
  }

  // The phone shut the mic off on its own. Drop that mic; immersion quietly
  // tries again with a fresh one a couple of times, then asks for a tap
  const micWasStopped = () => {
    console.warn('Mic stopped unexpectedly')
    releaseMic()
    if (!modeRef.current) return // conversation already ended
    if (modeRef.current === 'immersion' && autoRetriesRef.current < MAX_AUTO_RETRIES) {
      autoRetriesRef.current++
      shouldListenRef.current = true
      startRecording()
      return
    }
    setMicStopped(true)
  }

  // Must be called from a user tap. Playing a silent clip inside the tap
  // unlocks this audio element so later replies can reuse it — browsers
  // block play() calls that aren't tied to a user gesture.
  const unlockAudio = () => {
    if (sharedAudioRef.current) return
    const audio = new Audio(
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA'
    )
    audio.play().catch(() => {})
    sharedAudioRef.current = audio
  }

  const speak = async (text: string) => {
    // Hands-free re-listen is an immersion behaviour; study mode is strictly
    // tap-to-talk, so the mic must never open itself there
    const handsFree = modeRef.current === 'immersion'
    if (!text?.trim()) {
      if (handsFree) {
        shouldListenRef.current = true
        startRecording()
      }
      return
    }
    setIsSpeaking(true)
    shouldListenRef.current = false

    discardRecording()
    releaseMic() // Roberto must never speak while the mic is open (see openMic)
    closeAudioContext()
    setIsListening(false)

    let finish: (() => void) | null = null
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ text }),
      })

      if (res.status === LOCKED) { lockedOut(); return }
      if (!res.ok) throw new Error('TTS failed')

      const audioBlob = await res.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = sharedAudioRef.current ?? new Audio()
      audio.src = audioUrl
      currentAudioRef.current = audio

      let finished = false
      let watchdog: ReturnType<typeof setTimeout> | null = null
      const onFinish = () => {
        if (finished) return
        finished = true
        if (watchdog) clearTimeout(watchdog)
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        audio.onended = null
        audio.onerror = null
        currentAudioRef.current = null
        if (shouldListenRef.current) {
          startRecording()
        }
      }

      audio.onended = onFinish
      audio.onerror = onFinish
      finish = onFinish
      // Safety net: if playback stalls and neither event ever fires (seen on
      // iOS Safari), recover instead of leaving the mic button frozen
      const estimatedMs = Math.max(15000, text.length * 150)
      watchdog = setTimeout(onFinish, estimatedMs)

      shouldListenRef.current = handsFree
      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      // If playback was set up, finish through onFinish: it runs only once, so
      // its watchdog or error event can't open the mic a second time later
      if (finish) {
        finish()
        return
      }
      // Roberto's voice failed but his words are on screen: carry on
      setIsSpeaking(false)
      if (handsFree) {
        shouldListenRef.current = true
        startRecording()
      }
    }
  }

  const startRecording = async () => {
    // Never run two recordings at once: a second one would orphan the first,
    // leaving the mic on and the button out of step with what's happening
    if (startingRef.current || mediaRecorderRef.current?.state === 'recording') return
    startingRef.current = true
    setMicStopped(false)
    try {
      const stream = await openMic()
      // The conversation may have ended while we were waiting for the mic
      if (!modeRef.current) {
        releaseMic()
        return
      }
      const track = stream.getAudioTracks()[0]

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      const chunks: Blob[] = []
      const startedAt = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      // If the phone mutes or ends the mic mid-recording, everything after
      // that is silence: stop now and recover rather than sit there "listening"
      const onMicLost = () => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop()
      }
      track?.addEventListener('mute', onMicLost)
      track?.addEventListener('ended', onMicLost)

      mediaRecorder.onerror = (event) => console.error('Recorder error:', event)

      // Runs however the recording ends (our stop, the failsafe, or the phone
      // cutting the mic), so the button can never be left stuck on "listening"
      mediaRecorder.onstop = () => {
        const how = stopModesRef.current.get(mediaRecorder) ?? null
        track?.removeEventListener('mute', onMicLost)
        track?.removeEventListener('ended', onMicLost)
        // Close this turn's mic straight away (see openMic)
        stream.getTracks().forEach(t => t.stop())
        if (streamRef.current === stream) streamRef.current = null
        // A newer recording has already taken over: leave its state alone
        if (mediaRecorderRef.current !== mediaRecorder) return
        mediaRecorderRef.current = null
        clearFailsafe()
        closeAudioContext()
        setIsListening(false)

        if (how === 'discard') return
        if (how === null) {
          micWasStopped()
          return
        }

        const recordingMs = Date.now() - startedAt
        const audioBlob = new Blob(chunks, { type: mimeType })
        // Too-short recordings can't contain real speech — sending them makes
        // Whisper hallucinate a transcript out of nothing
        if (recordingMs >= MIN_RECORDING_MS && audioBlob.size > 500) {
          transcribeAndSend(audioBlob)
        } else {
          nothingHeard()
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsListening(true)

      // Failsafe on a plain timer, not inside the silence-detection loop below
      // (if that loop ever stalls, it would take the failsafe down with it):
      // never let a recording run forever
      failsafeRef.current = setTimeout(() => {
        if (mediaRecorderRef.current === mediaRecorder) stopRecording()
      }, MAX_RECORDING_MS)

      if (modeRef.current === 'immersion') {
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext
        // Safari can create this paused when it isn't started by a tap; a
        // paused one reads as total silence, so the pause is never noticed
        if (audioContext.state === 'suspended') audioContext.resume().catch(() => {})
        const analyser = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)
        analyser.fftSize = 512
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        let speechDetected = false
        let silenceStart: number | null = null
        let speechStartTime = 0
        let ambientSum = 0
        let ambientCount = 0
        let calibrated = false
        let threshold = SILENCE_THRESHOLD

        const check = () => {
          // Only ever act on this loop's own recording
          if (mediaRecorderRef.current !== mediaRecorder || mediaRecorder.state !== 'recording') return
          analyser.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          const elapsed = Date.now() - startedAt

          // Calibrate the silence threshold against this room's actual noise
          // floor — a fixed value fails once iOS cranks the mic gain up
          if (!calibrated) {
            if (elapsed < CALIBRATION_MS) {
              ambientSum += avg
              ambientCount++
              requestAnimationFrame(check)
              return
            }
            if (ambientCount > 0) {
              threshold = Math.min(
                MAX_THRESHOLD,
                Math.max(SILENCE_THRESHOLD, (ambientSum / ambientCount) * 1.5 + 4)
              )
            }
            calibrated = true
          }

          if (avg > threshold) {
            if (!speechDetected) {
              speechDetected = true
              speechStartTime = Date.now()
            }
            silenceStart = null
          } else if (speechDetected) {
            if (!silenceStart) silenceStart = Date.now()
            const silenceDuration = Date.now() - silenceStart
            const speechDuration = Date.now() - speechStartTime
            if (silenceDuration > SILENCE_DURATION && speechDuration > MIN_SPEECH_MS) {
              stopRecording()
              return
            }
          }
          requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
      }

    } catch (error) {
      console.error('Recording error:', error)
      setIsListening(false)
      releaseMic()
      setMicStopped(true)
    } finally {
      startingRef.current = false
    }
  }

  // Stop listening and send what was said. If nothing is actually recording
  // any more (the phone shut the mic off behind our back), still reset the
  // button and let go of the mic, so the next tap starts clean
  const stopRecording = () => {
    shouldListenRef.current = false
    const recorder = mediaRecorderRef.current
    if (recorder?.state === 'recording') {
      stopModesRef.current.set(recorder, 'send')
      recorder.stop() // onstop takes it from here
    } else {
      mediaRecorderRef.current = null
      clearFailsafe()
      closeAudioContext()
      releaseMic()
    }
    setIsListening(false)
  }

  const transcribeAndSend = async (audioBlob: Blob) => {
    setIsLoading(true)
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      const chunks: string[] = []
      const CHUNK = 0x8000
      for (let i = 0; i < bytes.length; i += CHUNK) {
        chunks.push(String.fromCharCode(...(bytes.subarray(i, i + CHUNK) as unknown as number[])))
      }
      const audioBase64 = btoa(chunks.join(''))

      const res = await fetch('/api/stt', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ audioBase64, mimeType: audioBlob.type }),
      })

      if (res.status === LOCKED) { lockedOut(); return }
      const data = await res.json()
      if (data.text?.trim()) {
        setHeardNothing(false)
        autoRetriesRef.current = 0
        await sendMessage(data.text, messagesRef.current)
      } else {
        // Nothing usable heard (silence or a filtered Whisper hallucination).
        // Tell the user — a silent reset feels like the message was ignored
        nothingHeard()
      }
    } catch (error) {
      console.error('STT error:', error)
      nothingHeard()
    }
  }

  const sendMessage = async (text: string, currentMessages: Message[] = messagesRef.current) => {
    if (!text.trim()) return
    const validMessages = currentMessages.filter(m => typeof m.content === 'string' && m.content.trim())
    const updated: Message[] = [...validMessages, { role: 'user', content: text }]
    setMessages(prev => [...prev.filter(m => typeof m.content === 'string' && m.content.trim()), { role: 'user', content: text }])
    messagesRef.current = updated
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ messages: updated }),
      })
      if (res.status === LOCKED) { lockedOut(); return }
      if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
      const data = await res.json()
      if (!data.content) throw new Error('No content in response')
      const reply: Message = { role: 'assistant', content: data.content }
      setMessages(prev => [...prev, reply])
      messagesRef.current = [...updated, reply]
      await speak(data.content)
    } catch (error) {
      console.error('Chat error', error)
      if (modeRef.current === 'immersion') {
        shouldListenRef.current = true
        startRecording()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startChat = async (selectedMode: Mode) => {
    unlockAudio()
    setMode(selectedMode)
    modeRef.current = selectedMode
    await requestWakeLock()

    if (selectedMode === 'immersion') {
      setIsLoading(true)
      const trigger: Message = { role: 'user', content: '[inicio]' }
      messagesRef.current = [trigger]
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify({ messages: [trigger] }),
        })
        if (res.status === LOCKED) { lockedOut(); return }
        const data = await res.json()
        if (data.content) {
          const reply: Message = { role: 'assistant', content: data.content }
          messagesRef.current = [trigger, reply]
          setMessages([reply])
          setIsLoading(false)
          await speak(data.content)
        } else {
          setIsLoading(false)
          startRecording()
        }
      } catch {
        setIsLoading(false)
        startRecording()
      }
    }
    // Study mode is strictly tap-to-talk: don't open the mic on mode select.
    // Auto-starting here meant the first mic tap *sent* the silence recorded
    // so far, and Whisper hallucinated a message out of it.
  }

  const endConversation = () => {
    shouldListenRef.current = false
    discardRecording()
    clearFailsafe()
    closeAudioContext()
    releaseMic()
    setHeardNothing(false)
    setMicStopped(false)
    autoRetriesRef.current = 0
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setIsListening(false)
    setIsSpeaking(false)
    setIsLoading(false)
    setMessages([])
    messagesRef.current = []
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
    setMode(null)
  }

  // The server turned a request away: the saved password is wrong or has
  // been changed. Forget it and ask again, for the same mode.
  const lockedOut = () => {
    const lockedMode = modeRef.current
    passwordRef.current = ''
    forgetSavedPassword()
    endConversation()
    setPasswordInput('')
    setPasswordError("That password doesn't work any more.")
    setPendingMode(lockedMode)
  }

  // Mode buttons: go straight in if this device already has the password,
  // otherwise show the password step first
  const chooseMode = (selectedMode: Mode) => {
    unlockAudio() // inside the tap, before anything async, so Roberto's voice can play later
    if (passwordRef.current) {
      startChat(selectedMode)
      return
    }
    setPasswordInput('')
    setPasswordError('')
    setPendingMode(selectedMode)
  }

  const cancelPassword = () => {
    setPendingMode(null)
    setPasswordError('')
  }

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault()
    unlockAudio()
    const attempt = passwordInput.trim()
    if (!attempt || !pendingMode || checkingPassword) return
    setCheckingPassword(true)
    setPasswordError('')
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-roberto-password': encodeURIComponent(attempt) },
      })
      if (res.ok) {
        passwordRef.current = attempt
        savePassword(attempt)
        const chosen = pendingMode
        setPendingMode(null)
        setPasswordInput('')
        startChat(chosen)
      } else if (res.status === LOCKED) {
        setPasswordError("That's not the password. Try again?")
      } else {
        setPasswordError('Something went wrong on our side. Try again in a minute.')
      }
    } catch {
      setPasswordError('Something went wrong. Check your connection and try again.')
    } finally {
      setCheckingPassword(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopRecording()
    } else {
      unlockAudio()
      autoRetriesRef.current = 0
      setHeardNothing(false)
      shouldListenRef.current = true
      startRecording()
      requestWakeLock()
    }
  }

  const statusText = () => {
    if (isLoading) return 'Roberto is thinking...'
    if (isSpeaking) return 'Roberto is speaking...'
    if (isListening) {
      if (modeRef.current !== 'immersion') return 'Listening... tap again to send'
      // Immersion listens again by itself after an empty recording, so say
      // so; otherwise it looks like what you said was ignored
      return heardNothing
        ? "No te escuché. Try again, I'm listening"
        : 'Listening... pause when done, or tap to send'
    }
    if (micStopped) return 'The mic stopped. Tap it to try again'
    if (heardNothing) return "No te escuché. Tap the mic and try again"
    if (modeRef.current === 'immersion') {
      return messages.length === 0 ? 'Starting...' : 'Tap the mic to keep talking'
    }
    return 'Tap the mic to speak'
  }

  if (!mode) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 px-4">
        <p className="hand-drawn text-center text-2xl md:text-3xl text-foreground max-w-xs">
          How would you like to chat today?
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => chooseMode('immersion')}
            className="bg-background border-2 border-foreground rounded-2xl p-4 text-left hover:border-accent transition-colors"
          >
            <p className="font-daniel font-bold text-xl">Immersion mode</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hands-free. Just speak naturally, like a phone call.
            </p>
          </button>
          <button
            onClick={() => chooseMode('study')}
            className="bg-background border-2 border-foreground rounded-2xl p-4 text-left hover:border-accent transition-colors"
          >
            <p className="font-daniel font-bold text-xl">Study mode</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap to speak, tap again to send. Full transcript saved so you can review afterwards.
            </p>
          </button>
        </div>

        {pendingMode && (
          // A panel inside the page rather than a browser pop-up, so pop-up
          // blockers never stop it. Tapping outside the card goes back.
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[18vh]"
            onClick={cancelPassword}
          >
            <form
              onSubmit={submitPassword}
              onClick={e => e.stopPropagation()}
              className="panel w-full max-w-xs p-6 flex flex-col gap-3"
            >
              <label htmlFor="roberto-password" className="font-daniel font-bold text-xl">
                What's the password?
              </label>
              <input
                id="roberto-password"
                type="text"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                autoFocus
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="bg-background border-2 border-foreground rounded-xl px-3 py-2 text-base focus:outline-none focus:border-accent"
              />
              {passwordError && (
                <p role="alert" className="text-sm font-semibold text-foreground">{passwordError}</p>
              )}
              <button
                type="submit"
                disabled={checkingPassword || !passwordInput.trim()}
                className="bg-accent text-foreground border-2 border-foreground rounded-2xl py-2 font-daniel font-bold text-lg disabled:opacity-50"
              >
                {checkingPassword ? 'Checking...' : 'Start'}
              </button>
              <p className="text-xs text-muted-foreground">
                Don't have it? Register for an event, or email{' '}
                <a href="mailto:hola@robertocon.me" className="underline underline-offset-2">hola@robertocon.me</a>
              </p>
              <button
                type="button"
                onClick={cancelPassword}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 self-center"
              >
                Back
              </button>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="panel flex flex-col items-center gap-4 py-6 px-4 w-full">
      {mode === 'study' && (
        <div className="w-full max-w-lg space-y-3 max-h-72 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-2 max-w-xs text-sm leading-relaxed border-2 ${
                msg.role === 'user'
                  ? 'bg-accent text-foreground border-foreground'
                  : 'bg-background text-foreground border-accent'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {mode === 'immersion' && messages.length > 0 && (
        <div className="w-full max-w-lg">
          <div className="rounded-2xl px-4 py-3 bg-background border-2 border-accent text-foreground text-sm leading-relaxed">
            {[...messages].reverse().find(m => m.role === 'assistant')?.content}
          </div>
        </div>
      )}

      {/* Roberto himself, so it feels like he's right there chatting */}
      <img
        src={robertoChat}
        alt="Roberto"
        draggable={false}
        className="w-32 md:w-40 h-auto select-none pointer-events-none"
      />

      <p className="text-xs text-muted-foreground">{statusText()}</p>

      {mode === 'immersion' ? (
        <>
          {/* Escape hatches: while listening, a tap sends what was said so far
              (if silence detection fails and the mic never stops on its own).
              While idle, a tap starts listening again, so immersion can never
              be left with a dead mic and nothing to press */}
          <button
            onClick={toggleListening}
            disabled={isLoading || isSpeaking}
            aria-label={isListening ? 'Send' : 'Start listening'}
            className={`w-20 h-20 rounded-full border-2 border-foreground flex items-center justify-center transition-all duration-200 disabled:cursor-default ${
              isListening
                ? 'bg-accent scale-110 shadow-lg animate-pulse'
                : isSpeaking
                ? 'bg-accent/40'
                : 'bg-secondary'
            }`}
          >
            <Mic size={28} className="text-foreground" />
          </button>
          <button
            onClick={endConversation}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            End conversation
          </button>
        </>
      ) : (
        <button
          onClick={toggleListening}
          disabled={isLoading || isSpeaking}
          className={`w-20 h-20 rounded-full border-2 border-foreground flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-accent scale-110 shadow-lg'
              : 'bg-secondary hover:bg-accent/40'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isListening ? <Send size={28} className="text-foreground" /> : <Mic size={28} />}
        </button>
      )}

    </div>
  )
}
