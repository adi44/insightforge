import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Database,
  BarChart3,
  Sparkles,
  Image,
  FileText,
  AlertCircle,
} from "lucide-react";

type AgentStatus = "pending" | "running" | "complete";

interface AgentStep {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: AgentStatus;
}

interface AnalysisResult {
  quality: {
    total_records: number;
    total_columns: number;
    missing_values: number;
    duplicate_rows: number;
    column_types: Record<string, string>;
  };
  eda: {
    numeric_columns: string[];
    categorical_columns: string[];
  };
  insights: string[];
  report: string;
}

const HISTORY_KEY = "insightforge_history";

function saveHistory(filename: string, result: AnalysisResult) {
  const qualityScore = Math.round(
    ((result.quality.total_records * result.quality.total_columns - result.quality.missing_values) /
      (result.quality.total_records * result.quality.total_columns)) *
      100
  );
  const entry = {
    filename,
    timestamp: Date.now(),
    records: result.quality.total_records,
    columns: result.quality.total_columns,
    quality_score: qualityScore,
  };
  const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  const updated = [entry, ...existing.filter((e: typeof entry) => e.filename !== filename)].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

const initialSteps: AgentStep[] = [
  { id: "quality", name: "Data Quality Agent", description: "Checking for missing values, duplicates, and types", icon: Database, status: "pending" },
  { id: "eda", name: "EDA Agent", description: "Computing statistics and correlations", icon: BarChart3, status: "pending" },
  { id: "insight", name: "Insight Agent", description: "Deriving business insights", icon: Sparkles, status: "pending" },
  { id: "viz", name: "Visualization Agent", description: "Generating charts", icon: Image, status: "pending" },
  { id: "report", name: "Report Agent", description: "Compiling final report", icon: FileText, status: "pending" },
];

export default function Analysis() {
  const location = useLocation();
  const fileName = (location.state as { fileName?: string })?.fileName ?? "sample_dataset.csv";
  const [steps, setSteps] = useState<AgentStep[]>(initialSteps);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const apiCall = fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fileName }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Analysis failed (${r.status})`);
        return r.json() as Promise<AnalysisResult>;
      });

      // Animate through first 4 steps while API is running
      for (let i = 0; i < initialSteps.length - 1; i++) {
        if (cancelled) return;
        setSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx < i ? "complete" : idx === i ? "running" : s.status,
          }))
        );
        await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
      }

      // Hold on last step until API resolves
      if (cancelled) return;
      setSteps((prev) =>
        prev.map((s, idx) => ({ ...s, status: idx < 4 ? "complete" : "running" }))
      );

      try {
        const data = await apiCall;
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 400));
        setSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));
        setResult(data);
        saveHistory(fileName, data);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    };

    run();
    return () => { cancelled = true; };
  }, [fileName]);

  const allComplete = steps.every((s) => s.status === "complete");

  const qualityScore = result
    ? Math.round(
        ((result.quality.total_records * result.quality.total_columns - result.quality.missing_values) /
          (result.quality.total_records * result.quality.total_columns)) *
          100
      )
    : null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Analysis Pipeline</h2>
        <p className="text-slate-500 mt-1">
          Analyzing <span className="font-medium text-slate-700">{fileName}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="px-5 py-4 flex items-center gap-4">
              <StatusIcon status={step.status} />
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{step.name}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              <StatusLabel status={step.status} />
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">Analysis Failed</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {allComplete && result && (
        <>
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">Analysis Complete</p>
                <p className="text-xs text-green-700 mt-0.5">
                  All 5 agents finished successfully. Report ready for review.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Records</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{result.quality.total_records}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Columns</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{result.quality.total_columns}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Missing Values</p>
              <p className={`text-2xl font-bold mt-1 ${result.quality.missing_values > 0 ? "text-amber-600" : "text-green-600"}`}>
                {result.quality.missing_values}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Quality Score</p>
              <p className={`text-2xl font-bold mt-1 ${qualityScore! >= 90 ? "text-green-600" : qualityScore! >= 70 ? "text-amber-600" : "text-red-600"}`}>
                {qualityScore}%
              </p>
            </div>
          </div>

          {result.insights.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Insights</h3>
              <ul className="space-y-2">
                {result.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.eda.numeric_columns.length > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Column Summary</h3>
              <div className="flex flex-wrap gap-2">
                {result.eda.numeric_columns.map((col) => (
                  <span key={col} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {col} (numeric)
                  </span>
                ))}
                {result.eda.categorical_columns.map((col) => (
                  <span key={col} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.charts.length > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Visualizations</h3>
              <div className="grid grid-cols-1 gap-4">
                {result.charts.map((url) => {
                  const name = url.split("/").pop()?.replace("_histogram.png", "") ?? url;
                  return (
                    <div key={url}>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                        {name} distribution
                      </p>
                      <img
                        src={`http://localhost:8001${url}`}
                        alt={`${name} histogram`}
                        className="w-full rounded-lg border border-slate-100"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.report && (
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Report</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{result.report}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: AgentStatus }) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "running":
      return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
    default:
      return <Circle className="w-5 h-5 text-slate-300" />;
  }
}

function StatusLabel({ status }: { status: AgentStatus }) {
  switch (status) {
    case "complete":
      return (
        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          Done
        </span>
      );
    case "running":
      return (
        <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
          Running
        </span>
      );
    default:
      return (
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
          Pending
        </span>
      );
  }
}
