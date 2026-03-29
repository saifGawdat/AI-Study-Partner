import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", background: "#050505", color: "#fff", minHeight: "100vh", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ maxWidth: "600px" }}>
            <h1 style={{ color: "#10b981", fontSize: "3rem", marginBottom: "1rem" }}>!</h1>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Something went wrong.</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>{this.state.error?.toString()}</p>
            
            <button 
              onClick={this.handleReload}
              style={{
                background: "#10b981",
                color: "#000",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "20px"
              }}
            >
              Clear Cache & Force Reload
            </button>

            <details style={{ whiteSpace: "pre-wrap", textAlign: "left", padding: "16px", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", width: "100%" }}>
              <summary style={{ cursor: "pointer", color: "#64748b", fontSize: "0.875rem" }}>Show technical details</summary>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", overflowX: "auto", color: "#ef4444" }}>
                {this.state.errorInfo?.componentStack}
                <br />
                {this.state.error?.stack}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
