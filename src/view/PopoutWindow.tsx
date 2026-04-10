import * as React from "react";
import { createPortal } from "react-dom";
import { CLASSES } from "./CSSClassNames";
import { LayoutController } from "./layout/LayoutInternal";
import { Layout } from "../model/Layout";

/** @internal */
export interface IPopoutWindowProps {
    title: string;
    controller: LayoutController;
    layout: Layout;
    url: string;
    onCloseLayout: (layout: Layout) => void;
    onSetWindow: (layout: Layout, window: Window) => void;
}

/** @internal */
export const PopoutWindow = (props: React.PropsWithChildren<IPopoutWindowProps>) => {
    const { title, controller, layout, url, onCloseLayout, onSetWindow: onSetLayout, children } = props; 
    const popoutWindow = React.useRef<Window>(null);
    const [content, setContent] = React.useState<HTMLElement | undefined>(undefined);
    const [firstRender, setFirstRender] = React.useState<boolean>(true);
    // map from main docs style -> this docs equivalent style
    const styleMap = new Map<HTMLElement, HTMLElement>();       

    React.useLayoutEffect(() => {
        if (!popoutWindow.current) { // only create window once, even in strict mode
            const layoutId = layout.getLayoutId();
            const rect = layout.getRect();
            
            popoutWindow.current = window.open(url, layoutId, `left=${rect.x},top=${rect.y},width=${rect.width},height=${rect.height}`);

            if (popoutWindow.current) {
                onSetLayout(layout, popoutWindow.current);

                // listen for parent unloading to remove all popouts
                window.addEventListener("beforeunload", () => {
                    if (popoutWindow.current) {
                        const closedWindow = popoutWindow.current;
                        popoutWindow.current = null; // need to set to null before close, since this will trigger popup window before unload...
                        closedWindow.close();
                    }
                });

                popoutWindow.current.addEventListener("load", () => {
                    if (popoutWindow.current) {
                        popoutWindow.current.focus();

                        // note: resizeto must be before moveto in chrome otherwise the window will end up at 0,0
                        popoutWindow.current.resizeTo(rect.width, rect.height);
                        popoutWindow.current.moveTo(rect.x, rect.y);

                        const popoutDocument = popoutWindow.current.document;
                        popoutDocument.title = title;
                        const popoutContent = popoutDocument.createElement("div");
                        popoutContent.className = CLASSES.FLEXLAYOUT__FLOATING_WINDOW_CONTENT;
                        popoutDocument.body.appendChild(popoutContent);
                        copyStyles(popoutDocument, styleMap).then(() => {
                            setContent(popoutContent); // re-render once link styles loaded
                        });

                        // listen for style mutations
                        const observer = new MutationObserver((mutationsList: MutationRecord[]) => handleStyleMutations(mutationsList, popoutDocument, styleMap));
                        observer.observe(document.head, { childList: true });

                        // listen for popout unloading (needs to be after load for safari)
                        popoutWindow.current.addEventListener("beforeunload", () => {
                            if (popoutWindow.current) {
                                onCloseLayout(layout); // remove the layout in the model
                                popoutWindow.current = null;
                                observer.disconnect();
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
            // only close popoutWindow if layoutId has been removed from the model (ie this was due to model change)
            if (!controller.getModel().getLayouts().has(layout.getLayoutId())) {
                popoutWindow.current?.close();
                popoutWindow.current = null;
            }
        }
    }, []);

    React.useEffect(() => {
        if (content !== undefined && firstRender) {
            controller.redrawLayout();
            setFirstRender(false);
        }
    }, [content, firstRender, controller]);

    if (content !== undefined) {
        return createPortal(children, content!);
    } else {
        return null;
    }
};

function handleStyleMutations(mutationsList: MutationRecord[], popoutDocument: Document, styleMap: Map<HTMLElement, HTMLElement>) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for (const addition of mutation.addedNodes) {
                if (addition instanceof HTMLLinkElement || addition instanceof HTMLStyleElement) {
                    copyStyle(popoutDocument, addition, styleMap);
                }
            }
            for (const removal of mutation.removedNodes) {
                if (removal instanceof HTMLLinkElement || removal instanceof HTMLStyleElement) {
                    const popoutStyle = styleMap.get(removal);
                    if (popoutStyle) {
                        popoutDocument.head.removeChild(popoutStyle);
                    }
                }
            }
        }
    }
};



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
                linkElement.onload = () => resolve(true);
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
