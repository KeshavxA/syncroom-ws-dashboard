import React from 'react';

export class ErrorBoundary extends React.Component {
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

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg border border-red-500 max-w-md mx-auto mt-8">
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong in the live feed</h2>
          <p className="text-gray-400 mb-4 text-sm">{this.state.error?.message}</p>
          <button 
            onClick={this.handleRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
