'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlarmClock,
  ArrowRight,
  Check,
  ChevronRight,
  CircleStop,
  FileText,
  Gauge,
  HeartPulse,
  Menu,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  TimerReset,
  Trash2,
  X,
} from 'lucide-react'

type ToolId = 'overview' | 'bmi' | 'focus' | 'stopwatch' | 'notes'

type Note = { id: number; title: string; body: string; updated: string }

const toolMeta: Record<ToolId, { label: string; icon: typeof Gauge }> = {
  overview: { label: 'Overview', icon: Sparkles },
  bmi: { label: 'BMI check', icon: HeartPulse },
  focus: { label: 'Focus timer', icon: AlarmClock },
  stopwatch: { label: 'Stopwatch', icon: CircleStop },
  notes: { label: 'Notes', icon: FileText },
}

const starterNotes: Note[] = [
  { id: 1, title: 'A gentle start', body: 'Choose one small thing. Make it easy to begin, then let momentum do the rest.', updated: 'Today' },
  { id: 2, title: 'Ideas to revisit', body: 'A quiet list for thoughts that do not need your attention right now.', updated: 'Yesterday' },
]

function formatTime(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0')
  const seconds = (value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <div className="grid size-5 grid-cols-2 gap-0.5">
          <span className="rounded-tl-md bg-primary-foreground/90" />
          <span className="rounded-tr-md bg-primary-foreground/60" />
          <span className="rounded-bl-md bg-primary-foreground/60" />
          <span className="rounded-br-md bg-primary-foreground/90" />
        </div>
      </div>
      <div>
        <p className="font-serif text-xl leading-none tracking-tight">Fair</p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Small tools, well made</p>
      </div>
    </div>
  )
}

function ToolCard({ id, title, description, icon: Icon, onOpen, children }: { id: ToolId; title: string; description: string; icon: typeof Gauge; onOpen: (id: ToolId) => void; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[0_14px_40px_-28px_hsl(var(--foreground)/.32)] sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="size-5" /></div>
          <div><h2 className="font-serif text-xl tracking-tight">{title}</h2><p className="mt-1 max-w-xs text-sm leading-5 text-muted-foreground">{description}</p></div>
        </div>
        <button aria-label={`Open ${title}`} onClick={() => onOpen(id)} className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><ArrowRight className="size-4" /></button>
      </div>
      {children}
    </section>
  )
}

