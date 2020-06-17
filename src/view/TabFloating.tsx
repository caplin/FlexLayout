import * as React from "react";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import {JSMap} from "../Types";
import Layout from "./Layout";
import {I18nLabel} from "../I18nLabel";

/** @hidden @internal */
export interface ITabFloatingProps {
    layout: Layout;
    selected: boolean;
    node: TabNode;
}

/** @hidden @internal */
export class TabFloating extends React.Component<ITabFloatingProps, any> {

    constructor(props: ITabFloatingProps) {
        super(props);
    }

    onMouseDown = () => {
        const parent = this.props.node.getParent() as TabSetNode;
        if (parent.getType() === TabSetNode.TYPE) {
            if (!parent.isActive()) {
                this.props.layout.doAction(Actions.setActiveTabset(parent.getId()));
            }
        }
    }

    onClickFocus = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        if (this.props.node.getWindow()) {
            this.props.node.getWindow()!.focus();
        }
    }

    onClickDock = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        this.props.layout.doAction(Actions.unFloatTab(this.props.node.getId()));
    }

    render() {
        const cm = this.props.layout.getClassName;

        const node = this.props.node;
        const parentNode = node.getParent() as TabSetNode;
        const style: JSMap<any> = node._styleWithPosition({
            display: this.props.selected ? "flex" : "none"
        });

        if (parentNode.isMaximized()) {
            style.zIndex = 100;
        }
        const message = this.props.layout.i18nName(I18nLabel.Floating_Window_Message);
        const showMessage = this.props.layout.i18nName(I18nLabel.Floating_Window_Show_Window);
        const dockMessage = this.props.layout.i18nName(I18nLabel.Floating_Window_Dock_Window);

        return (
            <div className={cm("flexlayout__tab_floating")}
                 onMouseDown={this.onMouseDown}
                 onTouchStart={this.onMouseDown}
                 style={style}>
                <div className={cm("flexlayout__tab_floating_inner")}>
                    <div>{message}</div>
                    <div><a href="#" onClick={this.onClickFocus}>{showMessage}</a></div>
                    <div><a href="#" onClick={this.onClickDock}>{dockMessage}</a></div>
                </div>
            </div>);
    }
}

