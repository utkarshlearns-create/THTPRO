import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, CreditCard, Loader2 } from 'lucide-react';
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
import API_BASE_URL from '../../../config';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const getStatusVariant = (status) => {
    switch (status) {
        case 'Success': return 'success';
        case 'Approved': return 'success';
        case 'Rejected': return 'destructive';
        default: return 'warning';
    }
};

export default function PurchaseList({ role, status }) { // role: Parent/Tutor, status: Pending/Approved/etc
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            // We fetch all transactions for the role
            const response = await fetch(`${API_BASE_URL}/api/wallet/admin/transactions/?role=${role.toUpperCase()}&q=${searchTerm}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // If status is 'Pending', and we only have completed transactions, we filter them out (empty list)
                // If status is 'Approved' or 'History', we show them.
                // Assuming 'Pending' means manual requests which we don't have yet.
                // So for Pending, it will be empty.
                // For 'History' or 'Approved', we show all transactions.
                
                let filtered = data;
                if (status === 'Pending') {
                    filtered = []; 
                } 
                
                setTransactions(filtered);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchTransactions(), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, role, status]);

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
                            <TableHead>ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    No {status.toLowerCase()} purchases found for {role}s.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">{txn.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                                {txn.wallet?.user?.username?.charAt(0) || 'U'}
                                            </div>
                                            {txn.wallet?.user?.username || 'Unknown User'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <CreditCard className="h-3 w-3 text-slate-400" />
                                            {txn.description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-green-600">+{txn.amount}</TableCell>
                                    <TableCell>{txn.created_at ? format(new Date(txn.created_at), 'dd MMM yyyy') : '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="success">Success</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Details">
                                                <Eye size={14} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
