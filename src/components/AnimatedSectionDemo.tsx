import React from 'react';
import { AnimatedSection, AnimatedItem } from './AnimatedSection';
import { useLanguage } from '@/contexts/LanguageProvider';

/**
 * Demo component showing how to use AnimatedSection
 * This demonstrates all the different animation types and features
 */
export function AnimatedSectionDemo() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-16 p-8">
      {/* Basic fadeInUp animation */}
      <AnimatedSection animation="fadeInUp" className="text-center">
        <h2 className="text-3xl font-bold mb-4">Fade In Up Animation</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This section fades in from the bottom when it comes into view.
        </p>
      </AnimatedSection>

      {/* Slide in from left */}
      <AnimatedSection animation="slideInLeft" className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Slide In Left</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This content slides in from the left side of the screen.
        </p>
      </AnimatedSection>

      {/* Slide in from right */}
      <AnimatedSection animation="slideInRight" className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Slide In Right</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This content slides in from the right side of the screen.
        </p>
      </AnimatedSection>

      {/* Scale in animation */}
      <AnimatedSection animation="scaleIn" className="text-center">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Scale In Animation</h2>
          <p>This card scales up from a smaller size when it appears.</p>
        </div>
      </AnimatedSection>

      {/* Staggered children animation */}
      <AnimatedSection animation="staggerChildren" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Card 1</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This card appears first in the stagger sequence.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Card 2</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This card appears second with a slight delay.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Card 3</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This card appears last in the sequence.
          </p>
        </div>
      </AnimatedSection>

      {/* Custom timing example */}
      <AnimatedSection 
        animation="fadeInUp" 
        delay={0.5} 
        duration={1.2}
        className="text-center bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Custom Timing</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This section has a custom delay of 0.5s and duration of 1.2s.
        </p>
      </AnimatedSection>

      {/* Using AnimatedItem for individual control */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Individual AnimatedItems</h2>
        <AnimatedItem delay={0} className="bg-red-100 dark:bg-red-900/20 p-4 rounded">
          <p>First item (no delay)</p>
        </AnimatedItem>
        <AnimatedItem delay={0.2} className="bg-green-100 dark:bg-green-900/20 p-4 rounded">
          <p>Second item (0.2s delay)</p>
        </AnimatedItem>
        <AnimatedItem delay={0.4} className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded">
          <p>Third item (0.4s delay)</p>
        </AnimatedItem>
      </div>

      {/* Disabled animation example */}
      <AnimatedSection disabled={true} className="text-center bg-gray-200 dark:bg-gray-700 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Disabled Animation</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This section has animations disabled and appears immediately.
        </p>
      </AnimatedSection>
    </div>
  );
}

export default AnimatedSectionDemo;