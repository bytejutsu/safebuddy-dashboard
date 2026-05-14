import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, User, Lock, LogOut } from 'lucide-react'

const palette = {
    blue:   { bg: '#eff6ff', accent: '#3b82f6', text: '#1e3a5f' },
    purple: { bg: '#f5f3ff', accent: '#8b5cf6', text: '#5b21b6' },
    red:    { bg: '#fef2f2', accent: '#ef4444', text: '#7f1d1d' },
}

function SectionCard({ title, description, icon: Icon, color, children }) {
    const c = palette[color]
    return (
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f3f4f6', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: c.bg, padding: '20px 24px', borderBottom: `1.5px solid ${c.accent}22`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: c.accent + '22', borderRadius: 10, padding: 8 }}>
                    <Icon size={18} color={c.accent} />
                </div>
                <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>{title}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{description}</p>
                </div>
            </div>
            <div style={{ padding: 24 }}>
                {children}
            </div>
        </div>
    )
}

function Field({ label, type, value, onChange, placeholder, disabled }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                    border: '1.5px solid #e5e7eb', outline: 'none', color: '#1f2937',
                    background: disabled ? '#f9fafb' : 'white', boxSizing: 'border-box',
                    opacity: disabled ? 0.6 : 1,
                }}
            />
        </div>
    )
}

function Btn({ children, onClick, loading, color = '#3b82f6', variant = 'solid' }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', border: variant === 'outline' ? `1.5px solid ${color}` : 'none',
                background: variant === 'outline' ? 'transparent' : color,
                color: variant === 'outline' ? color : 'white',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}
        >
            {loading && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {children}
        </button>
    )
}

export function SettingsPage() {
    const [user, setUser] = useState(null)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [profileLoading, setProfileLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [signOutLoading, setSignOutLoading] = useState(false)
    const [profileMsg, setProfileMsg] = useState(null)
    const [passwordMsg, setPasswordMsg] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser(data.user)
                setEmail(data.user.email ?? '')
                setFullName(data.user.user_metadata?.full_name ?? '')
            }
        })
    }, [])

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const handleProfileSave = async () => {
        setProfileLoading(true)
        setProfileMsg(null)
        const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })
        if (error) {
            setProfileMsg({ type: 'error', text: error.message })
        } else {
            showToast('Profile updated successfully!')
        }
        setProfileLoading(false)
    }

    const handlePasswordSave = async () => {
        setPasswordMsg(null)
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
            return
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
            return
        }
        setPasswordLoading(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
            setPasswordMsg({ type: 'error', text: error.message })
        } else {
            showToast('Password updated successfully!')
            setNewPassword('')
            setConfirmPassword('')
        }
        setPasswordLoading(false)
    }

    const handleSignOut = async () => {
        setSignOutLoading(true)
        await supabase.auth.signOut()
    }

    return (
        <div style={{ fontFamily: 'inherit', maxWidth: 600 }}>
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#ef4444' : '#1f2937',
                    color: 'white', padding: '12px 24px', borderRadius: 10,
                    fontSize: 14, fontWeight: 500, zIndex: 9999,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease'
                }}>
                    {toast.message}
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg) } }
            `}</style>

            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1f2937', margin: 0 }}>Settings</h2>
                <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Manage your admin account</p>
            </div>

            {/* Profile */}
            <SectionCard title="Profile" description="Update your display name" icon={User} color="blue">
                {profileMsg && (
                    <div style={{ background: profileMsg.type === 'error' ? '#fef2f2' : '#f0fdf4', color: profileMsg.type === 'error' ? '#dc2626' : '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                        {profileMsg.text}
                    </div>
                )}
                <Field label="Email" type="email" value={email} disabled placeholder="your@email.com" />
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: -12, marginBottom: 16 }}>Email cannot be changed here.</p>
                <Field label="Full Name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
                <Btn onClick={handleProfileSave} loading={profileLoading} color="#3b82f6">
                    Save changes
                </Btn>
            </SectionCard>

            {/* Password */}
            <SectionCard title="Change Password" description="Choose a new password for your account" icon={Lock} color="purple">
                {passwordMsg && (
                    <div style={{ background: passwordMsg.type === 'error' ? '#fef2f2' : '#f0fdf4', color: passwordMsg.type === 'error' ? '#dc2626' : '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                        {passwordMsg.text}
                    </div>
                )}
                <Field label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
                <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                <Btn onClick={handlePasswordSave} loading={passwordLoading} color="#8b5cf6">
                    Update password
                </Btn>
            </SectionCard>

            {/* Sign Out */}
            <SectionCard title="Sign Out" description="Sign out of your admin dashboard" icon={LogOut} color="red">
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>You will be redirected to the login page after signing out.</p>
                <Btn onClick={handleSignOut} loading={signOutLoading} color="#ef4444">
                    Sign out
                </Btn>
            </SectionCard>
        </div>
    )
}
