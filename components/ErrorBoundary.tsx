'use client';

/**
 * Error Boundary Component
 * @fileoverview React Error Boundary for catching and handling component errors gracefully
 */

import React, { Component, ReactNode } from 'react';
import { logger, LogSource } from '../engine/GlobalLogger';

/**
 * Error Boundary props interface
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Fallback component to render on error */
  fallback?: ReactNode;
  /** Custom error handler function */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Whether to show detailed error info (dev only) */
  showErrorDetails?: boolean;
}

/**
 * Error Boundary state interface
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
  /** Additional error information */
  errorInfo: React.ErrorInfo | null;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ 
  error: Error | null; 
  errorInfo: React.ErrorInfo | null;
  showErrorDetails: boolean;
}> = ({ error, errorInfo, showErrorDetails }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'monospace',
      fontSize: '16px',
      padding: '20px',
      boxSizing: 'border-box',
      textAlign: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '2px solid #ff4444',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#ff4444',
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          ⚠️ Game Error
        </h1>
        
        <p style={{
          marginBottom: '20px',
          lineHeight: '1.5'
        }}>
          An unexpected error occurred while running the game. This has been logged for debugging purposes.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'left',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            <div style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: '10px' }}>
              Error Message:
            </div>
            <div style={{ color: '#cccccc', marginBottom: '15px' }}>
              {error.message}
            </div>
            
            {showErrorDetails && error.stack && (
              <>
                <div style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: '10px' }}>
                  Stack Trace:
                </div>
                <div style={{ color: '#888888', whiteSpace: 'pre-wrap' }}>
                  {error.stack}
                </div>
              </>
            )}
          </div>
        )}

        {showErrorDetails && errorInfo && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'left',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '150px'
          }}>
            <div style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: '10px' }}>
              Component Stack:
            </div>
            <div style={{ color: '#888888', whiteSpace: 'pre-wrap' }}>
              {errorInfo.componentStack}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReload}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Reload Game
          </button>
          
          <button
            onClick={handleGoHome}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Go to Home
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#888888'
        }}>
          If this error persists, please check the browser console for more details.
        </div>
      </div>
    </div>
  );
};

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component trees and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * Creates a new ErrorBoundary instance
   * @param props - Component props
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Catches errors thrown by child components
   * @param error - The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Logs error information when a component error occurs
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information from React
   */
  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to our global logger
    logger.error(
      LogSource.UI, 
      `React Error Boundary caught an error: ${error.name}: ${error.message}\n` +
      `Component Stack: ${errorInfo.componentStack}`
    );

    // Log full error details
    logger.debug(
      LogSource.UI,
      `Error Details:\n` +
      `Error: ${error.toString()}\n` +
      `Stack: ${error.stack}\n` +
      `Component Stack: ${errorInfo.componentStack}`
    );

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.error(
          LogSource.UI,
          `Error in custom error handler: ${handlerError}`
        );
      }
    }
  }

  /**
   * Resets the error boundary state
   * Useful for testing or manual recovery
   */
  public resetError(): void {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    logger.info(LogSource.UI, 'ErrorBoundary state reset');
  }

  /**
   * Renders the component
   * @returns Error fallback UI if error occurred, otherwise children
   */
  override render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise use default error fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showErrorDetails={this.props.showErrorDetails ?? process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary with specific UI section handling
 * Specialized boundaries for different parts of the game UI
 */

/**
 * HUD Error Boundary - Catches errors in the HUD components
 */
export const HUDErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      logger.error(LogSource.UI, `HUD Error: ${error.message}`, errorInfo);
    }}
    showErrorDetails={process.env.NODE_ENV === 'development'}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Menu Error Boundary - Catches errors in menu components
 */
export const MenuErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      logger.error(LogSource.UI, `Menu Error: ${error.message}`, errorInfo);
    }}
    fallback={
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#2a2a2a',
        color: '#ff4444',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #ff4444',
        fontFamily: 'monospace',
        textAlign: 'center',
        zIndex: 1000
      }}>
        <h3>Menu Error</h3>
        <p>There was an error loading the menu.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Reload
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

/**
 * Dialog Error Boundary - Catches errors in dialog components
 */
export const DialogErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      logger.error(LogSource.UI, `Dialog Error: ${error.message}`, errorInfo);
    }}
    fallback={null} // Silently fail dialogs to avoid blocking gameplay
  >
    {children}
  </ErrorBoundary>
);

/**
 * Game Engine Error Boundary - Catches errors in core game systems
 */
export const GameEngineErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      logger.error(LogSource.CORE, `Game Engine Error: ${error.message}`, errorInfo);
    }}
    fallback={
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ff0000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'monospace',
        textAlign: 'center',
        zIndex: 9999
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
          🚨 Critical Game Error
        </h1>
        <p style={{ marginBottom: '20px' }}>
          A critical error occurred in the game engine.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Restart Game
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;