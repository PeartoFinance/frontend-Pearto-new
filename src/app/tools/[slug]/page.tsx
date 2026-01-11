'use client';

import { notFound } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';

// Import calculator components
import SIPCalculator from '@/components/tools/calculators/SIPCalculator';
import EMICalculator from '@/components/tools/calculators/EMICalculator';
import CompoundCalculator from '@/components/tools/calculators/CompoundCalculator';

// Import investing tools
import RetirementCalculator from '@/components/tools/investing/RetirementCalculator';
import ROICalculator from '@/components/tools/investing/ROICalculator';
import GoalPlanner from '@/components/tools/investing/GoalPlanner';
import DividendYieldCalculator from '@/components/tools/investing/DividendYieldCalculator';
import CAGRCalculator from '@/components/tools/investing/CAGRCalculator';
import LumpsumCalculator from '@/components/tools/investing/LumpsumCalculator';
import StepUpSIPCalculator from '@/components/tools/investing/StepUpSIPCalculator';
import PPFCalculator from '@/components/tools/investing/PPFCalculator';
import FDCalculator from '@/components/tools/investing/FDCalculator';
import RDCalculator from '@/components/tools/investing/RDCalculator';
import NSSCalculator from '@/components/tools/investing/NSSCalculator';
import SSYCalculator from '@/components/tools/investing/SSYCalculator';
import EPFCalculator from '@/components/tools/investing/EPFCalculator';
import GoldInvestmentCalculator from '@/components/tools/investing/GoldInvestmentCalculator';
import ELSSCalculator from '@/components/tools/investing/ELSSCalculator';
import SWPCalculator from '@/components/tools/investing/SWPCalculator';
import NPSCalculator from '@/components/tools/investing/NPSCalculator';

// Import finance tools
import MortgageCalculator from '@/components/tools/finance/MortgageCalculator';
import BudgetPlanner from '@/components/tools/finance/BudgetPlanner';
import IncomeTaxCalculator from '@/components/tools/finance/IncomeTaxCalculator';
import DebtPayoffCalculator from '@/components/tools/finance/DebtPayoffCalculator';
import CarLoanCalculator from '@/components/tools/finance/CarLoanCalculator';
import InflationCalculator from '@/components/tools/finance/InflationCalculator';
import SalaryToHourlyConverter from '@/components/tools/finance/SalaryToHourlyConverter';
import GSTCalculator from '@/components/tools/finance/GSTCalculator';
import RentVsBuyCalculator from '@/components/tools/finance/RentVsBuyCalculator';
import EquityDilutionCalculator from '@/components/tools/finance/EquityDilutionCalculator';
import BreakEvenCalculator from '@/components/tools/finance/BreakEvenCalculator';
import StampDutyCalculator from '@/components/tools/finance/StampDutyCalculator';
import EducationCostCalculator from '@/components/tools/finance/EducationCostCalculator';
import LoanCompareCalculator from '@/components/tools/finance/LoanCompareCalculator';
import CreditCardPayoffCalculator from '@/components/tools/finance/CreditCardPayoffCalculator';
import EmergencyFundCalculator from '@/components/tools/finance/EmergencyFundCalculator';
import MarginCalculator from '@/components/tools/finance/MarginCalculator';
import NetWorthCalculator from '@/components/tools/finance/NetWorthCalculator';
import HRACalculator from '@/components/tools/finance/HRACalculator';
import EducationLoanCalculator from '@/components/tools/finance/EducationLoanCalculator';

// Import insurance tools
import LifeInsuranceCalculator from '@/components/tools/insurance/LifeInsuranceCalculator';
import CarInsuranceCalculator from '@/components/tools/insurance/CarInsuranceCalculator';
import HealthPremiumCalculator from '@/components/tools/insurance/HealthPremiumCalculator';

// Import utility tools
import CurrencyConverter from '@/components/tools/utilities/CurrencyConverter';
import PasswordGenerator from '@/components/tools/utilities/PasswordGenerator';
import AgeCalculator from '@/components/tools/utilities/AgeCalculator';
import PercentageCalculator from '@/components/tools/utilities/PercentageCalculator';
import TipCalculator from '@/components/tools/utilities/TipCalculator';
import FuelCostCalculator from '@/components/tools/utilities/FuelCostCalculator';
import DateDifferenceCalculator from '@/components/tools/utilities/DateDifferenceCalculator';
import UnitConverter from '@/components/tools/utilities/UnitConverter';

