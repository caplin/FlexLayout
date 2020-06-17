import * as React from "react";
import {createPortal} from "react-dom";
import Rect from "../Rect";

export interface IFloatingWindowProps {
    title: string;
    id: string;
    url: string;
    rect: Rect;
    onCloseWindow: (id:string) => void;
    onSetWindow: (id:string, window: Window) => void;
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
        const newWindow = window.open(this.props.url, this.props.title, `left=${r.x},top=${r.y},width=${r.width},height=${r.height}`);
        if (newWindow !== null) {
            this.props.onSetWindow(this.props.id, newWindow);
            window.addEventListener("beforeunload", () => {
                this.props.onCloseWindow(this.props.id);
            });
            this.window = newWindow;
            newWindow.addEventListener("load", () => {
                this.window!.document.title = this.props.title;
                this.window!.addEventListener("beforeunload", () => {
                    this.props.onCloseWindow(this.props.id);
                });
                const content = this.window!.document.querySelector("#content") as HTMLElement;
                this.setState({content});
            });
        }
    }

    componentWillUnmount() {
        // delay so refresh will close window
        setTimeout(()=> {
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
