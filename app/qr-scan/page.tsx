'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import gsap from 'gsap'

function QRScanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const [showPass, setShowPass] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  
  // Use deployed URL so QR works on mobile
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  useEffect(() => {
    if (!id) {
      router.push('/dashboard')
    }
  }, [id, router])

  useEffect(() => {
    if (pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.qr-card', { opacity: 0, scale: 0.8, duration: 0.8, ease: 'back.out(1.7)' })
        gsap.from('.qr-success', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' })
      }, pageRef)
      return () => ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (showPass && id) {
      router.push(`/pass?id=${id}`)
    }
  }, [showPass, id, router])

  return (
    <div ref={pageRef} className="min-h-screen flex items-center justify-center px-4 py-6 md:py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center">
        <div className="qr-success mb-6">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Your bus pass application has been submitted and is pending admin approval.
          </p>
        </div>

        <div className="qr-card bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 md:p-8 mb-6">
          <p className="text-base md:text-lg font-semibold mb-4 text-gray-800">
            Scan QR Code to View Pass
          </p>
          {siteUrl && id ? (
            <div className="bg-white p-3 md:p-4 rounded-lg inline-block">
              <QRCode value={`${siteUrl}/pass/?id=${id}`} size={180} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Preparing QR code...</p>
          )}
          <p className="text-xs text-gray-500 mt-4">
            This QR code links to your bus pass and can be scanned from any device.
          </p>
        </div>

        <button
          onClick={() => setShowPass(true)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition mb-4 text-sm md:text-base"
        >
          View Bus Pass
        </button>

        <Link
          href="/dashboard"
          className="block text-indigo-600 font-semibold hover:underline text-sm md:text-base"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function QRScan() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <QRScanContent />
    </Suspense>
  )
}
