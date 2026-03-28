import React from 'react';
import Icon from '../../../components/AppIcon';

const SupportiveFeatures = () => {
  const features = [
    {
      icon: 'ClipboardList',
      title: '5-Question Personality Test',
      description: 'A short assessment confirms whether you are introvert, ambivert, or extrovert.'
    },
    {
      icon: 'HeartPulse',
      title: 'Healthy Tips',
      description: 'Get recommendations based on how you recharge, connect, and keep balance.'
    },
    {
      icon: 'Users',
      title: 'Personality-Based Matching',
      description: 'Meet people who share your interests and your social energy style.'
    },
    {
      icon: 'Grid3X3',
      title: 'Sudoku for Introverts',
      description: 'Introverts unlock matching and chat by completing a calm puzzle challenge.'
    }
  ];

  return (
    <div className="mt-12">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground text-center mb-8">
        Built for a Social Flow That Feels Personal
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {features?.map((feature, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-6 border border-border hover:shadow-gentle-md transition-gentle"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={feature?.icon} size={24} color="var(--color-primary)" />
              </div>
              <div className="flex-1">
                <h3 className="font-body font-semibold text-foreground mb-2">
                  {feature?.title}
                </h3>
                <p className="caption text-muted-foreground leading-relaxed">
                  {feature?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportiveFeatures;
