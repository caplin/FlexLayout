import * as React from "react";
import { LayoutInternal } from "./Layout";
import { LayoutWindow } from "../model/LayoutWindow";
import { LayoutPopup } from '../model/LayoutPopup';
import { createPortal } from 'react-dom';
import { CLASSES } from '../Types';
import { Actions } from '../model/Actions';

/** @internal */
export interface IPopupWindowProps {
    title: string;
    layout: LayoutInternal;
    layoutWindow: LayoutPopup;
    url: string;
    onCloseWindow: (layoutWindow: LayoutWindow) => void;
    onSetWindow: (layoutWindow: LayoutWindow, window: Window) => void;
}

/** @internal */
export const Popup = (props: React.PropsWithChildren<IPopupWindowProps>) => {
    const { children, layout, layoutWindow } = props;
    const { rect, windowId } = layoutWindow;
    const { x, y, width, height } = rect;
    const model = layout.getModel();
    const zIndex = 9999 + model.getWindowOrderNumber(windowId);

    const onPointerDown = () => {
        layout.doAction({ type: Actions.BRING_TO_FRONT, data: { windowId } });
    };

    return (
        createPortal(
            <div className={CLASSES.FLEXLAYOUT__POPUP} style={{position: 'absolute', top: y, left: x, width, height, zIndex }} onPointerDown={onPointerDown}>
                {children}
            </div>,
        document.body)
    );
};