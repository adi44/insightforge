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
} from "lucide-react";

type AgentStatus = "pending" | "running" | "complete";

interface AgentStep {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: AgentStatus;
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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) return;

    setSteps((prev) =>
      prev.map((s, i) => (i === currentStep ? { ...s, status: "running" } : s))
    );

    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) => (i === currentStep ? { ...s, status: "complete" } : s))
      );
      setCurrentStep((c) => c + 1);
    }, 1500 + Math.random() * 1000);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const allComplete = steps.every((s) => s.status === "complete");

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

      {allComplete && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                Analysis Complete
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                All 5 agents finished successfully. Report ready for review.
              </p>
            </div>
          </div>
        </div>
      )}

      {allComplete && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Records</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">20</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Columns</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Missing Values</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">3</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Quality Score</p>
            <p className="text-2xl font-bold text-green-600 mt-1">94%</p>
          </div>
        </div>
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
