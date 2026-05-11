export interface ApiImage {
  id: number
  url: string
}

export interface ApiCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  is_featured: boolean
  products_count: number
  image?: ApiImage | null
}

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

export interface ReviewBody {
  name: string
  email?: string
  phone?: string
  rating?: number
  message?: string
}
