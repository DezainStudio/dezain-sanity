import React, {useState} from 'react'
import type {DocumentActionComponent} from 'sanity'
import {ACTIVE_LOCALES} from '../schemaTypes/i18n'

const API_URL = process.env.SANITY_STUDIO_TRANSLATE_API_URL
console.log('translate env debug', {
  API_URL,
  raw: process.env.SANITY_STUDIO_TRANSLATE_API_URL,
})

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

  if (!currentLocale) return null

  return {
    label: 'Translate',
    title: canOpen
      ? canRun
        ? 'Translate this document to another locale'
        : 'Disabled fetch will fail: set SANITY_STUDIO_TRANSLATE_API_URL in Studio env'
      : 'Save the document and ensure at least one target locale exists',
    disabled: !canOpen,
    onHandle: () => setIsOpen(true),
    dialog: isOpen
      ? {
          type: 'dialog',
          header: 'Translate',
          onClose: props.onComplete,
          content: (
            <div style={{display: 'grid', gap: 12, padding: 16, minWidth: 320}}>
              <label>
                <div>Target locale</div>
                <select value={target} onChange={(e) => setTarget(e.target.value)}>
                  {availableTargets.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <div>Mode</div>
                <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
                  <option value="reviewGate">reviewGate</option>
                  <option value="instant">instant</option>
                  <option value="silentPrepare">silentPrepare</option>
                </select>
              </label>
              {error ? <div style={{color: 'red'}}>{error}</div> : null}
              <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                <button onClick={props.onComplete} disabled={loading}>
                  Close
                </button>
                <button
                  onClick={async () => {
                    setLoading(true)
                    setError(null)
                    try {
                      if (!API_URL) {
                        throw new Error('SANITY_STUDIO_TRANSLATE_API_URL is not set in Studio env')
                      }
                      const res = await fetch(String(API_URL), {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({sourceId: id, targetLocale: target, mode}),
                      })
                      if (!res.ok) {
                        const text = await res.text().catch(() => '')
                        throw new Error(text || `HTTP ${res.status}`)
                      }
                      props.onComplete()
                    } catch (e: any) {
                      setError(e?.message || 'Failed')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Translating…' : 'Translate'}
                </button>
              </div>
            </div>
          ),
        }
      : undefined,
  }
}
