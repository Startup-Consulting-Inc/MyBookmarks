export type Bookmark = {
  id: string
  user_id: string
  url: string
  title: string
  description: string | null
  favicon_url: string | null
  tags: string[]
  created_at: string
}

export type Collection = {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  slug: string
  created_at: string
}

export type CollectionBookmark = {
  collection_id: string
  bookmark_id: string
}

export type BookmarkWithCollections = Bookmark & {
  collections?: Collection[]
}
