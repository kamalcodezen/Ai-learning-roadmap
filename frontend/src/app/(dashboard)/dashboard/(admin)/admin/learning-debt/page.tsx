
import AdminLearningDebtView from '@/src/components/dashboard/admin/AdminLearningDebtView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learning Debt | Admin | AI Pather",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Learning <span className="text-brand">Debt</span></h1>
          <p className="section-subtitle mt-1 text-left">Surface where learners fall behind so interventions can be targeted.</p>
        </div>
      </div>
      <AdminLearningDebtView />
    </div>
  );
}

