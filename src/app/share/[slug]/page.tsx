import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExternalLink, Tag, Bookmark as BookmarkIcon } from 'lucide-react'

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!collection) notFound()

  const { data: collectionBookmarks } = await supabase
    .from('collection_bookmarks')
    .select('bookmark_id')
    .eq('collection_id', collection.id)

  const bookmarkIds = collectionBookmarks?.map(cb => cb.bookmark_id) ?? []

  const { data: bookmarks } = bookmarkIds.length > 0
    ? await supabase.from('bookmarks').select('*').in('id', bookmarkIds).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl">
              <BookmarkIcon className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
          {collection.description && (
            <p className="text-gray-500 text-sm">{collection.description}</p>
          )}
          <p className="text-xs text-gray-400">{bookmarks?.length ?? 0}개의 북마크</p>
        </div>

        {/* Bookmarks */}
        {!bookmarks || bookmarks.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
            <p className="text-sm">이 컬렉션에 북마크가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3">
                  {bookmark.favicon_url && (
                    <img src={bookmark.favicon_url} alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                        {bookmark.title}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{bookmark.url}</p>
                    {bookmark.tags?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {bookmark.tags.map((tag: string) => (
                          <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">Bookmarks로 만든 공유 페이지</p>
      </div>
    </div>
  )
}
