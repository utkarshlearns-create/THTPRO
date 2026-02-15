"use client";
import React from 'react';
import { Eye, User } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';

const MOCK_VIEWS = [
    { id: 'PV-101', parent: 'Sita Verma', tutor: 'Ravi Kumar', action: 'Viewed Profile', date: '2024-01-26 10:45' },
    { id: 'PV-102', parent: 'John Doe', tutor: 'Anita Desai', action: 'Downloaded Resume', date: '2024-01-25 16:20' },
    { id: 'PV-103', parent: 'Sita Verma', tutor: 'David Wilson', action: 'Viewed Profile', date: '2024-01-25 14:10' },
];

export default function ParentViewHistory() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parent Access History</h1>
                    <p className="text-slate-500 dark:text-slate-400">Log of parents viewing tutor profiles.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Tutor Viewed</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_VIEWS.map((view) => (
                            <TableRow key={view.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{view.id}</TableCell>
                                <TableCell>{view.parent}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                                            <User size={12} className="text-slate-500" />
                                        </div>
                                        {view.tutor}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={14} className="text-blue-500" />
                                        {view.action}
                                    </div>
                                </TableCell>
                                <TableCell>{view.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

