'use client'

import { useState } from 'react'
import { Collection, Bookmark } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Plus, Globe, Lock, Copy, Check, Trash2, Loader2 } from 'lucide-react'

type Props = {
  collections: Collection[]
  bookmarks: Bookmark[]
  userId: string
  onAdded: (collection: Collection) => void
  onDeleted: (id: string) => void
  onUpdated: (collection: Collection) => void
}

export default function CollectionPanel({ collections, userId, onAdded, onDeleted, onUpdated }: Props) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setLoading(true)

    const slug = `${name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-')}-${Math.random().toString(36).slice(2, 7)}`

    const { data, error } = await supabase
      .from('collections')
      .insert({ name, description, slug, is_public: false, user_id: userId })
      .select()
      .single()

    if (!error && data) {
      onAdded(data)
      setName('')
      setDescription('')
      setShowForm(false)
    }
    setLoading(false)
  }

  const handleTogglePublic = async (collection: Collection) => {
    const { data } = await supabase
      .from('collections')
      .update({ is_public: !collection.is_public })
      .eq('id', collection.id)
      .select()
      .single()
    if (data) onUpdated(data)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('collections').delete().eq('id', id)
    onDeleted(id)
  }

  return (
    <div className="space-y-4">
      {/* Create button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          새 컬렉션 만들기
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm">새 컬렉션</h3>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="컬렉션 이름"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              만들기
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* Collection list */}
      {collections.length === 0 && !showForm ? null : (
        <div className="space-y-3">
          {collections.map(col => (
            <CollectionCard
              key={col.id}
              collection={col}
              onTogglePublic={handleTogglePublic}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {collections.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">아직 컬렉션이 없어요.</p>
          <p className="text-xs mt-1">북마크를 묶어서 공유 링크를 만들 수 있어요.</p>
        </div>
      )}
    </div>
  )
}

function CollectionCard({
  collection,
  onTogglePublic,
  onDelete,
}: {
  collection: Collection
  onTogglePublic: (c: Collection) => void
  onDelete: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${collection.slug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{collection.name}</h4>
          {collection.description && (
            <p className="text-xs text-gray-400 mt-0.5">{collection.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(collection.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Public toggle */}
        <button
          onClick={() => onTogglePublic(collection)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            collection.is_public
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {collection.is_public ? (
            <><Globe className="w-3.5 h-3.5" /> 공개</>
          ) : (
            <><Lock className="w-3.5 h-3.5" /> 비공개</>
          )}
        </button>

        {/* Copy link */}
        {collection.is_public && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /> 복사됨!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> 링크 복사</>
            )}
          </button>
        )}
      </div>

      {collection.is_public && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 font-mono truncate">
          {shareUrl}
        </p>
      )}
    </div>
  )
}
