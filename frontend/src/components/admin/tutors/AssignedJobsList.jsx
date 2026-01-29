import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';

const MOCK_ASSIGNED = [
    { job_id: 'JD-4001', parent: 'Meera Reddy', tutor: 'Vikram Singh', subject: 'Mathematics (Cl 9)', start_date: '2024-01-20', status: 'Active' },
    { job_id: 'JD-4002', parent: 'John Smith', tutor: 'Priya P', subject: 'English (Spoken)', start_date: '2024-01-15', status: 'Active' },
    { job_id: 'JD-3980', parent: 'Anita Roy', tutor: 'Amit Patel', subject: 'Science (Cl 8)', start_date: '2023-12-10', status: 'Completed' },
];

export default function AssignedJobsList() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Jobs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track active and completed tuitions.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Assigned Tutor</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_ASSIGNED.map((job) => (
                            <TableRow key={job.job_id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{job.job_id}</TableCell>
                                <TableCell>{job.parent}</TableCell>
                                <TableCell className="font-medium text-blue-600">{job.tutor}</TableCell>
                                <TableCell>{job.subject}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        {job.start_date}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={job.status === 'Active' ? 'success' : 'secondary'}>{job.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
