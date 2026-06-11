import { FOOTER_COLS } from "../constants.js";

export default function CTAFooter() {
  return (
    <>
      <footer className="bg-stone-900 border-t border-white/5 pt-10 sm:pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  S
                </span>
                <span className="text-white font-medium">SplitEase</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                The easiest expense splitter and bill sharing app for friends,
                roommates, and travel groups.
              </p>
            </div>

            {/* Link columns */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-6 sm:gap-8">
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs text-stone-500 uppercase tracking-widest mb-3 sm:mb-4 font-medium">
                    {col.title}
                  </h4>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a
                          href="#"
                          className="text-stone-400 hover:text-white text-xs sm:text-sm no-underline transition-colors"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-5 sm:pt-6">
            <p className="text-xs text-stone-600">
              © 2025 SplitEase. All rights reserved. | Free expense splitting
              app for everyone.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
