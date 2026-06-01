import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, Mail } from 'lucide-react'

export function ForgotPasswordPage({ onNavigate }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sent, setSent] = useState(false)

    const handleReset = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:5173/safebuddy-dashboard/reset-password',
        })
        if (error) {
            setError(error.message)
        } else {
            setSent(true)
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
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Forgot Password</h2>
                    <p className="text-muted-foreground text-center">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {sent ? (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <AlertDescription>
                            ✅ Reset link sent! Check your inbox.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
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
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl h-12 text-base"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Sending…' : 'Send Reset Link'}
                        </Button>
                    </form>
                )}

                <p className="text-center text-sm">
                    <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 font-medium"
                        onClick={() => onNavigate?.('login')}
                    >
                        ← Back to Sign in
                    </button>
                </p>
            </div>
        </div>
    )
}