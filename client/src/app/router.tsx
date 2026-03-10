import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { ProductPage } from '../pages/product/ProductPage'
import { CartPage } from '../pages/cart/CartPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { AdminPage } from '../pages/admin/AdminPage'
import { NotFoundPage } from '../pages/notFound/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'product/:productId', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

