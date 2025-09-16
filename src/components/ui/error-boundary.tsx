'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from './empty-state'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorState
          message={this.state.error?.message || 'Something went wrong'}
          onRetry={() => {
            this.setState({ hasError: false, error: undefined })
            window.location.reload()
          }}
        />
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for use with React Query or other async operations
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Error caught by handler:', error)
    // You could integrate with error reporting services here
    throw error
  }
}
