import { Route, Sparkles, Layers, PlayCircle } from 'lucide-react'
import Logo from '../common/Logo'

const symbols = [
  { s: '∑', top: '9%',  left: '10%', size: 'text-6xl', r: '-8deg', d: '0s' },
  { s: 'π', top: '20%', left: '72%', size: 'text-7xl', r: '10deg', d: '1.2s' },
  { s: '∫', top: '50%', left: '6%',  size: 'text-8xl', r: '6deg',  d: '2.1s' },
  { s: '√', top: '60%', left: '66%', size: 'text-6xl', r: '-6deg', d: '0.6s' },
  { s: '∞', top: '84%', left: '30%', size: 'text-7xl', r: '4deg',  d: '1.8s' },
]

const perks = [
  { icon: Route,      text: 'Quest maps that unlock as you learn' },
  { icon: PlayCircle, text: 'Video lessons with a real discussion' },
  { icon: Layers,     text: '7 difficulty levels, Beginner to Master' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 border-r border-space-500 bg-space-800/70">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-plasma-500/10 blur-3xl" />

        {symbols.map(({ s, top, left, size, r, d }) => (
          <span
            key={s}
            aria-hidden
            className={`absolute font-display ${size} text-plasma-400/15 select-none animate-float`}
            style={{ top, left, '--r': r, animationDelay: d }}
          >
            {s}
          </span>
        ))}

        <div className="relative"><Logo size="lg" /></div>

        <div className="relative max-w-md">
          <span className="badge-plasma mb-5"><Sparkles size={12} /> Learn math like a game</span>
          <h2 className="text-4xl font-semibold leading-tight text-chalk-50 mb-4">
            Every equation is a <span className="text-glow-plasma">quest</span> waiting to be solved.
          </h2>
          <p className="text-chalk-400 mb-8">
            Watch, practice and level up through a map of problems built for how you actually learn.
          </p>
          <ul className="space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-chalk-300">
                <span className="w-8 h-8 rounded-lg grid place-items-center bg-plasma-500/10 border border-plasma-500/20 text-plasma-300">
                  <Icon size={15} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative eq-block text-base">e^(iπ) + 1 = 0</div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="page-title mb-2">{title}</h1>
          <p className="text-chalk-400 mb-8">{subtitle}</p>
          {children}
          {footer && <div className="mt-8 text-sm text-chalk-400 text-center">{footer}</div>}
        </div>
      </main>
    </div>
  )
}