import { Suspense, lazy } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import AppUpdateNotification from "./components/AppUpdateNotification";
import AppWithOnboarding from "./components/AppWithOnboarding";
import LoadingSpinner from "./components/LoadingSpinner";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Tasks = lazy(() => import("./pages/Tasks"));
const NewTask = lazy(() => import("./pages/NewTask"));
const Projects = lazy(() => import("./pages/Projects"));
const Habits = lazy(() => import("./pages/Habits"));
const Countdowns = lazy(() => import("./pages/Countdowns"));
const Profile = lazy(() => import("./pages/Profile"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));

import EmailVerification from "./pages/EmailVerification";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppWithOnboarding />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Home />
                  </Suspense>
                }
              />
              <Route
                path="calendar"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Calendar />
                  </Suspense>
                }
              />
              <Route
                path="tasks"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Tasks />
                  </Suspense>
                }
              />
              <Route
                path="new-task"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NewTask />
                  </Suspense>
                }
              />
              <Route
                path="projects"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Projects />
                  </Suspense>
                }
              />
              <Route
                path="habits"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Habits />
                  </Suspense>
                }
              />
              <Route
                path="countdowns"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Countdowns />
                  </Suspense>
                }
              />
              <Route
                path="profile"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Profile />
                  </Suspense>
                }
              />
              <Route
                path="notifications"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotificationSettings />
                  </Suspense>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <PWAInstallPrompt />
          <AppUpdateNotification />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
