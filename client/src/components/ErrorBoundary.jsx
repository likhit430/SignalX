import React, { Component } from 'react';
import ErrorState from './ErrorState';
import CyberBackground from './CyberBackground';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#03030d] text-zinc-100">
          <CyberBackground variant="purple" />
          <div className="relative z-10 w-full max-w-lg">
            <ErrorState
              title="CRITICAL GATEWAY FAULT"
              message={this.state.error?.message || 'A critical rendering exception was encountered. Neural flows interrupted.'}
              onRetry={this.handleReset}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
