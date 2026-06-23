import { useEffect, useState } from "react";
import { Activity, Clock, Zap, AlertCircle, CheckCircle, Cpu } from "lucide-react";

interface Summary {
  total_requests: number;
  success_rate: number;
  avg_duration_ms: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  avg_tool_calls: number;
  error_count: number;
}

interface Event {
  timestamp: string;
  filename: string;
  question: string;
  duration_ms?: number;
  total_tokens?: number;
  tool_calls?: number;
  success: boolean;
  error?: string;
}

interface TelemetryData {
  summary: Summary;
  recent: Event[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "indigo",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function fmt(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Telemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/telemetry")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<TelemetryData>;
      })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load telemetry: {error}
      </div>
    );
  }

  const { summary, recent } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agent Telemetry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Code execution agent · real-time performance metrics
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Activity}
          label="Total Requests"
          value={summary.total_requests.toLocaleString()}
          sub={`${summary.error_count} error${summary.error_count !== 1 ? "s" : ""}`}
          color="indigo"
        />
        <StatCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${(summary.success_rate * 100).toFixed(1)}%`}
          color={summary.success_rate >= 0.95 ? "green" : "amber"}
        />
        <StatCard
          icon={Clock}
          label="Avg Response Time"
          value={fmt(summary.avg_duration_ms)}
          color="sky"
        />
        <StatCard
          icon={Zap}
          label="Total Tokens Used"
          value={summary.total_tokens.toLocaleString()}
          sub={`↑ ${summary.total_prompt_tokens.toLocaleString()} prompt · ${summary.total_completion_tokens.toLocaleString()} completion`}
          color="purple"
        />
        <StatCard
          icon={Cpu}
          label="Avg Tool Calls / Request"
          value={summary.avg_tool_calls.toFixed(2)}
          sub="pandas executions per question"
          color="amber"
        />
        <StatCard
          icon={AlertCircle}
          label="Errors"
          value={summary.error_count.toString()}
          color={summary.error_count === 0 ? "green" : "red"}
        />
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Recent Requests</h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            No requests yet — ask a question in Chat to see telemetry here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">Dataset</th>
                  <th className="px-6 py-3 text-left">Question</th>
                  <th className="px-6 py-3 text-right">Duration</th>
                  <th className="px-6 py-3 text-right">Tokens</th>
                  <th className="px-6 py-3 text-right">Tool Calls</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      {relativeTime(ev.timestamp)}
                    </td>
                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap max-w-[120px] truncate">
                      {ev.filename}
                    </td>
                    <td className="px-6 py-3 text-slate-700 max-w-[280px] truncate">
                      {ev.question}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600 whitespace-nowrap">
                      {ev.duration_ms != null ? fmt(ev.duration_ms) : "—"}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {ev.total_tokens != null ? ev.total_tokens.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {ev.tool_calls ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {ev.success ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3" /> ok
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <AlertCircle className="w-3 h-3" /> error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
