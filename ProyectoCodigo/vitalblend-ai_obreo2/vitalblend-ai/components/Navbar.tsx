// app/components/Navbar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History, User, Leaf } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Login', href: '/login', icon: User }
    
  ]

  // No mostramos la navbar en la landing o el login para no ensuciar
  if (pathname === '/' || pathname === '/login' || pathname === '/app/page.tsx') return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">VitalBlend <span className="text-primary">AI</span></span>
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}