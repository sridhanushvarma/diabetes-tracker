import ThemeLayout from '@/components/ThemeLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/contexts/ThemeContext';

// Illustration for Record Your Readings
const FormIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 180" className="w-full h-full">
    {/* Form Card */}
    <rect x="30" y="10" width="240" height="160" rx="12" fill={isDark ? '#374151' : '#ffffff'} stroke={isDark ? '#4B5563' : '#E5E7EB'} strokeWidth="2"/>

    {/* Form Title */}
    <rect x="50" y="25" width="100" height="12" rx="4" fill={isDark ? '#60a5fa' : '#3B82F6'}/>

    {/* Date Input */}
    <rect x="50" y="50" width="200" height="28" rx="6" fill={isDark ? '#1F2937' : '#F3F4F6'} stroke={isDark ? '#4B5563' : '#D1D5DB'} strokeWidth="1"/>
    <rect x="58" y="60" width="60" height="8" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    <rect x="200" y="56" width="40" height="16" rx="4" fill={isDark ? '#4B5563' : '#E5E7EB'}/>

    {/* Glucose Input */}
    <rect x="50" y="88" width="200" height="28" rx="6" fill={isDark ? '#1F2937' : '#F3F4F6'} stroke={isDark ? '#4B5563' : '#D1D5DB'} strokeWidth="1"/>
    <text x="58" y="107" fontSize="10" fill={isDark ? '#9CA3AF' : '#6B7280'}>120 mg/dL</text>

    {/* Submit Button */}
    <rect x="50" y="130" width="80" height="28" rx="6" fill="url(#formGradient)"/>
    <text x="70" y="148" fontSize="10" fill="#ffffff" fontWeight="500">Save</text>

    <defs>
      <linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>
);

// Illustration for Dashboard
const DashboardIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 180" className="w-full h-full">
    {/* Dashboard Card */}
    <rect x="20" y="10" width="260" height="160" rx="12" fill={isDark ? '#374151' : '#ffffff'} stroke={isDark ? '#4B5563' : '#E5E7EB'} strokeWidth="2"/>

    {/* Stats Cards */}
    <rect x="35" y="25" width="70" height="40" rx="6" fill={isDark ? '#1E3A5F' : '#DBEAFE'}/>
    <text x="50" y="42" fontSize="8" fill={isDark ? '#93C5FD' : '#3B82F6'}>Average</text>
    <text x="50" y="56" fontSize="14" fill={isDark ? '#60a5fa' : '#2563EB'} fontWeight="bold">118</text>

    <rect x="115" y="25" width="70" height="40" rx="6" fill={isDark ? '#312E81' : '#EDE9FE'}/>
    <text x="130" y="42" fontSize="8" fill={isDark ? '#C4B5FD' : '#7C3AED'}>Highest</text>
    <text x="130" y="56" fontSize="14" fill={isDark ? '#a78bfa' : '#7C3AED'} fontWeight="bold">145</text>

    <rect x="195" y="25" width="70" height="40" rx="6" fill={isDark ? '#064E3B' : '#D1FAE5'}/>
    <text x="210" y="42" fontSize="8" fill={isDark ? '#6EE7B7' : '#059669'}>Lowest</text>
    <text x="210" y="56" fontSize="14" fill={isDark ? '#34d399' : '#059669'} fontWeight="bold">95</text>

    {/* Chart Area */}
    <rect x="35" y="75" width="230" height="85" rx="6" fill={isDark ? '#1F2937' : '#F9FAFB'}/>

    {/* Chart Grid Lines */}
    <line x1="45" y1="90" x2="255" y2="90" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="1"/>
    <line x1="45" y1="110" x2="255" y2="110" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="1"/>
    <line x1="45" y1="130" x2="255" y2="130" stroke={isDark ? '#374151' : '#E5E7EB'} strokeWidth="1"/>

    {/* Chart Line */}
    <polyline
      points="55,125 85,105 115,115 145,95 175,110 205,100 235,108 255,102"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Chart Dots */}
    <circle cx="55" cy="125" r="4" fill="#3B82F6"/>
    <circle cx="85" cy="105" r="4" fill="#3B82F6"/>
    <circle cx="115" cy="115" r="4" fill="#3B82F6"/>
    <circle cx="145" cy="95" r="4" fill="#8B5CF6"/>
    <circle cx="175" cy="110" r="4" fill="#3B82F6"/>
    <circle cx="205" cy="100" r="4" fill="#3B82F6"/>
    <circle cx="235" cy="108" r="4" fill="#3B82F6"/>
  </svg>
);

