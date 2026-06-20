import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ApiProduct, ApiProductCategory } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A product can belong to multiple categories. For breadcrumbs / labels we use the
// first one as the primary category. Returns null only for malformed data.
export function primaryCategory(
  product: Pick<ApiProduct, 'categories'>
): ApiProductCategory | null {
  return product.categories?.[0] ?? null
}
