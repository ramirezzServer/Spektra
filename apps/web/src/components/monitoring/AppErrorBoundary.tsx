import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
          <div className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-card">
            <h1 className="text-lg font-semibold text-content-primary">Something went wrong</h1>
            <p className="mt-2 text-sm text-content-secondary">Reload the page and try again.</p>
            <button type="button" className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-text" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
