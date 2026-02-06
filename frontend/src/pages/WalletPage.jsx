import React, { useState, useEffect } from 'react';
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config';

const WalletPage = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingFunds, setAddingFunds] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Balance
            const balanceRes = await fetch(`${API_BASE_URL}/api/wallet/me/`, { headers });
            const balanceData = await balanceRes.json();
            if (balanceRes.ok) setBalance(balanceData.balance);

            // Fetch Transactions
            const transRes = await fetch(`${API_BASE_URL}/api/wallet/transactions/`, { headers });
            const transData = await transRes.json();
            if (transRes.ok) setTransactions(transData);

        } catch (error) {
            console.error("Error fetching wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleAddFunds = async (amount) => {
        setAddingFunds(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/add-funds/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: `Successfully added ${amount} Credits!` });
                fetchWalletData(); // Refresh data
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to add funds' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setAddingFunds(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Wallet</h1>
                        <p className="text-slate-500">Manage your credits and transaction history</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Col: Balance & Add Funds */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Balance Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            
                            <h3 className="text-slate-500 font-medium mb-2">Available Balance</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">{parseFloat(balance).toLocaleString()}</span>
                                <span className="text-slate-500 font-medium">Credits</span>
                            </div>
                            
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm p-3 rounded-lg flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <p>1 Credit = ₹1. Credits are used to unlock tutor contacts.</p>
                            </div>
                        </div>

                        {/* Add Funds */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-emerald-500" /> Add Funds
                            </h3>
                            
                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-3">
                                {[100, 500, 1000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => handleAddFunds(amount)}
                                        disabled={addingFunds}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                                    >
                                        <div className="font-semibold text-slate-700 dark:text-slate-200">
                                            {amount} Credits
                                        </div>
                                        <div className="text-indigo-600 font-medium group-hover:underline">
                                           ₹{amount}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-center text-slate-400 mt-4">
                                Secured by Mock Payment Gateway
                            </p>
                        </div>
                    </div>

                    {/* Right Col: Transactions */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <History size={18} className="text-slate-400" /> Transaction History
                                </h3>
                            </div>
                            
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-500">Loading history...</div>
                                ) : transactions.length > 0 ? (
                                    transactions.map(tx => (
                                        <div key={tx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                                    tx.transaction_type === 'CREDIT' 
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {tx.transaction_type === 'CREDIT' 
                                                        ? <ArrowDownLeft size={20} /> 
                                                        : <ArrowUpRight size={20} />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {tx.description || (tx.transaction_type === 'CREDIT' ? 'Funds Added' : 'Payment')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`font-bold ${
                                                tx.transaction_type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                                            }`}>
                                                {tx.transaction_type === 'CREDIT' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                                            <History className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500">No transaction history yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WalletPage;
