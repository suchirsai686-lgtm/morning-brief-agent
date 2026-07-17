import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { api } from '@/api'
import type { UserProfile } from '@/types'
import {
  Sun,
  Zap,
  Settings,
  Clock,
  Mail,
  Calendar,
  ListTodo,
  RefreshCw,
  Loader2,
  CheckCircle,
  ChevronRight,
  Sparkles,
  MapPin,
} from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="skeleton mb-3 h-4 w-24 rounded" />
      <div className="skeleton mb-2 h-6 w-48 rounded" />
      <div className="skeleton h-4 w-32 rounded" />
    </div>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function getNextRunTime() {
  const nextRun = new Date()
  // Next occurrence of 00:00 UTC (6 AM UTC = 6:00 AM UTC, adjust cron as needed)
  nextRun.setUTCDate(nextRun.getUTCDate() + 1)
  nextRun.setUTCHours(0, 0, 0, 0)
  return nextRun.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const email = localStorage.getItem('morning_brief_email') || ''
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [brief, setBrief] = useState<string>('')
  const [generatedAt, setGeneratedAt] = useState<string>('')

  const loadProfile = useCallback(async () => {
    if (!email) {
      navigate('/setup')
      return
    }
    try {
      const data = await api.getProfile(email)
      setProfile(data)
      if (data.lastBrief) setBrief(data.lastBrief)
      if (data.lastGenerated) setGeneratedAt(data.lastGenerated)
    } catch {
      toast({ title: 'Could not load profile', description: 'Please check your setup.', variant: 'destructive' })
      navigate('/setup')
    } finally {
      setLoading(false)
    }
  }, [email, navigate])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleGenerate = async () => {
    if (!email) return
    setGenerating(true)
    try {
      const result = await api.generateBrief(email, false)
      setBrief(result.brief)
      setGeneratedAt(result.generatedAt)
      setProfile((prev) => prev ? { ...prev, lastBrief: result.brief, lastGenerated: result.generatedAt } : prev)
      toast({ title: '✨ Brief generated!', description: 'Your morning brief is ready.', variant: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate brief'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSendEmail = async () => {
    if (!profile || !brief) return
    setSendingEmail(true)
    try {
      await api.sendEmail(profile, brief)
      toast({ title: '📧 Email sent!', description: `Brief delivered to ${profile.email}`, variant: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send email'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSendingEmail(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh p-6">
        <div className="mx-auto max-w-5xl">
          <div className="skeleton mb-8 h-16 w-64 rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="mt-6">
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Topbar */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/60 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Morning Brief</div>
              <div className="text-xs text-slate-400">{today}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Settings</span>
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1">
                {generating ? 'Generating...' : 'Generate Now'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6 animate-fade-in">
        {/* Welcome */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {profile?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Your AI agent is active and monitoring your tasks.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Next Run */}
          <Card className="border-0 glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                  <Clock className="h-5 w-5 text-indigo-500" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Next Run</span>
              </div>
              <div className="text-lg font-bold text-slate-900">6:00 AM UTC</div>
              <div className="text-xs text-slate-400 mt-1">{getNextRunTime()}</div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-0 glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Agent Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                <div className="text-lg font-bold text-slate-900">Active</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Runs daily at 6 AM</div>
            </CardContent>
          </Card>

          {/* City */}
          <Card className="border-0 glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{profile?.city || '—'}</div>
              <div className="text-xs text-slate-400 mt-1">{profile?.timezone}</div>
            </CardContent>
          </Card>

          {/* Last Generated */}
          <Card className="border-0 glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Brief</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {generatedAt ? formatDate(generatedAt) : 'Not yet generated'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {generatedAt ? 'Brief on record' : 'Click Generate Now'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Brief Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 glass-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-base">Today's Brief</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {brief && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className="text-xs"
                      >
                        {sendingEmail ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                        {sendingEmail ? 'Sending...' : 'Email me'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={generating}
                      className="text-xs"
                    >
                      {generating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      {generating ? 'Generating...' : 'Regenerate'}
                    </Button>
                  </div>
                </div>
                {generatedAt && (
                  <CardDescription className="text-xs">
                    Generated {formatDate(generatedAt)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {generating ? (
                  <div className="space-y-3 py-4">
                    <div className="flex items-center gap-3 text-sm text-indigo-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Amazon Bedrock Nova Lite is crafting your brief…</span>
                    </div>
                    {[80, 60, 90, 50, 70].map((w, i) => (
                      <div key={i} className={`skeleton h-4 rounded`} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : brief ? (
                  <div className="brief-content max-h-[500px] overflow-y-auto pr-1">
                    <ReactMarkdown>{brief}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                      <Sparkles className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-700">No brief yet</h3>
                    <p className="mb-6 text-sm text-slate-400 max-w-xs">
                      Click Generate Now to create your first AI-powered morning brief.
                    </p>
                    <Button variant="gradient" size="sm" onClick={handleGenerate}>
                      <Zap className="h-4 w-4" /> Generate My Brief
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tasks */}
            <Card className="border-0 glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-slate-500" />
                    <CardTitle className="text-base">Today's Tasks</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => navigate('/settings')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  {profile?.tasks?.length ?? 0} tasks loaded
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {profile?.tasks?.length ? (
                  profile.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
                    >
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-600">
                        {i + 1}
                      </div>
                      <span className="text-slate-700 leading-snug">{task}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-slate-400">
                    No tasks yet.{' '}
                    <button
                      className="text-indigo-500 hover:underline"
                      onClick={() => navigate('/settings')}
                    >
                      Add tasks in Settings
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule info */}
            <Card className="border-0 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Scheduler Active</span>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  EventBridge triggers your agent every morning at{' '}
                  <strong>6:00 AM UTC</strong>. Your briefing is generated and
                  emailed automatically.
                </p>
                <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-mono text-indigo-100">
                  cron(0 0 * * ? *)
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
