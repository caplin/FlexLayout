import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { TabNode } from "../model/TabNode";
import { CLASSES } from "./CSSClassNames";
import { I18nLabel } from "./I18nLabel";
import { LayoutController } from "./layout/LayoutInternal";
import { TabButtonStamp } from "./TabButtonStamp";
import { TabSetNode } from "../model/TabSetNode";
import { BorderNode } from "../model/BorderNode";

// type-ahead search buffer resets after this idle period
const TYPEAHEAD_RESET_MS = 500;

/**
 * A single entry in a {@link PopupMenu}. Provide `label` (with optional `icon`) for the common
 * case, or `content` for a fully custom item body (overrides `label`/`icon`).
 * @category Components
 * @group Popup Menu
 */
export interface IPopupMenuItem {
    /** entry discriminant; defaults to a selectable item */
    type?: "item";
    /** stable unique key for this item */
    key: string;
    /** text shown for the item when `content` is not given */
    label?: string;
    /** optional leading icon, shown before the label */
    icon?: React.ReactNode;
    /** custom item body; when present it overrides `label` and `icon` */
    content?: React.ReactNode;
    /** when true the item cannot be selected */
    disabled?: boolean;
}

/**
 * A non-selectable divider (horizontal rule) between menu items.
 * @category Components
 * @group Popup Menu
 */
export interface IPopupMenuDivider {
    /** entry discriminant */
    type: "divider";
    /** stable unique key for this divider */
    key: string;
}

/**
 * An entry in a {@link PopupMenu}: a selectable {@link IPopupMenuItem} or an
 * {@link IPopupMenuDivider}.
 * @category Components
 * @group Popup Menu
 */
export type PopupMenuEntry = IPopupMenuItem | IPopupMenuDivider;

/**
 * Helpers passed to a custom {@link IPopupMenuProps.renderItem} so it can drive the menu's
 * canonical selection/close behaviour (focus return, onSelect, onClose).
 * @category Components
 * @group Popup Menu
 */
export interface IPopupMenuItemApi {
    /** select this item (fires onSelect then closes the menu) */
    select: () => void;
    /** close the menu without selecting */
    close: () => void;
}

/**
 * Props for the reusable {@link PopupMenu} control and the {@link showPopupMenu} helper. The
 * control has no dependency on the layout model - it can be used as a standalone menu/context menu.
 * @category Components
 * @group Popup Menu
 */
export interface IPopupMenuProps {
    /** where to position the menu: a screen point (e.g. a right-click location), a DOMRect, or an
     *  element to anchor to. An element is measured when the menu opens. */
    anchor: { x: number; y: number } | DOMRect | HTMLElement;
    /** the menu entries (selectable items and/or dividers) */
    items: PopupMenuEntry[];
    /** called with the chosen item when one is selected */
    onSelect?: (item: IPopupMenuItem) => void;
    /** called when the menu closes (selection, Escape/Tab, outside click, or programmatic hide) */
    onClose: () => void;
    /** element the menu is positioned within and portalled into; defaults to the anchor's document body.
     *  Should be a positioned element (e.g. the FlexLayout root) for precise placement. */
    container?: HTMLElement;
    /** maps default class names to custom ones (e.g. for css modules); defaults to identity */
    classNameMapper?: (defaultClassName: string) => string;
    /** custom renderer for an item; must render an element with role="menuitem" and tabIndex=-1 */
    renderItem?: (item: IPopupMenuItem, index: number, api: IPopupMenuItemApi) => React.ReactNode;
    /** element to return focus to when the menu closes; defaults to the anchor when it is an element */
    returnFocusTo?: HTMLElement;
    /** accessible label for the menu */
    title?: string;
}

/** @internal duck-type an element (cross-window/popout elements are not `instanceof` this realm's HTMLElement) */
function isElementAnchor(anchor: { x: number; y: number } | DOMRect | HTMLElement): anchor is HTMLElement {
    return typeof (anchor as HTMLElement).getBoundingClientRect === "function";
}

/** @internal */
function resolveContainer(props: IPopupMenuProps): HTMLElement {
    if (props.container) {
        return props.container;
    }
    if (isElementAnchor(props.anchor)) {
        return props.anchor.ownerDocument.body;
    }
    return document.body;
}

/** @internal resolve an anchor to a DOMRect. Element anchors are measured here; callers that need
 *  the measurement to happen at a specific time (e.g. synchronously when a menu opens, before a
 *  re-render can detach the element) should pass a pre-measured DOMRect instead of the element. */
function anchorToRect(anchor: { x: number; y: number } | DOMRect | HTMLElement): DOMRect {
    if (isElementAnchor(anchor)) {
        return anchor.getBoundingClientRect();
    }
    if ("right" in anchor && "bottom" in anchor) { // DOMRect-like
        return anchor as DOMRect;
    }
    const point = anchor as { x: number; y: number };
    return new DOMRect(point.x, point.y, 0, 0);
}

