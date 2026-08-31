
'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminJobReality } from '@/src/lib/api/admin/job-reality';
import { authClient } from '@/src/lib/auth-client';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

export default function AdminJobRealityView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['adminJobReality', userId],
    queryFn: () => getAdminJobReality(userId!),
    enabled: !!userId,
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading data.</p>;

  return (
    <div className='space-y-6'>
      <div className='border rounded-xl p-6 bg-card w-64'>
        <p className='text-sm font-medium text-muted-foreground'>Total Job Checks</p>
        <p className='text-3xl font-bold'>{data.totalChecks}</p>
      </div>
      
      <div className='rounded-xl border bg-card overflow-hidden'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted/50 text-muted-foreground border-b'>
            <tr>
              <th className='px-6 py-4 font-medium'>Target Role</th>
              <th className='px-6 py-4 font-medium'>Number of Learners</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {data.popularRoles.length === 0 ? (
              <tr><td colSpan={2} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
            ) : data.popularRoles.map((r: { id: string; role: string; mismatchScore: number; activeUsers: number; count: number }) => (
              <tr key={r.role}>
                <td className='px-6 py-4 font-medium'>{r.role}</td>
                <td className='px-6 py-4'>{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

