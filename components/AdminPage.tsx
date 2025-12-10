// Admin Panel - PatternVora
// Protected by email whitelist - Only admins can access

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { api, AdminUser, PromoCode, AdminAnalytics } from '../services/api';
import {
    ArrowLeft, Users, Ticket, BarChart3, Crown, Copy, Check,
    Search, RefreshCw, Plus, Loader2, Shield, AlertTriangle
} from 'lucide-react';

// ADMIN EMAIL WHITELIST
const ADMIN_EMAILS = [
    'mmarsal.asia@gmail.com'
];

interface AdminPageProps {
    onBack: () => void;
}

type TabType = 'users' | 'promo' | 'analytics';

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    const { user, isLoading } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>('users');

    // Check if current user is admin
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8">
                <Shield className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-6 text-center">
                    You don't have permission to access the admin panel.
                </p>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-400" />
                                Admin Panel
                            </h1>
                            <p className="text-sm text-slate-400">PatternVora Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-300">{user?.email}</span>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="bg-slate-800/50 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {[
                            { id: 'users' as TabType, label: 'Users', icon: Users },
                            { id: 'promo' as TabType, label: 'Promo Codes', icon: Ticket },
                            { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                        ? 'text-indigo-400 border-indigo-400 bg-indigo-500/10'
                                        : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto p-6">
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'promo' && <PromoCodeManagement />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
            </main>
        </div>
    );
};

// ============ USER MANAGEMENT ============
const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [upgradingUserId, setUpgradingUserId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.admin.listUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpgrade = async (userId: string, tier: 'free' | 'pro' | 'ltd') => {
        setUpgradingUserId(userId);
        try {
            await api.admin.upgradeUser(userId, tier);
            // Refresh list
            await fetchUsers();
        } catch (err) {
            alert('Failed to upgrade user');
            console.error(err);
        } finally {
            setUpgradingUserId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'ltd':
            case 'pro':
                return <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-900 text-xs font-bold rounded-full">LIFETIME</span>;
            case 'free':
                return <span className="px-2 py-0.5 bg-slate-600 text-slate-200 text-xs font-medium rounded-full">FREE</span>;
            default:
                return <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">{tier}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
                <p className="mb-4">{error}</p>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-white"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Lifetime Users</p>
                    <p className="text-2xl font-bold text-amber-400">
                        {users.filter(u => u.tier === 'ltd' || u.tier === 'pro').length}
                    </p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Free Users</p>
                    <p className="text-2xl font-bold text-slate-300">
                        {users.filter(u => u.tier === 'free').length}
                    </p>
                </div>
            </div>

            {/* User List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tier</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Exports</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                                {user.name?.charAt(0) || user.email.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-white">{user.name || 'No name'}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {getTierBadge(user.tier)}
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                    {user.export_count || 0}
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-sm">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {user.tier !== 'ltd' && user.tier !== 'pro' ? (
                                        <button
                                            onClick={() => handleUpgrade(user.id, 'ltd')}
                                            disabled={upgradingUserId === user.id}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-yellow-900 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {upgradingUserId === user.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Crown size={12} />
                                            )}
                                            Upgrade to Lifetime
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(user.id, 'free')}
                                            disabled={upgradingUserId === user.id}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-200 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {upgradingUserId === user.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : null}
                                            Downgrade
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
};

// ============ PROMO CODE MANAGEMENT ============
const PromoCodeManagement: React.FC = () => {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [newCodeName, setNewCodeName] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchCodes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.admin.listPromoCodes();
            setCodes(data);
        } catch (err) {
            setError('Failed to load promo codes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleGenerateCode = async () => {
        if (!newCodeName.trim()) {
            alert('Please enter a code name');
            return;
        }

        setGenerating(true);
        try {
            await api.admin.generatePromoCode({
                code: newCodeName.toUpperCase().replace(/\s+/g, '-'),
                tier: 'ltd',
                maxUses: 1,
            });
            setNewCodeName('');
            await fetchCodes();
        } catch (err) {
            alert('Failed to generate code');
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Generate New Code */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-indigo-400" />
                    Generate New Promo Code
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="e.g. THANKYOU-FRIEND"
                        value={newCodeName}
                        onChange={(e) => setNewCodeName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateCode()}
                    />
                    <button
                        onClick={handleGenerateCode}
                        disabled={generating || !newCodeName.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                        {generating ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                        Generate
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Generated codes are one-time use only and grant Lifetime access.
                </p>
            </div>

            {/* Code List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold">All Promo Codes ({codes.length})</h3>
                    <button
                        onClick={fetchCodes}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>

                {codes.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        No promo codes yet. Generate one above!
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-700/30">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Code</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tier</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usage</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {codes.map(code => {
                                const isUsed = code.current_uses >= code.max_uses;
                                return (
                                    <tr key={code.id} className={`${isUsed ? 'opacity-50' : ''} hover:bg-slate-700/30 transition-colors`}>
                                        <td className="px-4 py-3">
                                            <code className="px-2 py-1 bg-slate-700 rounded text-indigo-300 font-mono text-sm">
                                                {code.code}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isUsed ? (
                                                <span className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded-full">Used</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Available</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-300 text-xs font-medium rounded-full">
                                                {code.tier.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300 text-sm">
                                            {code.current_uses} / {code.max_uses}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-sm">
                                            {new Date(code.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => copyToClipboard(code.code, code.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-all"
                                            >
                                                {copiedId === code.id ? (
                                                    <>
                                                        <Check size={12} className="text-green-400" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={12} />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ============ ANALYTICS DASHBOARD ============
const AnalyticsDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.admin.getAnalytics();
            setAnalytics(data);
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
                <p className="mb-4">{error || 'No data'}</p>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-white"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6">
                    <p className="text-indigo-200 text-sm font-medium">Total Users</p>
                    <p className="text-4xl font-bold mt-1">{analytics.totalUsers}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl p-6 text-yellow-900">
                    <p className="text-yellow-800 text-sm font-medium">Lifetime Users</p>
                    <p className="text-4xl font-bold mt-1">{analytics.lifetimeUsers}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-6">
                    <p className="text-slate-300 text-sm font-medium">Free Users</p>
                    <p className="text-4xl font-bold mt-1">{analytics.freeUsers}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl p-6">
                    <p className="text-emerald-200 text-sm font-medium">Total Exports</p>
                    <p className="text-4xl font-bold mt-1">{analytics.totalExports}</p>
                </div>
            </div>

            {/* Promo Code Stats */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Promo Code Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Total Codes</p>
                        <p className="text-2xl font-bold">{analytics.promoStats.totalCodes}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Used Codes</p>
                        <p className="text-2xl font-bold text-amber-400">{analytics.promoStats.usedCodes}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Available Codes</p>
                        <p className="text-2xl font-bold text-green-400">{analytics.promoStats.availableCodes}</p>
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                    <RefreshCw size={16} />
                    Refresh Analytics
                </button>
            </div>
        </div>
    );
};

export default AdminPage;
