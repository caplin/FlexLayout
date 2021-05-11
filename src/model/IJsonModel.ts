import { ICloseType } from './ICloseType';

type TabLocationVertical = "top" | "bottom";
type TabLocationHorizontal = "left" | "right";
type TabLocation = TabLocationHorizontal | TabLocationVertical;

interface IJsonModelGlobalSettings {
 splitterSize?: number; // default:  8  width in pixels of all splitters between tabsets/borders
 enableEdgeDock?: boolean; // default:  true
 tabEnableClose?: boolean; // default:  true  allow user to close all tabs via close button
 tabCloseType?: ICloseType; // default:  1  see values in ICloseType
 tabEnableDrag?: boolean; // default:  true  allow user to drag all tabs to new location
 tabEnableRename?: boolean; // default:  true  allow user to rename all tabs by double clicking
 tabEnableFloat?: boolean; // default:  false  enable popouts in all tabs (in popout capable browser)
 tabClassName?: string | null; // default:  null
 tabIcon?: string | null; // default:  null
 tabEnableRenderOnDemand?: boolean; // default:  true  whether to avoid rendering component until tab is visible
 tabDragSpeed?: number; // default:  0.3  CSS transition speed of drag outlines (in seconds)
 tabSetEnableDeleteWhenEmpty?: boolean; // default:  true
 tabSetEnableDrop?: boolean; // default:  true  allow user to drag tabs into all tabsets
 tabSetEnableDrag?: boolean; // default:  true  allow user to drag tabs out of all tabsets
 tabSetEnableDivide?: boolean; // default:  true  allow user to drag tabs to region of all tabsets, splitting into new tabset
 tabSetEnableMaximize?: boolean; // default:  true  allow user to maximize all tabsets to fill view via maximize button
 tabSetAutoSelectTab?: boolean; // default:  true  whether to select new/moved tabs in all tabsets
 tabSetClassNameTabStrip?: string | null; // default:  null  height in pixels of tab strips in all tabsets
 tabSetClassNameHeader?: string | null; // default:  null
 tabSetEnableTabStrip?: boolean; // default:  true  enable tab strip and allow multiple tabs in all tabsets
 tabSetHeaderHeight?: number; // default:  0  height of tabset header in pixels; if left as 0 then the value will be calculated from the current fontSize
 tabSetTabStripHeight?: number; // default:  0  height of tabset tab bar in pixels; if left as 0 then the value will be calculated from the current fontSize
 borderBarSize?: number; // default:  0  size of the border bars in pixels; if left as 0 then the value will be calculated from the current fontSize
 borderEnableDrop?: boolean; // default:  true  allow user to drag tabs into this border
 borderAutoSelectTabWhenOpen?: boolean; // default:  true  whether to select new/moved tabs in border when the border is already open
 borderAutoSelectTabWhenClosed?: boolean; // default:  false  whether to select new/moved tabs in border when the border is curently closed
 borderClassName?: string | null; // default:  null
 borderSize?: number; // default:  200  initial width in pixels for left/right borders, height for top/bottom borders
 borderMinSize?: number; // default:  0  minimum width in pixels for left/right borders, height for top/bottom borders
 tabSetMinHeight?: number; // default:  0  minimum width (in px) for all tabsets
 tabSetMinWidth?: number; // default:  0  minimum height (in px) for all tabsets
 tabSetTabLocation?: TabLocationVertical; // default:  top  show tabs in location top or bottom
}

interface IJsonModelTabNode {
 type: "tab";
 name: string; //  required  internal unique string identifying tab (for factory)
 component: string; //  required  string identifying which component to run (for factory)
 config?: Record<string, any> | null; //  default: null  a place to hold json config for the hosted component
 id?: string; //  default: auto generated
 enableClose?: boolean; //  default: inherited  allow user to close tab via close button
 closeType?: ICloseType; //  default: inherited  see values in ICloseType
 enableDrag?: boolean; //  default: inherited  allow user to drag tab to new location
 enableRename?: boolean; //  default: inherited  allow user to rename tabs by double clicking
 enableFloat?: boolean; //  default: inherited  enable popout (in popout capable browser)
 floating?: boolean; //  default: false
 className?: string; //  default: inherited
 icon?: string; //  default: inherited
 enableRenderOnDemand?: boolean; //  default: inherited  whether to avoid rendering component until tab is visible
}

interface IJsonModelDividerNode {
 type: "row" | "column";
 weight?: number; // default: 100
 width?: number | null; // default: null  preferred width in pixels
 height?: number | null; // default: null  preferred height in pixels
 children: (IJsonModelDividerNode | IJsonModelTabNode | IJsonModelTabSetNode)[];
}

interface IJsonModelTabSetNode {
 type: "tabset";
 active?: boolean;
 weight?: number; // default: 100  	relative weight for sizing of this tabset in parent row
 width?: number | null; // default: null  	preferred pixel width
 height?: number | null; // default: null  	preferred pixel height
 name?: string | null; // default: null  	named tabsets will show a header bar above the tabs
 selected?: number; // default: 0  	index of selected/visible tab in tabset
 maximized?: boolean; // default: false  	whether tabset is currently maximized to fill view
 id?: string; // default: auto generated
 children: IJsonModelTabNode[]; // required  	a list of tab nodes
 enableDeleteWhenEmpty?: boolean; // default: inherited
 enableDrop?: boolean; // default: inherited  	allow user to drag tabs into this tabset
 enableDrag?: boolean; // default: inherited  	allow user to drag tabs out this tabset
 enableDivide?: boolean; // default: inherited  	allow user to drag tabs to region of this tabset, splitting into new tabset
 enableMaximize?: boolean; // default: inherited  	allow user to maximize tabset to fill view via maximize button
 autoSelectTab?: boolean; // default: inherited  	whether to select new/moved tabs in tabset
 classNameTabStrip?: string; // default: inherited
 classNameHeader?: string; // default: inherited
 enableTabStrip?: boolean; // default: inherited  	enable tab strip and allow multiple tabs in this tabset
 headerHeight?: number; // default: inherited
 tabStripHeight?: number; // default: inherited  	height in pixels of tab strip
 tabLocation?: TabLocationVertical; // default: inherited  	show tabs in location top or bottom
 minHeight?: number; // default: inherited  	minimum width (in px) for this tabset
 minWidth?: number; // default: inherited  	minimum height (in px) for this tabset
}

interface IJsonModelBorderNode {
 type: "border";
 location: TabLocation;
 children: IJsonModelTabNode[];
}

interface IJsonModel {
 global?: IJsonModelGlobalSettings;
 borders?: IJsonModelBorderNode[];
 layout: IJsonModelTabNode | IJsonModelDividerNode | IJsonModelTabSetNode;
}

export default IJsonModel;
