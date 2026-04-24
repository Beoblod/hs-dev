import { createDirectus, rest, staticToken } from '@directus/sdk'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!
const SERVICE_TOKEN = process.env.DIRECTUS_SERVICE_TOKEN!

export const directusServer = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(staticToken(SERVICE_TOKEN))
