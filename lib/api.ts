import { getAdminToken } from './auth'
import type {
  AdminCategoryFilters,
  AdminProductFilters,
  AdminReview,
  ApiCategory,
  ApiListResponse,
  ApiMedia,
  ApiPaginatedResponse,
  ApiPost,
  ApiPostDetail,
  ApiProduct,
  ApiProductDetail,
  ApiValidationError,
  AuthUser,
  ChangePasswordBody,
  CreateCategoryBody,
  CreatePostBody,
  CreateProductBody,
  LoginResponse,
  PostFilters,
  ProductFilters,
  ReviewBody,
  ReviewFilters,
  ReviewStatus,
  UpdateCategoryBody,
  UpdatePostBody,
  UpdateProductBody,
  CreateNoteBody,
  UpdateNoteBody,
  ProductNote,
  Enquiry,
  CreateEnquiryBody,
  EnquiryFilters,
  CheckoutBody,
  CheckoutResponse,
  CouponValidationResult,
  Order,
  OrderDetail,
  OrderStatusCounts,
  OrderFilters,
  OrderStatus,
  Promotion,
  CreatePromotionBody,
  PromotionFilters,
  ProductVariant,
  CreateVariantBody,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.aleenza.store'
const TENANT = process.env.NEXT_PUBLIC_API_TENANT ?? 'yaseen'
const ENV_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

function buildHeaders(withAuth = false): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Tenant': TENANT,
  }
  if (withAuth) {
    const token = getAdminToken() ?? ENV_TOKEN
    if (token) h.Authorization = `Bearer ${token}`
  }
  return h
}

// Omits Content-Type so browser sets multipart/form-data boundary automatically
function buildAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/json',
    'X-Tenant': TENANT,
  }
  const token = getAdminToken() ?? ENV_TOKEN
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

// Structured error thrown for 422 (field errors) and 429 (rate limit)
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 422) {
    const body = (await res.json()) as ApiValidationError
    throw Object.assign(new Error(body.message ?? 'Validation failed'), {
      errors: body.errors,
    })
  }
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '60', 10)
    throw Object.assign(new Error('Too many attempts. Please try again later.'), {
      retryAfter,
    })
  }
  if (res.status === 401) throw new Error('Unauthenticated.')
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Laravel wraps single resources in { data: ... } — unwrap for single-item endpoints
async function unwrapData<T>(res: Response): Promise<T> {
  const body = await handleResponse<{ data: T }>(res)
  return body.data
}

// ─── Public: Homepage ─────────────────────────────────────────────────────────

export async function getFeaturedCategories(): Promise<ApiListResponse<ApiCategory>> {
  const res = await fetch(`${BASE_URL}/api/categories/featured`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getFeaturedProducts(): Promise<ApiListResponse<ApiProduct>> {
  const res = await fetch(`${BASE_URL}/api/products/featured`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse(res)
}

// ─── Public: Categories ───────────────────────────────────────────────────────

export async function getCategories(
  featuredOnly = false
): Promise<ApiListResponse<ApiCategory>> {
  const url = `${BASE_URL}/api/categories${featuredOnly ? '?is_featured=1' : ''}`
  const res = await fetch(url, { headers: buildHeaders(), cache: 'no-store' })
  return handleResponse(res)
}

export async function getCategory(
  idOrSlug: string | number
): Promise<ApiCategory> {
  const res = await fetch(`${BASE_URL}/api/categories/${idOrSlug}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return unwrapData(res)
}

// ─── Public: Products ─────────────────────────────────────────────────────────

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
  return handleResponse(res)
}

export async function getProduct(
  idOrSlug: string | number
): Promise<ApiProductDetail> {
  const res = await fetch(`${BASE_URL}/api/products/${idOrSlug}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return unwrapData(res)
}

// ─── Public: Reviews ─────────────────────────────────────────────────────────

export async function postReview(
  productId: number,
  body: ReviewBody
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

// ─── Admin: Auth ──────────────────────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string,
  deviceName?: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      email,
      password,
      ...(deviceName && { device_name: deviceName }),
    }),
  })
  return handleResponse(res)
}

