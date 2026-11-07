import type { VercelRequest, VercelResponse } from '@vercel/node'

// Password lock: the app sends the password the visitor typed with every
// request. Anything without the right one is turned away here, before we
// spend anything on Claude, Whisper or ElevenLabs. The password lives in the
// ROBERTO_PASSWORD environment variable in Vercel, never in this code.
// (Copied into each api/ file on purpose: shared imports between Vercel
// functions are fiddly in this project's setup, and this keeps each one
// self-contained.)
function passwordOk(req: VercelRequest): boolean {
  const clean = (s: string) => s.normalize('NFC').trim().toLowerCase()
  const expected = clean(process.env.ROBERTO_PASSWORD || '')
  let given = ''
  try {
    given = clean(decodeURIComponent(String(req.headers['x-roberto-password'] || '')))
  } catch {
    return false
  }
  return expected !== '' && given === expected
}

// Bias transcription toward learner speech. Kept short and in Spanish:
// Whisper is known to echo the prompt back as the transcript when it
// receives silence or unclear audio, so the prompt must never look like
// instructions, and we filter echoes out below.
const WHISPER_PROMPT = 'Práctica de español. El estudiante mezcla inglés y español.'

// Segments Whisper thinks are probably not speech get dropped entirely —
// these are where hallucinated text (including prompt echoes) comes from.
const NO_SPEECH_THRESHOLD = 0.75

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// True when the transcript is substantially the prompt echoed back.
const isPromptEcho = (transcript: string) => {
  const t = normalize(transcript)
  const p = normalize(WHISPER_PROMPT)
  if (!t) return true
  if (p.includes(t) || t.includes(p)) return true
  const promptWords = new Set(p.split(' '))
  const words = t.split(' ')
  const overlap = words.filter(w => promptWords.has(w)).length
  return words.length >= 4 && overlap / words.length > 0.7
}

// Phrases Whisper invents from silence or noise, learned from video subtitle
// credits (e.g. "Subtítulos realizados por la comunidad de Amara.org").
// Matched against normalized text. Kept specific on purpose: "amara" alone is
// a real Spanish verb form ("si ella me amara"), so only credit wording counts.
const HALLUCINATION_MARKERS = [
  'amaraorg',
  'amara org',
  'comunidad de amara',
  'subtitulos realizados por',
  'subtitulos por la comunidad',
  'subtitulado por la comunidad',
  'subtitles by the',
  'thanks for watching',
  'thank you for watching',
  'gracias por ver el video',
  'suscribete al canal',
  'no olvides suscribirte',
  'please subscribe',
]

// Drop any sentence that is a known hallucination but keep real speech around
// it — Whisper sometimes tacks a subtitle credit onto genuine audio. Splits only
// on punctuation followed by a space, so "Amara.org" stays in one piece.
const stripHallucinations = (transcript: string) =>
  transcript
    .replace(/([.!?…])\s+/g, '$1\n')
    .split('\n')
    .filter(sentence => {
      const n = normalize(sentence)
      return !HALLUCINATION_MARKERS.some(marker => n.includes(marker))
    })
    .join(' ')
    .trim()

type WhisperSegment = { text: string; no_speech_prob: number }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!passwordOk(req)) {
    return res.status(401).json({ error: 'wrong_password' })
  }

  const { audioBase64, mimeType } = req.body

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data required' })
  }

  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64')
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' })

    const formData = new FormData()
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')
    formData.append('prompt', WHISPER_PROMPT)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI Whisper error:', error)
      return res.status(500).json({ error: 'STT request failed' })
    }

    const data = await response.json()

    // Keep only segments Whisper is confident contain real speech
    const segments: WhisperSegment[] = data.segments ?? []
    const confident = (
      segments.length > 0
        ? segments
            .filter(s => s.no_speech_prob < NO_SPEECH_THRESHOLD)
            .map(s => s.text)
            .join(' ')
        : data.text ?? ''
    ).trim()
    const text = stripHallucinations(confident)

    if (!text || isPromptEcho(text)) {
      // Silence, a known hallucinated phrase, or a prompt echo — return empty
      // so the client listens again instead of sending a fake user message
      console.log('STT filtered:', JSON.stringify({ raw: data.text, confident, kept: text, segments: segments.map(s => s.no_speech_prob) }))
      return res.status(200).json({ text: '' })
    }

    return res.status(200).json({ text })
  } catch (error) {
    console.error('STT error:', error)
    return res.status(500).json({ error: 'Failed to transcribe audio' })
  }
}
