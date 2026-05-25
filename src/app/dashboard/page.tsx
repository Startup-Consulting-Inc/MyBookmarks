import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: bookmarks }, { data: collections }] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return (
    <DashboardClient
      user={user}
      initialBookmarks={bookmarks ?? []}
      initialCollections={collections ?? []}
    />
  )
}
