import { USE_CASES } from "../constants";

export default function UseCases() {
  return (
    <section className="py-16 sm:py-24 bg-white" id="use-cases">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 border border-amber-200 rounded-full text-xs text-stone-400 uppercase tracking-widest mb-3 sm:mb-4">
            Use cases
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif mb-3">
            For every kind of shared expense
          </h2>
          <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto">
            Whether it's splitting rent, tracking vacation costs, or dividing a
            dinner bill — SplitEase handles it all.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {USE_CASES.map((u) => (
            <article
              key={u.tag}
              className="bg-amber-50 rounded-2xl border border-amber-100 p-6 sm:p-8 hover:-translate-y-0.5 transition-transform"
            >
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs mb-3 sm:mb-4">
                {u.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-serif mb-2 sm:mb-3">
                {u.headline}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                {u.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
