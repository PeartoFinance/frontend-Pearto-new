'use client';

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { type MarketIssue } from '@/services/marketService';

interface MarketIssuesBannerProps {
    issues: MarketIssue[];
    onDismiss?: (issueId: number) => void;
}

export default function MarketIssuesBanner({ issues, onDismiss }: MarketIssuesBannerProps) {
    if (!issues || issues.length === 0) return null;

    const activeIssues = issues.filter(i => i.isActive);
    if (activeIssues.length === 0) return null;

    const getStyles = (severity: MarketIssue['severity']) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-500',
                    text: 'text-red-800 dark:text-red-300',
                    icon: AlertTriangle,
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    border: 'border-amber-500',
                    text: 'text-amber-800 dark:text-amber-300',
                    icon: AlertCircle,
                };
            default:
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-500',
                    text: 'text-blue-800 dark:text-blue-300',
                    icon: Info,
                };
        }
    };

    return (
        <div className="space-y-2">
            {activeIssues.map((issue) => {
                const styles = getStyles(issue.severity);
                const Icon = styles.icon;

                return (
                    <div
                        key={issue.id}
                        className={`${styles.bg} border-l-4 ${styles.border} p-4 rounded-r-lg flex items-start gap-3`}
                    >
                        <Icon className={`${styles.text} flex-shrink-0 mt-0.5`} size={20} />
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${styles.text}`}>{issue.title}</h4>
                            {issue.description && (
                                <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
                                    {issue.description}
                                </p>
                            )}
                            <p className="text-xs mt-1 text-slate-500">
                                {new Date(issue.issueDate).toLocaleDateString()}
                            </p>
                        </div>
                        {onDismiss && (
                            <button
                                onClick={() => onDismiss(issue.id)}
                                className={`${styles.text} hover:opacity-70 transition-opacity`}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
