import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong.</h1>
          <p className="text-red-600 mb-4">The application crashed with the following error:</p>
          <pre className="bg-white p-4 rounded border border-red-100 overflow-auto text-sm text-red-900 font-mono">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
