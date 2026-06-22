import { useState, useRef, useEffect } from "react";
import { Send, Upload, FileSpreadsheet, Bot, User, Loader2, X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  agents_used?: string[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("/api/datasets/upload", formData);
      setUploadedFilename(res.data.filename);
      setMessages([
        {
          role: "assistant",
          content: `I've loaded **${res.data.filename}** (${(res.data.size / 1024).toFixed(1)} KB). Ask me anything about this dataset — I'll use my agent team to analyze it for you.`,
          agents_used: ["Admin Agent"],
        },
      ]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: "Failed to upload the file. Please make sure it's a valid CSV.",
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !uploadedFilename) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: input,
        filename: uploadedFilename,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.content,
          agents_used: res.data.agents_used,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chat with your data
            </h2>
            <p className="text-sm text-slate-500">
              Upload a CSV and ask questions — AI agents collaborate to answer
            </p>
          </div>
          {uploadedFilename && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {uploadedFilename}
              </span>
              <button
                onClick={() => {
                  setUploadedFilename(null);
                  setMessages([]);
                }}
                className="text-green-500 hover:text-green-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {!uploadedFilename && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-10 text-center max-w-md w-full">
              <Upload className="w-10 h-10 mx-auto text-slate-400" />
              <p className="mt-4 text-sm font-medium text-slate-700">
                Upload a CSV to start chatting
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Your AI agent team will analyze it
              </p>
              <label className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700 transition-colors">
                <Upload className="w-4 h-4" />
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.agents_used && msg.agents_used.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                  {msg.agents_used.map((agent) => (
                    <span
                      key={agent}
                      className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                    >
                      <Sparkles className="w-3 h-3" />
                      {agent}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Agents analyzing...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {uploadedFilename && (
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about your data..."
              disabled={loading}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
