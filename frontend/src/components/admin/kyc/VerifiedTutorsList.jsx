"use client";
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, User, Calendar, Loader2, ShieldCheck } from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../ui/table';
import Badge from '../../ui/badge';
import API_BASE_URL from '../../../config';

export default function VerifiedTutorsList() {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchVerified = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/admin/kyc/verified/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const all = Array.isArray(data) ? data : data.results || [];
                // Client-side search filter
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    setTutors(all.filter(kyc =>
                        (kyc.tutor?.full_name || '').toLowerCase().includes(q) ||
                        (kyc.tutor?.user?.username || '').toLowerCase().includes(q) ||
                        (kyc.tutor?.user?.phone || '').includes(q)
                    ));
                } else {
                    setTutors(all);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('API error:', response.status, errorData);
                alert(`Failed to load verified tutors: ${errorData.detail || errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Error fetching verified tutors:", error);
            alert("Failed to load verified tutors. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchVerified(), 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        Verified Tutors
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Tutors whose KYC documents you have verified.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                        {tutors.length} Verified
                    </span>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tutor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-green-500 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Verified On</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-green-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : tutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                    <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No verified tutors yet.</p>
                                    <p className="text-sm mt-1">Tutors you verify via KYC will appear here.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tutors.map((kyc) => (
                                <TableRow key={kyc.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {kyc.tutor?.full_name || kyc.tutor?.user?.username || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-slate-500">{kyc.tutor?.user?.email || ''}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {kyc.tutor?.user?.phone || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {kyc.tutor?.subjects?.join(', ') || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {kyc.tutor?.highest_qualification || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                            <Calendar className="h-3 w-3 text-slate-400" />
                                            {kyc.updated_at ? new Date(kyc.updated_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="success">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
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
