import { Suspense } from 'react';
import InstitutionDashboard from '../../../views/InstitutionDashboard';

export const metadata = {
    title: 'Institution Dashboard | The Home Tuitions',
};

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
            <InstitutionDashboard />
        </Suspense>
    );
}
