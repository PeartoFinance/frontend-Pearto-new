'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StatsGrid from '@/components/home/StatsGrid';
import FeaturedStory from '@/components/home/FeaturedStory';
import TrendingTopics from '@/components/home/TrendingTopics';
import Watchlist from '@/components/home/Watchlist';
import QuickTools from '@/components/home/QuickTools';
import LearningProgress from '@/components/home/LearningProgress';
import CategoryQuickLinks from '@/components/home/CategoryQuickLinks';
import MarketAnalysis from '@/components/home/MarketAnalysis';
import FeatureQuickGrid from '@/components/home/FeatureQuickGrid';
import LiveRadioPreview from '@/components/home/LiveRadioPreview';
import LiveTVPreview from '@/components/home/LiveTVPreview';
import QuickMarkets from '@/components/home/QuickMarkets';
import CryptoQuickWidget from '@/components/home/CryptoQuickWidget';
import UpgradePlanCTA from '@/components/home/UpgradePlanCTA';
import ForeignExchangeMarkets from '@/components/home/ForeignExchangeMarkets';
import MarketSnapshot from '@/components/home/MarketSnapshot';
import EducationalHub from '@/components/home/EducationalHub';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import MarketSentiment from '@/components/home/MarketSentiment';
import SectorHeatmap from '@/components/home/SectorHeatmap';
import EarningsCalendar from '@/components/home/EarningsCalendar';
import CurrencyStrengthMeter from '@/components/home/CurrencyStrengthMeter';
import { AIWidget } from '@/components/ai';

/* ── Section header helper ─────────────────────────────── */
function SectionHeader({ title, subtitle, href, linkText }: { title: string; subtitle?: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-end justify-between mb-1">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden sm:flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
          {linkText || 'View all'} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(120);

  const measureHeader = useCallback(() => {
    if (headerRef.current) {
      const h = headerRef.current.getBoundingClientRect().height;
      if (h > 0) setHeaderHeight(h);
    }
  }, []);

  useEffect(() => {
    measureHeader();
    const observer = new ResizeObserver(measureHeader);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [measureHeader]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Fixed Header */}
        <div ref={headerRef} className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-slate-50 dark:bg-slate-900">
          <TickerTape />
          <Header />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-x-hidden" style={{ paddingTop: `${headerHeight}px` }}>

          {/* ── HERO WELCOME ─────────────────────────────── */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-700/50">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative px-4 lg:px-8 py-4">
              {/* Quick-stats row */}
              <StatsGrid />
            </div>
          </section>

          {/* ── MAIN CONTENT ─────────────────────────────── */}
          <div className="px-4 lg:px-8 py-3 space-y-5 max-w-[1600px] mx-auto w-full">

            {/* Row 1: Quick Markets + Crypto Overview */}
            <section>
              <SectionHeader title="Market Movers" subtitle="Top gainers, losers & crypto" href="/market" linkText="Full markets" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                <div className="lg:col-span-2"><QuickMarkets /></div>
                <div><CryptoQuickWidget /></div>
              </div>
            </section>

            {/* Row 2: Featured Story + Watchlist */}
            <section>
              <SectionHeader title="Top Stories" subtitle="Breaking news & featured coverage" href="/news" linkText="All news" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                <div className={isAuthenticated ? 'lg:col-span-2' : 'lg:col-span-3'}>
                  <FeaturedStory />
                </div>
                {isAuthenticated && <div><Watchlist /></div>}
              </div>
            </section>

            {/* Row 3: Quick Category Links */}
            <section>
              <SectionHeader title="Explore" subtitle="Browse by category" />
              <div className="mt-3"><CategoryQuickLinks /></div>
            </section>

            {/* Row 4: Market Snapshot (full width table) */}
            <section>
              <MarketSnapshot />
            </section>

            {/* Row 5: Market Sentiment + Currency Strength */}
            <section>
              <SectionHeader title="Market Analysis" subtitle="Sentiment indicators & currency strength" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                <MarketSentiment />
                <CurrencyStrengthMeter />
              </div>
            </section>

            {/* Row 6: Feature Quick Grid */}
            <FeatureQuickGrid />

            {/* Row 7: Sector Heatmap */}
            <section>
              <SectorHeatmap />
            </section>

            {/* Row 8: Forex + Market Analysis + Earnings */}
            <section>
              <SectionHeader title="Foreign Exchange" subtitle="Live currency rates & analysis" href="/forex" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                <div className="lg:col-span-2"><ForeignExchangeMarkets /></div>
                <div className="space-y-4">
                  <MarketAnalysis />
                  <EarningsCalendar />
                </div>
              </div>
            </section>

            {/* Row 9: Live Media */}
            <section>
              <SectionHeader title="Live Media" subtitle="Watch TV & listen to radio stations worldwide" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                <LiveTVPreview />
                <LiveRadioPreview />
              </div>
            </section>

            {/* Row 10: Trending + Quick Tools + Learning */}
            <section>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isAuthenticated ? 'lg:grid-cols-3' : ''}`}>
                <TrendingTopics />
                <QuickTools />
                {isAuthenticated && <LearningProgress />}
              </div>
            </section>

            {/* Row 11: Upgrade CTA */}
            <section>
              <UpgradePlanCTA />
            </section>

            {/* Row 12: Education */}
            <section>
              <EducationalHub />
            </section>

            {/* Row 13: Social proof + FAQ */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Testimonials />
              <FAQ />
            </section>
          </div>

          <Footer />
        </div>
      </main>

      <AIWidget type="floating" position="bottom-right" pageType="dashboard" pageData={{}} />
    </div>
  );
}
