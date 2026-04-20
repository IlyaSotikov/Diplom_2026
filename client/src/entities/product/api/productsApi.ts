import type { Product, ProductCategory, ProductId } from '../model/types'
import imgP001 from '../../../assets/products/p-001-whey.png'
import imgP002 from '../../../assets/products/p-002-casein.png'
import imgP003 from '../../../assets/products/p-003-mass.png'
import imgP004 from '../../../assets/products/p-004-fast.png'
import imgP005 from '../../../assets/products/p-005-bcaa.png'
import imgP006 from '../../../assets/products/p-006-bcaa-zero.png'
import imgP007 from '../../../assets/products/p-007-vitamin.png'
import imgP008 from '../../../assets/products/p-008-omega.png'
import imgP009 from '../../../assets/products/p-009-creatine.png'

const mockProducts: Product[] = [
  {
    id: 'p-001',
    title: 'Сывороточный протеин Whey Gold 900 г',
    brand: 'Optimum Nutrition',
    category: 'protein',
    priceRub: 4390,
    inStock: true,
    shortDescription: 'Быстроусвояемый белок после тренировки, вкус шоколад.',
    imageUrl: imgP001,
  },
  {
    id: 'p-002',
    title: 'Казеиновый протеин Night Protein 750 г',
    brand: 'BioTechUSA',
    category: 'protein',
    priceRub: 3590,
    inStock: true,
    shortDescription: 'Медленный белок для приема перед сном.',
    imageUrl: imgP002,
  },
  {
    id: 'p-003',
    title: 'Гейнер Mass Up 3000 г',
    brand: 'Mutant',
    category: 'gainer',
    priceRub: 5690,
    inStock: true,
    shortDescription: 'Высококалорийная смесь для набора массы.',
    imageUrl: imgP003,
  },
  {
    id: 'p-004',
    title: 'Гейнер Fast Carb+Protein 1500 г',
    brand: 'RLine',
    category: 'gainer',
    priceRub: 2890,
    inStock: true,
    shortDescription: 'Оптимальный вариант после силовой тренировки.',
    imageUrl: imgP004,
  },
  {
    id: 'p-005',
    title: 'BCAA 2:1:1 400 г',
    brand: 'Scivation',
    category: 'bcaa',
    priceRub: 2690,
    inStock: true,
    shortDescription: 'Аминокислоты для восстановления мышц.',
    imageUrl: imgP005,
  },
  {
    id: 'p-006',
    title: 'BCAA Zero 360 г',
    brand: 'BioTechUSA',
    category: 'bcaa',
    priceRub: 2490,
    inStock: false,
    shortDescription: 'Без сахара, подходит для сушки.',
    imageUrl: imgP006,
  },
  {
    id: 'p-007',
    title: 'Мультивитамины Daily Vita 90 таб.',
    brand: 'NOW Foods',
    category: 'vitamins',
    priceRub: 1990,
    inStock: true,
    shortDescription: 'Базовый комплекс витаминов и минералов на каждый день.',
    imageUrl: imgP007,
  },
  {
    id: 'p-008',
    title: 'Омега-3 Ultra 120 капс.',
    brand: 'Solgar',
    category: 'vitamins',
    priceRub: 2390,
    inStock: true,
    shortDescription: 'Поддержка сердечно-сосудистой системы и суставов.',
    imageUrl: imgP008,
  },
  {
    id: 'p-009',
    title: 'Креатин моногидрат Creapure 300 г',
    brand: 'MyProtein',
    category: 'protein',
    priceRub: 2190,
    inStock: true,
    shortDescription: 'Повышение силовых показателей и работоспособности.',
    imageUrl: imgP009,
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

