"use client";

import type { Group, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus } from 'lucide-react';
import { ExpensesTab } from './expenses-tab';
import { BalancesTab } from './balances-tab';
import { AddExpenseSheet } from './add-expense-sheet';
import { useState } from 'react';

interface GroupScreenProps {
  group: Group;
  onAddExpense: (expenseData: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onBack: () => void;
}

export function GroupScreen({ group, onAddExpense, onUpdateExpense, onDeleteExpense, onBack }: GroupScreenProps) {
    const [sheetState, setSheetState] = useState<{isOpen: boolean, expenseToEdit?: Expense}>({isOpen: false});

    const handleOpenAddSheet = () => setSheetState({isOpen: true, expenseToEdit: undefined});
    const handleOpenEditSheet = (expense: Expense) => setSheetState({isOpen: true, expenseToEdit: expense });
    const handleCloseSheet = () => setSheetState({isOpen: false});
    
  return (
    <div className="min-h-screen w-full bg-background pb-24">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
             <span className="text-4xl">{group.emoji}</span>
             <div>
                <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                <p className="text-sm text-muted-foreground">{group.members.join(', ')}</p>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs defaultValue="expenses">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="mt-4">
            <ExpensesTab group={group} onEditExpense={handleOpenEditSheet} onDeleteExpense={onDeleteExpense} />
          </TabsContent>
          <TabsContent value="balances" className="mt-4">
            <BalancesTab group={group} />
          </TabsContent>
        </Tabs>
      </main>

      <AddExpenseSheet
        isOpen={sheetState.isOpen}
        setIsOpen={handleCloseSheet}
        group={group}
        onAddExpense={onAddExpense}
        onUpdateExpense={onUpdateExpense}
        expenseToEdit={sheetState.expenseToEdit}
      />

      <div className="fixed bottom-6 right-6 z-20">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={handleOpenAddSheet}
        >
          <Plus className="h-7 w-7" />
          <span className="sr-only">Add Expense</span>
        </Button>
      </div>
    </div>
  );
}
