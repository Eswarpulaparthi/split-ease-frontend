import { EXPENSE_ROWS } from "../constants.js";
import { useNavigate } from "react-router-dom";
export default function Hero() {
  const navigate = useNavigate();
  return (
    <header
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-14 sm:pb-20"
      id="hero"
    >
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight text-stone-900 mb-4 sm:mb-5">
            Split expenses.
            <br />
            <em className="text-orange-600 not-italic">Not friendships.</em>
          </h1>
          <p className="text-base sm:text-lg text-stone-500 leading-relaxed mb-7 sm:mb-8 max-w-md mx-auto lg:mx-0">
            The simplest way to track shared expenses, split bills with friends,
            and settle group debts. No spreadsheets. No awkward conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center lg:items-start">
            <button
              onClick={() => navigate("/groups")}
              className="w-full sm:w-auto text-center bg-orange-600 hover:bg-orange-700 text-white px-7 py-3 rounded-xl text-base no-underline transition-all hover:-translate-y-0.5"
            >
              Start splitting for free
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto text-center border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white px-7 py-3 rounded-xl text-base no-underline transition-all"
            >
              See how it works
            </a>
          </div>
          <p className="text-xs text-stone-400 text-center lg:text-left">
            Free forever · No credit card required · Works on web &amp; mobile
          </p>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div
            className="w-full max-w-xs sm:max-w-sm bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-xl"
            style={{ animation: "float 5s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-amber-100 mb-4">
              <span className="text-2xl flex-shrink-0">🍕</span>
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  Friday Night Dinner
                </div>
                <div className="text-xs text-stone-400">
                  4 people · Split equally
                </div>
              </div>
              <div className="ml-auto font-serif text-lg flex-shrink-0">
                ₹2,400
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {EXPENSE_ROWS.map(([name, amt, status]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-stone-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {name[0]}
                  </div>
                  <span className="text-sm">{name}</span>
                  <span
                    className={`ml-auto text-xs font-medium flex-shrink-0 ${
                      status === "paid" ? "text-emerald-600" : "text-orange-600"
                    }`}
                  >
                    {status === "paid" ? "✓ paid" : `owes ₹${amt}`}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2.5 rounded-lg transition-colors cursor-pointer border-0">
              Settle up →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </header>
  );
}
