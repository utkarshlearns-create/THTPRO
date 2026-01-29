import React from 'react';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Button } from '../../ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';

const MOCK_APPLICATIONS = [
    { id: 'APP-101', job_id: 'JD-5044', tutor: 'Amit Patel', subject: 'Mathematics (Cl 10)', bid: '₹500/hr', date: '2024-01-26', status: 'Applied' },
    { id: 'APP-102', job_id: 'JD-5045', tutor: 'Sarah Khan', subject: 'Physics (Cl 12)', bid: '₹800/hr', date: '2024-01-25', status: 'Shortlisted' },
    { id: 'APP-103', job_id: 'JD-5044', tutor: 'Rahul V', subject: 'Mathematics (Cl 10)', bid: '₹450/hr', date: '2024-01-26', status: 'Applied' },
];

export default function JobApplicationsList() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Applications</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage tutor applications for posted jobs.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>App ID</TableHead>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Tutor Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Bid / Quote</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_APPLICATIONS.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{app.id}</TableCell>
                                <TableCell className="text-blue-600">{app.job_id}</TableCell>
                                <TableCell>{app.tutor}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="h-3 w-3 text-slate-400" />
                                        {app.subject}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{app.bid}</TableCell>
                                <TableCell>{app.date}</TableCell>
                                <TableCell>
                                    <Badge variant={app.status === 'Shortlisted' ? 'info' : 'secondary'}>{app.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
