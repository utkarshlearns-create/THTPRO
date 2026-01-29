import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

const data = [
  { name: 'Mon', views: 24, applications: 4 },
  { name: 'Tue', views: 13, applications: 1 },
  { name: 'Wed', views: 38, applications: 8 },
  { name: 'Thu', views: 20, applications: 2 },
  { name: 'Fri', views: 45, applications: 12 },
  { name: 'Sat', views: 60, applications: 15 },
  { name: 'Sun', views: 55, applications: 10 },
];

const EngagementStats = () => {
    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
                <CardTitle>Engagement</CardTitle>
                <p className="text-xs text-slate-400">Views vs Applications</p>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                            />
                            <Bar dataKey="views" fill="#38bdf8" radius={[4, 4, 0, 0]} /> {/* Sky Blue */}
                            <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} /> {/* Indigo */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default EngagementStats;
