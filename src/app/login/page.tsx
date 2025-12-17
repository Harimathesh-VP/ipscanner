
import { LoginForm } from '@/components/auth/login-form';
import { ApiSentinelLogo } from '@/components/logos/api-sentinel-logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/home" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <ApiSentinelLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-primary">API Sentinel</span>
        </Link>
      </div>
      <LoginForm />
    </div>
  );
}
