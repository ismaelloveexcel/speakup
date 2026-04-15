'use client'

import { useRef, useState, useCallback } from 'react'

interface RecorderProps {
  isEnabled: boolean
  onRecordingComplete?: (url: string) => void
}

export default function Recorder({ isEnabled, onRecordingComplete }: RecorderProps) {
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | undefined>()
  const [error, setError] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  /** Check if the browser supports audio recording */
  function isRecordingSupported(): boolean {
    return typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
  }

  const startRecording = useCallback(async () => {
    setError('')

    if (!isRecordingSupported()) {
      setError('Recording is not supported in this browser. Try using Chrome or Safari on HTTPS.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const mr = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setRecordingUrl(url)
        onRecordingComplete?.(url)
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.onerror = () => {
        setError('Recording stopped unexpectedly. Your session will still be saved.')
        setRecording(false)
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch (err) {
      console.error('[SpeakUp] Microphone access failed:', err)
      setError('Microphone not available. You can still complete the session without audio.')
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
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
            className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 active:scale-95 transition-transform"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 rounded-xl bg-gray-800 py-3 font-bold text-white hover:bg-gray-900 active:scale-95 transition-transform"
          >
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" />
            Stop Recording
          </button>
        )}
      </div>

      {recordingUrl && !recording && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-gray-500">Listen back:</p>
          <audio controls src={recordingUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
