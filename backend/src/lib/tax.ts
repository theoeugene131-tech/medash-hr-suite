/** Nigerian payroll estimate only. Rules need current professional validation before production use. */
export interface Deductions { monthlyPAYE: number; pensionEmployee: number; pensionEmployer: number; nhf: number; net: number; }
const PAYE_BANDS: [number, number][] = [[300000,0.07],[300000,0.11],[500000,0.15],[500000,0.19],[1600000,0.21],[Infinity,0.24]];
export function estimateDeductions(grossMonthly: number): Deductions {
  const annual = grossMonthly * 12;
  const cra = Math.max(200000, annual * 0.01) + annual * 0.2;
  const pensionEmployeeAnnual = annual * 0.08;
  const pensionEmployerAnnual = annual * 0.1;
  let remaining = Math.max(annual - cra - pensionEmployeeAnnual, 0), tax = 0;
  for (const [size, rate] of PAYE_BANDS) { if (remaining <= 0) break; const amount = Math.min(size, remaining); tax += amount * rate; remaining -= amount; }
  const monthlyPAYE = Math.round(tax / 12);
  const pensionEmployee = Math.round(pensionEmployeeAnnual / 12);
  const pensionEmployer = Math.round(pensionEmployerAnnual / 12);
  const nhf = Math.round(grossMonthly * 0.025);
  return { monthlyPAYE, pensionEmployee, pensionEmployer, nhf, net: grossMonthly - monthlyPAYE - pensionEmployee - nhf };
}
