/**
 * Performance Optimization Demo Component
 * Demonstrates the performance-aware animation system
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDevicePerformance, animationMonitor } from '../lib/device-performance';
import { 
  usePerformanceAnimation, 
  useResponsiveAnimationDuration,
  useAnimationQueue,
  useConditionalAnimation
} from '../hooks/use-performance-animation';
import { useLazyAnimation, LAZY_ANIMATIONS } from '../lib/animation-lazy-loader';
import { AnimatedSection } from './AnimatedSection';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function PerformanceOptimizationDemo() {
  const devicePerformance = useDevicePerformance();
  const animationQueue = useAnimationQueue();
  const [showComplexAnimation, setShowComplexAnimation] = useState(false);
  const [animationStats, setAnimationStats] = useState({
    activeCount: 0,
    canAnimate: true,
  });

  // Update animation stats periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStats({
        activeCount: animationQueue.activeCount(),
        canAnimate: animationQueue.canAnimate(),
      });
    }, 100);

    return () => clearInterval(interval);
  }, [animationQueue]);

  // Performance-aware animation example
  const { animation: cardAnimation, shouldAnimate, isOptimized } = usePerformanceAnimation({
    baseAnimation: {
      hidden: { opacity: 0, y: 60, scale: 0.8, rotateY: 15 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotateY: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
      },
    },
    fallbackAnimation: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    complexityLevel: 'complex',
    priority: 'medium',
  });

  // Responsive duration example
  const responsiveDuration = useResponsiveAnimationDuration(0.6);

  // Conditional animation based on device performance
  const buttonAnimation = useConditionalAnimation(
    {
      rest: { scale: 1, rotateZ: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
      hover: { 
        scale: 1.05, 
        rotateZ: 2, 
        boxShadow: '0 8px 25px rgba(249,115,22,0.3)',
        transition: { duration: 0.3 }
      },
      tap: { scale: 0.95, rotateZ: -1 },
    },
    {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
      tap: { scale: 0.98 },
    }
  );

  // Lazy-loaded complex animation
  const { 
    animation: complexAnimation, 
    loading: complexLoading, 
    load: loadComplexAnimation 
  } = useLazyAnimation('complexCardHover', devicePerformance);

  const handleLoadComplexAnimation = async () => {
    setShowComplexAnimation(true);
    await loadComplexAnimation();
  };

  const getPerformanceTierColor = (tier: string) => {
    switch (tier) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Performance Optimization Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            This demo showcases the performance-aware animation system that automatically 
            adjusts animations based on your device capabilities and user preferences.
          </p>
        </AnimatedSection>

        {/* Device Performance Info */}
        <AnimatedSection animation="slideInLeft" delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Device Performance Analysis
                <Badge className={getPerformanceTierColor(devicePerformance.tier)}>
                  {devicePerformance.tier.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time analysis of your device capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {devicePerformance.memory || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Memory (MB)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {devicePerformance.cores || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CPU Cores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {devicePerformance.connection.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Connection</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {devicePerformance.isMobile ? 'YES' : 'NO'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mobile Device</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Animation Stats */}
        <AnimatedSection animation="slideInRight" delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle>Animation Performance Monitor</CardTitle>
              <CardDescription>
                Real-time monitoring of active animations and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {animationStats.activeCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Animations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {animationQueue.maxConcurrent}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Max Concurrent</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${animationStats.canAnimate ? 'text-green-500' : 'text-red-500'}`}>
                    {animationStats.canAnimate ? 'YES' : 'NO'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Can Animate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Performance-Aware Animation Demo */}
        <AnimatedSection animation="staggerChildren" delay={0.4}>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Adaptive Animation
                    {isOptimized && (
                      <Badge variant="outline" className="text-xs">
                        OPTIMIZED
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    This card uses performance-aware animations that adapt to your device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Should Animate:</span>
                      <Badge variant={shouldAnimate ? "default" : "secondary"}>
                        {shouldAnimate ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimized:</span>
                      <Badge variant={isOptimized ? "default" : "secondary"}>
                        {isOptimized ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-mono text-sm">
                        {responsiveDuration.toFixed(2)}s
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Interactive Button</CardTitle>
                  <CardDescription>
                    Button with performance-optimized hover effects
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <motion.div
                    variants={buttonAnimation}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button size="lg" className="px-8">
                      Hover Me!
                    </Button>
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Animation complexity automatically adjusts based on your device performance
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Lazy Loading Demo */}
        <AnimatedSection animation="fadeInUp" delay={0.6}>
          <Card>
            <CardHeader>
              <CardTitle>Lazy-Loaded Complex Animation</CardTitle>
              <CardDescription>
                Complex animations are loaded only when needed to improve initial page load
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <Button 
                  onClick={handleLoadComplexAnimation}
                  disabled={complexLoading}
                >
                  {complexLoading ? 'Loading...' : 'Load Complex Animation'}
                </Button>
                {showComplexAnimation && complexAnimation && (
                  <Badge variant="outline">Animation Loaded</Badge>
                )}
              </div>
              
              {showComplexAnimation && complexAnimation && (
                <motion.div
                  variants={complexAnimation}
                  initial="rest"
                  whileHover="hover"
                  className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg mx-auto"
                />
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Performance Tips */}
        <AnimatedSection animation="slideInLeft" delay={0.8}>
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimizations Applied</CardTitle>
              <CardDescription>
                Based on your device analysis, these optimizations are active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Enabled Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${shouldAnimate ? 'bg-green-500' : 'bg-red-500'}`} />
                      Complex Animations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${devicePerformance.supportsIntersectionObserver ? 'bg-green-500' : 'bg-red-500'}`} />
                      Intersection Observer
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${devicePerformance.supportsWebGL ? 'bg-green-500' : 'bg-red-500'}`} />
                      WebGL Support
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Optimizations:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Reduced animation duration: {responsiveDuration.toFixed(2)}s</li>
                    <li>• Max concurrent animations: {animationQueue.maxConcurrent}</li>
                    <li>• Lazy loading for complex effects</li>
                    <li>• Automatic fallbacks for low-end devices</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
}