import React, {useEffect, useState} from 'react'
import type {DocumentActionComponent} from 'sanity'
import {useClient} from 'sanity'
import {ACTIVE_LOCALES} from '../schemaTypes/i18n'

export const openSiblingsAction: DocumentActionComponent = (props) => {
  const doc: any = props.draft || props.published
  const translationKey: string | undefined = doc?.translationKey
  const type: string | undefined = (props as any)?.type || doc?._type
  const client = useClient({ apiVersion: '2024-05-01' })

  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState<Array<{_id: string; locale: string; title?: string; slug?: {current?: string}}> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return {
    label: 'Open siblings',
    title: 'View and open localized siblings by locale',
    disabled: !type,
    onHandle: async () => {
      setIsOpen(true)
      setLoading(true)
      setError(null)
      setRows(null)
      try {
        let tk = translationKey
        if (!tk) {
          const gen = (globalThis as any)?.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
          const baseId = String((props.id || doc?._id || '')).replace(/^drafts\./, '')
          try { await client.patch(baseId).set({ translationKey: gen }).commit() } catch {}
          try { await client.patch(`drafts.${baseId}`).set({ translationKey: gen }).commit() } catch {}
          tk = gen
        }
        const q = `*[_type == $type && translationKey == $tk]{ _id, locale, 'title': coalesce(title, name, hero.title), slug }`
        const res = await client.fetch(q, { type, tk })
        setRows(res)
      } catch (e: any) {
        setError(e?.message || 'Failed to load siblings')
      } finally {
        setLoading(false)
      }
    },
    dialog:
      isOpen
        ? {
            type: 'dialog',
            header: 'Open siblings',
            onClose: props.onComplete,
            content: (
              <div style={{ display: 'grid', gap: 8, padding: 16, minWidth: 360 }}>
                {loading ? <div>Loading…</div> : null}
                {error ? <div style={{ color: 'red' }}>{error}</div> : null}
                {rows ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Locale</th>
                        <th style={{ textAlign: 'left' }}>Title</th>
                        <th style={{ textAlign: 'left' }}>Slug</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ACTIVE_LOCALES.map((l) => {
                        const doc = rows.find((r) => r.locale === l)
                        return (
                          <tr key={l}>
                            <td>{l.toUpperCase()}</td>
                            <td>{doc?.title || '—'}</td>
                            <td>{doc?.slug?.current || '—'}</td>
                            <td>
                              {doc ? (
                                <a
                                  href={`/?intent=edit&id=${encodeURIComponent(doc._id)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open
                                </a>
                              ) : (
                                <span style={{ opacity: 0.6 }}>Missing</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={props.onComplete}>Close</button>
                </div>
              </div>
            ),
          }
        : undefined,
  }
}
