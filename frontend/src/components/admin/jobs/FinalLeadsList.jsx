"use client";
import React, { useState } from 'react';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';

// Mock Data for Leads
const MOCK_LEADS = [
    { id: 'LD-2024-001', parent: 'Rajesh Kumar', subject: 'Mathematics', class: 'Class 10', location: 'Indiranagar', posted: '2024-01-24', status: 'Open', budget: '₹500/hr' },
    { id: 'LD-2024-002', parent: 'Priya Sharma', subject: 'Physics', class: 'Class 12', location: 'Koramangala', posted: '2024-01-23', status: 'Urgent', budget: '₹800/hr' },
    { id: 'LD-2024-003', parent: 'Amit Singh', subject: 'Chemistry', class: 'Class 11', location: 'HSR Layout', posted: '2024-01-22', status: 'Closed', budget: '₹700/hr' },
    { id: 'LD-2024-004', parent: 'Sneha Gupta', subject: 'Biology', class: 'NEET Prep', location: 'Whitefield', posted: '2024-01-20', status: 'Open', budget: '₹1000/hr' },
    { id: 'LD-2024-005', parent: 'Vikram Malhotra', subject: 'Mathematics', class: 'Class 8', location: 'Jayanagar', posted: '2024-01-19', status: 'Pending', budget: '₹400/hr' },
];

const getStatusVariant = (status) => {
    switch (status) {
        case 'Open': return 'success';
        case 'Urgent': return 'destructive';
        case 'Closed': return 'secondary';
        case 'Pending': return 'warning';
        default: return 'default';
    }
};

export default function FinalLeadsList() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = MOCK_LEADS.filter(lead => 
        lead.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Final Leads List</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and view all student enquiries and job leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search leads..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Filter h-4 w-4 />
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/30">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Posted Date</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">{lead.id}</TableCell>
                                <TableCell>{lead.parent}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                            {lead.subject.charAt(0)}
                                        </div>
                                        {lead.subject}
                                    </div>
                                </TableCell>
                                <TableCell>{lead.class}</TableCell>
                                <TableCell>{lead.location}</TableCell>
                                <TableCell>{lead.posted}</TableCell>
                                <TableCell className="font-medium">{lead.budget}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
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

