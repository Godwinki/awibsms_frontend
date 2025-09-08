'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Zap, Command } from 'lucide-react';
import { ShortcutCommandPalette } from './ShortcutCommandPalette';
import { useShortcuts } from '@/hooks/useShortcuts';

interface ShortcutTriggerProps {
  variant?: 'button' | 'floating' | 'minimal';
  className?: string;
}

export function ShortcutTrigger({ variant = 'button', className = '' }: ShortcutTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { executeShortcut } = useShortcuts();

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if any modal is open
      if (document.body.style.overflow === 'hidden' || document.querySelector('[data-state="open"]')) {
        return;
      }

      // Ctrl+K or Cmd+K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        return;
      }

      // Forward slash (/) to open command palette (when not in input)
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        return;
      }

      // Direct shortcut execution (when not in input and palette is closed)
      if (!isInputFocused() && !isOpen && /^\d+$/.test(e.key)) {
        // Start collecting numeric input for shortcut codes
        handleDirectShortcutInput(e.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, executeShortcut]);

  // Check if an input element is currently focused
  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );
  };

  // Handle direct shortcut input (numeric codes)
  const handleDirectShortcutInput = (firstDigit: string) => {
    let code = firstDigit;
    let timeout: NodeJS.Timeout;

    const handleNextKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        code += e.key;
        
        // Reset timeout
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          executeCode();
        }, 1000); // Execute after 1 second of no input
        
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCode();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cleanup();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        code = code.slice(0, -1);
        if (code.length === 0) {
          cleanup();
        }
      }
    };

    const executeCode = async () => {
      if (code.length > 0) {
        try {
          await executeShortcut(code);
        } catch (error) {
          // Error handling is done in the hook
        }
      }
      cleanup();
    };

    const cleanup = () => {
      clearTimeout(timeout);
      document.removeEventListener('keydown', handleNextKey);
    };

    // Set timeout to execute after 1 second
    timeout = setTimeout(() => {
      executeCode();
    }, 1000);

    // Listen for additional keys
    document.addEventListener('keydown', handleNextKey);
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'floating':
        return (
          <Button
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all z-50 ${className}`}
            size="icon"
          >
            <Zap className="h-6 w-6" />
          </Button>
        );

      case 'minimal':
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className={`gap-2 ${className}`}
          >
            <Zap className="h-4 w-4" />
            <div className="hidden sm:flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>K</Kbd>
            </div>
          </Button>
        );

      default:
        return (
          <Button
            onClick={() => setIsOpen(true)}
            className={`gap-2 ${className}`}
            variant="outline"
          >
            <Zap className="h-4 w-4" />
            Quick Actions
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>K</Kbd>
            </div>
          </Button>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      <ShortcutCommandPalette 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
