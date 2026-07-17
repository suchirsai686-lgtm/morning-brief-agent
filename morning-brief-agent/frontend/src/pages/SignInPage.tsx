import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Sun, Mail, ArrowRight, Loader2 } from 'lucide-react'

/**
 * SignInPage — for returning users who have already set up a profile.
 * They enter their email to load their profile from DynamoDB.
 */
export default function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('morning_brief_email')
    if (stored) navigate('/dashboard')
  }, [navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.getProfile(email.trim().toLowerCase())
      localStorage.setItem('morning_brief_email', email.trim().toLowerCase())
      navigate('/dashboard')
    } catch {
      toast({
        title: 'Profile not found',
        description: 'No account with that email. Please set up your profile first.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
            <Sun className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your email to access your briefings</p>
        </div>

        <Card className="border-0 glass-card shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Use the email you registered with</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">
                  <Mail className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                  Email Address
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Access Dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                New here?{' '}
                <button
                  onClick={() => navigate('/setup')}
                  className="text-indigo-500 hover:underline font-medium"
                >
                  Set up your profile
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
