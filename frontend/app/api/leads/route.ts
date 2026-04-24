import { NextRequest, NextResponse } from 'next/server'
import { directusServer } from '@/lib/directus-server'
import { createItem } from '@directus/sdk'

const SERVICE_LABELS: Record<string, string> = {
  branch:      'Відділення',
  nova_poshta: 'Нова Пошта',
  courier:     "Кур'єр (Київ)",
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, phone, device_type, device_model, comment, service_option, confirm_no_call } =
    body as Record<string, string | boolean>

  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 422 })
  }

  try {
    await directusServer.request(
      createItem('leads' as any, {
        client_name:          name,
        client_phone:         phone,
        device_type:          device_type   || null,
        device_model:         device_model  || null,
        problem_description:  comment       || null,
        service_option:       service_option || 'branch',
        no_call:              Boolean(confirm_no_call),
        status:               'new',
        source_url:           req.headers.get('referer') ?? null,
      })
    )
  } catch (err) {
    console.error('Directus write error:', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  // Notify n8n (best-effort — failure doesn't affect the user)
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        device:   [device_type, device_model].filter(Boolean).join(' — ') || '—',
        service:  SERVICE_LABELS[service_option as string] ?? service_option,
        comment:  comment || null,
        no_call:  Boolean(confirm_no_call),
      }),
    }).catch(() => {/* silent */})
  }

  return NextResponse.json({ ok: true })
}
