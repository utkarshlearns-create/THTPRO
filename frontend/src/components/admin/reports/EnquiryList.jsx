import React, { useState } from 'react';
import { Search, Filter, MessageSquare } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';

const MOCK_ENQUIRIES = [
    { id: 'ENQ-901', name: 'Rahul Sharma', email: 'rahul@example.com', subject: 'General Query', message: 'How do I upgrade my plan?', date: '2024-01-26', status: 'New' },
    { id: 'ENQ-902', name: 'Priya Patel', email: 'priya@example.com', subject: 'Payment Issue', message: 'Transaction failed but money deducted.', date: '2024-01-25', status: 'In Progress' },
    { id: 'ENQ-903', name: 'Amit Singh', email: 'amit@example.com', subject: 'Feedback', message: 'Great app experience!', date: '2024-01-24', status: 'Resolved' },
];

export default function EnquiryList() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enquiry List</h1>
                    <p className="text-slate-500 dark:text-slate-400">View and manage user enquiries and support tickets.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Enquiry ID</TableHead>
                            <TableHead>User Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Message Preview</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_ENQUIRIES.map((enq) => (
                            <TableRow key={enq.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{enq.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{enq.name}</span>
                                        <span className="text-xs text-slate-500">{enq.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{enq.subject}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                        <MessageSquare size={14} />
                                        <span className="truncate">{enq.message}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{enq.date}</TableCell>
                                <TableCell>
                                    <Badge variant={enq.status === 'Resolved' ? 'success' : enq.status === 'New' ? 'destructive' : 'warning'}>
                                        {enq.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
