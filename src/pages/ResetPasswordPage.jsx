import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, Check, X } from 'lucide-react'

export function ResetPasswordPage({ onNavigate }) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(false)
    const [ready, setReady] = useState(false)

    const conditions = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(password) },
        { label: 'One number', met: /[0-9]/.test(password) },
        { label: 'One special character (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
    ]

    const allMet = conditions.every((c) => c.met)

    const getStrength = () => {
        const met = conditions.filter((c) => c.met).length
        if (met <= 1) return { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/5' }
        if (met === 2) return { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-500', width: 'w-2/5' }
        if (met === 3) return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500', width: 'w-3/5' }
        if (met === 4) return { label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500', width: 'w-4/5' }
        return { label: 'Very Strong', color: 'bg-green-500', text: 'text-green-500', width: 'w-full' }
    }

    const strength = getStrength()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') setReady(true)
        })
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true)
        })
        const timeout = setTimeout(() => {
            setError('Reset link is invalid or has expired. Please request a new one.')
        }, 5000)
        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    const handleReset = async (e) => {
        e.preventDefault()
        if (!allMet) { setError('Please meet all password requirements.'); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.updateUser({ password })
        if (error) {
            setError(error.message)
        } else {
            setDone(true)
            setTimeout(() => {
                window.history.pushState({}, '', '/')
                onNavigate?.('login')
            }, 2000)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Set New Password</h2>
                    <p className="text-muted-foreground text-center">Enter your new password below.</p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {done ? (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <AlertDescription>✅ Password updated! Redirecting to login…</AlertDescription>
                    </Alert>
                ) : !ready ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <p className="text-sm">Verifying your reset link…</p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-blue-500 font-medium">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 bg-slate-50 border-slate-200 rounded-xl h-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {password.length > 0 && (
                                <div className="space-y-1">
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                    </div>
                                    <p className={`text-xs font-medium ${strength.text}`}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}

                            {/* Conditions checklist */}
                            {password.length > 0 && (
                                <ul className="space-y-1 mt-2">
                                    {conditions.map((c) => (
                                        <li key={c.label} className={`flex items-center gap-2 text-xs ${c.met ? 'text-green-600' : 'text-slate-400'}`}>
                                            {c.met
                                                ? <Check className="w-3.5 h-3.5 text-green-500" />
                                                : <X className="w-3.5 h-3.5 text-slate-300" />
                                            }
                                            {c.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-blue-500 font-medium">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                <Input
                                    id="confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 bg-slate-50 border-slate-200 rounded-xl h-12"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowConfirm((v) => !v)}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirm.length > 0 && (
                                <p className={`text-xs font-medium ${password === confirm ? 'text-green-600' : 'text-red-500'}`}>
                                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl h-12 text-base"
                            disabled={loading || !allMet || password !== confirm}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Updating…' : 'Update Password'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}