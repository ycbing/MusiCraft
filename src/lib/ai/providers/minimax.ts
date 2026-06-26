import type { MusicProvider, MusicGenerationInput, MusicGenerationResult } from '../music-base'
import { buildMusicPrompt } from '../music-base'

const MINIMAX_API = 'https://api.minimaxi.com/v1/music_generation'

export class MiniMaxProvider implements MusicProvider {
  name = 'minimax'

  async generate(input: MusicGenerationInput): Promise<MusicGenerationResult> {
    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) throw new Error('MINIMAX_API_KEY not set')

    const prompt = buildMusicPrompt(input)
    const isFree = process.env.MUSIC_MODEL !== 'music-2.6'
    const model = isFree ? 'music-2.6-free' : 'music-2.6'

    // Build lyrics with structure tags if lyrics provided
    const lyrics = input.lyrics || undefined

    const body = {
      model,
      prompt,
      lyrics,
      output_format: 'url' as const,
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: 'mp3' as const,
      },
      lyrics_optimizer: !lyrics,
      is_instrumental: false,
    }

    const res = await fetch(MINIMAX_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok || data?.base_resp?.status_code !== 0) {
      const msg = data?.base_resp?.status_msg || JSON.stringify(data)
      throw new Error(`MiniMax error: ${res.status} ${msg}`)
    }

    const audioUrl = data?.data?.audio
    if (!audioUrl) {
      throw new Error('MiniMax: no audio in response')
    }

    const durationMs = data?.extra_info?.music_duration
    const duration = durationMs ? Math.round(durationMs / 1000) : 30

    return { audioUrl, duration }
  }
}
