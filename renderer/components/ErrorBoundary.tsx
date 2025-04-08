import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?:
    | React.ReactNode
    | ((error: Error, reset: () => void) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export default class ErrorBoundary extends React.Component<
  Props,
  { hasError: boolean; error?: Error; key: number }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, key: 0 };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  reset() {
    this.setState({
      hasError: false,
      error: undefined,
      key: this.state.key + 1,
    });
  }

  render() {
    if (this.state.hasError) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(this.state.error!, this.reset)
        : (this.props.fallback ?? null);
    }

    return (
      <React.Fragment key={this.state.key}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
