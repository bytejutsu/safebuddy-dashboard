export function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-background">
            <aside className="fixed inset-y-0 left-0 w-64 border-r bg-card p-6">
                <h1 className="text-xl font-bold">SafeBuddy Dashboard</h1>
                <nav className="mt-8 space-y-2">
                    <a href="#" className="block rounded px-3 py-2 hover:bg-accent">Users</a>
                    <a href="#" className="block rounded px-3 py-2 hover:bg-accent">Analytics</a>
                    <a href="#" className="block rounded px-3 py-2 hover:bg-accent">Settings</a>
                </nav>
            </aside>
            <main className="ml-64 p-8">{children}</main>
        </div>
    )
}