import { NextResponse } from 'next/server'
import { directusServer as directus } from '@/lib/directus-server'
import { readItems } from '@directus/sdk'

export async function GET() {
  const items = await directus.request(
    readItems('device_categories' as any, {
      fields: ['id', 'name', 'slug'],
      sort: ['sort_order' as any],
    })
  ) as { id: string; name: string; slug: string }[]

  return NextResponse.json(items)
}
