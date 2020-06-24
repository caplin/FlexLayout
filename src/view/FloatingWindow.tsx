import * as React from "react";
import {createPortal} from "react-dom";
import Rect from "../Rect";

export interface IFloatingWindowProps {
    title: string;
    id: string;
    url: string;
    rect: Rect;
    onCloseWindow: (id: string) => void;
    onSetWindow: (id: string, window: Window) => void;
}

export interface IFloatingWindowState {
    content?: HTMLElement;
}

export default class FloatingWindow extends React.Component<IFloatingWindowProps, IFloatingWindowState> {
    private window?: Window;

    constructor(props: IFloatingWindowProps) {
        super(props);
        this.window = undefined;
        this.state = {content: undefined};
    }

    componentDidMount() {
        const r = this.props.rect;
        const popupWindow = window.open(this.props.url, this.props.title, `left=${r.x},top=${r.y},width=${r.width},height=${r.height}`);
        if (popupWindow !== null) {
            this.window = popupWindow;
            this.props.onSetWindow(this.props.id, popupWindow);

            // listen for parent unloading to remove all popups
            window.addEventListener("beforeunload", () => {
                if (this.window) {
                    this.window.close();
                    this.window = undefined;
                }
            });

            // listen for popup unloading
            popupWindow.addEventListener("beforeunload", () => {
                this.props.onCloseWindow(this.props.id);
            });

            popupWindow.addEventListener("load", () => {
                const popupDocument = popupWindow.document;
                popupDocument.title = this.props.title;
                const content = popupDocument.createElement("div");
                content.className = "flexlayout__floating_window_content";
                popupDocument.body.appendChild(content);
                copyStyles(popupDocument);
                this.setState({content});
            });
        } else {
            console.warn(`Unable to open window ${this.props.url}`);
            this.props.onCloseWindow(this.props.id);
        }
    }

    componentWillUnmount() {
        // delay so refresh will close window
        setTimeout(() => {
            if (this.window) {
                this.window.close();
                this.window = undefined;
            }
        }, 0);
    }

    render() {
        if (this.state.content !== undefined) {
            return createPortal(this.props.children, this.state.content!);
        } else {
            return null;
        }
    }
}

function copyStyles(doc: Document) {
    const head = doc.head;
    Array.from(window.document.styleSheets).forEach(styleSheet => {
        if (styleSheet.href) { // prefer links since they will keep paths to images etc
            let styleElement = doc.createElement('link');
            styleElement.type = styleSheet.type;
            styleElement.rel = 'stylesheet';
            styleElement.href = styleSheet.href!;
            head.appendChild(styleElement);
        } else {
            try {
                const rules = styleSheet.cssRules;
                const style = doc.createElement('style');
                Array.from(rules).forEach(cssRule => {
                    style.appendChild(doc.createTextNode(cssRule.cssText));
                });
                head.appendChild(style);
            } catch (e) { // styleSheet.cssRules can thro security exception
            }
        }
    });
}
