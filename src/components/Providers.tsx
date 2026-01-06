'use client';

import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from '@/i18n';
import { CountryProvider } from '@/context/CountryContext';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
                <CountryProvider>
                    {children}
                </CountryProvider>
            </QueryClientProvider>
        </I18nextProvider>
    );
}
