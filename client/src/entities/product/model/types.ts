export type ProductId = string

export type ProductCategory = 'football' | 'running' | 'fitness'

export type Product = {
  id: ProductId
  title: string
  brand: string
  category: ProductCategory
  priceRub: number
  inStock: boolean
  shortDescription: string
}

