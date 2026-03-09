import React, {useState, useEffect, useRef, useCallback} from 'react'
import type {DocumentActionComponent} from 'sanity'
import {ACTIVE_LOCALES} from '../schemaTypes/i18n'

const API_URL = process.env.SANITY_STUDIO_TRANSLATE_API_URL

interface ProgressEvent {
  step: 'fetching' | 'preparing' | 'translating' | 'saving' | 'done' | 'error'
  progress: number
  message: string
  result?: any
}

function ElapsedTimer({running}: {running: boolean}) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now()
    setElapsed(0)
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  if (!running && elapsed === 0) return null

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const display = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <span style={{fontSize: 12, color: '#666', fontVariantNumeric: 'tabular-nums'}}>{display}</span>
  )
}

function ProgressBar({progress, status}: {progress: number; status: string}) {
  const isError = status === 'error'
  const isDone = status === 'done'

  return (
    <div style={{width: '100%'}}>
      <div
        style={{
          width: '100%',
          height: 6,
          backgroundColor: '#e5e5e5',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: isError ? '#e53e3e' : isDone ? '#38a169' : '#3182ce',
            borderRadius: 3,
            transition: 'width 0.5s ease, background-color 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}

export const translateAction: DocumentActionComponent = (props) => {
  const doc: any = props.draft || props.published
  const currentLocale: string | undefined = doc?.locale
  const id = String(props.id || doc?._id || '').replace(/^drafts\./, '')
  const availableTargets = (ACTIVE_LOCALES as readonly string[]).filter((l) => l !== currentLocale)
  const canOpen = Boolean(id && currentLocale && availableTargets.length > 0)
  const canRun = Boolean(API_URL)

  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<string>(availableTargets[0])
  const [mode, setMode] = useState<'reviewGate' | 'instant' | 'silentPrepare'>('reviewGate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressEvent | null>(null)

  const handleTranslate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setProgress({step: 'fetching', progress: 2, message: 'Connecting...'})

    try {
      if (!API_URL) {
        throw new Error('SANITY_STUDIO_TRANSLATE_API_URL is not set in Studio env')
      }

      const res = await fetch(String(API_URL), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sourceId: id, targetLocale: target, mode}),
      })

      if (!res.ok && !res.body) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const {done, value} = await reader.read()
        if (done) break

        buffer += decoder.decode(value, {stream: true})
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const trimmed = part.trim()
          if (!trimmed.startsWith('data: ')) continue
          try {
            const data: ProgressEvent = JSON.parse(trimmed.slice(6))
            setProgress(data)

            if (data.step === 'error') {
              setError(data.message)
              setLoading(false)
              return
            }
            if (data.step === 'done') {
              setLoading(false)
              // Auto-close after a brief delay so the user sees "done"
              setTimeout(() => props.onComplete(), 2000)
              return
            }
          } catch {
            // Ignore malformed SSE events
          }
        }
      }

      // If we get here without a done/error event, treat as success
      if (!progress || progress.step !== 'done') {
        setLoading(false)
        props.onComplete()
      }
    } catch (e: any) {
      setError(e?.message || 'Failed')
      setProgress((prev) => (prev ? {...prev, step: 'error', progress: 0} : null))
    } finally {
      setLoading(false)
    }
  }, [id, target, mode, props])

  if (!currentLocale) return null

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: 14,
    backgroundColor: '#fff',
  }

  const btnBase: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 4,
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  }

  return {
    label: 'Translate',
    title: canOpen
      ? canRun
        ? 'Translate this document to another locale'
        : 'Disabled: set SANITY_STUDIO_TRANSLATE_API_URL in Studio env'
      : 'Save the document and ensure at least one target locale exists',
    disabled: !canOpen,
    onHandle: () => {
      setIsOpen(true)
      setProgress(null)
      setError(null)
    },
    dialog: isOpen
      ? {
          type: 'dialog' as const,
          header: 'Translate Document',
          onClose: () => {
            if (!loading) props.onComplete()
          },
          content: (
            <div style={{display: 'grid', gap: 16, padding: 16, minWidth: 360}}>
              {/* Controls — hidden while translating */}
              {!loading && !progress?.step?.match(/done/) ? (
                <>
                  <label>
                    <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>
                      Target locale
                    </div>
                    <select
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      style={selectStyle}
                    >
                      {availableTargets.map((l) => (
                        <option key={l} value={l}>
                          {l.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Mode</div>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      style={selectStyle}
                    >
                      <option value="reviewGate">Review Gate (draft)</option>
                      <option value="instant">Instant (publish)</option>
                      <option value="silentPrepare">Silent Prepare (draft)</option>
                    </select>
                  </label>
                </>
              ) : null}

              {/* Progress indicator */}
              {progress ? (
                <div style={{display: 'grid', gap: 8}}>
                  <ProgressBar progress={progress.progress} status={progress.step} />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color:
                          progress.step === 'error'
                            ? '#e53e3e'
                            : progress.step === 'done'
                              ? '#38a169'
                              : '#555',
                        fontWeight: progress.step === 'done' ? 600 : 400,
                      }}
                    >
                      {progress.message}
                    </span>
                    <ElapsedTimer running={loading} />
                  </div>
                </div>
              ) : null}

              {/* Error display */}
              {error && !progress ? (
                <div
                  style={{
                    color: '#e53e3e',
                    fontSize: 13,
                    padding: '8px 12px',
                    backgroundColor: '#fff5f5',
                    borderRadius: 4,
                    border: '1px solid #fed7d7',
                  }}
                >
                  {error}
                </div>
              ) : null}

              {/* Actions */}
              <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                {progress?.step === 'done' ? (
                  <button
                    onClick={props.onComplete}
                    style={{...btnBase, backgroundColor: '#38a169', color: '#fff'}}
                  >
                    Done
                  </button>
                ) : (
                  <>
                    <button
                      onClick={props.onComplete}
                      disabled={loading}
                      style={{
                        ...btnBase,
                        backgroundColor: '#eee',
                        color: loading ? '#999' : '#333',
                      }}
                    >
                      {loading ? 'Cancel' : 'Close'}
                    </button>
                    {!loading ? (
                      <button
                        onClick={handleTranslate}
                        disabled={loading}
                        style={{...btnBase, backgroundColor: '#2563eb', color: '#fff'}}
                      >
                        Translate
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          ),
        }
      : undefined,
  }
}
