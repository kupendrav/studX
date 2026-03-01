'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Home page has dark video background; other pages have light backgrounds
  const isHome = pathname === '/'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/login')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b shadow-lg no-print ${
      isHome
        ? 'bg-white/10 border-white/20'
        : 'bg-white/90 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className={`text-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform ${
            isHome ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            StudX
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition ${
              isHome ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-3 items-center">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`font-semibold px-4 py-2 rounded-lg transition ${
                    isHome
                      ? 'text-white hover:text-indigo-200 hover:bg-white/10'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg border ${
                    isHome
                      ? 'backdrop-blur-md bg-white/20 border-white/30 text-white hover:bg-white/30'
                      : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`font-semibold px-4 py-2 rounded-lg transition ${
                    isHome
                      ? 'text-white hover:text-indigo-200 hover:bg-white/10'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg border border-indigo-400/30"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden pb-4 space-y-2 ${isHome ? '' : 'border-t border-gray-100 pt-2'}`}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`block font-semibold px-4 py-3 rounded-lg transition ${
                    isHome
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-full text-left font-semibold px-4 py-3 rounded-lg transition ${
                    isHome
                      ? 'text-white hover:bg-white/10'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className={`block font-semibold px-4 py-3 rounded-lg transition ${
                    isHome
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block font-semibold px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
