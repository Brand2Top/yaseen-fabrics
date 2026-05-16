# Storefront Integration Guide

Complete reference for connecting a Next.js (or any frontend) to the CMS API.  
All routes listed here are **public — no authentication required** unless noted otherwise.

---

## 1. Setup

### Base URL & required header

Every request must include the `X-Tenant` header identifying which store to serve.

```ts
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;   // e.g. https://api.yourdomain.com
const TENANT   = process.env.NEXT_PUBLIC_TENANT_ID; // e.g. "yaseen" or "aleenza" or "pima"

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant': TENANT,
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}
```

### Pagination wrapper

All list endpoints return the same envelope:

```ts
interface Paginated<T> {
  data:  T[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta:  {
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
    path:         string;
  };
}
```

---

## 2. Categories

### `GET /api/categories`

Returns a **paginated** list of all categories.

#### Query params

| Param | Type | Default | Values |
|-------|------|---------|--------|
| `search` | string | — | Searches name + description |
| `is_featured` | boolean | — | `true` / `false` |
| `sort` | string | `newest` | `newest` `oldest` `alpha_asc` `alpha_desc` `most_products` |
| `per_page` | integer | `20` | 1–100 |

#### Request examples

```
GET /api/categories
GET /api/categories?sort=alpha_asc&per_page=50
GET /api/categories?is_featured=true
GET /api/categories?search=electronics&sort=most_products
```

#### CategoryResource shape

```ts
interface Category {
  id:             number;
  name:           string;
  slug:           string;
  description:    string | null;
  is_featured:    boolean;
  products_count: number;
  image:          { id: number; url: string } | null;
  created_at:     string; // ISO 8601
  updated_at:     string;
}
```

---

### `GET /api/categories/featured`

Returns all featured categories as a flat array (no pagination).  
Use for homepage feature strips.

```ts
// Returns { data: Category[] }
const { data: featured } = await apiFetch<{ data: Category[] }>('categories/featured');
```

---

### `GET /api/categories/{idOrSlug}`

Returns a single category by ID or slug.

```
GET /api/categories/electronics
GET /api/categories/3
```

---

## 3. Products

### `GET /api/products`

Returns a **paginated** list of active products.

#### Query params

| Param | Type | Default | Values |
|-------|------|---------|--------|
| `search` | string | — | Searches name + description |
| `category_id` | integer | — | Filter by category ID |
| `is_featured` | boolean | — | Featured products only |
| `min_price` | number | — | Price floor (inclusive) |
| `max_price` | number | — | Price ceiling (inclusive) |
| `sort` | string | `newest` | `newest` `oldest` `price_asc` `price_desc` `rating` `name_asc` `name_desc` |
| `per_page` | integer | `15` | 1–100 |

#### Request examples

```
GET /api/products
GET /api/products?category_id=2&sort=price_asc&per_page=24
GET /api/products?search=shirt&min_price=10&max_price=50
GET /api/products?is_featured=true&sort=rating
GET /api/products?sort=name_asc&per_page=100
```

#### ProductResource shape (list)

```ts
interface Product {
  id:               number;
  name:             string;
  slug:             string;
  description:      string;
  price:            number;
  discounted_price: number | null;
  stock:            number;
  is_active:        boolean;
  is_featured:      boolean;
  average_rating:   number | null;  // rounded to nearest 0.5
  reviews_count:    number;
  category:         Category | null;
  featured_image:   { id: number; url: string } | null;
  gallery:          { id: number; url: string }[];          // only on show
  reviews:          ProductReview[];                        // only on show
  variants:         ProductVariant[];                       // only on show
  notes:            ProductNote[];                          // only on show — Public notes only
  created_at:       string;
  updated_at:       string;
}
```

`gallery`, `reviews`, `variants`, and `notes` are **not included** in list responses — only in the single-product response.

---

### `GET /api/products/featured`

Returns up to 20 featured active products as a flat array (no pagination).

```ts
const { data: featured } = await apiFetch<{ data: Product[] }>('products/featured');
```

---

### `GET /api/products/{idOrSlug}`

Returns a single product with full detail: gallery, approved reviews, public notes, variant list, and the product's attribute configuration.

```
GET /api/products/classic-tee
GET /api/products/7
```

#### Additional fields on show

