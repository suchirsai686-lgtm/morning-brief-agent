import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Sun,
  Sparkles,
  Clock,
  Mail,
  Zap,
  CheckCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Briefings',
    desc: 'Amazon Bedrock Nova Lite generates a personalized morning brief tailored to your day.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Clock,
    title: 'Always-On Agent',
    desc: 'EventBridge Scheduler wakes up at 6 AM every day — so you don\'t have to think about it.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Mail,
    title: 'Email Delivery',
    desc: 'Your briefing lands in your inbox before you wake up, beautifully formatted.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Setup Once, Run Forever',
    desc: 'Enter your profile once. The agent runs automatically every morning.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
]

const sampleBrief = `**Good morning, Alex!** Today is Wednesday, July 16 — let's make it count. ☀️

**Today's Priorities**
1. Finish AWS challenge — your best focus time is early
2. Complete presentation — structure first, polish later
3. Exercise — schedule it or it won't happen

**Focus Blocks**
- 9:00–11:00 AM: Deep work (AWS challenge)
- 2:00–3:30 PM: Presentation draft
- 6:00 PM: Exercise

**Productivity Tip**
Finish your hardest task before checking any messages. Guard your morning.

**Motivation**
Every expert was once a beginner who refused to quit.`

export default function LandingPage() {
  const navigate = useNavigate()

  const hasProfile = !!localStorage.getItem('morning_brief_email')

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Morning Brief</span>
          </div>
          <div className="flex items-center gap-3">
            {hasProfile ? (
              <Button variant="gradient" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/setup')}>
                  Get Started
                </Button>
                <Button variant="gradient" size="sm" onClick={() => navigate('/setup')}>
                  Try Free
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center animate-fade-in">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
          <Sparkles className="h-4 w-4" />
          Powered by Amazon Bedrock · Nova Lite
        </div>

        <h1 className="mb-6 text-6xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-7xl">
          Your AI morning
          <br />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            briefing agent
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-500 leading-relaxed">
          Set up once. Every morning at 6 AM, an AI agent wakes up, analyzes your tasks,
          and delivers a personalized briefing to your inbox — before you do.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="gradient" size="xl" onClick={() => navigate('/setup')}>
            Start Your Morning Brief <ArrowRight className="h-5 w-5" />
          </Button>
          {hasProfile && (
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-slate-200 pt-12">
          {[
            { label: 'Daily briefings', value: '6:00 AM' },
            { label: 'Words or less', value: '300' },
            { label: 'Setup required', value: '2 min' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
          Everything you need, nothing you don't
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-1"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                  <Icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Sample Brief Preview */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl">
          <div className="rounded-[22px] bg-white p-8 md:p-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Morning Brief Agent</div>
                <div className="text-xs text-slate-400">Today's brief · Generated at 6:00 AM</div>
              </div>
              <div className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" /> Delivered
              </div>
            </div>
            <div className="brief-content prose max-w-none">
              {sampleBrief.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**'))
                  return (
                    <h2 key={i} className="text-lg font-semibold text-indigo-700 mt-5 mb-2">
                      {line.replace(/\*\*/g, '')}
                    </h2>
                  )
                if (line.startsWith('- '))
                  return (
                    <p key={i} className="ml-4 text-slate-600 text-sm">
                      • {line.slice(2)}
                    </p>
                  )
                if (/^\d\./.test(line))
                  return (
                    <p key={i} className="ml-4 text-slate-600 text-sm">
                      {line}
                    </p>
                  )
                return line ? (
                  <p key={i} className="text-slate-700">{line.replace(/\*\*/g, '')}</p>
                ) : (
                  <br key={i} />
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">How it works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: '01', icon: Calendar, title: 'Set up your profile', desc: 'Enter your name, email, timezone, city, and today\'s tasks. Takes 2 minutes.' },
            { step: '02', icon: Clock, title: 'Agent runs at 6 AM', desc: 'EventBridge triggers Lambda every morning at 6 AM. No action needed from you.' },
            { step: '03', icon: Mail, title: 'Briefing in your inbox', desc: 'Amazon Bedrock crafts your brief. SES delivers it to your inbox before you wake up.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="relative">
                <div className="mb-4 text-5xl font-black text-slate-100">{item.step}</div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to transform your mornings?</h2>
          <p className="mb-8 text-indigo-100">Setup takes 2 minutes. Then the agent handles everything.</p>
          <Button
            size="xl"
            className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
            onClick={() => navigate('/setup')}
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <p>Morning Brief Agent · Built with AWS Lambda, Bedrock, DynamoDB, SES & EventBridge</p>
      </footer>
    </div>
  )
}
