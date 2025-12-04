"use client";

import type { User, Group } from '@/lib/types';
import { AddGroupDialog } from './add-group-dialog';
import { GroupCard } from './group-card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

interface DashboardScreenProps {
  user: User;
  groups: Group[];
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (groupData: Omit<Group, 'id' | 'expenses' | 'emoji'>) => void;
  onUpdateGroup: (groupId: string, groupData: Partial<Omit<Group, 'id' | 'expenses'>>) => void;
  onDeleteGroup: (groupId: string) => void;
  onLogout: () => void;
}

export function DashboardScreen({ user, groups, onSelectGroup, onCreateGroup, onUpdateGroup, onDeleteGroup, onLogout }: DashboardScreenProps) {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hello, {user.name}!</h1>
            <p className="text-muted-foreground">Welcome to your expense dashboard.</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AddGroupDialog onCreateGroup={onCreateGroup} />
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {groups.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card/50 text-center">
            <h2 className="text-xl font-semibold">No groups yet!</h2>
            <p className="mt-2 text-muted-foreground">Create your first group to start tracking expenses.</p>
            <div className="mt-4">
                <AddGroupDialog onCreateGroup={onCreateGroup} isPrimaryAction />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {groups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onSelectGroup={() => onSelectGroup(group.id)}
                onUpdateGroup={onUpdateGroup}
                onDeleteGroup={onDeleteGroup}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
