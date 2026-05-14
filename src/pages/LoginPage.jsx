import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck } from 'lucide-react'

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

        // Check if account is active
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

        // Logged in successfully — auth state change will redirect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            {/* Snackbar */}
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

            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SafeBuddy</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your admin dashboard</p>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to continue</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Signing in…' : 'Sign in'}
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">
                                Don't have an account?{' '}
                                <button type="button" className="font-medium text-foreground hover:underline underline-offset-4" onClick={() => onNavigate?.('register')}>Create one</button>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
