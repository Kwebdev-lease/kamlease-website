import React from 'react';
import { Mail, Phone, MapPin, Star, Heart, Zap } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';
import { EnhancedCard } from './ui/enhanced-card';
import { 
  EnhancedLink, 
  EnhancedIconContainer, 
  EnhancedInput, 
  EnhancedListItem, 
  EnhancedText 
} from './HoverEffects';
import { useLanguage } from '@/contexts/LanguageProvider';

export function HoverEffectsDemo() {
  const { t } = useLanguage();
  
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Advanced Hover Effects Demo
        </h1>
        
        {/* Enhanced Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Buttons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Primary Buttons</h3>
              <EnhancedButton variant="primary" size="lg" hoverEffect="glow">
                Primary with Glow
              </EnhancedButton>
              <EnhancedButton variant="primary" size="default" ripple={true}>
                Primary with Ripple
              </EnhancedButton>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Outline Buttons</h3>
              <EnhancedButton variant="primary-outline" size="lg" hoverEffect="enhanced">
                Outline Enhanced
              </EnhancedButton>
              <EnhancedButton variant="outline" size="default" focusRing={true}>
                Outline with Focus
              </EnhancedButton>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Special Effects</h3>
              <EnhancedButton variant="primary" size="xl" hoverEffect="glow" ripple={true}>
                <Star className="mr-2 h-5 w-5" />
                All Effects
              </EnhancedButton>
            </div>
          </div>
        </section>

        {/* Enhanced Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnhancedCard variant="default" hoverEffect="enhanced" interactive={true} focusable={true}>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Default Card</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This card has enhanced hover effects with elevation and border glow.
                </p>
              </div>
            </EnhancedCard>
            
            <EnhancedCard variant="value" hoverEffect="glow" interactive={true} glowColor="blue">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Value Card</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This card has value-specific animations with corner accents and blue glow.
                </p>
              </div>
            </EnhancedCard>
            
            <EnhancedCard variant="expertise" hoverEffect="glow" interactive={true} glowColor="green">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Expertise Card</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This card has expertise-specific animations with bottom accent line and green glow.
                </p>
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Enhanced Icons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Icon Containers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center space-y-2">
              <EnhancedIconContainer size="sm" variant="default" glowColor="orange">
                <Mail className="h-4 w-4" />
              </EnhancedIconContainer>
              <p className="text-sm text-gray-600 dark:text-gray-400">Small Default</p>
            </div>
            
            <div className="text-center space-y-2">
              <EnhancedIconContainer size="md" variant="filled" glowColor="blue">
                <Phone className="h-5 w-5" />
              </EnhancedIconContainer>
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium Filled</p>
            </div>
            
            <div className="text-center space-y-2">
              <EnhancedIconContainer size="lg" variant="outlined" glowColor="green">
                <MapPin className="h-6 w-6" />
              </EnhancedIconContainer>
              <p className="text-sm text-gray-600 dark:text-gray-400">Large Outlined</p>
            </div>
            
            <div className="text-center space-y-2">
              <EnhancedIconContainer size="xl" variant="default" glowColor="purple">
                <Star className="h-8 w-8" />
              </EnhancedIconContainer>
              <p className="text-sm text-gray-600 dark:text-gray-400">XL Purple</p>
            </div>
            
            <div className="text-center space-y-2">
              <EnhancedIconContainer size="lg" variant="filled" glowColor="orange">
                <Heart className="h-6 w-6" />
              </EnhancedIconContainer>
              <p className="text-sm text-gray-600 dark:text-gray-400">Heart Orange</p>
            </div>
            
            <div className="text-center space-y-2">
              <EnhancedIconContainer size="md" variant="outlined" glowColor="blue">
                <Zap className="h-5 w-5" />
              </EnhancedIconContainer>
              <p className="text-sm text-gray-600 dark:text-gray-400">Zap Blue</p>
            </div>
          </div>
        </section>

        {/* Enhanced Links Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Links
          </h2>
          <div className="space-y-4">
            <div>
              <EnhancedLink href="#" className="text-lg">
                Link with Underline Animation
              </EnhancedLink>
            </div>
            <div>
              <EnhancedLink href="#" underlineAnimation={false} glowOnFocus={true} className="text-lg">
                Link with Focus Glow Only
              </EnhancedLink>
            </div>
            <div>
              <EnhancedLink href="#" className="text-lg text-blue-600">
                Colored Link with Effects
              </EnhancedLink>
            </div>
          </div>
        </section>

        {/* Enhanced Inputs Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Input Fields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Normal Input</label>
              <EnhancedInput placeholder="Type something..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Error State</label>
              <EnhancedInput placeholder="Error input" error={true} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Success State</label>
              <EnhancedInput placeholder="Success input" success={true} />
            </div>
          </div>
        </section>

        {/* Enhanced List Items Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced List Items
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <ul className="space-y-2">
              <EnhancedListItem interactive={true} accent={true}>
                <span>Interactive list item with accent dot</span>
              </EnhancedListItem>
              <EnhancedListItem interactive={true} accent={false}>
                <span>Interactive list item without accent</span>
              </EnhancedListItem>
              <EnhancedListItem interactive={false} accent={true}>
                <span>Non-interactive list item with accent</span>
              </EnhancedListItem>
              <EnhancedListItem interactive={true} accent={true}>
                <div>
                  <p className="font-medium">Complex list item</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    With multiple lines of content and hover effects
                  </p>
                </div>
              </EnhancedListItem>
            </ul>
          </div>
        </section>

        {/* Enhanced Text Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Enhanced Text
          </h2>
          <div className="space-y-4">
            <EnhancedText className="text-lg">
              Regular text without hover effects
            </EnhancedText>
            <EnhancedText className="text-lg" interactive={true}>
              Interactive text that changes color on hover
            </EnhancedText>
            <EnhancedText className="text-lg" interactive={true} highlight={true}>
              Interactive text with background highlight on hover
            </EnhancedText>
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Accessibility Features
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <ul className="space-y-2 text-sm">
              <li>• All animations respect <code>prefers-reduced-motion</code> settings</li>
              <li>• Focus states are enhanced with visible rings and glow effects</li>
              <li>• Keyboard navigation is fully supported</li>
              <li>• Color contrast ratios meet WCAG 2.1 AA standards</li>
              <li>• Interactive elements have appropriate ARIA attributes</li>
              <li>• Touch targets meet minimum size requirements</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}