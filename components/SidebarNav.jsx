import {
  BarChart3,
  BookText,
  Brain,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudOff,
  ClipboardCheck,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Palette,
  RefreshCw,
  ShoppingBag,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "flashcards", label: "Flashcards", icon: BookText },
  { id: "quiz", label: "Quiz Battle", icon: Brain },
  { id: "practicetest", label: "Practice Test", icon: ClipboardCheck },
  { id: "planner", label: "Study Planner", icon: LayoutList },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "party", label: "Party", icon: Shield },
  { id: "achievements", label: "Achievements", icon: Star },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "customize", label: "Avatar Lab", icon: User },
  { id: "profile", label: "Profile", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const THEMES = [
  { id: "default", label: "Classic", color: "#ffd36c" },
  { id: "neon", label: "Neon", color: "#7ce0ff" },
  { id: "forest", label: "Forest", color: "#56d77f" },
];

function SidebarNav({
  activeView,
  seasonTitle,
  onSetActiveView,
  collapsed,
  onToggleCollapse,
  currentTheme,
  onPickTheme,
  onAutoTheme,
  onLogout,
  syncStatus,
  backendEnabled,
  onRetrySync,
}) {
  const syncOk = !backendEnabled || syncStatus === "synced" || syncStatus === "idle";

  return (
    <aside className={`sidebar-nav ${collapsed ? "is-collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <Shield size={18} className="sidebar-brand-icon" />
        {!collapsed && <strong>FocusFlow</strong>}
        <button
          type="button"
          className="sidebar-collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-tutorial="sidebar-toggle"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="sidebar-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${active ? "is-active" : ""}`}
              onClick={() => onSetActiveView(item.id)}
              data-tutorial={`nav-${item.id}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Theme picker */}
      {!collapsed ? (
        <div className="sidebar-section">
          <p className="sidebar-section-label">
            <Palette size={12} />
            Theme
          </p>
          <div className="sidebar-theme-row">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`sidebar-theme-swatch ${currentTheme === t.id ? "is-active" : ""}`}
                style={{ "--swatch-color": t.color }}
                onClick={() => onPickTheme(t.id)}
                title={t.label}
              />
            ))}
            <button
              type="button"
              className={`sidebar-theme-swatch sidebar-theme-swatch--auto ${currentTheme === "auto" ? "is-active" : ""}`}
              onClick={onAutoTheme}
              title="Auto"
            >
              <Sparkles size={10} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="sidebar-link sidebar-link--icon-only"
          title="Theme"
          onClick={() => onPickTheme(currentTheme === "default" ? "neon" : currentTheme === "neon" ? "forest" : "default")}
        >
          <Palette size={16} />
        </button>
      )}

      {/* Sync status */}
      {backendEnabled && (
        <div className={`sidebar-sync ${syncOk ? "sidebar-sync--ok" : "sidebar-sync--warn"}`} title={`Sync: ${syncStatus}`}>
          {syncOk ? <Cloud size={13} /> : <CloudOff size={13} />}
          {!collapsed && (
            <>
              <span>{syncStatus}</span>
              {syncStatus === "degraded" && (
                <button type="button" className="sidebar-sync-retry" onClick={onRetrySync} title="Retry sync">
                  <RefreshCw size={11} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Logout */}
      <button
        type="button"
        className="sidebar-logout"
        onClick={onLogout}
        title="Logout"
      >
        <LogOut size={15} />
        {!collapsed && <span>Logout</span>}
      </button>

      {/* Season footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <Sparkles size={12} />
          <span>{seasonTitle}</span>
        </div>
      )}
    </aside>
  );
}

export default SidebarNav;
