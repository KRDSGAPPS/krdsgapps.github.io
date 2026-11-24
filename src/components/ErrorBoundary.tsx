import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendlyDetail = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed && typeof parsed.error === 'string') {
          friendlyDetail = `${parsed.error} (${parsed.operationType || 'read'} · ${parsed.path || 'firestore'})`;
        }
      } catch {
        // Not a JSON FirestoreErrorInfo payload
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
          <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-4">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              کێشەیەک ڕوویدا / Something went wrong
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed break-words">
              {friendlyDetail}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              دووبارە بارکردنەوە / Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
