import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "ti-layout-dashboard" },
  { label: "Groups", icon: "ti-users-group" },
  { label: "Activity", icon: "ti-activity" },
  { label: "Settlements", icon: "ti-transfer" },
  { label: "Profile", icon: "ti-user-circle" },
];

function Sidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPath = (label) => `/${label.toLowerCase()}`;
  const isActive = (label) => location.pathname === getPath(label);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ── Mobile top bar ── */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-base">
            S
          </div>
          <span className="font-bold text-gray-900 text-[17px]">SplitEase</span>
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <i className={`ti ${mobileOpen ? "ti-x" : "ti-menu-2"} text-xl`} />
        </button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setMobileOpen(false)}
        >
          <nav
            className="w-64 h-full bg-white flex flex-col py-5 px-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MobileNavLinks
              items={NAV_ITEMS}
              navigate={navigate}
              isActive={isActive}
              onClose={() => setMobileOpen(false)}
            />
            <PromoCard navigate={navigate} />
          </nav>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Tablet: icon-only rail (md) ── */}
        <aside className="hidden md:flex lg:hidden flex-col w-14 min-h-full bg-white border-r border-gray-100 py-5 items-center flex-shrink-0">
          <button onClick={() => navigate("/")} className="mb-6">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-base">
              S
            </div>
          </button>
          <nav className="flex flex-col gap-1 flex-1 w-full px-2">
            {NAV_ITEMS.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => navigate(getPath(label))}
                title={label}
                className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                  isActive(label)
                    ? "bg-orange-50 text-orange-500"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <i className={`ti ${icon} text-[20px]`} aria-hidden="true" />
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Desktop: full sidebar (lg+) ── */}
        <aside className="hidden lg:flex w-56 min-h-full bg-white border-r border-gray-100 flex-col py-5 px-3 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 px-2 mb-7"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-base">
              S
            </div>
            <span className="font-bold text-gray-900 text-[17px]">
              SplitEase
            </span>
          </button>
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => navigate(getPath(label))}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${
                  isActive(label)
                    ? "bg-orange-50 text-orange-500 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <i className={`ti ${icon} text-[18px]`} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
          <PromoCard navigate={navigate} />
        </aside>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex justify-around px-2 py-2 z-20">
        {NAV_ITEMS.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => navigate(getPath(label))}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              isActive(label) ? "text-orange-500" : "text-gray-400"
            }`}
          >
            <i className={`ti ${icon} text-[22px]`} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function PromoCard({ navigate }) {
  return (
    <div className="mt-4 bg-orange-50 rounded-2xl p-4 text-center">
      <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto mb-2">
        <circle cx="20" cy="38" r="14" fill="#FFCCAA" />
        <circle cx="44" cy="38" r="14" fill="#FFD9C2" />
        <rect x="14" y="22" width="12" height="20" rx="6" fill="#F15A22" />
        <rect x="38" y="24" width="12" height="20" rx="6" fill="#FF8A5C" />
        <circle cx="20" cy="18" r="6" fill="#F15A22" />
        <circle cx="44" cy="20" r="6" fill="#FF8A5C" />
      </svg>
      <p className="text-orange-500 font-semibold text-xs leading-snug mb-1">
        Split expenses <strong>stress-free</strong>
      </p>
      <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
        Create groups, add expenses and settle up with ease.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg w-full transition-colors"
      >
        Learn more
      </button>
    </div>
  );
}

function MobileNavLinks({ items, navigate, isActive, onClose }) {
  return items.map(({ label, icon }) => (
    <button
      key={label}
      onClick={() => {
        navigate(`/${label.toLowerCase()}`);
        onClose();
      }}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium w-full text-left transition-all ${
        isActive(label)
          ? "bg-orange-50 text-orange-500 font-semibold"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <i className={`ti ${icon} text-[18px]`} aria-hidden="true" />
      {label}
    </button>
  ));
}

export default Sidebar;
