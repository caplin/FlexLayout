import { ReactNode, FC } from "react";

export interface FloatWindowContainerProps {
    children: ReactNode;
    containerEl: HTMLElement;
}

export type IFloatWindowContainer = FC<FloatWindowContainerProps>;
