import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2 } from 'lucide-react'

export function RegisterPage({ onNavigate }) {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)
        if (password !== confirmPassword) { setError('Passwords do not match.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName } }
        })
        if (error) { setError(error.message); setLoading(false) }
        else { setSuccess(true); setLoading(false) }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit' }}>
            {/* Left side */}
            <div style={{
                flex: 1, background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 48, color: 'white'
            }}>
                <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <ShieldCheck size={40} color="white" />
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, textAlign: 'center' }}>SafeBuddy</h1>
                <p style={{ fontSize: 16, opacity: 0.8, marginTop: 12, textAlign: 'center', maxWidth: 280 }}>
                    Join the SafeBuddy admin team and keep users safe.
                </p>
                <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {['Manage user accounts', 'Monitor emergency alerts', 'View analytics & insights'].map((f, i) => (
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
                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle2 size={56} color="#22c55e" style={{ marginBottom: 16 }} />
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1f2937' }}>Check your email!</h2>
                            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
                                We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account.
                            </p>
                            <button
                                onClick={() => onNavigate('login')}
                                style={{ marginTop: 24, padding: '12px 32px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                            >
                                Back to Sign in
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>Create account</h2>
                            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 32 }}>Fill in your details to get started</p>

                            {error && (
                                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'Full Name', type: 'text', value: fullName, onChange: e => setFullName(e.target.value), placeholder: 'Jane Smith', icon: User },
                                    { label: 'Email', type: 'email', value: email, onChange: e => setEmail(e.target.value), placeholder: 'you@example.com', icon: Mail },
                                    { label: 'Password', type: 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: 'Min. 6 characters', icon: Lock },
                                    { label: 'Confirm Password', type: 'password', value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), placeholder: '••••••••', icon: Lock },
                                ].map(({ label, type, value, onChange, placeholder, icon: Icon }) => (
                                    <div key={label}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>{label}</label>
                                        <div style={{ position: 'relative' }}>
                                            <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                            <input
                                                type={type} value={value} onChange={onChange}
                                                placeholder={placeholder} required
                                                style={{ width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'white' }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="submit" disabled={loading}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                                        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                                        color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        marginTop: 8, opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
                                    {loading ? 'Creating account…' : 'Create account'}
                                </button>
                                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            </form>

                            <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 24 }}>
                                Already have an account?{' '}
                                <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                                    Sign in
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
