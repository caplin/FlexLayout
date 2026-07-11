import * as React from "react";
import { createPortal } from "react-dom";
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { Layout } from "../model/Layout";

// fallback so a stylesheet that never fires load/error (blocked, hung) cannot permanently
// stall the popout from rendering its content
const STYLE_LOAD_TIMEOUT_MS = 2000;

/** @internal */
export interface IPopoutWindowProps {
    title: string;
    controller: LayoutController;
    layout: Layout;
    url: string;
    onCloseLayout: (layout: Layout) => void;
}

/** @internal */
export const PopoutWindow = (props: React.PropsWithChildren<IPopoutWindowProps>) => {
        
    const { title, controller, layout, url, onCloseLayout, children } = props;
    const popoutWindow = React.useRef<Window>(null);
    const [content, setContent] = React.useState<HTMLElement | undefined>(undefined);
    // map from main docs style -> this docs equivalent style
    const styleMap = React.useMemo(() => new Map<HTMLElement, HTMLElement>(), []);

    const initializedRef = React.useRef(false);
    const observerRef = React.useRef<MutationObserver | null>(null);


    React.useLayoutEffect(() => {
        if (!initializedRef.current && content) {
            initializedRef.current = true;
            controller.redrawLayout();
        }
    }, [content, controller]);

    React.useLayoutEffect(() => {
        // listen for parent unloading to remove all popouts
        const onMainWindowBeforeUnload = () => {
            if (popoutWindow.current) {
                const closedWindow = popoutWindow.current;
                popoutWindow.current = null; // need to set to null before close, since this will trigger popup window before unload...
                closedWindow.close();
            }
        };

        if (!popoutWindow.current) { // only create window once, even in strict mode
            const layoutId = layout.getLayoutId();
            const rect = layout.getRect();

            popoutWindow.current = window.open(url, layoutId, `left=${rect.x},top=${rect.y},width=${rect.width},height=${rect.height}`);

            if (popoutWindow.current) {

                window.addEventListener("beforeunload", onMainWindowBeforeUnload);

                popoutWindow.current.addEventListener("load", () => {
                    if (popoutWindow.current) {
                        popoutWindow.current.focus();

                        // note: resizeto must be before moveto in chrome otherwise the window will end up at 0,0
                        popoutWindow.current.resizeTo(rect.width, rect.height);
                        popoutWindow.current.moveTo(rect.x, rect.y);

                        // converge on the metrics used when saving (screenLeft/Top, outerWidth/Height):
                        // browsers disagree on the reference points of resizeTo/moveTo, so correct by the
                        // reported difference - save/restore cycles then cannot drift
                        const win = popoutWindow.current;
                        win.resizeBy(rect.width - win.outerWidth, rect.height - win.outerHeight);
                        win.moveBy(rect.x - win.screenLeft, rect.y - win.screenTop);

                        const popoutDocument = popoutWindow.current.document;
                        popoutDocument.title = title;
                        // carry over the language/direction so assistive technology in the popout
                        // announces content correctly
                        if (document.documentElement.lang) {
                            popoutDocument.documentElement.lang = document.documentElement.lang;
                        }
                        if (document.documentElement.dir) {
                            popoutDocument.documentElement.dir = document.documentElement.dir;
                        }
                        const popoutContent = popoutDocument.createElement("div");
                        popoutContent.className = CLASSES.FLEXLAYOUT__FLOATING_WINDOW_CONTENT;
                        popoutDocument.body.appendChild(popoutContent);
                        copyStyles(popoutDocument, styleMap).then(() => {
                            setContent(popoutContent); // re-render once link styles loaded
                        });

                        // listen for style mutations. subtree + characterData so we also catch
                        // css-in-js libraries (styled-components, emotion) mutating the text of an
                        // existing <style> in place - a childList-only observer would miss those and
                        // leave the popout with stale styles. (rules inserted purely via the CSSOM
                        // sheet.insertRule api are not observable by MutationObserver at all.)
                        observerRef.current = new MutationObserver((mutationsList: MutationRecord[]) => handleStyleMutations(mutationsList, popoutDocument, styleMap));
                        observerRef.current.observe(document.head, { childList: true, subtree: true, characterData: true });

                        // listen for popout unloading (needs to be after load for safari)
                        popoutWindow.current.addEventListener("beforeunload", () => {
                            if (popoutWindow.current) {
                                onCloseLayout(layout); // remove the layout in the model
                                popoutWindow.current = null;
                                observerRef.current?.disconnect();
                                observerRef.current = null;
                            }
                        });
                    }
                });
            } else {
                console.warn(`Unable to open window ${url}`);
                onCloseLayout(layout); // remove the layout in the model
            }
        }
        return () => {
            window.removeEventListener("beforeunload", onMainWindowBeforeUnload);
            popoutWindow.current?.close();
            popoutWindow.current = null;
            observerRef.current?.disconnect();
            observerRef.current = null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    if (content !== undefined) {
        return createPortal(children, content!);
    } else {
        return null;
    }
};

function handleStyleMutations(mutationsList: MutationRecord[], popoutDocument: Document, styleMap: Map<HTMLElement, HTMLElement>) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target === document.head) {
            // style/link nodes added to or removed from the head
            for (const addition of mutation.addedNodes) {
                if (addition instanceof HTMLLinkElement || addition instanceof HTMLStyleElement) {
                    copyStyle(popoutDocument, addition, styleMap);
                }
            }
            for (const removal of mutation.removedNodes) {
                if (removal instanceof HTMLLinkElement || removal instanceof HTMLStyleElement) {
                    const popoutStyle = styleMap.get(removal);
                    if (popoutStyle) {
                        popoutStyle.remove();
                        styleMap.delete(removal);
                    }
                }
            }
        } else {
            // a mutation inside an existing <style> (css-in-js updating its text): re-sync the
            // owning style's current text into its clone in the popout
            const styleElement = findOwningStyle(mutation.target);
            const clone = styleElement && styleMap.get(styleElement);
            if (styleElement && clone) {
                clone.textContent = styleElement.textContent;
            }
        }
    }
};

