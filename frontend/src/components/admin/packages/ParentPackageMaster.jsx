import React from 'react';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
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

const MOCK_PACKAGES = [
    { id: 1, name: 'Basic Plan', price: '₹999', credits: '10 Contacts', duration: '30 Days', status: 'Active' },
    { id: 2, name: 'Gold Plan', price: '₹2499', credits: '30 Contacts', duration: '60 Days', status: 'Active' },
    { id: 3, name: 'Platinum Plan', price: '₹4999', credits: 'Unlimited', duration: '90 Days', status: 'Inactive' },
];

export default function ParentPackageMaster() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parent Packages</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage subscription plans for parents.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add New Package
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Credits / Benefits</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_PACKAGES.map((pkg) => (
                            <TableRow key={pkg.id}>
                                <TableCell className="font-medium text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        {pkg.name}
                                    </div>
                                </TableCell>
                                <TableCell>{pkg.price}</TableCell>
                                <TableCell>{pkg.credits}</TableCell>
                                <TableCell>{pkg.duration}</TableCell>
                                <TableCell>
                                    <Badge variant={pkg.status === 'Active' ? 'success' : 'secondary'}>{pkg.status}</Badge>
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
