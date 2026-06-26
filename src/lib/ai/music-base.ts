import type { MusicStyle, MusicMood } from '@/types'

export interface MusicGenerationInput {
  lyrics: string
  style: MusicStyle
  mood: MusicMood
  language: 'zh' | 'en'
  title?: string
  duration?: number // seconds
}

export interface MusicGenerationResult {
  audioUrl: string
  duration: number
}

export interface MusicProvider {
  name: string
  generate(input: MusicGenerationInput): Promise<MusicGenerationResult>
}

// Build a prompt suitable for music generation models
export function buildMusicPrompt(input: MusicGenerationInput): string {
  const langHint = input.language === 'zh' ? 'Chinese song, Mandarin vocals' : 'English song'
  const styleDesc: Record<string, string> = {
    pop: 'catchy pop melody',
    rock: 'energetic rock with guitar',
    rap: 'rap with hip-hop beat',
    rnb: 'smooth R&B vocals',
    electronic: 'electronic synth-based',
    classical: 'orchestral classical',
    jazz: 'smooth jazz with saxophone',
    folk: 'acoustic folk song',
    hiphop: 'hip-hop with beats',
    country: 'country with acoustic guitar',
    lofi: 'lo-fi chill beats',
    acoustic: 'stripped acoustic',
    ambient: 'ambient atmospheric',
  }
  const moodDesc: Record<string, string> = {
    happy: 'upbeat and joyful',
    sad: 'melancholic and emotional',
    energetic: 'high energy and dynamic',
    calm: 'calm and relaxing',
    romantic: 'romantic and tender',
    melancholy: 'bittersweet and nostalgic',
    uplifting: 'inspiring and hopeful',
    dark: 'dark and mysterious',
    dreamy: 'dreamy and ethereal',
    dramatic: 'dramatic and intense',
    peaceful: 'peaceful and serene',
  }

  return `${langHint}, ${styleDesc[input.style] || 'pop'} style, ${moodDesc[input.mood] || 'happy'} mood. ${input.title ? `Title: ${input.title}. ` : ''}Lyrics: ${input.lyrics}`
}
