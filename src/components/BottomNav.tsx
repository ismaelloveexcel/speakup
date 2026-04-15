'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/session', label: 'Session', icon: '🎤' },
  { href: '/progress', label: 'Progress', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="mt-10 flex justify-around border-t border-amber-200 pt-5 pb-2">
      {navItems.map(({ href, label, icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active ? 'text-amber-600' : 'text-gray-400 hover:text-amber-400'
            }`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
