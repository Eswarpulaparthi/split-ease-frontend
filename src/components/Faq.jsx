import { useState } from "react";
import { FAQS } from "../constants";

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-16 sm:py-24 bg-amber-50" id="faq">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 border border-amber-200 rounded-full text-xs text-stone-400 uppercase tracking-widest mb-3 sm:mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif">
            Common questions about expense splitting
          </h2>
        </div>

        <dl className="divide-y divide-amber-200">
          {FAQS.map((item, i) => (
            <div key={i}>
              <dt>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex justify-between items-center py-4 sm:py-5 bg-transparent border-0 cursor-pointer text-left gap-4 text-stone-900"
                >
                  <span className="text-sm font-medium leading-snug">
                    {item.q}
                  </span>
                  <span className="text-orange-600 text-lg flex-shrink-0 w-5 text-center">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
              </dt>
              {openFaq === i && (
                <dd className="pb-4 sm:pb-5 text-sm text-stone-500 leading-relaxed">
                  {item.a}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
