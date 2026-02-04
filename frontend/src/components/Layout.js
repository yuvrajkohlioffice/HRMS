import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'company_admin', 'manager', 'employee'] },
    { name: 'Employees', href: '/employees', icon: Users, roles: ['super_admin', 'company_admin', 'manager'] },
    { name: 'Organization', href: '/organization', icon: Building2, roles: ['super_admin', 'company_admin'] },
    { name: 'Attendance', href: '/attendance', icon: Clock, roles: ['super_admin', 'company_admin', 'manager', 'employee'] },
    { name: 'Leave Management', href: '/leaves', icon: Calendar, roles: ['super_admin', 'company_admin', 'manager', 'employee'] },
    { name: 'Payroll', href: '/payroll', icon: DollarSign, roles: ['super_admin', 'company_admin'] },
    { name: 'Recruitment', href: '/recruitment', icon: UserPlus, roles: ['super_admin', 'company_admin', 'manager'] },
    { name: 'Performance', href: '/performance', icon: TrendingUp, roles: ['super_admin', 'company_admin', 'manager'] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const sidebarClasses = sidebarOpen ? 'w-64' : 'w-20';

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={sidebarClasses + ' flex flex-col border-r border-slate-200 bg-white transition-all duration-300'}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold tracking-tight text-indigo-700" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Nexus HR
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-2 hover:bg-slate-100"
            data-testid="sidebar-toggle-btn"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const activeClasses = isActive ? 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors bg-indigo-50 text-indigo-700' : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900';
            return (
              <Link
                key={item.name}
                to={item.href}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                className={
                  isActive
                    ? 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors bg-indigo-50 text-indigo-700'
                    : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            data-testid="logout-btn"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900" data-testid="user-name">{user?.email}</p>
              <p className="text-xs text-slate-500" data-testid="user-role">
                {user?.role?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-indigo-700">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
