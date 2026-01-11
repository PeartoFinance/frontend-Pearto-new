/**
 * Tool Component Registry
 * Re-exports tool components for external use
 */

// Shared components
export { default as CalculatorLayout } from './CalculatorLayout';
export { default as ToolCard } from './ToolCard';
export { default as ToolsGrid } from './ToolsGrid';

// Calculator Components
export { default as SIPCalculator } from './calculators/SIPCalculator';
export { default as EMICalculator } from './calculators/EMICalculator';
export { default as CompoundCalculator } from './calculators/CompoundCalculator';

// Investing Tools
export { default as RetirementCalculator } from './investing/RetirementCalculator';
export { default as ROICalculator } from './investing/ROICalculator';
export { default as GoalPlanner } from './investing/GoalPlanner';

// Finance Tools
export { default as MortgageCalculator } from './finance/MortgageCalculator';
export { default as BudgetPlanner } from './finance/BudgetPlanner';
export { default as IncomeTaxCalculator } from './finance/IncomeTaxCalculator';

// Insurance Tools
export { default as LifeInsuranceCalculator } from './insurance/LifeInsuranceCalculator';
export { default as CarInsuranceCalculator } from './insurance/CarInsuranceCalculator';
export { default as HealthPremiumCalculator } from './insurance/HealthPremiumCalculator';

// Utility Tools
export { default as CurrencyConverter } from './utilities/CurrencyConverter';
export { default as PasswordGenerator } from './utilities/PasswordGenerator';
export { default as AgeCalculator } from './utilities/AgeCalculator';

// Health Tools
export { default as BMICalculator } from './health/BMICalculator';
export { default as CalorieCalculator } from './health/CalorieCalculator';
