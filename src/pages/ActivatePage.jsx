import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ActivatePage({ onNavigate }) {
    const [status, setStatus] = useState('loading')

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const userId = params.get('userId')

        if (!userId) {
            setStatus('error')
            return
        }

        supabase
            .from('profiles')
            .update({ is_active: true })
            .eq('id', userId)
            .then(({ error }) => {
                if (error) setStatus('error')
                else setStatus('success')
            })
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">SafeBuddy</h1>

                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Activating your account…</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                        <h2 className="text-xl font-bold">Account Activated!</h2>
                        <p className="text-muted-foreground">Your account has been successfully reactivated. You can now log in.</p>
                        <Button className="w-full" onClick={() => onNavigate('login')}>Go to Login</Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h2 className="text-xl font-bold">Activation Failed</h2>
                        <p className="text-muted-foreground">Something went wrong. Please contact support.</p>
                        <Button variant="outline" className="w-full" onClick={() => onNavigate('login')}>Back to Login</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
