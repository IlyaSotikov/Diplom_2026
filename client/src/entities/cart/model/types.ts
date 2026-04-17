export type CartItem = {
  productId: string
  title: string
  priceRub: number
  quantity: number
}

export type CartSnapshot = {
  items: CartItem[]
  updatedAtIso: string
}

