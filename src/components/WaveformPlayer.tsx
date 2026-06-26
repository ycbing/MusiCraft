'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface WaveformPlayerProps {
  src: string
  title?: string
  duration?: number | null
}

export function WaveformPlayer({ src, title, duration: propDuration }: WaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const rafRef = useRef<number>(0)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(propDuration || 0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)

  const BAR_COUNT = 48
  const BAR_GAP = 3

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Initialize audio context and analyser
  const initAudio = useCallback(() => {
    if (!audioRef.current || audioCtxRef.current) return

    try {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
    } catch {
      // Audio context not available yet, will retry on play
    }
  }, [])

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
      return
    }

    try {
      // Initialize audio context on user gesture
      if (!audioCtxRef.current) {
        const ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256

        const source = ctx.createMediaElementSource(audioRef.current)
        source.connect(analyser)
        analyser.connect(ctx.destination)

        audioCtxRef.current = ctx
        analyserRef.current = analyser
        sourceRef.current = source
      }

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume()
      }

      await audioRef.current.play()
      setPlaying(true)
    } catch (err) {
      console.error('Play failed:', err)
    }
  }, [playing])

  // Draw waveform
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) {
      rafRef.current = requestAnimationFrame(draw)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    ctx.clearRect(0, 0, W, H)

    const barWidth = (W - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT

    for (let i = 0; i < BAR_COUNT; i++) {
      // Map frequency bins to our bar count
      const binIndex = Math.floor((i / BAR_COUNT) * dataArray.length)
      const value = dataArray[binIndex] || 0
      const percent = value / 255
      const barHeight = Math.max(4, percent * H * 0.85)

      const x = i * (barWidth + BAR_GAP)
      const y = H - barHeight

      // Gradient from purple to blue based on frequency
      const hue = 260 + percent * 100 // 260 (purple) to 360 (blue)
      ctx.fillStyle = `hsl(${hue}, 80%, ${50 + percent * 30}%)`
      // Draw rounded rect manually
      const r = 2
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barWidth - r, y)
      ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.lineTo(x, y + barHeight)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
      ctx.fill()

      // Glow effect on taller bars
      if (percent > 0.5) {
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${Math.min(0.3, percent - 0.2)})`
        ctx.beginPath()
        ctx.moveTo(x - 1 + r, y - 2)
        ctx.lineTo(x + barWidth + 1 - r, y - 2)
        ctx.arcTo(x + barWidth + 1, y - 2, x + barWidth + 1, y + r, r)
        ctx.lineTo(x + barWidth + 1, y + barHeight + 2)
        ctx.lineTo(x - 1, y + barHeight + 2)
        ctx.lineTo(x - 1, y - 2 + r)
        ctx.arcTo(x - 1, y - 2, x + r, y - 2, r)
        ctx.closePath()
        ctx.fill()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => {
      setDuration(audio.duration || propDuration || 0)
      setLoaded(true)
      setLoading(false)
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }

    const onCanPlay = () => {
      setLoading(false)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('canplay', onCanPlay)

    // If audio is already loaded
    if (audio.readyState >= 2) {
      setDuration(audio.duration || propDuration || 0)
      setLoaded(true)
      setLoading(false)
    }

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [propDuration])

  // Start/stop animation loop
  useEffect(() => {
    if (playing) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      // Draw static bars when not playing
      draw()
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, draw])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
    if (muted) setMuted(false)
  }

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div className="w-full">
      <audio ref={audioRef} src={src} preload="auto" crossOrigin="anonymous" />

      {/* Waveform Canvas */}
      <div className="relative h-24 mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-xl"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-400 rounded-full animate-bounce"
                  style={{
                    height: '12px',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-r
            [&::-webkit-slider-thumb]:from-purple-500
            [&::-webkit-slider-thumb]:to-blue-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-purple-500/40
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-purple-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(168,85,247) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%)`,
          }}
        />
        {/* Time display */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 font-mono">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-500 font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={!loaded}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center
              hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/25
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {playing ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            )}
          </button>

          {/* Title */}
          {title && (
            <span className="text-sm font-medium text-gray-300 truncate max-w-[140px] sm:max-w-[200px]">
              {title}
            </span>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 appearance-none bg-white/10 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
