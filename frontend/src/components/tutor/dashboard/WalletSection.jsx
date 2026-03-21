"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Wallet, CheckCircle, FileText, ArrowUpRight, ArrowDownLeft, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import API_BASE_URL from '../../../config';
import { useRouter } from 'next/navigation';

const WalletSection = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchWallet();
        fetchTransactions();
    }, []);

    const fetchWallet = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/me/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWallet(data);
            }
        } catch (error) {
            console.error("Error fetching wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await fetch(`${API_BASE_URL}/api/wallet/transactions/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTransactions(Array.isArray(data) ? data : data.results || []);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    // Compute totals from transactions
    const totalEarned = transactions
        .filter(tx => tx.transaction_type === 'CREDIT')
        .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);
    const totalSpent = transactions
        .filter(tx => tx.transaction_type === 'DEBIT')
        .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

    if (loading) return <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Wallet</h1>
                <Button 
                    onClick={() => router.push('/packages')} 
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <CreditCard size={16} /> Buy Credits
                </Button>
            </div>
            
            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-2xl shadow-indigo-900/50">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-black/10 blur-2xl"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
                                <Wallet size={18} /> Available Credits
                            </p>
                            <h2 className="text-5xl font-bold tracking-tight mt-2 text-shadow-lg">
                                {parseInt(wallet?.balance || 0)} <span className="text-2xl font-medium opacity-80">Credits</span>
                            </h2>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20">
                            <CreditCard className="h-8 w-8 opacity-80" />
                        </div>
                    </div>
                    
                    <div className="relative z-10 mt-8 flex gap-4">
                        <Button 
                            onClick={() => router.push('/packages')} 
                            className="bg-white text-indigo-700 hover:bg-slate-50 border-none shadow-lg"
                        >
                            + Buy More Credits
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <Card className="flex flex-col justify-center gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <ArrowDownLeft size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Credits Earned</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-200">{parseInt(totalEarned)} Credits</p>
                        </div>
                    </div>
                     <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                            <ArrowUpRight size={20} />
                        </div>
                         <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Credits Used</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-200">{parseInt(totalSpent)} Credits</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Credit History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-full",
                                            tx.transaction_type === 'CREDIT' ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        )}>
                                            {tx.transaction_type === 'CREDIT' ? <CheckCircle size={18} /> : <FileText size={18} />} 
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-200">{tx.description}</p>
                                            <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "font-bold font-mono",
                                        tx.transaction_type === 'CREDIT' ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-slate-200"
                                    )}>
                                        {tx.transaction_type === 'CREDIT' ? '+' : '-'} {parseInt(tx.amount)} Credits
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                                <FileText size={48} className="opacity-20" />
                                <p>No transactions yet. Purchase credits to get started!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WalletSection;
