'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';

// Dynamic import to avoid SSR issues with useSearchParams
import Footer from '@/components/layout/Footer';
const TVContent = dynamic(() => import('@/components/tv/TVContent'), {
    ssr: false,
    loading: () => (
        <div className="flex-1 bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
        </div >
    )

});

export default function TVPage() {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />
            <Suspense fallback={
                <div className="flex-1 bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
                </div>
            }>
                <TVContent />
            </Suspense>
          <Footer />
    </div>
    );
}
