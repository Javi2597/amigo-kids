"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("error boundary", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-6xl">🦊</div>
        <h1 className="text-2xl font-bold text-ink">¡Uy! Algo se enredó</h1>
        <p className="text-lg text-soft">
          Recargá la página y seguimos jugando.
        </p>
        <button
          onClick={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
          className="rounded-full bg-mascot px-5 py-3 text-lg font-bold text-white active:scale-95"
        >
          Recargar
        </button>
      </main>
    );
  }
}