```ts
// Defines which attributes (dimensions) this product uses and what values are available.
// Use this to build the variant selector UI.
interface ProductAttributeConfig {
  id:     number;
  name:   string;   // e.g. "Color"
  values: { id: number; value: string }[];   // e.g. [{id:1,value:"Red"},{id:2,value:"Blue"}]
}

interface ProductVariant {
  id:         number;
  price:      number | null;  // null = use product base/discounted price
  stock:      number;
  is_active:  boolean;
  // Same attributes as product_attributes but showing which value is selected for this variant
  attributes: { attribute_value_id: number; attribute: string; value: string }[];
}

interface ProductReview {
  id:         number;
  name:       string;
  email:      string;
  phone:      string | null;
  rating:     number | null;  // 0.5 increments, 0.5–5.0
  message:    string | null;
  status:     'Approved';
  created_at: string;
}

interface ProductNote {
  id:         number;
  title:      string;
  content:    string;
  status:     'Public';   // only Public notes are included on the storefront show endpoint
  created_at: string;
  updated_at: string;
}
```

The product response includes both `product_attributes` (the available options per dimension) and `variants` (the actual combinations in stock). Use them together to build the selector:

```ts
// Build a lookup map: "attributeValueId,attributeValueId,..." → variant
const variantMap = new Map<string, ProductVariant>();
product.variants.forEach(v => {
  const key = v.attributes
    .map(a => a.attribute_value_id)  // IDs are in the variant's attribute list
    .sort()
    .join(',');
  variantMap.set(key, v);
});

// When user selects values, find the matching variant:
const key = selectedValueIds.sort().join(',');
const selectedVariant = variantMap.get(key) ?? null;
```

`product_attributes` is `[]` for products that have no variant configuration (simple products with a single stock value on the base product).

---

### `GET /api/categories/{idOrSlug}/products`

