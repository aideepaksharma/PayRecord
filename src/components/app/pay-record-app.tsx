"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Group, Expense } from '@/lib/types';
import { AuthScreen } from './auth-screen';
import { DashboardScreen } from './dashboard-screen';
import { GroupScreen } from './group-screen';
import { useToast } from "@/hooks/use-toast";

const EMOJI_LIST = ['🎉', '✈️', '🏠', '🍔', '💡', '💰', '🏖️', '💻', '🚗', '🎁', '🧑‍💻', '🧑‍🎨', '🧑‍🔬', '🧑‍🚀', '🧑‍🚒', '🧑‍✈️'];

export function PayRecordApp() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('payrecord-user');
      const storedGroups = localStorage.getItem('payrecord-groups');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not load your saved data from the browser.",
      });
    }
    setIsLoaded(true);
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        if(user) localStorage.setItem('payrecord-user', JSON.stringify(user));
        else localStorage.removeItem('payrecord-user');
        
        localStorage.setItem('payrecord-groups', JSON.stringify(groups));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
        toast({
            variant: "destructive",
            title: "Error saving data",
            description: "Could not save your data to the browser.",
        });
      }
    }
  }, [user, groups, isLoaded, toast]);

  const handleLogin = (name: string) => {
    const newUser = { name };
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveGroupId(null);
  }

  const handleCreateGroup = (groupData: Omit<Group, 'id' | 'expenses' | 'emoji'>) => {
    const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      emoji: randomEmoji,
      expenses: [],
    };
    setGroups(prev => [...prev, newGroup]);
  };
  
  const handleUpdateGroup = (groupId: string, updatedData: Partial<Omit<Group, 'id' | 'expenses'>>) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updatedData } : g));
    toast({ title: "Group Updated!", description: "The group details have been successfully updated." });
  };
  
  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    toast({ title: "Group Deleted", description: "The group has been successfully deleted."});
  };

  const handleAddExpense = (groupId: string, expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, expenses: [...g.expenses, newExpense] } : g));
  };
  
  const handleUpdateExpense = (groupId: string, updatedExpense: Expense) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, expenses: g.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e) } : g));
  };

  const handleDeleteExpense = (groupId: string, expenseId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, expenses: g.expenses.filter(e => e.id !== expenseId)} : g));
  }

  const activeGroup = groups.find(g => g.id === activeGroupId);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-2xl font-semibold">Loading Your Expenses...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (activeGroup) {
    return <GroupScreen group={activeGroup} onAddExpense={(expense) => handleAddExpense(activeGroup.id, expense)} onUpdateExpense={(expense) => handleUpdateExpense(activeGroup.id, expense)} onDeleteExpense={(expenseId) => handleDeleteExpense(activeGroup.id, expenseId)} onBack={() => setActiveGroupId(null)} />;
  }

  return <DashboardScreen user={user} groups={groups} onSelectGroup={setActiveGroupId} onCreateGroup={handleCreateGroup} onUpdateGroup={handleUpdateGroup} onDeleteGroup={handleDeleteGroup} onLogout={handleLogout} />;
}
