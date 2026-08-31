'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '@/src/lib/api/admin/analytics';
import { authClient } from '@/src/lib/auth-client';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalyticsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [days, setDays] = useState(30);

  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['adminAnalytics', userId, days], 
    queryFn: () => getAdminAnalytics(userId!, days), 
    enabled: !!userId 
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (isError || !data) return <p className='text-red-500'>Error loading analytics.</p>;

  const { overview, timeSeries } = data;

  return (
    <div className='space-y-6'>
      <div className="flex justify-end space-x-2 mb-4">
        {[7, 30, 90, 365].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-sm ${days === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {d} Days
          </button>
        ))}
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Total Users</p><p className='text-3xl font-bold'>{overview.users}</p></div>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Total Roadmaps</p><p className='text-3xl font-bold'>{overview.roadmaps}</p></div>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Total Projects</p><p className='text-3xl font-bold'>{overview.projects}</p></div>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Total Assessments</p><p className='text-3xl font-bold'>{overview.assessments}</p></div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='border rounded-xl p-6 bg-card'>
          <h3 className="font-semibold mb-4">Users Joined Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries?.users || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className='border rounded-xl p-6 bg-card'>
          <h3 className="font-semibold mb-4">Roadmaps Created Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries?.roadmaps || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='border rounded-xl p-6 bg-card'>
          <h3 className="font-semibold mb-4">Projects Submitted Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries?.projects || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ffc658" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='border rounded-xl p-6 bg-card'>
          <h3 className="font-semibold mb-4">Assessments Taken Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries?.assessments || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
