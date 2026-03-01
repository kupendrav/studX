'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  last_sign_in_at: string | null
  role: string
}

interface Application {
  id: string
  user_id: string
  name: string
  email: string
  regno: string
  college: string
  address: string
  destination_from: string
  destination_to: string
  via_1?: string
  via_2?: string
  photo_url?: string
  application_status: string
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isStaticHost, setIsStaticHost] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [activeTab, setActiveTab] = useState<'applications' | 'users'>('applications')

  const [users, setUsers] = useState<User[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const pageRef = useRef<HTMLDivElement>(null)

  // Check stored admin key
  useEffect(() => {
    const stored = sessionStorage.getItem('adminKey')
    if (stored) {
      setAdminKey(stored)
      setIsAuthenticated(true)
    }

    setIsStaticHost(window.location.hostname.endsWith('github.io'))
  }, [])

  const handleAdminLogin = async () => {
    if (isStaticHost) {
      setAuthError('Admin tools require a server runtime and are unavailable on GitHub Pages.')
      return
    }

    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: adminKey }),
      })
      const data = await res.json()
      if (data.authenticated) {
        sessionStorage.setItem('adminKey', adminKey)
        setIsAuthenticated(true)
      } else {
        setAuthError('Invalid admin key')
      }
    } catch {
      setAuthError('Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const adminHeaders = { 'Content-Type': 'application/json', 'x-admin-key': adminKey }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, appsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: adminHeaders }),
        fetch('/api/admin/applications', { headers: adminHeaders }),
      ])
      const usersData = await usersRes.json()
      const appsData = await appsRes.json()
      if (usersData.users) setUsers(usersData.users)
      if (appsData.applications) setApplications(appsData.applications)
    } catch {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (!loading && isAuthenticated && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.admin-card', { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease: 'power2.out' })
      }, pageRef)
      return () => ctx.revert()
    }
  }, [loading, isAuthenticated])

  const confirmEmail = async (userId: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users/confirm', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!data.error) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, email_confirmed_at: new Date().toISOString() } : u))
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to confirm user')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: adminHeaders,
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!data.error) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const updateApplicationStatus = async (appId: string, status: string) => {
    setActionLoading(appId)
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ applicationId: appId, status }),
      })
      const data = await res.json()
      if (!data.error) {
        setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, application_status: status } : a))
        if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, application_status: status })
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminKey')
    setIsAuthenticated(false)
    setAdminKey('')
  }

  // Filter logic
  const filteredApps = applications.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.regno.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filterStatus === 'all' || a.application_status === filterStatus
    return matchSearch && matchFilter
  })

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery)
    const matchFilter = filterStatus === 'all' ||
      (filterStatus === 'confirmed' && u.email_confirmed_at) ||
      (filterStatus === 'unconfirmed' && !u.email_confirmed_at)
    return matchSearch && matchFilter
  })

  const pendingCount = applications.filter((a) => a.application_status === 'pending').length
  const approvedCount = applications.filter((a) => a.application_status === 'approved').length

  // Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Access
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {isStaticHost
                ? 'Admin tools are disabled on GitHub Pages static hosting'
                : 'Enter admin secret key to continue'}
            </p>
          </div>
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{authError}</div>
          )}
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
            placeholder="Enter admin secret key"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
            disabled={isStaticHost}
          />
          <button
            onClick={handleAdminLogin}
            disabled={isStaticHost || authLoading || !adminKey}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {isStaticHost ? 'Unavailable on GitHub Pages' : authLoading ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen py-6 md:py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Manage applications and users</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="text-sm px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 transition font-medium">
              Refresh
            </button>
            <button onClick={handleLogout} className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition font-medium">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-card grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500">Total Applications</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500">Pending</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500">Approved</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500">Total Users</p>
            <p className="text-2xl md:text-3xl font-bold text-indigo-600">{users.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-card flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
          <button
            onClick={() => { setActiveTab('applications'); setFilterStatus('all'); setSearchQuery('') }}
            className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'applications' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => { setActiveTab('users'); setFilterStatus('all'); setSearchQuery('') }}
            className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="admin-card bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={activeTab === 'applications' ? 'Search by name, email, regno...' : 'Search by email or ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="all">All</option>
              {activeTab === 'applications' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="confirmed">Confirmed</option>
                  <option value="unconfirmed">Unconfirmed</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Application Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedApp.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedApp.photo_url} alt={selectedApp.name} className="w-24 h-24 object-cover rounded-xl mb-4 border-2 border-gray-200" />
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  ['Name', selectedApp.name],
                  ['Email', selectedApp.email],
                  ['Reg No', selectedApp.regno],
                  ['College', selectedApp.college],
                  ['Address', selectedApp.address],
                  ['From', selectedApp.destination_from],
                  ['To', selectedApp.destination_to],
                  ['Via 1', selectedApp.via_1 || '—'],
                  ['Via 2', selectedApp.via_2 || '—'],
                  ['Status', selectedApp.application_status.toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {selectedApp.application_status !== 'approved' && (
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                    disabled={actionLoading === selectedApp.id}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 text-sm"
                  >
                    {actionLoading === selectedApp.id ? '...' : 'Approve'}
                  </button>
                )}
                {selectedApp.application_status !== 'rejected' && (
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                    disabled={actionLoading === selectedApp.id}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 text-sm"
                  >
                    {actionLoading === selectedApp.id ? '...' : 'Reject'}
                  </button>
                )}
                {selectedApp.application_status !== 'pending' && (
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'pending')}
                    disabled={actionLoading === selectedApp.id}
                    className="flex-1 bg-yellow-500 text-white py-2.5 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 text-sm"
                  >
                    {actionLoading === selectedApp.id ? '...' : 'Set Pending'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'applications' ? (
          <div className="admin-card bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600">Student</th>
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600 hidden md:table-cell">College</th>
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600 hidden md:table-cell">Route</th>
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApps.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-500">No applications found</td></tr>
                  ) : filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          {app.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={app.photo_url} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm md:text-lg">👤</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{app.name}</p>
                            <p className="text-xs text-gray-400 truncate">{app.regno}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-sm text-gray-600 hidden md:table-cell">{app.college}</td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-sm text-gray-600 hidden md:table-cell">
                        {app.destination_from} → {app.destination_to}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          app.application_status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.application_status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.application_status === 'approved' ? 'bg-green-500' :
                            app.application_status === 'rejected' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></span>
                          {app.application_status.charAt(0).toUpperCase() + app.application_status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          {app.application_status !== 'approved' && (
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'approved')}
                              disabled={actionLoading === app.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition disabled:opacity-50"
                            >
                              {actionLoading === app.id ? '...' : 'Approve'}
                            </button>
                          )}
                          {app.application_status !== 'rejected' && (
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'rejected')}
                              disabled={actionLoading === app.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                            >
                              {actionLoading === app.id ? '...' : 'Reject'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-card bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600 hidden md:table-cell">Registered</th>
                    <th className="text-right py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-gray-500">No users found</td></tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <p className="font-medium text-sm text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}...</p>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        {user.email_confirmed_at ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Unconfirmed
                          </span>
                        )}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-sm text-gray-600 hidden md:table-cell">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="flex gap-2 justify-end">
                          {!user.email_confirmed_at && (
                            <button
                              onClick={() => confirmEmail(user.id)}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition disabled:opacity-50"
                            >
                              {actionLoading === user.id ? '...' : 'Confirm'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user.id, user.email || '')}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
