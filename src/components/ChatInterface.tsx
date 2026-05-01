import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }
type Mode = 'immersion' | 'study'

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export default function ChatInterface() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Wake lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      }
    } catch {
      console.log('Wake lock unavailable')
    }
  }

  // Speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'es-CO'

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const text = result[0].transcript
      setLiveTranscript(text)
      if (result.isFinal) {
        setLiveTranscript('')
        sendMessage(text)
      }
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speak = (text: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-CO'
    utterance.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    const spanishVoice = voices.find(v => v.lang.startsWith('es'))
    if (spanishVoice) utterance.voice = spanishVoice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async (text: string, currentMessages = messages) => {
    if (!text.trim()) return
    const updated: Message[] = [...currentMessages, { role: 'user', content: text }]
    setMessages(updated)
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      const reply: Message = { role: 'assistant', content: data.content }
      setMessages(prev => [...prev, reply])
      speak(data.content)
    } catch {
      console.error('Chat error')
    } finally {
      setIsLoading(false)
    }
  }

  const startChat = async (selectedMode: Mode) => {
    setMode(selectedMode)
    await requestWakeLock()
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })
      const data = await res.json()
      const opening: Message = { role: 'assistant', content: data.content }
      setMessages([opening])
      speak(data.content)
    } catch {
      console.error('Start error')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      requestWakeLock()
    }
  }

  const statusText = () => {
    if (isLoading) return 'Roberto is thinking...'
    if (isSpeaking) return 'Roberto is speaking...'
    if (isListening) return 'Listening...'
    return 'Tap the mic to speak'
  }

  // Mode selection
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
              No transcript — closest to a real conversation
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

      {/* Study mode: full transcript */}
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
          {liveTranscript && (
            <div className="flex justify-end">
              <div className="rounded-2xl px-4 py-2 max-w-xs text-sm bg-orange-200 text-orange-800 italic">
                {liveTranscript}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Immersion mode: show Roberto's last message only */}
      {mode === 'immersion' && messages.length > 0 && (
        <div className="w-full max-w-lg">
          <div className="rounded-2xl px-4 py-3 bg-secondary text-foreground text-sm leading-relaxed">
            {[...messages].reverse().find(m => m.role === 'assistant')?.content}
          </div>
        </div>
      )}

      {/* Status */}
      <p className="text-xs text-muted-foreground">{statusText()}</p>

      {/* Mic button */}
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

      {/* Screen tip */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        For the best experience, keep your screen on while chatting.
        On iPhone: Settings → Display & Brightness → Auto-Lock → Never
      </p>
    </div>
  )
}
