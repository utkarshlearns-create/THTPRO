import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    User, 
    Shield, 
    Briefcase, 
    GraduationCap, 
    CheckCircle, 
    XCircle,
    Download
} from 'lucide-react';
import API_BASE_URL from '../../config';
import CreateAdminModal from '../../components/superadmin/CreateAdminModal';

const HRMModule = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Pagination (Simple client-side or server-side? Server is better but let's do simple first fetch)
    // The backend is paginated by default DRF? generics.ListAPIView uses default pagination if set.
    // Let's assume generic list for now.

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]); // Re-fetch when filters change

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            let url = `${API_BASE_URL}/api/users/superadmin/users/?`;
            
            if (roleFilter !== 'ALL') url += `&role=${roleFilter}`;
            if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
            if (searchQuery) url += `&q=${searchQuery}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401) {
                window.location.href = '/superadmin/login';
                return;
            }

            const data = await response.json();
            // Handle pagination if data.results exists, else use data
            setUsers(data.results || data); 
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const toggleUserStatus = async (userId, currentStatus) => {
         if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;

         try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/users/superadmin/users/${userId}/status/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
            } else {
                alert("Failed to update status");
            }
         } catch (error) {
             console.error("Error updating status", error);
         }
    };

    const getRoleBadge = (role, department) => {
        switch(role) {
            case 'SUPERADMIN': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1"><Shield size={12}/> Super Admin</span>;
            case 'ADMIN': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><Shield size={12}/> {department === 'PARENT_OPS' ? 'Parent Ops' : department === 'TUTOR_OPS' ? 'Tutor Ops' : 'Admin'}</span>;
            case 'TEACHER': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><GraduationCap size={12}/> Tutor</span>;
            case 'PARENT': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1"><User size={12}/> Parent</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{role}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">HRM Module</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage all users, admins, and staff.</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-brand-gold hover:bg-amber-600 text-white rounded-lg shadow-lg shadow-brand-gold/20 font-medium transition-all flex items-center gap-2"
                    >
                        <Shield size={18} /> Create Admin
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or phone..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-gold/50"
                    />
                </form>
                
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-gold/50"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admins</option>
                        <option value="TEACHER">Tutors</option>
                        <option value="PARENT">Parents</option>
                    </select>

                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-gold/50"
                    >
                        <option value="ALL">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 font-semibold">
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                                        <td className="p-4"></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    {user.username.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.username}</p>
                                                    <p className="text-xs text-slate-500">ID: #{user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role, user.department)}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-300">
                                                <p>{user.email}</p>
                                                <p className="text-xs text-slate-400">{user.phone}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                user.is_active 
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' 
                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                                            }`}>
                                                {user.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                    className={`p-1.5 rounded-lg border transition-colors ${
                                                        user.is_active 
                                                        ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={user.is_active ? "Deactivate User" : "Activate User"}
                                                >
                                                    {user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                                {/* Edit/View Profile Placeholder */}
                                                {/* <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                                                    <MoreVertical size={16} />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateAdminModal 
                    onClose={() => setShowCreateModal(false)} 
                    onSuccess={() => {
                        fetchUsers(); // Refresh list
                        // Toast success
                    }} 
                />
            )}
        </div>
    );
};

export default HRMModule;
