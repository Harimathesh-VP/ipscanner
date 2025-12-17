'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterView, setIsRegisterView] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Both login and register will redirect to dashboard for this demo
    router.replace('/dashboard');
  };

  return (
    <Card className="w-full max-w-sm border-0 shadow-none sm:border sm:shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight font-headline">
            {isRegisterView ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isRegisterView
              ? 'Enter your details to get started.'
              : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              defaultValue="user@example.com"
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                defaultValue="password"
                className="h-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" size="lg">
            {isRegisterView ? 'Register' : 'Sign in'}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            size="lg"
            type="button"
            onClick={() => setIsRegisterView(!isRegisterView)}
          >
            {isRegisterView
              ? 'Already have an account? Sign In'
              : 'Create an account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