Returns paginated products scoped to a category, **plus category metadata** in the same response.  
Supports all the same filters and sort options as `GET /api/products` (except `category_id` — it's fixed by the URL).

```
GET /api/categories/electronics/products
GET /api/categories/electronics/products?sort=price_asc&per_page=24
GET /api/categories/electronics/products?search=headphones&min_price=20&max_price=200
```

#### Response shape

```json
{
  "data": [ /* Product[] */ ],
  "links": { ... },
  "meta":  { ... },
  "category": {
    "id":          1,
    "name":        "Electronics",
    "slug":        "electronics",
    "description": "All things tech",
    "image":       "https://api.yourdomain.com/storage/yaseen/media/..."
  }
}
```

The `category` field at the top level gives you the page header data (name, description, banner image) without a second request.

#### Next.js category page pattern

```ts
// app/categories/[slug]/page.tsx
export default async function CategoryPage({ params, searchParams }) {
  const qs = new URLSearchParams({
    sort:     searchParams.sort     ?? 'newest',
    per_page: searchParams.per_page ?? '24',
    ...(searchParams.search    && { search:    searchParams.search }),
    ...(searchParams.min_price && { min_price: searchParams.min_price }),
    ...(searchParams.max_price && { max_price: searchParams.max_price }),
    ...(searchParams.page      && { page:      searchParams.page }),
  }).toString();

  const data = await apiFetch<Paginated<Product> & { category: CategoryMeta }>(
    `categories/${params.slug}/products?${qs}`
  );

  return (
    <>
      <CategoryHeader category={data.category} />
      <ProductGrid products={data.data} />
      <Pagination meta={data.meta} />
    </>
  );
}
```

---

## 4. Posts / Blog

### `GET /api/posts`

Returns **paginated** published posts.

#### Query params

| Param | Type | Default | Values |
|-------|------|---------|--------|
| `search` | string | — | Searches title + excerpt |
| `sort` | string | `newest` | `newest` `oldest` `alpha_asc` `alpha_desc` |
| `per_page` | integer | `12` | 1–50 |

#### Request examples

```
GET /api/posts
GET /api/posts?sort=alpha_asc&per_page=9
GET /api/posts?search=summer&sort=newest
GET /api/posts?page=2&per_page=12
```

#### PostResource shape

```ts
interface Post {
  id:             number;
  title:          string;
  slug:           string;
  excerpt:        string | null;
  content:        string;         // full HTML — render only on single post page
  reading_time:   number;         // minutes (ceil of word_count / 200)
  is_published:   boolean;
  published_at:   string | null;  // ISO 8601
  featured_image: { id: number; url: string } | null;
  created_at:     string;
  updated_at:     string;
}
```

> **List vs detail**: In list views, render only `title`, `slug`, `excerpt`, `featured_image`, `published_at`, and `reading_time`. The `content` field contains the full HTML — only pass it to a rich-text renderer on the single post page.

---

### `GET /api/posts/{slug}`

Returns a single published post by slug.

```
GET /api/posts/how-to-style-a-tee
```

---

## 5. FAQs

### `GET /api/faqs`

Returns all active FAQs in `sort_order` sequence (no pagination — FAQs are expected to be a small set).

```ts
interface Faq {
  id:         number;
  question:   string;
  answer:     string;
  is_active:  boolean;
  sort_order: number;
}
```

---

## 6. Settings

### `GET /api/settings`

Returns all tenant settings as a flat key→value object. Use to load store name, logo URL, social links, hero content, etc.

```ts
// Example response
{
  "store_name":   "My Store",
  "logo_url":     "https://api.yourdomain.com/storage/yaseen/settings/logo.png",
  "hero_title":   "Welcome",
  "hero_subtitle": "Shop the latest collection",
  "currency":     "USD",
  "facebook_url": "https://facebook.com/mystore"
}
```

Keys are set by the admin via `POST /api/settings` and are tenant-specific. Fetch once on layout load and cache.

---

## 7. Enquiries

### `POST /api/enquiries`

Rate limited: 20 requests per minute per IP.

#### Request body

```ts
interface EnquiryPayload {
  name:    string;        // required, max 255
  email:   string;        // required, valid email
  phone?:  string;        // optional, max 30
  subject: string;        // required, max 255
  message: string;        // required, max 10 000 chars
}
```

#### Response — `201`

```json
{ "message": "Enquiry submitted successfully" }
```

---

## 8. Reviews

### `POST /api/products/{productId}/reviews`

Rate limited: 10 requests per minute per IP.

#### Request body

```ts
interface ReviewPayload {
  name:     string;           // required
  email:    string;           // required, valid email
  phone?:   string;           // optional, max 30
  rating?:  number;           // 0.5–5.0 in 0.5 increments (e.g. 3.5)
  message?: string;           // max 5 000 chars
  // At least one of rating or message is required
}
```

#### Response — `201`

Returns the created review (status will be `Pending` until admin approves).

---

## 9. Promotions — Validate

### `POST /api/promotions/validate`

Call this when the customer clicks "Apply" on a promo code in the cart. Returns whether the code is valid and the discount amount it would apply.

Rate limited: 20 requests per minute per IP.

#### Request body

```ts
interface ValidatePayload {
  code:  string;   // the promo code the customer entered — required
  items: Array<{
    product_id:         number;
    product_variant_id: number | null;
    quantity:           number;
  }>;
}
```

#### Response — `200`

```ts
interface ValidateResponse {
  valid: boolean;
  promotion: {
    promotion_id:    number;
    type:            'discount' | 'buy_x_get_y';
    name:            string;
    code:            string;
    discount_amount: number;
    description:     string;   // e.g. "SUMMER20 — 20% off (max $50)" or "Buy 2 get 1 free"
  } | null;
  error:    string | null;   // see error codes below
  subtotal: number;
}
```

#### Error codes

| Code | Meaning |
|------|---------|
| `INVALID_CODE` | Code doesn't exist or is inactive |
| `CODE_EXPIRED` | Outside `ends_at` window |
| `CODE_MAX_USES_REACHED` | Global usage limit hit |
| `CODE_MAX_USES_PER_CUSTOMER_REACHED` | This customer already used it |
| `CODE_MIN_ORDER_NOT_MET` | Cart subtotal below the code's minimum spend |
| `CODE_NO_ELIGIBLE_ITEMS` | None of the cart items match the code's eligible products |

#### Usage pattern

```ts
// On coupon apply button click
const check = await apiFetch<ValidateResponse>('promotions/validate', {
  method: 'POST',
  body: JSON.stringify({ code: couponInput, items: cartItems }),
});

if (!check.valid) {
  showError(promoErrorMessage[check.error!]);
} else {
  applyPromo(check.promotion!); // store for checkout submission
}

const promoErrorMessage: Record<string, string> = {
  INVALID_CODE:                     'This promo code is not valid.',
  CODE_EXPIRED:                     'This promo code has expired.',
  CODE_MAX_USES_REACHED:            'This promo code is no longer available.',
  CODE_MAX_USES_PER_CUSTOMER_REACHED: 'You have already used this code.',
  CODE_MIN_ORDER_NOT_MET:           'Your order does not meet the minimum spend for this code.',
  CODE_NO_ELIGIBLE_ITEMS:           'This code does not apply to any items in your cart.',
};
```

---

## 10. Checkout

### `POST /api/checkout`

Rate limited: 30 requests per minute per IP.

Handles stock locking, promotion application, and customer upsert in a single atomic transaction.

#### Request body

```ts
interface CheckoutPayload {
  customer: {
    name:    string;
    email:   string;
    phone:   string;
    address: string;
  };
  items: Array<{
    product_id:         number;
    product_variant_id: number | null;
    quantity:           number;
  }>;
  shipping_method: string;
  shipping_cost:   number;
  coupon_code?:    string;    // optional
}
```

#### Response — `201`

```ts
interface CheckoutResponse {
  message:           string;
  order_id:          number;
  subtotal:          number;
  discount_amount:   number;
  shipping_cost:     number;
  total_amount:      number;
  promotion_applied: {
    code:        string | null;
    description: string;
  } | null;
}
```

#### Error responses

**`422`** — validation failure or stock/variant errors:
```json
{
  "errors": {
    "items": ["Product 'Classic Tee' has only 2 items in stock."]
  }
}
```

#### Full checkout flow

```ts
async function submitOrder(cart: Cart, couponResult: PromotionResult | null) {
  try {
    const order = await apiFetch<CheckoutResponse>('checkout', {
      method: 'POST',
      body: JSON.stringify({
        customer: cart.customer,
        items:    cart.items.map(i => ({
          product_id:         i.product.id,
          product_variant_id: i.variant?.id ?? null,
          quantity:           i.quantity,
        })),
        shipping_method: cart.shippingMethod,
        shipping_cost:   cart.shippingCost,
        coupon_code:     couponResult?.code ?? undefined,
      }),
    });

    // Use order values for confirmation — do not re-fetch
    showConfirmation(order);
    clearCart();
  } catch (err) {
    // Handle 422 stock errors, display to user
  }
}
```

> **Important:** After a successful checkout, update UI state from the `201` response directly. Do not re-fetch the cart or order — the response contains the final totals.

---

## 11. Sort Options Reference

### Products

| Value | Label |
|-------|-------|
| `newest` | Newest first *(default)* |
| `oldest` | Oldest first |
| `price_asc` | Price: Low to High |
| `price_desc` | Price: High to Low |
| `rating` | Top Rated |
| `name_asc` | A → Z |
| `name_desc` | Z → A |

### Categories

| Value | Label |
|-------|-------|
| `newest` | Newest first *(default)* |
| `oldest` | Oldest first |
| `alpha_asc` | A → Z |
| `alpha_desc` | Z → A |
| `most_products` | Most Products |

### Posts / Blog

| Value | Label |
|-------|-------|
| `newest` | Newest first *(default)* |
| `oldest` | Oldest first |
| `alpha_asc` | A → Z |
| `alpha_desc` | Z → A |

---

## 12. Pagination — Usage Pattern

All paginated endpoints support a `page` query param (Laravel default).  
`withQueryString()` means all current filters are preserved in `links.next` / `links.prev`.

```ts
// Read page from URL searchParams
const page = Number(searchParams.page ?? 1);

const data = await apiFetch<Paginated<Product>>(
  `products?category_id=2&sort=price_asc&per_page=24&page=${page}`
);

// data.meta.last_page    → total pages
// data.meta.total        → total records
// data.links.next        → full URL of next page (or null)
// data.meta.current_page → current page number
```

#### Pagination component input

```ts
{
  currentPage: data.meta.current_page,
  lastPage:    data.meta.last_page,
  total:       data.meta.total,
  perPage:     data.meta.per_page,
}
```

---

## 13. Image URLs

All `url` fields in `featured_image`, `gallery`, and `image` are absolute URLs ready to use directly in `<Image>` or `<img>` tags.

```ts
// Pattern: {API_BASE}/storage/{tenant_id}/media/{filename}
// Example: https://api.yourdomain.com/storage/yaseen/media/photo.webp

<Image src={product.featured_image.url} alt={product.name} width={800} height={600} />
```

For Next.js `<Image>`, add the API domain to `next.config.js`:

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.yourdomain.com', pathname: '/storage/**' },
    ],
  },
};
```

---

## 14. Error Handling

| Status | Meaning |
|--------|---------|
| `404` | Resource not found (wrong slug/ID, or unpublished) |
| `422` | Validation failed — check `errors` object |
| `429` | Rate limited — back off and retry |
| `500` | Server error — log and show a generic message |

```ts
// Shared error handler
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Tenant': TENANT, ...init?.headers },
  });

  if (res.status === 404) throw new NotFoundError();
  if (res.status === 422) {
    const body = await res.json();
    throw new ValidationError(body.errors);
  }
  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new Error(`API ${res.status}`);
  if (res.status === 204) return undefined as T;

  return res.json();
}
```
