import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, ShieldCheck, Mail, Lock } from 'lucide-react'

export function LoginPage({ onNavigate }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(null), 5000)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('id', data.user.id)
            .single()

        if (profile?.is_active === false) {
            await supabase.auth.signOut()
            setLoading(false)
            showToast('Your account has been deactivated. Please check your email to reactivate it.')
            return
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit' }}>
            {/* Left side */}
            <div style={{
                flex: 1, background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 48, color: 'white'
            }}>
                <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <ShieldCheck size={40} color="white" />
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, textAlign: 'center' }}>SafeBuddy</h1>
                <p style={{ fontSize: 16, opacity: 0.8, marginTop: 12, textAlign: 'center', maxWidth: 280 }}>
                    Your trusted safety companion. Keep your loved ones safe.
                </p>
                <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {['Real-time emergency alerts', 'Trusted contacts network', 'Location sharing'].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
                            <span style={{ fontSize: 14, opacity: 0.9 }}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faff', padding: 48 }}>
                <div style={{ width: '100%', maxWidth: 380 }}>
                    {toast && (
                        <div style={{
                            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                            background: '#1f2937', color: 'white', padding: '14px 24px',
                            borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 9999,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.25)', maxWidth: 420, textAlign: 'center',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            {toast}
                        </div>
                    )}
                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>Welcome back</h2>
                    <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 32 }}>Sign in to your admin dashboard</p>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required
                                    style={{ width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required
                                    style={{ width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                marginTop: 8, opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 24 }}>
                        Don't have an account?{' '}
                        <button onClick={() => onNavigate('register')} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
