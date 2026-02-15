"use client";
import React from 'react';
import { Save, X } from 'lucide-react';
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

export default function AddNewJob() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post New Job</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create a new tuition job request manually.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200 dark:border-slate-800">
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                        <Save className="mr-2 h-4 w-4" /> Post Job
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Parent Details and Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Parent Information */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                            Parent Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parentName">Parent Name</Label>
                                <Input id="parentName" placeholder="e.g. Rajesh Kumar" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" placeholder="e.g. +91 98765 43210" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">Email Address (Optional)</Label>
                                <Input id="email" type="email" placeholder="e.g. parent@example.com" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Location / Address</Label>
                                <Textarea id="address" placeholder="e.g. #123, 4th Cross, Indiranagar, Bangalore" />
                            </div>
                        </div>
                    </div>

                    {/* Job Requirements */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                            Job Requirements
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="maths">Mathematics</SelectItem>
                                        <SelectItem value="physics">Physics</SelectItem>
                                        <SelectItem value="chemistry">Chemistry</SelectItem>
                                        <SelectItem value="biology">Biology</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class">Class / Grade</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="c9">Class 9</SelectItem>
                                        <SelectItem value="c10">Class 10</SelectItem>
                                        <SelectItem value="c11">Class 11</SelectItem>
                                        <SelectItem value="c12">Class 12</SelectItem>
                                        <SelectItem value="neet">NEET Prep</SelectItem>
                                        <SelectItem value="jee">JEE Prep</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="board">Board</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cbse">CBSE</SelectItem>
                                        <SelectItem value="icse">ICSE</SelectItem>
                                        <SelectItem value="igcse">IGCSE</SelectItem>
                                        <SelectItem value="state">State Board</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mode">Tuition Mode</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="offline">Offline (Home)</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Preferences */}
                <div className="space-y-6">
                    {/* Budget & Urgency */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                            Budget & Urgency
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget (Monthly/Hourly)</Label>
                                <Input id="budget" placeholder="e.g. ₹500/hr or ₹5000/month" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="urgency">Urgency</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="urgent" className="text-red-500 font-medium">Urgent</SelectItem>
                                        <SelectItem value="immediate" className="text-red-600 font-bold">Immediate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                            Preferences & Notes
                        </h2>
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="gender">Tutor Gender Preference</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="days">Days per Week</Label>
                                <Input id="days" placeholder="e.g. 3 days/week" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea id="notes" placeholder="Specific requirements..." className="h-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

