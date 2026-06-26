export interface Song {
  id: string
  title: string
  lyrics: string
  style: string
  mood: string
  language: 'zh' | 'en'
  audioUrl: string | null
  coverUrl: string | null
  duration: number | null
  status: 'draft' | 'generating' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  credits: number
}

export type MusicStyle =
  | 'pop' | 'rock' | 'rap' | 'rnb'
  | 'electronic' | 'classical' | 'jazz'
  | 'folk' | 'hiphop' | 'country'
  | 'lofi' | 'acoustic' | 'ambient'

export type MusicMood =
  | 'happy' | 'sad' | 'energetic' | 'calm'
  | 'romantic' | 'melancholy' | 'uplifting'
  | 'dark' | 'dreamy' | 'dramatic' | 'peaceful'
