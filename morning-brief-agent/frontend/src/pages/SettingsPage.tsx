import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { api } from '@/api'
import type { UserProfile } from '@/types'
import {
  Sun,
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Globe,
  MapPin,
  Clock,
  ListTodo,
  LogOut,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Honolulu', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Amsterdam', 'Asia/Dubai', 'Asia/Kolkata',
  'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland', 'UTC',
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const email = localStorage.getItem('morning_brief_email') || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const [form, setForm] = useState<Partial<UserProfile> & { tasksText: string }>({
    name: '',
    email: '',
    timezone: 'UTC',
    city: '',
    wake_time: '06:00',
    tasks: [],
    tasksText: '',
  })

  const loadProfile = useCallback(async () => {
    if (!email) {
      navigate('/setup')
      return
    }
    try {
      const data = await api.getProfile(email)
      setForm({
        ...data,
        tasksText: (data.tasks || []).join('\n'),
      })
    } catch {
      toast({ title: 'Error loading profile', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [email, navigate])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const tasks = (form.tasksText || '')
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)

      const updated: UserProfile = {
        email: form.email!,
        name: form.name!,
        timezone: form.timezone!,
        city: form.city!,
        wake_time: form.wake_time!,
        tasks,
        lastBrief: form.lastBrief,
        lastGenerated: form.lastGenerated,
      }

      await api.saveProfile(updated)
      setForm((prev) => ({ ...prev, tasks }))
      toast({ title: '✅ Settings saved', description: 'Your profile has been updated.', variant: 'success' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('morning_brief_email')
    localStorage.removeItem('morning_brief_name')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Topbar */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/60 px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Sun className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Settings</span>
            </div>
          </div>
          <Button variant="gradient" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Update your profile and task list.</p>
        </div>

        {/* Profile */}
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              Personal Info
            </CardTitle>
            <CardDescription>Your name and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="s-name">
                  <User className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                  Full Name
                </Label>
                <Input
                  id="s-name"
                  value={form.name || ''}
                  onChange={set('name')}
                  placeholder="Alex Johnson"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-email">
                  <Mail className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                  Email Address
                </Label>
                <Input
                  id="s-email"
                  type="email"
                  value={form.email || ''}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-city">
                  <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                  City
                </Label>
                <Input
                  id="s-city"
                  value={form.city || ''}
                  onChange={set('city')}
                  placeholder="San Francisco"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-wake">
                  <Clock className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                  Wake-up Time
                </Label>
                <Input
                  id="s-wake"
                  type="time"
                  value={form.wake_time || '06:00'}
                  onChange={set('wake_time')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-tz">
                <Globe className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                Timezone
              </Label>
              <select
                id="s-tz"
                value={form.timezone || 'UTC'}
                onChange={set('timezone')}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-slate-400" />
              Today's Tasks
            </CardTitle>
            <CardDescription>
              One task per line. Update these daily for the best briefings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="s-tasks"
              value={form.tasksText || ''}
              onChange={set('tasksText')}
              rows={8}
              placeholder={`Finish quarterly report\nTeam standup at 10am\nReview pull requests\nExercise 30 minutes`}
              className="text-sm font-mono"
            />
            <p className="mt-2 text-xs text-slate-400">
              {(form.tasksText || '').split('\n').filter(Boolean).length} tasks
            </p>
          </CardContent>
        </Card>

        {/* Scheduler Info */}
        <Card className="border-0 glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Scheduler Configuration
            </CardTitle>
            <CardDescription>EventBridge Scheduler settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Schedule expression</span>
                <code className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                  cron(0 0 * * ? *)
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Fires at</span>
                <span className="font-medium text-slate-700">6:00 AM UTC daily</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Lambda target</span>
                <code className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                  morning-brief-scheduled
                </code>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              To change the schedule time, update the <code>ScheduleExpression</code> in{' '}
              <code>template.yaml</code> and redeploy with <code>sam deploy</code>.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-red-100 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showLogoutConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Sign out of this account</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    You'll need your email to sign back in.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">
                  Are you sure? Your data remains in DynamoDB.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    <Trash2 className="h-4 w-4" /> Confirm Sign Out
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
