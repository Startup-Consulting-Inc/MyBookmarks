'use client'

import { useState } from 'react'
import { Bookmark, Collection } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Trash2, ExternalLink, Tag, FolderPlus } from 'lucide-react'

type Props = {
  bookmarks: Bookmark[]
  collections: Collection[]
  onDelete: (id: string) => void
}

export default function BookmarkList({ bookmarks, collections, onDelete }: Props) {
  const supabase = createClient()
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)))
  const filtered = filterTag ? bookmarks.filter(b => b.tags.includes(filterTag)) : bookmarks

  const handleDelete = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
    onDelete(id)
  }

  const handleAddToCollection = async (bookmarkId: string, collectionId: string) => {
    await supabase.from('collection_bookmarks').upsert({ collection_id: collectionId, bookmark_id: bookmarkId })
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">아직 북마크가 없어요.</p>
        <p className="text-xs mt-1">위의 추가 버튼으로 첫 번째 북마크를 저장해보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterTag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Bookmark cards */}
      {filtered.map(bookmark => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          collections={collections}
          onDelete={handleDelete}
          onAddToCollection={handleAddToCollection}
        />
      ))}
    </div>
  )
}

function BookmarkCard({
  bookmark,
  collections,
  onDelete,
  onAddToCollection,
}: {
  bookmark: Bookmark
  collections: Collection[]
  onDelete: (id: string) => void
  onAddToCollection: (bookmarkId: string, collectionId: string) => void
}) {
  const [showCollectionMenu, setShowCollectionMenu] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
      {bookmark.favicon_url && (
        <img src={bookmark.favicon_url} alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-900 hover:text-blue-600 text-sm leading-snug flex items-center gap-1 group"
        >
          <span className="truncate">{bookmark.title}</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
        </a>
        <p className="text-xs text-gray-400 truncate mt-0.5">{bookmark.url}</p>
        {bookmark.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {bookmark.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {collections.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowCollectionMenu(v => !v)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="컬렉션에 추가"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            {showCollectionMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px] py-1">
                <p className="px-3 py-1.5 text-xs text-gray-400 font-medium">컬렉션에 추가</p>
                {collections.map(col => (
                  <button
                    key={col.id}
                    onClick={() => {
                      onAddToCollection(bookmark.id, col.id)
                      setShowCollectionMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => onDelete(bookmark.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
