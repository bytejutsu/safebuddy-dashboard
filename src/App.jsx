import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from './components/DashboardLayout'
import { UsersPage } from './pages/UsersPage'
import { SettingsPage } from './pages/SettingsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ActivatePage } from './pages/ActivatePage'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [authPage, setAuthPage] = useState('login')
  const [dashPage, setDashPage] = useState('users')

  const isActivatePage = window.location.pathname.includes('activate') ||
    window.location.search.includes('userId')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isActivatePage) {
    return <ActivatePage onNavigate={(page) => {
      window.history.pushState({}, '', '/')
      setAuthPage(page)
    }} />
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    if (authPage === 'register') return <RegisterPage onNavigate={setAuthPage} />
    return <LoginPage onNavigate={setAuthPage} />
  }

  return (
    <DashboardLayout page={dashPage} onNavigate={setDashPage}>
      {dashPage === 'users' && <UsersPage />}
      {dashPage === 'analytics' && <AnalyticsPage />}
      {dashPage === 'settings' && <SettingsPage />}
    </DashboardLayout>
  )
}
