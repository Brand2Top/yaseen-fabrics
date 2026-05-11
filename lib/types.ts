// ─── Shared primitives ────────────────────────────────────────────────────────

export interface ApiImage {
  id: number
  url: string
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface ApiCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  is_featured: boolean
  products_count: number
  image?: ApiImage | null
  created_at?: string
  updated_at?: string
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ApiProductCategory {
  id: number
  name: string
  slug: string
}

export interface ApiProduct {
  id: number
  name: string
  slug: string
  price: number
  discounted_price?: number | null
  stock: number
  is_active: boolean
  is_featured: boolean
  average_rating: number
  reviews_count: number
  category: ApiProductCategory
  featured_image?: ApiImage | null
}

export interface ApiReview {
  id: number
  name: string
  rating: number
  message: string
  created_at: string
}

export interface ApiProductDetail extends ApiProduct {
  description?: string | null
  gallery: ApiImage[]
  reviews: ApiReview[]
  variants: unknown[]
  notes: unknown[]
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiPaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: PaginationMeta
}

export interface ApiListResponse<T> {
  data: T[]
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating'

export interface ProductFilters {
  search?: string
  category_id?: number
  is_featured?: 1 | 0
  min_price?: number
  max_price?: number
  sort?: SortOption
  per_page?: number
  page?: number
}

export interface AdminProductFilters extends ProductFilters {
  is_active?: 1 | 0
}

export interface AdminCategoryFilters {
  search?: string
  is_featured?: 1 | 0
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number
  name: string
  email: string
  last_login_at?: string | null
  created_at?: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ChangePasswordBody {
  current_password: string
  password: string
  password_confirmation: string
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewBody {
  name: string
  email?: string
  phone?: string
  rating?: number
  message?: string
}

// ─── CRUD bodies ─────────────────────────────────────────────────────────────

export interface CreateProductBody {
  category_id: number
  name: string
  slug: string
  description?: string | null
  price: number
  discounted_price?: number | null
  stock: number
  is_active: boolean
  is_featured: boolean
}

export type UpdateProductBody = Partial<CreateProductBody>

export interface CreateCategoryBody {
  name: string
  slug: string
  description?: string | null
  is_featured: boolean
}

export type UpdateCategoryBody = CreateCategoryBody

// ─── Media ───────────────────────────────────────────────────────────────────

export interface ApiMedia {
  id: number
  url: string
  name?: string
  file_name?: string
  mime_type?: string
  collection_name?: string
}

// ─── Admin Reviews ────────────────────────────────────────────────────────────

export type ReviewStatus = 'Approved' | 'Rejected' | 'Pending'

export interface AdminReview {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  rating: number
  message?: string | null
  status: ReviewStatus
  created_at: string
  product?: { id: number; name: string; slug: string } | null
}

export interface ReviewFilters {
  status?: ReviewStatus
  product_id?: number
  min_rating?: number
  max_rating?: number
  page?: number
  per_page?: number
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}
