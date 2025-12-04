"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Group, Expense, SplitLogic, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AddExpenseSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  group: Group;
  expenseToEdit?: Expense;
  onAddExpense: (expenseData: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
}

const getInitialState = (group: Group, expenseToEdit?: Expense) => {
    if (expenseToEdit) {
        let equalSplit = Object.fromEntries(group.members.map(m => [m, false]));
        let exactSplit = Object.fromEntries(group.members.map(m => [m, '']));
        let sharesSplit = Object.fromEntries(group.members.map(m => [m, '']));

        if (expenseToEdit.splitLogic === 'EQUAL') {
            expenseToEdit.splitDistribution.forEach(item => { equalSplit[item.member] = true; });
        } else if (expenseToEdit.splitLogic === 'EXACT') {
            expenseToEdit.splitDistribution.forEach(item => { exactSplit[item.member] = item.value; });
        } else if (expenseToEdit.splitLogic === 'SHARES') {
            expenseToEdit.splitDistribution.forEach(item => { sharesSplit[item.member] = item.value; });
        }
        
        return {
            description: expenseToEdit.description,
            amount: expenseToEdit.amount,
            payer: expenseToEdit.payer,
            date: new Date(expenseToEdit.date).toISOString().split('T')[0],
            splitLogic: expenseToEdit.splitLogic,
            equalSplit,
            exactSplit,
            sharesSplit,
        };
    }
    return {
        description: '',
        amount: '' as number | '',
        payer: group.members[0],
        date: new Date().toISOString().split('T')[0],
        splitLogic: 'EQUAL' as SplitLogic,
        equalSplit: Object.fromEntries(group.members.map(m => [m, true])),
        exactSplit: Object.fromEntries(group.members.map(m => [m, ''])),
        sharesSplit: Object.fromEntries(group.members.map(m => [m, 1])),
    };
};


