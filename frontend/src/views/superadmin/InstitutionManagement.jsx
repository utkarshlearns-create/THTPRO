"use client";
import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Building2, 
    MoreVertical, 
    Shield, 
    AlertTriangle,
    CheckCircle, 
    XCircle,
    CreditCard,
    DollarSign
} from 'lucide-react';
import API_BASE_URL from '../../config';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const InstitutionManagement = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState(null);
    const [revokeAmount, setRevokeAmount] = useState('');
    const [revokeReason, setRevokeReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            // Reusing user list endpoint but filtering for INSTITUTION role if API supports it
            // Or if we need a specific endpoint, we might default to filtering client side if API returns all
            // Ideally backend should support ?role=INSTITUTION
            const response = await fetch(`${API_BASE_URL}/api/users/superadmin/users/?role=INSTITUTION`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setInstitutions(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch institutions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeCredits = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/admin/users/${selectedInstitution.id}/revoke/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(revokeAmount),
                    reason: revokeReason
                })
            });

            if (response.ok) {
                alert("Credits revoked successfully");
                setShowRevokeModal(false);
                setRevokeAmount('');
                setRevokeReason('');
                setSelectedInstitution(null);
                fetchInstitutions(); // Refresh to see updated balance if we displayed it
            } else {
                const err = await response.json();
                alert(err.error || "Failed to revoke credits");
            }
        } catch (error) {
            console.error("Error revoking credits", error);
            alert("Network error");
        } finally {
            setProcessing(false);
        }
    };

    const filteredInstitutions = institutions.filter(inst => 
        inst.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="text-brand-gold" /> Institution Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage institution profiles and wallet balances.</p>
                </div>
            </div>

            {/* Search */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="Search institutions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 font-semibold">
                                <th className="p-4">Institution</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredInstitutions.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No institutions found.</td></tr>
                            ) : (
                                filteredInstitutions.map((inst) => (
                                    <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{inst.username}</p>
                                                    <p className="text-xs text-slate-500">ID: #{inst.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-300">
                                                <p>{inst.email}</p>
                                                <p className="text-xs text-slate-400">{inst.phone}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                inst.is_active 
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' 
                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                                            }`}>
                                                {inst.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {inst.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(inst.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => { setSelectedInstitution(inst); setShowRevokeModal(true); }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            >
                                                <AlertTriangle size={14} className="mr-2" /> Revoke Credits
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Revoke Modal */}
            {showRevokeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revoke Credits</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Deduct credits from <strong>{selectedInstitution?.username}</strong>. This action cannot be undone easily.
                        </p>
                        <form onSubmit={handleRevokeCredits}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Amount to Revoke</label>
                                    <Input 
                                        type="number" 
                                        required
                                        min="0"
                                        step="0.01"
                                        value={revokeAmount}
                                        onChange={e => setRevokeAmount(e.target.value)}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reason</label>
                                    <Input 
                                        required
                                        value={revokeReason}
                                        onChange={e => setRevokeReason(e.target.value)}
                                        placeholder="e.g. Package cancellation"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowRevokeModal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={processing}>
                                    {processing ? 'Processing...' : 'Confirm Revoke'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstitutionManagement;
