import { useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import "./App.css";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Categories", path: "/categories", icon: Tags },
];

const metrics = [
  {
    label: "Total Products",
    icon: Package,
    description: "Products in your catalog",
  },
  {
    label: "Total Customers",
    icon: Users,
    description: "Customers in your database",
  },
  { label: "Total Orders", icon: ShoppingCart, description: "Orders recorded" },
  {
    label: "Sales Value",
    icon: Wallet,
    description: "Based on available order data",
  },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Boxes size={21} strokeWidth={2.3} />
          </div>
          <div>
            <span className="brand-name">W3Admin</span>
            <span className="brand-caption">MANAGEMENT SYSTEM</span>
          </div>
          <button
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="nav-section-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={18} />
            </div>
            <div>
              <p className="help-title">Need a hand?</p>
              <p className="help-description">Your workspace, organized.</p>
            </div>
          </div>
          <div className="sidebar-footer">
            <span className="status-dot" />
            <span>System workspace</span>
            <span className="version-label">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenuClick }) {
  const location = useLocation();
  const currentPage = navigation.find(
    (item) => item.path === location.pathname,
  );
  const title = currentPage?.label ?? "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>
        <div>
          <div className="breadcrumb">
            Workspace <span>/</span> {title}
          </div>
          <h1 className="page-heading">{title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input type="search" placeholder="Search..." aria-label="Search" />
          <span className="search-shortcut">⌘ K</span>
        </label>
        <button
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
        <div className="topbar-divider" />
        <button className="profile-button" aria-label="Admin profile">
          <span className="avatar">AD</span>
          <span className="profile-copy">
            <span className="profile-name">Administrator</span>
            <span className="profile-role">Workspace admin</span>
          </span>
          <ChevronDown size={15} className="profile-chevron" />
        </button>
      </div>
    </header>
  );
}

function MetricCard({ label, icon: Icon, description }) {
  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <span className="metric-icon">
          <Icon size={19} strokeWidth={1.9} />
        </span>
        <span className="metric-period">
          <Clock3 size={12} /> All time
        </span>
      </div>
      <p className="metric-label">{label}</p>
      <div className="metric-value">—</div>
      <p className="metric-description">{description}</p>
    </article>
  );
}

function ChartPanel({ title, subtitle, icon: Icon, wide = false }) {
  return (
    <section className={`panel chart-panel ${wide ? "chart-panel-wide" : ""}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button
          className="panel-icon-button"
          aria-label={`${title} information`}
        >
          <Icon size={18} />
        </button>
      </div>
      <div className="chart-empty">
        <div className="chart-empty-icon">
          <ChartNoAxesCombined size={23} />
        </div>
        <p className="empty-title">Analytics will appear here</p>
        <p className="empty-description">
          This chart will display insights from your database once the analytics
          API is connected.
        </p>
      </div>
    </section>
  );
}

function RecentOrders() {
  return (
    <section className="panel orders-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent Orders</h2>
          <p>A quick look at your latest transactions</p>
        </div>
        <span className="coming-soon-label">Data pending</span>
      </div>
      <div className="table-scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>ORDER DATE</th>
              <th>STATUS</th>
              <th className="amount-column">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5}>
                <div className="table-empty">
                  <div className="table-empty-icon">
                    <ShoppingCart size={21} />
                  </div>
                  <p className="empty-title">No order data connected yet</p>
                  <p className="empty-description">
                    Real orders will show here after the dashboard API is
                    implemented.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Dashboard() {
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2 className="welcome-heading">
            Welcome back, Admin <span>✦</span>
          </h2>
          <p className="welcome-description">
            Here’s what’s happening with your business workspace.
          </p>
        </div>
        <div className="data-status">
          <span className="status-dot" /> Awaiting live data
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="charts-grid">
        <ChartPanel
          title="Sales Overview"
          subtitle="Sales performance over time"
          icon={ArrowUpRight}
          wide
        />
        <ChartPanel
          title="Orders Trend"
          subtitle="Order volume over time"
          icon={ArrowDownRight}
        />
      </div>

      <RecentOrders />

      <footer className="page-footer">
        <span>
          W3Admin <span className="footer-separator">·</span> Sales & Product
          Management
        </span>
        <span>Built for clarity. Designed for growth.</span>
      </footer>
    </div>
  );
}

function PlaceholderPage({ title }) {
  const Icon =
    title === "Products" ? Package : title === "Customers" ? Users : Tags;
  const descriptions = {
    Products: "Manage your product catalog, prices, and category assignments.",
    Customers: "View and maintain your customer records.",
    Categories: "Organize products into clear, manageable categories.",
  };

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">WORKSPACE / MANAGEMENT</p>
          <h2 className="welcome-heading">{title}</h2>
          <p className="welcome-description">{descriptions[title]}</p>
        </div>
      </div>
      <section className="panel feature-placeholder">
        <div className="feature-placeholder-icon">
          <Icon size={25} />
        </div>
        <h2>{title} management is next</h2>
        <p>
          The page layout is ready. We’ll connect it to the existing backend and
          implement real data, search, pagination, and forms in the next steps.
        </p>
      </section>
    </div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/products"
              element={<PlaceholderPage title="Products" />}
            />
            <Route
              path="/customers"
              element={<PlaceholderPage title="Customers" />}
            />
            <Route
              path="/categories"
              element={<PlaceholderPage title="Categories" />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
