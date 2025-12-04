"use client";

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Group, Currency } from '@/lib/types';
import { CURRENCIES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const EMOJI_LIST = ['🎉', '✈️', '🏠', '🍔', '💡', '💰', '🏖️', '💻', '🚗', '🎁', '🧑‍💻', '🧑‍🎨', '🧑‍🔬', '🧑‍🚀', '🧑‍🚒', '🧑‍✈️'];


interface EditGroupDialogProps {
  group: Group;
  onUpdateGroup: (groupId: string, groupData: Partial<Omit<Group, 'id' | 'expenses'>>) => void;
  children: ReactNode;
}

export function EditGroupDialog({ group, onUpdateGroup, children }: EditGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [members, setMembers] = useState(group.members.join(', '));
  const [currency, setCurrency] = useState<Currency>(group.defaultCurrency);
  const [emoji, setEmoji] = useState(group.emoji);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberList = members.split(',').map(m => m.trim()).filter(m => m);
    if (!name.trim()) {
        toast({ variant: 'destructive', title: 'Invalid Name', description: 'Group name cannot be empty.'});
        return;
    }
    if (memberList.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid Members', description: 'Group must have at least one member.'});
        return;
    }
    
    // Check if members were removed that have existing expenses
    const removedMembers = group.members.filter(m => !memberList.includes(m));
    const membersWithExpenses = new Set<string>();
    group.expenses.forEach(exp => {
        membersWithExpenses.add(exp.payer);
        exp.splitDistribution.forEach(dist => membersWithExpenses.add(dist.member));
    });
    
    const removedMembersWithExpenses = removedMembers.filter(m => membersWithExpenses.has(m));
    if (removedMembersWithExpenses.length > 0) {
        toast({ variant: 'destructive', title: 'Cannot Remove Members', description: `Cannot remove: ${removedMembersWithExpenses.join(', ')}. They are part of existing expenses.`});
        return;
    }

    onUpdateGroup(group.id, { name: name.trim(), members: memberList, defaultCurrency: currency, emoji });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the details for your group '{group.name}'.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g., Trip to Paris" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emoji" className="text-right">Emoji</Label>
               <Select value={emoji} onValueChange={setEmoji}>
                <SelectTrigger className="col-span-3">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <div className="grid grid-cols-5 gap-2 p-2">
                        {EMOJI_LIST.map((e, i) => <SelectItem key={`${e}-${i}`} value={e} className="flex justify-center items-center text-xl p-2 h-12 w-12">{e}</SelectItem>)}
                    </div>
                </SelectContent>
              </Select>
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
            <Button type="submit" variant="default">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
