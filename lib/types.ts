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
  average_rating: number | null
  reviews_count: number
  category: ApiProductCategory
  featured_image?: ApiImage | null
}

export interface ApiReview {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  rating: number | null
  message: string | null
  status?: 'Approved'
  created_at: string
}

// ─── Storefront Variants ──────────────────────────────────────────────────────

export interface StorefrontVariantAttribute {
  attribute_value_id: number
  attribute: string
  value: string
}

export interface StorefrontProductVariant {
  id: number
  price: number | null
  stock: number
  is_active: boolean
  attributes: StorefrontVariantAttribute[]
}

export interface ProductAttributeValue {
  id: number
  value: string
}

export interface ProductAttributeConfig {
  id: number
  name: string
  values: ProductAttributeValue[]
}

// ─── Product Detail ───────────────────────────────────────────────────────────

export interface ApiProductDetail extends ApiProduct {
  description?: string | null
  gallery: ApiImage[]
  reviews: ApiReview[]
  variants: StorefrontProductVariant[]
  notes: ProductNote[]
  product_attributes?: ProductAttributeConfig[]
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

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating' | 'name_asc' | 'name_desc'

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

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export interface ApiPost {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  reading_time?: number | null
  is_published: boolean
  published_at?: string | null
  featured_image?: ApiImage | null
  created_at: string
  updated_at: string
}

export interface ApiPostDetail extends ApiPost {
  content: string
}

export interface PostFilters {
  search?: string
  per_page?: number
  page?: number
  is_published?: 1 | 0
}

export interface CreatePostBody {
  title: string
  slug?: string
  excerpt?: string | null
  content: string
  is_published: boolean
  published_at?: string | null
}

export type UpdatePostBody = CreatePostBody

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

// ─── Product Notes ────────────────────────────────────────────────────────────

export type NoteStatus = 'Public' | 'Private'

export interface ProductNote {
  id: number
  product_id: number
  title: string
  content: string
  status: NoteStatus
  created_at: string
  updated_at: string
}

export interface CreateNoteBody {
  title: string
  content: string
  status: NoteStatus
}

export type UpdateNoteBody = CreateNoteBody

// ─── Enquiries ────────────────────────────────────────────────────────────────

export interface Enquiry {
  id: number
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface CreateEnquiryBody {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface EnquiryFilters {
  is_read?: boolean
  search?: string
  per_page?: number
  page?: number
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutCustomer {
  name: string
  email: string
  phone: string
  address: string
}

export interface CheckoutItem {
  product_id: number
  product_variant_id: number | null
  quantity: number
}

export interface CheckoutBody {
  customer: CheckoutCustomer
  items: CheckoutItem[]
  shipping_method: string
  shipping_cost: number
  coupon_code?: string
}

export interface CheckoutResponse {
  message: string
  order_id: number
  subtotal: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  promotion_applied: { code: string; description: string } | null
}

export interface CouponPromotion {
  promotion_id: number
  type: 'discount' | 'buy_x_get_y'
  name: string
  code: string
  discount_amount: number
  description: string
}

export interface CouponValidationResult {
  valid: boolean
  promotion: CouponPromotion | null
  error: string | null
  subtotal: number
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderCustomer {
  id: number
  name: string
  email: string
  phone: string
  address: string
}

export interface OrderPromotion {
  id: number
  type: string
  code?: string | null
  name: string
}

export interface Order {
  id: number
  customer_id: number
  customer: OrderCustomer
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_method: string
  shipping_cost: number
  subtotal: number
  discount_amount: number
  total_amount: number
  status: OrderStatus
  promotion: OrderPromotion | null
  items_count: number
  created_at: string
  updated_at: string
}

export interface OrderVariantAttribute {
  attribute: string
  value: string
}

export interface OrderItemVariant {
  id: number
  sku: string
  price: number
  attributes: OrderVariantAttribute[]
}

export interface OrderItemProduct {
  id: number
  name: string
  slug: string
  featured_image?: ApiImage | null
}

export interface OrderItem {
  id: number
  product_id: number
  product_variant_id: number | null
  product: OrderItemProduct
  variant: OrderItemVariant | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderDetail extends Order {
  items: OrderItem[]
}

export interface OrderStatusCounts {
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  total: number
}

export interface OrderFilters {
  status?: OrderStatus
  search?: string
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

// ─── Promotions ───────────────────────────────────────────────────────────────

export type PromotionType = 'coupon' | 'auto_rule' | 'bundle'
export type DiscountType = 'percentage' | 'fixed_amount'
export type RuleType = 'quantity' | 'spend'

export interface PromotionEligibleProduct {
  type: 'category' | 'product'
  id: number
}

export interface Promotion {
  id: number
  type: PromotionType
  name: string
  code?: string | null
  discount_type: DiscountType
  discount_value: number
  max_discount_amount?: number | null
  ends_at?: string | null
  max_uses?: number | null
  max_uses_per_customer?: number | null
  rule_type?: RuleType | null
  rule_quantity?: number | null
  rule_spend_amount?: number | null
  rule_category_constraint?: 'same' | 'any' | null
  bundle_buy_qty?: number | null
  bundle_get_qty?: number | null
  bundle_same_product?: boolean | null
  bundle_free_product_id?: number | null
  is_active: boolean
  eligible_products?: PromotionEligibleProduct[]
  created_at: string
  updated_at: string
}

export type CreatePromotionBody = Omit<Promotion, 'id' | 'is_active' | 'created_at' | 'updated_at'>

export interface PromotionFilters {
  type?: PromotionType
  is_active?: boolean
  search?: string
  per_page?: number
  page?: number
}

// ─── Product Variants ─────────────────────────────────────────────────────────

export interface VariantAttribute {
  attribute: string
  value: string
}

export interface ProductVariant {
  id: number
  product_id: number
  sku: string
  price: number
  stock: number
  is_active: boolean
  attributes: VariantAttribute[]
  created_at: string
  updated_at: string
}

export interface CreateVariantBody {
  sku: string
  price: number
  stock: number
  is_active: boolean
  attribute_value_ids: number[]
}

// ─── Category Products ────────────────────────────────────────────────────────

export interface ApiCategoryHeader {
  id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
}

export interface ApiCategoryProductsResponse extends ApiPaginatedResponse<ApiProduct> {
  category: ApiCategoryHeader
}
