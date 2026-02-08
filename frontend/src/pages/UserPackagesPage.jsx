import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle, Sparkles, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import API_BASE_URL from '../config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const PackageCard = ({ pkg, index, onPurchase }) => {
    const features = [
        `${pkg.credits} Credits included`,
        'Valid for 1 year',
        'Instant activation',
        '24/7 Support access'
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className={`relative overflow-hidden border-2 hover:border-amber-400 transition-all hover:shadow-xl group ${
                index === 1 ? 'border-amber-400 shadow-lg scale-105 z-10' : 'border-slate-200 dark:border-slate-800'
            }`}>
                {index === 1 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                        MOST POPULAR
                    </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                            index === 1 
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                                : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
                        }`}>
                            {index === 0 && <Zap className={index === 1 ? 'text-white' : 'text-amber-500'} size={28} />}
                            {index === 1 && <Sparkles className="text-white" size={28} />}
                            {index >= 2 && <Shield className={index === 1 ? 'text-white' : 'text-blue-500'} size={28} />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-lg text-slate-500">₹</span>
                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{pkg.price}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            <span className="text-emerald-600 font-semibold">{pkg.credits} Credits</span>
                        </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6 flex-1">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-emerald-500 flex-shrink-0" size={16} />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* Action */}
                    <Button
                        onClick={() => onPurchase(pkg)}
                        className={`w-full ${
                            index === 1 
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30' 
                                : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white'
                        }`}
                    >
                        <CreditCard size={16} className="mr-2" />
                        Purchase Now
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function UserPackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Get user role from local storage or API
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserRole(user.role);
            } catch (e) {
                console.error('Error parsing user data');
            }
        }
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            const userData = localStorage.getItem('user');
            let role = 'TUTOR'; // Default
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    role = user.role === 'TEACHER' ? 'TUTOR' : user.role;
                } catch (e) {}
            }
            
            const response = await fetch(`${API_BASE_URL}/api/wallet/packages/?role=${role}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPackages(data);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (pkg) => {
        // TODO: Integrate with payment gateway
        toast.success(`Redirecting to payment for ${pkg.name}...`);
        // This would redirect to payment gateway in production
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={48} />
                    <p className="text-slate-500">Loading packages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Credit Package</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Purchase credits to unlock premium features. Get more value with our bundled packages.
                        </p>
                    </motion.div>
                </div>

                {/* Packages Grid */}
                {packages.length === 0 ? (
                    <div className="text-center py-20">
                        <CreditCard className="mx-auto text-slate-300" size={64} />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-4">No Packages Available</h3>
                        <p className="text-slate-500 mt-2">Please check back later for available packages.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                        {packages.map((pkg, index) => (
                            <PackageCard 
                                key={pkg.id} 
                                pkg={pkg} 
                                index={index}
                                onPurchase={handlePurchase}
                            />
                        ))}
                    </div>
                )}

                {/* Trust Badges */}
                <motion.div 
                    className="mt-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-sm text-slate-500 mb-4">Trusted by 10,000+ users across India</p>
                    <div className="flex justify-center items-center gap-8 flex-wrap opacity-60">
                        <span className="font-bold text-xl text-slate-400">🔒 Secure Payments</span>
                        <span className="font-bold text-xl text-slate-400">💳 All Cards Accepted</span>
                        <span className="font-bold text-xl text-slate-400">✅ Instant Activation</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
