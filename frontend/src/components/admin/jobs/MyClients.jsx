"use client";
import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    History, 
    ArrowRightLeft, 
    ChevronRight, 
    Briefcase,
    CheckCircle,
    XCircle,
    Clock,
    User as UserIcon,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '../../../config';

const STATUS_COLORS = {
    'PENDING_APPROVAL': 'bg-amber-100 text-amber-700 border-amber-200',
    'APPROVED': 'bg-blue-100 text-blue-700 border-blue-200',
    'ASSIGNED': 'bg-green-100 text-green-700 border-green-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200',
    'ACTIVE': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'CLOSED': 'bg-slate-100 text-slate-700 border-slate-200',
};

const MyClients = () => {
    const [clients, setClients] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // History Modal State
    const [selectedClient, setSelectedClient] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    // Transfer Modal State
    const [transferClient, setTransferClient] = useState(null);
    const [transferLead, setTransferLead] = useState(null);
    const [targetAdmin, setTargetAdmin] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    useEffect(() => {
        fetchClients();
        fetchAdmins();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/my-clients/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            toast.error("Failed to fetch clients");
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/list-admins/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch admins");
        }
    };

    const viewHistory = async (client) => {
        setSelectedClient(client);
        setHistoryLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/my-clients/${client.id}/history/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data.history);
            }
        } catch (error) {
            toast.error("Failed to fetch history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleTransferClient = async () => {
        if (!targetAdmin) return;
        setTransferLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/transfer-client/${transferClient.id}/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_admin_id: targetAdmin })
            });
            if (response.ok) {
                toast.success("Client transferred successfully");
                setTransferClient(null);
                setTargetAdmin('');
                fetchClients();
            }
        } catch (error) {
            toast.error("Transfer failed");
        } finally {
            setTransferLoading(false);
        }
    };

    const handleTransferLead = async () => {
        if (!targetAdmin) return;
        setTransferLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/jobs/admin/transfer-lead/${transferLead.id}/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_admin_id: targetAdmin })
            });
            if (response.ok) {
                toast.success("Lead transferred successfully");
                setTransferLead(null);
                setTargetAdmin('');
                if (selectedClient) viewHistory(selectedClient);
                fetchClients();
            }
        } catch (error) {
            toast.error("Transfer failed");
        } finally {
            setTransferLoading(false);
        }
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" />
                        My Clients
                    </h1>
                    <p className="text-slate-500 text-sm">Manage your assigned parents and their job history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            type="text" 
                            placeholder="Search clients..." 
                            className="pl-9 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="font-semibold">Client Name</TableHead>
                            <TableHead className="font-semibold">Contact Info</TableHead>
                            <TableHead className="font-semibold text-center">Total Jobs</TableHead>
                            <TableHead className="font-semibold text-center">Finalized</TableHead>
                            <TableHead className="font-semibold">Last Active</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {client.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">{client.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{client.email}</span>
                                            <span className="text-xs text-slate-500">{client.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 font-semibold border-blue-100">
                                            {client.total_jobs}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 font-semibold border-green-100">
                                            {client.hired_tutors}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {client.last_active ? format(new Date(client.last_active), 'dd MMM yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 gap-1"
                                                onClick={() => viewHistory(client)}
                                            >
                                                <History size={14} />
                                                History
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                onClick={() => setTransferClient(client)}
                                            >
                                                <ArrowRightLeft size={14} />
                                                Transfer
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* History Modal */}
            {selectedClient && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-none">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Client History: {selectedClient.name}</CardTitle>
                                <p className="text-xs text-slate-500">Full record of job postings and hired tutors.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>
                                <XCircle size={20} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1">
                            {historyLoading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job Details</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Hired Tutor</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((job) => (
                                            <TableRow key={job.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{job.subjects.join(', ')}</span>
                                                        <span className="text-xs text-slate-500">{job.class_grade}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{job.locality}</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || 'bg-slate-100'}`}>
                                                        {job.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {job.hired_tutor ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{job.hired_tutor.name}</span>
                                                            <span className="text-xs text-slate-500">{job.hired_tutor.phone}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No tutor hired</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">
                                                    {format(new Date(job.created_at), 'dd MMM yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-blue-600 hover:bg-blue-50 p-1"
                                                        onClick={() => setTransferLead(job)}
                                                        title="Transfer Lead"
                                                    >
                                                        <ArrowRightLeft size={14} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Transfer Modal (Common for Client and Lead) */}
            {(transferClient || transferLead) && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl border-none">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ArrowRightLeft className="text-blue-600" />
                                {transferClient ? 'Transfer Client' : 'Transfer Lead'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-500">
                                {transferClient 
                                    ? `This will transfer all jobs and enquiries related to ${transferClient.name} to the selected counsellor.`
                                    : `This will transfer the lead (Job ID: ${transferLead.id}) to the selected counsellor.`
                                }
                            </p>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Target Counselor</label>
                                <select 
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={targetAdmin}
                                    onChange={(e) => setTargetAdmin(e.target.value)}
                                >
                                    <option value="">Choose an admin...</option>
                                    {admins.filter(a => a.id !== parseInt(localStorage.getItem('user_id'))).map(admin => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.username} ({admin.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => { setTransferClient(null); setTransferLead(null); setTargetAdmin(''); }}>
                                    Cancel
                                </Button>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={!targetAdmin || transferLoading}
                                    onClick={transferClient ? handleTransferClient : handleTransferLead}
                                >
                                    {transferLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Confirm Transfer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyClients;
