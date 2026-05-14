import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts'
import { Users, ShieldAlert, MessageSquare, Heart, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'

const palette = {
    pink:   { bg: '#fdf2f8', accent: '#ec4899', text: '#9d174d' },
    purple: { bg: '#f5f3ff', accent: '#8b5cf6', text: '#5b21b6' },
    yellow: { bg: '#fefce8', accent: '#eab308', text: '#854d0e' },
    teal:   { bg: '#f0fdfa', accent: '#14b8a6', text: '#134e4a' },
    red:    { bg: '#fef2f2', accent: '#ef4444', text: '#7f1d1d' },
    green:  { bg: '#f0fdf4', accent: '#22c55e', text: '#14532d' },
    orange: { bg: '#fff7ed', accent: '#f97316', text: '#7c2d12' },
    blue:   { bg: '#eff6ff', accent: '#3b82f6', text: '#1e3a5f' },
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

function GaugeCard({ title, value, max, color }) {
    const c = palette[color]
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    const data = [
        { name: title, value: pct, fill: c.accent },
        { name: 'rest', value: 100 - pct, fill: c.accent + '20' },
    ]
    return (
        <div style={{ background: c.bg, borderRadius: 16, padding: '20px 24px', border: `1.5px solid ${c.accent}22`, textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4 }}>{title}</p>
            <ResponsiveContainer width="100%" height={110}>
                <RadialBarChart cx="50%" cy="75%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={data}>
                    <RadialBar dataKey="value" cornerRadius={6} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.text, marginTop: -16 }}>{pct}%</div>
            <p style={{ fontSize: 12, color: c.accent, fontWeight: 500 }}>{value} / {max}</p>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label, accent }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: '#fff', border: `1.5px solid ${accent}44`, borderRadius: 10, padding: '8px 14px', fontSize: 13 }}>
                <p style={{ color: accent, fontWeight: 700 }}>{label}</p>
                <p style={{ color: '#374151' }}>{payload[0].value}</p>
            </div>
        )
    }
    return null
}

function SectionTitle({ children }) {
    return <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, marginTop: 8 }}>{children}</p>
}

