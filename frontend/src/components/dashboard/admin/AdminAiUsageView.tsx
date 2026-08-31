
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminAiUsage } from '@/src/lib/api/admin/ai-usage';
import { exportAdminData } from '@/src/lib/actions/admin/export';
import { authClient } from '@/src/lib/auth-client';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';


export default function AdminAiUsageView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading } = useQuery({ queryKey: ['adminAiUsage', userId, skip, take], queryFn: () => getAdminAiUsage(userId!, skip, take), enabled: !!userId });

  if (isLoading) return <GenericPageSkeleton />;
  if (!data) return <p className='text-red-500'>Error loading.</p>;

  const totalPages = Math.ceil(data.total / take) || 1;

  return (
    <div className='space-y-6'>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => exportAdminData(userId!, 'ai-usage')}
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Total AI Calls</p><p className='text-3xl font-bold'>{data.total}</p></div>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Success</p><p className='text-3xl font-bold text-green-500'>{data.successCount}</p></div>
        <div className='border rounded-xl p-6 bg-card'><p className='text-muted-foreground'>Failures</p><p className='text-3xl font-bold text-red-500'>{data.failureCount}</p></div>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {data.providerStats.map((p: { provider: string; total: number; success: number; failure: number }) => (
          <div key={p.provider} className='border rounded-xl p-6 bg-card'>
            <h3 className='font-bold text-lg mb-2'>{p.provider}</h3>
            <div className='flex justify-between'><span className='text-muted-foreground'>Total:</span><span className='font-medium'>{p.total}</span></div>
            <div className='flex justify-between'><span className='text-muted-foreground'>Success:</span><span className='text-green-500 font-medium'>{p.success}</span></div>
            <div className='flex justify-between'><span className='text-muted-foreground'>Failure:</span><span className='text-red-500 font-medium'>{p.failure}</span></div>
          </div>
        ))}
      </div>

      <div className='border rounded-xl bg-card overflow-hidden'>
        <table className='w-full text-left text-sm'><thead className='bg-muted/50 border-b'><tr><th className='p-4'>Provider</th><th className='p-4'>Feature</th><th className='p-4'>Status</th><th className='p-4'>Date</th></tr></thead><tbody className='divide-y'>{data.logs.map((a: { id: string; provider: string; model: string; feature: string; status: string; createdAt: string }) => (<tr key={a.id}><td className='p-4'>{a.provider} ({a.model})</td><td className='p-4'>{a.feature}</td><td className={`p-4 font-bold ${a.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>{a.status}</td><td className='p-4'>{new Date(a.createdAt).toLocaleString()}</td></tr>))}</tbody></table>
      </div>
      
      {data.total > take && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>Showing {skip + 1} to {Math.min(skip + take, data.total)} of {data.total}</p>
          <div className='flex gap-2'>
            <button className='px-3 py-1 text-sm border rounded-md disabled:opacity-50 flex items-center gap-1 hover:bg-muted transition-colors' disabled={page === 1} onClick={() => setPage(p => p - 1)}><ArrowLeft className='h-4 w-4' /></button>
            <button className='px-3 py-1 text-sm border rounded-md disabled:opacity-50 flex items-center gap-1 hover:bg-muted transition-colors' disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ArrowRight className='h-4 w-4' /></button>
          </div>
        </div>
      )}
    </div>
  );
}

