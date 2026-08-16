import { Component } from 'react';

/**
 * Without this, any render-time error anywhere in the tree unmounts the
 * whole app and leaves a silent blank white page — this catches it and
 * shows the actual error so it can be diagnosed instead of guessed at.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#1c1c1c', color: '#fff', padding: 24, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h1 style={{ color: '#e33', fontSize: 18, marginBottom: 12 }}>Application error</h1>
          <p style={{ marginBottom: 12 }}>{String(this.state.error?.message || this.state.error)}</p>
          <pre style={{ fontSize: 11, opacity: 0.7, overflow: 'auto' }}>{this.state.error?.stack}</pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: '#990000', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
