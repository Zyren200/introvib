import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import QuietModeSection from './components/QuietModeSection';
import NotificationSection from './components/NotificationSection';
import AccountSecuritySection from './components/AccountSecuritySection';
import AppearanceSection from './components/AppearanceSection';
import Button from '../../components/ui/Button';
import { useAppState } from '../../context/AppStateContext';
import { useIntroVibeAuth } from '../../introVibeAuth';
import {
  DEFAULT_SETTINGS,
  applyThemeMode,
  fetchRemoteSettings,
  loadLegacySettings,
  mergeSettings,
  persistLegacySettings,
  saveRemoteSettings,
  shouldFallbackToLegacySettings,
  shouldUseRemoteSettings,
} from '../../lib/introVibeSettings';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [persistedSettings, setPersistedSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const { enableQuietMode, disableQuietMode } = useAppState();
  const { currentUser, deleteAccount, authMode, authReady } = useIntroVibeAuth();

  useEffect(() => {
    if (!authReady) {
      return undefined;
    }

    let cancelled = false;

    const loadSettings = async () => {
      setIsLoadingSettings(true);
      setSettingsError('');

      if (shouldUseRemoteSettings(authMode, currentUser?.id)) {
        try {
          const remoteSettings = await fetchRemoteSettings();
          if (cancelled) return;

          setSettings(remoteSettings);
          setPersistedSettings(remoteSettings);
          applyThemeMode(remoteSettings?.appearance?.theme || 'light');
          setHasChanges(false);
          setIsLoadingSettings(false);
          return;
        } catch (error) {
          if (!shouldFallbackToLegacySettings(error)) {
            if (!cancelled) {
              setSettingsError(error.message);
              setIsLoadingSettings(false);
            }
            return;
          }
        }
      }

      if (!cancelled) {
        const legacySettings = loadLegacySettings();
        setSettings(legacySettings);
        setPersistedSettings(legacySettings);
        applyThemeMode(legacySettings?.appearance?.theme || 'light');
        setHasChanges(false);
        setIsLoadingSettings(false);
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [authMode, authReady, currentUser?.id]);

  const updateSettings = (section, updates) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        ...updates,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSavingSettings(true);
    setSettingsError('');

    let nextSettings = mergeSettings(settings);

    if (shouldUseRemoteSettings(authMode, currentUser?.id)) {
      try {
        nextSettings = await saveRemoteSettings(nextSettings);
      } catch (error) {
        if (!shouldFallbackToLegacySettings(error)) {
          setSettingsError(error.message || 'Unable to save settings right now.');
          setIsSavingSettings(false);
          return;
        }

        nextSettings = persistLegacySettings(nextSettings);
      }
    } else {
      nextSettings = persistLegacySettings(nextSettings);
    }

    setSettings(nextSettings);
    setPersistedSettings(nextSettings);
    applyThemeMode(nextSettings?.appearance?.theme || 'light');
    window.dispatchEvent(new Event('isf-theme-updated'));
    setHasChanges(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);

    if (nextSettings?.quietMode?.enabled) {
      enableQuietMode(120);
    } else {
      disableQuietMode();
    }

    setIsSavingSettings(false);
  };

  const handleReset = () => {
    setSettings(persistedSettings);
    applyThemeMode(persistedSettings?.appearance?.theme || 'light');
    setHasChanges(false);
    setSettingsError('');
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const result = await deleteAccount();
    setIsDeletingAccount(false);

    if (!result?.success) {
      return result;
    }

    setSettings(DEFAULT_SETTINGS);
    setPersistedSettings(DEFAULT_SETTINGS);
    setHasChanges(false);
    setShowSaveConfirmation(false);
    navigate('/login-personal-info');
    return result;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Settings" size={20} color="var(--color-primary)" />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground font-body">
            Customize your IntroVibe preferences, notifications, and account controls
          </p>
        </div>

        {showSaveConfirmation && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-3 transition-gentle">
            <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            <span className="text-success font-body">Settings saved successfully!</span>
          </div>
        )}

        {settingsError && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center space-x-3 transition-gentle">
            <Icon name="AlertCircle" size={20} color="var(--color-error)" />
            <span className="text-error font-body">{settingsError}</span>
          </div>
        )}

        {isLoadingSettings ? (
          <div className="bg-card rounded-xl p-8 border border-border shadow-gentle text-center">
            <p className="text-foreground font-medium">Loading your IntroVibe settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AppearanceSection
              settings={settings?.appearance}
              onUpdate={(updates) => updateSettings('appearance', updates)}
            />

            <QuietModeSection 
              settings={settings?.quietMode}
              onUpdate={(updates) => updateSettings('quietMode', updates)}
            />

            <NotificationSection 
              settings={settings?.notifications}
              onUpdate={(updates) => updateSettings('notifications', updates)}
            />

            <AccountSecuritySection 
              settings={settings?.account}
              accountEmail={currentUser?.email}
              onDeleteAccount={handleDeleteAccount}
              onUpdate={(updates) => updateSettings('account', updates)}
              isDeletingAccount={isDeletingAccount}
            />
          </div>
        )}

        {hasChanges && !isLoadingSettings && (
          <div className="sticky bottom-6 mt-8 p-4 bg-card border border-border rounded-lg shadow-gentle-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground caption">
              <Icon name="AlertCircle" size={16} color="var(--color-muted-foreground)" />
              <span>You have unsaved changes</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={isSavingSettings}
              >
                Reset
              </Button>
              <Button
                variant="default"
                iconName="Save"
                onClick={handleSave}
                loading={isSavingSettings}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
