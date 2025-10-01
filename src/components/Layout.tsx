import { Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navigation from "./Navigation";
import WorkspaceSelector from "./WorkspaceSelector";

export default function Layout() {
  const { state } = useApp();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        color: state.currentTheme.colors.text,
      }}
    >
      <header
        className="border-b px-4 py-3"
        style={{ borderColor: state.currentTheme.colors.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1
              className="text-2xl font-bold"
              style={{ color: state.currentTheme.colors.primary }}
            >
              Serena
            </h1>
            <WorkspaceSelector />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex pb-16">
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <Navigation />
    </div>
  );
}