export function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [topDangerous, setTopDangerous] = useState([])
    const [safetyBreakdown, setSafetyBreakdown] = useState([])
    const [mostActive, setMostActive] = useState([])
    const [leastActive, setLeastActive] = useState([])

    useEffect(() => {
        async function fetchAll() {
            const [
                { data: profiles },
                { data: alerts },
                { data: calls },
                { data: messages },
                { data: invitations },
                { data: contacts },
                { data: safetyData },
            ] = await Promise.all([
                supabase.from('profiles').select('id, full_name, phone_verified'),
                supabase.from('emergency_alerts').select('status, contact_response, sender_id'),
                supabase.from('calls').select('status, caller_id'),
                supabase.from('messages').select('is_read, sender_id'),
                supabase.from('invitations').select('status'),
                supabase.from('trusted_contacts').select('is_sharing'),
                supabase.from('safety_data').select('city, country, safety_level, crime_index').order('crime_index', { ascending: false }).limit(50),
            ])

            const totalAlerts = alerts?.length ?? 0
            const pendingAlerts = alerts?.filter(a => a.status === 'pending').length ?? 0
            const acknowledgedAlerts = alerts?.filter(a => a.status === 'acknowledged').length ?? 0
            const escalatedAlerts = alerts?.filter(a => a.status === 'escalated').length ?? 0

            setStats({
                totalUsers: profiles?.length ?? 0,
                verifiedUsers: profiles?.filter(p => p.phone_verified).length ?? 0,
                totalAlerts,
                pendingAlerts,
                acknowledgedAlerts,
                escalatedAlerts,
                notSafeCount: alerts?.filter(a => a.contact_response === 'not_safe').length ?? 0,
                safeResponseCount: alerts?.filter(a => a.contact_response === 'safe').length ?? 0,
                noResponseCount: alerts?.filter(a => !a.contact_response).length ?? 0,
                totalCalls: calls?.length ?? 0,
                totalMessages: messages?.length ?? 0,
                unreadMessages: messages?.filter(m => !m.is_read).length ?? 0,
                totalInvitations: invitations?.length ?? 0,
                acceptedInvitations: invitations?.filter(i => i.status === 'accepted').length ?? 0,
                totalContacts: contacts?.length ?? 0,
                sharingContacts: contacts?.filter(c => c.is_sharing).length ?? 0,
                totalCities: safetyData?.length ?? 0,
                safeCities: safetyData?.filter(s => s.safety_level?.toLowerCase().startsWith('safe')).length ?? 0,
                dangerousCities: safetyData?.filter(s => s.safety_level?.toLowerCase().startsWith('dangerous')).length ?? 0,
            })

            // User activity scoring
            const activityMap = {}
            profiles?.forEach(p => {
                activityMap[p.id] = { name: p.full_name ?? 'Unnamed', alerts: 0, messages: 0, calls: 0 }
            })
            alerts?.forEach(a => { if (activityMap[a.sender_id]) activityMap[a.sender_id].alerts++ })
            messages?.forEach(m => { if (activityMap[m.sender_id]) activityMap[m.sender_id].messages++ })
            calls?.forEach(c => { if (activityMap[c.caller_id]) activityMap[c.caller_id].calls++ })

            const scored = Object.values(activityMap)
                .map(u => ({ ...u, total: u.alerts + u.messages + u.calls }))
                .filter(u => u.name !== 'Unnamed')
                .sort((a, b) => b.total - a.total)

            setMostActive(scored.slice(0, 5))
            setLeastActive([...scored].sort((a, b) => a.total - b.total).slice(0, 5))

            setTopDangerous((safetyData ?? []).slice(0, 8).map(s => ({ name: s.city, value: s.crime_index })))
            const breakdown = {}
            ;(safetyData ?? []).forEach(s => {
                const lvl = s.safety_level?.split(' ')[0] ?? 'Unknown'
                breakdown[lvl] = (breakdown[lvl] ?? 0) + 1
            })
            setSafetyBreakdown(Object.entries(breakdown).map(([name, value]) => ({ name, value })))
            setLoading(false)
        }
        fetchAll()
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #ec4899', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )

    const userPieData = [
        { name: 'Verified', value: stats.verifiedUsers },
        { name: 'Unverified', value: stats.totalUsers - stats.verifiedUsers },
    ]
    const PIE_COLORS = ['#8b5cf6', '#f9a8d4']
    const SAFETY_COLORS = { Safe: '#22c55e', Moderate: '#eab308', Dangerous: '#ef4444', Info: '#3b82f6', Unknown: '#9ca3af' }
    const alertBarData = [
        { name: 'Pending', value: stats.pendingAlerts },
        { name: 'Acknowledged', value: stats.acknowledgedAlerts },
        { name: 'Escalated', value: stats.escalatedAlerts },
    ]
    const alertDescriptions = {
        Pending: 'Waiting for a response from a trusted contact',
        Acknowledged: 'A trusted contact has responded to the alert',
        Escalated: 'Alert was escalated to the next contact in line',
    }
    const commsBarData = [
        { name: 'Calls', value: stats.totalCalls },
        { name: 'Messages', value: stats.totalMessages },
        { name: 'Invitations', value: stats.totalInvitations },
        { name: 'Contacts', value: stats.totalContacts },
    ]
    const COMMS_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']
    const ACTIVITY_COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#eab308', '#f97316']

    return (
        <div style={{ fontFamily: 'inherit' }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1f2937', margin: 0 }}>Analytics</h2>
                <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>Live KPIs from your Supabase data</p>
            </div>

            <SectionTitle>Users</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard title="Total Users" value={stats.totalUsers} sub={`${stats.verifiedUsers} verified`} icon={Users} color="purple" />
                <KpiCard title="Emergency Alerts" value={stats.totalAlerts} sub={`${stats.pendingAlerts} pending`} icon={ShieldAlert} color="pink" />
                <KpiCard title="Total Messages" value={stats.totalMessages} sub={`${stats.unreadMessages} unread`} icon={MessageSquare} color="yellow" />
                <KpiCard title="Trusted Contacts" value={stats.totalContacts} sub={`${stats.sharingContacts} sharing`} icon={Heart} color="teal" />
            </div>

            <SectionTitle>Contact Response</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard title="Declared Not Safe" value={stats.notSafeCount} sub="contact flagged user as unsafe" icon={AlertTriangle} color="red" />
                <KpiCard title="Declared Safe" value={stats.safeResponseCount} sub="contact confirmed user is safe" icon={CheckCircle} color="green" />
                <KpiCard title="No Response Yet" value={stats.noResponseCount} sub="waiting for contact to respond" icon={ShieldAlert} color="yellow" />
            </div>

            <SectionTitle>Rates</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                <GaugeCard title="Phone Verification" value={stats.verifiedUsers} max={stats.totalUsers} color="purple" />
                <GaugeCard title="Alert Response Rate" value={stats.acknowledgedAlerts} max={stats.totalAlerts} color="pink" />
                <GaugeCard title="Invite Acceptance" value={stats.acceptedInvitations} max={stats.totalInvitations} color="yellow" />
                <GaugeCard title="Location Sharing" value={stats.sharingContacts} max={stats.totalContacts} color="teal" />
            </div>

            <SectionTitle>User Activity</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: palette.purple.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.purple.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.purple.text, marginBottom: 4 }}>Most Active Users</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Based on alerts, messages and calls</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {mostActive.map((u, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: ACTIVITY_COLORS[i] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ACTIVITY_COLORS[i] }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{u.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: ACTIVITY_COLORS[i] }}>{u.total} actions</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>🚨 {u.alerts} alerts</span>
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>💬 {u.messages} msgs</span>
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>📞 {u.calls} calls</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: palette.orange.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.orange.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.orange.text, marginBottom: 4 }}>Least Active Users</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Users with lowest engagement</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {leastActive.map((u, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: palette.orange.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: palette.orange.accent }}>{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{u.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: palette.orange.accent }}>{u.total} actions</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>🚨 {u.alerts} alerts</span>
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>💬 {u.messages} msgs</span>
                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>📞 {u.calls} calls</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <SectionTitle>Safety Data</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard title="Total Cities" value={stats.totalCities} sub="in safety database" icon={MapPin} color="purple" />
                <KpiCard title="Safe Cities" value={stats.safeCities} sub="low risk areas" icon={CheckCircle} color="green" />
                <KpiCard title="Dangerous Cities" value={stats.dangerousCities} sub="high crime index" icon={AlertTriangle} color="red" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: palette.red.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.red.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.red.text, marginBottom: 8 }}>Top 8 Highest Crime Index Cities</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topDangerous} barSize={28} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip content={<CustomTooltip accent={palette.red.accent} />} />
                            <Bar dataKey="value" fill={palette.red.accent} radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ background: palette.green.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.green.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.green.text, marginBottom: 8 }}>Safety Level Breakdown</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={safetyBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                                {safetyBreakdown.map((d, i) => <Cell key={i} fill={SAFETY_COLORS[d.name] ?? '#9ca3af'} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                        {safetyBreakdown.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4b5563' }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: SAFETY_COLORS[d.name] ?? '#9ca3af' }} />
                                {d.name}: {d.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <SectionTitle>Communication & Activity</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ background: palette.purple.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.purple.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.purple.text, marginBottom: 8 }}>User Verification</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={userPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                {userPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
                        {userPieData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4b5563' }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i] }} />
                                {d.name}: {d.value}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: palette.pink.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.pink.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.pink.text, marginBottom: 8 }}>Alert Breakdown</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={alertBarData} barSize={32}>
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip accent={palette.pink.accent} />} />
                            <Bar dataKey="value" fill={palette.pink.accent} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10 }}>
                        {alertBarData.map((d) => (
                            <div key={d.name} style={{ textAlign: 'center', maxWidth: 90 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: palette.pink.accent, margin: 0 }}>{d.name}</p>
                                <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0', lineHeight: 1.3 }}>{alertDescriptions[d.name]}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: palette.yellow.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${palette.yellow.accent}22` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: palette.yellow.text, marginBottom: 8 }}>Platform Activity</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={commsBarData} barSize={28}>
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip accent={palette.yellow.accent} />} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {commsBarData.map((_, i) => <Cell key={i} fill={COMMS_COLORS[i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
