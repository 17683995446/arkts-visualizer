import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/debugLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
    this.maxRetries = props.maxRetries ?? 3;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', { error, errorInfo });
    
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (err) {
        logger.error('Error in onError callback:', err);
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    if (this.retryCount >= this.maxRetries) {
      logger.warn('Max retry attempts reached', { retryCount: this.retryCount, maxRetries: this.maxRetries });
      return;
    }

    this.retryCount++;
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.retryCount,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-space-950 text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full glass-panel border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <div>
                <h2 className="text-2xl font-bold text-red-300">Something went wrong</h2>
                <p className="text-xs text-gray-500">Retry {this.state.retryCount}/{this.maxRetries}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 mb-3">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {this.state.errorInfo && (
                <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              disabled={this.retryCount >= this.maxRetries}
              className={`flex items-center gap-2 w-full py-3 px-4 font-medium rounded-lg transition-all ${
                this.retryCount >= this.maxRetries
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              {this.retryCount >= this.maxRetries ? 'Max Attempts Reached' : 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
