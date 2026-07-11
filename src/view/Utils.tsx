import * as React from "react";
import { Node } from "../model/Node";
import { TabNode } from "../model/TabNode";
import { LayoutController } from "./layout/LayoutInternal";
import { TabSetNode } from "../model/TabSetNode";
import { Layout } from "../model/Layout";
import { defaultKeyMap, IKeyMap } from "./layout/LayoutTypes";

/** @internal */
export function isDesktop() {
    const desktop = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    return desktop;
}
/** @internal */
export function getRenderStateEx(
    controller: LayoutController,
    tabNode: TabNode,
    iconAngle?: number
) {
    let leadingContent = undefined;
    const titleContent: React.ReactNode = tabNode.getName();
    const name = tabNode.getName();
    if (iconAngle === undefined) {
        iconAngle = 0;
    }

    if (leadingContent === undefined && tabNode.getIcon() !== undefined) {
        // alt is empty since the icon is decorative, the tab name is in the adjacent content
        if (iconAngle !== 0) {
            leadingContent = <img style={{ width: "1em", height: "1em", transform: "rotate(" + iconAngle + "deg)" }} src={tabNode.getIcon()} alt="" />;
        } else {
            leadingContent = <img style={{ width: "1em", height: "1em" }} src={tabNode.getIcon()} alt="" />;
        }
    }

    const buttons: React.ReactNode[] = [];

    // allow customization of leading contents (icon) and contents
    const renderState = { leading: leadingContent, content: titleContent, name, buttons };
    controller.customizeTab(tabNode, renderState);

    tabNode.setRenderedName(renderState.name);

    return renderState;
}

/** @internal */
export function domId(prefix: string, nodeId: string) {
    return prefix + nodeId.replace(/\s/g, "_"); // aria id references cannot contain whitespace
}

/** @internal the modifier/key fields shared by native and React keyboard events */
export interface IKeyEventLike {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}

/** @internal */
export function matchesKey(event: IKeyEventLike, spec: string | undefined): boolean {
    if (!spec) {
        return false;
    }
    const parts = spec.split("+");
    const key = parts.pop()!;
    const has = (mod: string) => parts.some((p) => p.toLowerCase() === mod);
    return event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === has("ctrl") &&
        event.shiftKey === has("shift") &&
        event.altKey === has("alt") &&
        event.metaKey === has("meta");
}

/** @internal true when any modifier key is held; the fixed ARIA pattern keys (arrows on tabs and
 * splitters) only apply unmodified, so modified presses stay available for keymap bindings */
export function hasModifier(event: IKeyEventLike): boolean {
    return event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
}

/** @internal merge the configured bindings over the defaults; a binding passed as an explicit
 * undefined disables that shortcut */
export function resolveKeyMap(keyMap: IKeyMap | undefined): IKeyMap {
    return { ...defaultKeyMap, ...keyMap };
}

/** @internal */
export function toAriaKeyShortcuts(spec: string | undefined) {
    return spec?.replace(/\bctrl\b/i, "Control"); // the aria-keyshortcuts attribute spells it "Control"
}

/** @internal */
export function focusFirstIn(container: HTMLElement | null) {
    if (container) {
        const focusable = container.querySelector(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement | null;
        (focusable ?? container).focus();
    }
}

/** @internal */
export function isAuxMouseEvent(event: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) {
    let auxEvent = false;
    if (event.nativeEvent instanceof MouseEvent) {
        if (event.nativeEvent.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
            auxEvent = true;
        }
    }
    return auxEvent;
}

export function enablePointerOnIFrames(enable: boolean, currentDocument: Document) {
    const iframes = [
        ...getElementsByTagName('iframe', currentDocument),
        ...getElementsByTagName('webview', currentDocument),
    ];

    for (const iframe of iframes) {
        (iframe as HTMLElement).style.pointerEvents = enable ? 'auto' : 'none';
    }
};

export function getElementsByTagName(tag: string, currentDocument: Document): Element[] {
    return [...currentDocument.getElementsByTagName(tag)];
}

export let Utils_dragging: boolean = false;

export function startDrag(
    doc: Document,
    event: React.PointerEvent<HTMLElement>,
    drag: (x: number, y: number) => void,
    dragEnd: () => void,
    dragCancel: () => void) {

    Utils_dragging = true;
    event.preventDefault();

    const pointerMove = (ev: PointerEvent) => {
        ev.preventDefault();
        drag(ev.clientX, ev.clientY);
    };

    const removeListeners = () => {
        doc.removeEventListener("pointermove", pointerMove);
        doc.removeEventListener("pointerup", pointerUp);
        doc.removeEventListener("pointercancel", pointerCancel);
    };

    const pointerCancel = (ev: PointerEvent) => {
        ev.preventDefault();
        removeListeners();
        Utils_dragging = false;
        dragCancel();
    };
    const pointerUp = () => {
        removeListeners();
        Utils_dragging = false;
        dragEnd();
    };

    doc.addEventListener("pointermove", pointerMove);
    doc.addEventListener("pointerup", pointerUp);
    doc.addEventListener('pointercancel', pointerCancel);
}

export function findParentLayout(layout: Layout): Layout | undefined {
    let parentLayout: Layout | undefined = undefined;
    const model = layout.getController()!.getModel();
    model.visitNodes( node => {
        if (node instanceof TabNode && node.getSubLayoutId() === layout.getLayoutId()){
            parentLayout = node.getLayout();
        }
    });
    return parentLayout;
}

export function canDockToLayout(node: Node, layout: Layout) {
    const type = layout.getType()
    if (type === "window") {
        return node.isAllowedInWindow();
    } else if (type === "float") {
        return true;
    } else if (type === "tab") {
        const parentLayout = findParentLayout(layout);
        if (parentLayout && parentLayout.getType() === "window" && !parentLayout.isMainLayout() && !node.isAllowedInWindow()) {
            return false;
        }
        if (node instanceof TabNode) {
            if (node.getSubLayoutId() !== undefined) {
                return false;
            }
        } else if (node instanceof TabSetNode) {
            for (const child of node.getChildren()) {
                if ((child as TabNode).getSubLayoutId() !== undefined) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}

export function copyInlineStyles(source: HTMLElement, target: HTMLElement): boolean {
    // Get the inline style attribute from the source element
    const sourceStyle = source.getAttribute('style');
    const targetStyle = target.getAttribute('style');
    if (sourceStyle === targetStyle) return false;


    if (sourceStyle) {
        // Set the style attribute on the target element
        target.setAttribute('style', sourceStyle);
    } else {
        // If the source has no inline style, clear the target's style attribute
        target.removeAttribute('style');
    }
    return true;
}

export function isSafari() {
    const userAgent = navigator.userAgent;
    return userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium");
}

export function getPageMetrics(win: Window = window) {
  const document = win.document;
  return {
    // How far the user has scrolled from the top/left
    scrollTop: win.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
    scrollLeft: win.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,

    // The total height and width of the entire document
    fullHeight: Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    ),

    fullWidth: Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    ),

    viewportHeight: win.innerHeight || document.documentElement.clientHeight,
    viewportWidth: win.innerWidth || document.documentElement.clientWidth
  };
}


