import {
  BarChart3,
  BookOpen,
  BookText,
  Brain,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudOff,
  ClipboardCheck,
  FilePlus2,
  Heart,
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

const MAIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "flashcards", label: "Flashcards", icon: BookText },
  { id: "quiz", label: "Quiz Battle", icon: Brain },
  { id: "builder-studio", label: "Builder Studio", icon: FilePlus2 },
  { id: "planner", label: "Study Planner", icon: LayoutList },
  { id: "achievements", label: "Achievements", icon: Star },
  { id: "friends", label: "Friends", icon: Heart },
  { id: "party", label: "Party", icon: Shield },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "customize", label: "Avatar Lab", icon: User },
  { id: "profile", label: "Profile", icon: Sparkles },
];

const STUDY_NAV_ITEMS = [
  { id: "studylab", label: "Study Hub", icon: BookOpen, accent: "#ffd36c", badge: "HUB" },
  { id: "study-leitner", label: "Leitner System", icon: BookOpen, accent: "#ffcc72", badge: "LEI" },
  { id: "study-sq3r", label: "SQ3R Studio", icon: BookText, accent: "#7ce0ff", badge: "SQ3" },
  { id: "study-blurting", label: "Blurting Lab", icon: Brain, accent: "#ff8f7d", badge: "BLT" },
  { id: "study-interleaving", label: "Interleaving Mixer", icon: RefreshCw, accent: "#56d77f", badge: "INT" },
  { id: "study-secondbrain", label: "Second Brain", icon: LayoutList, accent: "#c79bff", badge: "PAR" },
  { id: "study-codetrace", label: "Code Trace", icon: ClipboardCheck, accent: "#93a8ff", badge: "COD" },
];

const THEMES = [
  { id: "default", label: "Classic", color: "#ffd36c" },
  { id: "neon", label: "Neon", color: "#7ce0ff" },
  { id: "forest", label: "Forest", color: "#56d77f" },
];

function SidebarNav({
  activeView,
  seasonTitle,
  deployStamp,
  studySuiteStats,
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

  function renderNavButton(item, extraClass = "") {
    const Icon = item.icon;
    const active = activeView === item.id;
    const isStudy = item.id === "studylab" || item.id.startsWith("study-");

    const studyMetric = isStudy ? Number(studySuiteStats?.[item.id] ?? 0) : null;

    return (
      <button
        key={item.id}
        type="button"
        className={`sidebar-link ${extraClass} ${active ? "is-active" : ""}`.trim()}
        style={isStudy ? { "--study-accent": item.accent ?? "#7ce0ff" } : undefined}
        onClick={() => onSetActiveView(item.id)}
        data-tutorial={`nav-${item.id}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={16} />
        {!collapsed && isStudy && <span className="sidebar-study-badge">{item.badge ?? "ST"}</span>}
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && isStudy && <span className="sidebar-study-metric">{studyMetric}</span>}
      </button>
    );
  }

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
        {!collapsed && <p className="sidebar-section-label sidebar-menu-label">Main</p>}
        {MAIN_NAV_ITEMS.map((item) => renderNavButton(item))}
        {!collapsed && <p className="sidebar-section-label sidebar-menu-label sidebar-menu-label--study">Study Suite</p>}
        <div className="sidebar-study-group">
          {STUDY_NAV_ITEMS.map((item, index) => renderNavButton(item, index === 0 ? "sidebar-link--study sidebar-link--study-hub" : "sidebar-link--study"))}
        </div>
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
          <div>
            <span>{seasonTitle}</span>
            <div className="sidebar-footer-meta">Build {deployStamp}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default SidebarNav;
