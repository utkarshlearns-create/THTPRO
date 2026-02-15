"use client";
import React from 'react';

const ParentDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Parent Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stats / Quick Actions */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Available Credits</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                     <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Find a Tutor</h3>
                        <p className="mt-2 max-w-xl text-sm text-gray-500">
                            Post specific requirements or browse top rated tutors.
                        </p>
                        <div className="mt-5">
                            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Post Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Recent Activity</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        <li className="px-4 py-4 sm:px-6 text-gray-500 text-sm">
                            No recent activity.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;

