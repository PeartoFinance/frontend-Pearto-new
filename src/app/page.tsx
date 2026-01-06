'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import StatsGrid from '@/components/home/StatsGrid';
import FeaturedStory from '@/components/home/FeaturedStory';
import TrendingTopics from '@/components/home/TrendingTopics';
import Watchlist from '@/components/home/Watchlist';
import QuickTools from '@/components/home/QuickTools';
import LearningProgress from '@/components/home/LearningProgress';
import CategoryQuickLinks from '@/components/home/CategoryQuickLinks';
import EducationalHubCards from '@/components/home/EducationalHubCards';
import MarketAnalysis from '@/components/home/MarketAnalysis';
import FeatureQuickGrid from '@/components/home/FeatureQuickGrid';
import LiveRadioPreview from '@/components/home/LiveRadioPreview';
import LiveTVPreview from '@/components/home/LiveTVPreview';
import QuickMarkets from '@/components/home/QuickMarkets';
import WeatherWidget from '@/components/home/WeatherWidget';
import ForeignExchangeMarkets from '@/components/home/ForeignExchangeMarkets';
import MarketSnapshot from '@/components/home/MarketSnapshot';
import EducationalHub from '@/components/home/EducationalHub';
import CategoryBar from '@/components/home/CategoryBar';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Fixed Header Section - Always visible like sidebar */}
        <div className="sticky top-0 z-40 flex-shrink-0">
          {/* Ticker Tape */}
          <TickerTape />

          {/* Header */}
          <Header />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 lg:p-6 space-y-6 max-w-full">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('dashboard.welcome')}, Guest 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Here is your market overview for today
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/markets"
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Markets
                </Link>
                <Link
                  href="/tools"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25"
                >
                  All Tools
                </Link>
              </div>
            </section>

            {/* Stats Grid - Market Indices */}
            <section>
              <StatsGrid />
            </section>

            {/* Category Quick Links */}
            <section>
              <CategoryQuickLinks />
            </section>

            {/* Category Bar */}
            <section>
              <CategoryBar />
            </section>

            {/* Main Dashboard Grid Layout (12-column) */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column (8 cols) - Featured Story + Widgets */}
              <div className="xl:col-span-8 space-y-6">
                {/* Featured Story Hero */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Featured Story</h3>
                    <Link href="/news" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1">
                      View all news <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <FeaturedStory />
                </div>

                {/* Trending + Analysis Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TrendingTopics />
                  <MarketAnalysis />
                </div>

                {/* Educational Hub Cards */}
                <EducationalHubCards />
              </div>

              {/* Right Column (4 cols) - Sidebar Widgets */}
              <div className="xl:col-span-4 space-y-6">
                <QuickMarkets />
                <WeatherWidget />
                <LearningProgress />
                <Watchlist />
                <QuickTools />
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Live Radio Preview */}
            <LiveRadioPreview />

            {/* Live TV Preview */}
            <LiveTVPreview />

            {/* Feature Quick Grid - 10 icons */}
            <FeatureQuickGrid />

            {/* Educational Hub - Full Section */}
            <EducationalHub />

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Foreign Exchange Markets */}
            <ForeignExchangeMarkets />

            {/* Market Snapshot */}
            <MarketSnapshot />
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
              <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
              <p>{t('footer.disclaimer')}</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
