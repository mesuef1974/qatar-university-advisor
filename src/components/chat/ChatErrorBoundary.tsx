"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
  message: string;
}

export class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? "" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ChatErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">حدث خطأ غير متوقع</h3>
            <p className="text-sm text-muted-foreground">
              يمكنك المحاولة مرة أخرى أو إعادة تحميل الصفحة
            </p>
          </div>
          <Button
            onClick={this.handleReset}
            className="bg-maroon hover:bg-maroon-dark text-white rounded-xl"
          >
            المحاولة مرة أخرى
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
