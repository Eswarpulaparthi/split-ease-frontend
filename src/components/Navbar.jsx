import { useState, useEffect } from "react";
import LoginModal from "./Loginmodel.jsx";
import { NAV_LINKS } from "../constants.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  // Navbar background on scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Disable body scroll when modal opens
  useEffect(() => {
    if (showLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showLogin]);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          scrolled || menuOpen
            ? "bg-amber-50/95 backdrop-blur-md border-b border-amber-100 shadow-sm"
            : "bg-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2 no-underline flex-shrink-0"
            >
              <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                S
              </span>

              <span className="font-semibold text-stone-900 tracking-tight text-sm sm:text-base">
                SplitEase
              </span>
            </a>

            {/* Desktop Links */}
            <ul className="hidden md:flex list-none gap-6 lg:gap-8 m-0 p-0 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                    className="text-stone-500 hover:text-stone-900 text-sm no-underline transition-colors whitespace-nowrap font-medium"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {!user ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors whitespace-nowrap font-medium shadow-sm"
                >
                  Log in
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl px-3 py-2 shadow-sm">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-sm uppercase">
                    {user.name?.charAt(0)}
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-stone-800">
                      {user.name}
                    </span>

                    <span className="text-xs text-stone-500">Logged in</span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="ml-2 px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile CTA + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {!user ? (
                <button
                  onClick={() => {
                    setShowLogin(true);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap font-medium shadow-sm"
                >
                  Log in
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-semibold uppercase">
                    {user.name?.charAt(0)}
                  </div>
                </div>
              )}

              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-amber-100 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <span
                  className={`block w-5 h-0.5 bg-stone-700 transition-all duration-200 ${
                    menuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />

                <span
                  className={`block w-5 h-0.5 bg-stone-700 transition-all duration-200 ${
                    menuOpen ? "opacity-0" : ""
                  }`}
                />

                <span
                  className={`block w-5 h-0.5 bg-stone-700 transition-all duration-200 ${
                    menuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="md:hidden border-t border-amber-200 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Mobile User */}
              {user && (
                <div className="flex items-center justify-between bg-white border border-amber-200 rounded-xl p-3 mb-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold uppercase">
                      {user.name?.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-stone-800">
                        {user.name}
                      </p>

                      <p className="text-xs text-stone-500">Signed in</p>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="px-3 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}

              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                      onClick={handleNavClick}
                      className="block py-3 px-3 text-stone-700 hover:text-orange-600 hover:bg-amber-100 rounded-lg text-sm no-underline transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
