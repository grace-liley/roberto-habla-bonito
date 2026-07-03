import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
    // Bias transcription toward learner speech: imperfect Spanish from an
    // English speaker, often mixing English words mid-sentence
    formData.append(
      'prompt',
      'Práctica de conversación en español. The speaker is an English-speaking learner practicing imperfect Spanish and may mix in English words or ask questions in English.'
    )

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
    return res.status(200).json({ text: data.text })
  } catch (error) {
    console.error('STT error:', error)
    return res.status(500).json({ error: 'Failed to transcribe audio' })
  }
}
