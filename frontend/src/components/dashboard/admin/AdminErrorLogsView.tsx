'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/src/lib/auth-client';
import { getAdminErrorLogs } from '@/src/lib/api/admin/error-logs';
import GenericPageSkeleton from '../shared/GenericPageSkeleton';
import { formatDistanceToNow } from 'date-fns';

export default function AdminErrorLogsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  
  const [page, setPage] = useState(0);
  const take = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminErrorLogs', userId, page],
    queryFn: () => getAdminErrorLogs(userId!, page * take, take),
    enabled: !!userId
  });

  if (isLoading) return <GenericPageSkeleton />;
  if (isError) return <div className="text-red-500">Failed to load error logs.</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Endpoint</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.errors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No errors found.
                  </td>
                </tr>
              ) : (
                data.errors.map((err: { id: string; path: string; message: string; method: string; createdAt: string; endpoint: string; statusCode: number; errorType: string }) => (
                  <tr key={err.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
                        {err.errorType}
                      </span>
                    </td>
                    <td className="p-4 max-w-[300px] truncate" title={err.message}>
                      {err.message}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {err.method} {err.endpoint}
                    </td>
                    <td className="p-4">
                      {err.statusCode || 'N/A'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDistanceToNow(new Date(err.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {data.total > take && (
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
          <span className="text-sm text-muted-foreground">
            Showing {page * take + 1} to {Math.min((page + 1) * take, data.total)} of {data.total}
          </span>
          <div className="space-x-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 text-sm hover:bg-muted"
            >
              Previous
            </button>
            <button
              disabled={(page + 1) * take >= data.total}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 text-sm hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
