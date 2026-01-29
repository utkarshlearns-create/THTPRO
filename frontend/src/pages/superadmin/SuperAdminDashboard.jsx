import React from 'react';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

// Mock Data
const kpiData = [
  { title: 'Total Leads', value: '1,770', icon: <Users className="text-blue-500" />, trend: '+12%', color: 'border-l-4 border-blue-500' },
  { title: 'Fresh Leads', value: '89', icon: <UserPlus className="text-emerald-500" />, trend: '+5%', color: 'border-l-4 border-emerald-500' },
  { title: 'Rejected Leads', value: '377', icon: <UserX className="text-red-500" />, trend: '-2%', color: 'border-l-4 border-red-500' },
  { title: 'Confirmed Tuitions', value: '164', icon: <CheckCircle className="text-brand-gold" />, trend: '+8%', color: 'border-l-4 border-brand-gold' },
  { title: 'Payments Received', value: '₹ 113', icon: <DollarSign className="text-violet-500" />, trend: '+15%', color: 'border-l-4 border-violet-500' },
  { title: 'Future Follow-ups', value: '43', icon: <Clock className="text-amber-500" />, trend: 'Today', color: 'border-l-4 border-amber-500' },
];

const barData = [
  { name: 'Jan', Leads: 120, Conversions: 30 },
  { name: 'Feb', Leads: 150, Conversions: 45 },
  { name: 'Mar', Leads: 180, Conversions: 50 },
  { name: 'Apr', Leads: 220, Conversions: 70 },
  { name: 'May', Leads: 250, Conversions: 90 },
  { name: 'Jun', Leads: 300, Conversions: 110 },
];

const pieData = [
  { name: 'Fresh', value: 89, color: '#10b981' }, // Emerald
  { name: 'Follow-up', value: 243, color: '#f59e0b' }, // Amber
  { name: 'Closed', value: 164, color: '#ac6f39' }, // Brand Gold
  { name: 'Rejected', value: 377, color: '#ef4444' }, // Red
];

const lineData = [
  { name: 'Week 1', Revenue: 5000 },
  { name: 'Week 2', Revenue: 12000 },
  { name: 'Week 3', Revenue: 8000 },
  { name: 'Week 4', Revenue: 15000 },
];

const SuperAdminDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time insights into your agency's performance.</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-gold">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
            </select>
            <button className="bg-brand-gold text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-brand-gold/20 hover:bg-yellow-700 transition-colors">
                Download Report
            </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 ${kpi.color}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</h3>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {kpi.icon}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={12} />
                    <span>{kpi.trend}</span>
                    <span className="text-slate-400 dark:text-slate-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Bar Chart: Leads vs Conversions */}
          <Card className="xl:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Leads vs Conversions Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            <Bar dataKey="Conversions" fill="#ac6f39" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          {/* Donut Chart: Lead Distribution */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Lead Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          {/* Line Chart: Revenue */}
          <Card className="xl:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white">Revenue & Collection</CardTitle>
                <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
            </CardHeader>
            <CardContent>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                             <Line type="monotone" dataKey="Revenue" stroke="#ac6f39" strokeWidth={3} dot={{ r: 4, fill: '#ac6f39', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
