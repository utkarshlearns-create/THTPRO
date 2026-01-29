import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Calendar, Clock, Video } from 'lucide-react';
import { cn } from '../../../lib/utils';

const UpcomingClasses = () => {
    const classes = [
        { id: 1, subject: 'Mathematics', student: 'Rahul Sharma', time: 'Today, 4:00 PM', duration: '1h', type: 'online' },
        { id: 2, subject: 'Physics', student: 'Priya Singh', time: 'Tomorrow, 5:30 PM', duration: '1.5h', type: 'offline' },
    ];

    return (
        <Card className="col-span-4 lg:col-span-2 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Upcoming Classes
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-8 text-slate-500 hover:text-indigo-500">
                    View Calendar
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {classes.map((cls, index) => (
                        <div key={cls.id} className={cn(
                            "group p-4 rounded-xl border transition-all duration-300",
                            "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md", // Light
                            "dark:bg-slate-900/40 dark:border-white/5 dark:hover:border-indigo-500/30" // Dark
                        )}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{cls.subject}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Student: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{cls.student}</span></p>
                                </div>
                                <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", 
                                    cls.type === 'online' ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                                )}>
                                    {cls.type === 'online' ? 'Online' : 'Home Visit'}
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Clock size={14} />
                                    <span>{cls.time} ({cls.duration})</span>
                                </div>
                                
                                {cls.type === 'online' ? (
                                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                        <Video size={14} className="mr-2" /> Join Class
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                        View Location
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {classes.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <p>No classes scheduled for today.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default UpcomingClasses;