export async function getCurrentUser(): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/api/me`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function logout(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/logout`, {
    method: 'POST',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

export async function logoutAll(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/logout-all`, {
    method: 'POST',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

export async function changePassword(body: ChangePasswordBody): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/change-password`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

// ─── Admin: Products ─────────────────────────────────────────────────────────

export async function getAdminProducts(
  filters: AdminProductFilters = {}
): Promise<ApiPaginatedResponse<ApiProduct>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/admin/products?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function createProduct(
  body: CreateProductBody
): Promise<ApiProduct> {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function updateProduct(
  id: number,
  body: UpdateProductBody
): Promise<ApiProduct> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Admin: Categories ────────────────────────────────────────────────────────

export async function getAdminCategories(
  filters: AdminCategoryFilters = {}
): Promise<ApiListResponse<ApiCategory>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/admin/categories?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function createCategory(
  body: CreateCategoryBody
): Promise<ApiCategory> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function updateCategory(
  id: number,
  body: UpdateCategoryBody
): Promise<ApiCategory> {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Admin: Media ─────────────────────────────────────────────────────────────

export async function uploadMedia(
  file: File,
  modelType: string,
  modelId: number,
  collectionName: string
): Promise<ApiMedia> {
  const form = new FormData()
  form.append('file', file)
  form.append('model_type', modelType)
  form.append('model_id', String(modelId))
  form.append('collection_name', collectionName)
  const res = await fetch(`${BASE_URL}/api/media`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: form,
  })
  return unwrapData(res)
}

export async function deleteMedia(mediaId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/media/${mediaId}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Admin: Reviews ───────────────────────────────────────────────────────────

export async function getAdminReviews(
  filters: ReviewFilters = {}
): Promise<ApiPaginatedResponse<AdminReview>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/reviews?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function moderateReview(
  id: number,
  status: ReviewStatus
): Promise<AdminReview> {
  const res = await fetch(`${BASE_URL}/api/reviews/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify({ status }),
  })
  return unwrapData(res)
}

export async function deleteAdminReview(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/reviews/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Public: Posts ────────────────────────────────────────────────────────────

export async function getPosts(
  filters: PostFilters = {}
): Promise<ApiPaginatedResponse<ApiPost>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/posts?${params}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getPost(slug: string): Promise<ApiPostDetail> {
  const res = await fetch(`${BASE_URL}/api/posts/${slug}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  })
  return unwrapData(res)
}

// ─── Admin: Posts ─────────────────────────────────────────────────────────────

export async function getAdminPosts(
  filters: PostFilters = {}
): Promise<ApiPaginatedResponse<ApiPost>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/admin/posts?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getAdminPost(id: number): Promise<ApiPostDetail> {
  const res = await fetch(`${BASE_URL}/api/admin/posts/${id}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return unwrapData(res)
}

export async function createPost(body: CreatePostBody): Promise<ApiPostDetail> {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function updatePost(id: number, body: UpdatePostBody): Promise<ApiPostDetail> {
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function deletePost(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

export async function uploadPostImage(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${BASE_URL}/api/posts/upload-image`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: form,
  })
  return handleResponse(res)
}

// ─── Admin: Product Notes ─────────────────────────────────────────────────────

export async function getProductNotes(
  productId: number,
  page = 1
): Promise<ApiPaginatedResponse<ProductNote>> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/notes?page=${page}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function createNote(
  productId: number,
  body: CreateNoteBody
): Promise<ProductNote> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/notes`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function updateNote(
  productId: number,
  noteId: number,
  body: UpdateNoteBody
): Promise<ProductNote> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/notes/${noteId}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function deleteNote(productId: number, noteId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/notes/${noteId}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Public: Enquiries ────────────────────────────────────────────────────────

export async function submitEnquiry(body: CreateEnquiryBody): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

// ─── Admin: Enquiries ─────────────────────────────────────────────────────────

export async function getEnquiries(
  filters: EnquiryFilters = {}
): Promise<ApiPaginatedResponse<Enquiry>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/enquiries?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getEnquiryUnreadCount(): Promise<{ count: number }> {
  const res = await fetch(`${BASE_URL}/api/enquiries/unread-count`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getEnquiry(id: number): Promise<Enquiry> {
  const res = await fetch(`${BASE_URL}/api/enquiries/${id}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return unwrapData(res)
}

export async function markEnquiryRead(id: number): Promise<Enquiry> {
  const res = await fetch(`${BASE_URL}/api/enquiries/${id}/read`, {
    method: 'PATCH',
    headers: buildHeaders(true),
  })
  return unwrapData(res)
}

export async function markEnquiryUnread(id: number): Promise<Enquiry> {
  const res = await fetch(`${BASE_URL}/api/enquiries/${id}/unread`, {
    method: 'PATCH',
    headers: buildHeaders(true),
  })
  return unwrapData(res)
}

export async function deleteEnquiry(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/enquiries/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Public: Checkout & Coupons ───────────────────────────────────────────────

export async function checkout(body: CheckoutBody): Promise<CheckoutResponse> {
  const res = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function validateCoupon(
  code: string,
  items: { product_id: number; quantity: number }[]
): Promise<CouponValidationResult> {
  const res = await fetch(`${BASE_URL}/api/promotions/validate`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ code, items }),
  })
  return handleResponse(res)
}

// ─── Admin: Orders ────────────────────────────────────────────────────────────

export async function getOrders(
  filters: OrderFilters = {}
): Promise<ApiPaginatedResponse<Order>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/orders?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getOrderStatusCounts(): Promise<OrderStatusCounts> {
  const res = await fetch(`${BASE_URL}/api/orders/status-counts`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function getOrder(id: number): Promise<OrderDetail> {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return unwrapData(res)
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<OrderDetail> {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify({ status }),
  })
  return unwrapData(res)
}

// ─── Admin: Promotions ────────────────────────────────────────────────────────

export async function getPromotions(
  filters: PromotionFilters = {}
): Promise<ApiPaginatedResponse<Promotion>> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const res = await fetch(`${BASE_URL}/api/promotions?${params}`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function createPromotion(body: CreatePromotionBody): Promise<Promotion> {
  const res = await fetch(`${BASE_URL}/api/promotions`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function updatePromotion(
  id: number,
  body: CreatePromotionBody
): Promise<Promotion> {
  const res = await fetch(`${BASE_URL}/api/promotions/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function deletePromotion(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/promotions/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}

// ─── Admin: Product Variants ──────────────────────────────────────────────────

export async function getProductVariants(
  productId: number
): Promise<ApiPaginatedResponse<ProductVariant>> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/variants`, {
    headers: buildHeaders(true),
    cache: 'no-store',
  })
  return handleResponse(res)
}

export async function createVariant(
  productId: number,
  body: CreateVariantBody
): Promise<ProductVariant> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/variants`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function updateVariant(
  productId: number,
  variantId: number,
  body: Partial<CreateVariantBody>
): Promise<ProductVariant> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/variants/${variantId}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  })
  return unwrapData(res)
}

export async function deleteVariant(
  productId: number,
  variantId: number
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  return handleResponse(res)
}
