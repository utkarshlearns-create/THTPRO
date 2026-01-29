import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, User, Award } from 'lucide-react';
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

// Mock Data for Pending Tutors
const MOCK_PENDING_TUTORS = [
    { id: 'TUT-501', name: 'Ravi Kumar', subject: 'Mathematics (9-12)', experience: '5 Years', qualification: 'M.Sc Mathematics', date: '2024-01-26', status: 'Pending' },
    { id: 'TUT-502', name: 'Anita Desai', subject: 'English Literature', experience: '3 Years', qualification: 'M.A. English', date: '2024-01-25', status: 'Pending' },
    { id: 'TUT-503', name: 'David Wilson', subject: 'Physics (JEE)', experience: '8 Years', qualification: 'B.Tech IIT Delhi', date: '2024-01-24', status: 'Pending' },
];

export default function ApproveTutorList() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Approve Tutors</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and approve new tutor applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search tutors..." 
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Subject Expertise</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Registered Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_PENDING_TUTORS.map((tutor) => (
                            <TableRow key={tutor.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{tutor.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <User size={14} />
                                        </div>
                                        {tutor.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Award className="h-3 w-3 text-slate-400" />
                                        {tutor.subject}
                                    </div>
                                </TableCell>
                                <TableCell>{tutor.experience}</TableCell>
                                <TableCell>{tutor.qualification}</TableCell>
                                <TableCell>{tutor.date}</TableCell>
                                <TableCell>
                                    <Badge variant="warning">{tutor.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Profile">
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
