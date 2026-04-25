import { NextResponse } from 'next/server'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'

export async function GET() {
  const items = await directus.request(
    readItems('reviews' as any, {
      filter: { is_active: { _eq: true } },
      fields: ['id', 'author_name', 'rating', 'text', 'source', 'device_type'],
      sort: ['sort_order' as any],
      limit: 50,
    })
  ) as { id: number; author_name: string; rating: number; text: string; source: string | null; device_type: string | null }[]

  return NextResponse.json(items)
}
