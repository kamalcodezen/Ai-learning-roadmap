
'use client';
import { useQuery } from '@tanstack/react-query';
import { serverFetch } from '@/src/lib/core/server';
import { authClient } from '@/src/lib/auth-client';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';

export default function AdminSystemHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({ queryKey: ['adminSystemHealth', userId], queryFn: () => serverFetch(`/api/admin/system-health?userId=${userId}`), enabled: !!userId });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading.</p>;

  return (
    <div className='border rounded-xl bg-card overflow-hidden'>
      <table className='w-full text-left text-sm'><thead className='bg-muted/50 border-b'><tr><th className='p-4'>Service</th><th className='p-4'>Status</th></tr></thead><tbody className='divide-y'>
        <tr><td className='p-4'>Database</td><td className='p-4 font-bold'>{data.database}</td></tr>
        <tr><td className='p-4'>Backend API</td><td className='p-4 font-bold'>{data.backend}</td></tr>
        <tr><td className='p-4'>Authentication</td><td className='p-4 font-bold'>{data.auth}</td></tr>
        <tr><td className='p-4'>AI Providers</td><td className='p-4 font-bold'>{data.ai}</td></tr>
      </tbody></table>
    </div>
  );
}

