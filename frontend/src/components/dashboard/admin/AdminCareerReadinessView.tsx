
'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminCareerReadiness } from '@/src/lib/api/admin/career-readiness';
import { authClient } from '@/src/lib/auth-client';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

export default function AdminCareerReadinessView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['adminCareerReadiness', userId],
    queryFn: () => getAdminCareerReadiness(userId!),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading data.</p>;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='border rounded-xl p-6 bg-card'>
          <p className='text-sm font-medium text-muted-foreground'>Ready</p>
          <p className='text-3xl font-bold text-green-500'>{data.summary.ready}</p>
        </div>
        <div className='border rounded-xl p-6 bg-card'>
          <p className='text-sm font-medium text-muted-foreground'>Almost Ready</p>
          <p className='text-3xl font-bold text-blue-500'>{data.summary.almost}</p>
        </div>
        <div className='border rounded-xl p-6 bg-card'>
          <p className='text-sm font-medium text-muted-foreground'>Needs Work</p>
          <p className='text-3xl font-bold text-orange-500'>{data.summary.needsWork}</p>
        </div>
        <div className='border rounded-xl p-6 bg-card'>
          <p className='text-sm font-medium text-muted-foreground'>Early Stage</p>
          <p className='text-3xl font-bold text-muted-foreground'>{data.summary.early}</p>
        </div>
      </div>
      
      <div className='rounded-xl border bg-card overflow-hidden'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted/50 text-muted-foreground border-b'>
            <tr>
              <th className='px-6 py-4 font-medium'>Learner</th>
              <th className='px-6 py-4 font-medium'>Target Role</th>
              <th className='px-6 py-4 font-medium'>Readiness Score</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {data.profiles.length === 0 ? (
              <tr><td colSpan={3} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
            ) : data.profiles.map((p: { id: string; user: { name: string; email: string }; matchRole: string; score: number; targetRole: string }) => (
              <tr key={p.id}>
                <td className='px-6 py-4'>{p.user.name} ({p.user.email})</td>
                <td className='px-6 py-4 font-medium'>{p.targetRole}</td>
                <td className='px-6 py-4 font-bold'>{p.score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

