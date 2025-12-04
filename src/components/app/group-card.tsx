"use client";

import type { Group } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, FileText, Settings, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EditGroupDialog } from './edit-group-dialog';
import { DeleteGroupDialog } from './delete-group-dialog';

interface GroupCardProps {
  group: Group;
  onSelectGroup: () => void;
  onUpdateGroup: (groupId: string, groupData: Partial<Omit<Group, 'id' | 'expenses'>>) => void;
  onDeleteGroup: (groupId: string) => void;
}

export function GroupCard({ group, onSelectGroup, onUpdateGroup, onDeleteGroup }: GroupCardProps) {
  const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1 h-full">
      <div onClick={onSelectGroup} className="flex-grow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span className="truncate pr-4">{group.name}</span>
            <span className="text-4xl -mt-2">{group.emoji}</span>
          </CardTitle>
          <CardDescription>
            {formatCurrency(totalExpenses, group.defaultCurrency)} total
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{group.members.length} members</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{group.expenses.length} expenses</span>
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-2 border-t mt-auto">
        <div className="flex w-full">
          <EditGroupDialog group={group} onUpdateGroup={onUpdateGroup} >
            <Button variant="ghost" className="flex-1 justify-center text-muted-foreground hover:text-foreground">
              <Settings className="mr-2 h-4 w-4"/>
              Edit
            </Button>
          </EditGroupDialog>
          <DeleteGroupDialog group={group} onDeleteGroup={onDeleteGroup}>
              <Button variant="ghost" className="flex-1 justify-center text-destructive/70 hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
              </Button>
          </DeleteGroupDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
