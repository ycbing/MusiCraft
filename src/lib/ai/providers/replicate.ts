import type { MusicProvider, MusicGenerationInput, MusicGenerationResult } from '../music-base'
import { buildMusicPrompt } from '../music-base'

const REPLICATE_API = 'https://api.replicate.com/v1'

// Meta MusicGen model on Replicate
const MUSICGEN_VERSION = '671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb'

export class ReplicateProvider implements MusicProvider {
  name = 'replicate'

  async generate(input: MusicGenerationInput): Promise<MusicGenerationResult> {
    const apiKey = process.env.REPLICATE_API_KEY
    if (!apiKey) throw new Error('REPLICATE_API_KEY not set')

    const prompt = buildMusicPrompt(input)

    // Start generation
    const createRes = await fetch(`${REPLICATE_API}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: MUSICGEN_VERSION,
        input: {
          prompt,
          duration: input.duration || 15,
          model_version: 'melody',
          output_format: 'mp3',
        },
      }),
    })

    if (!createRes.ok) {
      const err = await createRes.text()
      throw new Error(`Replicate create error: ${createRes.status} ${err}`)
    }

    const prediction = await createRes.json()
    const predictionId = prediction.id

    // Poll for completion
    const maxPolls = 60
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 3000))

      const pollRes = await fetch(`${REPLICATE_API}/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      })

      if (!pollRes.ok) continue

      const pollData = await pollRes.json()

      if (pollData.status === 'succeeded' && pollData.output) {
        const audioUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output
        return {
          audioUrl: String(audioUrl),
          duration: input.duration || 15,
        }
      }

      if (pollData.status === 'failed') {
        throw new Error(`Replicate generation failed: ${pollData.error || 'unknown error'}`)
      }
    }

    throw new Error('Replicate generation timed out')
  }
}
