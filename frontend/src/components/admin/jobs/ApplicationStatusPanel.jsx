"use client";
import React, { useState } from 'react';
import { CheckCircle, DollarSign, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '../../../config';

const PAYMENT_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'PARTIALLY_PAID', label: 'Partial', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'PAID', label: 'Paid', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'OVERDUE', label: 'Overdue', color: 'text-red-600 bg-red-50 border-red-200' },
];

const COMPLETION_OPTIONS = [
  { value: 'ONGOING', label: 'Ongoing', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'DROPPED', label: 'Dropped', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'text-amber-600 bg-amber-50 border-amber-200' },
];

export default function ApplicationStatusPanel({ application, onUpdated }) {
  const [paymentStatus, setPaymentStatus] = useState(application.payment_status || 'PENDING');
  const [completionStatus, setCompletionStatus] = useState(application.job_completion_status || 'ONGOING');
  const [notes, setNotes] = useState(application.counsellor_notes || '');
  const [paymentAmount, setPaymentAmount] = useState(application.payment_amount || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(`${API_BASE_URL}/api/jobs/admin/applications/${application.id}/update-status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          payment_status: paymentStatus,
          job_completion_status: completionStatus,
          counsellor_notes: notes,
          payment_amount: paymentAmount || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Status updated!');
        if (onUpdated) onUpdated(data);
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <h4 className="font-bold text-slate-800 dark:text-white text-sm">Job Progress Tracking</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <CheckCircle size={11} /> Job Status
          </label>
          <div className="grid grid-cols-2 gap-1">
            {COMPLETION_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setCompletionStatus(opt.value)}
                className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${completionStatus === opt.value ? opt.color + ' ring-1 ring-current' : 'text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <DollarSign size={11} /> Payment
          </label>
          <div className="grid grid-cols-2 gap-1">
            {PAYMENT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPaymentStatus(opt.value)}
                className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${paymentStatus === opt.value ? opt.color + ' ring-1 ring-current' : 'text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
        placeholder="Amount received (₹)"
        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="Counsellor notes (feedback, issues, remarks)..."
        rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      <button onClick={handleSave} disabled={saving}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
        <Save size={13} /> {saving ? 'Saving...' : 'Save Progress'}
      </button>
    </div>
  );
}
