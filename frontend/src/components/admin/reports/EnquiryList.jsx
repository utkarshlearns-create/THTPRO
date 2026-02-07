import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Loader2 } from 'lucide-react';
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

export default function EnquiryList() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/admin/enquiries/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEnquiries(data);
            }
        } catch (error) {
            console.error("Error fetching enquiries:", error);
            toast.error("Failed to load enquiries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

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
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : enquiries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No enquiries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            enquiries.map((enq) => (
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
                                    <TableCell>{enq.created_at ? format(new Date(enq.created_at), 'dd MMM yyyy') : '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={enq.status === 'RESOLVED' ? 'success' : enq.status === 'NEW' ? 'destructive' : 'warning'}>
                                            {enq.status}
                                        </Badge>
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
