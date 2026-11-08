import React from 'react';

/**
 * Top-level React error boundary.
 * Catches rendering errors in the app tree and shows a recoverable fallback
 * instead of a blank screen.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Keep the error visible in the console for debugging/reporting.
        console.error('Unhandled application error', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
                    <div className="max-w-lg w-full text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
                            Something went wrong
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            We hit an unexpected error
                        </h1>
                        <p className="text-lg text-gray-400 mb-10">
                            Reload the page to try again. If the problem continues, please come back later.
                        </p>
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="btn btn-primary inline-flex items-center justify-center"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
