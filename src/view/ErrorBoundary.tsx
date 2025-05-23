import * as React from "react";
import { ErrorInfo } from "react";
import { CLASSES } from "../Types";

/** @internal */
export interface IErrorBoundaryProps {
    message: string;
    retryText: string;
    children: React.ReactNode;
}
/** @internal */
export interface IErrorBoundaryState {
    hasError: boolean;
}

/** @internal */
export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    constructor(props: IErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.debug(error);
        console.debug(errorInfo);
    }

    retry = () => {
        this.setState({ hasError: false });
      };

    render() {
        if (this.state.hasError) {
            return (
                <div className={CLASSES.FLEXLAYOUT__ERROR_BOUNDARY_CONTAINER}>
                    <div className={CLASSES.FLEXLAYOUT__ERROR_BOUNDARY_CONTENT}>
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            {this.props.message}
                            <p><button onClick={this.retry}>{this.props.retryText}</button></p>
                        </div>
                    </div>
                    
                </div>
            );
        }

        return this.props.children;
    }
}
