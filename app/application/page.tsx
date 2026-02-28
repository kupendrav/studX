'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import gsap from 'gsap'

export default function Application() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regno: '',
    college: '',
    address: '',
    destination_from: '',
    destination_to: '',
    via_1: '',
    via_2: '',
  })
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)
        setFormData(prev => ({ ...prev, email: user.email || '' }))
      } catch (error) {
        console.error('Failed to load user session', error)
        router.push('/login')
      }
    }
    checkUser()
  }, [router, supabase])

  useEffect(() => {
    if (user && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.app-card', { opacity: 0, y: 40, duration: 0.6, ease: 'power3.out' })
        gsap.from('.app-field', { opacity: 0, y: 20, duration: 0.4, stagger: 0.08, delay: 0.3, ease: 'power2.out' })
      }, pageRef)
      return () => ctx.revert()
    }
  }, [user])

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  if (!user) {
    console.error('No authenticated user')
    setLoading(false)
    router.push('/login')
    return
  }

  try {
    let photoUrl = ''

    // Upload photo to Supabase Storage
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // Upload with proper options
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload photo: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName)

      photoUrl = publicUrl
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      id: user.id,
      name: formData.name,
      regno: formData.regno,
      timestamp: Date.now()
    })

    // Insert application data
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          user_id: user.id,
          ...formData,
          photo_url: photoUrl,
          qr_code: qrData,
          application_status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to save application: ${error.message}`)
    }

    router.push(`/qr-scan?id=${data.id}`)
  } catch (error: unknown) {
    console.error('Submission error:', error)
    alert('Error submitting application: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setLoading(false)
  }
}

  return (
    <div ref={pageRef} className="min-h-screen py-6 md:py-12 px-4 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-3xl mx-auto">
        <div className="app-card bg-white rounded-2xl shadow-2xl p-5 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bus Pass Application
            </h1>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to apply for a student bus pass</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload */}
            <div className="app-field">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Photo <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border-2 border-gray-300 flex-shrink-0"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>
            </div>

            {/* Two-column grid for desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="app-field">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div className="app-field">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 text-sm"
                  required
                  readOnly
                />
              </div>

              {/* Registration Number */}
              <div className="app-field">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.regno}
                  onChange={(e) => setFormData({ ...formData, regno: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* College */}
              <div className="app-field">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="app-field">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                rows={3}
                required
              />
            </div>

            {/* Route section */}
            <div className="app-field bg-indigo-50 rounded-xl p-4 md:p-5">
              <h3 className="text-sm font-semibold text-indigo-700 mb-4">Route Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    From (Starting Point) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destination_from}
                    onChange={(e) => setFormData({ ...formData, destination_from: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    To (Destination) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destination_to}
                    onChange={(e) => setFormData({ ...formData, destination_to: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Via 1 (Optional)</label>
                  <input
                    type="text"
                    value={formData.via_1}
                    onChange={(e) => setFormData({ ...formData, via_1: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Via 2 (Optional)</label>
                  <input
                    type="text"
                    value={formData.via_2}
                    onChange={(e) => setFormData({ ...formData, via_2: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="app-field w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-lg font-semibold text-base md:text-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
