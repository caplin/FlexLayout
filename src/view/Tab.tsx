import * as React from "react";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { BorderNode } from "../model/BorderNode";
import { Actions } from "../model/Actions";
import { domId, matchesKey, toAriaKeyShortcuts } from "./Utils";

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

    const onPointerDown = React.useCallback(() => {
        const parent = tabNode.getParent()!; // cannot use parentNode here since will be out of date
        if (parent instanceof TabSetNode) {
            if (!parent.isActive()) {
                controller.doAction(Actions.setActiveTabset(parent.getId(), controller.getLayoutId()));
            }
        }
    }, [tabNode, controller]);

    const parentNode = tabNode.getParent() as TabSetNode | BorderNode;
    const focusToggleKey = controller.getKeyMap().focusTabToggle;

    // the configured key (pressed anywhere within the tab content) returns focus to the tab button
    const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (matchesKey(event, focusToggleKey)) {
            const button = event.currentTarget.ownerDocument.getElementById(domId("flexlayout-tabbutton-", tabNode.getId()));
            if (button) {
                button.focus();
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };

    React.useLayoutEffect(() => {
        const element = tabNode.getMoveableElement();
        if (element.parentElement !== selfRef.current) {
            selfRef.current!.appendChild(element);
        }

        // keep scroll position
        const handleScroll = () => {
            tabNode.saveScrollPosition();
        };
        element.addEventListener('scroll', handleScroll);

        // listen for clicks to change active tabset
        const self = selfRef.current;
        if (self) {
            self.addEventListener("pointerdown", onPointerDown);
        }

        return () => {
            if (self) {
                self.removeEventListener("pointerdown", onPointerDown);
            }
            element.removeEventListener('scroll', handleScroll);

            // when the effect re-runs for an adopted node (model replaced via fromJson with a previous model)
            // the element stays in place; only on a real unmount is the element disconnected
            if (!element.isConnected) {
                if (controller.getModel().getNodeById(tabNode.getId())) { // check node still in model
                    if (!tabNode.isEnableWindowReMount()) {
                        controller.getMainController()?.getMoveablesHome()?.appendChild(element); // keep element parented for open layers etc
                    }
                }
                tabNode.setVisible(false);
            }
        }
    }, [tabNode, controller, onPointerDown]);

    React.useEffect(() => {
        if (tabNode.isSelected()) {
            if (firstSelect.current) {
                tabNode.restoreScrollPosition(); // if window docked back in
                firstSelect.current = false;
            }
        }
    });

    // register with the layout's positioning pass, which owns this element's position styles,
    // visibility and the resize/visibility events (see LayoutController.positionTabPanels)
    React.useLayoutEffect(() => {
        controller.registerTabPanel(tabNode, selfRef.current);
        return () => {
            controller.registerTabPanel(tabNode, null);
        };
    }, [controller, tabNode]);

    const cm = controller.getClassName;

    let overlay = null;

    if (selected && document.hidden && tabNode.isEnablePopoutOverlay()) {
        const overlayStyle: React.CSSProperties = {};
        parentNode.getContentRect().styleWithPosition(overlayStyle);
        let overlayClassName = cm(CLASSES.FLEXLAYOUT__TAB_OVERLAY);
        if (parentNode instanceof BorderNode && parentNode.isOverlay()) {
            // must paint above the overlay border panel
            overlayClassName += " " + cm(CLASSES.FLEXLAYOUT__TAB_OVERLAY_RAISED);
        }
        overlay = (<div style={overlayStyle} className={overlayClassName}></div>)
    }

    let className = cm(CLASSES.FLEXLAYOUT__TAB);
    if (parentNode instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER);
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER_ + parentNode.getLocation().getName());
        if (parentNode.isOverlay()) {
            // the panel must paint above the main area tab panels (root level siblings at z auto)
            className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER_OVERLAY);
        }
    }

    if (tabNode.getContentClassName() !== undefined) {
        className += " " + tabNode.getContentClassName();
    }

    /* 
        Note: the tab content (from the factory) is rendered into a moveable element 
        (see LayoutController.renderTabElements method)
        the moveable element is appended to selfRef in the useEffect above
    */
    return (
        <>
            {overlay}

            <div
                ref={selfRef}
                id={domId("flexlayout-tab-", tabNode.getId())}
                role="tabpanel"
                aria-labelledby={domId("flexlayout-tabbutton-", tabNode.getId())}
                aria-keyshortcuts={toAriaKeyShortcuts(focusToggleKey)}
                tabIndex={-1}
                onKeyDown={focusToggleKey ? onKeyDown : undefined}
                className={className}
                data-layout-path={tabNode.getPath()}
            />
        </>
    );
};

Tab.displayName = 'Tab'; // name in react dev tools



