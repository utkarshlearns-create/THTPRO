import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, CreditCard } from 'lucide-react';
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

// Mock Data for Purchases
const MOCK_PURCHASES = [
    { id: 'TXN-1001', user: 'Rajesh Kumar', role: 'Parent', package: 'Basic Plan', amount: '₹999', txn_id: 'UPI-1234567890', date: '2024-01-25', status: 'Pending' },
    { id: 'TXN-1002', user: 'Vikram Singh', role: 'Tutor', package: 'Pro Tutor', amount: '₹1499', txn_id: 'UPI-0987654321', date: '2024-01-24', status: 'Approved' },
    { id: 'TXN-1003', user: 'Priya Sharma', role: 'Parent', package: 'Gold Plan', amount: '₹2499', txn_id: 'CARD-11223344', date: '2024-01-24', status: 'Rejected' },
    { id: 'TXN-1004', user: 'Amit Patel', role: 'Tutor', package: 'Starter Tutor', amount: '₹499', txn_id: 'UPI-55667788', date: '2024-01-25', status: 'Pending' },
    { id: 'TXN-1005', user: 'Sneha Gupta', role: 'Parent', package: 'Platinum Plan', amount: '₹4999', txn_id: 'NET-99887766', date: '2024-01-23', status: 'Approved' },
    { id: 'TXN-1006', user: 'Rahul Dravid', role: 'Tutor', package: 'Elite Tutor', amount: '₹2999', txn_id: 'UPI-33445566', date: '2024-01-22', status: 'Rejected' },
    { id: 'TXN-1007', user: 'Anjali Menon', role: 'Parent', package: 'Basic Plan', amount: '₹999', txn_id: 'UPI-77889900', date: '2024-01-25', status: 'Pending' },
];

const getStatusVariant = (status) => {
    switch (status) {
        case 'Approved': return 'success';
        case 'Rejected': return 'destructive';
        default: return 'warning';
    }
};

export default function PurchaseList({ role, status }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPurchases = MOCK_PURCHASES.filter(p => 
        p.role === role && 
        p.status === status &&
        (p.user.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{role} - {status} Purchases</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage {status.toLowerCase()} subscription requests for {role.toLowerCase()}s.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
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
                            <TableHead>Req ID</TableHead>
                            <TableHead>User Name</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPurchases.length > 0 ? (
                            filteredPurchases.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">{txn.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                                {txn.user.charAt(0)}
                                            </div>
                                            {txn.user}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <CreditCard className="h-3 w-3 text-slate-400" />
                                            {txn.package}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{txn.amount}</TableCell>
                                    <TableCell className="text-xs text-slate-500 font-mono">{txn.txn_id}</TableCell>
                                    <TableCell>{txn.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(txn.status)}>{txn.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Details">
                                                <Eye size={14} />
                                            </Button>
                                            {status === 'Pending' && (
                                                <>
                                                    <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white" title="Approve">
                                                        <CheckCircle size={14} />
                                                    </Button>
                                                    <Button size="sm" className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white" title="Reject">
                                                        <XCircle size={14} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                    No {status.toLowerCase()} purchases found for {role}s.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
