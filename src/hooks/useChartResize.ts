import { useEffect } from 'react';
import { IChartApi } from 'lightweight-charts';

/**
 * A hook that uses ResizeObserver to automatically resize a lightweight-chart
 * instance whenever its container changes size. This is much more robust than
 * window 'resize' events, especially for dashboards with collapsable sidebars
 * and dynamic grid layouts.
 * 
 * @param chart - The lightweight-chart instance
 * @param containerRef - Real DOM reference to the div containing the chart
 */
export function useChartResize(chart: IChartApi | null, containerRef: React.RefObject<HTMLDivElement | null>) {
    useEffect(() => {
        if (!chart || !containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0 || entries[0].target !== containerRef.current) {
                return;
            }

            const newRect = entries[0].contentRect;
            // Apply new dimensions to chart safely
            if (newRect.width > 0 && newRect.height > 0) {
                chart.applyOptions({
                    width: newRect.width,
                    height: newRect.height
                });
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [chart, containerRef]);
}
