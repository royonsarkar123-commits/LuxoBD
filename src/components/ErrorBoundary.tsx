import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong. Please try again later.";
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            displayMessage = `Security Error: You don't have permission to ${parsed.operationType} at ${parsed.path || 'this path'}.`;
          }
        }
      } catch (e) {
        // Not a JSON error, use default or error message
        displayMessage = this.state.error?.message || displayMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-deep-black px-6">
          <div className="max-w-md w-full bg-matte-black border border-white/10 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-serif accent-text mb-4 uppercase tracking-widest">Application Error</h2>
            <div className="w-12 h-[1px] bg-white/30 mx-auto mb-6"></div>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              {displayMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black rounded-full text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
