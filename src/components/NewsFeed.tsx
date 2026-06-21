import React, { useState } from 'react';
import { NewsItem } from '../types';
import { NEWS_FEED_ITEMS } from '../data/newsFeed';
import { Newspaper, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsFeedProps {
  limit?: number;
}

export default function NewsFeed({ limit }: NewsFeedProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const items = limit ? NEWS_FEED_ITEMS.slice(0, limit) : NEWS_FEED_ITEMS;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center tracking-tight">
            <Newspaper className="h-4.5 w-4.5 mr-2 text-indigo-600" />
            <span>Regulatory News & Bulletins</span>
          </h3>
          <span className="text-xxs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
            Sync Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((news) => (
            <motion.div
              key={news.id}
              whileHover={{ y: -2 }}
              className="flex flex-col space-y-2 p-4 border border-slate-100 hover:border-slate-200 rounded-2xl hover:bg-slate-50/50 transition cursor-pointer"
              onClick={() => setSelectedNews(news)}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                  news.category === 'Tax' ? 'text-amber-700 bg-amber-50' :
                  news.category === 'Startup' ? 'text-emerald-700 bg-emerald-50' :
                  news.category === 'Regulation' ? 'text-purple-700 bg-purple-50' : 'text-blue-700 bg-blue-50'
                }`}>
                  {news.category}
                </span>
                <span className="text-slate-400 font-medium">{news.date}</span>
              </div>

              <h4 className="text-xs font-bold text-slate-800 flex items-start leading-snug">
                <span className="hover:text-indigo-600 transition-colors line-clamp-2">{news.title}</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-slate-350 shrink-0 mt-0.5" />
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                {news.summary}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 text-left flex flex-col"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-start">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2 ${
                    selectedNews.category === 'Tax' ? 'text-amber-400 bg-amber-500/10' :
                    selectedNews.category === 'Startup' ? 'text-emerald-400 bg-emerald-500/10' :
                    selectedNews.category === 'Regulation' ? 'text-purple-400 bg-purple-500/10' :
                    'text-blue-400 bg-blue-500/10'
                  }`}>
                    {selectedNews.category}
                  </span>
                  <h3 className="text-sm font-black tracking-tight text-white leading-normal pr-4">
                    {selectedNews.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between text-slate-400 font-mono text-[9px] sm:text-[10px]">
                  <span>Source: <strong className="text-slate-700">{selectedNews.source}</strong></span>
                  <span>Date: <strong className="text-slate-700">{selectedNews.date}</strong></span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#4f46e5] text-[10px] uppercase tracking-wider mb-1">Briefing Summary</h4>
                  <div className="bg-indigo-50/20 border border-indigo-100/50 p-3.5 rounded-xl text-slate-650 leading-relaxed text-xs">
                    {selectedNews.summary}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Close Bulletin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