// Import health tools
import BMICalculator from '@/components/tools/health/BMICalculator';
import CalorieCalculator from '@/components/tools/health/CalorieCalculator';
import IdealWeightCalculator from '@/components/tools/health/IdealWeightCalculator';
import PregnancyDueDateCalculator from '@/components/tools/health/PregnancyDueDateCalculator';
import WaterIntakeCalculator from '@/components/tools/health/WaterIntakeCalculator';
import SleepCalculator from '@/components/tools/health/SleepCalculator';

/**
 * Tool Component Registry
 * Maps URL slugs to React components
 */
const toolComponents: Record<string, React.ComponentType> = {
    // Calculators (existing)
    'sip': SIPCalculator,
    'emi': EMICalculator,
    'compound': CompoundCalculator,

    // Investing
    'retirement': RetirementCalculator,
    'roi-calculator': ROICalculator,
    'goal-planner': GoalPlanner,
    'dividend-yield': DividendYieldCalculator,
    'cagr': CAGRCalculator,
    'lumpsum': LumpsumCalculator,
    'step-up-sip': StepUpSIPCalculator,
    'ppf': PPFCalculator,
    'fd': FDCalculator,
    'rd': RDCalculator,
    'nsc': NSSCalculator,
    'ssy': SSYCalculator,
    'epf': EPFCalculator,
    'gold-investment': GoldInvestmentCalculator,
    'elss': ELSSCalculator,
    'swp': SWPCalculator,
    'nps': NPSCalculator,

    // Finance & Personal Finance
    'mortgage': MortgageCalculator,
    'budget-planner': BudgetPlanner,
    'income-tax': IncomeTaxCalculator,
    'debt-payoff': DebtPayoffCalculator,
    'car-loan': CarLoanCalculator,
    'inflation': InflationCalculator,
    'salary-converter': SalaryToHourlyConverter,
    'gst': GSTCalculator,
    'rent-vs-buy': RentVsBuyCalculator,
    'equity-dilution': EquityDilutionCalculator,
    'break-even': BreakEvenCalculator,
    'stamp-duty': StampDutyCalculator,
    'education-cost': EducationCostCalculator,
    'loan-compare': LoanCompareCalculator,
    'credit-card-payoff': CreditCardPayoffCalculator,
    'emergency-fund': EmergencyFundCalculator,
    'margin': MarginCalculator,
    'net-worth': NetWorthCalculator,
    'hra': HRACalculator,
    'education-loan': EducationLoanCalculator,

    // Insurance
    'life-insurance': LifeInsuranceCalculator,
    'car-insurance': CarInsuranceCalculator,
    'health-premium': HealthPremiumCalculator,

    // Utilities
    'currency-converter': CurrencyConverter,
    'password-generator': PasswordGenerator,
    'age-calculator': AgeCalculator,
    'percentage': PercentageCalculator,
    'tip': TipCalculator,
    'fuel-cost': FuelCostCalculator,
    'date-difference': DateDifferenceCalculator,
    'unit-converter': UnitConverter,

    // Health
    'bmi-calculator': BMICalculator,
    'calorie-calculator': CalorieCalculator,
    'ideal-weight': IdealWeightCalculator,
    'pregnancy-due-date': PregnancyDueDateCalculator,
    'water-intake': WaterIntakeCalculator,
    'sleep': SleepCalculator,
};

// Export the component map for use by generateStaticParams in a separate file if needed
export { toolComponents };

interface ToolPageProps {
    params: { slug: string };
}

export default function DynamicToolPage({ params }: ToolPageProps) {
    const { slug } = params;

    // Get the component for this slug
    const ToolComponent = toolComponents[slug];

    // If no component found, show 404
    if (!ToolComponent) {
        notFound();
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Sidebar - Desktop Only */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header Section */}
                <div className="fixed top-0 right-0 left-0 md:left-[200px] z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 max-w-full">
                        <ToolComponent />
                    </div>
                </div>
            </main>
        </div>
    );
}
