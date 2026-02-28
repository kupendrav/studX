'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.login-card', { opacity: 0, y: 40, duration: 0.6, ease: 'power3.out' })
        gsap.from('.login-field', { opacity: 0, x: -20, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'power2.out' })
      }, pageRef)
      return () => ctx.revert()
    }
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div ref={pageRef} className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="login-card max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="login-field">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="login-field">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="login-field w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="login-field text-center mt-6 text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
