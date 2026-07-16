import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Shield, LogOut, User as UserIcon } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const Navbar = ({ onOpenNotifications, notificationCount }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('ARE YOU SURE YOU WANT TO LOGOUT AND DISCONNECT NODE?')) {
      logout();
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Crisis Feed', path: '/emergencies' },
    { name: 'AI Operator', path: '/ai-operator' },
    { name: 'Resources', path: '/resources' },
    { name: 'Volunteers', path: '/volunteers' },
  ];

  return (
    <nav className="sticky top-0 z-30 w-full bg-[#05050f]/80 backdrop-blur-md border-b border-cyber-blue/20 shadow-[0_4px_30px_rgba(0,240,255,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-6 h-6 text-cyber-blue group-hover:scale-110 transition-transform duration-300 cyber-glow-blue" />
            <span className="font-orbitron font-black text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-indigo-400 to-cyber-purple">
              SIGNALX
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-orbitron text-xs font-semibold tracking-wider px-3 py-2 rounded-md transition-all duration-300 ${
                      isActive
                        ? 'text-cyber-blue border-b-2 border-cyber-blue bg-cyber-blue-dim/40'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Hand Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green absolute" />
              <span className="text-[10px] font-mono text-cyber-green tracking-widest uppercase">
                GRID_ONLINE
              </span>
            </div>

            {/* Notification Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-zinc-400 hover:text-cyber-blue transition duration-300"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-pink opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyber-pink text-[9px] font-mono font-bold text-white items-center justify-center">
                    {notificationCount}
                  </span>
                </span>
              )}
            </button>

            {/* User Dropdown/Auth state */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:text-cyber-blue transition duration-300"
                >
                  <div className="w-7 h-7 rounded-md border border-cyber-blue/30 bg-cyber-blue-dim flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-cyber-blue" />
                  </div>
                  <span className="font-mono text-xs text-zinc-300 font-semibold max-w-[80px] truncate">
                    {user?.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-zinc-500 hover:text-cyber-pink transition duration-300 p-1 rounded"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="font-orbitron text-xs font-semibold tracking-wider text-zinc-300 hover:text-white px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="font-orbitron text-xs font-semibold tracking-wider bg-cyber-blue-dim text-cyber-blue border border-cyber-blue/40 px-3 py-1.5 rounded hover:bg-cyber-blue hover:text-black transition duration-300"
                >
                  Join Net
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger menu trigger */}
          <div className="md:hidden flex items-center gap-3">
            {/* Notification Trigger Mobile */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-zinc-400 hover:text-cyber-blue transition"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5">
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyber-pink text-[8px] font-mono font-bold text-white items-center justify-center">
                    {notificationCount}
                  </span>
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05050f] border-b border-cyber-blue/20 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-orbitron text-sm font-semibold tracking-wider text-zinc-300 hover:text-cyber-blue px-3 py-2 rounded-md hover:bg-zinc-900/50"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-zinc-800 my-2 pt-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-zinc-300 hover:text-cyber-blue px-3 py-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="font-mono text-sm font-semibold">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-cyber-pink px-3 py-2 font-mono text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center font-orbitron text-sm font-semibold py-2 border border-zinc-800 rounded text-zinc-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center font-orbitron text-sm font-semibold py-2 bg-cyber-blue-dim text-cyber-blue border border-cyber-blue/40 rounded"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
