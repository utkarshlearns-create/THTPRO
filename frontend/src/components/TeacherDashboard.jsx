"use client";
import React from 'react';

const TeacherDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Teacher Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Profile Visits</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                    </div>
                </div>
                 <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Unlocked By Parents</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">3</dd>
                    </div>
                </div>
            </div>

             <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tuition Opportunities</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        <li className="px-4 py-4 sm:px-6 text-gray-500 text-sm">
                            No open tuition requests matching your profile.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

