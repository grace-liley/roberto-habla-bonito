import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }
type Mode = 'immersion' | 'study'

const SILENCE_THRESHOLD = 8    // audio level (0-255) below which is "silent"
const SILENCE_DURATION = 1800  // ms of silence before auto-submitting
const MIN_SPEECH_MS = 400      // ms of speech required before silence detection kicks in

export default function ChatInterface() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
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

  const speak = async (text: string) => {
    if (!text?.trim()) {
      shouldListenRef.current = true
      startRecording()
      return
    }
    setIsSpeaking(true)
    shouldListenRef.current = false

    // Stop any active recording without transcribing — clear chunks first
    if (mediaRecorderRef.current?.state === 'recording') {
      audioChunksRef.current = []
      mediaRecorderRef.current.stop()
    }
    closeAudioContext()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setIsListening(false)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) throw new Error('TTS failed')

      const audioBlob = await res.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio

      const onFinish = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        if (shouldListenRef.current) {
          startRecording()
        }
      }

      audio.onended = onFinish
      audio.onerror = onFinish

      shouldListenRef.current = true
      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
      if (shouldListenRef.current) {
        startRecording()
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        closeAudioContext()
        const chunks = audioChunksRef.current
        if (chunks.length === 0) return // discarded by speak()
        const audioBlob = new Blob(chunks, { type: mimeType })
        if (audioBlob.size > 500) {
          await transcribeAndSend(audioBlob)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsListening(true)

      // Silence detection — immersion mode only
      if (modeRef.current === 'immersion') {
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext
        const analyser = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)
        analyser.fftSize = 512
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        let speechDetected = false
        let silenceStart: number | null = null
        let speechStartTime = 0

        const check = () => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return
          analyser.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length

          if (avg > SILENCE_THRESHOLD) {
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
    }
  }

  const stopRecording = () => {
    shouldListenRef.current = false
    closeAudioContext()
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType: audioBlob.type }),
      })

      const data = await res.json()
      if (data.text?.trim()) {
        await sendMessage(data.text, messagesRef.current)
      } else {
        // Nothing heard — restart mic
        setIsLoading(false)
        shouldListenRef.current = true
        startRecording()
      }
    } catch (error) {
      console.error('STT error:', error)
      setIsLoading(false)
      if (modeRef.current === 'immersion') {
        shouldListenRef.current = true
        startRecording()
      }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })
      if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
      const data = await res.json()
      if (!data.content) throw new Error('No content in response')
      const reply: Message = { role: 'assistant', content: data.content }
      setMessages(prev => [...prev, reply])
      messagesRef.current = [...updated, reply]
      await speak(data.content)
    } catch (error) {
      console.error('Chat error', error)
      shouldListenRef.current = true
      startRecording()
    } finally {
      setIsLoading(false)
    }
  }

  const startChat = async (selectedMode: Mode) => {
    setMode(selectedMode)
    await requestWakeLock()

    if (selectedMode === 'immersion') {
      // Trigger Roberto's opening message so he speaks first
      setIsLoading(true)
      const trigger: Message = { role: 'user', content: '[inicio]' }
      messagesRef.current = [trigger]
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [trigger] }),
        })
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
    } else {
      startRecording()
    }
  }

  const endConversation = () => {
    shouldListenRef.current = false
    closeAudioContext()
    if (mediaRecorderRef.current?.state === 'recording') {
      audioChunksRef.current = []
      mediaRecorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach(track => track.stop())
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

  const toggleListening = () => {
    if (isListening) {
      stopRecording()
    } else {
      shouldListenRef.current = true
      startRecording()
      requestWakeLock()
    }
  }

  const statusText = () => {
    if (isLoading) return 'Roberto is thinking...'
    if (isSpeaking) return 'Roberto is speaking...'
    if (isListening) return modeRef.current === 'immersion' ? 'Listening — speak naturally' : 'Listening...'
    if (modeRef.current === 'immersion') return 'Starting...'
    return 'Tap the mic to speak'
  }

  if (!mode) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 px-4">
        <p className="text-center text-sm text-muted-foreground max-w-xs">
          How would you like to chat today?
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => startChat('immersion')}
            className="border rounded-xl p-4 text-left hover:border-orange-400 transition-colors"
          >
            <p className="font-medium text-sm">Immersion mode</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hands-free — just speak naturally, like a phone call
            </p>
          </button>
          <button
            onClick={() => startChat('study')}
            className="border rounded-xl p-4 text-left hover:border-orange-400 transition-colors"
          >
            <p className="font-medium text-sm">Study mode</p>
            <p className="text-xs text-muted-foreground mt-1">
              Full transcript saved so you can review afterwards
            </p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-4 w-full">
      {mode === 'study' && (
        <div className="w-full max-w-lg space-y-3 max-h-72 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-2 max-w-xs text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-400 text-white'
                  : 'bg-secondary text-foreground'
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
          <div className="rounded-2xl px-4 py-3 bg-secondary text-foreground text-sm leading-relaxed">
            {[...messages].reverse().find(m => m.role === 'assistant')?.content}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{statusText()}</p>

      {mode === 'immersion' ? (
        <>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 pointer-events-none ${
            isListening
              ? 'bg-orange-400 scale-110 shadow-lg animate-pulse'
              : isSpeaking
              ? 'bg-orange-200'
              : 'bg-secondary'
          }`}>
            <Mic size={28} className={isListening ? 'text-white' : 'text-muted-foreground'} />
          </div>
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
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-orange-400 scale-110 shadow-lg'
              : 'bg-secondary hover:bg-orange-100'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
      )}

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        For the best experience, keep your screen on while chatting. On iPhone: Settings → Display & Brightness → Auto-Lock → Never
      </p>
    </div>
  )
}
