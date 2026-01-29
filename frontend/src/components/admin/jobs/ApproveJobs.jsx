import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';
import { Button } from '../../ui/button';

// Mock Data for Pending Jobs
const MOCK_PENDING_JOBS = [
    { id: 'PEND-001', parent: 'Sita Verma', phone: '+91 98765 43210', subject: 'Economics', class: 'Class 12', location: 'Malleshwaram', posted_by: 'Parent App', date: '2024-01-25', status: 'Pending Review' },
    { id: 'PEND-002', parent: 'John Doe', phone: '+91 98765 43211', subject: 'Maths Olympiad', class: 'Class 6', location: 'Frazer Town', posted_by: 'Admin (Draft)', date: '2024-01-25', status: 'Draft' },
    { id: 'PEND-003', parent: 'Fatima Khan', phone: '+91 98765 43212', subject: 'Urdu', class: 'Beginner', location: 'Shivajinagar', posted_by: 'Website', date: '2024-01-24', status: 'Pending Review' },
];

export default function ApproveJobs() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Approve Jobs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and approve new job postings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search pending..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Subject / Class</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Date Posted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_PENDING_JOBS.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{job.id}</TableCell>
                                <TableCell>{job.parent}</TableCell>
                                <TableCell className="text-slate-500">{job.phone}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{job.subject}</span>
                                        <span className="text-xs text-slate-500">{job.class}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{job.location}</TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {job.posted_by}
                                    </span>
                                </TableCell>
                                <TableCell>{job.date}</TableCell>
                                <TableCell>
                                    <Badge variant="warning">{job.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Details">
                                            <Eye size={14} />
                                        </Button>
                                        <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white" title="Approve">
                                            <CheckCircle size={14} />
                                        </Button>
                                        <Button size="sm" className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white" title="Reject">
                                            <XCircle size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
