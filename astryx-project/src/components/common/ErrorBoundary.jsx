import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '32px 16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <Card
            elevation="low"
            padding={6}
            style={{
              maxWidth: 500,
              width: '100%',
              borderRadius: 16,
              border: '1px solid #fee2e2',
              backgroundColor: '#fff',
            }}
          >
            <VStack gap={4} align="center">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: 24,
                  fontWeight: 'bold',
                }}
              >
                !
              </div>

              <VStack gap={1} align="center">
                <Heading level={2} align="center">
                  Something went wrong
                </Heading>
                <Text color="secondary" align="center">
                  An unexpected error occurred while rendering this view.
                </Text>
              </VStack>

              {this.state.error?.message && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    color: '#64748b',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    maxWidth: '100%',
                  }}
                >
                  {this.state.error.message}
                </div>
              )}

              <Button
                label="Reload Page"
                variant="primary"
                onClick={this.handleReset}
              />
            </VStack>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
