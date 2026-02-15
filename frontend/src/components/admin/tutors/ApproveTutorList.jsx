"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, User, Award, Loader2 } from 'lucide-react';
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
import { toast } from 'react-hot-toast';

export default function ApproveTutorList() {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/admin/tutors/?status=PENDING&q=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTutors(data);
            }
        } catch (error) {
            console.error("Error fetching tutors:", error);
            toast.error("Failed to load tutors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchTutors(), 500);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleAction = async (tutorId, action) => {
        if (!confirm(`Are you sure you want to ${action} this tutor?`)) return;
        
        setProcessingId(tutorId);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/admin/tutors/${tutorId}/review/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: action })
            });

            if (response.ok) {
                toast.success(`Tutor ${action}ed successfully`);
                fetchTutors(); // Refresh list
            } else {
                const error = await response.json();
                toast.error(error.message || `Failed to ${action} tutor`);
            }
        } catch (error) {
            console.error(`Error ${action}ing tutor:`, error);
            toast.error("Network error");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Approve Tutors</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and approve new tutor applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search tutors..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>
                    <Button onClick={fetchTutors} variant="outline" size="icon">
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Subject Expertise</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Registered Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : tutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                    No pending tutors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tutors.map((tutor) => (
                                <TableRow key={tutor.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">#{tutor.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center overflow-hidden">
                                                {tutor.profile_image ? (
                                                    <img src={tutor.profile_image} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User size={14} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{tutor.full_name || tutor.user?.username || 'Unknown'}</div>
                                                <div className="text-xs text-slate-500">{tutor.user?.phone}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {tutor.subjects && tutor.subjects.slice(0, 2).map((sub, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{sub}</Badge>
                                            ))}
                                            {tutor.subjects && tutor.subjects.length > 2 && (
                                                <span className="text-xs text-slate-400">+{tutor.subjects.length - 2}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{tutor.teaching_experience_years} Years</TableCell>
                                    <TableCell>{tutor.highest_qualification}</TableCell>
                                    <TableCell>{new Date(tutor.user?.date_joined || Date.now()).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="warning">{tutor.status_msg?.status || 'PENDING'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="View Profile">
                                                <Eye size={14} />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white" 
                                                title="Approve"
                                                onClick={() => handleAction(tutor.id, 'approve')}
                                                disabled={processingId === tutor.id}
                                            >
                                                {processingId === tutor.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white" 
                                                title="Reject"
                                                onClick={() => handleAction(tutor.id, 'reject')}
                                                disabled={processingId === tutor.id}
                                            >
                                                <XCircle size={14} />
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

