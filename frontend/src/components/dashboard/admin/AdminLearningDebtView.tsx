
'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminLearningDebt } from '@/src/lib/api/admin/learning-debt';
import { authClient } from '@/src/lib/auth-client';
import {  } from 'lucide-react';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

export default function AdminLearningDebtView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['adminLearningDebt', userId],
    queryFn: () => getAdminLearningDebt(userId!),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading data.</p>;

  return (
    <div className='rounded-xl border bg-card overflow-hidden'>
      <table className='w-full text-left text-sm'>
        <thead className='bg-muted/50 text-muted-foreground border-b'>
          <tr>
            <th className='px-6 py-4 font-medium'>Skill</th>
            <th className='px-6 py-4 font-medium'>Learner</th>
            <th className='px-6 py-4 font-medium'>Knowledge Score</th>
            <th className='px-6 py-4 font-medium'>Practice Score</th>
          </tr>
        </thead>
        <tbody className='divide-y'>
          {data.debtRecords.length === 0 ? (
            <tr><td colSpan={4} className='p-6 text-center text-muted-foreground'>No learning debt found.</td></tr>
          ) : data.debtRecords.map((r: { id: string; user: { name: string; email: string }; topic: string; debtScore: number; skillName: string; knowledgeScore: number; practiceScore: number }) => (
            <tr key={r.id}>
              <td className='px-6 py-4 font-medium'>{r.skillName}</td>
              <td className='px-6 py-4'>{r.user.name} ({r.user.email})</td>
              <td className='px-6 py-4 text-red-500 font-bold'>{r.knowledgeScore}%</td>
              <td className='px-6 py-4 text-red-500 font-bold'>{r.practiceScore}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

