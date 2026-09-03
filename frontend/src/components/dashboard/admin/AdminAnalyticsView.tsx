'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '@/src/lib/api/admin/analytics';
import { authClient } from '@/src/lib/auth-client';
import { useTheme } from 'next-themes';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';
import AdminGlowCard from './AdminGlowCard';
import { NumberTicker } from '@/src/registry/magicui/number-ticker';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LINKS = {
  users: '/dashboard/admin/users',
  roadmaps: '/dashboard/admin/roadmaps',
  projects: '/dashboard/admin/projects',
  assessments: '/dashboard/admin/assessments',
};

export default function AdminAnalyticsView() {
  const { data: session } = authClient.useSession();
  const { theme } = useTheme();
  const userId = session?.user?.id;
  const [days, setDays] = useState(30);

  const dark = theme === 'dark';
  const primary = dark ? '#B978FF' : '#9F54F7';
  const secondary = dark ? '#A855F7' : '#8523F5';
  const gridStroke = 'color-mix(in srgb, var(--color-foreground) 40%, transparent)';
  const tickColor = dark ? '#a8a8a8' : '#6b6b6b';

  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['adminAnalytics', userId, days], 
    queryFn: () => getAdminAnalytics(userId!, days), 
    enabled: !!userId 
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (isError || !data) return <p className='text-red-500'>Error loading analytics.</p>;

  const { overview, timeSeries } = data;

  const stats = [
    { label: 'Total Users', value: overview.users, href: LINKS.users },
    { label: 'Total Roadmaps', value: overview.roadmaps, href: LINKS.roadmaps },
    { label: 'Total Projects', value: overview.projects, href: LINKS.projects },
    { label: 'Total Assessments', value: overview.assessments, href: LINKS.assessments },
  ];

  const charts = [
    { id: 'users', title: 'Users Joined Over Time', data: timeSeries?.users || [], stroke: primary },
    { id: 'roadmaps', title: 'Roadmaps Created Over Time', data: timeSeries?.roadmaps || [], stroke: secondary },
    { id: 'projects', title: 'Projects Submitted Over Time', data: timeSeries?.projects || [], stroke: dark ? '#7de3c0' : '#10b981' },
    { id: 'assessments', title: 'Assessments Taken Over Time', data: timeSeries?.assessments || [], stroke: dark ? '#ffc27a' : '#f59e0b' },
  ];

  return (
    <div className='space-y-6'>
      <div className="flex justify-end space-x-2 mb-4">
        {[7, 30, 90, 365].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-sm ${days === d ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {d} Days
          </button>
        ))}
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {stats.map((s) => (
          <AdminGlowCard key={s.label} href={s.href}>
            <p className='text-sm text-muted-foreground'>{s.label}</p>
            <p className='mt-2 text-3xl font-bold text-[var(--color-secondary)]'>
              <NumberTicker value={s.value} />
            </p>
          </AdminGlowCard>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {charts.map((c, i) => (
          <AdminGlowCard
            key={c.title}
            corner={i % 2 === 0 ? 'top-right' : 'bottom-left'}
          >
            <h3 className="font-sans text-xl font-semibold text-foreground tracking-tight mb-4">{c.title}</h3>
            {!c.data || c.data.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                No data
              </div>
            ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={c.data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={`color${c.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.stroke} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="date" stroke={gridStroke} tick={{ fontSize: 12, fill: tickColor }} tickLine={false} />
                  <YAxis stroke={gridStroke} tick={{ fontSize: 12, fill: tickColor }} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: dark ? '#1a1a1a' : '#ffffff',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      color: 'var(--color-text-primary)',
                    }}
                    labelStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={c.stroke}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#color${c.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            )}
          </AdminGlowCard>
        ))}
      </div>
    </div>
  );
}
