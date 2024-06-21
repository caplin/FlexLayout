import * as React from "react";
import { Rect } from "../Rect";

export interface ISizeTrackerProps {
    rect: Rect;
    selected: boolean;
    forceRevision: number;
    tabsRevision: number;
    children: React.ReactNode;
}
// only render if size changed or forceRevision changed or tabsRevision changed
export const SizeTracker = React.memo(({ children }: ISizeTrackerProps) => {
    return <>{children}</>
}, (prevProps, nextProps) => {
    return prevProps.rect.equalSize(nextProps.rect) && 
    prevProps.selected === nextProps.selected &&
    prevProps.forceRevision === nextProps.forceRevision &&
    prevProps.tabsRevision === nextProps.tabsRevision
});

