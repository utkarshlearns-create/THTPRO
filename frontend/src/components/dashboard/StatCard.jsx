import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = "indigo", description, className = "" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <div className={`transition-all hover:shadow-md ${!className.includes('bg-') ? 'bg-white dark:bg-slate-900 shadow-sm' : ''} ${!className.includes('rounded-') ? 'rounded-xl' : ''} ${!className.includes('p-') ? 'p-6' : ''} ${!className.includes('border') ? 'border border-slate-100 dark:border-slate-800' : ''} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.indigo}`}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend === 'up' ? <ArrowUp size={14} className="mr-0.5" /> : <ArrowDown size={14} className="mr-0.5" />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
