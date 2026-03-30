import { ReactNode } from 'react';
import { Header } from './Header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isEmailVerified } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <Header />
      {user && !isEmailVerified && !dismissed && (
        <Alert className="border-warning/50 bg-warning/10 m-4 sm:mx-auto sm:max-w-7xl">
          <Mail className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-warning">
              Please verify your email address to access all features.{' '}
              <Link to="/verify-email" className="font-medium underline">
                Verify now
              </Link>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <main className="w-full">{children}</main>
    </div>
  );
}
