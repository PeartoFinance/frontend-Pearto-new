/**
 * Tool Metadata Registry
 * Static metadata for tools - names, descriptions, icons, features
 * Database stores enabled/disabled state, this provides UI details
 */

import {
    Calculator, TrendingUp, Shield, DollarSign, Home,
    Heart, Users, Briefcase, Plane, ChefHat, Code, Palette,
    Key, Clock, GraduationCap, Building2, PieChart, Target,
    Megaphone, Scale, Gamepad2, Sparkles, FileText, Lightbulb,
    Globe, Sun, Search, ShoppingCart, MessageSquare, Activity,
    BookOpen, Paintbrush, Dice5, Baby, Stethoscope, Leaf
} from 'lucide-react';

export interface ToolMeta {
    slug: string;
    name: string;
    category: string;
    description: string;
    features: string[];
    icon?: string;
    href?: string;
}

// Category icons mapping
export const categoryIcons: Record<string, typeof Calculator> = {
    'Investing': TrendingUp,
    'Insurance': Shield,
    'Finance & Loans': DollarSign,
    'Real Estate': Home,
    'Health & Fitness': Heart,
    'Retirement': Users,
    'Personal Finance': Briefcase,
    'Taxation': Calculator,
    'Debt': DollarSign,
    'Travel': Plane,
    'Cooking & Recipes': ChefHat,
    'Data & Code': Code,
    'Design': Palette,
    'Utilities': Clock,
    'Security': Key,
    'Education': GraduationCap,
    'Education & Study': BookOpen,
    'Business': Building2,
    'Business Operations': Building2,
    'Business Strategy': Target,
    'Portfolio Analysis': PieChart,
    'Marketing': Megaphone,
    'Legal': Scale,
    'Gaming': Gamepad2,
    'Fun & Entertainment': Dice5,
    'Creative': Sparkles,
    'Writing': FileText,
    'Productivity': Lightbulb,
    'SEO': Search,
    'E-commerce': ShoppingCart,
    'Content': MessageSquare,
    'Health & Medical': Stethoscope,
    'Health & Wellness': Activity,
    'Weather & Astronomy': Sun,
    'Sustainability': Leaf,
    'Income & Employment': Briefcase,
    'Family & Goals': Baby,
    'Startup': Lightbulb,
    'Project Management': Target,
    'Wellness': Heart,
    'Math & Science': Calculator,
    'Entertainment': Sparkles,
};

// Category colors for styling
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Investing': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Insurance': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Finance & Loans': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Retirement': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Real Estate': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Health & Fitness': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Personal Finance': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'Taxation': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Debt': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'Utilities': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'Security': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Education': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Education & Study': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    'Business': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'Business Operations': { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' },
    'Business Strategy': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'Portfolio Analysis': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'Marketing': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'Legal': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
    'Gaming': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    'Fun & Entertainment': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
    'Creative': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Writing': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Productivity': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'SEO': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'E-commerce': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Content': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'Health & Medical': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Health & Wellness': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'Weather & Astronomy': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    'Sustainability': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Income & Employment': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Family & Goals': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'Startup': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'Project Management': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Wellness': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'Math & Science': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Entertainment': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    'Travel': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    'Cooking & Recipes': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Data & Code': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'Design': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
};

// Default colors for unknown categories
export const defaultCategoryColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