/** @internal compute the absolute offset style of the menu within the container, anchored so it opens
 *  towards the centre of the container (matches the classic overflow-menu behaviour) */
function computePosition(anchorRect: DOMRect, containerRect: DOMRect): React.CSSProperties {
    const c = containerRect;
    const { left, right, top, bottom } = anchorRect;
    const style: React.CSSProperties = {};
    if ((left + right) / 2 < c.left + c.width / 2) {
        style.left = left - c.left;
    } else {
        style.right = c.right - right;
    }
    if ((top + bottom) / 2 < c.top + c.height / 2) {
        style.top = top - c.top;
    } else {
        style.bottom = c.bottom - bottom;
    }
    return style;
}

/**
 * A reusable, accessible popup menu. Positions itself relative to an anchor point or element,
 * handles keyboard navigation (arrows, Enter/Space, Escape/Tab), focus management, and
 * outside-click dismissal. Portals itself into `container` (default: the document body).
 *
 * For fire-on-event usage (e.g. a right-click context menu) see {@link showPopupMenu}, which
 * mounts this component imperatively and returns a hide handle.
 * @category Components
 * @group Popup Menu
 */
export const PopupMenu = (props: IPopupMenuProps) => {
        
    const { anchor, items, onSelect, onClose, renderItem, title } = props;
    const cm = props.classNameMapper ?? ((c: string) => c);
    const container = resolveContainer(props);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    // type-ahead: characters typed within TYPEAHEAD_RESET_MS accumulate into a search buffer
    const typeahead = React.useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | undefined }>({ buffer: "", timer: undefined });
    React.useEffect(() => () => { if (typeahead.current.timer) clearTimeout(typeahead.current.timer); }, []);

    const select = React.useCallback((item: IPopupMenuItem) => {
        if (item.disabled) {
            return;
        }
        onSelect?.(item);
        onClose();
    }, [onSelect, onClose]);

    // focus the first item on mount, return focus to the trigger on unmount
    React.useEffect(() => {
        const first = menuRef.current?.querySelector('[role="menuitem"]:not([aria-disabled="true"])') as HTMLElement | null;
        (first ?? menuRef.current)?.focus();
        const returnTo = props.returnFocusTo ?? (isElementAnchor(anchor) ? anchor : undefined);
        return () => { returnTo?.focus?.(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // close on a pointer press outside the menu
    React.useEffect(() => {
        const doc = container.ownerDocument;
        const onDocPointerDown = (event: Event) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                onClose();
            }
        };
        doc.addEventListener("pointerdown", onDocPointerDown);
        return () => doc.removeEventListener("pointerdown", onDocPointerDown);
    }, [container, onClose]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const menuItems = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') ?? []) as HTMLElement[];
        const focused = (event.target as HTMLElement).closest?.('[role="menuitem"]') as HTMLElement | null;
        const focusedIndex = focused ? menuItems.indexOf(focused) : -1;

        if (event.key === "Escape" || event.key === "Tab") {
            // close on Escape and Tab (Tab would otherwise move focus out of the menu while it
            // stayed open); onClose returns focus to the trigger
            onClose();
            event.preventDefault();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (menuItems.length > 0) {
                const delta = event.key === "ArrowDown" ? 1 : -1;
                const next = menuItems[(focusedIndex + delta + menuItems.length) % menuItems.length];
                next?.focus();
            }
            event.preventDefault();
        } else if (event.key === "Home" || event.key === "End") {
            const target = event.key === "Home" ? menuItems[0] : menuItems[menuItems.length - 1];
            target?.focus();
            event.preventDefault();
        } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
            // type-ahead: focus the next item whose text starts with the typed string
            const ta = typeahead.current;
            if (ta.timer) {
                clearTimeout(ta.timer);
            }
            ta.buffer += event.key.toLowerCase();
            ta.timer = setTimeout(() => { ta.buffer = ""; }, TYPEAHEAD_RESET_MS);
            // if the same key is pressed repeatedly, cycle through items starting with that letter
            const allSame = [...ta.buffer].every((c) => c === ta.buffer[0]);
            const search = allSame ? ta.buffer[0] : ta.buffer;
            const startFrom = allSame ? focusedIndex + 1 : Math.max(focusedIndex, 0);
            for (let i = 0; i < menuItems.length; i++) {
                const idx = (startFrom + i) % menuItems.length;
                if ((menuItems[idx].textContent ?? "").trim().toLowerCase().startsWith(search)) {
                    menuItems[idx].focus();
                    break;
                }
            }
            event.preventDefault();
        } else if ((event.key === "Enter" || event.key === " ") && focused) {
            // activate the focused item via its own onClick (default: select+close; renderItem:
            // its api.select). robust to non-item entries such as dividers, which are never focused.
            focused.click();
            event.preventDefault();
        }
    };

    const itemApi = (item: IPopupMenuItem): IPopupMenuItemApi => ({
        select: () => select(item),
        close: onClose,
    });

    const defaultItem = (item: IPopupMenuItem) => (
        <div key={item.key}
            className={cm(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM)}
            role="menuitem"
            tabIndex={-1}
            aria-disabled={item.disabled || undefined}
            onClick={(event) => { select(item); event.stopPropagation(); }}
        >
            {item.content ?? (<>
                {item.icon}
                {item.label}
            </>)}
        </div>
    );

    const menu = (
        <div
            ref={containerRef}
            className={cm(CLASSES.FLEXLAYOUT__POPUP_MENU_CONTAINER)}
            style={computePosition(anchorToRect(anchor), container.getBoundingClientRect())}
        >
            <div
                ref={menuRef}
                className={cm(CLASSES.FLEXLAYOUT__POPUP_MENU)}
                role="menu"
                aria-label={title}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                data-layout-path="/popup-menu"
            >
                {items.map((entry, i) =>
                    entry.type === "divider" ? (
                        <div key={entry.key} className={cm(CLASSES.FLEXLAYOUT__POPUP_MENU_DIVIDER)} role="separator" />
                    ) : renderItem ? (
                        renderItem(entry, i, itemApi(entry))
                    ) : (
                        defaultItem(entry)
                    ),
                )}
            </div>
        </div>
    );

    return createPortal(menu, container);
};

