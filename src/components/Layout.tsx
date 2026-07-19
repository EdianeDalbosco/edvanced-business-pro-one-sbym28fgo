import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Home,
  Target,
  Wallet,
  Users,
  FileText,
  CheckSquare,
  BarChart,
  LogOut,
  Menu,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Planejamento & Metas', icon: Target, path: '/planning' },
  { label: 'Financeiro', icon: Wallet, path: '/finance' },
  { label: 'CRM', icon: Users, path: '/crm' },
  { label: 'Contratos', icon: FileText, path: '/contracts' },
  { label: 'Tarefas', icon: CheckSquare, path: '/tasks' },
  { label: 'Resultados', icon: BarChart, path: '/results' },
]

export default function Layout() {
  const { isAuthenticated, loading, signOut, user } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) return null

  if (location.pathname.startsWith('/portal')) return <Outlet />
  if (['/login', '/signup'].includes(location.pathname)) return <Outlet />

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  const currentPage = navItems.find((i) => i.path === location.pathname)?.label || 'Dashboard'

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
            location.pathname === item.path
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          )}
        >
          <item.icon
            size={20}
            className={cn(
              'transition-transform group-hover:scale-110',
              location.pathname === item.path ? 'text-indigo-200' : 'text-slate-400',
            )}
          />
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-950 text-white border-r border-slate-800 shadow-xl z-10">
        <div className="p-6">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Target size={20} className="text-white" />
            </div>
            Business Pro
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 mt-auto">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-sm font-medium truncate mb-3 text-slate-300">{user?.email}</div>
            <Button
              variant="outline"
              className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
              onClick={signOut}
            >
              <LogOut size={16} className="mr-2" /> Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 bg-slate-950 border-slate-800 p-0 text-white"
              >
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="p-6">
                  <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center">
                      <Target size={20} className="text-white" />
                    </div>
                    Business Pro
                  </div>
                </div>
                <nav className="px-3 space-y-1.5 mt-2">
                  <NavLinks />
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                    onClick={signOut}
                  >
                    <LogOut size={20} className="mr-3" /> Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-slate-800">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              asChild
            >
              <Link to="/tasks">
                <Plus size={16} className="mr-1" /> Tarefa
              </Link>
            </Button>
            <Button
              size="icon"
              className="sm:hidden bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              asChild
            >
              <Link to="/tasks">
                <Plus size={20} />
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
