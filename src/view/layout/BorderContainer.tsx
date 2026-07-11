import * as React from "react";
import { DockLocation } from "../../model/DockLocation";
import { BorderTabSet } from "../BorderTabSet";
import { BorderTab } from "../BorderTab";
import { CLASSES } from "../CSSClassNames";
import { LayoutController } from "./LayoutInternal";

export interface IBorderContainerProps {
    controller: LayoutController;
    inner: React.ReactNode;
}

export const BorderContainer = ({ controller, inner }: IBorderContainerProps) => {

    
    const classMain = controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_MAIN);
    const borders = controller.getModel().getBorderSet().getBorderMap();
    
    if (controller.isMainLayout() && borders.size > 0) {
        const innerContent = (
            <div className={classMain} ref={controller.getMainRef()}>
                {inner}
            </div>
        );
        const borderSetComponents = new Map<DockLocation, React.ReactNode>();
        const borderSetContentComponents = new Map<DockLocation, React.ReactNode>();
        
        for (const [_, location] of DockLocation.values) {
            const border = borders.get(location);
            const showBorder = border && border.isShowing() && (
                !border.isAutoHide() ||
                (border.isAutoHide() && (border.getChildren().length > 0 || controller.getState().showHiddenBorder === location)));
            
            if (showBorder) {
                borderSetComponents.set(location, <BorderTabSet controller={controller} borderNode={border} size={controller.getState().calculatedBorderBarSize} />);
                borderSetContentComponents.set(location, <BorderTab controller={controller} borderNode={border} show={border.getSelected() !== -1} />);
            }
        }

        const classBorderOuter = controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_BORDER_CONTAINER);
        const classBorderInner = controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_BORDER_CONTAINER_INNER);

        const innerWithBorderTabs = (
            <div className={classBorderInner} style={{ flexDirection: "column" }}>
                {borderSetContentComponents.get(DockLocation.TOP)}
                <div className={classBorderInner} style={{ flexDirection: "row" }}>
                    {borderSetContentComponents.get(DockLocation.LEFT)}
                    {innerContent}
                    {borderSetContentComponents.get(DockLocation.RIGHT)}
                </div>
                {borderSetContentComponents.get(DockLocation.BOTTOM)}
            </div>
        );
        return (
            <div className={classBorderOuter} style={{ flexDirection: "column" }}>
                {borderSetComponents.get(DockLocation.TOP)}
                <div className={classBorderInner} style={{ flexDirection: "row" }}>
                    {borderSetComponents.get(DockLocation.LEFT)}
                    {innerWithBorderTabs}
                    {borderSetComponents.get(DockLocation.RIGHT)}
                </div>
                {borderSetComponents.get(DockLocation.BOTTOM)}
            </div>
        );

    } else { // no borders
        return (
            <div className={classMain} ref={controller.getMainRef()} style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, display: "flex" }}>
                {inner}
            </div>
        );
    }
};

BorderContainer.displayName = 'BorderContainer'; // name in react dev tools
