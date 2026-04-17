import type { Product, ProductCategory, ProductId } from '../model/types'

const mockProducts: Product[] = [
  {
    id: 'p-001',
    title: 'Футбольный мяч Pro Match',
    brand: 'Adidas',
    category: 'football',
    priceRub: 3490,
    inStock: true,
    shortDescription: 'Официальный размер 5. Подходит для тренировок и матчей.',
  },
  {
    id: 'p-002',
    title: 'Кроссовки для бега AirRun',
    brand: 'Nike',
    category: 'running',
    priceRub: 8990,
    inStock: true,
    shortDescription: 'Амортизация и лёгкий верх для ежедневных пробежек.',
  },
  {
    id: 'p-003',
    title: 'Коврик для фитнеса Comfort',
    brand: 'Reebok',
    category: 'fitness',
    priceRub: 1990,
    inStock: false,
    shortDescription: 'Нескользящая поверхность, толщина 8 мм.',
  },
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assertOnline() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Нет подключения к сети. Проверьте интернет и попробуйте снова.')
  }
}

export const productsApi = {
  async list(params?: { category?: ProductCategory }) {
    await delay(250)
    assertOnline()
    if (!params?.category) return mockProducts
    return mockProducts.filter((p) => p.category === params.category)
  },
  async getById(productId: ProductId) {
    await delay(200)
    assertOnline()
    return mockProducts.find((p) => p.id === productId) ?? null
  },
}

