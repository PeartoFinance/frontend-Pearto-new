'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceDisplayProps {
    amount: number | null | undefined;
    className?: string;
    prefix?: string;
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    autoConvert?: boolean;
}

export default function PriceDisplay({
    amount,
    className = '',
    prefix = '',
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    autoConvert = true,
    options
}: PriceDisplayProps & { options?: Intl.NumberFormatOptions }) {
    const { formatPrice, currency } = useCurrency();

    if (amount === null || amount === undefined) {
        return <span className={className}>-</span>;
    }

    let formatted: string;

    if (autoConvert) {
        formatted = formatPrice(amount, minimumFractionDigits, maximumFractionDigits, options);
    } else {
        formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits,
            maximumFractionDigits,
            ...options
        }).format(amount);
    }

    return (
        <span className={className} title={`${currency} ${amount.toFixed(2)}`}>
            {prefix}{formatted}
        </span>
    );
}
