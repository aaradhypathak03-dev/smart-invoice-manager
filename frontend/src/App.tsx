import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import VendorList from './pages/VendorList'
import InvoiceList from './pages/InvoiceList'
import InvoiceForm from './pages/InvoiceForm'
import InvoiceDetails from './pages/InvoiceDetails'
import AiExtract from './pages/AiExtract'
import { AuthStoreProvider } from './store/AuthStore'

export default function App() {
  return (
    <AuthStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vendors" element={<VendorList />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/new" element={<InvoiceForm />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/ai-extract" element={<AiExtract />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthStoreProvider>
  )
}
