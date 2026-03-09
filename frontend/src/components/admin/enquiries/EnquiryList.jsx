"use client";
import React, { useState, useEffect } from 'react';
import { Download, Search, RefreshCw, Calendar, MapPin, User, Briefcase, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import API_BASE_URL from '../../../config';

const EnquiryList = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/api/users/admin/enquiries/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEnquiries(Array.isArray(data) ? data : data.results || []);
            } else {
                console.error("Failed to fetch enquiries");
            }
        } catch (error) {
            console.error("Error fetching enquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (enquiries.length === 0) return;

        // Define CSV headers
        const headers = ['Date', 'Name', 'Role', 'Phone', 'Email', 'Location', 'Subject', 'Message'];
        
        // Convert data to CSV format
        const csvContent = [
            headers.join(','), // Header row
            ...filteredEnquiries.map(enq => {
                const date = new Date(enq.created_at).toLocaleDateString();
                const clean = (text) => text ? `"${text.replace(/"/g, '""')}"` : '';
                return [
                    clean(date),
                    clean(enq.name),
                    clean(enq.role || 'N/A'),
                    clean(enq.phone),
                    clean(enq.email),
                    clean(enq.location || 'N/A'),
                    clean(enq.subject),
                    clean(enq.message)
                ].join(',');
            })
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `enquiries_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredEnquiries = enquiries.filter(enq => {
        const matchesSearch = 
            enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.phone.includes(searchTerm) ||
            enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.location?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || enq.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const uniqueRoles = ['All', ...new Set(enquiries.map(e => e.role).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Enquiries</h2>
                     <p className="text-slate-500 dark:text-slate-400">Manage and export website leads.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchEnquiries} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                    <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white">
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, email, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                     </div>
                     <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     >
                         {uniqueRoles.map(role => (
                             <option key={role} value={role}>{role}</option>
                         ))}
                     </select>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Name / Contact</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">Location</th>
                                <th className="px-6 py-3 font-semibold">Subject / Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Loading enquiries...
                                    </td>
                                </tr>
                            ) : filteredEnquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No enquiries found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredEnquiries.map((enq) => (
                                    <tr key={enq.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(enq.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs mt-1 ml-5">
                                                {new Date(enq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <User className="h-3 w-3 text-slate-400" /> {enq.name}
                                            </div>
                                            <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                                                <Phone className="h-3 w-3" /> {enq.phone}
                                            </div>
                                            {enq.email && (
                                                <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                                                    <Mail className="h-3 w-3" /> {enq.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                enq.role === 'Parent' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' :
                                                enq.role === 'Student' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                enq.role === 'TEACHER' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' :
                                                'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                            }`}>
                                                <Briefcase className="h-3 w-3 mr-1" />
                                                {enq.role || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                             <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {enq.location || 'N/A'}
                                             </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={enq.subject}>
                                                {enq.subject}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2" title={enq.message}>
                                                {enq.message}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default EnquiryList;
