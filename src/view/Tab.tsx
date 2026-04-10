import * as React from "react";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { BorderNode } from "../model/BorderNode";
import { Actions } from "../model/Actions";

/** @internal */
export interface ITabProps {
    controller: LayoutController;
    tabNode: TabNode;
    selected: boolean;
}

/** @internal */
export const Tab = (props: ITabProps) => {
    const { controller, selected, tabNode } = props;
    const selfRef = React.useRef<HTMLDivElement>(null);
    const firstSelect = React.useRef<boolean>(true);

    const parentNode = tabNode.getParent() as TabSetNode | BorderNode;
    const rect = parentNode.getContentRect()!;

    React.useLayoutEffect(() => {
        const handleScroll = () => {
            tabNode.saveScrollPosition();
        };

        const element = tabNode.getMoveableElement()!;
        if (element) {
            selfRef.current!.appendChild(element);

            // keep scroll position
            element.addEventListener('scroll', handleScroll);
        }

        // listen for clicks to change active tabset
        selfRef.current!.addEventListener("pointerdown", onPointerDown);

        return () => {
            if (selfRef.current) {
                selfRef.current.removeEventListener("pointerdown", onPointerDown);
            }
            if (element) {
                if (!tabNode.isEnableWindowReMount()) {
                    controller.getMainController()?.getMoveablesDiv()?.appendChild(element);
                }
                element.removeEventListener('scroll', handleScroll);
            }
            tabNode.setVisible(false);
        }
        return;
    }, [tabNode.getMoveableElement()]);

    React.useEffect(() => {
        if (tabNode.isSelected()) {
            if (firstSelect.current) {
                tabNode.restoreScrollPosition(); // if window docked back in
                firstSelect.current = false;
            }
        }
    });

    const onPointerDown = () => {
        const parent = tabNode.getParent()!; // cannot use parentNode here since will be out of date
        if (parent instanceof TabSetNode) {
            if (!parent.isActive()) {
                controller.doAction(Actions.setActiveTabset(parent.getId(), controller.getLayoutId()));
            }
        }
    };

    tabNode.setRect(rect); // needed for resize event
    const cm = controller.getClassName;
    const style: React.CSSProperties = {};

    rect.styleWithPosition(style);

    let overlay = null;

    if (selected) {
        tabNode.setVisible(true);
        if (document.hidden && tabNode.isEnablePopoutOverlay()) {
            const overlayStyle: React.CSSProperties = {};
            rect.styleWithPosition(overlayStyle);
            overlay = (<div style={overlayStyle} className={cm(CLASSES.FLEXLAYOUT__TAB_OVERLAY)}></div>)
        }
    } else {
        style.display = "none";
        tabNode.setVisible(false);
    }

    if (parentNode instanceof TabSetNode) {
        if (tabNode.getModel().getMaximizedTabset(controller.getLayoutId()) !== undefined) {
            if (!parentNode.isMaximized()) {
                style.display = "none";
            }
        }
    }

    if (parentNode instanceof BorderNode) {
        if (!parentNode.isShowing()) {
            style.display = "none";
        }
    }

    let className = cm(CLASSES.FLEXLAYOUT__TAB);
    if (parentNode instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER);
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER_ + parentNode.getLocation().getName());
    }

    if (tabNode.getContentClassName() !== undefined) {
        className += " " + tabNode.getContentClassName();
    }

    /* 
        Note: the tab content (from the factory) is rendered into a moveable div 
        (see LayoutController.renderTabElements method)
        the moveable div is appended to selfRef in the useEffect above
    */
    return (
        <>
            {overlay}

            <div
                ref={selfRef}
                style={style}
                className={className}
                data-layout-path={tabNode.getPath()}
            />
        </>
    );
};


