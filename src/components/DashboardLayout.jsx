export function DashboardLayout({ children, page, onNavigate }) {
    const links = [
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'analytics', label: 'Analytics', icon: '📊' },
        { key: 'settings', label: 'Settings', icon: '⚙️' },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8faff' }}>
            <aside style={{
                position: 'fixed', inset: '0 auto 0 0', width: 220,
                background: 'linear-gradient(180deg, #e0f2fe 0%, #bfdbfe 100%)',
                borderRight: '1.5px solid #bae6fd',
                padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 8,
            }}>
                {/* Logo */}
                <div style={{ marginBottom: 32, paddingLeft: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 18 }}>🛡️</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 15, fontWeight: 800, color: '#0c4a6e', margin: 0 }}>SafeBuddy</p>
                            <p style={{ fontSize: 11, color: '#7dd3fc', margin: 0 }}>Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {links.map((link) => {
                        const isActive = page === link.key
                        return (
                            <button
                                key={link.key}
                                onClick={() => onNavigate(link.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', borderRadius: 12, border: 'none',
                                    cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600,
                                    transition: 'all 0.2s',
                                    background: isActive ? '#0ea5e9' : 'transparent',
                                    color: isActive ? 'white' : '#0369a1',
                                    boxShadow: isActive ? '0 4px 12px #0ea5e944' : 'none',
                                }}
                            >
                                <span style={{ fontSize: 16 }}>{link.icon}</span>
                                {link.label}
                            </button>
                        )
                    })}
                </nav>

                {/* Bottom */}
                <div style={{ marginTop: 'auto', padding: '12px 14px', borderRadius: 12, background: '#bae6fd55' }}>
                    <p style={{ fontSize: 11, color: '#0369a1', margin: 0, fontWeight: 500 }}>SafeBuddy v1.0</p>
                    <p style={{ fontSize: 10, color: '#7dd3fc', margin: 0 }}>Admin Panel</p>
                </div>
            </aside>

            <main style={{ marginLeft: 220, padding: 32, flex: 1, minHeight: '100vh' }}>
                {children}
            </main>
        </div>
    )
}
