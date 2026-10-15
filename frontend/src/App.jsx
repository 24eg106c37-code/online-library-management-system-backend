import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Layout, Loading } from './components/Layout.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Admin, { AdminBooks, BookForm } from './pages/Admin.jsx'
import { BorrowedBooks, Dashboard, History } from './pages/AccountPages.jsx'
import { Login, Register } from './pages/AuthPages.jsx'
import BookDetails from './pages/BookDetails.jsx'
import Catalog from './pages/Catalog.jsx'
import Home from './pages/Home.jsx'

function RequireAuth({ admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (admin && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="catalog" element={<Catalog />} />
      <Route path="books/:id" element={<BookDetails />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="borrowed" element={<BorrowedBooks />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route element={<RequireAuth admin />}>
        <Route path="admin" element={<Admin />} />
        <Route path="admin/books" element={<AdminBooks />} />
        <Route path="admin/books/new" element={<BookForm />} />
        <Route path="admin/books/:id/edit" element={<BookForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
}
