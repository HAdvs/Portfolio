/* Entry — full project type-check gate */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import { AuthProvider } from "./admin/lib/auth";
import { CmsProvider } from "./lib/cms/CmsProvider";
import ErrorBoundary from "./components/ErrorBoundary";

/*
 * Provider order matters:
 *   ErrorBoundary → Router → Auth (Supabase) → CMS (React Query + realtime)
 * CmsProvider sits inside AuthProvider so hydration can react to sessions,
 * and wraps BOTH the public site and the admin area — one source of truth.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CmsProvider>
            <Routes>
              {/* Hidden admin routes — never linked from the public site */}
              <Route path="/admin/*" element={<AdminApp />} />
              {/* Public portfolio site */}
              <Route path="/*" element={<App />} />
            </Routes>
          </CmsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
