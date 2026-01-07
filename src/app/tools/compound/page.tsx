'use client';

import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import CompoundCalculator from '@/components/tools/calculators/CompoundCalculator';

export default function CompoundPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950">
            {/* Sidebar - Desktop Only */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header Section - Always visible */}
                <div className="fixed top-0 right-0 left-0 md:left-[200px] z-40 bg-gray-50 dark:bg-neutral-950">
                    <TickerTape />
                    <Header />
                </div>

                {/* Scrollable Content - with top padding for fixed header */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 max-w-full">
                        <CompoundCalculator />
                    </div>
                </div>
            </main>
        </div>
    );
}
