"use client";

import type { Group, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DeleteExpenseDialog } from './delete-expense-dialog';

interface ExpensesTabProps {
  group: Group;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


export function ExpensesTab({ group, onEditExpense, onDeleteExpense }: ExpensesTabProps) {
  const sortedExpenses = [...group.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (group.expenses.length === 0) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center rounded-xl border-2 border-dashed text-center">
        <h2 className="text-xl font-semibold">No expenses yet!</h2>
        <p className="mt-2 text-muted-foreground">Click the '+' button to add the first expense.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedExpenses.map(expense => (
        <Card key={expense.id} className="overflow-hidden group/expense">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
             <div className="grid gap-1.5 flex-1">
                <CardTitle className="text-base font-semibold">{expense.description}</CardTitle>
                <CardDescription className="text-xs">
                  Paid by {expense.payer} on {formatDate(expense.date)}
                </CardDescription>
             </div>
             <div className="flex items-center gap-1">
                <div className="text-lg font-bold text-foreground text-right pr-2">
                    {formatCurrency(expense.amount, group.defaultCurrency)}
                </div>
                <div className="flex items-center opacity-0 group-hover/expense:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditExpense(expense)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Expense</span>
                    </Button>
                     <DeleteExpenseDialog expense={expense} onDeleteExpense={() => onDeleteExpense(expense.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Expense</span>
                        </Button>
                    </DeleteExpenseDialog>
                </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
