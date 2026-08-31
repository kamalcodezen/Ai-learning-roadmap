
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminSkillProof } from '@/src/lib/api/admin/skill-proof';
import { authClient } from '@/src/lib/auth-client';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

import { useDebounce } from 'use-debounce';

export default function AdminSkillProofView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading } = useQuery({
    queryKey: ['adminSkillProof', userId, skip, take, debouncedSearch],
    queryFn: () => getAdminSkillProof(userId!, skip, take, debouncedSearch),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading data.</p>;

  const { proofs, total } = data;
  const totalPages = Math.ceil(total / take) || 1;

  return (
    <div className='space-y-6'>
      <div className='relative w-full sm:w-96'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search by learner name...'
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className='h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm'
        />
      </div>
      
      <div className='rounded-xl border bg-card overflow-hidden'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted/50 text-muted-foreground border-b'>
            <tr>
              <th className='px-6 py-4 font-medium'>Learner</th>
              <th className='px-6 py-4 font-medium'>Skill</th>
              <th className='px-6 py-4 font-medium'>Knowledge</th>
              <th className='px-6 py-4 font-medium'>Practice</th>
              <th className='px-6 py-4 font-medium'>Project</th>
              <th className='px-6 py-4 font-medium'>Evidence</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {proofs.length === 0 ? (
              <tr><td colSpan={6} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
            ) : proofs.map((p: { id: string; user: { name: string; email: string }; skill: string; skillName: string; proofType: string; status: string; submittedAt: string; knowledgeScore: number; practiceScore: number; projectScore: number; evidenceScore: number }) => (
              <tr key={p.id}>
                <td className='px-6 py-4'>{p.user.name}</td>
                <td className='px-6 py-4 font-medium'>{p.skillName}</td>
                <td className='px-6 py-4'>{p.knowledgeScore}%</td>
                <td className='px-6 py-4'>{p.practiceScore}%</td>
                <td className='px-6 py-4'>{p.projectScore}%</td>
                <td className='px-6 py-4 font-bold'>{p.evidenceScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > take && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>Showing {skip + 1} to {Math.min(skip + take, total)} of {total}</p>
          <div className='flex gap-2'>
            <button className='px-3 py-1 text-sm border rounded-md disabled:opacity-50 flex items-center gap-1 hover:bg-muted transition-colors' disabled={page === 1} onClick={() => setPage(p => p - 1)}><ArrowLeft className='h-4 w-4' /></button>
            <button className='px-3 py-1 text-sm border rounded-md disabled:opacity-50 flex items-center gap-1 hover:bg-muted transition-colors' disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ArrowRight className='h-4 w-4' /></button>
          </div>
        </div>
      )}
    </div>
  );
}