export default function Page() {
  const [activeTool, setActiveTool] = useState<ToolId>('overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('68')
  const [bmi, setBmi] = useState<number | null>(null)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [focusRunning, setFocusRunning] = useState(false)
  const [stopwatch, setStopwatch] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [notes, setNotes] = useState<Note[]>(starterNotes)
  const [selectedNote, setSelectedNote] = useState<number | null>(null)

  useEffect(() => {
    if (!focusRunning) return
    const timer = window.setInterval(() => setFocusSeconds((current) => current > 0 ? current - 1 : 25 * 60), 1000)
    return () => window.clearInterval(timer)
  }, [focusRunning])

  useEffect(() => {
    if (!stopwatchRunning) return
    const timer = window.setInterval(() => setStopwatch((current) => current + 1), 1000)
    return () => window.clearInterval(timer)
  }, [stopwatchRunning])

  useEffect(() => {
    const saved = window.localStorage.getItem('fair-notes')
    if (saved) setNotes(JSON.parse(saved))
  }, [])

  useEffect(() => { window.localStorage.setItem('fair-notes', JSON.stringify(notes)) }, [notes])

  const bmiLabel = useMemo(() => bmi === null ? 'Ready when you are' : bmi < 18.5 ? 'Below the usual range' : bmi < 25 ? 'Within the usual range' : bmi < 30 ? 'Above the usual range' : 'Higher than the usual range', [bmi])
  const selected = notes.find((note) => note.id === selectedNote)

  function calculateBmi() {
    const meters = Number(height) / 100
    const value = Number(weight) / (meters * meters)
    setBmi(Number.isFinite(value) ? Number(value.toFixed(1)) : null)
  }

  function addNote() {
    const note = { id: Date.now(), title: 'Untitled note', body: '', updated: 'Just now' }
    setNotes((current) => [note, ...current])
    setSelectedNote(note.id)
    setActiveTool('notes')
  }

  function updateSelected(field: 'title' | 'body', value: string) {
    setNotes((current) => current.map((note) => note.id === selectedNote ? { ...note, [field]: value, updated: 'Just now' } : note))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className={`fixed inset-y-0 z-20 flex w-72 flex-col border-r border-border/70 bg-background p-6 transition-[left] lg:sticky lg:left-0 lg:top-0 lg:h-screen ${mobileMenu ? 'left-0' : 'left-[-18rem]'}`}>
          <div className="flex items-center justify-between"><Logo /><button className="rounded-full p-2 lg:hidden" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X className="size-5" /></button></div>
          <nav className="mt-14 flex flex-col gap-2" aria-label="Tools">
            {(Object.keys(toolMeta) as ToolId[]).map((id) => { const { label, icon: Icon } = toolMeta[id]; return <button key={id} onClick={() => { setActiveTool(id); setMobileMenu(false) }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${activeTool === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}><Icon className="size-4" />{label}{id === 'overview' && <span className="ml-auto text-xs opacity-60">⌘ 1</span>}</button> })}
          </nav>
          <div className="mt-auto rounded-3xl bg-accent p-5"><p className="font-serif text-lg leading-tight">Make room for what matters.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Four simple tools to help you check in, focus, move, and remember.</p></div>
          <p className="mt-6 text-xs text-muted-foreground">Fair · Free forever</p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-12"><button className="rounded-full p-2 lg:hidden" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu className="size-5" /></button><div className="lg:hidden"><Logo /></div><div className="hidden text-sm text-muted-foreground lg:block">Tuesday, August 10</div><div className="flex items-center gap-2"><button onClick={addNote} className="flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"><Plus className="size-3.5" /> New note</button><button className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Settings"><Settings2 className="size-4" /></button></div></header>

          <div className="px-5 pb-12 pt-8 sm:px-8 sm:pt-12 lg:px-12">
            <div className="mb-10 max-w-2xl"><p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span className="size-1.5 rounded-full bg-primary" />Your calm command center</p><h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl">A little more clarity,<br /><em className="text-primary">one tool at a time.</em></h1><p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">Fair brings your everyday essentials into one quiet, thoughtful space. No accounts. No noise. Just useful.</p></div>

            {activeTool === 'overview' && <div className="grid gap-5 lg:grid-cols-2">
              <ToolCard id="bmi" title="BMI check" description="A quick snapshot of your body mass index." icon={HeartPulse} onOpen={setActiveTool}><div className="flex items-end justify-between gap-4"><div><p className="font-serif text-5xl tracking-tight">{bmi ?? '—'}</p><p className="mt-2 text-xs text-muted-foreground">{bmiLabel}</p></div><button onClick={() => setActiveTool('bmi')} className="flex items-center gap-1 text-xs font-semibold text-primary">Check yours <ChevronRight className="size-3" /></button></div></ToolCard>
              <ToolCard id="focus" title="Focus timer" description="A gentle 25-minute container for deep work." icon={AlarmClock} onOpen={setActiveTool}><div className="flex items-center justify-between gap-4"><div><p className="font-serif text-5xl tracking-tight tabular-nums">{formatTime(focusSeconds)}</p><p className="mt-2 text-xs text-muted-foreground">{focusRunning ? 'In progress' : 'Ready to focus'}</p></div><button onClick={() => setFocusRunning(!focusRunning)} className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-105" aria-label={focusRunning ? 'Pause timer' : 'Start timer'}>{focusRunning ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}</button></div></ToolCard>
              <ToolCard id="stopwatch" title="Stopwatch" description="Keep track of a moment, a lap, or a little progress." icon={CircleStop} onOpen={setActiveTool}><div className="flex items-center justify-between gap-4"><div><p className="font-serif text-5xl tracking-tight tabular-nums">{formatTime(stopwatch)}</p><p className="mt-2 text-xs text-muted-foreground">{stopwatchRunning ? 'Counting up' : 'Standing by'}</p></div><button onClick={() => setStopwatchRunning(!stopwatchRunning)} className="flex size-12 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition hover:bg-accent" aria-label={stopwatchRunning ? 'Pause stopwatch' : 'Start stopwatch'}>{stopwatchRunning ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}</button></div></ToolCard>
              <ToolCard id="notes" title="Notes" description="A soft landing place for thoughts and reminders." icon={FileText} onOpen={setActiveTool}><div className="flex items-center justify-between"><div><p className="font-serif text-5xl tracking-tight">{notes.length}</p><p className="mt-2 text-xs text-muted-foreground">Notes kept close</p></div><button onClick={() => setActiveTool('notes')} className="flex items-center gap-1 text-xs font-semibold text-primary">View notes <ChevronRight className="size-3" /></button></div></ToolCard>
            </div>}

            {activeTool === 'bmi' && <div className="max-w-2xl rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-8"><div className="mb-8 flex items-start justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Health snapshot</p><h2 className="font-serif text-3xl tracking-tight">BMI calculator</h2><p className="mt-2 text-sm text-muted-foreground">Enter your details for a general estimate. This is not medical advice.</p></div><button onClick={() => setActiveTool('overview')} className="rounded-full p-2 hover:bg-secondary" aria-label="Close BMI calculator"><X className="size-4" /></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-medium">Height <span className="flex items-center gap-2 rounded-xl border border-input bg-background px-3"><input className="min-w-0 flex-1 bg-transparent py-3 outline-none" value={height} onChange={(e) => setHeight(e.target.value)} type="number" min="1" /><span className="text-xs text-muted-foreground">cm</span></span></label><label className="flex flex-col gap-2 text-sm font-medium">Weight <span className="flex items-center gap-2 rounded-xl border border-input bg-background px-3"><input className="min-w-0 flex-1 bg-transparent py-3 outline-none" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" min="1" /><span className="text-xs text-muted-foreground">kg</span></span></label></div><button onClick={calculateBmi} className="mt-5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Calculate BMI</button>{bmi !== null && <div className="mt-8 rounded-2xl bg-accent p-5"><p className="text-xs font-medium text-muted-foreground">Your result</p><p className="mt-1 font-serif text-5xl">{bmi}</p><p className="mt-2 text-sm text-muted-foreground">{bmiLabel}</p></div>}</div>}

            {activeTool === 'focus' && <div className="max-w-2xl rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Deep work</p><h2 className="font-serif text-3xl tracking-tight">Focus timer</h2></div><button onClick={() => setActiveTool('overview')} className="rounded-full p-2 hover:bg-secondary" aria-label="Close focus timer"><X className="size-4" /></button></div><div className="py-16 text-center"><p className="font-serif text-8xl tracking-tighter tabular-nums">{formatTime(focusSeconds)}</p><p className="mt-3 text-sm text-muted-foreground">{focusRunning ? 'Stay with it. You are doing well.' : 'Twenty-five minutes, just for you.'}</p><div className="mt-8 flex justify-center gap-3"><button onClick={() => setFocusRunning(!focusRunning)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{focusRunning ? <Pause className="size-4" /> : <Play className="size-4" />}{focusRunning ? 'Pause' : 'Start focus'}</button><button onClick={() => { setFocusRunning(false); setFocusSeconds(25 * 60) }} className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold"><RotateCcw className="size-4" /> Reset</button></div></div></div>}

            {activeTool === 'stopwatch' && <div className="max-w-2xl rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Count it up</p><h2 className="font-serif text-3xl tracking-tight">Stopwatch</h2></div><button onClick={() => setActiveTool('overview')} className="rounded-full p-2 hover:bg-secondary" aria-label="Close stopwatch"><X className="size-4" /></button></div><div className="py-16 text-center"><p className="font-serif text-8xl tracking-tighter tabular-nums">{formatTime(stopwatch)}</p><p className="mt-3 text-sm text-muted-foreground">{stopwatchRunning ? 'Counting every second.' : 'Ready when you are.'}</p><div className="mt-8 flex justify-center gap-3"><button onClick={() => setStopwatchRunning(!stopwatchRunning)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{stopwatchRunning ? <Pause className="size-4" /> : <Play className="size-4" />}{stopwatchRunning ? 'Pause' : 'Start'}</button><button onClick={() => { setStopwatchRunning(false); setStopwatch(0) }} className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold"><RotateCcw className="size-4" /> Reset</button></div></div></div>}

            {activeTool === 'notes' && <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><div className="rounded-[1.75rem] border border-border/70 bg-card p-4"><div className="mb-4 flex items-center justify-between px-2"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your thoughts</p><h2 className="font-serif text-2xl">Notes</h2></div><button onClick={addNote} className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Add note"><Plus className="size-4" /></button></div><div className="flex flex-col gap-2">{notes.map((note) => <button key={note.id} onClick={() => setSelectedNote(note.id)} className={`rounded-2xl p-4 text-left transition ${selectedNote === note.id ? 'bg-accent' : 'hover:bg-secondary'}`}><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{note.title || 'Untitled note'}</p><span className="shrink-0 text-[11px] text-muted-foreground">{note.updated}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{note.body || 'Start writing...'}</p></button>)}</div></div><div className="min-h-[380px] rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-8">{selected ? <div className="flex h-full flex-col"><div className="flex items-start justify-between gap-4"><input value={selected.title} onChange={(e) => updateSelected('title', e.target.value)} className="min-w-0 flex-1 bg-transparent font-serif text-3xl tracking-tight outline-none" aria-label="Note title" /><button onClick={() => { setNotes((current) => current.filter((note) => note.id !== selected.id)); setSelectedNote(null) }} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete note"><Trash2 className="size-4" /></button></div><textarea value={selected.body} onChange={(e) => updateSelected('body', e.target.value)} placeholder="Let the thought out..." className="mt-6 min-h-64 flex-1 resize-none bg-transparent text-sm leading-7 outline-none" aria-label="Note body" /><div className="flex items-center gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground"><Check className="size-3.5 text-primary" /> Saved privately on this device</div></div> : <div className="flex h-full flex-col items-center justify-center text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-secondary"><FileText className="size-5 text-primary" /></div><p className="mt-4 font-serif text-xl">Choose a note to begin</p><p className="mt-2 text-sm text-muted-foreground">Or create a fresh thought with the plus button.</p></div>}</div></div>}
          </div>
        </div>
      </div>
    </main>
  )
}
