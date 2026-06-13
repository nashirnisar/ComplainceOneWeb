import { NewsItem } from '../types';

export const NEWS_FEED_ITEMS: NewsItem[] = [
  {
    id: 'news_1',
    title: 'New QRMP Scheme Rules Released for Small Scale GST Taxpayers',
    category: 'Tax',
    summary: 'Tax department issues revised rules for Quarter Return Monthly Payment (QRMP) schemes. Business taxpayers with turn-over under ₹5 Cr can opt for quarterly filings, reducing compliance workloads.',
    date: '2026-06-08',
    source: 'GST Council'
  },
  {
    id: 'news_2',
    title: 'Startup India Hub Extends Fast-Track Patent Registration & ROC Exemptions',
    category: 'Startup',
    summary: 'DPIIT recognized early-stage startups registered under Startup India are now eligible for an extra 3 years of income tax holiday exemptions under Section 80-IAC. Requires online apply-form submission.',
    date: '2026-06-05',
    source: 'Ministry of Commerce'
  },
  {
    id: 'news_3',
    title: 'Penalty Amnesty Scheme Announced for Pending MCA ROC Filings',
    category: 'Regulation',
    summary: 'In a major relief for non-compliant startups and businesses, the government introduced a fresh amnesty waiver. Delayed e-forms, including AOC-4 and MGT-7, will bear only base fees instead of flat daily penalties.',
    date: '2026-06-01',
    source: 'MCA Portal'
  },
  {
    id: 'news_4',
    title: 'CBDT Mandates Two-Factor Securing Auth for Corporate e-Filing Login',
    category: 'Compliance',
    summary: 'Starting next month, all corporate accounts on the Income Tax Portal must bind digital signatures or mobile OTP auth as mandatory security steps to mitigate unauthorized tax adjustment activities.',
    date: '2026-05-28',
    source: 'Income Tax Department'
  },
  {
    id: 'news_5',
    title: 'GST e-Invoicing Limit Lowered: Now Applicable to Small Entities',
    category: 'Tax',
    summary: 'Starting next quarter, businesses with an aggregate annual turnover exceeding ₹5 crores are legally mandated to generate B2B electronic invoices. Make sure outbound operations utilize automated invoice systems.',
    date: '2026-05-24',
    source: 'GST Network'
  }
];
