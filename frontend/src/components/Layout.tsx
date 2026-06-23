import { Outlet, NavLink } from "react-router-dom";
import { BarChart3, Upload, LayoutDashboard, MessageSquare, Activity } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/analysis", icon: BarChart3, label: "Analysis" },
  { to: "/telemetry", icon: Activity, label: "Telemetry" },
];

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            InsightForge
          </h1>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Analytics</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
            <p className="text-xs font-medium text-indigo-700">Multi-Agent AI</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Claude + AutoGen
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
