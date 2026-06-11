import { FEATURES } from "../constants";

export default function Features() {
  return (
    <section className="py-16 sm:py-24 bg-white" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 border border-amber-200 rounded-full text-xs text-stone-400 uppercase tracking-widest mb-3 sm:mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif mb-3">
            Everything you need to split bills fairly
          </h2>
          <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto">
            Powerful expense tracking tools built for groups of every kind —
            from roommates to road trips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="p-5 sm:p-6 rounded-xl border border-amber-100 hover:border-orange-300 transition-all hover:-translate-y-0.5"
            >
              <div className="text-2xl mb-3 sm:mb-4">{f.icon}</div>
              <h3 className="font-semibold text-sm sm:text-base mb-2">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
