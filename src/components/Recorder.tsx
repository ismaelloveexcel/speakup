'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface RecorderProps {
  isEnabled: boolean
  onRecordingComplete?: (url: string) => void
}

export default function Recorder({ isEnabled, onRecordingComplete }: RecorderProps) {
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | undefined>()
  const [error, setError] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  /** Check if the browser supports audio recording */
  function isRecordingSupported(): boolean {
    return typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
  }

  /** Get a supported MIME type for this browser */
  function getSupportedMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') return undefined
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav']
    for (const type of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(type)) return type
      } catch {
        // isTypeSupported can throw on some browsers
      }
    }
    return undefined // let browser pick default
  }

  // Cleanup on unmount — stop any active recording and release mic
  useEffect(() => {
    return () => {
      try {
        if (mediaRef.current && mediaRef.current.state !== 'inactive') {
          mediaRef.current.stop()
        }
      } catch { /* ignore */ }
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop())
      } catch { /* ignore */ }
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError('')

    if (!isRecordingSupported()) {
      setError('Recording is not supported in this browser. Try using Chrome or Safari on HTTPS.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}

      let mr: MediaRecorder
      try {
        mr = new MediaRecorder(stream, options)
      } catch {
        // Fallback: construct without options
        mr = new MediaRecorder(stream)
      }

      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      mr.onstop = () => {
        try {
          const actualType = mimeType || 'audio/webm'
          const blob = new Blob(chunksRef.current, { type: actualType })
          const url = URL.createObjectURL(blob)
          setRecordingUrl(url)
          onRecordingComplete?.(url)
        } catch (e) {
          console.error('[SpeakUp] Failed to create recording blob:', e)
        }
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      mr.onerror = () => {
        setError('Recording stopped unexpectedly. Your session will still be saved.')
        setRecording(false)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch (err: unknown) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Microphone access was denied. Please allow microphone access in your browser settings.'
        : 'Microphone not available. You can still complete the session without audio.'
      console.error('[SpeakUp] Microphone access failed:', err)
      setError(msg)
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    try {
      if (mediaRef.current && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop()
      }
    } catch (e) {
      console.error('[SpeakUp] Stop recording failed:', e)
    }
    setRecording(false)
  }, [])

  if (!isEnabled) return null

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">🎙 Voice Recorder</p>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 active:scale-95 transition-transform min-h-[48px]"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 rounded-xl bg-gray-800 py-3 font-bold text-white hover:bg-gray-900 active:scale-95 transition-transform min-h-[48px]"
          >
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" />
            Stop Recording
          </button>
        )}
      </div>

      {recordingUrl && !recording && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-gray-500">Listen back:</p>
          <audio controls src={recordingUrl} className="w-full" preload="metadata" />
        </div>
      )}
    </div>
  )
}
