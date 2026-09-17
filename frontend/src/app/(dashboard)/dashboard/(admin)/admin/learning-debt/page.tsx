
import AdminLearningDebtView from '@/src/components/dashboard/admin/AdminLearningDebtView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Learning Debt",
};

export default function Page() {
  return <AdminLearningDebtView />;
}

