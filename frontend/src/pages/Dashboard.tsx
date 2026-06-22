import { BarChart3, Database, FileCheck, Sparkles } from "lucide-react";

const stats = [
  { label: "Datasets Analyzed", value: "12", icon: Database, color: "bg-blue-50 text-blue-600" },
  { label: "Quality Score", value: "94%", icon: FileCheck, color: "bg-green-50 text-green-600" },
  { label: "Insights Generated", value: "48", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  { label: "Visualizations", value: "36", icon: BarChart3, color: "bg-amber-50 text-amber-600" },
];

const recentAnalyses = [
  { name: "sample_dataset.csv", date: "2 min ago", status: "Complete", agents: 6 },
  { name: "sales_q4.csv", date: "1 hour ago", status: "Complete", agents: 4 },
  { name: "user_metrics.csv", date: "3 hours ago", status: "Complete", agents: 6 },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Overview of your analytics pipeline
        </p>
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
        <div className="divide-y divide-slate-100">
          {recentAnalyses.map((item) => (
            <div key={item.name} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">
                  {item.agents} agents
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-medium">1. Upload</p>
            <p className="text-sm text-indigo-100 mt-1">
              Upload your CSV dataset
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-medium">2. AI Agents Analyze</p>
            <p className="text-sm text-indigo-100 mt-1">
              6 specialized agents collaborate
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-medium">3. Get Insights</p>
            <p className="text-sm text-indigo-100 mt-1">
              Quality, EDA, visualizations & report
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
