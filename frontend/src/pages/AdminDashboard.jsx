import React, { useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import FinalLeadsList from '../components/admin/jobs/FinalLeadsList';
import CloseLeadsList from '../components/admin/jobs/CloseLeadsList';
import AddNewJob from '../components/admin/jobs/AddNewJob';
import ApproveJobs from '../components/admin/jobs/ApproveJobs';
import NotificationMaster from '../components/admin/notifications/NotificationMaster';
import ParentPackageMaster from '../components/admin/packages/ParentPackageMaster';
import TutorPackageMaster from '../components/admin/packages/TutorPackageMaster';
import PurchaseList from '../components/admin/packages/PurchaseList';
import ApproveTutorList from '../components/admin/tutors/ApproveTutorList';
import JobApplicationsList from '../components/admin/tutors/JobApplicationsList';
import AssignedJobsList from '../components/admin/tutors/AssignedJobsList';
import EnquiryList from '../components/admin/reports/EnquiryList';
import UnlockedJobsList from '../components/admin/reports/UnlockedJobsList';
import ParentViewHistory from '../components/admin/reports/ParentViewHistory';

const PlaceholderView = ({ title, description }) => (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
        <p className="text-slate-500">{description || "This feature is currently under development."}</p>
    </div>
);

const AdminDashboard = ({ mode }) => { // Accept mode prop
    // Determine default view based on mode
    const getDefaultView = () => {
        if (mode === 'parent') return 'jobs-final-leads';
        if (mode === 'tutor') return 'approve-tutor-list';
        return 'home';
    }
    
    const [activeView, setActiveView] = useState(getDefaultView());

    const renderContent = () => {
        // Dashboard
        if (activeView === 'home') return <AnalyticsDashboard />;

        // Post Jobs
        if (activeView === 'jobs-final-leads') return <FinalLeadsList />;
        if (activeView === 'jobs-close-leads') return <CloseLeadsList />;
        if (activeView === 'jobs-add-new') return <AddNewJob />;
        if (activeView === 'jobs-approve') return <ApproveJobs />;

        // Notifications
        if (activeView === 'notifications-master') return <NotificationMaster />;

        // Parent Package
        if (activeView === 'parent-package-master') return <ParentPackageMaster />;
        if (activeView === 'parent-pending-purchase') return <PurchaseList role="Parent" status="Pending" />;
        if (activeView === 'parent-approved-purchase') return <PurchaseList role="Parent" status="Approved" />;
        if (activeView === 'parent-rejected-purchase') return <PurchaseList role="Parent" status="Rejected" />;

        // Tutor Package
        if (activeView === 'tutor-package-master') return <TutorPackageMaster />;
        if (activeView === 'tutor-pending-purchase') return <PurchaseList role="Tutor" status="Pending" />;
        if (activeView === 'tutor-approved-purchase') return <PurchaseList role="Tutor" status="Approved" />;
        if (activeView === 'tutor-rejected-purchase') return <PurchaseList role="Tutor" status="Rejected" />;

        // Approve Tutor
        if (activeView === 'approve-tutor-list') return <ApproveTutorList />;

        // Select Tutor
        if (activeView === 'select-tutor-apply-job') return <JobApplicationsList />;
        if (activeView === 'select-tutor-assigned') return <AssignedJobsList />;

        // Reports
        if (activeView === 'reports-enquiry') return <EnquiryList />;
        if (activeView === 'reports-unlocked-jobs') return <UnlockedJobsList />;
        if (activeView === 'reports-parent-view-history') return <ParentViewHistory />;

        return <AnalyticsDashboard />;
    };

    return (
        <AdminLayout activeView={activeView} setActiveView={setActiveView} mode={mode}>
            {renderContent()}
        </AdminLayout>
    );
};

export default AdminDashboard;

