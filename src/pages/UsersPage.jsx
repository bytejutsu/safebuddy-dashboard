import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Users, ShieldCheck, ShieldOff, Activity } from 'lucide-react'

const palette = {
    purple: { bg: '#f5f3ff', accent: '#8b5cf6', text: '#5b21b6' },
    pink:   { bg: '#fdf2f8', accent: '#ec4899', text: '#9d174d' },
    green:  { bg: '#f0fdf4', accent: '#22c55e', text: '#14532d' },
    orange: { bg: '#fff7ed', accent: '#f97316', text: '#7c2d12' },
    red:    { bg: '#fef2f2', accent: '#ef4444', text: '#7f1d1d' },
    teal:   { bg: '#f0fdfa', accent: '#14b8a6', text: '#134e4a' },
}

function KpiCard({ title, value, sub, icon: Icon, color }) {
    const c = palette[color]
    return (
        <div style={{ background: c.bg, borderRadius: 16, padding: '20px 24px', border: `1.5px solid ${c.accent}22` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 8 }}>{title}</p>
                <div style={{ background: c.accent + '22', borderRadius: 8, padding: 6 }}>
                    <Icon size={16} color={c.accent} />
                </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.text }}>{value}</div>
            {sub && <p style={{ fontSize: 12, color: c.accent, marginTop: 4, fontWeight: 500 }}>{sub}</p>}
        </div>
    )
}

function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function Avatar({ name, avatarUrl, color }) {
    const c = palette[color]
    return (
        <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: avatarUrl ? 'transparent' : c.bg,
            border: `2px solid ${c.accent}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: c.accent, overflow: 'hidden', flexShrink: 0
        }}>
            {avatarUrl
                ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(name)
            }
        </div>
    )
}

const AVATAR_COLORS = ['purple', 'pink', 'teal', 'orange', 'green']

export function UsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [toggling, setToggling] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) console.error(error)
                else setUsers(data ?? [])
                setLoading(false)
            })
    }, [])

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const handleToggle = async (user) => {
        setToggling(user.id)
        const newStatus = !user.is_active

        const { error } = await supabase
            .from('profiles')
            .update({ is_active: newStatus })
            .eq('id', user.id)

        if (error) {
            showToast('Failed to update account status', 'error')
        } else {
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, is_active: newStatus } : u
            ))

            const userEmail = user.email

            if (!newStatus && userEmail) {
                const { error: emailError } = await supabase.auth.resetPasswordForEmail(userEmail, {
                    redirectTo: `${window.location.origin}/activate`,
                })
                if (emailError) {
                    showToast('Account deactivated but email failed to send', 'error')
                } else {
                    showToast(`Account deactivated. Reactivation email sent to ${userEmail}`)
                }
            } else {
                showToast('Account activated successfully')
            }
        }
        setToggling(null)
    }

    const filtered = users.filter((u) => {
        const q = search.toLowerCase()
        const matchesSearch = !q || (
            u.full_name?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q) ||
            u.id?.toLowerCase().includes(q)
        )
        const matchesFilter =
            filter === 'all'         ? true :
            filter === 'active'      ? u.is_active !== false :
            filter === 'deactivated' ? u.is_active === false :
            filter === 'verified'    ? u.phone_verified :
            filter === 'unverified'  ? !u.phone_verified :
            true

        return matchesSearch && matchesFilter
    })

    const totalUsers = users.length
    const verifiedUsers = users.filter(u => u.phone_verified).length
    const activeUsers = users.filter(u => u.is_active !== false).length
    const updatedThisWeek = users.filter(
        u => u.updated_at && new Date(u.updated_at) > new Date(Date.now() - 7 * 864e5)
    ).length

    return (
        <div style={{ fontFamily: 'inherit' }}>
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
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1f2937', margin: 0 }}>My Users</h2>
                <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Manage and monitor SafeBuddy user profiles</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <KpiCard title="Total Users" value={totalUsers} sub="registered accounts" icon={Users} color="purple" />
                <KpiCard title="Phone Verified" value={verifiedUsers} sub={`${totalUsers > 0 ? Math.round(verifiedUsers/totalUsers*100) : 0}% of total`} icon={ShieldCheck} color="teal" />
                <KpiCard title="Active Accounts" value={activeUsers} sub={`${totalUsers - activeUsers} deactivated`} icon={Activity} color="green" />
                <KpiCard title="Active This Week" value={updatedThisWeek} sub="recently updated" icon={ShieldOff} color="pink" />
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #f3f4f6', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: 0 }}>All Profiles</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                placeholder="Search by name or phone..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    paddingLeft: 32, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                                    border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13,
                                    outline: 'none', width: 220, color: '#374151'
                                }}
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{
                                padding: '8px 12px', border: '1.5px solid #e5e7eb',
                                borderRadius: 10, fontSize: 13, color: '#374151',
                                outline: 'none', cursor: 'pointer', background: 'white'
                            }}
                        >
                            <option value="all">All users</option>
                            <option value="active">Active only</option>
                            <option value="deactivated">Deactivated only</option>
                            <option value="verified">Phone verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading profiles…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <p style={{ color: '#6b7280', fontWeight: 600 }}>No users found</p>
                        <p style={{ color: '#9ca3af', fontSize: 13 }}>Try a different search term or filter</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                {['User', 'Phone', 'Verified', 'Account Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => {
                                const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
                                const isActive = u.is_active !== false
                                return (
                                    <tr key={u.id}
                                        style={{ borderTop: '1px solid #f3f4f6', opacity: isActive ? 1 : 0.6, transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Avatar name={u.full_name} avatarUrl={u.avatar_url} color={color} />
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: 0 }}>{u.full_name ?? 'Unnamed'}</p>
                                                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>{u.id.slice(0, 8)}…</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px', fontSize: 13, color: '#6b7280' }}>
                                            {u.phone ?? '—'}
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            {u.phone_verified ? (
                                                <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Verified</span>
                                            ) : (
                                                <span style={{ background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Unverified</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            {isActive ? (
                                                <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Active</span>
                                            ) : (
                                                <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Deactivated</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <button
                                                disabled={toggling === u.id}
                                                onClick={() => handleToggle(u)}
                                                style={{
                                                    padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                    cursor: toggling === u.id ? 'not-allowed' : 'pointer',
                                                    border: 'none',
                                                    background: isActive ? '#fef2f2' : '#f0fdf4',
                                                    color: isActive ? '#dc2626' : '#15803d',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {toggling === u.id ? '…' : isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}

                {(search || filter !== 'all') && filtered.length > 0 && (
                    <div style={{ padding: '12px 24px', borderTop: '1px solid #f3f4f6' }}>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Showing {filtered.length} of {totalUsers} users</p>
                    </div>
                )}
            </div>
        </div>
    )
}