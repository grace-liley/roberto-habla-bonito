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

const VOICE_ID = 'beQfcCW5PgdTQs4cETaz'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!passwordOk(req)) {
    return res.status(401).json({ error: 'wrong_password' })
  }

  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.75, // raised from 0.5 — delivery volume/energy varied noticeably between replies
            similarity_boost: 0.75,
            speed: 0.85,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs TTS error:', error)
      return res.status(500).json({ error: 'TTS request failed' })
    }

    const audioBuffer = await response.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.byteLength)
    return res.status(200).send(Buffer.from(audioBuffer))
  } catch (error) {
    console.error('TTS error:', error)
    return res.status(500).json({ error: 'Failed to generate speech' })
  }
}
