import React from 'react';
import { 
  Briefcase, 
  UserPlus, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const ActivityFeed = ({ activities = [] }) => {
  
  const getIcon = (type, iconName) => {
    // Priority: use iconName if provided, else fallback to type
    if (iconName === 'briefcase') return <Briefcase size={16} />;
    if (iconName === 'user') return <UserPlus size={16} />;
    if (iconName === 'wallet') return <CreditCard size={16} />;
    if (iconName === 'check-circle') return <CheckCircle size={16} />;
    if (iconName === 'clock') return <Clock size={16} />;
    
    // Fallback by type
    switch (type) {
      case 'job_posted': return <Briefcase size={16} />;
      case 'application_received': return <UserPlus size={16} />;
      case 'wallet': return <CreditCard size={16} />;
      case 'success': return <CheckCircle size={16} />;
      case 'info': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'job_posted': 
      case 'info':
          return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case 'application_received': 
      case 'success':
          return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case 'wallet': 
          return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case 'error':
          return "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
      default: 
          return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const formatTime = (isoString) => {
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        }).format(date);
    } catch (e) {
        return "Just now";
    }
  };

  if (!activities || activities.length === 0) {
    return (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            No recent activity.
        </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activityIdx}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span className="absolute top-5 left-4 -ml-px h-[calc(100%-8px)] w-0.5 bg-slate-200/50 dark:bg-slate-800/50" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${getColorClass(activity.type)}`}>
                    {getIcon(activity.type, activity.icon)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {activity.title} 
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {activity.description}
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">
                    <time dateTime={activity.timestamp}>{formatTime(activity.timestamp)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
