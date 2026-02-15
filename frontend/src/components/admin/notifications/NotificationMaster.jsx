"use client";
import React, { useState } from 'react';
import { Send, Bell, History } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../ui/table';
import Badge from '../../ui/badge';

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Server Maintenance', audience: 'All Users', date: '2024-01-25 10:00 AM', status: 'Sent' },
    { id: 2, title: 'New Features for Tutors', audience: 'Tutors', date: '2024-01-24 02:30 PM', status: 'Sent' },
    { id: 3, title: 'Discount on Packages', audience: 'Parents', date: '2024-01-22 09:00 AM', status: 'Sent' },
];

export default function NotificationMaster() {
    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Master</h1>
                    <p className="text-slate-500 dark:text-slate-400">Send and manage system-wide notifications.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Notification Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Send Notification
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="Notification Title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="audience">Target Audience</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="parents">Parents Only</SelectItem>
                                        <SelectItem value="tutors">Tutors Only</SelectItem>
                                        <SelectItem value="specific">Specific User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Type your message here..." className="h-32" />
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <Send className="mr-2 h-4 w-4" /> Send Notification
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notification History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-500" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Recent History
                            </h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Date Sent</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_NOTIFICATIONS.map((notif) => (
                                    <TableRow key={notif.id}>
                                        <TableCell className="font-medium text-slate-900 dark:text-white">{notif.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{notif.audience}</Badge>
                                        </TableCell>
                                        <TableCell>{notif.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="success">{notif.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

