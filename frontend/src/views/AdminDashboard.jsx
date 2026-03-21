"use client";
import React, { useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import AddNewJob from '../components/admin/jobs/AddNewJob';
import ApproveJobs from '../components/admin/jobs/ApproveJobs';
import AdminJobList from '../components/admin/jobs/AdminJobList';
import NotificationMaster from '../components/admin/notifications/NotificationMaster';
import ParentPackageMaster from '../components/admin/packages/ParentPackageMaster';
import TutorPackageMaster from '../components/admin/packages/TutorPackageMaster';
import PurchaseList from '../components/admin/packages/PurchaseList';
import InstituteJobApprovals from '../components/admin/institutions/InstituteJobApprovals';
import ApproveTutorList from '../components/admin/tutors/ApproveTutorList';
import JobApplicationsList from '../components/admin/tutors/JobApplicationsList';
import AssignedJobsList from '../components/admin/tutors/AssignedJobsList';
import FinalizedTutorsList from '../components/admin/tutors/FinalizedTutorsList';
import PendingKYCVerifications from '../components/admin/kyc/PendingKYCVerifications';
import EnquiryList from '../components/admin/enquiries/EnquiryList';
import UnlockedJobsList from '../components/admin/reports/UnlockedJobsList';
import ParentViewHistory from '../components/admin/reports/ParentViewHistory';
import MyClients from '../components/admin/jobs/MyClients';
import FollowUpManager from '../components/admin/followups/FollowUpManager';

const PlaceholderView = ({ title, description }) => (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
        <p className="text-slate-500">{description || "This feature is currently under development."}</p>
    </div>
);

const AdminDashboard = ({ mode }) => { // Accept mode prop
    // Determine default view based on mode
    const getDefaultView = () => {
        if (mode === 'counsellor') return 'jobs-approved-list';
        if (mode === 'tutor') return 'approve-tutor-list';
        return 'home';
    }
    
    const [activeView, setActiveView] = useState(getDefaultView());

    const renderContent = () => {
        // Dashboard
        if (activeView === 'home') return <AnalyticsDashboard />;

        // Post Jobs
        if (activeView === 'jobs-approved-list') return <AdminJobList status="APPROVED" title="Approved Jobs" />;
        if (activeView === 'jobs-rejected-list') return <AdminJobList status="REJECTED" title="Rejected Jobs" />;
        if (activeView === 'jobs-add-new') return <AddNewJob />;
        if (activeView === 'jobs-approve') return <ApproveJobs />;
        if (activeView === 'my-assigned-jobs') return <AdminJobList adminId="me" title="My Assigned Jobs" />;
        if (activeView === 'my-clients') return <MyClients />;
        if (activeView === 'followups') return <FollowUpManager />;

        // Notifications
        if (activeView === 'notifications-master') return <NotificationMaster />;

        // Parent Package
        if (activeView === 'parent-package-master') return <ParentPackageMaster />;
        if (activeView === 'parent-pending-purchase') return <PurchaseList role="Parent" status="Pending" />;
        if (activeView === 'parent-approved-purchase') return <PurchaseList role="Parent" status="Approved" />;
        if (activeView === 'parent-rejected-purchase') return <PurchaseList role="Parent" status="Rejected" />;

        // Tutor Package
        if (activeView === 'tutor-package-master') return <TutorPackageMaster />;
        if (activeView === 'tutor-pending-purchase') return <PurchaseList role="TEACHER" status="Pending" />;
        if (activeView === 'tutor-approved-purchase') return <PurchaseList role="TEACHER" status="Approved" />;
        if (activeView === 'tutor-rejected-purchase') return <PurchaseList role="TEACHER" status="Rejected" />;

        // Institute Management
        if (activeView === 'institute-jobs-approve') return <InstituteJobApprovals />;

        // Approve Tutor
        if (activeView === 'approve-tutor-list') return <ApproveTutorList />;
        if (activeView === 'pending-kyc-verification') return <PendingKYCVerifications />;

        // Select Tutor
        if (activeView === 'select-tutor-apply-job') return <JobApplicationsList />;
        if (activeView === 'select-tutor-assigned') return <AssignedJobsList />;
        if (activeView === 'select-tutor-finalized') return <FinalizedTutorsList />;

        // Reports
        if (activeView === 'enquiries') return <EnquiryList />;
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


