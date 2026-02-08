import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, CreditCard, Users, GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export default function PackageMaster({ role }) {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const url = role 
                ? `${API_BASE_URL}/api/wallet/admin/packages/?role=${role}`
                : `${API_BASE_URL}/api/wallet/admin/packages/`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // If role is specified, filter on client side as backup
                const filtered = role ? data.filter(pkg => pkg.target_role === role) : data;
                setPackages(filtered);
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
    }, [role]);

    // Determine display info based on role
    const displayConfig = {
        TUTOR: {
            title: 'Tutor Packages',
            subtitle: 'Manage subscription packages for Tutors.',
            icon: <GraduationCap className="text-blue-500" size={24} />,
            accentColor: 'blue'
        },
        PARENT: {
            title: 'Parent Packages',
            subtitle: 'Manage subscription packages for Parents.',
            icon: <Users className="text-emerald-500" size={24} />,
            accentColor: 'emerald'
        },
        default: {
            title: 'Package Master',
            subtitle: 'Select a package type from the sidebar.',
            icon: <CreditCard className="text-amber-500" size={24} />,
            accentColor: 'amber'
        }
    };

    const config = displayConfig[role] || displayConfig.default;

    // If no role is specified, show selection cards
    if (!role) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Package Master</h1>
                    <p className="text-slate-500 dark:text-slate-400">Select a package category to manage.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card 
                        className="cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all border-2 border-transparent"
                        onClick={() => navigate('/superadmin/packages/tutor')}
                    >
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <GraduationCap className="text-blue-500" size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tutor Packages</h3>
                                <p className="text-sm text-slate-500">Manage credit packages for tutors</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card 
                        className="cursor-pointer hover:shadow-lg hover:border-emerald-400 transition-all border-2 border-transparent"
                        onClick={() => navigate('/superadmin/packages/parent')}
                    >
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Users className="text-emerald-500" size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Parent Packages</h3>
                                <p className="text-sm text-slate-500">Manage credit packages for parents</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/superadmin/packages')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3">
                        {config.icon}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{config.title}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{config.subtitle}</p>
                        </div>
                    </div>
                </div>
                <Button className={`bg-${config.accentColor}-600 hover:bg-${config.accentColor}-700 text-white shadow-lg`}>
                    <Plus size={16} className="mr-2" /> Add New Package
                </Button>
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
                            ) : packages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <CreditCard size={32} className="text-slate-300" />
                                            <span>No {role?.toLowerCase()} packages found.</span>
                                            <Button size="sm" variant="outline" className="mt-2">
                                                <Plus size={14} className="mr-1" /> Create First Package
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages.map((pkg) => (
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
