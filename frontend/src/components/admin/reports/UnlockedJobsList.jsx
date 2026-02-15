"use client";
import React from 'react';
import { Search, Unlock } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';

const MOCK_UNLOCKED = [
    { id: 'UL-301', job_id: 'JD-5001', tutor: 'Vikram Singh', parent: 'Rajesh Kumar', cost: '50 Credits', date: '2024-01-26 14:30' },
    { id: 'UL-302', job_id: 'JD-5005', tutor: 'Priya P', parent: 'Anita Roy', cost: '50 Credits', date: '2024-01-26 11:00' },
    { id: 'UL-303', job_id: 'JD-4999', tutor: 'Amit Patel', parent: 'John Doe', cost: 'Free (Premium)', date: '2024-01-25 09:15' },
];

export default function UnlockedJobsList() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Unlocked Jobs History</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track contact unlocks by tutors.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unlock ID</TableHead>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Tutor Name</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_UNLOCKED.map((txn) => (
                            <TableRow key={txn.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{txn.id}</TableCell>
                                <TableCell className="text-blue-600">{txn.job_id}</TableCell>
                                <TableCell>{txn.tutor}</TableCell>
                                <TableCell>{txn.parent}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 font-medium text-orange-600 dark:text-orange-400">
                                        <Unlock size={14} />
                                        {txn.cost}
                                    </div>
                                </TableCell>
                                <TableCell>{txn.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

