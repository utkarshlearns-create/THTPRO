import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, CreditCard, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../components/ui/table';
import Badge from '../../components/ui/badge';
import API_BASE_URL from '../../config';
import { toast } from 'react-hot-toast';

export default function PackageMaster() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('TUTOR'); // 'TUTOR' or 'PARENT'

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/admin/packages/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPackages(data);
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

    const filteredPackages = packages.filter(pkg => pkg.target_role === activeTab);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Package Master</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage subscription packages for Tutors and Parents.</p>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20">
                    <Plus size={16} className="mr-2" /> Add New Package
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                    onClick={() => setActiveTab('TUTOR')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                        activeTab === 'TUTOR' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <GraduationCap size={16} /> Tutor Packages
                </button>
                <button
                    onClick={() => setActiveTab('PARENT')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                        activeTab === 'PARENT' 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <Users size={16} /> Parent Packages
                </button>
            </div>

            {/* Table */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Package Name</TableHead>
                                <TableHead>Price (₹)</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-amber-500" size={32} />
                                            <span className="text-slate-500">Loading packages...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPackages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <CreditCard size={32} className="text-slate-300" />
                                            <span>No {activeTab.toLowerCase()} packages found.</span>
                                            <Button size="sm" variant="outline" className="mt-2">
                                                <Plus size={14} className="mr-1" /> Create First Package
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPackages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">{pkg.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">{pkg.name}</span>
                                                <span className="text-xs text-slate-500">{pkg.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-emerald-600">₹{pkg.price}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                                {pkg.credits} Credits
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={pkg.is_active ? 'success' : 'destructive'}>
                                                {pkg.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit">
                                                    <Edit size={14} />
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" title="Delete">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
