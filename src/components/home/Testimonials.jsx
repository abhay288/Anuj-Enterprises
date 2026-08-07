import React from 'react';
import { motion } from 'framer-motion';
import { Star, Building2, Quote } from 'lucide-react';

export const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Rajiv Kulkarni",
      role: "VP Supply Chain & Procurement",
      company: "Tata Steel Construction Div",
      content: "Anuj Enterprises has revolutionized our site procurement. The instant B2B GST tax invoice generation and 24h dispatch of Schneider MCCBs and SKF bearings saved us over 40 hours of downtime.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 2,
      name: "Sunita Deshmukh",
      role: "Senior Plant Manager",
      company: "L&T Heavy Engineering",
      content: "Their salesman portal allows our account managers to generate official quotes and place bulk orders with zero friction. Quality control and authentic OEM test certificates are top-notch.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 3,
      name: "Amitabh Singhania",
      role: "Director of Infrastructure",
      company: "Reliance Petrochemical Facilities",
      content: "Finding genuine 3M safety masks and Bosch professional tools in bulk quantities was always a hassle until we partnered with Anuj Enterprises. Outstanding credit terms and reliability.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
            Client Verification & Proof
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Endorsed By Industry Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col justify-between"
            >
              <Quote className="w-10 h-10 text-amber-400/20 absolute top-4 right-4" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{rev.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{rev.role}</p>
                  <span className="text-[10px] font-semibold text-brand-900 dark:text-brand-400 block">{rev.company}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
