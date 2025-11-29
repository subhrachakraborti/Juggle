import { CashflowForecast } from '@/components/dashboard/cashflow-forecast';
import { SavingsPlan } from '@/components/dashboard/savings-plan';

export default function ProjectionsPage() {
  return (
    <div className="grid gap-4 md:gap-8">
      <CashflowForecast />
      <SavingsPlan />
    </div>
  );
}
