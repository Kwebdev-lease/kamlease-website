import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props} data-testid="motion-div">
        {children}
      </div>
    )),
  },
}));

// Mock the scroll animation hook
vi.mock('../../hooks/use-scroll-animation', () => ({
  useScrollAnimation: vi.fn(() => ({
    ref: { current: null },
    isInView: false,
    hasAnimated: false,
  })),
}));

// Mock animation config
vi.mock('../../lib/animation-config', () => ({
  SCROLL_ANIMATIONS: {
    fadeInUp: {
      hidden: { opacity: 0, y: 60 },
      visible: { opacity: 1, y: 0 },
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0 },
    },
    slideInRight: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0 },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    staggerChild: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    },
  },
  ANIMATION_CONFIG: {
    defaultTransition: {
      type: 'tween',
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
    stagger: {
      children: 0.1,
      delayChildren: 0.2,
    },
  },
  PERFORMANCE_CONFIG: {
    willChange: 'transform, opacity',
  },
}));

// Mock utils
vi.mock('../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Import after mocks
const { AnimatedSection, AnimatedItem } = await import('../AnimatedSection');
const { useScrollAnimation } = await import('../../hooks/use-scroll-animation');

describe('AnimatedSection', () => {
  const mockUseScrollAnimation = vi.mocked(useScrollAnimation);

  beforeEach(() => {
    mockUseScrollAnimation.mockReturnValue({
      ref: { current: null },
      isInView: false,
      hasAnimated: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <AnimatedSection>
          <div>Test Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <AnimatedSection className="custom-class">
          <div>Test Content</div>
        </AnimatedSection>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveClass('custom-class');
    });

    it('uses default fadeInUp animation when no animation prop is provided', () => {
      render(
        <AnimatedSection>
          <div>Test Content</div>
        </AnimatedSection>
      );

      expect(mockUseScrollAnimation).toHaveBeenCalledWith({
        threshold: 0.1,
        rootMargin: '-10% 0px -10% 0px',
        triggerOnce: true,
        disabled: false,
      });
    });
  });

  describe('Animation Types', () => {
    it('handles fadeInUp animation', () => {
      render(
        <AnimatedSection animation="fadeInUp">
          <div>Fade In Up Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Fade In Up Content')).toBeInTheDocument();
    });

    it('handles slideInLeft animation', () => {
      render(
        <AnimatedSection animation="slideInLeft">
          <div>Slide In Left Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Slide In Left Content')).toBeInTheDocument();
    });

    it('handles slideInRight animation', () => {
      render(
        <AnimatedSection animation="slideInRight">
          <div>Slide In Right Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Slide In Right Content')).toBeInTheDocument();
    });

    it('handles scaleIn animation', () => {
      render(
        <AnimatedSection animation="scaleIn">
          <div>Scale In Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Scale In Content')).toBeInTheDocument();
    });

    it('handles staggerChildren animation', () => {
      render(
        <AnimatedSection animation="staggerChildren">
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
      
      // Should have multiple motion divs for staggered children
      const motionDivs = screen.getAllByTestId('motion-div');
      expect(motionDivs.length).toBeGreaterThan(1);
    });
  });

  describe('Scroll Animation Integration', () => {
    it('passes correct options to useScrollAnimation hook', () => {
      render(
        <AnimatedSection
          threshold={0.5}
          rootMargin="0px"
          triggerOnce={false}
          disabled={true}
        >
          <div>Test Content</div>
        </AnimatedSection>
      );

      expect(mockUseScrollAnimation).toHaveBeenCalledWith({
        threshold: 0.5,
        rootMargin: '0px',
        triggerOnce: false,
        disabled: true,
      });
    });

    it('shows visible state when hasAnimated is true', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: { current: null },
        isInView: true,
        hasAnimated: true,
      });

      render(
        <AnimatedSection>
          <div>Animated Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Animated Content')).toBeInTheDocument();
    });

    it('shows hidden state when hasAnimated is false', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: { current: null },
        isInView: false,
        hasAnimated: false,
      });

      render(
        <AnimatedSection>
          <div>Hidden Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Hidden Content')).toBeInTheDocument();
    });
  });

  describe('Custom Properties', () => {
    it('handles custom delay and duration', () => {
      render(
        <AnimatedSection delay={0.5} duration={1.2}>
          <div>Custom Timing Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Custom Timing Content')).toBeInTheDocument();
    });

    it('handles custom stagger delay for staggerChildren', () => {
      render(
        <AnimatedSection animation="staggerChildren" staggerDelay={0.2}>
          <div>Staggered Child 1</div>
          <div>Staggered Child 2</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Staggered Child 1')).toBeInTheDocument();
      expect(screen.getByText('Staggered Child 2')).toBeInTheDocument();
    });

    it('uses custom HTML element when as prop is provided', () => {
      render(
        <AnimatedSection as="section">
          <div>Section Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Section Content')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('shows visible state immediately when disabled', () => {
      render(
        <AnimatedSection disabled={true}>
          <div>Disabled Animation Content</div>
        </AnimatedSection>
      );

      expect(screen.getByText('Disabled Animation Content')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('applies will-change CSS property for performance', () => {
      render(
        <AnimatedSection>
          <div>Performance Optimized Content</div>
        </AnimatedSection>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveStyle({ willChange: 'transform, opacity' });
    });
  });
});

describe('AnimatedItem', () => {
  it('renders children correctly', () => {
    render(
      <AnimatedItem>
        <div>Item Content</div>
      </AnimatedItem>
    );

    expect(screen.getByText('Item Content')).toBeInTheDocument();
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AnimatedItem className="item-class">
        <div>Item Content</div>
      </AnimatedItem>
    );

    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toHaveClass('item-class');
  });

  it('handles custom delay and duration', () => {
    render(
      <AnimatedItem delay={0.3} duration={0.8}>
        <div>Custom Item Content</div>
      </AnimatedItem>
    );

    expect(screen.getByText('Custom Item Content')).toBeInTheDocument();
  });

  it('applies performance optimizations', () => {
    render(
      <AnimatedItem>
        <div>Optimized Item</div>
      </AnimatedItem>
    );

    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toHaveStyle({ willChange: 'transform, opacity' });
  });
});

describe('StaggeredChildren Integration', () => {
  it('wraps each child in motion div for stagger animation', () => {
    render(
      <AnimatedSection animation="staggerChildren">
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </AnimatedSection>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();

    // Should have one container plus one for each child
    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs.length).toBe(4); // 1 container + 3 children
  });

  it('handles single child in stagger animation', () => {
    render(
      <AnimatedSection animation="staggerChildren">
        <div>Single Child</div>
      </AnimatedSection>
    );

    expect(screen.getByText('Single Child')).toBeInTheDocument();
    
    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs.length).toBe(2); // 1 container + 1 child
  });

  it('handles empty children in stagger animation', () => {
    render(
      <AnimatedSection animation="staggerChildren">
        {null}
      </AnimatedSection>
    );

    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs.length).toBe(1); // Just the container
  });
});

describe('Error Handling', () => {
  it('falls back to fadeInUp for invalid animation type', () => {
    render(
      <AnimatedSection animation={'invalidAnimation' as any}>
        <div>Fallback Content</div>
      </AnimatedSection>
    );

    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('handles missing children gracefully', () => {
    render(<AnimatedSection>{null}</AnimatedSection>);
    
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });
});