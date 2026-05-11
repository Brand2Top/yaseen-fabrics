import type {
  ApiCategory,
  ApiListResponse,
  ApiPaginatedResponse,
  ApiProduct,
  ApiProductDetail,
  ProductFilters,
  ReviewBody,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.aleenza.store'
const TENANT = process.env.NEXT_PUBLIC_API_TENANT ?? 'yaseen'
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

function buildHeaders(withAuth = false): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Tenant': TENANT,
  }
  if (withAuth && TOKEN) h.Authorization = `Bearer ${TOKEN}`
  return h
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ApiPaginatedResponse<ApiProduct>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/products?${params}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`)
  return res.json()
}

export async function getProduct(
  idOrSlug: string | number
): Promise<ApiProductDetail> {
  const res = await fetch(`${BASE_URL}/api/products/${idOrSlug}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Product fetch failed: ${res.status}`)
  return res.json()
}

export async function getCategories(
  featuredOnly = false
): Promise<ApiListResponse<ApiCategory>> {
  const url = `${BASE_URL}/api/categories${featuredOnly ? '?is_featured=1' : ''}`
  const res = await fetch(url, { headers: buildHeaders(), cache: 'no-store' })
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`)
  return res.json()
}

export async function postReview(
  productId: number,
  body: ReviewBody
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Review submit failed: ${res.status}`)
  return res.json()
}
