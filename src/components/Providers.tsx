'use client';

import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from '@/i18n';
import { CountryProvider } from '@/context/CountryContext';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { MobileAppPrompt } from '@/components/common/MobileAppPrompt';

// Configure React Query with caching for faster subsequent loads
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,       // Data stays fresh for 30 seconds
            gcTime: 5 * 60 * 1000,      // Keep cached data for 5 minutes
            refetchOnWindowFocus: false, // Don't refetch on tab focus
            retry: 1,                    // Only retry once on failure
        },
    },
});

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <CountryProvider>
                        <CurrencyProvider>
                            {children}
                            <MobileAppPrompt
                                appName="Pearto Finance"
                                iosAppUrl="https://apps.apple.com/app/pearto-finance"
                                androidAppUrl="https://play.google.com/store/apps/details?id=com.pearto.finance"
                            />
                        </CurrencyProvider>
                    </CountryProvider>
                </AuthProvider>
            </QueryClientProvider>
        </I18nextProvider>
    );
}
