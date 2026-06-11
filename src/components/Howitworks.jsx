import { STEPS } from "../constants.js";

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-amber-50" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 border border-amber-200 rounded-full text-xs text-stone-400 uppercase tracking-widest mb-3 sm:mb-4">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif">
            Start splitting in under 60 seconds
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 list-none p-0 m-0">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="bg-white rounded-xl border border-amber-100 p-5 sm:p-6"
            >
              <div className="text-3xl sm:text-4xl font-serif text-orange-100 mb-3 leading-none">
                {s.num}
              </div>
              <h3 className="font-semibold text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
