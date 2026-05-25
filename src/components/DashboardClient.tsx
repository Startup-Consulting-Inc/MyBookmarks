'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Bookmark, Collection } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BookmarkList from './BookmarkList'
import AddBookmarkForm from './AddBookmarkForm'
import CollectionPanel from './CollectionPanel'
import { LogOut, Bookmark as BookmarkIcon, FolderOpen, Plus } from 'lucide-react'

type Props = {
  user: User
  initialBookmarks: Bookmark[]
  initialCollections: Collection[]
}

export default function DashboardClient({ user, initialBookmarks, initialCollections }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [collections, setCollections] = useState(initialCollections)
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'collections'>('bookmarks')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const handleBookmarkAdded = (bookmark: Bookmark) => {
    setBookmarks(prev => [bookmark, ...prev])
    setShowAddForm(false)
  }

  const handleBookmarkDeleted = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  const handleCollectionAdded = (collection: Collection) => {
    setCollections(prev => [collection, ...prev])
  }

  const handleCollectionDeleted = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  const handleCollectionUpdated = (updated: Collection) => {
    setCollections(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Bookmarks</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'bookmarks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookmarkIcon className="w-4 h-4" />
              북마크 ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'collections'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              컬렉션 ({collections.length})
            </button>
          </div>
          {activeTab === 'bookmarks' && (
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
          )}
        </div>

        {/* Add Bookmark Form */}
        {showAddForm && activeTab === 'bookmarks' && (
          <AddBookmarkForm
            userId={user.id}
            onAdded={handleBookmarkAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Content */}
        {activeTab === 'bookmarks' ? (
          <BookmarkList
            bookmarks={bookmarks}
            collections={collections}
            onDelete={handleBookmarkDeleted}
          />
        ) : (
          <CollectionPanel
            collections={collections}
            bookmarks={bookmarks}
            userId={user.id}
            onAdded={handleCollectionAdded}
            onDeleted={handleCollectionDeleted}
            onUpdated={handleCollectionUpdated}
          />
        )}
      </main>
    </div>
  )
}
