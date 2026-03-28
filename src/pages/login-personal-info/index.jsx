import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import WelcomeMessage from './components/WelcomeMessage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import TrustSignals from './components/TrustSignals';
import SupportiveFeatures from './components/SupportiveFeatures';
import { useIntroVibeAuth } from '../../introVibeAuth';
import Button from '../../components/ui/Button';
import { getPostAuthRoute } from '../../utils/introVibe';

const LoginPersonalInfo = () => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currentUser, logout, authReady } = useIntroVibeAuth();

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <>
      <Helmet>
        <title>{isSignupMode ? 'Create Account' : 'Login'} - IntroVibe</title>
        <meta
          name="description"
          content="Join IntroVibe, confirm your personality type, unlock healthy tips, and match with people who fit your social style."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          <div className="max-w-md mx-auto">
            <WelcomeMessage />

            {authReady && currentUser && (
              <div className="bg-success/10 border border-success/20 rounded-2xl p-4 mb-4 flex items-start space-x-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <span className="font-heading text-success font-semibold text-lg">
                    {currentUser.username[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    You are signed in as <strong>{currentUser.username}</strong>.
                  </p>
                  <p className="caption text-muted-foreground">
                    Continue to your next IntroVibe step or log out to switch accounts.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = getPostAuthRoute(currentUser)}
                  >
                    Continue
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout} loading={isLoggingOut}>
                    Log out
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl shadow-gentle-lg p-6 md:p-8 lg:p-10 border border-border">
              {isSignupMode ? (
                <SignupForm onSwitchToLogin={() => setIsSignupMode(false)} />
              ) : (
                <LoginForm onSwitchToSignup={() => setIsSignupMode(true)} />
              )}
            </div>

            <TrustSignals />
          </div>

          <div className="max-w-4xl mx-auto mt-16 md:mt-20 lg:mt-24">
            <SupportiveFeatures />
          </div>

          <footer className="mt-16 md:mt-20 lg:mt-24 text-center">
            <p className="caption text-muted-foreground">
              &copy; {new Date()?.getFullYear()} IntroVibe. Match by personality, chat with intention.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default LoginPersonalInfo;