// Illustration for Reports
const ReportsIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 180" className="w-full h-full">
    {/* Document */}
    <rect x="60" y="10" width="180" height="160" rx="8" fill={isDark ? '#374151' : '#ffffff'} stroke={isDark ? '#4B5563' : '#E5E7EB'} strokeWidth="2"/>

    {/* Document Header */}
    <rect x="75" y="25" width="100" height="12" rx="4" fill={isDark ? '#60a5fa' : '#3B82F6'}/>
    <rect x="75" y="42" width="60" height="6" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>

    {/* Table Header */}
    <rect x="75" y="60" width="150" height="18" rx="4" fill={isDark ? '#1F2937' : '#F3F4F6'}/>
    <rect x="80" y="66" width="30" height="6" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    <rect x="120" y="66" width="40" height="6" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>
    <rect x="175" y="66" width="40" height="6" rx="2" fill={isDark ? '#6B7280' : '#9CA3AF'}/>

    {/* Table Rows */}
    <rect x="80" y="86" width="25" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>
    <rect x="120" y="86" width="35" height="5" rx="2" fill={isDark ? '#34d399' : '#10B981'}/>
    <rect x="175" y="86" width="40" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>

    <rect x="80" y="98" width="25" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>
    <rect x="120" y="98" width="35" height="5" rx="2" fill={isDark ? '#fbbf24' : '#F59E0B'}/>
    <rect x="175" y="98" width="40" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>

    <rect x="80" y="110" width="25" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>
    <rect x="120" y="110" width="35" height="5" rx="2" fill={isDark ? '#60a5fa' : '#3B82F6'}/>
    <rect x="175" y="110" width="40" height="5" rx="2" fill={isDark ? '#4B5563' : '#D1D5DB'}/>

    {/* Download Button */}
    <rect x="75" y="130" width="70" height="24" rx="6" fill="url(#reportGradient)"/>
    <text x="88" y="146" fontSize="9" fill="#ffffff" fontWeight="500">Export</text>

    {/* Download Icon */}
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

  return (
    <ThemeLayout title="Home">
      <div className="max-w-4xl mx-auto">
        <section className="text-center py-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-gray-100' : ''}`}>Track Your Diabetes Journey</h1>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor your blood sugar levels, track your diet, and gain insights for better health management.
          </p>

          {user ? (
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/auth" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
          )}
        </section>

        <section className="py-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-gray-100' : ''}`}>Key Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className={`mb-4 ${isDark ? 'text-blue-400' : 'text-primary-500'}`}>
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : ''}`}>Easy Data Entry</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Record your blood sugar levels and meals up to 3 times a day with our simple form.
              </p>
            </div>

            <div className="card text-center">
              <div className={`mb-4 ${isDark ? 'text-purple-400' : 'text-primary-500'}`}>
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 100 2h10a1 1 0 100-2H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : ''}`}>Long-term Storage</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Store and access your health data for up to 5 years to track long-term progress.
              </p>
            </div>

            <div className="card text-center">
              <div className={`mb-4 ${isDark ? 'text-emerald-400' : 'text-primary-500'}`}>
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : ''}`}>Insightful Analytics</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                View trends and averages with visual charts to better understand your health patterns.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDark ? 'text-gray-100' : ''}`}>How It Works</h2>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 p-4">
                <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-gray-100' : ''}`}>1. Record Your Readings</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Enter your blood sugar levels after meals, along with what you ate. Track up to 3 readings per day.
                </p>
              </div>
              <div className={`md:w-1/2 p-4 rounded-xl h-52 flex items-center justify-center ${
                isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}>
                <FormIllustration isDark={isDark} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className={`md:w-1/2 p-4 order-2 md:order-1 rounded-xl h-52 flex items-center justify-center ${
                isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}>
                <DashboardIllustration isDark={isDark} />
              </div>
              <div className="md:w-1/2 p-4 order-1 md:order-2">
                <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-gray-100' : ''}`}>2. View Your Dashboard</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  See your recent readings, weekly averages, and trends at a glance on your personalized dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 p-4">
                <h3 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-gray-100' : ''}`}>3. Generate Reports</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Export your data as CSV or PDF to share with your healthcare provider during check-ups.
                </p>
              </div>
              <div className={`md:w-1/2 p-4 rounded-xl h-52 flex items-center justify-center ${
                isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}>
                <ReportsIllustration isDark={isDark} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </ThemeLayout>
  );
}
