'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export function NavHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: '/spaces', label: 'Không gian của tôi' },
  ]

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center px-6 gap-6">
      <Link href="/spaces" className="font-semibold text-gray-900 text-sm">
        Spatial AI
      </Link>

      <nav className="flex gap-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname.startsWith(link.href)
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{session?.user?.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
