import { glmChat } from './glm-client'
import type { MusicStyle, MusicMood } from '@/types'

interface LyricsInput {
  topic: string
  style: MusicStyle
  mood: MusicMood
  language: 'zh' | 'en'
  structure?: string
}

export async function generateLyrics(input: LyricsInput): Promise<string> {
  const lang = input.language === 'zh' ? 'Chinese' : 'English'
  const structure = input.structure || 'verse-chorus-verse-chorus-bridge-chorus'

  const systemPrompt = `You are a professional songwriter. Write lyrics in ${lang}.
Style: ${input.style}
Mood: ${input.mood}
Structure: ${structure}

Rules:
- Write ONLY the lyrics, no explanations
- Mark sections clearly: [Verse 1], [Chorus], [Bridge] etc.
- Use rhyming and rhythm appropriate for the style
- Lyrics should feel natural when sung
- Total length: 2-3 verses, choruses between`

  const userPrompt = `Write lyrics about: ${input.topic}`

  return glmChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], { temperature: 0.9, maxTokens: 2048 })
}

export async function improveLyrics(
  lyrics: string,
  feedback: string,
  language: 'zh' | 'en'
): Promise<string> {
  const lang = language === 'zh' ? 'Chinese' : 'English'
  const systemPrompt = `You are a professional songwriter. Improve the given ${lang} lyrics based on feedback.
Rules:
- Keep the same structure
- Apply the requested improvements
- Output ONLY the improved lyrics with section markers`

  return glmChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Original lyrics:\n${lyrics}\n\nFeedback: ${feedback}\n\nImproved lyrics:` },
  ], { temperature: 0.7, maxTokens: 2048 })
}
