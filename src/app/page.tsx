'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import { AIWidget } from '@/components/ai';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Fixed Header Section - Always visible */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
          {/* Ticker Tape */}
          <TickerTape />

          {/* Header */}
          <Header />
        </div>

        {/* Scrollable Content - with top padding for fixed header */}
        <div className="flex-1 pt-[112px] md:pt-[120px] overflow-x-hidden">
          <div className="p-4 lg:p-6 space-y-6 w-full">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t('dashboard.welcome')}, Guest 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Here is your market overview for today
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/market"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
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

            {/* Quick Markets & Weather Row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickMarkets />
              </div>
              <div>
                <WeatherWidget />
              </div>
            </section>

            {/* Category Bar */}
            <section>
              <CategoryBar />
            </section>

            {/* Main Content Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Story - 2 columns */}
              <div className={isAuthenticated ? "lg:col-span-2" : "lg:col-span-3"}>
                <FeaturedStory />
              </div>
              {/* Watchlist - 1 column - Only show if logged in */}
              {isAuthenticated && (
                <div>
                  <Watchlist />
                </div>
              )}
            </section>

            {/* Category Quick Links */}
            <section>
              <CategoryQuickLinks />
            </section>

            {/* Market Snapshot */}
            <section>
              <MarketSnapshot />
            </section>

            {/* Feature Quick Grid */}
            <section>
              <FeatureQuickGrid />
            </section>

            {/* Educational Hub */}
            <section>
              <EducationalHub />
            </section>

            {/* Foreign Exchange Markets */}
            <section>
              <ForeignExchangeMarkets />
            </section>

            {/* Live TV & Radio Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveTVPreview />
              <LiveRadioPreview />
            </section>

            {/* Three column layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrendingTopics />
              <QuickTools />
              <LearningProgress />
            </section>

            {/* Market Analysis */}
            <section>
              <MarketAnalysis />
            </section>

            {/* Educational Hub Cards */}
            <section>
              <EducationalHubCards />
            </section>
            {/* Testimonials */}
            <section>
              <Testimonials />
            </section>

            {/* FAQ */}
            <section>
              <FAQ />
            </section>
          </div>
        </div>
      </main>

      {/* Floating AI Widget */}
      <AIWidget
        type="floating"
        position="bottom-right"
        pageType="dashboard"
        pageData={{}}
      />
    </div>
  );
}
