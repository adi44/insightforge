import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Database, FileCheck, Sparkles, Play } from "lucide-react";

const HISTORY_KEY = "insightforge_history";

interface HistoryEntry {
  filename: string;
  timestamp: number;
  records: number;
  columns: number;
  quality_score: number;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [datasetCount, setDatasetCount] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((data: { filename: string; size: number }[]) => setDatasetCount(data.length))
      .catch(() => setDatasetCount(0));

    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    setHistory(stored);
  }, []);

  const avgQuality =
    history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.quality_score, 0) / history.length)
      : null;

  const stats = [
    {
      label: "Datasets Available",
      value: datasetCount !== null ? String(datasetCount) : "—",
      icon: Database,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg Quality Score",
      value: avgQuality !== null ? `${avgQuality}%` : "—",
      icon: FileCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Analyses Run",
      value: String(history.length),
      icon: Sparkles,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Total Records",
      value: history.length > 0 ? String(history.reduce((s, h) => s + h.records, 0)) : "—",
      icon: BarChart3,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">Overview of your analytics pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Recent Analyses</h3>
        </div>
        {history.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-500">No analyses yet.</p>
            <button
              onClick={() => navigate("/upload")}
              className="mt-3 inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:underline"
            >
              <Play className="w-4 h-4" />
              Upload a dataset to get started
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div key={item.filename + item.timestamp} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.filename}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{timeAgo(item.timestamp)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{item.records} rows</span>
                  <span className="text-xs text-slate-500">{item.columns} cols</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.quality_score >= 90
                        ? "bg-green-50 text-green-700"
                        : item.quality_score >= 70
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.quality_score}% quality
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-medium">1. Upload</p>
            <p className="text-sm text-indigo-100 mt-1">Upload your CSV dataset</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-medium">2. AI Agents Analyze</p>
            <p className="text-sm text-indigo-100 mt-1">5 specialized agents collaborate</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-medium">3. Get Insights</p>
            <p className="text-sm text-indigo-100 mt-1">Quality, EDA, visualizations & report</p>
          </div>
        </div>
      </div>
    </div>
  );
}
