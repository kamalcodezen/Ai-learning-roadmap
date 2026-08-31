import AdminAnalyticsView from '@/src/components/dashboard/admin/AdminAnalyticsView';

export default function Page() {
  return (
    <div className='flex w-full flex-col gap-6'>
      <div>
        <h1 className='section-title text-left'>
          Platform <span className='text-brand'>Analytics</span>
        </h1>
        <p className='section-subtitle mt-1 ml-0 mr-auto text-left'>
          Track platform-wide activity, growth, and engagement across learners, roadmaps, projects, and assessments.
        </p>
      </div>
      <AdminAnalyticsView />
    </div>
  );
}
