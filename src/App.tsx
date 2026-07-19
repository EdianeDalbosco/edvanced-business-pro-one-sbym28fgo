import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Dashboard from './pages/Index'
import Planning from './pages/Planning'
import Finance from './pages/Finance'
import CRM from './pages/CRM'
import Contracts from './pages/Contracts'
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
            <Route path="/crm" element={<CRM />} />
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
