import * as React from "react";
import { BorderNode } from "../../model/BorderNode";
import { IJsonTabNode } from "../../model/IJsonModel";
import { Node } from "../../model/Node";
import { TabNode } from "../../model/TabNode";
import { TabSetNode } from "../../model/TabSetNode";

export type DragRectRenderCallback = (
    content: React.ReactNode | undefined,
    node?: Node,
    json?: IJsonTabNode
) => React.ReactNode | undefined;

export type NodeMouseEvent = (
    node: TabNode | TabSetNode | BorderNode,
    event: React.MouseEvent<HTMLElement, MouseEvent>
) => void;

export type ShowOverflowMenuCallback = (
    node: TabSetNode | BorderNode,
    mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
) => void;

export type TabSetPlaceHolderCallback = (node: TabSetNode) => React.ReactNode;

export interface ITabSetRenderValues {
    /** a component to be placed before the tabs */
    leading: React.ReactNode;
    /** components that will be added after the tabs */
    stickyButtons: React.ReactNode[];
    /** components that will be added at the end of the tabset */
    buttons: React.ReactNode[];
    /** position to insert overflow button within [...stickyButtons, ...buttons]
     * if left undefined position will be after the sticky buttons (if any) 
     */
    overflowPosition: number | undefined;
}

export interface ITabRenderValues {
    /** the icon or other leading component */
    leading: React.ReactNode;
    /** the main tab text/component */
    content: React.ReactNode;
    /** a set of react components to add to the tab after the content */
    buttons: React.ReactNode[];
}

export interface IIcons {
    close?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    closeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    popout?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    popoutFloat?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    maximize?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    restore?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    more?: (React.ReactNode | ((tabSetNode: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => React.ReactNode));
    edgeArrow?: React.ReactNode;
    activeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    closeFloatPopout?: (React.ReactNode | (() => React.ReactNode));
}

