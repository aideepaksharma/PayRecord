"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Group, Currency } from '@/lib/types';
import { CURRENCIES } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface AddGroupDialogProps {
  onCreateGroup: (groupData: Omit<Group, 'id' | 'expenses' | 'emoji'>) => void;
  isPrimaryAction?: boolean;
}

export function AddGroupDialog({ onCreateGroup, isPrimaryAction = false }: AddGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberList = members.split(',').map(m => m.trim()).filter(m => m);
    if (name.trim() && memberList.length > 0) {
      onCreateGroup({ name: name.trim(), members: memberList, defaultCurrency: currency });
      setIsOpen(false);
      setName('');
      setMembers('');
      setCurrency('USD');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isPrimaryAction ? (
            <Button size="lg" variant="default" className="bg-accent hover:bg-accent/90">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Group
            </Button>
        ) : (
            <Button variant="default" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Group
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Start a new group to track shared expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g., Trip to Paris" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="members" className="text-right">Members</Label>
              <Textarea id="members" value={members} onChange={e => setMembers(e.target.value)} className="col-span-3" placeholder="John, Jane, Peter (comma separated)" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">Currency</Label>
              <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
