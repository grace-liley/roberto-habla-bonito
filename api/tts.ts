import type { VercelRequest, VercelResponse } from '@vercel/node'

const VOICE_ID = 'beQfcCW5PgdTQs4cETaz'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' })
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
                                model_id: 'eleven_multilingual_v2',
                                voice_settings: {
                                              stability: 0.5,
                                              similarity_boost: 0.75,
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
