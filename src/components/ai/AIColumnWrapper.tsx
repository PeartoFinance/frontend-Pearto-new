'use client';

import { useAIEnabled } from '@/context/FeatureFlagsContext';

export function AIColumnWrapper({
    children,
    className = "hidden xl:block w-[320px] flex-shrink-0"
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { isAIEnabled, isLoading } = useAIEnabled();

    if (!isLoading && !isAIEnabled) {
        return null;
    }

    return (
        <div className={className}>
            {children}
        </div>
    );
}
