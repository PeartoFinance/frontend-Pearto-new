'use client';

import { notFound } from 'next/navigation';
import { use, useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import Header from '@/components/layout/Header';
import ComingSoonTool from '@/components/tools/ComingSoonTool';
import { getToolMeta } from '@/data/tools';

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

// Import writing tools
import WordCounter from '@/components/tools/writing/WordCounter';
import CaseConverter from '@/components/tools/writing/CaseConverter';
import LoremIpsum from '@/components/tools/writing/LoremIpsum';
import ReadingTime from '@/components/tools/writing/ReadingTime';

// Import code tools
import JSONFormatter from '@/components/tools/code/JSONFormatter';
import CSVToJSON from '@/components/tools/code/CSVToJSON';
import UserAgentParser from '@/components/tools/code/UserAgentParser';

// Import design tools
import ColorPalette from '@/components/tools/design/ColorPalette';
import GradientGenerator from '@/components/tools/design/GradientGenerator';
import QRCodeGenerator from '@/components/tools/design/QRCodeGenerator';

// Import fun tools
import LoveCalculator from '@/components/tools/fun/LoveCalculator';

// Import additional utilities
import DecisionMaker from '@/components/tools/utilities/DecisionMaker';

// Import productivity tools
import PomodoroTimer from '@/components/tools/productivity/PomodoroTimer';
import MeetingCostCalculator from '@/components/tools/productivity/MeetingCostCalculator';

// Import marketing tools
import HashtagGenerator from '@/components/tools/marketing/HashtagGenerator';
import CPCCalculator from '@/components/tools/marketing/CPCCalculator';

// Import SEO tools
import MetaTagGenerator from '@/components/tools/seo/MetaTagGenerator';

// Import e-commerce tools
import ProfitMarginCalculator from '@/components/tools/ecommerce/ProfitMarginCalculator';

// Import education tools
import GPACalculator from '@/components/tools/education/GPACalculator';
import StudyPlanner from '@/components/tools/education/StudyPlanner';

// Import cooking tools
import RecipeScaler from '@/components/tools/cooking/RecipeScaler';

// Import travel tools
import TripCostCalculator from '@/components/tools/travel/TripCostCalculator';
import VacationBudgetPlanner from '@/components/tools/travel/VacationBudgetPlanner';

// Import real estate tools
import SquareFootageCalculator from '@/components/tools/realestate/SquareFootageCalculator';
import DownPaymentCalculator from '@/components/tools/realestate/DownPaymentCalculator';
import RentalYieldCalculator from '@/components/tools/realestate/RentalYieldCalculator';

// Import additional health tools
import TargetHeartRate from '@/components/tools/health/TargetHeartRate';
import MedicationDosageCalculator from '@/components/tools/health/MedicationDosageCalculator';
import OvulationCalculator from '@/components/tools/health/OvulationCalculator';

// Import gaming tools
import GameStatsCalculator from '@/components/tools/gaming/GameStatsCalculator';

// Import legal tools
import ContractValueCalculator from '@/components/tools/legal/ContractValueCalculator';

// Import insurance tools
import InsurancePremiumEstimator from '@/components/tools/insurance/InsurancePremiumEstimator';
import TravelInsuranceCalculator from '@/components/tools/insurance/TravelInsuranceCalculator';

// Import portfolio tools
import AssetAllocationCalculator from '@/components/tools/portfolio/AssetAllocationCalculator';
import VolatilityCalculator from '@/components/tools/portfolio/VolatilityCalculator';
import MarketCrashSimulator from '@/components/tools/portfolio/MarketCrashSimulator';
import PortfolioRebalancer from '@/components/tools/portfolio/PortfolioRebalancer';

// Import investing tools (advanced)
import BetaCalculator from '@/components/tools/investing/BetaCalculator';
import DCACalculator from '@/components/tools/investing/DCACalculator';
import DividendTracker from '@/components/tools/investing/DividendTracker';
import StockValuationCalculator from '@/components/tools/investing/StockValuationCalculator';
import BondYieldCalculator from '@/components/tools/investing/BondYieldCalculator';

// Import savings tools
import SavingsGrowthCalculator from '@/components/tools/savings/SavingsGrowthCalculator';

// Import finance tools (advanced)
import LoanAmortizationCalculator from '@/components/tools/finance/LoanAmortizationCalculator';

// Import retirement tools (advanced)
import FIRECalculator from '@/components/tools/retirement/FIRECalculator';
import PensionCalculator from '@/components/tools/retirement/PensionCalculator';
import SocialSecurityEstimator from '@/components/tools/retirement/SocialSecurityEstimator';

// Import trading tools
import OptionsProfitCalculator from '@/components/tools/trading/OptionsProfitCalculator';

// Import taxation tools
import CapitalGainsTaxCalculator from '@/components/tools/taxation/CapitalGainsTaxCalculator';

// Import additional marketing tools
import ROASCalculator from '@/components/tools/marketing/ROASCalculator';

// Import additional e-commerce tools
import DiscountCalculator from '@/components/tools/ecommerce/DiscountCalculator';

// Import additional fun tools
import RandomNumberGenerator from '@/components/tools/fun/RandomNumberGenerator';

// Import additional SEO tools
import KeywordDensityChecker from '@/components/tools/seo/KeywordDensityChecker';

// Import additional cooking tools
import CookingTempGuide from '@/components/tools/cooking/CookingTempGuide';
import BakingPanConverter from '@/components/tools/cooking/BakingPanConverter';
import CookingTimer from '@/components/tools/cooking/CookingTimer';
import GroceryList from '@/components/tools/cooking/GroceryList';
import MealCalorie from '@/components/tools/cooking/MealCalorie';
import RecipeNutrition from '@/components/tools/cooking/RecipeNutrition';
import SubstitutionFinder from '@/components/tools/cooking/SubstitutionFinder';
import WhatCanIMake from '@/components/tools/cooking/WhatCanIMake';
import WinePairing from '@/components/tools/cooking/WinePairing';

// Import education tools (advanced)
import CollegeSavingsPlanner from '@/components/tools/education/CollegeSavingsPlanner';

// Import additional finance tools
import DebtSnowballAvalanche from '@/components/tools/finance/DebtSnowballAvalanche';
import InvoiceGenerator from '@/components/tools/finance/InvoiceGenerator';
import MarkupMarginCalc from '@/components/tools/finance/MarkupMarginCalc';
import SalaryComparison from '@/components/tools/finance/SalaryComparison';
import SwotAnalysis from '@/components/tools/finance/SwotAnalysis';
import TaxRefundEstimator from '@/components/tools/finance/TaxRefundEstimator';
import WorkHoursCalculator from '@/components/tools/finance/WorkHoursCalculator';

// Import additional health tools
import BloodAlcoholCalculator from '@/components/tools/health/BloodAlcoholCalculator';
import BodyFatCalculator from '@/components/tools/health/BodyFatCalculator';
import DosageCalculator from '@/components/tools/health/DosageCalculator';
import DrugInteractionChecker from '@/components/tools/health/DrugInteractionChecker';
import HeartAgeCalculator from '@/components/tools/health/HeartAgeCalculator';
import MacroCalculator from '@/components/tools/health/MacroCalculator';
import MealPlanner from '@/components/tools/health/MealPlanner';
import MedicalDictionary from '@/components/tools/health/MedicalDictionary';
import OneRepMax from '@/components/tools/health/OneRepMax';
import PillIdentifier from '@/components/tools/health/PillIdentifier';
import RunningPaceCalculator from '@/components/tools/health/RunningPaceCalculator';
import SymptomChecker from '@/components/tools/health/SymptomChecker';
import VaccinationSchedule from '@/components/tools/health/VaccinationSchedule';

// Import additional insurance tools
import BikeInsuranceCalculator from '@/components/tools/insurance/BikeInsuranceCalculator';
import HumanLifeValue from '@/components/tools/insurance/HumanLifeValue';
import NRITermCalculator from '@/components/tools/insurance/NRITermCalculator';
import ParentsHealthCalculator from '@/components/tools/insurance/ParentsHealthCalculator';
import TermInsuranceCalculator from '@/components/tools/insurance/TermInsuranceCalculator';
import TermLifeCalculator from '@/components/tools/insurance/TermLifeCalculator';

// Import additional investing tools
import RiskLevelAssessment from '@/components/tools/investing/RiskLevelAssessment';
import VolatilityMeasurement from '@/components/tools/investing/VolatilityMeasurement';

// Import additional portfolio tools
import CorrelationMatrix from '@/components/tools/portfolio/CorrelationMatrix';
import ESGScoring from '@/components/tools/portfolio/ESGScoring';
import ETFOverlap from '@/components/tools/portfolio/ETFOverlap';
import FeeAnalyzer from '@/components/tools/portfolio/FeeAnalyzer';

// Import additional productivity tools
import GoalSettingTemplate from '@/components/tools/productivity/GoalSettingTemplate';
import HabitTracker from '@/components/tools/productivity/HabitTracker';
import MindMapGenerator from '@/components/tools/productivity/MindMapGenerator';
import ProjectTimeline from '@/components/tools/productivity/ProjectTimeline';
import TaskPriorityMatrix from '@/components/tools/productivity/TaskPriorityMatrix';
import TimeZoneConverter from '@/components/tools/productivity/TimeZoneConverter';

// Import additional real estate tools
import HomeLoanComparison from '@/components/tools/realestate/HomeLoanComparison';
import HomeValueEstimator from '@/components/tools/realestate/HomeValueEstimator';
import MortgageAffordability from '@/components/tools/realestate/MortgageAffordability';
import MortgageRefinance from '@/components/tools/realestate/MortgageRefinance';
import MovingCostCalculator from '@/components/tools/realestate/MovingCostCalculator';
import PaintCalculator from '@/components/tools/realestate/PaintCalculator';

// Import additional travel tools
import AirportCodeLookup from '@/components/tools/travel/AirportCodeLookup';
import FlightPriceTracker from '@/components/tools/travel/FlightPriceTracker';
import MileageCalculator from '@/components/tools/travel/MileageCalculator';
import PackingList from '@/components/tools/travel/PackingList';
import TravelDestinationQuiz from '@/components/tools/travel/TravelDestinationQuiz';
import TravelItinerary from '@/components/tools/travel/TravelItinerary';
import VisaRequirementChecker from '@/components/tools/travel/VisaRequirementChecker';

// Import debt tools
import DebtPayoffCalculatorDebt from '@/components/tools/debt/DebtPayoffCalculator';

/**
 * Tool Component Registry
 * Maps URL slugs to React components
 * Only contains implemented tools
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
    'decision-maker': DecisionMaker,

    // Health
    'bmi-calculator': BMICalculator,
    'calorie-calculator': CalorieCalculator,
    'ideal-weight': IdealWeightCalculator,
    'pregnancy-due-date': PregnancyDueDateCalculator,
    'water-intake': WaterIntakeCalculator,
    'sleep': SleepCalculator,

    // Writing
    'word-counter': WordCounter,
    'case-converter': CaseConverter,
    'lorem-ipsum': LoremIpsum,
    'reading-time': ReadingTime,

    // Data & Code
    'json-formatter': JSONFormatter,
    'csv-to-json': CSVToJSON,
    'user-agent-parser': UserAgentParser,

    // Design
    'color-palette': ColorPalette,
    'gradient-generator': GradientGenerator,
    'qr-code-generator': QRCodeGenerator,

    // Fun & Entertainment
    'love-calculator': LoveCalculator,

    // Productivity
    'pomodoro-timer': PomodoroTimer,
    'meeting-cost-calculator': MeetingCostCalculator,

    // Marketing
    'hashtag-generator': HashtagGenerator,
    'cpc-calculator': CPCCalculator,

    // SEO
    'meta-tag-generator': MetaTagGenerator,

    // E-commerce
    'profit-margin': ProfitMarginCalculator,
    'discount-calculator': DiscountCalculator,

    // Education
    'gpa-calculator': GPACalculator,
    'study-planner': StudyPlanner,

    // Cooking
    'recipe-scaler': RecipeScaler,

    // Travel
    'trip-cost': TripCostCalculator,
    'vacation-budget': VacationBudgetPlanner,

    // Real Estate
    'square-footage': SquareFootageCalculator,
    'down-payment': DownPaymentCalculator,

    // Additional Health
    'target-heart-rate': TargetHeartRate,
    'medication-dosage': MedicationDosageCalculator,
    'ovulation-calculator': OvulationCalculator,

    // Gaming
    'game-stats': GameStatsCalculator,

    // Legal
    'contract-value': ContractValueCalculator,

    // Insurance (additional)
    'insurance-premium': InsurancePremiumEstimator,

    // Portfolio
    'asset-allocation': AssetAllocationCalculator,

    // Additional Marketing
    'roas-calculator': ROASCalculator,

    // Additional Fun
    'random-number': RandomNumberGenerator,

    // Additional SEO
    'keyword-density': KeywordDensityChecker,

    // Additional Cooking
    'cooking-temp': CookingTempGuide,

    // Advanced Investing (with charts)
    'beta-calculator': BetaCalculator,
    'dca-calculator': DCACalculator,
    'dividend-tracker': DividendTracker,

    // Portfolio Analysis (with charts)
    'volatility-calculator': VolatilityCalculator,
    'market-crash-simulator': MarketCrashSimulator,
    'portfolio-rebalancer': PortfolioRebalancer,

    // Taxation
    'capital-gains-tax': CapitalGainsTaxCalculator,

    // Insurance (advanced)
    'travel-insurance': TravelInsuranceCalculator,

    // Education (advanced with charts)
    'college-savings': CollegeSavingsPlanner,

    // Retirement (advanced with charts)
    'fire-calculator': FIRECalculator,

    // Investing (advanced with charts)
    'stock-valuation': StockValuationCalculator,

    // Savings (with charts)
    'savings-growth': SavingsGrowthCalculator,

    // Finance (advanced with charts)
    'loan-amortization': LoanAmortizationCalculator,

    // Retirement (additional with charts)
    'pension-calculator': PensionCalculator,
    'social-security': SocialSecurityEstimator,

    // Trading (with charts)
    'options-profit': OptionsProfitCalculator,

    // Additional Finance
    'debt-snowball-avalanche': DebtSnowballAvalanche,
    'invoice-generator': InvoiceGenerator,
    'markup-margin': MarkupMarginCalc,
    'salary-comparison': SalaryComparison,
    'swot-analysis': SwotAnalysis,
    'tax-refund-estimator': TaxRefundEstimator,
    'work-hours': WorkHoursCalculator,

    // Additional Health
    'blood-alcohol-calculator': BloodAlcoholCalculator,
    'body-fat-percentage': BodyFatCalculator,
    'dosage-calculator': DosageCalculator,
    'drug-interaction-checker': DrugInteractionChecker,
    'heart-age-calculator': HeartAgeCalculator,
    'macro-nutrient-calculator': MacroCalculator,
    'meal-planner': MealPlanner,
    'medical-dictionary': MedicalDictionary,
    'one-rep-max': OneRepMax,
    'pill-identifier': PillIdentifier,
    'running-pace': RunningPaceCalculator,
    'symptom-checker': SymptomChecker,
    'vaccination-schedule': VaccinationSchedule,

    // Additional Insurance
    'bike-insurance': BikeInsuranceCalculator,
    'human-life-value': HumanLifeValue,
    'nri-term': NRITermCalculator,
    'parents-health': ParentsHealthCalculator,
    'term-insurance': TermInsuranceCalculator,
    'term-life': TermLifeCalculator,

    // Additional Investing
    'risk-level-assessment': RiskLevelAssessment,
    'volatility-measurement': VolatilityMeasurement,
    'bond-yield': BondYieldCalculator,

    // Additional Portfolio
    'correlation-matrix': CorrelationMatrix,
    'esg-scoring': ESGScoring,
    'etf-overlap': ETFOverlap,
    'fee-analyzer': FeeAnalyzer,

    // Additional Productivity
    'goal-setting-template': GoalSettingTemplate,
    'habit-tracker': HabitTracker,
    'mind-map-generator': MindMapGenerator,
    'project-timeline-generator': ProjectTimeline,
    'task-priority-matrix': TaskPriorityMatrix,
    'time-zone-converter': TimeZoneConverter,

    // Additional Real Estate
    'home-loan-comparison': HomeLoanComparison,
    'home-value-estimator': HomeValueEstimator,
    'mortgage-affordability': MortgageAffordability,
    'mortgage-refinance': MortgageRefinance,
    'moving-cost': MovingCostCalculator,
    'paint-calculator': PaintCalculator,
    'rental-yield': RentalYieldCalculator,

    // Additional Travel
    'airport-code-lookup': AirportCodeLookup,
    'flight-price-tracker': FlightPriceTracker,
    'mileage-calculator': MileageCalculator,
    'packing-list': PackingList,
    'travel-destination-quiz': TravelDestinationQuiz,
    'travel-itinerary': TravelItinerary,
    'visa-requirement-checker': VisaRequirementChecker,

    // Additional Cooking
    'baking-pan-converter': BakingPanConverter,
    'cooking-timer': CookingTimer,
    'grocery-list': GroceryList,
    'meal-calorie': MealCalorie,
    'recipe-nutrition': RecipeNutrition,
    'substitution-finder': SubstitutionFinder,
    'what-can-i-make': WhatCanIMake,
    'wine-pairing': WinePairing,
};

// Export the component map for use by other modules if needed
export { toolComponents };

interface ToolPageProps {
    params: Promise<{ slug: string }>;
}

export default function DynamicToolPage({ params }: ToolPageProps) {
    // In Next.js 15+, params is a Promise that needs to be unwrapped
    const { slug } = use(params);

    // Get the component for this slug (if implemented)
    const ToolComponent = toolComponents[slug];

    // Get tool metadata from our registry
    const toolMeta = getToolMeta(slug);

    // If tool exists in metadata but has no component, show Coming Soon
    if (!ToolComponent && toolMeta) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 md:left-[200px] z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px]">
                        <div className="p-4 lg:p-6 max-w-full">
                            <ComingSoonTool
                                slug={slug}
                                name={toolMeta.name}
                                category={toolMeta.category}
                            />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // If no component AND no metadata, show 404
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

