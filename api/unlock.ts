import type { VercelRequest, VercelResponse } from '@vercel/node'

// Checks the password typed on the home page without spending anything on
// Claude, Whisper or ElevenLabs. The real lock is the same check inside
// chat, stt and tts; this just lets the app say "wrong password" before the
// conversation starts.

// Same check as in chat.ts, stt.ts and tts.ts (see the note there).
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.ROBERTO_PASSWORD?.trim()) {
    console.error('ROBERTO_PASSWORD is not set in Vercel environment variables')
    return res.status(500).json({ error: 'not_configured' })
  }

  if (!passwordOk(req)) {
    return res.status(401).json({ error: 'wrong_password' })
  }

  return res.status(200).json({ ok: true })
}
