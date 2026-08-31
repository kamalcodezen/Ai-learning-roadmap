
'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminSkillHealth } from '@/src/lib/api/admin/skill-health';
import { authClient } from '@/src/lib/auth-client';
import {  } from 'lucide-react';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

export default function AdminSkillHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['adminSkillHealth', userId],
    queryFn: () => getAdminSkillHealth(userId!),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading data.</p>;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='border rounded-xl p-6 bg-card'>
          <h2 className='text-xl font-bold mb-4 text-green-500'>Strong Skills</h2>
          {data.strongSkills.length === 0 ? <p className='text-muted-foreground'>None</p> : data.strongSkills.map((s: { id: string; name: string; category: string; averageProficiency: number; activeLearners: number; averageScore: number }) => (
            <div key={s.name} className='flex justify-between py-2 border-b last:border-0'><span className='font-medium'>{s.name}</span><span>{s.averageScore}%</span></div>
          ))}
        </div>
        <div className='border rounded-xl p-6 bg-card'>
          <h2 className='text-xl font-bold mb-4 text-red-500'>Weak Skills (Learning Debt)</h2>
          {data.weakSkills.length === 0 ? <p className='text-muted-foreground'>None</p> : data.weakSkills.map((s: { id: string; name: string; category: string; averageProficiency: number; activeLearners: number; averageScore: number }) => (
            <div key={s.name} className='flex justify-between py-2 border-b last:border-0'><span className='font-medium'>{s.name}</span><span>{s.averageScore}%</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

