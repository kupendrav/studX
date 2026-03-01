'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Student } from '@/types'
import gsap from 'gsap'

const statusSteps = [
  { key: 'submitted', label: 'Submitted', icon: '📄' },
  { key: 'under_review', label: 'Under Review', icon: '🔍' },
  { key: 'approved', label: 'Approved', icon: '✅' },
  { key: 'pass_issued', label: 'Pass Issued', icon: '🎫' },
]

function getStepIndex(status: string) {
  if (status === 'rejected') return -1
  if (status === 'pending') return 0
  if (status === 'under_review') return 1
  if (status === 'approved') return 2
  return 3
}

export default function Dashboard() {
  const [application, setApplication] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUserName(user.email?.split('@')[0] || 'Student')

        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setApplication(data)
        } else if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Failed to load application record', fetchError)
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('not authenticated')) {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  useEffect(() => {
    if (!loading && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.dash-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power3.out' })
        gsap.from('.dash-header', { opacity: 0, y: -30, duration: 0.8, ease: 'power3.out' })
        gsap.from('.step-item', { opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'back.out(1.7)' })
      }, pageRef)
      return () => ctx.revert()
    }
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const currentStep = application ? getStepIndex(application.application_status) : -1
  const isApproved = application?.application_status === 'approved'
  const isRejected = application?.application_status === 'rejected'

  const passValidUntil = new Date()
  passValidUntil.setMonth(passValidUntil.getMonth() + 12)

  return (
    <div ref={pageRef} className="min-h-screen py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="dash-header bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm md:text-base text-white/80 mb-1">Welcome back,</p>
              <h1 className="text-2xl md:text-4xl font-bold capitalize">{userName}</h1>
              <p className="text-sm md:text-base text-white/70 mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3">
              {!application && (
                <Link
                  href="/application"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition text-sm md:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Application
                </Link>
              )}
            </div>
          </div>
        </div>

        {!application ? (
          /* No Application State */
          <div className="dash-card bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="text-6xl md:text-7xl mb-6">📝</div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">No Application Found</h2>
              <p className="text-gray-600 mb-8 text-base md:text-lg">
                You haven&apos;t submitted a bus pass application yet. Apply now to get your digital bus pass.
              </p>
              <Link
                href="/application"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition text-lg"
              >
                Apply for Bus Pass
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="dash-card bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-2xl">🎫</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-500">Pass Status</p>
                    <p className={`text-sm md:text-base font-bold truncate ${
                      isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {application.application_status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="dash-card bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-2xl">🗺️</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-500">Route</p>
                    <p className="text-sm md:text-base font-bold text-gray-900 truncate">{application.destination_from} → {application.destination_to}</p>
                  </div>
                </div>
              </div>
              <div className="dash-card bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-2xl">🏫</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-500">College</p>
                    <p className="text-sm md:text-base font-bold text-gray-900 truncate">{application.college}</p>
                  </div>
                </div>
              </div>
              <div className="dash-card bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-2xl">📅</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-500">Valid Until</p>
                    <p className="text-sm md:text-base font-bold text-gray-900">
                      {isApproved ? passValidUntil.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Progress Tracker */}
            <div className="dash-card bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold mb-6 text-gray-900">Application Progress</h2>
              
              {isRejected ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">❌</div>
                  <h3 className="text-lg font-bold text-red-700 mb-2">Application Rejected</h3>
                  <p className="text-red-600 text-sm">Your application has been rejected. Please contact admin for more details.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {statusSteps.map((step, i) => (
                    <div key={step.key} className="step-item flex items-center gap-3 sm:flex-col sm:gap-2 sm:flex-1 sm:text-center">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl flex-shrink-0 transition-all duration-500 ${
                        i <= currentStep
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-200'
                          : 'bg-gray-100'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-xs md:text-sm font-semibold ${i <= currentStep ? 'text-green-700' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`hidden sm:block flex-1 h-1 rounded-full mx-2 ${
                          i < currentStep ? 'bg-green-400' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dash-card bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {isApproved && (
                  <>
                    <Link
                      href={`/pass?id=${application.id}`}
                      className="flex flex-col items-center gap-2 p-4 md:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition border border-indigo-100"
                    >
                      <span className="text-2xl md:text-3xl">🎫</span>
                      <span className="text-xs md:text-sm font-semibold text-indigo-700 text-center">View Pass</span>
                    </Link>
                    <Link
                      href={`/qr-scan?id=${application.id}`}
                      className="flex flex-col items-center gap-2 p-4 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition border border-green-100"
                    >
                      <span className="text-2xl md:text-3xl">📱</span>
                      <span className="text-xs md:text-sm font-semibold text-green-700 text-center">QR Code</span>
                    </Link>
                    <button
                      onClick={() => window.open(`/pass?id=${application.id}`, '_blank')}
                      className="flex flex-col items-center gap-2 p-4 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition border border-blue-100"
                    >
                      <span className="text-2xl md:text-3xl">🖨️</span>
                      <span className="text-xs md:text-sm font-semibold text-blue-700 text-center">Print Pass</span>
                    </button>
                  </>
                )}
                <Link
                  href="/application"
                  className={`flex flex-col items-center gap-2 p-4 md:p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl hover:shadow-md transition border border-orange-100 ${isApproved ? '' : 'col-span-2'}`}
                >
                  <span className="text-2xl md:text-3xl">📋</span>
                  <span className="text-xs md:text-sm font-semibold text-orange-700 text-center">
                    {application ? 'View Application' : 'New Application'}
                  </span>
                </Link>
              </div>
            </div>

            {/* Application Details */}
            <div className="dash-card bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Application Details</h2>
                  <p className="text-sm text-gray-600">Your bus pass application information</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold ${
                  isApproved ? 'bg-green-100 text-green-700'
                    : isRejected ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {application.application_status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{application.name}</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Registration Number</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{application.regno}</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">College</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{application.college}</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 break-all">{application.email}</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">From</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{application.destination_from}</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">To</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">{application.destination_to}</p>
                </div>
                {application.via_1 && (
                  <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Via 1</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">{application.via_1}</p>
                  </div>
                )}
                {application.via_2 && (
                  <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Via 2</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">{application.via_2}</p>
                  </div>
                )}
              </div>

              {/* Route Map */}
              <div className="mt-6 p-4 md:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <h3 className="text-sm md:text-base font-bold text-indigo-900 mb-4">🗺️ Your Route</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">A</div>
                    <span className="text-sm font-semibold text-gray-800">{application.destination_from}</span>
                  </div>
                  {application.via_1 && (
                    <>
                      <div className="hidden sm:block w-8 md:w-12 h-0.5 bg-indigo-300 mx-1"></div>
                      <div className="flex items-center gap-2 ml-5 sm:ml-0">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold">1</div>
                        <span className="text-sm text-gray-700">{application.via_1}</span>
                      </div>
                    </>
                  )}
                  {application.via_2 && (
                    <>
                      <div className="hidden sm:block w-8 md:w-12 h-0.5 bg-indigo-300 mx-1"></div>
                      <div className="flex items-center gap-2 ml-5 sm:ml-0">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold">2</div>
                        <span className="text-sm text-gray-700">{application.via_2}</span>
                      </div>
                    </>
                  )}
                  <div className="hidden sm:block w-8 md:w-12 h-0.5 bg-indigo-300 mx-1"></div>
                  <div className="flex items-center gap-2 ml-5 sm:ml-0">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">B</div>
                    <span className="text-sm font-semibold text-gray-800">{application.destination_to}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="dash-card bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">Need Help?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-2xl mb-2 block">📞</span>
                  <h3 className="font-semibold text-sm text-blue-900">Contact Support</h3>
                  <p className="text-xs text-blue-700 mt-1">support@studx.in</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-2xl mb-2 block">❓</span>
                  <h3 className="font-semibold text-sm text-green-900">FAQs</h3>
                  <p className="text-xs text-green-700 mt-1">Common questions answered</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-2xl mb-2 block">📢</span>
                  <h3 className="font-semibold text-sm text-purple-900">Announcements</h3>
                  <p className="text-xs text-purple-700 mt-1">Latest updates & news</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
