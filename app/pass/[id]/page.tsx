'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import type { Student } from '@/types'
import QRCode from 'react-qr-code'
import gsap from 'gsap'

export default function BusPass() {
  const params = useParams()
  const id = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const passRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .single()

        if (data) {
          setStudent(data)
        } else if (error && error.code !== 'PGRST116') {
          console.error('Failed to load pass details', error)
        }
      } catch (error) {
        console.error('Unexpected error loading pass', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchStudent()
  }, [id, supabase])

  useEffect(() => {
    if (!loading && student && passRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.pass-card', { opacity: 0, scale: 0.9, duration: 0.8, ease: 'back.out(1.7)' })
        gsap.from('.pass-detail', { opacity: 0, x: -20, duration: 0.5, stagger: 0.08, delay: 0.4, ease: 'power2.out' })
      }, passRef)
      return () => ctx.revert()
    }
  }, [loading, student])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pass Not Found</h2>
          <p className="text-gray-600">The requested bus pass could not be found.</p>
        </div>
      </div>
    )
  }

  const passUrl = `${siteUrl}/pass/${student.id}`

  return (
    <div ref={passRef} className="min-h-screen py-6 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Printable ID Card Pass */}
        <div className="print-pass pass-card bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-sm px-4 sm:px-8 py-4 sm:py-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">🚌 Student Bus Pass</h1>
                <p className="text-white/80 text-xs sm:text-sm">Valid for Academic Year 2025-26</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                <p className="text-[10px] sm:text-xs text-white/80">Pass ID</p>
                <p className="text-xs sm:text-sm font-mono font-bold text-white">{student.regno}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              {/* Photo */}
              <div className="sm:col-span-1 flex justify-center sm:block">
                <div className="bg-white rounded-2xl p-2 sm:p-4 shadow-xl w-32 sm:w-full">
                  {student.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.photo_url} alt={student.name} className="w-full aspect-square object-cover rounded-xl" />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-4xl sm:text-6xl">👤</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="sm:col-span-2 space-y-3 sm:space-y-4">
                <div className="pass-detail bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{student.name}</h2>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start">
                      <span className="text-white/70 text-xs sm:text-sm w-20 sm:w-24 flex-shrink-0">College:</span>
                      <span className="text-white font-semibold text-sm sm:text-base flex-1">{student.college}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-white/70 text-xs sm:text-sm w-20 sm:w-24 flex-shrink-0">Reg No:</span>
                      <span className="text-white font-semibold text-sm sm:text-base flex-1">{student.regno}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-white/70 text-xs sm:text-sm w-20 sm:w-24 flex-shrink-0">Email:</span>
                      <span className="text-white font-semibold text-sm sm:text-base flex-1 break-all">{student.email}</span>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="pass-detail bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <h3 className="text-sm sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <span>🗺️</span> Route
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-400 flex items-center justify-center text-white text-xs sm:text-sm font-bold">A</div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/70">From</p>
                        <p className="text-white font-semibold text-sm">{student.destination_from}</p>
                      </div>
                    </div>
                    {student.via_1 && (
                      <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">1</div>
                        <span className="text-white text-sm">{student.via_1}</span>
                      </div>
                    )}
                    {student.via_2 && (
                      <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">2</div>
                        <span className="text-white text-sm">{student.via_2}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-400 flex items-center justify-center text-white text-xs sm:text-sm font-bold">B</div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/70">To</p>
                        <p className="text-white font-semibold text-sm">{student.destination_to}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="pass-detail mt-4 sm:mt-8 bg-white rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-gray-700 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Scan to Verify</p>
              <div className="inline-block bg-white p-2 sm:p-4 rounded-xl">
                <QRCode value={passUrl} size={120} />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
                Valid until: December 31, 2026
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/10 backdrop-blur-sm px-4 sm:px-8 py-3 sm:py-4 border-t border-white/20">
            <p className="text-center text-white/80 text-[10px] sm:text-sm">
              This pass is non-transferable and must be carried at all times while traveling
            </p>
          </div>
        </div>

        {/* Action Buttons — hidden when printing */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center no-print">
          <button
            onClick={() => window.print()}
            className="bg-white text-indigo-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print ID Card
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(passUrl)
              alert('Pass link copied!')
            }}
            className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Share Link
          </button>
        </div>
      </div>
    </div>
  )
}