/** @internal */
function findOwningStyle(node: Node): HTMLStyleElement | undefined {
    let el: Node | null = node instanceof HTMLElement ? node : node.parentNode;
    while (el && !(el instanceof HTMLStyleElement)) {
        el = el.parentNode;
    }
    return el instanceof HTMLStyleElement ? el : undefined;
}



/** @internal */
function copyStyles(popoutDoc: Document, styleMap: Map<HTMLElement, HTMLElement>): Promise<boolean[]> {
    const promises: Promise<boolean>[] = [];
    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]') as NodeListOf<HTMLElement>
    for (const element of styleElements) {
        copyStyle(popoutDoc, element, styleMap, promises);
    }
    return Promise.all(promises);
}

/** @internal */
function copyStyle(popoutDoc: Document, element: HTMLElement, styleMap: Map<HTMLElement, HTMLElement>, promises?: Promise<boolean>[]) {
    if (element instanceof HTMLLinkElement) {
        // prefer links since they will keep paths to images etc
        const linkElement = element.cloneNode(true) as HTMLLinkElement;
        popoutDoc.head.appendChild(linkElement);
        styleMap.set(element, linkElement);

        if (promises) {
            promises.push(new Promise((resolve) => {
                // resolve on error and after a timeout as well as on load: if a stylesheet is
                // blocked (CSP/adblock), 404s, or never fires load, the aggregate promise must
                // still settle - otherwise setContent is never called and the popout stays blank
                let settled = false;
                const done = (loaded: boolean) => {
                    if (!settled) {
                        settled = true;
                        resolve(loaded);
                    }
                };
                linkElement.onload = () => done(true);
                linkElement.onerror = () => done(false);
                popoutDoc.defaultView?.setTimeout(() => done(false), STYLE_LOAD_TIMEOUT_MS);
            }));
        }
    } else if (element instanceof HTMLStyleElement) {
        try {
            const styleElement = element.cloneNode(true) as HTMLStyleElement;
            popoutDoc.head.appendChild(styleElement);
            styleMap.set(element, styleElement);
        } catch (e) {
            // can throw an exception
        }
    }
}

PopoutWindow.displayName = 'PopoutWindow'; // name in react dev tools

