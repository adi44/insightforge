import { useState, useCallback } from "react";
import { Upload as UploadIcon, FileSpreadsheet, X, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleAnalyze = () => {
    navigate("/analysis", { state: { fileName: file?.name } });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Upload Dataset</h2>
        <p className="text-slate-500 mt-1">
          Upload a CSV file to start the AI analysis pipeline
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <UploadIcon className="w-10 h-10 mx-auto text-slate-400" />
        <p className="mt-4 text-sm font-medium text-slate-700">
          Drag & drop your CSV file here
        </p>
        <p className="text-xs text-slate-500 mt-1">or click to browse</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ position: "relative" }}
        />
      </div>

      {file && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Run AI Analysis
          </button>
        </div>
      )}

      <div className="mt-8 bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">
          What happens next?
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Data Quality Agent checks for missing values & duplicates
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            EDA Agent computes statistics & correlations
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            Insight Agent derives business recommendations
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            Visualization Agent generates charts
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
            Report Agent compiles the final deliverable
          </li>
        </ul>
      </div>
    </div>
  );
}
