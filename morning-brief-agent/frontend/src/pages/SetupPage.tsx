import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { api } from '@/api'
import {
  Sun,
  User,
  Mail,
  Globe,
  MapPin,
  Clock,
  ListTodo,
  ArrowRight,
  Loader2,
  CheckCircle,
} from 'lucide-react'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'UTC',
]

interface FormState {
  name: string
  email: string
  timezone: string
  city: string
  wake_time: string
  tasks: string
}

const STEPS = [
  { id: 1, title: 'About You', desc: 'Let\'s get to know you' },
  { id: 2, title: 'Your Day', desc: 'What do you have going on?' },
]

export default function SetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    city: '',
    wake_time: '06:00',
    tasks: '',
  })

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const canAdvance = () => {
    if (step === 1) {
      return form.name.trim() && form.email.trim() && form.city.trim()
    }
    return true
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const tasks = form.tasks
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)

      await api.saveProfile({
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        timezone: form.timezone,
        city: form.city.trim(),
        wake_time: form.wake_time,
        tasks,
      })

      localStorage.setItem('morning_brief_email', form.email.trim().toLowerCase())
      localStorage.setItem('morning_brief_name', form.name.trim())

      toast({ title: '🎉 Profile saved!', description: 'Your Morning Brief Agent is ready.', variant: 'success' })
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
            <Sun className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your Morning Brief</h1>
          <p className="mt-1 text-sm text-slate-500">Just 2 minutes. Then the agent runs forever.</p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step > s.id
                    ? 'bg-emerald-500 text-white'
                    : step === s.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === s.id ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-0 glass-card">
          <CardHeader className="pb-4">
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={set('name')}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={set('email')}
                  />
                  <p className="text-xs text-slate-400">
                    Your briefing will be delivered here every morning
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    value={form.city}
                    onChange={set('city')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">
                      <Globe className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                      Timezone
                    </Label>
                    <select
                      id="timezone"
                      value={form.timezone}
                      onChange={set('timezone')}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wake_time">
                      <Clock className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                      Wake-up Time
                    </Label>
                    <Input
                      id="wake_time"
                      type="time"
                      value={form.wake_time}
                      onChange={set('wake_time')}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="gradient"
                  disabled={!canAdvance()}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tasks">
                    <ListTodo className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                    Today's Tasks
                  </Label>
                  <Textarea
                    id="tasks"
                    placeholder={`Finish the quarterly report\nCall with design team at 2pm\nExercise 30 minutes\nReview pull requests`}
                    value={form.tasks}
                    onChange={set('tasks')}
                    rows={6}
                    className="text-sm"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400">
                    Enter one task per line. The AI will prioritize and schedule them for you.
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
                  <p className="font-medium mb-1">You're almost done! 🎉</p>
                  <p className="text-xs text-indigo-600 leading-relaxed">
                    After saving, your agent will run at 6 AM every day and deliver your brief to{' '}
                    <strong>{form.email}</strong>. You can update tasks anytime in Settings.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={saving}
                  >
                    Back
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        Launch Agent <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">
          Your data is stored in DynamoDB · Briefings powered by Amazon Bedrock
        </p>
      </div>
    </div>
  )
}
