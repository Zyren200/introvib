import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      label: 'Simple Onboarding',
      description: 'Register, answer 5 questions, then jump in.'
    },
    {
      icon: 'Lock',
      label: 'Personality Aware',
      description: 'Matching and tips adapt to your result.'
    },
    {
      icon: 'MessageCircle',
      label: 'Chat Rules',
      description: '1-on-1 for introverts, groups for ambiverts and extroverts.'
    }
  ];

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {trustFeatures?.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-2 transition-gentle"
          >
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name={feature?.icon} size={24} color="var(--color-success)" />
            </div>
            <h3 className="font-body font-medium text-foreground">
              {feature?.label}
            </h3>
            <p className="caption text-muted-foreground">
              {feature?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustSignals;
