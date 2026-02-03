import React from "react";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-810/50 ${className || ''}`}
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }} // Slate-800 with opacity
            {...props}
        />
    );
}

export { Skeleton };
