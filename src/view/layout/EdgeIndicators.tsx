import * as React from "react";
import { CLASSES } from "../CSSClassNames";
import { LayoutController, edgeRectLength, edgeRectWidth } from "./LayoutInternal";

export interface IEdgeIndicatorsProps {
    controller: LayoutController;
}

export const EdgeIndicators = ({ controller }: IEdgeIndicatorsProps) => {
    
    const edges: React.ReactNode[] = [];
    const arrowIcon = controller.getIcons().edgeArrow;

    if (controller.getState().showEdges && controller.getModel().isEnableEdgeDockIndicators()) {
        const r = controller.getModel().getRootRow(controller.getLayoutId())!.getRect();
        const length = edgeRectLength;
        const width = edgeRectWidth;
        const offset = edgeRectLength / 2;
        const className = controller.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
        const radius = 50;

        edges.push(
            <div key="North" aria-hidden="true" style={{ top: 0, left: r.width / 2 - offset, width: length, height: width, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }} className={className + " " + controller.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_TOP)}>
                <div style={{ transform: "rotate(180deg)" }}>
                    {arrowIcon}
                </div>
            </div>
        );
        edges.push(
            <div key="West" aria-hidden="true" style={{ top: r.height / 2 - offset, left: 0, width: width, height: length, borderTopRightRadius: radius, borderBottomRightRadius: radius }} className={className + " " + controller.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_LEFT)}>
                <div style={{ transform: "rotate(90deg)" }}>
                    {arrowIcon}
                </div>
            </div>
        );
        edges.push(
            <div key="South" aria-hidden="true" style={{ top: r.height - width, left: r.width / 2 - offset, width: length, height: width, borderTopLeftRadius: radius, borderTopRightRadius: radius }} className={className + " " + controller.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_BOTTOM)}>
                <div>
                    {arrowIcon}
                </div>
            </div>
        );
        edges.push(
            <div key="East" aria-hidden="true" style={{ top: r.height / 2 - offset, left: r.width - width, width: width, height: length, borderTopLeftRadius: radius, borderBottomLeftRadius: radius }} className={className + " " + controller.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_RIGHT)}>
                <div style={{ transform: "rotate(-90deg)" }}>
                    {arrowIcon}
                </div>
            </div>
        );
    }

    return <>{edges}</>;
};

EdgeIndicators.displayName = 'EdgeIndicators'; // name in react dev tools

