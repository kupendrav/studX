'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { opacity: 0, y: 60, duration: 1, ease: 'power3.out' })
      gsap.from('.hero-subtitle', { opacity: 0, y: 40, duration: 1, delay: 0.3, ease: 'power3.out' })
      gsap.from('.hero-btn', { opacity: 0, y: 30, duration: 0.8, delay: 0.6, stagger: 0.15, ease: 'power3.out' })
      gsap.from('.feature-card', { opacity: 0, y: 50, duration: 0.8, delay: 0.9, stagger: 0.2, ease: 'power3.out' })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} className="relative min-h-screen -mt-16">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover -z-10">
        <source src="/bus.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 -z-5"></div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 md:mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
            StudX
          </h1>

          <p className="hero-subtitle text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-8 md:mb-12 font-light drop-shadow-lg px-4">
            Apply for your student bus pass online. Quick, easy, and convenient!
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 md:mb-20 px-4">
            <Link
              href="/register"
              className="hero-btn group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/login"
              className="hero-btn group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold text-white overflow-hidden backdrop-blur-lg bg-white/10 border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </span>
            </Link>
          </div>

          {/* Feature Cards */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-16 px-4">
            <div className="feature-card group relative backdrop-blur-md bg-white/10 p-6 md:p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Easy Application</h3>
                <p className="text-sm md:text-base text-gray-200">Fill out a simple form with your details</p>
              </div>
            </div>
            <div className="feature-card group relative backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 md:p-8 rounded-2xl border border-purple-300/30 hover:border-purple-300/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">QR Code Pass</h3>
                <p className="text-sm md:text-base text-gray-200">Get your digital pass with QR code</p>
              </div>
            </div>
            <div className="feature-card group relative backdrop-blur-md bg-white/5 p-6 md:p-8 rounded-2xl border-2 border-white/20 hover:bg-gradient-to-br hover:from-teal-500/10 hover:to-emerald-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-teal-300/40 sm:col-span-2 md:col-span-1">
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Travel Easy</h3>
                <p className="text-sm md:text-base text-gray-200">Show your pass and travel hassle-free</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
