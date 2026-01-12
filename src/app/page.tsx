'use client';
import { useEffect, useState } from 'react';
import {
  Cpu, HardDrive, Clock, Activity,
  Wifi, Zap, Thermometer, Cloud, Globe,
  Power, Download, List
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [stats, setStats] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/system');
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string) => {
    const prompt = action === 'reboot' ? 'Reboot system?' : 'Upgrade packages? This may take a while.';
    if (!confirm(prompt)) return;

    setLoadingAction(action);
    try {
      const res = await fetch('/api/system/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      alert(data.message || 'Action triggered');
    } catch (e) {
      alert('Action failed');
    } finally {
      setLoadingAction('');
    }
  };

  if (!stats) return <div className="p-8 text-center text-muted">Loading system metrics...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold neon-text">System Overview</h1>
        <div className="flex gap-3">
          <Link href="/processes">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition border border-blue-600/20">
              <List size={18} /> Process Monitor
            </button>
          </Link>
          <button
            onClick={() => handleAction('upgrade')}
            disabled={!!loadingAction}
            className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition border border-green-600/20 disabled:opacity-50"
          >
            <Download size={18} /> {loadingAction === 'upgrade' ? 'Upgrading...' : 'Upgrade Pkg'}
          </button>
          <button
            onClick={() => handleAction('reboot')}
            disabled={!!loadingAction}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition border border-red-600/20 disabled:opacity-50"
          >
            <Power size={18} /> {loadingAction === 'reboot' ? 'Rebooting...' : 'Reboot'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Core Resources */}
        <StatsCard
          title="CPU Load"
          value={stats.loadAvg && stats.loadAvg[0]?.toFixed(2)}
          sub={`${stats.cpus?.count} Cores`}
          icon={Cpu}
        />
        <StatsCard
          title="Memory"
          value={formatBytes(stats.memory?.used)}
          sub={`${stats.memory?.percent}% / ${formatBytes(stats.memory?.total)}`}
          icon={Activity}
          percent={stats.memory?.percent}
        />
        <StatsCard
          title="Storage"
          value={formatBytes(stats.disk?.used)}
          sub={`${stats.disk?.percent}% / ${formatBytes(stats.disk?.total)}`}
          icon={HardDrive}
          percent={stats.disk?.percent}
        />
        <StatsCard
          title="Uptime"
          value={formatUptime(stats.uptime)}
          sub="Since last boot"
          icon={Clock}
        />

        {/* Row 2: Network & Environment */}
        <StatsCard
          title="Public IP"
          value={stats.network?.publicIp || 'Unknown'}
          sub="External Address"
          icon={Globe}
          color="text-blue-400"
        />
        <StatsCard
          title="WiFi SSID"
          value={stats.network?.ssid || 'Ethernet'}
          sub="Network Connection"
          icon={Wifi}
          color={stats.network?.ssid === 'Unknown' ? 'text-gray-500' : 'text-green-400'}
        />
        <StatsCard
          title="House Power"
          value={stats.power?.status === "Listrik Dirumah Menyala" ? "On / Charging" : (stats.power?.status === "Listrik Dirumah Mati" ? "OFF / Outage" : stats.power?.status)}
          sub={stats.power?.status === "Listrik Dirumah Menyala" ? "Power is OK" : "Running on Battery!"}
          icon={Zap}
          color={stats.power?.status === "Listrik Dirumah Menyala" ? "text-yellow-400" : "text-red-500"}
        />
        <div className="grid grid-cols-2 gap-4">
          <MiniCard
            title="Consump."
            value={`${stats.power?.watts?.toFixed(1) || 0} W`}
            icon={Zap}
          />
          <MiniCard
            title="CPU Temp"
            value={`${stats.cpu?.temp?.toFixed(1) || 0}°C`}
            icon={Thermometer}
            isDanger={(stats.cpu?.temp || 0) > 80}
          />
        </div>

        {/* Row 3: Weather (Spans if possible, or just a card) */}
        {stats.weather && (
          <StatsCard
            title={`Weather: ${stats.weather.location}`}
            value={`${stats.weather.temp}°C`}
            sub={`Code: ${stats.weather.code} (${stats.weather.country})`}
            icon={Cloud}
            color="text-cyan-400"
          />
        )}
      </div>
    </div>
  )
}

function StatsCard({ title, value, sub, icon: Icon, percent, color }: any) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="card hover:border-primary transition-colors cursor-default flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-muted text-sm font-medium">{title}</div>
          <Icon className={color || "text-primary"} size={20} />
        </div>
        <div className="text-xl font-bold mb-1 truncate" title={value}>{value}</div>
        <div className="text-xs text-muted truncate">{sub}</div>
      </div>
      {percent !== undefined && (
        <div className="mt-4 h-1.5 w-full bg-[#333] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </motion.div>
  )
}

function MiniCard({ title, value, icon: Icon, isDanger }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`card flex flex-col justify-center items-center text-center p-3 ${isDanger ? 'border-red-500/50 bg-red-500/10' : ''}`}
    >
      <Icon className={`mb-2 ${isDanger ? 'text-red-500' : 'text-primary'}`} size={18} />
      <div className="text-xs text-muted mb-1">{title}</div>
      <div className="text-lg font-bold">{value}</div>
    </motion.div>
  )
}

function formatBytes(bytes: number) {
  if (!bytes && bytes !== 0) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(seconds: number) {
  if (!seconds) return '-';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  return `${d}d ${h}h ${m}m`;
}
