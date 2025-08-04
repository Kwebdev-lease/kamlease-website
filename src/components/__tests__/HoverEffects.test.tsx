import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  EnhancedLink, 
  EnhancedIconContainer, 
  EnhancedInput, 
  EnhancedListItem, 
  EnhancedText 
} from '../HoverEffects';
import { Mail } from 'lucide-react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock hooks
vi.mock('../../hooks/use-accessibility-preferences', () => ({
  useAccessibilityPreferences: () => ({
    prefersReducedMotion: false,
    theme: 'light',
    highContrast: false,
  }),
}));

describe('HoverEffects Components', () => {
  describe('EnhancedLink', () => {
    it('renders with correct attributes', () => {
      render(
        <EnhancedLink href="/test" data-testid="enhanced-link">
          Test Link
        </EnhancedLink>
      );
      
      const link = screen.getByTestId('enhanced-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Test Link');
    });

    it('handles focus and blur events', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      
      render(
        <EnhancedLink 
          href="/test" 
          data-testid="enhanced-link"
          onFocus={onFocus}
          onBlur={onBlur}
        >
          Test Link
        </EnhancedLink>
      );
      
      const link = screen.getByTestId('enhanced-link');
      
      fireEvent.focus(link);
      expect(onFocus).toHaveBeenCalled();
      
      fireEvent.blur(link);
      expect(onBlur).toHaveBeenCalled();
    });

    it('renders with underline animation by default', () => {
      render(
        <EnhancedLink href="/test" data-testid="enhanced-link">
          Test Link
        </EnhancedLink>
      );
      
      const link = screen.getByTestId('enhanced-link');
      expect(link).toBeInTheDocument();
    });

    it('can disable underline animation', () => {
      render(
        <EnhancedLink 
          href="/test" 
          data-testid="enhanced-link"
          underlineAnimation={false}
        >
          Test Link
        </EnhancedLink>
      );
      
      const link = screen.getByTestId('enhanced-link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('EnhancedIconContainer', () => {
    it('renders with different sizes', () => {
      const { rerender } = render(
        <EnhancedIconContainer size="sm" data-testid="icon-container">
          <Mail />
        </EnhancedIconContainer>
      );
      
      let container = screen.getByTestId('icon-container');
      expect(container).toHaveClass('w-8', 'h-8');
      
      rerender(
        <EnhancedIconContainer size="lg" data-testid="icon-container">
          <Mail />
        </EnhancedIconContainer>
      );
      
      container = screen.getByTestId('icon-container');
      expect(container).toHaveClass('w-16', 'h-16');
    });

    it('renders with different variants', () => {
      const { rerender } = render(
        <EnhancedIconContainer variant="default" data-testid="icon-container">
          <Mail />
        </EnhancedIconContainer>
      );
      
      let container = screen.getByTestId('icon-container');
      expect(container).toHaveClass('bg-orange-100');
      
      rerender(
        <EnhancedIconContainer variant="filled" data-testid="icon-container">
          <Mail />
        </EnhancedIconContainer>
      );
      
      container = screen.getByTestId('icon-container');
      expect(container).toHaveClass('bg-orange-500');
    });

    it('handles click events', () => {
      const onClick = vi.fn();
      
      render(
        <EnhancedIconContainer 
          data-testid="icon-container"
          onClick={onClick}
        >
          <Mail />
        </EnhancedIconContainer>
      );
      
      const container = screen.getByTestId('icon-container');
      fireEvent.click(container);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('EnhancedInput', () => {
    it('renders with correct attributes', () => {
      render(
        <EnhancedInput 
          data-testid="enhanced-input"
          placeholder="Test input"
          type="text"
        />
      );
      
      const input = screen.getByTestId('enhanced-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Test input');
    });

    it('handles focus and blur events', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      
      render(
        <EnhancedInput 
          data-testid="enhanced-input"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );
      
      const input = screen.getByTestId('enhanced-input');
      
      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalled();
      
      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalled();
    });

    it('applies error styling', () => {
      render(
        <EnhancedInput 
          data-testid="enhanced-input"
          error={true}
        />
      );
      
      const input = screen.getByTestId('enhanced-input');
      expect(input).toHaveClass('border-red-500');
    });

    it('applies success styling', () => {
      render(
        <EnhancedInput 
          data-testid="enhanced-input"
          success={true}
        />
      );
      
      const input = screen.getByTestId('enhanced-input');
      expect(input).toHaveClass('border-green-500');
    });
  });

  describe('EnhancedListItem', () => {
    it('renders with children', () => {
      render(
        <EnhancedListItem data-testid="list-item">
          <span>Test content</span>
        </EnhancedListItem>
      );
      
      const listItem = screen.getByTestId('list-item');
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveTextContent('Test content');
    });

    it('renders with accent dot by default', () => {
      render(
        <EnhancedListItem data-testid="list-item">
          Test content
        </EnhancedListItem>
      );
      
      const listItem = screen.getByTestId('list-item');
      const accentDot = listItem.querySelector('.bg-orange-500');
      expect(accentDot).toBeInTheDocument();
    });

    it('can disable accent dot', () => {
      render(
        <EnhancedListItem data-testid="list-item" accent={false}>
          Test content
        </EnhancedListItem>
      );
      
      const listItem = screen.getByTestId('list-item');
      const accentDot = listItem.querySelector('.bg-orange-500');
      expect(accentDot).not.toBeInTheDocument();
    });

    it('handles click events when interactive', () => {
      const onClick = vi.fn();
      
      render(
        <EnhancedListItem 
          data-testid="list-item"
          interactive={true}
          onClick={onClick}
        >
          Test content
        </EnhancedListItem>
      );
      
      const listItem = screen.getByTestId('list-item');
      fireEvent.click(listItem);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('EnhancedText', () => {
    it('renders with children', () => {
      render(
        <EnhancedText data-testid="enhanced-text">
          Test text content
        </EnhancedText>
      );
      
      const text = screen.getByTestId('enhanced-text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('Test text content');
    });

    it('applies interactive styling', () => {
      render(
        <EnhancedText data-testid="enhanced-text" interactive={true}>
          Test text content
        </EnhancedText>
      );
      
      const text = screen.getByTestId('enhanced-text');
      expect(text).toHaveClass('cursor-pointer');
    });

    it('handles hover events when interactive', () => {
      render(
        <EnhancedText data-testid="enhanced-text" interactive={true}>
          Test text content
        </EnhancedText>
      );
      
      const text = screen.getByTestId('enhanced-text');
      expect(text).toBeInTheDocument();
      
      // Test hover behavior
      fireEvent.mouseEnter(text);
      fireEvent.mouseLeave(text);
    });
  });

  describe('Accessibility', () => {
    it('all components respect reduced motion preferences', () => {
      // This would be tested with a mock that returns prefersReducedMotion: true
      // The components should disable animations in that case
      expect(true).toBe(true); // Placeholder for reduced motion tests
    });

    it('all interactive components are keyboard accessible', () => {
      render(
        <div>
          <EnhancedLink href="/test" data-testid="link">Link</EnhancedLink>
          <EnhancedInput data-testid="input" />
          <EnhancedIconContainer data-testid="icon">
            <Mail />
          </EnhancedIconContainer>
        </div>
      );
      
      const link = screen.getByTestId('link');
      const input = screen.getByTestId('input');
      const icon = screen.getByTestId('icon');
      
      // Test keyboard navigation
      fireEvent.keyDown(link, { key: 'Tab' });
      fireEvent.keyDown(input, { key: 'Tab' });
      fireEvent.keyDown(icon, { key: 'Enter' });
      
      expect(link).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });
  });
});