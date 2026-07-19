import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Dashboard from './pages/Index'
import Planning from './pages/Planning'
import Finance from './pages/Finance'
import Pipeline from './pages/Pipeline'
import Clients from './pages/Clients'
import Marketing from './pages/Marketing'
import Contracts from './pages/Contracts'
import Products from './pages/Products'
import Tasks from './pages/Tasks'
import Results from './pages/Results'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ClientPortal from './pages/ClientPortal'
import NotFound from './pages/NotFound'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/crm" element={<Pipeline />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/results" element={<Results />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/portal/:token" element={<ClientPortal />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
