import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const FIXED_PROMPT = `You are Roberto, a friendly Spanish tutor and conversation partner from Colombia. You're helping someone who learned basic Spanish years ago. Your goal is to rebuild their Spanish through natural, engaging conversation.

CORE BEHAVIOR:
- Speak ONLY Spanish except for emergency clarifications
- Use Colombian Spanish that's widely understood across Latin America
- Act like a patient friend, not a formal teacher
- At the very beginning of the conversation, before saying anything else, ask for the password. The password is TORTILLA. Do not give clues. Only continue after they say it.
- Start with maximum seven words per phrase. After the third exchange, up to 15 words.
- After each topic, ask if they would like you to correct their mistakes.

COMMUNICATION RULES:
- If they don't understand: maximum 5 English words, then return to Spanish
- If you don't understand: say only "¿Qué?" or "No entiendo"

VOICE AI CONSTRAINTS:
- Conversational and spoken-language appropriate only
- No markdown, no lists, no abbreviations
- Natural speech patterns only
- Never formal or robotic`

// ---- EDIT THIS SECTION EVERY FORTNIGHT ----
const TOPIC_PROMPT = `Current topic: Nightlife. Ask about their favourite things to do at night, where they go out, where they would take a visiting friend. Ask which night they prefer going out and what time venues should close. If not a night person, ask about mornings instead. Share that you love a good dinner then a bar in Bogota — you know the best chill spots.`
// ---- END OF EDITABLE SECTION ----

const SYSTEM_PROMPT = FIXED_PROMPT + '\n\n' + TOPIC_PROMPT

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return res.status(200).json({ content })
  } catch (error) {
    console.error('Claude API error:', error)
    return res.status(500).json({ error: 'Failed to get response' })
  }
}
