import * as React from "react";
import {ErrorInfo} from "react";

export interface IErrorBoundaryProps {
    message: string;
}
export interface IErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState>  {
    constructor(props : IErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error : Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.debug(error);
        console.debug(errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flexlayout__error_boundary_container">
                    <div className="flexlayout__error_boundary_content">
                        {this.props.message}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
