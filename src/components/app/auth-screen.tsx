"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HandCoins } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="flex items-center gap-4 mb-8">
        <HandCoins className="h-12 w-12 text-primary" />
        <h1 className="text-5xl font-bold tracking-tighter text-foreground">
          PayRecord
        </h1>
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Enter your name to get started.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-base"
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" variant="default" size="lg">
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        Your data is stored locally in your browser.
      </p>
    </div>
  );
}
