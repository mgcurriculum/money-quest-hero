import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, HelpCircle, Settings, LogOut, Loader2, Megaphone } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Questions', path: '/admin/questions', icon: HelpCircle },
  { label: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { isAdmin, isLoading, user, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <img src="/favicon.png" alt="FinQuo Versity" className="w-8 h-8" />
          <div>
            <h2 className="font-display text-sm font-bold text-primary">FinQuo Versity</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { signOut(); navigate('/admin/login'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
