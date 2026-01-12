'use client';
import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Activity, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ProcessMonitor() {
    const [processes, setProcesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProcesses = async () => {
        try {
            const res = await fetch('/api/processes');
            if (res.ok) {
                const data = await res.json();
                setProcesses(data.processes);
                setError('');
            } else {
                setError('Failed to fetch processes');
            }
        } catch (e) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
        const interval = setInterval(fetchProcesses, 3000); // 3s refresh
        return () => clearInterval(interval);
    }, []);

    const killProcess = async (pid: string) => {
        if (!confirm(`Are you sure you want to kill process ${pid}?`)) return;

        try {
            const res = await fetch('/api/processes/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'kill', pid })
            });
            if (res.ok) {
                fetchProcesses();
            } else {
                alert('Failed to kill process');
            }
        } catch (e) {
            alert('Error killing process');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold neon-text flex items-center gap-2">
                        <Activity className="text-primary" /> Process Monitor
                    </h1>
                </div>
                <button
                    onClick={fetchProcesses}
                    className="p-2 rounded hover:bg-white/10 transition"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="overflow-x-auto bg-black/40 rounded-lg border border-white/10 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-muted bg-white/5">
                            <th className="p-4">PID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">CPU %</th>
                            <th className="p-4">MEM %</th>
                            <th className="p-4 hidden md:table-cell">Args</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {processes.map((proc) => (
                                <motion.tr
                                    key={proc.pid}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4 font-mono text-sm">{proc.pid}</td>
                                    <td className="p-4 font-medium text-primary">{proc.name}</td>
                                    <td className="p-4 font-mono">{proc.cpu}%</td>
                                    <td className="p-4 font-mono">{proc.mem}%</td>
                                    <td className="p-4 text-xs text-muted hidden md:table-cell truncate max-w-xs" title={proc.args}>
                                        {proc.args}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => killProcess(proc.pid)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded transition"
                                            title="Kill Process"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {processes.length === 0 && !loading && (
                    <div className="p-8 text-center text-muted">No processes found.</div>
                )}
            </div>
        </div>
    );
}
