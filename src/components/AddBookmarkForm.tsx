'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark } from '@/types'
import { Loader2, X } from 'lucide-react'

type Props = {
  userId: string
  onAdded: (bookmark: Bookmark) => void
  onCancel: () => void
}

export default function AddBookmarkForm({ userId, onAdded, onCancel }: Props) {
  const supabase = createClient()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  const fetchMetadata = async () => {
    if (!url) return
    setFetching(true)
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (data.title) setTitle(data.title)
    } catch {}
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !title) return
    setLoading(true)
    setError('')

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    let faviconUrl = null
    try {
      const domain = new URL(url).hostname
      faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {}

    const { data, error: err } = await supabase
      .from('bookmarks')
      .insert({ url, title, tags: tagArray, favicon_url: faviconUrl, user_id: userId })
      .select()
      .single()

    if (err) {
      setError('저장 중 오류가 발생했습니다.')
    } else if (data) {
      onAdded(data)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">북마크 추가</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onBlur={fetchMetadata}
            placeholder="https://example.com"
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">제목</label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="페이지 제목"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {fetching && (
            <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">태그 (쉼표로 구분)</label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="디자인, 개발, 참고자료"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}
