import { Component } from 'react';

/**
 * Defensive error boundary wrapping third-party canvas engines (Excalidraw).
 * If the engine throws during initialization/render, we surface a friendly
 * fallback so the user never stares at a blank screen.
 */
export default class BoardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('[BoardErrorBoundary] Canvas engine failed:', error, info);
  }

  reset = () => this.setState({ failed: false });

  render() {
    if (this.state.failed) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center bg-slate-900">
          <div className="text-5xl">🛠️</div>
          <h3 className="font-semibold text-lg">This board engine hit an error</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Don't worry — your notes are safe. Switch to the classic Ruled Paper
            notebook to keep going instantly.
          </p>
          {(this.props.onRetry || this.props.onFallback) && (
            <div className="flex gap-3">
              {this.props.onRetry && (
                <button className="btn-secondary" onClick={() => { this.reset(); this.props.onRetry?.(); }}>
                  Try again
                </button>
              )}
              {this.props.onFallback && (
                <button className="btn-primary" onClick={this.props.onFallback}>
                  Switch to Ruled Paper
                </button>
              )}
            </div>
          )}
          <button className="text-xs text-slate-500 underline" onClick={this.reset}>
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}