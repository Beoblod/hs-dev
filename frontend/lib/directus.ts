import { createDirectus, rest, staticToken } from '@directus/sdk'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!

export const directus = createDirectus(DIRECTUS_URL).with(rest())
