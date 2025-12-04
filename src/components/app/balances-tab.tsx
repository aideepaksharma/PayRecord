"use client";

import { useState } from 'react';
import type { Group, SimplifiedDebt, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calculator, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface BalancesTabProps {
  group: Group;
}

export function BalancesTab({ group }: BalancesTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [simplifiedDebts, setSimplifiedDebts] = useState<SimplifiedDebt[] | null>(null);

  const calculateBalances = () => {
    const balances = new Map<Member, number>();
    group.members.forEach(member => balances.set(member, 0));

    group.expenses.forEach(expense => {
      // Payer gets credited
      const payerBalance = balances.get(expense.payer) ?? 0;
      balances.set(expense.payer, payerBalance + expense.amount);

      let totalSplit = 0;
      const memberPortions: { member: Member; value: number }[] = [];
      
      if (expense.splitLogic === 'EQUAL') {
        const totalShares = expense.splitDistribution.reduce((sum, item) => sum + item.value, 0);
        if (totalShares > 0) {
            const amountPerShare = expense.amount / totalShares;
            expense.splitDistribution.forEach(item => {
                memberPortions.push({ member: item.member, value: amountPerShare * item.value });
            });
        }
      } else if (expense.splitLogic === 'EXACT') {
        expense.splitDistribution.forEach(item => {
            memberPortions.push({ member: item.member, value: item.value });
        });
      } else if (expense.splitLogic === 'SHARES') {
        const totalShares = expense.splitDistribution.reduce((sum, item) => sum + item.value, 0);
        if (totalShares > 0) {
            const amountPerShare = expense.amount / totalShares;
            expense.splitDistribution.forEach(item => {
                memberPortions.push({ member: item.member, value: amountPerShare * item.value });
            });
        }
      }

      memberPortions.forEach(portion => {
          const memberBalance = balances.get(portion.member) ?? 0;
          balances.set(portion.member, memberBalance - portion.value);
          totalSplit += portion.value;
      });

      // Handle potential floating point inaccuracies
      if (Math.abs(expense.amount - totalSplit) > 0.01) {
          const payerBalance = balances.get(expense.payer) ?? 0;
          balances.set(expense.payer, payerBalance - (expense.amount - totalSplit));
      }
    });
    
    return balances;
  };
  
  const handleSimplifyDebts = () => {
    setIsLoading(true);
    setSimplifiedDebts(null);
    
    // Simulate a short delay for better UX
    setTimeout(() => {
        const balances = calculateBalances();
      
        const debtors: { who: Member; amount: number }[] = [];
        const creditors: { who: Member; amount: number }[] = [];

        balances.forEach((amount, who) => {
            if (amount < -0.01) {
            debtors.push({ who, amount: -amount });
            } else if (amount > 0.01) {
            creditors.push({ who, amount });
            }
        });

        const transactions: SimplifiedDebt[] = [];
        let debtorIndex = 0;
        let creditorIndex = 0;

        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];
            const amount = Math.min(debtor.amount, creditor.amount);

            if (amount > 0.01) {
                transactions.push({ from: debtor.who, to: creditor.who, amount });
            }

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount < 0.01) debtorIndex++;
            if (creditor.amount < 0.01) creditorIndex++;
        }
        
        setSimplifiedDebts(transactions);
        setIsLoading(false);
    }, 500);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Simplify Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Calculate the minimum number of transactions needed to settle all debts in the group.
          </p>
          <Button onClick={handleSimplifyDebts} disabled={isLoading} className="w-full" variant="default">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
            {isLoading ? 'Calculating...' : 'Calculate Settlement'}
          </Button>
        </CardContent>
      </Card>
      
      {simplifiedDebts && (
        <Card>
          <CardHeader>
            <CardTitle>Settlement Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {simplifiedDebts.length === 0 ? (
              <p className="text-center text-muted-foreground">Everyone is settled up!</p>
            ) : (
              <ul className="space-y-3">
                {simplifiedDebts.map((debt, index) => (
                  <li key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(debt.from)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{debt.from}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <ArrowRight className="h-4 w-4"/>
                       <span className="font-bold text-lg text-foreground">{formatCurrency(debt.amount, group.defaultCurrency)}</span>
                       <ArrowRight className="h-4 w-4"/>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{debt.to}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(debt.to)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
