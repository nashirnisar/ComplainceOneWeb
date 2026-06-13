import { NewsItem } from '../types';
import { NEWS_FEED_ITEMS } from '../data/newsFeed';
import { Newspaper, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface NewsFeedProps {
  limit?: number;
}

export default function NewsFeed({ limit }: NewsFeedProps) {
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
              onClick={() => alert(`Showing details for: "${news.title}"\nPublished by ${news.source}\n\nSummary:\n${news.summary}`)}
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
    </div>
  );
}
