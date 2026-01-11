/**
 * Tool Metadata Registry
 * Static metadata for tools - names, descriptions, icons, features
 * Database stores enabled/disabled state, this provides UI details
 */

import {
    Calculator, TrendingUp, Shield, DollarSign, Home,
    Heart, Users, Briefcase, Plane, ChefHat, Code, Palette,
    Key, Clock, GraduationCap, Building2
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
    'Business': Building2,
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
    'Business': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
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
