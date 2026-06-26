import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faPeopleGroup,
  faBell,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";

const NAV_LINKS = [
  { label: "Friends", icon: faUserGroup, href: "/friends" },
  { label: "Groups", icon: faPeopleGroup, href: "/groups" },
  { label: "Notifications", icon: faBell, href: "/notifications" },
  { label: "Profile", icon: faCircleUser, href: "/profile" },
];

function SideBar({ children }) {
  const { pathname } = useLocation();
  return (
    <>
      <div className="flex">
        <aside className="hidden md:flex w-56 min-h-full bg-white border-r border-gray-100 flex-col py-5 px-3 flex-shrink-0">
          <h2 className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-base">
              S
            </span>
            <span className="font-bold text-gray-900 text-[17px]">
              SplitEase
            </span>
          </h2>
          <nav className="mt-8 flex flex-col gap-0.5 flex-1">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${isActive ? "bg-orange-50 text-orange-500" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"} `}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white md:hidden">
          <div className="flex h-full">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-1 items-center justify-center`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? "-translate-y-2 bg-orange-50 text-orange-500 shadow-md"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

export default SideBar;
