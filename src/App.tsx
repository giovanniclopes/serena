import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import Calendar from "./pages/Calendar";
import Countdowns from "./pages/Countdowns";
import EmailVerification from "./pages/EmailVerification";
import Habits from "./pages/Habits";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotificationSettings from "./pages/NotificationSettings";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";

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
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="projects" element={<Projects />} />
              <Route path="habits" element={<Habits />} />
              <Route path="countdowns" element={<Countdowns />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <PWAInstallPrompt />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
