import {
  BarChart3,
  BookText,
  Brain,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingBag,
  Shield,
  Sparkles,
  Star,
  Timer,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "planner", label: "Study Planner", icon: Timer },
  { id: "flashcards", label: "Flashcards", icon: BookText },
  { id: "quiz", label: "Quiz Battle", icon: Brain },
  { id: "party", label: "Party", icon: Shield },
  { id: "achievements", label: "Achievements", icon: Star },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "customize", label: "Avatar Lab", icon: User },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarNav({ activeView, seasonTitle, onSetActiveView, collapsed, onToggleCollapse }) {
  return (
    <aside className={`sidebar-nav ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-brand">
        <Shield size={18} />
        <strong>{collapsed ? "FF" : "FocusFlow Guild"}</strong>
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
      <div className="sidebar-menu">
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
            >
              <Icon size={16} />
              <span>{collapsed ? "" : item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="sidebar-footer" style={{ display: collapsed ? "none" : "inline-flex" }}>
        <Sparkles size={14} />
        <span>{seasonTitle}</span>
      </div>
    </aside>
  );
}

export default SidebarNav;
