import { useState, useCallback, useRef } from 'react';

export interface DrawingPoint {
    time: string | number; // Time stamp or logical index
    price: number;
}

export interface Drawing {
    id: string;
    type: 'trend' | 'ray' | 'horizontal' | 'rectangle';
    points: DrawingPoint[];
    color: string;
    lineWidth: number;
}

export function useChartDrawings(symbol: string) {
    // Load from local storage
    const getStoredDrawings = (): Drawing[] => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem(`pearto_chart_drawings_${symbol}`);
        return saved ? JSON.parse(saved) : [];
    };

    const [drawings, setDrawings] = useState<Drawing[]>(getStoredDrawings());
    const [activeTool, setActiveTool] = useState<Drawing['type'] | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);

    // Save on update
    const saveDrawings = (newDrawings: Drawing[]) => {
        setDrawings(newDrawings);
        localStorage.setItem(`pearto_chart_drawings_${symbol}`, JSON.stringify(newDrawings));
    };

    const startDrawingTool = (type: Drawing['type']) => {
        setActiveTool(type);
        setIsDrawing(true);
        setCurrentDrawing(null);
    };

    const cancelDrawing = useCallback(() => {
        setActiveTool(null);
        setIsDrawing(false);
        setCurrentDrawing(null);
    }, []);

    const completeDrawing = useCallback(() => {
        if (currentDrawing && currentDrawing.points.length >= 2) {
            const final = { ...currentDrawing, id: Date.now().toString() };
            saveDrawings([...drawings, final]);
        }
        setIsDrawing(false);
        setActiveTool(null);
        setCurrentDrawing(null);
    }, [currentDrawing, drawings]);

    const addPoint = useCallback((point: DrawingPoint) => {
        if (!activeTool) return;

        if (!currentDrawing) {
            // First point
            setCurrentDrawing({
                id: 'temp',
                type: activeTool,
                points: [point],
                color: '#3b82f6', // Default blue
                lineWidth: 2
            });
        } else {
            // Second point (Finish for simple lines)
            const newDrawing = {
                ...currentDrawing,
                points: [...currentDrawing.points, point]
            };

            // For now, all tools are 2-point tools
            const final = { ...newDrawing, id: Date.now().toString() };
            saveDrawings([...drawings, final]);
            setCurrentDrawing(null);
            // Optional: Keep tool active for multiple lines?
            // setActiveTool(null); 
            // setIsDrawing(false);
        }
    }, [activeTool, currentDrawing, drawings]);

    const updatePreview = useCallback((point: DrawingPoint) => {
        if (currentDrawing) {
            setCurrentDrawing({
                ...currentDrawing,
                points: [currentDrawing.points[0], point]
            });
        }
    }, [currentDrawing]);

    const deleteDrawing = (id: string) => {
        saveDrawings(drawings.filter(d => d.id !== id));
    };

    const clearAll = () => {
        saveDrawings([]);
    };

    return {
        drawings,
        activeTool,
        isDrawing,
        currentDrawing,
        startDrawingTool,
        cancelDrawing,
        addPoint,
        updatePreview,
        deleteDrawing,
        clearAll
    };
}