// Tool metadata with descriptions and features
export const toolsMeta: Record<string, ToolMeta> = {
    // ===== INVESTING (17 tools) =====
    'sip': {
        slug: 'sip',
        name: 'SIP Calculator',
        category: 'Investing',
        description: 'Calculate future value of systematic investment plans with monthly contributions.',
        features: ['Monthly contribution', 'Expected returns', 'Investment tenure', 'Future value']
    },
    'compound': {
        slug: 'compound',
        name: 'Compound Interest Calculator',
        category: 'Investing',
        description: 'Visualize how your investments grow with compound interest over time.',
        features: ['Initial deposit', 'Interest rate', 'Compounding period', 'Growth chart']
    },
    'lumpsum': {
        slug: 'lumpsum',
        name: 'Lumpsum Calculator',
        category: 'Investing',
        description: 'Calculate future value of a one-time investment.',
        features: ['Principal amount', 'Expected return', 'Time period', 'Growth multiplier']
    },
    'step-up-sip': {
        slug: 'step-up-sip',
        name: 'Step-Up SIP Calculator',
        category: 'Investing',
        description: 'Calculate returns with annually increasing SIP amounts.',
        features: ['Annual step-up %', 'Compare with regular SIP', 'Extra gains']
    },
    'cagr': {
        slug: 'cagr',
        name: 'CAGR Calculator',
        category: 'Investing',
        description: 'Calculate Compound Annual Growth Rate of your investments.',
        features: ['Beginning value', 'Ending value', 'Time period', 'Absolute return']
    },
    'dividend-yield': {
        slug: 'dividend-yield',
        name: 'Dividend Yield Calculator',
        category: 'Investing',
        description: 'Calculate dividend yield and annual income from stocks.',
        features: ['Stock price', 'Annual dividend', 'Shares owned', 'Yield %']
    },
    'ppf': {
        slug: 'ppf',
        name: 'PPF Calculator',
        category: 'Investing',
        description: 'Calculate Public Provident Fund maturity amount.',
        features: ['Yearly deposit', 'Interest rate', 'Tax-free returns', '15-year maturity']
    },
    'fd': {
        slug: 'fd',
        name: 'FD Calculator',
        category: 'Investing',
        description: 'Calculate Fixed Deposit maturity amount and interest.',
        features: ['Principal', 'Interest rate', 'Compounding', 'Maturity value']
    },
    'rd': {
        slug: 'rd',
        name: 'RD Calculator',
        category: 'Investing',
        description: 'Calculate Recurring Deposit maturity amount.',
        features: ['Monthly deposit', 'Interest rate', 'Tenure', 'Interest earned']
    },
    'nsc': {
        slug: 'nsc',
        name: 'NSC Calculator',
        category: 'Investing',
        description: 'Calculate National Savings Certificate returns.',
        features: ['Deposit amount', 'Interest rate', '5-year tenure', '80C tax benefit']
    },
    'ssy': {
        slug: 'ssy',
        name: 'SSY Calculator',
        category: 'Investing',
        description: 'Calculate Sukanya Samriddhi Yojana returns for your daughter.',
        features: ['Girl child scheme', 'Tax-free returns', 'Yearly deposit', 'Maturity at 21']
    },
    'epf': {
        slug: 'epf',
        name: 'EPF Calculator',
        category: 'Retirement',
        description: 'Calculate Employee Provident Fund corpus at retirement.',
        features: ['Basic salary', 'Retirement age', 'Current balance', 'Monthly contribution']
    },
    'elss': {
        slug: 'elss',
        name: 'ELSS Calculator',
        category: 'Investing',
        description: 'Calculate ELSS returns and tax savings under 80C.',
        features: ['Monthly SIP', 'Expected return', 'Tax savings', '3-year lock-in']
    },
    'gold-investment': {
        slug: 'gold-investment',
        name: 'Gold Investment Calculator',
        category: 'Investing',
        description: 'Calculate gold investment returns over time.',
        features: ['Investment amount', 'Gold price', 'Future value', 'Grams of gold']
    },
    'swp': {
        slug: 'swp',
        name: 'SWP Calculator',
        category: 'Investing',
        description: 'Calculate systematic withdrawal plan duration.',
        features: ['Corpus', 'Monthly withdrawal', 'Duration', 'Max sustainable withdrawal']
    },
    'nps': {
        slug: 'nps',
        name: 'NPS Calculator',
        category: 'Retirement',
        description: 'Calculate National Pension System returns and pension.',
        features: ['Monthly investment', 'Retirement corpus', 'Monthly pension', '80CCD tax benefit']
    },
    'roi-calculator': {
        slug: 'roi-calculator',
        name: 'ROI Calculator',
        category: 'Investing',
        description: 'Calculate return on investment and annualized returns.',
        features: ['Initial investment', 'Final value', 'Net profit', 'Annualized ROI']
    },
    'goal-planner': {
        slug: 'goal-planner',
        name: 'Goal Planner',
        category: 'Investing',
        description: 'Plan contributions required to reach your financial goals.',
        features: ['Target amount', 'Time horizon', 'Inflation adjustment', 'Required SIP']
    },
    'retirement': {
        slug: 'retirement',
        name: 'Retirement Calculator',
        category: 'Retirement',
        description: 'Plan your retirement corpus and monthly contributions needed.',
        features: ['Current age', 'Retirement age', 'Monthly expense', 'Required corpus']
    },

    // ===== FINANCE & LOANS (22 tools) =====
    'emi': {
        slug: 'emi',
        name: 'Loan EMI Calculator',
        category: 'Finance & Loans',
        description: 'Calculate monthly loan payments and view complete amortization schedule.',
        features: ['Loan amount', 'Interest rate', 'Tenure', 'EMI breakdown']
    },
    'mortgage': {
        slug: 'mortgage',
        name: 'Mortgage Calculator',
        category: 'Real Estate',
        description: 'Calculate home loan EMI with down payment and interest breakdown.',
        features: ['Home price', 'Down payment', 'Interest rate', 'Total payment']
    },
    'car-loan': {
        slug: 'car-loan',
        name: 'Car Loan Calculator',
        category: 'Finance & Loans',
        description: 'Calculate your car loan EMI and total cost.',
        features: ['Car price', 'Down payment', 'Interest rate', 'Total cost of car']
    },
    'education-loan': {
        slug: 'education-loan',
        name: 'Education Loan Calculator',
        category: 'Education',
        description: 'Calculate education loan EMI with moratorium period.',
        features: ['Loan amount', 'Moratorium period', 'EMI', '80E tax deduction']
    },
    'loan-compare': {
        slug: 'loan-compare',
        name: 'Loan Comparison',
        category: 'Finance & Loans',
        description: 'Compare two loan offers to find the best deal.',
        features: ['Compare rates', 'EMI difference', 'Total savings', 'Best option']
    },
    'budget-planner': {
        slug: 'budget-planner',
        name: 'Budget Planner',
        category: 'Personal Finance',
        description: 'Allocate your income across expense categories using 50/30/20 rule.',
        features: ['Income allocation', 'Expense categories', 'Savings goal', 'Visualization']
    },
    'income-tax': {
        slug: 'income-tax',
        name: 'Income Tax Calculator',
        category: 'Taxation',
        description: 'Estimate your annual income tax based on salary and deductions.',
        features: ['Income slabs', 'Deductions', 'Tax payable', 'Regime comparison']
    },
    'gst': {
        slug: 'gst',
        name: 'GST Calculator',
        category: 'Taxation',
        description: 'Calculate GST, CGST, and SGST for your transactions.',
        features: ['Base amount', 'GST rates', 'CGST/SGST split', 'Total amount']
    },
    'hra': {
        slug: 'hra',
        name: 'HRA Calculator',
        category: 'Taxation',
        description: 'Calculate your HRA tax exemption.',
        features: ['Basic salary', 'Rent paid', 'Metro/Non-Metro', 'Exemption amount']
    },
    'inflation': {
        slug: 'inflation',
        name: 'Inflation Calculator',
        category: 'Personal Finance',
        description: 'See how inflation erodes your money\'s value over time.',
        features: ['Current amount', 'Inflation rate', 'Years', 'Purchasing power loss']
    },
    'salary-converter': {
        slug: 'salary-converter',
        name: 'Salary Converter',
        category: 'Personal Finance',
        description: 'Convert annual salary to hourly, daily, and weekly rates.',
        features: ['Annual salary', 'Hourly rate', 'Daily rate', 'Working hours']
    },
    'debt-payoff': {
        slug: 'debt-payoff',
        name: 'Debt Payoff Calculator',
        category: 'Debt',
        description: 'Calculate time to become debt-free.',
        features: ['Total debt', 'Interest rate', 'Monthly payment', 'Freedom date']
    },
    'credit-card-payoff': {
        slug: 'credit-card-payoff',
        name: 'Credit Card Payoff',
        category: 'Debt',
        description: 'Calculate how long to pay off credit card debt.',
        features: ['Balance', 'Interest rate', 'Extra payment', 'Total interest']
    },
    'emergency-fund': {
        slug: 'emergency-fund',
        name: 'Emergency Fund Calculator',
        category: 'Personal Finance',
        description: 'Calculate how much emergency fund you need.',
        features: ['Monthly expenses', 'Months of coverage', 'Progress tracking', 'Target goal']
    },
    'net-worth': {
        slug: 'net-worth',
        name: 'Net Worth Calculator',
        category: 'Personal Finance',
        description: 'Calculate your total net worth (assets minus liabilities).',
        features: ['Assets', 'Liabilities', 'Debt-to-asset ratio', 'Net worth']
    },
    'rent-vs-buy': {
        slug: 'rent-vs-buy',
        name: 'Rent vs Buy Calculator',
        category: 'Real Estate',
        description: 'Compare renting vs buying a home over time.',
        features: ['Home price', 'Rent', 'Appreciation', 'Recommendation']
    },
    'stamp-duty': {
        slug: 'stamp-duty',
        name: 'Stamp Duty Calculator',
        category: 'Real Estate',
        description: 'Calculate stamp duty and registration charges by state.',
        features: ['Property value', 'State', 'Gender discount', 'Total charges']
    },
    'education-cost': {
        slug: 'education-cost',
        name: 'Education Cost Planner',
        category: 'Education',
        description: 'Plan for your child\'s higher education costs.',
        features: ['Current cost', 'Inflation', 'SIP needed', 'Future cost']
    },
    'equity-dilution': {
        slug: 'equity-dilution',
        name: 'Equity Dilution Calculator',
        category: 'Business',
        description: 'Calculate ownership dilution after funding rounds.',
        features: ['Shares', 'Pre-money valuation', 'Dilution %', 'Post-money value']
    },
    'break-even': {
        slug: 'break-even',
        name: 'Break-Even Calculator',
        category: 'Business',
        description: 'Calculate units needed to break even.',
        features: ['Fixed costs', 'Variable costs', 'Price per unit', 'Break-even point']
    },
    'margin': {
        slug: 'margin',
        name: 'Profit Margin Calculator',
        category: 'Business',
        description: 'Calculate profit margins, markups, and selling prices.',
        features: ['Cost', 'Selling price', 'Profit margin', 'Markup']
    },

    // ===== INSURANCE (3 tools) =====
    'life-insurance': {
        slug: 'life-insurance',
        name: 'Life Insurance Needs',
        category: 'Insurance',
        description: 'Evaluate how much life insurance coverage you need.',
        features: ['Income replacement', 'Liabilities', 'Existing cover', 'Gap analysis']
    },
    'car-insurance': {
        slug: 'car-insurance',
        name: 'Car Insurance Calculator',
        category: 'Insurance',
        description: 'Calculate indicative car insurance premium based on vehicle details.',
        features: ['IDV', 'Vehicle age', 'NCB', 'Premium estimate']
    },
    'health-premium': {
        slug: 'health-premium',
        name: 'Health Premium Estimator',
        category: 'Insurance',
        description: 'Estimate health insurance premium based on age and coverage.',
        features: ['Age', 'Sum insured', 'City tier', 'Premium breakdown']
    },

    // ===== HEALTH (6 tools) =====
    'bmi-calculator': {
        slug: 'bmi-calculator',
        name: 'BMI Calculator',
        category: 'Health & Fitness',
        description: 'Calculate your Body Mass Index and health category.',
        features: ['Height', 'Weight', 'BMI category', 'Ideal weight range']
    },
    'calorie-calculator': {
        slug: 'calorie-calculator',
        name: 'Calorie Calculator',
        category: 'Health & Fitness',
        description: 'Calculate your daily calorie needs based on activity level.',
        features: ['BMR', 'Activity level', 'Goal', 'Daily macros']
    },
    'ideal-weight': {
        slug: 'ideal-weight',
        name: 'Ideal Weight Calculator',
        category: 'Health & Fitness',
        description: 'Calculate your ideal body weight based on height.',
        features: ['Multiple formulas', 'Body frame', 'Weight range']
    },
    'water-intake': {
        slug: 'water-intake',
        name: 'Water Intake Calculator',
        category: 'Health & Fitness',
        description: 'Calculate your daily water consumption needs.',
        features: ['Weight', 'Activity level', 'Climate', 'Glasses per day']
    },
    'sleep': {
        slug: 'sleep',
        name: 'Sleep Calculator',
        category: 'Health & Fitness',
        description: 'Calculate optimal sleep/wake times based on sleep cycles.',
        features: ['Sleep cycles', 'Wake time', 'Bed time', 'Recommendations']
    },
    'pregnancy-due-date': {
        slug: 'pregnancy-due-date',
        name: 'Pregnancy Due Date',
        category: 'Health & Fitness',
        description: 'Calculate estimated due date and pregnancy progress.',
        features: ['LMP date', 'Due date', 'Weeks pregnant', 'Trimester']
    },

    // ===== UTILITIES (10 tools) =====
    'currency-converter': {
        slug: 'currency-converter',
        name: 'Currency Converter',
        category: 'Utilities',
        description: 'Convert between major world currencies with live rates.',
        features: ['10+ currencies', 'Exchange rates', 'Swap currencies']
    },
    'password-generator': {
        slug: 'password-generator',
        name: 'Password Generator',
        category: 'Security',
        description: 'Generate strong, secure passwords with custom options.',
        features: ['Custom length', 'Character options', 'Strength meter', 'Copy to clipboard']
    },
    'age-calculator': {
        slug: 'age-calculator',
        name: 'Age Calculator',
        category: 'Utilities',
        description: 'Calculate your exact age and days until next birthday.',
        features: ['Exact age', 'Total days', 'Birthday countdown', 'Zodiac sign']
    },
    'percentage': {
        slug: 'percentage',
        name: 'Percentage Calculator',
        category: 'Utilities',
        description: 'Calculate percentages, ratios, and percentage changes.',
        features: ['What is X% of Y', 'X is what % of Y', 'Percentage change']
    },
    'tip': {
        slug: 'tip',
        name: 'Tip Calculator',
        category: 'Utilities',
        description: 'Calculate tips and split bills among friends.',
        features: ['Bill amount', 'Tip percentage', 'Split by people', 'Per person']
    },
    'fuel-cost': {
        slug: 'fuel-cost',
        name: 'Fuel Cost Calculator',
        category: 'Utilities',
        description: 'Calculate fuel cost for your road trip.',
        features: ['Distance', 'Mileage', 'Fuel price', 'Cost per km']
    },
    'date-difference': {
        slug: 'date-difference',
        name: 'Date Difference Calculator',
        category: 'Utilities',
        description: 'Calculate the difference between two dates.',
        features: ['Days', 'Weeks', 'Months', 'Years/Months/Days']
    },
    'unit-converter': {
        slug: 'unit-converter',
        name: 'Unit Converter',
        category: 'Utilities',
        description: 'Convert between different units of measurement.',
        features: ['Length', 'Weight', 'Volume', 'Multiple units']
    },

    // ===== PORTFOLIO ANALYSIS (4 tools) =====
    'correlation-matrix': {
        slug: 'correlation-matrix',
        name: 'Correlation Matrix',
        category: 'Portfolio Analysis',
        description: 'Visualize correlations between portfolio assets with interactive heatmap.',
        features: ['Interactive heatmap', 'Multi-asset picker', 'Correlation coefficients', 'Date range']
    },
    'fee-analyzer': {
        slug: 'fee-analyzer',
        name: 'Investment Fee Analyzer',
        category: 'Portfolio Analysis',
        description: 'Break down and project investment fees across holdings.',
        features: ['Fee breakdown', 'Expense ratio', 'Long-term projection', 'Growth impact']
    },
    'etf-overlap': {
        slug: 'etf-overlap',
        name: 'ETF Overlap Checker',
        category: 'Portfolio Analysis',
        description: 'Identify holding overlaps between ETFs and mutual funds.',
        features: ['Venn diagram', 'Overlap percentage', 'Top shared holdings', 'Diversification score']
    },
    'esg-scoring': {
        slug: 'esg-scoring',
        name: 'ESG Scoring Dashboard',
        category: 'Portfolio Analysis',
        description: 'Evaluate Environmental, Social, Governance scores of holdings.',
        features: ['E/S/G radar chart', 'Rating cards', 'Portfolio score', 'Industry benchmarks']
    },

    // ===== ADDITIONAL INVESTING TOOLS =====
    'risk-level-assessment': {
        slug: 'risk-level-assessment',
        name: 'Risk Level Assessment',
        category: 'Investing',
        description: 'Evaluate portfolio risk profile based on allocation and diversification.',
        features: ['Portfolio allocation', 'Volatility', 'Risk score', 'Recommendations']
    },
    'volatility-measurement': {
        slug: 'volatility-measurement',
        name: 'Volatility Measurement',
        category: 'Investing',
        description: 'Analyze stock volatility with standard deviation and historical data.',
        features: ['Price history', 'Bollinger bands', 'Returns distribution', 'Annualized volatility']
    },
    'beta-calculator': {
        slug: 'beta-calculator',
        name: 'Beta Calculator',
        category: 'Investing',
        description: 'Calculate beta coefficient vs market benchmarks with regression analysis.',
        features: ['Beta calculation', 'Alpha', 'R-squared', 'Correlation']
    },

    // ===== ADDITIONAL INSURANCE TOOLS =====
    'term-insurance': {
        slug: 'term-insurance',
        name: 'Term Insurance Planner',
        category: 'Insurance',
        description: 'Compare term plan benefit structure and coverage options.',
        features: ['Cover amount', 'Tenure', 'Benefit type', 'Premium comparison']
    },
    'term-life': {
        slug: 'term-life',
        name: 'Term Life Calculator',
        category: 'Insurance',
        description: 'Estimate recommended term life cover based on income and liabilities.',
        features: ['Income', 'Liabilities', 'Lifestyle', 'Recommended cover']
    },
    'human-life-value': {
        slug: 'human-life-value',
        name: 'Human Life Value',
        category: 'Insurance',
        description: 'Quantify economic value of remaining earning capacity.',
        features: ['Income trajectory', 'Discount rate', 'HLV result', 'Coverage gap']
    },
    'nri-term': {
        slug: 'nri-term',
        name: 'NRI Term Calculator',
        category: 'Insurance',
        description: 'Assess term coverage for NRI scenarios.',
        features: ['Resident status', 'Currency assumption', 'Cover need', 'Policy options']
    },
    'parents-health': {
        slug: 'parents-health',
        name: 'Parents Health Cover',
        category: 'Insurance',
        description: 'Plan optimal health insurance for parents.',
        features: ['Parent ages', 'Cover layers', 'Recommended sum', 'Co-pay options']
    },
    'bike-insurance': {
        slug: 'bike-insurance',
        name: 'Bike Insurance Calculator',
        category: 'Insurance',
        description: 'Compute two-wheeler insurance premium.',
        features: ['Vehicle age', 'Cubic capacity', 'NCB', 'Premium estimate']
    },
    'travel-insurance': {
        slug: 'travel-insurance',
        name: 'Travel Insurance Calculator',
        category: 'Insurance',
        description: 'Estimate travel policy coverage and cost.',
        features: ['Trip duration', 'Destination', 'Sum insured', 'Premium']
    },

    // ===== PRODUCTIVITY TOOLS =====
    'pomodoro-timer': {
        slug: 'pomodoro-timer',
        name: 'Pomodoro Timer',
        category: 'Productivity',
        description: 'Structured focus/break cycles for productivity.',
        features: ['Work timer', 'Break timer', 'Sessions count', 'Notifications']
    },
    'time-zone-converter': {
        slug: 'time-zone-converter',
        name: 'Time Zone Converter',
        category: 'Utilities',
        description: 'Compare times across different time zones.',
        features: ['Multiple zones', 'Current time', 'Meeting scheduler', 'World clock']
    },
    'habit-tracker': {
        slug: 'habit-tracker',
        name: 'Habit Tracker',
        category: 'Productivity',
        description: 'Track daily habit completion and build streaks.',
        features: ['Habits list', 'Calendar view', 'Streak tracking', 'Progress stats']
    },
    'task-priority-matrix': {
        slug: 'task-priority-matrix',
        name: 'Task Priority Matrix',
        category: 'Productivity',
        description: 'Eisenhower prioritization board for tasks.',
        features: ['4 quadrants', 'Drag & drop', 'Task management', 'Priority levels']
    },
    'meeting-cost-calculator': {
        slug: 'meeting-cost-calculator',
        name: 'Meeting Cost Calculator',
        category: 'Business Operations',
        description: 'Estimate meeting monetary cost based on attendees.',
        features: ['Attendees', 'Salaries', 'Duration', 'Total cost']
    },
    'project-timeline-generator': {
        slug: 'project-timeline-generator',
        name: 'Project Timeline Generator',
        category: 'Project Management',
        description: 'Build milestone timeline for projects.',
        features: ['Milestones', 'Dates', 'Gantt view', 'Dependencies']
    },
    'goal-setting-template': {
        slug: 'goal-setting-template',
        name: 'Goal Setting Template',
        category: 'Productivity',
        description: 'Structure SMART goals effectively.',
        features: ['SMART framework', 'Goal fields', 'Action items', 'Timeline']
    },
    'mind-map-generator': {
        slug: 'mind-map-generator',
        name: 'Mind Map Generator',
        category: 'Productivity',
        description: 'Visual idea organization with mind maps.',
        features: ['Central topic', 'Nodes', 'Connections', 'Export options']
    },

    // ===== REAL ESTATE TOOLS =====
    'mortgage-affordability': {
        slug: 'mortgage-affordability',
        name: 'Mortgage Affordability',
        category: 'Real Estate',
        description: 'Estimate affordable home price from income.',
        features: ['Income', 'Debt ratios', 'Max price', 'Monthly payment']
    },
    'home-loan-comparison': {
        slug: 'home-loan-comparison',
        name: 'Home Loan Comparison',
        category: 'Real Estate',
        description: 'Compare multiple mortgage scenarios.',
        features: ['Multiple loans', 'Rate comparison', 'Total cost', 'Savings']
    },
    'moving-cost': {
        slug: 'moving-cost',
        name: 'Moving Cost Calculator',
        category: 'Real Estate',
        description: 'Estimate relocation costs.',
        features: ['Distance', 'Volume', 'Services', 'Total cost']
    },
    'square-footage': {
        slug: 'square-footage',
        name: 'Square Footage Calculator',
        category: 'Real Estate',
        description: 'Compute property total area.',
        features: ['Rooms', 'Dimensions', 'Total area', 'Unit conversion']
    },
    'paint-calculator': {
        slug: 'paint-calculator',
        name: 'Paint Calculator',
        category: 'Real Estate',
        description: 'Estimate paint quantity needed.',
        features: ['Wall dimensions', 'Coverage rate', 'Coats needed', 'Gallons']
    },
    'mortgage-refinance': {
        slug: 'mortgage-refinance',
        name: 'Mortgage Refinance Calculator',
        category: 'Real Estate',
        description: 'Assess refinance savings and break-even.',
        features: ['Current loan', 'New rate', 'Break-even', 'Savings']
    },
    'home-value-estimator': {
        slug: 'home-value-estimator',
        name: 'Home Value Estimator',
        category: 'Real Estate',
        description: 'Approximate market value of property.',
        features: ['Property details', 'Comparables', 'Value range', 'Trends']
    },

    // ===== HEALTH & MEDICAL TOOLS =====
    'symptom-checker': {
        slug: 'symptom-checker',
        name: 'Symptom Checker',
        category: 'Health & Medical',
        description: 'Get possible condition hints based on symptoms.',
        features: ['Symptom input', 'Possible matches', 'Severity', 'Recommendations']
    },
    'drug-interaction-checker': {
        slug: 'drug-interaction-checker',
        name: 'Drug Interaction Checker',
        category: 'Health & Medical',
        description: 'Flag medication interactions.',
        features: ['Med list', 'Interaction severity', 'Warnings', 'Alternatives']
    },
    'pill-identifier': {
        slug: 'pill-identifier',
        name: 'Pill Identifier',
        category: 'Health & Medical',
        description: 'Identify pill by imprint and appearance.',
        features: ['Imprint', 'Color', 'Shape', 'Match results']
    },
    'dosage-calculator': {
        slug: 'dosage-calculator',
        name: 'Dosage Calculator',
        category: 'Health & Medical',
        description: 'Child dosage estimation based on weight.',
        features: ['Weight', 'Concentration', 'Dose', 'Frequency']
    },
    'heart-age-calculator': {
        slug: 'heart-age-calculator',
        name: 'Heart Age Calculator',
        category: 'Health & Medical',
        description: 'Compare heart vs chronological age.',
        features: ['Risk factors', 'Heart age', 'Recommendations', 'Comparison']
    },
    'vaccination-schedule': {
        slug: 'vaccination-schedule',
        name: 'Vaccination Schedule Tracker',
        category: 'Health & Medical',
        description: 'Recommended vaccination timeline.',
        features: ['DOB', 'Schedule', 'Upcoming', 'Reminders']
    },
    'medical-dictionary': {
        slug: 'medical-dictionary',
        name: 'Medical Dictionary Lookup',
        category: 'Health & Medical',
        description: 'Define medical terms.',
        features: ['Term search', 'Definition', 'Related terms', 'Pronunciation']
    },
    'blood-alcohol-calculator': {
        slug: 'blood-alcohol-calculator',
        name: 'Blood Alcohol Calculator',
        category: 'Health & Medical',
        description: 'Estimate BAC over time.',
        features: ['Drinks', 'Weight', 'Time', 'BAC level']
    },
    'macro-nutrient-calculator': {
        slug: 'macro-nutrient-calculator',
        name: 'Macro Nutrient Calculator',
        category: 'Health & Fitness',
        description: 'Calculate daily macro gram targets.',
        features: ['Protein', 'Carbs', 'Fat', 'Calorie goal']
    },
    'one-rep-max': {
        slug: 'one-rep-max',
        name: 'One Rep Max Calculator',
        category: 'Health & Fitness',
        description: 'Estimate 1RM from reps performed.',
        features: ['Weight lifted', 'Reps', '1RM estimate', 'Percentage chart']
    },
    'target-heart-rate': {
        slug: 'target-heart-rate',
        name: 'Target Heart Rate Calculator',
        category: 'Health & Fitness',
        description: 'Calculate training heart rate zones.',
        features: ['Age', 'Resting HR', 'Zones', 'Training intensity']
    },
    'body-fat-percentage': {
        slug: 'body-fat-percentage',
        name: 'Body Fat Percentage Calculator',
        category: 'Health & Fitness',
        description: 'Approximate body fat percentage.',
        features: ['Measurements', 'Body fat %', 'Category', 'Recommendations']
    },
    'running-pace': {
        slug: 'running-pace',
        name: 'Running Pace Calculator',
        category: 'Health & Fitness',
        description: 'Compute required pace for target time.',
        features: ['Distance', 'Target time', 'Pace', 'Splits']
    },
    'meal-planner': {
        slug: 'meal-planner',
        name: 'Meal Planner Generator',
        category: 'Health & Fitness',
        description: 'Weekly meal plan suggestions.',
        features: ['Calories', 'Preferences', 'Meal plan', 'Shopping list']
    },

    // ===== TRAVEL TOOLS =====
    'trip-cost': {
        slug: 'trip-cost',
        name: 'Trip Cost Calculator',
        category: 'Travel',
        description: 'Budget a vacation cost.',
        features: ['Transport', 'Stay', 'Food', 'Total budget']
    },
    'travel-itinerary': {
        slug: 'travel-itinerary',
        name: 'Travel Itinerary Builder',
        category: 'Travel',
        description: 'Plan day-by-day travel schedule.',
        features: ['Days', 'Activities', 'Drag reorder', 'Export']
    },
    'packing-list': {
        slug: 'packing-list',
        name: 'Packing List Generator',
        category: 'Travel',
        description: 'Generate travel packing checklist.',
        features: ['Destination', 'Duration', 'Weather', 'Checklist']
    },
    'flight-price-tracker': {
        slug: 'flight-price-tracker',
        name: 'Flight Price Tracker',
        category: 'Travel',
        description: 'Monitor route price changes.',
        features: ['Route', 'Dates', 'Price history', 'Alerts']
    },
    'mileage-calculator': {
        slug: 'mileage-calculator',
        name: 'Mileage Calculator',
        category: 'Travel',
        description: 'Compute distance and drive time.',
        features: ['Start', 'End', 'Distance', 'Estimated time']
    },
    'travel-destination-quiz': {
        slug: 'travel-destination-quiz',
        name: 'Where Should I Travel Quiz',
        category: 'Travel',
        description: 'Suggest travel destination based on preferences.',
        features: ['Preferences', 'Budget', 'Climate', 'Suggestions']
    },
    'airport-code-lookup': {
        slug: 'airport-code-lookup',
        name: 'Airport Code Lookup',
        category: 'Travel',
        description: 'Find IATA airport codes.',
        features: ['City search', 'Airport name', 'IATA code', 'Location']
    },
    'visa-requirement-checker': {
        slug: 'visa-requirement-checker',
        name: 'Visa Requirement Checker',
        category: 'Travel',
        description: 'Check visa requirements for destination.',
        features: ['Passport country', 'Destination', 'Visa type', 'Requirements']
    },

    // ===== COOKING & RECIPES TOOLS =====
    'recipe-nutrition': {
        slug: 'recipe-nutrition',
        name: 'Recipe Nutrition Calculator',
        category: 'Cooking & Recipes',
        description: 'Analyze recipe macros and nutrition.',
        features: ['Ingredients', 'Nutrients', 'Calories', 'Per serving']
    },
    'meal-calorie': {
        slug: 'meal-calorie',
        name: 'Meal Calorie Calculator',
        category: 'Cooking & Recipes',
        description: 'Calorie lookup for foods.',
        features: ['Food search', 'Calories', 'Macros', 'Portion sizes']
    },
    'recipe-scaler': {
        slug: 'recipe-scaler',
        name: 'Recipe Scaler',
        category: 'Cooking & Recipes',
        description: 'Adjust ingredients for different servings.',
        features: ['Original servings', 'Target', 'Scaled list', 'Save recipe']
    },
    'substitution-finder': {
        slug: 'substitution-finder',
        name: 'Substitution Finder',
        category: 'Cooking & Recipes',
        description: 'Find ingredient substitutes.',
        features: ['Ingredient', 'Substitutes', 'Ratios', 'Notes']
    },
    'baking-pan-converter': {
        slug: 'baking-pan-converter',
        name: 'Baking Pan Size Converter',
        category: 'Cooking & Recipes',
        description: 'Adjust recipes for different pan sizes.',
        features: ['Original size', 'New size', 'Adjustment factor', 'Tips']
    },
    'what-can-i-make': {
        slug: 'what-can-i-make',
        name: 'What Can I Make Tool',
        category: 'Cooking & Recipes',
        description: 'Find recipes from available ingredients.',
        features: ['Ingredient list', 'Matching recipes', 'Filters', 'Save favorites']
    },
    'wine-pairing': {
        slug: 'wine-pairing',
        name: 'Wine Pairing Helper',
        category: 'Cooking & Recipes',
        description: 'Suggest wine pairings for dishes.',
        features: ['Dish type', 'Wine suggestions', 'Flavor notes', 'Alternatives']
    },
    'cooking-timer': {
        slug: 'cooking-timer',
        name: 'Cooking Timer',
        category: 'Cooking & Recipes',
        description: 'Multiple named timers for cooking.',
        features: ['Multiple timers', 'Named timers', 'Alerts', 'Preset times']
    },
    'grocery-list': {
        slug: 'grocery-list',
        name: 'Grocery List Generator',
        category: 'Cooking & Recipes',
        description: 'Organize shopping list from recipes.',
        features: ['Recipe import', 'Items grouped', 'Check off', 'Share list']
    },

    // ===== MARKETING TOOLS =====
    'email-subject-tester': {
        slug: 'email-subject-tester',
        name: 'Email Subject Line Tester',
        category: 'Marketing',
        description: 'Score effectiveness of email subjects.',
        features: ['Length check', 'Keywords', 'Sentiment', 'Score']
    },
    'social-bio-generator': {
        slug: 'social-bio-generator',
        name: 'Social Media Bio Generator',
        category: 'Marketing',
        description: 'Generate engaging social media bios.',
        features: ['Tone', 'Keywords', 'Character limit', 'Multiple outputs']
    },
    'business-name-generator': {
        slug: 'business-name-generator',
        name: 'Business Name Generator',
        category: 'Startup',
        description: 'Suggest brandable business names.',
        features: ['Keywords', 'Name list', 'Domain availability', 'Save favorites']
    },
    'cpc-calculator': {
        slug: 'cpc-calculator',
        name: 'CPC Calculator',
        category: 'Marketing',
        description: 'Compute cost-per-click metrics.',
        features: ['Ad spend', 'Clicks', 'CPC', 'ROAS']
    },
    'hashtag-generator': {
        slug: 'hashtag-generator',
        name: 'Hashtag Generator',
        category: 'Marketing',
        description: 'Suggest relevant hashtags for posts.',
        features: ['Topic', 'Trending', 'Hashtag list', 'Copy']
    },
    'instagram-caption': {
        slug: 'instagram-caption',
        name: 'Instagram Caption Generator',
        category: 'Marketing',
        description: 'Generate creative Instagram captions.',
        features: ['Post topic', 'Tone', 'Emoji', 'Caption list']
    },
    'linkedin-headline': {
        slug: 'linkedin-headline',
        name: 'LinkedIn Headline Generator',
        category: 'Marketing',
        description: 'Professional profile headline ideas.',
        features: ['Job title', 'Skills', 'Keywords', 'Headlines']
    },
    'tiktok-idea-generator': {
        slug: 'tiktok-idea-generator',
        name: 'TikTok Video Idea Generator',
        category: 'Marketing',
        description: 'Suggest trending video ideas.',
        features: ['Niche', 'Trends', 'Ideas list', 'Hooks']
    },

    // ===== SEO TOOLS =====
    'keyword-difficulty': {
        slug: 'keyword-difficulty',
        name: 'Keyword Difficulty Checker',
        category: 'SEO',
        description: 'Estimate ranking difficulty for keywords.',
        features: ['Keyword', 'Difficulty score', 'Volume', 'Competition']
    },
    'meta-tag-generator': {
        slug: 'meta-tag-generator',
        name: 'Meta Tag Generator',
        category: 'SEO',
        description: 'Generate meta title and description.',
        features: ['Title', 'Description', 'Length check', 'Preview']
    },
    'backlink-analyzer': {
        slug: 'backlink-analyzer',
        name: 'Backlink Analyzer',
        category: 'SEO',
        description: 'List referring domains.',
        features: ['Domain', 'Referrers', 'Authority', 'Anchor text']
    },
    'serp-preview': {
        slug: 'serp-preview',
        name: 'SERP Preview Tool',
        category: 'SEO',
        description: 'Google result snippet preview.',
        features: ['Title', 'Description', 'URL', 'Snippet view']
    },
    'website-rank-checker': {
        slug: 'website-rank-checker',
        name: 'Website Rank Checker',
        category: 'SEO',
        description: 'Track keyword position in search.',
        features: ['Domain', 'Keyword', 'Position', 'Trend']
    },
    'readability-analyzer': {
        slug: 'readability-analyzer',
        name: 'Content Readability Analyzer',
        category: 'SEO',
        description: 'Text readability scores.',
        features: ['Text input', 'Flesch score', 'Grade level', 'Suggestions']
    },
    'sitemap-generator': {
        slug: 'sitemap-generator',
        name: 'Sitemap Generator',
        category: 'SEO',
        description: 'Generate XML sitemap.',
        features: ['Seed URL', 'Crawl', 'XML output', 'Download']
    },
    'robots-txt-tester': {
        slug: 'robots-txt-tester',
        name: 'Robots.txt Tester',
        category: 'SEO',
        description: 'Analyze robots directives.',
        features: ['Domain', 'Rules parsed', 'Issues', 'Suggestions']
    },
    'website-speed-test': {
        slug: 'website-speed-test',
        name: 'Website Speed Test',
        category: 'SEO',
        description: 'Basic page load metrics.',
        features: ['URL', 'Load time', 'Size', 'Recommendations']
    },

    // ===== E-COMMERCE TOOLS =====
    'profit-margin': {
        slug: 'profit-margin',
        name: 'Profit Margin Calculator',
        category: 'E-commerce',
        description: 'Compute gross profit margin.',
        features: ['Cost', 'Revenue', 'Margin %', 'Markup']
    },
    'shipping-cost': {
        slug: 'shipping-cost',
        name: 'Shipping Cost Calculator',
        category: 'E-commerce',
        description: 'Compare shipping rates.',
        features: ['Dimensions', 'Weight', 'Destination', 'Carrier rates']
    },
    'product-description': {
        slug: 'product-description',
        name: 'Product Description Generator',
        category: 'E-commerce',
        description: 'Generate product descriptions.',
        features: ['Product name', 'Features', 'Tone', 'Descriptions']
    },
    'sales-tax': {
        slug: 'sales-tax',
        name: 'Sales Tax Calculator',
        category: 'E-commerce',
        description: 'Calculate total with sales tax.',
        features: ['Price', 'Location', 'Tax rate', 'Total']
    },
    'amazon-fba-fee': {
        slug: 'amazon-fba-fee',
        name: 'Amazon FBA Fee Calculator',
        category: 'E-commerce',
        description: 'Estimate Amazon FBA fees.',
        features: ['Dimensions', 'Weight', 'Category', 'Fee breakdown']
    },
    'dropshipping-profit': {
        slug: 'dropshipping-profit',
        name: 'Dropshipping Profit Calculator',
        category: 'E-commerce',
        description: 'Profit after fees and ads.',
        features: ['Cost', 'Sell price', 'Ad spend', 'Net profit']
    },

    // ===== LEGAL TOOLS =====
    'legal-document-generator': {
        slug: 'legal-document-generator',
        name: 'Legal Document Generator',
        category: 'Legal',
        description: 'Create basic legal documents.',
        features: ['Template selection', 'Q&A', 'Generated doc', 'PDF export']
    },
    'bill-of-sale': {
        slug: 'bill-of-sale',
        name: 'Bill of Sale Generator',
        category: 'Legal',
        description: 'Generate bill of sale documents.',
        features: ['Item details', 'Buyer/Seller', 'Terms', 'PDF']
    },
    'lease-agreement': {
        slug: 'lease-agreement',
        name: 'Lease Agreement Generator',
        category: 'Legal',
        description: 'Residential lease template.',
        features: ['Property info', 'Rent', 'Term', 'PDF']
    },
    'legal-word-counter': {
        slug: 'legal-word-counter',
        name: 'Legal Word Counter',
        category: 'Legal',
        description: 'Word counts for legal filings.',
        features: ['Text', 'Word count', 'Page estimate', 'Character count']
    },
    'statute-of-limitations': {
        slug: 'statute-of-limitations',
        name: 'Statute of Limitations Checker',
        category: 'Legal',
        description: 'Time limit lookup by case type.',
        features: ['Case type', 'Jurisdiction', 'Time limit', 'Info']
    },
    'power-of-attorney': {
        slug: 'power-of-attorney',
        name: 'Power of Attorney Generator',
        category: 'Legal',
        description: 'Generate POA documents.',
        features: ['Principal', 'Agent', 'Powers', 'PDF']
    },

    // ===== GAMING TOOLS =====
    'character-name-generator': {
        slug: 'character-name-generator',
        name: 'Character Name Generator',
        category: 'Gaming',
        description: 'Generate RPG/fiction character names.',
        features: ['Gender', 'Genre', 'Race', 'Name list']
    },
    'loot-drop-chance': {
        slug: 'loot-drop-chance',
        name: 'Loot Drop Chance Calculator',
        category: 'Gaming',
        description: 'Calculate probability of rare drops.',
        features: ['Drop %', 'Attempts', 'Probability', 'Expected runs']
    },
    'game-fps-calculator': {
        slug: 'game-fps-calculator',
        name: 'Game Frame Rate Calculator',
        category: 'Gaming',
        description: 'Estimate FPS for your hardware.',
        features: ['CPU', 'GPU', 'Game', 'Expected FPS']
    },
    'team-composition': {
        slug: 'team-composition',
        name: 'Team Composition Builder',
        category: 'Gaming',
        description: 'Analyze team synergy.',
        features: ['Hero pool', 'Roles', 'Synergy score', 'Suggestions']
    },
    'xp-calculator': {
        slug: 'xp-calculator',
        name: 'Experience Calculator',
        category: 'Gaming',
        description: 'XP needed to reach target level.',
        features: ['Current level', 'Target', 'XP per action', 'Time estimate']
    },
    'random-dungeon': {
        slug: 'random-dungeon',
        name: 'Random Dungeon Generator',
        category: 'Gaming',
        description: 'Create random grid dungeon maps.',
        features: ['Size', 'Difficulty', 'Map output', 'Export']
    },
    'speedrun-timer': {
        slug: 'speedrun-timer',
        name: 'Speedrunning Timer',
        category: 'Gaming',
        description: 'Lap-based timing tool for speedruns.',
        features: ['Start', 'Split', 'Reset', 'Personal best']
    },

    // ===== DATA & CODE TOOLS =====
    'json-formatter': {
        slug: 'json-formatter',
        name: 'JSON Formatter',
        category: 'Data & Code',
        description: 'Validate and pretty-print JSON.',
        features: ['Input', 'Validation', 'Formatted output', 'Minify']
    },
    'code-beautifier': {
        slug: 'code-beautifier',
        name: 'Code Beautifier/Minifier',
        category: 'Data & Code',
        description: 'Format or minify code.',
        features: ['Input', 'Beautify', 'Minify', 'Languages']
    },
    'sql-query-generator': {
        slug: 'sql-query-generator',
        name: 'SQL Query Generator',
        category: 'Data & Code',
        description: 'Generate simple SQL SELECT queries.',
        features: ['Table name', 'Columns', 'WHERE clause', 'Query output']
    },
    'api-request-builder': {
        slug: 'api-request-builder',
        name: 'API Request Builder',
        category: 'Data & Code',
        description: 'Compose and send HTTP requests.',
        features: ['URL', 'Method', 'Headers', 'Response']
    },
    'csv-to-json': {
        slug: 'csv-to-json',
        name: 'CSV to JSON Converter',
        category: 'Data & Code',
        description: 'Convert CSV to JSON format.',
        features: ['CSV input', 'Parsed JSON', 'Download', 'Copy']
    },
    'user-agent-parser': {
        slug: 'user-agent-parser',
        name: 'User Agent Parser',
        category: 'Data & Code',
        description: 'Parse browser UA string.',
        features: ['UA input', 'Browser', 'OS', 'Device']
    },

    // ===== DESIGN TOOLS =====
    'color-palette': {
        slug: 'color-palette',
        name: 'Color Palette Generator',
        category: 'Design',
        description: 'Generate harmonious color palettes.',
        features: ['Base color', 'Palette', 'HEX codes', 'Export']
    },
    'font-pairing': {
        slug: 'font-pairing',
        name: 'Font Pairing Tool',
        category: 'Design',
        description: 'Suggest font combinations.',
        features: ['Primary font', 'Pair suggestions', 'Preview', 'CSS']
    },
    'logo-maker': {
        slug: 'logo-maker',
        name: 'Logo Maker',
        category: 'Design',
        description: 'Create simple logo concepts.',
        features: ['Text', 'Icon', 'Colors', 'Download']
    },
    'image-background-remover': {
        slug: 'image-background-remover',
        name: 'Image Background Remover',
        category: 'Design',
        description: 'Remove background from images.',
        features: ['Upload', 'Preview', 'Transparent', 'Download']
    },
    'qr-code-generator': {
        slug: 'qr-code-generator',
        name: 'QR Code Generator',
        category: 'Design',
        description: 'Generate QR for text/URL.',
        features: ['Input', 'QR image', 'Colors', 'Download']
    },
    'gradient-generator': {
        slug: 'gradient-generator',
        name: 'Gradient Generator',
        category: 'Design',
        description: 'Create CSS gradient code.',
        features: ['Colors', 'Angle', 'Type', 'CSS output']
    },
    'color-picker': {
        slug: 'color-picker',
        name: 'Color Picker',
        category: 'Design',
        description: 'Pick color and view codes.',
        features: ['Picker', 'HEX', 'RGB', 'HSL']
    },
    'image-compressor': {
        slug: 'image-compressor',
        name: 'Image Compressor',
        category: 'Design',
        description: 'Reduce image file size.',
        features: ['Upload', 'Quality slider', 'Before/After', 'Download']
    },
    'social-image-resizer': {
        slug: 'social-image-resizer',
        name: 'Social Media Image Resizer',
        category: 'Design',
        description: 'Resize images for social platforms.',
        features: ['Upload', 'Platform presets', 'Crop', 'Download']
    },

    // ===== WRITING TOOLS =====
    'word-counter': {
        slug: 'word-counter',
        name: 'Word Counter',
        category: 'Writing',
        description: 'Count words and characters.',
        features: ['Live counts', 'Reading time', 'Sentences', 'Paragraphs']
    },
    'reading-time': {
        slug: 'reading-time',
        name: 'Reading Time Calculator',
        category: 'Writing',
        description: 'Estimate reading duration.',
        features: ['Word count', 'WPM setting', 'Time', 'Speaking time']
    },
    'text-summarizer': {
        slug: 'text-summarizer',
        name: 'Text Summarizer',
        category: 'Writing',
        description: 'Condense long text.',
        features: ['Input', 'Summary length', 'Key points', 'Result']
    },
    'case-converter': {
        slug: 'case-converter',
        name: 'Case Converter',
        category: 'Writing',
        description: 'Transform text case.',
        features: ['Input', 'UPPER', 'lower', 'Title Case']
    },
    'lorem-ipsum': {
        slug: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        category: 'Writing',
        description: 'Generate placeholder text.',
        features: ['Paragraphs', 'Words', 'Options', 'Copy']
    },
    'grammar-checker': {
        slug: 'grammar-checker',
        name: 'Grammar & Spell Checker',
        category: 'Writing',
        description: 'Detect grammar/spelling issues.',
        features: ['Text input', 'Highlight issues', 'Suggestions', 'Fix']
    },
    'youtube-title-generator': {
        slug: 'youtube-title-generator',
        name: 'YouTube Title Generator',
        category: 'Content',
        description: 'Suggest SEO-friendly video titles.',
        features: ['Topic', 'Keywords', 'Title list', 'Character count']
    },
    'twitter-thread': {
        slug: 'twitter-thread',
        name: 'Twitter Thread Generator',
        category: 'Content',
        description: 'Split long text into tweet thread.',
        features: ['Text input', 'Character limit', 'Tweet segments', 'Copy']
    },

    // ===== EDUCATION & STUDY TOOLS =====
    'gpa-calculator': {
        slug: 'gpa-calculator',
        name: 'GPA Calculator',
        category: 'Education & Study',
        description: 'Compute weighted GPA.',
        features: ['Courses', 'Credits', 'Grades', 'GPA']
    },
    'citation-generator': {
        slug: 'citation-generator',
        name: 'Citation Generator',
        category: 'Education & Study',
        description: 'Format academic citations.',
        features: ['Source type', 'Fields', 'APA/MLA/Chicago', 'Citation']
    },
    'plagiarism-checker': {
        slug: 'plagiarism-checker',
        name: 'Plagiarism Checker',
        category: 'Education & Study',
        description: 'Check text uniqueness.',
        features: ['Text input', 'Similarity %', 'Sources', 'Report']
    },
    'flashcards': {
        slug: 'flashcards',
        name: 'Flashcards Generator',
        category: 'Education & Study',
        description: 'Create digital flashcards.',
        features: ['Front/back', 'Flip', 'Shuffle', 'Study mode']
    },
    'equation-solver': {
        slug: 'equation-solver',
        name: 'Equation Solver',
        category: 'Math & Science',
        description: 'Solve basic equations.',
        features: ['Equation input', 'Steps', 'Solution', 'Graph']
    },
    'reading-speed-test': {
        slug: 'reading-speed-test',
        name: 'Reading Speed Test',
        category: 'Education & Study',
        description: 'Measure words per minute.',
        features: ['Passage', 'Timer', 'WPM', 'Comprehension']
    },

    // ===== FUN & ENTERTAINMENT TOOLS =====
    'meme-generator': {
        slug: 'meme-generator',
        name: 'Meme Generator',
        category: 'Fun & Entertainment',
        description: 'Create captioned memes.',
        features: ['Template', 'Text', 'Customize', 'Download']
    },
    'ascii-art': {
        slug: 'ascii-art',
        name: 'ASCII Art Generator',
        category: 'Fun & Entertainment',
        description: 'Convert text/image to ASCII.',
        features: ['Text input', 'Image upload', 'ASCII output', 'Copy']
    },
    'love-calculator': {
        slug: 'love-calculator',
        name: 'Love Calculator',
        category: 'Fun & Entertainment',
        description: 'Playful compatibility score.',
        features: ['Two names', 'Random score', 'Fun message', 'Share']
    },
    'personality-quiz': {
        slug: 'personality-quiz',
        name: 'Personality Quiz Generator',
        category: 'Fun & Entertainment',
        description: 'Create shareable quizzes.',
        features: ['Questions', 'Outcomes', 'Result', 'Share']
    },
    'baby-name-generator': {
        slug: 'baby-name-generator',
        name: 'Baby Name Generator',
        category: 'Family & Goals',
        description: 'Suggest baby names.',
        features: ['Style', 'Initial', 'Gender', 'Name list']
    },
    'what-to-watch': {
        slug: 'what-to-watch',
        name: 'What Should I Watch Picker',
        category: 'Entertainment',
        description: 'Random movie/TV suggestion.',
        features: ['Genre', 'Mood', 'Random pick', 'Details']
    },
    'decision-maker': {
        slug: 'decision-maker',
        name: 'Decision Maker',
        category: 'Utilities',
        description: 'Choose randomly between options.',
        features: ['Options list', 'Spin', 'Random selection', 'History']
    },
    'truth-or-dare': {
        slug: 'truth-or-dare',
        name: 'Truth or Dare Generator',
        category: 'Fun & Entertainment',
        description: 'Random truth/dare prompts.',
        features: ['Truth button', 'Dare button', 'Categories', 'Prompts']
    },
    'pet-name-generator': {
        slug: 'pet-name-generator',
        name: 'Pet Name Generator',
        category: 'Fun & Entertainment',
        description: 'Suggest pet names.',
        features: ['Pet type', 'Gender', 'Style', 'Names']
    },
    'book-picker': {
        slug: 'book-picker',
        name: 'What Book Should I Read Picker',
        category: 'Entertainment',
        description: 'Random book recommendation.',
        features: ['Genre', 'Mood', 'Length', 'Suggestion']
    },
    'boredom-buster': {
        slug: 'boredom-buster',
        name: 'Boredom Buster',
        category: 'Fun & Entertainment',
        description: 'Suggest random activities.',
        features: ['Category', 'Random activity', 'Indoor/Outdoor', 'Refresh']
    },

    // ===== ADDITIONAL UTILITIES =====
    'countdown-timer': {
        slug: 'countdown-timer',
        name: 'Countdown Timer',
        category: 'Utilities',
        description: 'Live countdown to event.',
        features: ['Target date', 'Live display', 'Share', 'Notifications']
    },
    'work-hours': {
        slug: 'work-hours',
        name: 'Work Hours Calculator',
        category: 'Income & Employment',
        description: 'Sum work hours and pay.',
        features: ['Clock entries', 'Hourly rate', 'Total hours', 'Total pay']
    },
    'salary-comparison': {
        slug: 'salary-comparison',
        name: 'Salary Comparison Tool',
        category: 'Income & Employment',
        description: 'Compare salaries across regions.',
        features: ['Title', 'Location', 'Range', 'Cost of living']
    },
    'url-shortener': {
        slug: 'url-shortener',
        name: 'URL Shortener',
        category: 'Utilities',
        description: 'Produce shortened link.',
        features: ['Long URL', 'Short output', 'Copy', 'QR code']
    },
    'ssl-checker': {
        slug: 'ssl-checker',
        name: 'SSL Checker',
        category: 'Security',
        description: 'Check SSL certificate validity.',
        features: ['Domain', 'Issuer', 'Expiry', 'Status']
    },
    'ip-address-lookup': {
        slug: 'ip-address-lookup',
        name: 'IP Address Lookup',
        category: 'Utilities',
        description: 'Geo lookup for IP address.',
        features: ['IP input', 'Country', 'City', 'ISP']
    },
    'password-strength': {
        slug: 'password-strength',
        name: 'Password Strength Checker',
        category: 'Security',
        description: 'Assess password robustness.',
        features: ['Entropy', 'Strength meter', 'Suggestions', 'Time to crack']
    },
    'pdf-to-word': {
        slug: 'pdf-to-word',
        name: 'PDF to Word Converter',
        category: 'Utilities',
        description: 'Convert PDF to DOCX.',
        features: ['Upload', 'Process', 'Download', 'Preview']
    },
    'file-format-converter': {
        slug: 'file-format-converter',
        name: 'File Format Converter',
        category: 'Utilities',
        description: 'Convert between file formats.',
        features: ['Upload', 'Target format', 'Convert', 'Download']
    },
    'language-translator': {
        slug: 'language-translator',
        name: 'Language Translator',
        category: 'Utilities',
        description: 'Translate text between languages.',
        features: ['Source text', 'Languages', 'Result', 'Copy']
    },
    'invoice-generator': {
        slug: 'invoice-generator',
        name: 'Invoice Generator',
        category: 'Business Operations',
        description: 'Create professional invoices.',
        features: ['Client', 'Items', 'Taxes', 'PDF export']
    },
    'swot-analysis': {
        slug: 'swot-analysis',
        name: 'SWOT Analysis Generator',
        category: 'Business Strategy',
        description: 'Generate SWOT template.',
        features: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats']
    },
    'markup-margin': {
        slug: 'markup-margin',
        name: 'Markup & Margin Calculator',
        category: 'Business Operations',
        description: 'Compute markup and margin.',
        features: ['Cost', 'Revenue', 'Markup %', 'Margin %']
    },

    // ===== ADDITIONAL DEBT TOOLS =====
    'debt-snowball-avalanche': {
        slug: 'debt-snowball-avalanche',
        name: 'Debt Snowball vs Avalanche',
        category: 'Debt',
        description: 'Compare payoff strategies.',
        features: ['Debts table', 'Strategy compare', 'Interest saved', 'Timeline']
    },

    // ===== WEATHER & ASTRONOMY =====
    'weather-comparison': {
        slug: 'weather-comparison',
        name: 'Weather Comparison Tool',
        category: 'Weather & Astronomy',
        description: 'Compare weather between cities.',
        features: ['City A', 'City B', 'Conditions', 'Forecast']
    },
    'sunrise-sunset': {
        slug: 'sunrise-sunset',
        name: 'Sunrise/Sunset Calculator',
        category: 'Weather & Astronomy',
        description: 'Sunrise and sunset times.',
        features: ['Location', 'Date', 'Sunrise', 'Sunset']
    },
    'moon-phase': {
        slug: 'moon-phase',
        name: 'Moon Phase Calendar',
        category: 'Weather & Astronomy',
        description: 'Display lunar phase.',
        features: ['Date', 'Phase image', 'Phase name', 'Illumination']
    },

    // ===== SUSTAINABILITY =====
    'carbon-footprint': {
        slug: 'carbon-footprint',
        name: 'Carbon Footprint Calculator',
        category: 'Sustainability',
        description: 'Estimate annual CO2 emissions.',
        features: ['Transport', 'Energy', 'Diet', 'CO2 tons']
    },

    // ===== WELLNESS =====
    'gratitude-journal': {
        slug: 'gratitude-journal',
        name: 'Gratitude Journal Prompts',
        category: 'Wellness',
        description: 'Daily gratitude prompts.',
        features: ['Random prompt', 'Save entries', 'History', 'Share']
    },

    // ===== TAX TOOLS =====
    'tax-refund-estimator': {
        slug: 'tax-refund-estimator',
        name: 'Tax Refund Estimator',
        category: 'Taxation',
        description: 'Estimate annual refund or taxes owed.',
        features: ['Income', 'Withholding', 'Deductions', 'Refund estimate']
    },
};

/**
 * Get tool metadata by slug
 */
export function getToolMeta(slug: string): ToolMeta | undefined {
    return toolsMeta[slug];
}

/**
 * Get category style
 */
export function getCategoryStyle(category: string) {
    return categoryColors[category] || defaultCategoryColor;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string) {
    return categoryIcons[category] || Calculator;
}
