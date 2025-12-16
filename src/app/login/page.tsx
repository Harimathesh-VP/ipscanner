import { LoginForm } from '@/components/auth/login-form';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">API Sentinel</h1>
        </div>
        <p className="text-muted-foreground">Your centralized hub for security API interactions.</p>
      </div>
      <LoginForm />
    </main>
  );
}
