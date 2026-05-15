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
                                        formData.append('model_id', 'scribe_v1')
                                            formData.append('language_code', 'es')

                                                const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
                                                      method: 'POST',
                                                            headers: {
                                                                    'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                                                                          },
                                                                                body: formData,
                                                                                    })

                                                                                        if (!response.ok) {
                                                                                              const error = await response.text()
                                                                                                    console.error('ElevenLabs STT error:', error)
                                                                                                          return res.status(500).json({ error: 'STT request failed' })
                                                                                                              }
                                                                                                              
                                                                                                                  const data = await response.json()
                                                                                                                      return res.status(200).json({ text: data.text })
                                                                                                                        } catch (error) {
                                                                                                                            console.error('STT error:', error)
                                                                                                                                return res.status(500).json({ error: 'Failed to transcribe audio' })
                                                                                                                                  }
                                                                                                                                  }
