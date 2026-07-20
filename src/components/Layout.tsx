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
  BarChart3,
  LogOut,
  Menu,
  Plus,
  Package,
  Filter,
  Megaphone,
  Settings as SettingsIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { NotificationBell } from '@/components/notification-bell'
import logoUrl from '@/assets/design-sem-nome-4-3f1f0.png'

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Planejamento & Metas', icon: Target, path: '/planning' },
  { label: 'Financeiro', icon: Wallet, path: '/finance' },
  { label: 'Produtos & Serviços', icon: Package, path: '/products' },
  { label: 'Pipeline (CRM)', icon: Filter, path: '/crm' },
  { label: 'Clientes', icon: Users, path: '/clients' },
  { label: 'Comercial & Marketing', icon: Megaphone, path: '/marketing' },
  { label: 'Contratos', icon: FileText, path: '/contracts' },
  { label: 'Central de Execução', icon: CheckSquare, path: '/tasks' },
  { label: 'Resultados', icon: BarChart3, path: '/results' },
  { label: 'Equipe', icon: Users, path: '/team' },
  { label: 'Configurações', icon: SettingsIcon, path: '/settings' },
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
              ? 'bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-primary',
          )}
        >
          <item.icon
            size={20}
            className={cn(
              'transition-transform group-hover:scale-110',
              location.pathname === item.path
                ? 'text-primary-foreground'
                : 'text-slate-500 group-hover:text-primary',
            )}
          />
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl z-10">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={logoUrl} alt="Edvanced Business Pro" className="h-10 w-auto object-contain" />
            <span className="font-bold text-xl leading-none text-[#D4AF37] tracking-tight">
              Edvanced
              <br />
              Business Pro
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-sm font-medium truncate mb-3 text-slate-300">{user?.email}</div>
            <Button
              variant="outline"
              className="w-full justify-start text-slate-300 border-white/10 hover:bg-white/10 hover:text-primary hover:border-primary/30"
              onClick={signOut}
            >
              <LogOut size={16} className="mr-2" /> Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-slate-300 hover:text-primary"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 bg-sidebar border-sidebar-border p-0 text-sidebar-foreground"
              >
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="p-6">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={logoUrl}
                      alt="Edvanced Business Pro"
                      className="h-10 w-auto object-contain"
                    />
                    <span className="font-bold text-xl leading-none text-[#D4AF37] tracking-tight">
                      Edvanced
                      <br />
                      Business Pro
                    </span>
                  </Link>
                </div>
                <nav className="px-3 space-y-1.5 mt-2">
                  <NavLinks />
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-sidebar-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-primary hover:bg-white/5"
                    onClick={signOut}
                  >
                    <LogOut size={20} className="mr-3" /> Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-foreground">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'manager' && <NotificationBell />}
            <Button
              size="sm"
              className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              asChild
            >
              <Link to="/tasks">
                <Plus size={16} className="mr-1" /> Tarefa
              </Link>
            </Button>
            <Button
              size="icon"
              className="sm:hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              asChild
            >
              <Link to="/tasks">
                <Plus size={20} />
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
