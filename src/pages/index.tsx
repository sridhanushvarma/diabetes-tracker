import ThemeLayout from '@/components/ThemeLayout';
import Reveal from '@/components/Reveal';
import AnimatedCounter from '@/components/AnimatedCounter';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/contexts/ThemeContext';

// Illustration for Record Your Readings
const FormIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 180" className="w-full h-full">
    <rect x="30" y="10" width="240" height="160" rx="12" fill={isDark ? '#374151' : '#ffffff'} stroke={isDark ? '#4B5563' : '#E5E7EB'} strokeWidth="2"/>
    <rect x="50" y="25" width="100" height="12" rx="4" fill={isDark ? '#60a5fa' : '#3B82F6'}/>
    <rect x="50" y="50" width="200" height="28" rx="6" fill={isDark ? '#1F2937' : '#F3F4F6'} stroke={isDark ? '#4B5563' : '#D1D5DB'} strokeWidth="1"/>
    <rect x="58" y="60" width="60" height="8" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    <rect x="200" y="56" width="40" height="16" rx="4" fill={isDark ? '#4B5563' : '#E5E7EB'}/>
    <rect x="50" y="88" width="200" height="28" rx="6" fill={isDark ? '#1F2937' : '#F3F4F6'} stroke={isDark ? '#4B5563' : '#D1D5DB'} strokeWidth="1"/>
    <text x="58" y="107" fontSize="10" fill={isDark ? '#9CA3AF' : '#6B7280'}>120 mg/dL</text>
    <rect x="50" y="130" width="80" height="28" rx="6" fill="url(#formGradient)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
    </rect>
    <text x="70" y="148" fontSize="10" fill="#ffffff" fontWeight="500">Save</text>
    <defs>
      <linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>
);

// Illustration for Dashboard — animated line draw + pulsing points
const DashboardIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 180" className="w-full h-full">
    <rect x="20" y="10" width="260" height="160" rx="12" fill={isDark ? '#374151' : '#ffffff'} stroke={isDark ? '#4B5563' : '#E5E7EB'} strokeWidth="2"/>
    <rect x="35" y="25" width="70" height="40" rx="6" fill={isDark ? '#1E3A5F' : '#DBEAFE'}/>
    <text x="50" y="42" fontSize="8" fill={isDark ? '#93C5FD' : '#3B82F6'}>Average</text>
    <text x="50" y="56" fontSize="14" fill={isDark ? '#60a5fa' : '#2563EB'} fontWeight="bold">118</text>
    <rect x="115" y="25" width="70" height="40" rx="6" fill={isDark ? '#312E81' : '#EDE9FE'}/>
    <text x="130" y="42" fontSize="8" fill={isDark ? '#C4B5FD' : '#7C3AED'}>Highest</text>
    <text x="130" y="56" fontSize="14" fill={isDark ? '#a78bfa' : '#7C3AED'} fontWeight="bold">145</text>
    <rect x="195" y="25" width="70" height="40" rx="6" fill={isDark ? '#064E3B' : '#D1FAE5'}/>
    <text x="210" y="42" fontSize="8" fill={isDark ? '#6EE7B7' : '#059669'}>Lowest</text>
    <text x="210" y="56" fontSize="14" fill={isDark ? '#34d399' : '#059669'} fontWeight="bold">95</text>
    <rect x="35" y="75" width="230" height="85" rx="6" fill={isDark ? '#1F2937' : '#F9FAFB'}/>
    <line x1="45" y1="90" x2="255" y2="90" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="1"/>
    <line x1="45" y1="110" x2="255" y2="110" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="1"/>
    <line x1="45" y1="130" x2="255" y2="130" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="1"/>
    <polyline
      points="55,125 85,105 115,115 145,95 175,110 205,100 235,108 255,102"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'drawLine 2.4s ease-out forwards' }}
    />
    {[
      [55, 125], [85, 105], [115, 115], [145, 95], [175, 110], [205, 100], [235, 108],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="4" fill={i === 3 ? '#8B5CF6' : '#3B82F6'}>
        <animate attributeName="r" values="0;5;4" dur="0.4s" begin={`${0.3 * i + 0.4}s`} fill="freeze" />
      </circle>
    ))}
  </svg>
);

