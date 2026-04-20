export type ProductId = string

export type ProductCategory = 'protein' | 'gainer' | 'bcaa' | 'vitamins'

export type Product = {
  id: ProductId
  title: string
  brand: string
  category: ProductCategory
  priceRub: number
  inStock: boolean
  shortDescription: string
  /** URL превью для каталога и карточки */
  imageUrl: string
}

