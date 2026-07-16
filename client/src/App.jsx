import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout & Frame Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import Loader from './components/Loader';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Emergencies from './pages/Emergencies';
import NewEmergency from './pages/NewEmergency';
import AIOperator from './pages/AIOperator';
import Resources from './pages/Resources';
import Volunteers from './pages/Volunteers';
import Profile from './pages/Profile';
import NotFound from './pages/404';

import { emergencyService } from './services/emergencyService';

// Grid Console Outer Shell Layout (Navbar + Sidebar + Notifications Sidebar + Main Panel)
function GridConsoleLayout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchCriticalNotifications = async () => {
    try {
      const res = await emergencyService.getEmergencies();
      const criticalEmergencies = (res.data || []).filter(
        e => e.status !== 'Resolved' && e.priority === 'Critical'
      );
      const formatted = criticalEmergencies.map(e => ({
        id: e._id,
        type: 'critical',
        title: e.title.toUpperCase(),
        message: e.description,
        time: e.location
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error('Failed to load real critical notifications:', err);
    }
  };

  useEffect(() => {
    fetchCriticalNotifications();
    const interval = setInterval(fetchCriticalNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#03030d] text-zinc-100 font-outfit select-none relative">
      <Navbar
        onOpenNotifications={() => setNotifOpen(true)}
        notificationCount={notifications.length}
      />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
      <Notifications
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onClearAll={handleClearAll}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Check if session booted already to avoid repetitive loading screens on tab refresh
    const booted = sessionStorage.getItem('booted');
    if (booted === 'true') {
      setBooting(false);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('booted', 'true');
    setBooting(false);
  };

  if (booting) {
    return <Loader onComplete={handleBootComplete} />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Views without GridConsole wrapper */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<NotFound />} />

          {/* Protected Grid Console Views */}
          <Route element={<ProtectedRoute allowedRoles={['Civilian', 'Volunteer', 'AI Operator', 'Admin']} />}>
            <Route element={<GridConsoleLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/emergencies" element={<Emergencies />} />
              <Route path="/emergencies/new" element={<NewEmergency />} />
              <Route path="/ai-operator" element={<AIOperator />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback 404 handler */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
