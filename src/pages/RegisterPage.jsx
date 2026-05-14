import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

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
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
        if (error) { setError(error.message); setLoading(false) } else { setSuccess(true); setLoading(false) }
    }

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6 text-center">
                <div className="flex justify-center"><CheckCircle2 className="w-12 h-12 text-primary" /></div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Check your email</h2>
                    <p className="text-muted-foreground text-sm">We sent a confirmation link to <strong>{email}</strong>.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => onNavigate?.('login')}>Back to sign in</Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SafeBuddy</h1>
                    <p className="text-sm text-muted-foreground">Create your admin account</p>
                </div>
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Create account</CardTitle>
                        <CardDescription>Fill in your details to get started</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                        <CardContent className="space-y-4">
                            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full name</Label>
                                <Input id="fullName" type="text" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm password</Label>
                                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Creating account…' : 'Create account'}
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">
                                Already have an account?{' '}
                                <button type="button" className="font-medium text-foreground hover:underline underline-offset-4" onClick={() => onNavigate?.('login')}>Sign in</button>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
