import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, Mail, Lock } from 'lucide-react'

export function LoginPage({ onNavigate }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex-col items-center justify-center p-12 text-white">
                <div className="flex flex-col items-center gap-6 max-w-sm text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">SafeBuddy</h1>
                    <p className="text-white/80 text-lg">
                        Welcome back to the SafeBuddy admin dashboard.
                    </p>
                    <ul className="mt-4 space-y-3 text-left w-full">
                        {[
                            'Manage user accounts',
                            'Monitor emergency alerts',
                            'View analytics & insights',
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-white/90">
                                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className="font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                                onClick={() => onNavigate?.('register')}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-blue-500 font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-12"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-blue-500 font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-blue-500 hover:text-blue-700 transition-colors font-medium"
                                    onClick={() => onNavigate?.('forgot-password')}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl h-12 text-base"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                            By signing in you agree to the terms and conditions.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}