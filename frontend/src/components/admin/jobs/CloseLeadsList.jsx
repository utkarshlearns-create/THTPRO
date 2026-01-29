import React, { useState } from 'react';
import { Search, Filter, Eye, ArchiveRestore } from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';

// Mock Data for Closed Leads
const MOCK_CLOSED_LEADS = [
    { id: 'LD-2023-890', parent: 'Anjali Desai', subject: 'Mathematics', class: 'Class 9', tutor: 'Vikram Singh', closed_date: '2023-12-15', amount: '₹8,000', status: 'Converted' },
    { id: 'LD-2023-891', parent: 'Rohan Mehta', subject: 'Physics', class: 'Class 11', tutor: 'N/A', closed_date: '2023-12-14', amount: '-', status: 'Dropped' },
    { id: 'LD-2023-892', parent: 'Suresh Raina', subject: 'English', class: 'Class 5', tutor: 'Priya K', closed_date: '2023-12-10', amount: '₹5,000', status: 'Converted' },
    { id: 'LD-2023-893', parent: 'Meera Iyer', subject: 'French', class: 'Beginner', tutor: 'Sophie M', closed_date: '2023-12-05', amount: '₹12,000', status: 'Converted' },
    { id: 'LD-2023-894', parent: 'Kabir Das', subject: 'Chemistry', class: 'Class 12', tutor: 'N/A', closed_date: '2023-12-01', amount: '-', status: 'Dropped' },
];

const getStatusVariant = (status) => {
    switch (status) {
        case 'Converted': return 'success';
        case 'Dropped': return 'destructive';
        default: return 'secondary';
    }
};

export default function CloseLeadsList() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = MOCK_CLOSED_LEADS.filter(lead => 
        lead.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.tutor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Close Leads List</h1>
                    <p className="text-slate-500 dark:text-slate-400">History of converted and dropped job leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search history..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Filter h-4 w-4 />
                    </button>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">
                        Export Report
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead ID</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Subject / Class</TableHead>
                            <TableHead>Assigned Tutor</TableHead>
                            <TableHead>Closed Date</TableHead>
                            <TableHead>Final Amount</TableHead>
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
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{lead.subject}</span>
                                        <span className="text-xs text-slate-500">{lead.class}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{lead.tutor}</TableCell>
                                <TableCell>{lead.closed_date}</TableCell>
                                <TableCell className="font-medium">{lead.amount}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors" title="View Details">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-green-600 transition-colors" title="Reopen Lead">
                                            <ArchiveRestore size={16} />
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
