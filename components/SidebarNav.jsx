import {
  BarChart3,
  BookText,
  Brain,
  CalendarDays,
  Compass,
  FileText as FileNotes,
  Flame,
  ListOrdered,
  LayoutDashboard,
  ShoppingBag,
  Shield,
  Sparkles,
  Star,
  Timer,
  Trophy,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "achievements", label: "Achievements", icon: Star },
  { id: "flashcards", label: "Flashcards", icon: BookText },
  { id: "quiz", label: "Quiz Battle", icon: Brain },
  { id: "travelling", label: "Travelling", icon: Compass },
  { id: "gathering", label: "Gathering Supplies", icon: ListOrdered },
  { id: "focus-ritual", label: "Focus Ritual", icon: Flame },
  { id: "party", label: "Party", icon: Shield },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "leaderboard", label: "Leaderboards", icon: Trophy },
  { id: "customize", label: "Avatar Lab", icon: User },
  { id: "planner", label: "Study Planner", icon: Timer },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "notes", label: "Notes", icon: FileNotes },
];

function SidebarNav({ activeView, seasonTitle, onSetActiveView }) {
  return (
    <aside className="sidebar-nav">
      <div className="sidebar-brand">
        <Shield size={18} />
        <strong>FocusFlow Guild</strong>
      </div>
      <div className="sidebar-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button key={item.id} type="button" className={`sidebar-link ${active ? "is-active" : ""}`} onClick={() => onSetActiveView(item.id)}>
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="sidebar-footer">
        <Sparkles size={14} />
        <span>{seasonTitle}</span>
      </div>
    </aside>
  );
}

export default SidebarNav;
