import * as React from "react";
import { createPortal } from "react-dom";
import { Rect } from "../Rect";
import { CLASSES } from "../Types";

/** @internal */
export interface IFloatingWindowProps {
    title: string;
    id: string;
    url: string;
    rect: Rect | null;
    onCloseWindow: (id: string) => void;
    onSetWindow: (id: string, window: Window) => void;
}

interface IStyleSheet {
    href: string | null;
    type: string;
    rules: string[] | null;
}

/** @internal */
export const FloatingWindow = (props: React.PropsWithChildren<IFloatingWindowProps>) => {
    const { title, id, url, rect, onCloseWindow, onSetWindow, children } = props;
    const popoutWindow = React.useRef<Window | null>(null);
    const timerId = React.useRef<any>(null);
    const [content, setContent] = React.useState<HTMLElement | undefined>(undefined);

    React.useLayoutEffect(() => {
        if (timerId.current) {
            clearTimeout(timerId.current);
        }
        let isMounted = true;
        const r = rect || new Rect(0, 0, 100, 100);
        // Make a local copy of the styles from the current window which will be passed into
        // the floating window. window.document.styleSheets is mutable and we can't guarantee
        // the styles will exist when 'popoutWindow.load' is called below.
        const styles = Array.from(window.document.styleSheets).reduce((result, styleSheet) => {
            let rules: CSSRuleList | undefined = undefined;
            try {
                rules = styleSheet.cssRules;
            } catch (e) {
                // styleSheet.cssRules can throw security exception
            }

            try {
                return [
                    ...result,
                    {
                        href: styleSheet.href,
                        type: styleSheet.type,
                        rules: rules ? Array.from(rules).map(rule => rule.cssText) : null,
                    }
                ];
            } catch (e) {
                return result;
            }
        }, [] as IStyleSheet[]);
        popoutWindow.current = window.open(url, id, `left=${r.x},top=${r.y},width=${r.width},height=${r.height}`);
        if (popoutWindow.current !== null) {
            onSetWindow(id, popoutWindow.current);

            // listen for parent unloading to remove all popouts
            window.addEventListener("beforeunload", () => {
                if (popoutWindow.current) {
                    popoutWindow.current.close();
                    popoutWindow.current = null;
                }
            });

            popoutWindow.current.addEventListener("load", () => {
                if (isMounted) {
                    const popoutDocument = popoutWindow.current!.document;
                    popoutDocument.title = title;
                    const popoutContent = popoutDocument.createElement("div");
                    popoutContent.className = CLASSES.FLEXLAYOUT__FLOATING_WINDOW_CONTENT;
                    popoutDocument.body.appendChild(popoutContent);
                    copyStyles(popoutDocument, styles).then(() => {
                        setContent(popoutContent);
                    });

                    // listen for popout unloading (needs to be after load for safari)
                    popoutWindow.current!.addEventListener("beforeunload", () => {
                        onCloseWindow(id);
                    });
                }
            });
        } else {
            console.warn(`Unable to open window ${url}`);
            onCloseWindow(id);
        }

        return () => {
            isMounted = false;
            // delay so refresh will close window
            timerId.current = setTimeout(() => {
                if (popoutWindow.current) {
                    popoutWindow.current.close();
                    popoutWindow.current = null;
                }
            }, 0);
        };
    }, []);

    if (content !== undefined) {
        return createPortal(children, content!);
    } else {
        return null;
    }
};

/** @internal */
function copyStyles(doc: Document, styleSheets: IStyleSheet[]): Promise<boolean[]> {
    const head = doc.head;
    const promises: Promise<boolean>[] = [];
    for (const styleSheet of styleSheets) {
        if (styleSheet.href) {
            // prefer links since they will keep paths to images etc
            const styleElement = doc.createElement("link");
            styleElement.type = styleSheet.type;
            styleElement.rel = "stylesheet";
            styleElement.href = styleSheet.href!;
            head.appendChild(styleElement);
            promises.push(
                new Promise((resolve) => {
                    styleElement.onload = () => resolve(true);
                })
            );
        } else {
            if (styleSheet.rules) {
                const style = doc.createElement("style");
                for (const rule of styleSheet.rules) {
                    style.appendChild(doc.createTextNode(rule));
                }
                head.appendChild(style);
            }
        }
    }
    return Promise.all(promises);
}
