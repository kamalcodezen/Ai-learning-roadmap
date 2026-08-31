
'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminActivity } from '@/src/lib/api/admin/activity';
import { authClient } from '@/src/lib/auth-client';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

export default function AdminActivityView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({ queryKey: ['adminActivity', userId], queryFn: () => getAdminActivity(userId!), enabled: !!userId });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading.</p>;
  if (((data as { success?: boolean; message?: string })).success === false) return <p className='text-red-500'>{((data as { success?: boolean; message?: string })).message || 'API Error'}</p>;

  const activities = data.activities || [];

  return (
    <div className='border rounded-xl bg-card overflow-hidden'>
      {activities.length === 0 ? (
        <div className='p-8 text-center text-muted-foreground'>No activity logs found.</div>
      ) : (
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted/50 border-b'>
            <tr>
              <th className='p-4'>User</th>
              <th className='p-4'>Activity Type</th>
              <th className='p-4'>Description</th>
              <th className='p-4'>Date</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {activities.map((a: { id: string; user?: { name?: string }; type: string; description: string; createdAt: string }) => (
              <tr key={a.id}>
                <td className='p-4 font-medium'>{a.user?.name || 'Unknown'}</td>
                <td className='p-4'>
                  <span className='px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold'>
                    {a.type}
                  </span>
                </td>
                <td className='p-4 text-muted-foreground'>{a.description || '-'}</td>
                <td className='p-4'>{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