// Illustration for Reports
const ReportsIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 180" className="w-full h-full">
    <rect x="60" y="10" width="180" height="160" rx="8" fill={isDark ? '#374151' : '#ffffff'} stroke={isDark ? '#4B5563' : '#E5E7EB'} strokeWidth="2"/>
    <rect x="75" y="25" width="100" height="12" rx="4" fill={isDark ? '#60a5fa' : '#3B82F6'}/>
    <rect x="75" y="42" width="60" height="6" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>
    <rect x="75" y="60" width="150" height="18" rx="4" fill={isDark ? '#1F2937' : '#F3F4F6'}/>
    <rect x="80" y="66" width="30" height="6" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    <rect x="120" y="66" width="40" height="6" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    <rect x="175" y="66" width="40" height="6" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    {[86, 98, 110].map((y, i) => (
      <g key={y}>
        <rect x="80" y={y} width="25" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'} />
        <rect x="120" y={y} width="35" height="5" rx="2" fill={['#34d399', '#fbbf24', '#60a5fa'][i]}>
          <animate attributeName="width" values="0;35" dur="0.6s" begin={`${0.2 * i}s`} fill="freeze" />
        </rect>
        <rect x="175" y={y} width="40" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'} />
      </g>
    ))}
    <rect x="75" y="130" width="70" height="24" rx="6" fill="url(#reportGradient)"/>
    <text x="88" y="146" fontSize="9" fill="#ffffff" fontWeight="500">Export</text>
    <path d="M155 138 L155 148 M151 144 L155 148 L159 144" stroke={isDark ? '#60a5fa' : '#3B82F6'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="148" y="150" width="14" height="2" rx="1" fill={isDark ? '#60a5fa' : '#3B82F6'}/>
    <defs>
      <linearGradient id="reportGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10B981"/>
        <stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
  </svg>
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const features = [
    {
      title: 'Easy Data Entry',
      color: isDark ? 'text-blue-400' : 'text-blue-600',
      ring: 'from-primary-500/20 to-primary-500/0',
      desc: 'Record blood sugar levels and meals with a live, colour-coded status preview as you type.',
      path: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z',
    },
    {
      title: 'Long-term Storage',
      color: isDark ? 'text-purple-400' : 'text-purple-600',
      ring: 'from-accent-500/20 to-accent-500/0',
      desc: 'Securely store and access years of health data to track long-term progress and patterns.',
      path: 'M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 100 2h10a1 1 0 100-2H3z',
    },
    {
      title: 'Insightful Analytics',
      color: isDark ? 'text-emerald-400' : 'text-emerald-600',
      ring: 'from-tertiary-500/20 to-tertiary-500/0',
      desc: 'Time-in-range, estimated A1C, GMI, variability and trend insights — generated automatically.',
      path: 'M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z',
    },
  ];

  const steps = [
    {
      n: '1',
      title: 'Record Your Readings',
      desc: 'Enter glucose levels after meals along with what you ate. Each reading is instantly classified against your personal target band.',
      Illu: FormIllustration,
      reverse: false,
    },
    {
      n: '2',
      title: 'View Your Dashboard',
      desc: 'See recent readings, time-in-range, streaks and trends at a glance on a personalised, animated dashboard.',
      Illu: DashboardIllustration,
      reverse: true,
    },
    {
      n: '3',
      title: 'Generate Reports',
      desc: 'Export your data as CSV, JSON or a print-ready PDF to share with your healthcare provider during check-ups.',
      Illu: ReportsIllustration,
      reverse: false,
    },
  ];

  return (
    <ThemeLayout title="Home">
      <div className="max-w-5xl mx-auto relative overflow-hidden">
        {/* Floating ambient blobs */}
        <div className="blob bg-primary-400/30 w-72 h-72 -top-20 -left-24" />
        <div className="blob bg-accent-400/30 w-80 h-80 top-40 -right-28" style={{ animationDelay: '2s' }} />
        <div className="blob bg-tertiary-400/25 w-72 h-72 top-[40rem] left-10" style={{ animationDelay: '4s' }} />

        {/* HERO */}
        <section className="text-center py-16 md:py-24 relative">
          <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 ring-1 ring-inset border bg-white/60 dark:bg-white/5 backdrop-blur-sm border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-tertiary-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-500" />
            </span>
            Clinical-grade analytics, privately on your device
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text-animated">Track Your Diabetes</span>
            <br />
            <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>Journey, Intelligently</span>
          </h1>

          <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor blood sugar, understand your time-in-range, and surface the
            patterns that matter — all in one beautifully animated companion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <Link href={user ? '/dashboard' : '/auth'} className="btn-glow text-lg px-8 py-3.5 group">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/reports" className={`link-underline text-lg font-medium px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Explore Analytics
            </Link>
          </div>

          {/* Live stat band */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16 stagger">
            {[
              { v: 70, s: '%', l: 'Time-in-range target' },
              { v: 3, s: 'x', l: 'Daily reading slots' },
              { v: 5, s: 'yr', l: 'Long-term history' },
            ].map((x) => (
              <div key={x.l} className="card-aurora py-5 px-2">
                <p className="text-3xl md:text-4xl font-bold gradient-text-animated">
                  <AnimatedCounter value={x.v} suffix={x.s} />
                </p>
                <p className={`text-xs md:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{x.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16">
          <Reveal>
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Built for <span className="gradient-text-animated">real insight</span>
            </h2>
            <p className={`text-center mb-12 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Every feature is engineered to turn raw readings into something you can actually act on.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 120}>
                <div className="card-aurora hover-lift sheen h-full text-center perspective">
                  <div className={`relative mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${f.ring}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.ring} blur-xl`} />
                    <svg className={`relative w-9 h-9 ${f.color}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={f.path} clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{f.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16">
          <Reveal>
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              How It <span className="gradient-text-animated">Works</span>
            </h2>
          </Reveal>

          <div className="space-y-12">
            {steps.map(({ n, title, desc, Illu, reverse }, i) => (
              <Reveal key={n} delay={i * 80}>
                <div className={`flex flex-col md:flex-row items-center gap-6 ${reverse ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white font-bold text-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg animate-pulse-glow">
                      {n}
                    </div>
                    <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{desc}</p>
                  </div>
                  <div className={`md:w-1/2 p-6 rounded-2xl h-56 flex items-center justify-center card-aurora hover-lift`}>
                    <Illu isDark={isDark} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <Reveal>
          <section className="py-16">
            <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center bg-gradient-to-br from-primary-600 via-accent-600 to-tertiary-600 bg-[length:200%_auto] animate-gradient shadow-2xl">
              <div className="blob bg-white/20 w-64 h-64 -top-20 -right-10" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to take control of your numbers?
              </h2>
              <p className="text-white/85 max-w-xl mx-auto mb-8">
                Start logging in seconds. Your data stays private, your insights stay sharp.
              </p>
              <Link
                href={user ? '/dashboard' : '/auth'}
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                {user ? 'Open Dashboard' : 'Create Your Free Account'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </ThemeLayout>
  );
}
