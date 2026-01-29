import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Star } from 'lucide-react';

const data = [
  { name: 'Communication', uv: 90, fill: '#8884d8' },
  { name: 'Punctuality', uv: 85, fill: '#83a6ed' },
  { name: 'Subject Knowledge', uv: 95, fill: '#8dd1e1' },
];

const PerformanceRadial = () => {
    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Performance
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500 text-sm">
                        <Star size={12} fill="currentColor" />
                        <span>4.9</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                 <div className="h-[180px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="30%" 
                            outerRadius="100%" 
                            data={data} 
                            startAngle={180} 
                            endAngle={0}
                        >
                            <RadialBar minAngle={15} background clockWise={true} dataKey="uv" cornerRadius={10} />
                            <Legend iconSize={10} layout="vertical" verticalAlign="bottom" wrapperStyle={{fontSize: '10px', color: '#94a3b8'}} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-[-20px]">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">4.9</span>
                    </div>
                 </div>
                 
                 {/* Mini Feed */}
                 <div className="w-full mt-4 space-y-3">
                    <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/5">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Rahul K.</span>
                            <div className="flex text-yellow-500"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">"Excellent explanation of Calculus concepts. Very patient."</p>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceRadial;
