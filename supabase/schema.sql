-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Bookmarks table
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null,
  description text,
  favicon_url text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Collections table
create table collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Junction table
create table collection_bookmarks (
  collection_id uuid references collections(id) on delete cascade not null,
  bookmark_id uuid references bookmarks(id) on delete cascade not null,
  primary key (collection_id, bookmark_id)
);

-- Row Level Security
alter table bookmarks enable row level security;
alter table collections enable row level security;
alter table collection_bookmarks enable row level security;

-- Bookmark policies
create policy "Users can manage own bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id);

-- Collection policies
create policy "Users can manage own collections"
  on collections for all
  using (auth.uid() = user_id);

create policy "Anyone can view public collections"
  on collections for select
  using (is_public = true);

-- Collection bookmarks policies
create policy "Users can manage own collection bookmarks"
  on collection_bookmarks for all
  using (
    exists (
      select 1 from collections
      where collections.id = collection_id
      and collections.user_id = auth.uid()
    )
  );

create policy "Anyone can view bookmarks in public collections"
  on collection_bookmarks for select
  using (
    exists (
      select 1 from collections
      where collections.id = collection_id
      and collections.is_public = true
    )
  );

create policy "Users can view bookmarks in public collections"
  on bookmarks for select
  using (
    exists (
      select 1 from collection_bookmarks cb
      join collections c on c.id = cb.collection_id
      where cb.bookmark_id = bookmarks.id
      and c.is_public = true
    )
  );
