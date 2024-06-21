import * as React from "react";
import { LayoutInternal } from "./Layout";
import { CLASSES } from "../Types";

/** @internal */
export interface IOverlayProps {
    layout: LayoutInternal;
    show: boolean;
}

/** @internal */
export const Overlay = (props: IOverlayProps) => {
    const {layout, show} = props;

    return (
        <div 
            className={layout.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_OVERLAY)}
            style={{display: (show ? "flex" : "none")
        }}
        />
    );
}