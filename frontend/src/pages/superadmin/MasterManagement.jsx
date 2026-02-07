import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Layers,
  Search,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import API_BASE_URL from '../../config';

// Skeleton loader component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// Tab configuration
const TABS = [
  { id: 'subjects', label: 'Subjects', icon: BookOpen, endpoint: 'subjects' },
  { id: 'boards', label: 'Boards', icon: GraduationCap, endpoint: 'boards' },
  { id: 'classLevels', label: 'Class Levels', icon: Layers, endpoint: 'class-levels' },
  { id: 'locations', label: 'Locations', icon: MapPin, endpoint: 'locations' },
];

const MasterManagement = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentTab = TABS.find(t => t.id === activeTab);
  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/master/${currentTab.endpoint}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/master/seed/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(`Seeded: ${result.created.subjects} subjects, ${result.created.boards} boards, ${result.created.class_levels} classes, ${result.created.locations} locations`);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setError('Failed to seed data');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/master/${currentTab.endpoint}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addForm)
      });
      if (response.ok) {
        setShowAddForm(false);
        setAddForm({});
        fetchData();
        setSuccessMessage('Item added successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const err = await response.json();
        setError(err.name?.[0] || 'Failed to add item');
      }
    } catch (err) {
      setError('Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/master/${currentTab.endpoint}/${editingId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        setEditingId(null);
        fetchData();
        setSuccessMessage('Updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/master/${currentTab.endpoint}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchData();
        setSuccessMessage('Deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/master/${currentTab.endpoint}/${item.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !item.is_active })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      setError('Failed to toggle status');
    }
  };

  const filteredData = data.filter(item => {
    const name = item.name || item.city || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getFieldsForTab = () => {
    switch (activeTab) {
      case 'subjects':
        return ['name', 'icon', 'category'];
      case 'boards':
        return ['name', 'short_name'];
      case 'classLevels':
        return ['name', 'category'];
      case 'locations':
        return ['city', 'state', 'pincode'];
      default:
        return ['name'];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Master Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage dropdown options for jobs, profiles, and more.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeedData} disabled={saving}>
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw size={16} className="mr-2" />}
            Seed Default Data
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <Check size={18} />
            {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowAddForm(false); setEditingId(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            {currentTab && <currentTab.icon size={20} />}
            {currentTab?.label || 'Data'} ({filteredData.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button onClick={() => { setShowAddForm(true); setAddForm({}); }} className="bg-amber-600 hover:bg-amber-700">
              <Plus size={16} className="mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex flex-wrap gap-3 items-end">
                  {getFieldsForTab().map(field => (
                    <div key={field} className="flex-1 min-w-[150px]">
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 capitalize">
                        {field.replace('_', ' ')}
                      </label>
                      <Input
                        value={addForm[field] || ''}
                        onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                        placeholder={field}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} disabled={saving} className="bg-green-600 hover:bg-green-700">
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Data Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <currentTab.icon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No {currentTab.label.toLowerCase()} found.</p>
              <p className="text-sm mt-2">Click "Seed Default Data" to populate initial values.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Name</th>
                    {activeTab === 'subjects' && <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Category</th>}
                    {activeTab === 'boards' && <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Short Name</th>}
                    {activeTab === 'locations' && <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">State</th>}
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {editingId === item.id ? (
                          <Input
                            value={editForm.name || editForm.city || ''}
                            onChange={(e) => setEditForm({ ...editForm, [activeTab === 'locations' ? 'city' : 'name']: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <span className="font-medium text-slate-900 dark:text-white">
                            {item.name || item.city}
                          </span>
                        )}
                      </td>
                      {activeTab === 'subjects' && (
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {editingId === item.id ? (
                            <Input
                              value={editForm.category || ''}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="h-8"
                            />
                          ) : item.category}
                        </td>
                      )}
                      {activeTab === 'boards' && (
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.short_name}</td>
                      )}
                      {activeTab === 'locations' && (
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.state}</td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            item.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {editingId === item.id ? (
                            <>
                              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0">
                                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-8 w-8 p-0">
                                <X size={14} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                                <Edit2 size={14} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300">
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterManagement;