/**
 * Imperatively show a {@link PopupMenu} (e.g. from a context-menu / right-click handler). Mounts
 * the menu in its own React root and returns an idempotent hide handle; the menu also closes on
 * selection, Escape/Tab and outside click.
 * @category Components
 * @group Popup Menu
 */
export function showPopupMenu(props: IPopupMenuProps): () => void {
    const container = resolveContainer(props);
    // snapshot an element anchor to a DOMRect NOW, while the trigger is live and laid out. the menu
    // renders in its own (deferred) react root, by which point a re-render of the opener could have
    // detached the element - measuring it then returned 0,0, which in a popout window (whose layout
    // root sits at the viewport origin) placed the menu at 0,0 instead of over the trigger.
    const anchor = isElementAnchor(props.anchor) ? props.anchor.getBoundingClientRect() : props.anchor;
    const host = container.ownerDocument.createElement("div");
    container.appendChild(host);
    const root = createRoot(host);

    let hidden = false;
    const hide = () => {
        if (hidden) {
            return; // reachable from select / escape / tab / outside click / caller
        }
        hidden = true;
        root.unmount();
        host.remove();
        props.onClose();
    };

    root.render(<PopupMenu {...props} anchor={anchor} container={container} onClose={hide} />);
    return hide;
}

/**
 * The internal tab-overflow menu, built on the generic {@link PopupMenu}. Renders each hidden tab
 * as a {@link TabButtonStamp}, supports dragging a tab out of the menu, highlights the selected
 * tab, and shows the drag overlay while open (so drag-out works over iframes).
 * @internal
 */
export function showOverflowMenu(
    triggerElement: HTMLElement,
    parentNode: TabSetNode | BorderNode,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
    controller: LayoutController,
    onHidden?: () => void, // notified when the menu closes, so the trigger can reset aria-expanded
): () => void {
    const cm = controller.getClassName;
    const menuItems: IPopupMenuItem[] = items.map((it) => ({ key: it.node.getId() }));

    // drag-out over embedded iframes needs the overlay covering all windows
    controller.showOverlayOnAllWindows(true);

    const renderItem = (item: IPopupMenuItem, i: number, api: IPopupMenuItemApi) => {
        const it = items[i];
        let classes = cm(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM);
        if (parentNode.getSelected() === it.index) {
            classes += " " + cm(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM__SELECTED);
        }
        return (
            <div key={item.key}
                className={classes}
                role="menuitem"
                aria-label={it.node.getNameForOverflowMenu()}
                tabIndex={-1}
                data-layout-path={"/popup-menu/tb" + i}
                onClick={(event) => { api.select(); event.stopPropagation(); }}
                draggable={true}
                onDragStart={(event) => {
                    event.stopPropagation(); // prevent starting a tabset drag as well
                    controller.getDragDropManager().setDragNode(event.nativeEvent, it.node);
                    setTimeout(() => api.close(), 0);
                }}
                onDragEnd={() => controller.getDragDropManager().onDragEnded()}
                title={it.node.getHelpText()}
            >
                <TabButtonStamp tabNode={it.node} controller={controller} />
            </div>
        );
    };

    return showPopupMenu({
        anchor: triggerElement,
        container: controller.getRootDiv() ?? undefined,
        classNameMapper: cm,
        returnFocusTo: triggerElement,
        title: controller.i18nName(I18nLabel.Overflow_Menu_Tooltip), // the menu's accessible name
        items: menuItems,
        onSelect: (item) => {
            const idx = menuItems.indexOf(item);
            if (idx >= 0) {
                onSelect(items[idx]);
            }
        },
        renderItem,
        onClose: () => {
            controller.showOverlayOnAllWindows(false);
            onHidden?.();
        },
    });
}    

PopupMenu.displayName = 'PopupMenu'; // name in react dev tools

