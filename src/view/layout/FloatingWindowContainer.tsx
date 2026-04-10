import * as React from "react";
import { PopoutWindow } from "../PopoutWindow";
import { FloatWindow } from "../FloatWindow";
import { LayoutController, LayoutInternal } from "./LayoutInternal";

export interface IFloatingWindowContainerProps {
    controller: LayoutController;
}

export const FloatingWindowContainer = ({ controller }: IFloatingWindowContainerProps) => {
    const floatingLayouts: React.ReactNode[] = [];
    const layouts = controller.getModel().getLayouts();
    let windowPopoutId = 0;
    for (const [layoutId, layout] of layouts) {
        if (!layout.isMainLayout()) {
            if (layout.getType() === "window" && controller.isSupportsPopout()) {
                floatingLayouts.push(
                    <PopoutWindow
                        key={layoutId}
                        controller={controller}
                        layout={layout}
                        title={controller.getPopoutWindowName() + " " + windowPopoutId}
                        url={controller.getPopoutURL() + "?id=" + layoutId}
                        onSetWindow={controller.onSetWindow}
                        onCloseLayout={controller.onCloseLayout}
                    >
                        <div className={controller.getProps().popoutClassName}>
                            <LayoutInternal {...controller.getProps()} layoutId={layoutId} mainLayoutController={controller} />
                        </div>
                    </PopoutWindow>
                );
                windowPopoutId++;
            } else if (layout.getType() === "float") {
                floatingLayouts.push(
                    <FloatWindow
                        key={layoutId + "float"}
                        controller={controller}
                        layout={layout}
                        onCloseLayout={controller.onCloseLayout}
                    >
                        <LayoutInternal {...controller.getProps()} layoutId={layoutId} mainLayoutController={controller} />
                    </FloatWindow>
                );
            }
        }
    }


    return <>{floatingLayouts}</>;
};
