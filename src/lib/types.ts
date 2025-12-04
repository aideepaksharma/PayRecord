export type Member = string;

export const CURRENCIES = [
  { value: 'USD', label: '🇺🇸 USD' },
  { value: 'EUR', label: '🇪🇺 EUR' },
  { value: 'INR', label: '🇮🇳 INR' },
  { value: 'GBP', label: '🇬🇧 GBP' },
  { value: 'JPY', label: '🇯🇵 JPY' },
] as const;

export type Currency = typeof CURRENCIES[number]['value'];

export type SplitLogic = 'EQUAL' | 'EXACT' | 'SHARES';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  payer: Member;
  splitLogic: SplitLogic;
  // For EQUAL and SHARES, value is share count. For EXACT, value is amount.
  splitDistribution: { member: Member, value: number }[];
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  members: Member[];
  defaultCurrency: Currency;
  expenses: Expense[];
}

export interface User {
  name: string;
}

export interface SimplifiedDebt {
    from: string;
    to: string;
    amount: number;
}
