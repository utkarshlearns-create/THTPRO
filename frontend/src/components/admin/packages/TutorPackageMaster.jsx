"use client";
import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, Edit, Trash2, Loader2 } from 'lucide-react';
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

export default function TutorPackageMaster() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/admin/packages/`, { // Use Admin endpoint for all
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Handle paginated response (data.results) or plain array
                const items = Array.isArray(data) ? data : (data.results || []);
                const tutorPackages = items.filter(p => p.target_role === 'TUTOR');
                setPackages(tutorPackages);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tutor Packages</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage subscription plans for tutors.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => toast.success("Add Package feature coming soon!")}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Package
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                                </TableCell>
                            </TableRow>
                        ) : packages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No tutor packages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            packages.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-slate-400" />
                                            {pkg.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>₹{pkg.price}</TableCell>
                                    <TableCell>{pkg.credit_amount} Credits</TableCell>
                                    <TableCell>
                                        <Badge variant={pkg.is_active ? 'success' : 'secondary'}>
                                            {pkg.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit">
                                                <Edit size={14} />
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                                                <Trash2 size={14} />
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