export function AddExpenseSheet({ isOpen, setIsOpen, group, expenseToEdit, onAddExpense, onUpdateExpense }: AddExpenseSheetProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [payer, setPayer] = useState<Member>(group.members[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [splitLogic, setSplitLogic] = useState<SplitLogic>('EQUAL');

  const [equalSplit, setEqualSplit] = useState<Record<Member, boolean>>(
    Object.fromEntries(group.members.map(m => [m, true]))
  );
  const [exactSplit, setExactSplit] = useState<Record<Member, number | ''>>(
    Object.fromEntries(group.members.map(m => [m, '']))
  );
  const [sharesSplit, setSharesSplit] = useState<Record<Member, number | ''>>(
    Object.fromEntries(group.members.map(m => [m, 1]))
  );

  const { toast } = useToast();
  
  const isEditMode = !!expenseToEdit;

  const resetForm = (group: Group, expenseToEdit?: Expense) => {
    const initialState = getInitialState(group, expenseToEdit);
    setDescription(initialState.description);
    setAmount(initialState.amount);
    setPayer(initialState.payer);
    setDate(initialState.date);
    setSplitLogic(initialState.splitLogic);
    setEqualSplit(initialState.equalSplit);
    setExactSplit(initialState.exactSplit);
    setSharesSplit(initialState.sharesSplit);
  }

  useEffect(() => {
    if (isOpen) {
      resetForm(group, expenseToEdit);
    }
  }, [isOpen, expenseToEdit, group]);


  const exactSplitTotal = useMemo(() => {
    return Object.values(exactSplit).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [exactSplit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !numericAmount || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please fill in description and a valid amount.' });
      return;
    }
    
    if (!date) {
      toast({ variant: 'destructive', title: 'Invalid Date', description: 'Please select a date for the expense.' });
      return;
    }

    let splitDistribution: { member: Member; value: number }[] = [];
    if (splitLogic === 'EQUAL') {
      const selectedMembers = Object.keys(equalSplit).filter(m => equalSplit[m]);
      if (selectedMembers.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid Split', description: 'At least one member must be selected for an equal split.' });
        return;
      }
      splitDistribution = selectedMembers.map(m => ({ member: m, value: 1 }));
    } else if (splitLogic === 'EXACT') {
      if (Math.abs(numericAmount - exactSplitTotal) > 0.01) {
        toast({ variant: 'destructive', title: 'Invalid Split', description: `Exact amounts must add up to ${formatCurrency(numericAmount, group.defaultCurrency)}.` });
        return;
      }
      splitDistribution = Object.entries(exactSplit).filter(([, val]) => Number(val) > 0).map(([member, val]) => ({ member, value: Number(val) }));
    } else if (splitLogic === 'SHARES') {
        const totalShares = Object.values(sharesSplit).reduce((sum, val) => sum + (Number(val) || 0), 0);
        if (totalShares <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Split', description: 'Total shares must be greater than zero.' });
            return;
        }
        splitDistribution = Object.entries(sharesSplit).filter(([, val]) => Number(val) > 0).map(([member, val]) => ({ member, value: Number(val) }));
    }
    
    if (splitDistribution.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid Split', description: 'This expense does not involve anyone.' });
        return;
    }

    const expensePayload = {
      description: description.trim(),
      amount: numericAmount,
      date: new Date(date).toISOString(),
      payer,
      splitLogic,
      splitDistribution,
    };

    if (isEditMode) {
        onUpdateExpense({ ...expensePayload, id: expenseToEdit.id });
        toast({ title: 'Expense Updated!', description: `"${description.trim()}" was updated successfully.`});
    } else {
        onAddExpense(expensePayload);
        toast({ title: 'Expense Added!', description: `"${description.trim()}" was added successfully.`});
    }

    setIsOpen(false);
  };

  const remainingExactAmount = Number(amount) - exactSplitTotal;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Expense' : 'Add a new expense'}</SheetTitle>
          <SheetDescription>{isEditMode ? `Update the details for "${expenseToEdit?.description}".` : `Log a shared expense for the '${group.name}' group.`}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 p-1 flex-1">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Dinner, Groceries" required/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder={formatCurrency(0, group.defaultCurrency)} required min="0.01" step="0.01" />
                </div>
                <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
            </div>
            <div>
              <Label htmlFor="payer">Paid by</Label>
              <Select value={payer} onValueChange={(val: Member) => setPayer(val)}>
                <SelectTrigger id="payer"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {group.members.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Split logic</Label>
              <Tabs value={splitLogic} onValueChange={(v) => setSplitLogic(v as SplitLogic)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="EQUAL">Equal</TabsTrigger>
                  <TabsTrigger value="EXACT">Exact</TabsTrigger>
                  <TabsTrigger value="SHARES">Shares</TabsTrigger>
                </TabsList>
                <TabsContent value="EQUAL" className="mt-4 space-y-2">
                  {group.members.map(m => (
                    <div key={m} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox id={`equal-${m}`} checked={equalSplit[m] || false} onCheckedChange={checked => setEqualSplit(prev => ({...prev, [m]: !!checked}))}/>
                      <Label htmlFor={`equal-${m}`} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{m}</Label>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="EXACT" className="mt-4 space-y-2">
                    <div className="text-right text-sm font-medium p-1" style={{color: Math.abs(remainingExactAmount) < 0.01 ? 'green' : 'orange'}}>
                        {formatCurrency(remainingExactAmount, group.defaultCurrency)} remaining
                    </div>
                  {group.members.map(m => (
                    <div key={m} className="flex items-center gap-2">
                      <Label htmlFor={`exact-${m}`} className="w-1/3 truncate">{m}</Label>
                      <Input id={`exact-${m}`} type="number" placeholder="0.00" value={exactSplit[m]} onChange={e => setExactSplit(prev => ({...prev, [m]: e.target.value ? Number(e.target.value) : ''}))} />
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="SHARES" className="mt-4 space-y-2">
                  {group.members.map(m => (
                    <div key={m} className="flex items-center gap-2">
                      <Label htmlFor={`shares-${m}`} className="w-1/3 truncate">{m}</Label>
                      <Input id={`shares-${m}`} type="number" placeholder="1" value={sharesSplit[m]} onChange={e => setSharesSplit(prev => ({...prev, [m]: e.target.value ? Number(e.target.value) : ''}))} min="0" step="1"/>
                      <span className="text-sm text-muted-foreground">share(s)</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <SheetFooter className="mt-auto pt-4">
            <Button type="submit" className="w-full" variant="default" size="lg">{isEditMode ? 'Update Expense' : 'Add Expense'}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
