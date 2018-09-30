import * as React from "react";
import * as ReactDOM from "react-dom";
import * as FlexLayout from "../../src/index";
import Utils from "./Utils";
import { Node, TabSetNode, TabNode, DropInfo, BorderNode } from "../../src/index";

var fields = ["Name", "ISIN", "Bid", "Ask", "Last", "Yield"];

class App extends React.Component<any, { layoutFile: string | null, model: FlexLayout.Model | null, adding: boolean }> {

    loadingLayoutName?: string;

    constructor(props:any) {
        super(props);
        this.state = { layoutFile: null, model: null, adding: false };

        // save layout when unloading page
        window.onbeforeunload = (event:Event)=> {
            this.save();
        };

    }

    componentDidMount() {
        this.loadLayout("default", false);
    }

    save() {
        var jsonStr = JSON.stringify(this.state.model!.toJson(), null, "\t");
        localStorage.setItem(this.state.layoutFile!, jsonStr);
    }

    loadLayout(layoutName: string, reload?: boolean) {
        if (this.state.layoutFile !== null) {
            this.save();
        }

        this.loadingLayoutName = layoutName;
        let loaded = false;
        if (!reload) {
            var json = localStorage.getItem(layoutName);
            if (json != null) {
                this.load(json);
                loaded = true;
            }
        }

        if (!loaded) {
            Utils.downloadFile("layouts/" + layoutName + ".layout", this.load.bind(this), this.error.bind(this));
        }
    }

    load(jsonText:string) {
        let json = JSON.parse(jsonText);
        let model = FlexLayout.Model.fromJson(json);

        // you can control where nodes can be dropped
        //model.setOnAllowDrop(this.allowDrop.bind(this));

        this.setState({ layoutFile: this.loadingLayoutName!, model: model });
    }

    allowDrop(dragNode:(TabNode | TabSetNode), dropInfo:DropInfo) {
        let dropNode = dropInfo.node;

        // prevent non-border tabs dropping into borders
        if (dropNode.getType() == "border" && (dragNode.getParent() == null || dragNode.getParent()!.getType() != "border"))
            return false;

        // prevent border tabs dropping into main layout
        if (dropNode.getType() != "border" && (dragNode.getParent() != null && dragNode.getParent()!.getType() == "border"))
            return false;

        return true;
    }

    error(reason:string) {
        alert("Error loading json config file: " + this.loadingLayoutName + "\n" + reason);
    }

    onAddClick(event:Event) {
        if (this.state.model!.getMaximizedTabset() == null) {
            (this.refs.layout as FlexLayout.Layout).addTabWithDragAndDropIndirect("Add grid<br>(Drag to location)", {
                component: "grid",
                name: "a new grid"
            }, this.onAdded.bind(this));
            this.setState({ adding: true });
        }
    }

    onShowLayoutClick(event:Event) {
        console.log(JSON.stringify(this.state.model!.toJson(), null, "\t"));
    }

    onAdded() {
        this.setState({ adding: false });
    }

    onTableClick(node:Node, event:Event) {
        console.log("tab: \n" + node._toAttributeString());
        console.log("tabset: \n" + node.getParent()!._toAttributeString());
    }

    factory(node:TabNode) {
        // log lifecycle events
        //node.setEventListener("resize", function(p){console.log("resize");});
        //node.setEventListener("visibility", function(p){console.log("visibility");});
        //node.setEventListener("close", function(p){console.log("close");});

        var component = node.getComponent();

        if (component === "grid") {
            if (node.getExtraData().data == null) {
                // create data in node extra data first time accessed
                node.getExtraData().data = this.makeFakeData();
            }

            return <SimpleTable fields={fields} onClick={this.onTableClick.bind(this, node)} data={node.getExtraData().data} />;
        }
        else if (component === "sub") {
            var model = node.getExtraData().model;
            if (model == null) {
                node.getExtraData().model = FlexLayout.Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                // save submodel on save event
                node.setEventListener("save", (p:any) => {
                     this.state.model!.doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:{model:node.getExtraData().model.toJson()}}));
                    //  node.getConfig().model = node.getExtraData().model.toJson();
                }
                );
            }

            return <FlexLayout.Layout model={model} factory={this.factory.bind(this)} />;
        }
        else if (component === "text") {
            return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />;
        }

        return null;
    }

    onSelectLayout(event:React.FormEvent) {
        var target = event.target as HTMLSelectElement;
        this.loadLayout(target.value);
    }

    onReloadFromFile(event:Event) {
        this.loadLayout(this.state.layoutFile!, true);
    }

    onThemeChange(event:React.FormEvent) {
        var target = event.target as HTMLSelectElement;
        let flexlayout_stylesheet : any= window.document.getElementById("flexlayout-stylesheet");
        let index = flexlayout_stylesheet.href.lastIndexOf("/");
        let newAddress = flexlayout_stylesheet.href.substr(0,index);
        flexlayout_stylesheet.setAttribute("href", newAddress +"/" + target.value + ".css");
        let page_stylesheet = window.document.getElementById("page-stylesheet");
        page_stylesheet!.setAttribute("href", target.value + ".css");
        this.forceUpdate();
    }

    render() {
        var onRenderTab = function (node:TabNode, renderValues:any) {
            //renderValues.content += " *";
        };

        var onRenderTabSet = function (node:(TabSetNode|BorderNode), renderValues:any) {
            //renderValues.headerContent = "-- " + renderValues.headerContent + " --";
            //renderValues.buttons.push(<img src="images/grey_ball.png"/>);
        };

        let contents: React.ReactNode = "loading ...";
        if (this.state.model !== null) {
            contents = <FlexLayout.Layout
                ref="layout"
                model={this.state.model}
                factory={this.factory.bind(this)}
                onRenderTab={onRenderTab}
                onRenderTabSet={onRenderTabSet} 
                // classNameMapper={
                //     className => {
                //         console.log(className);
                //         if (className === "flexlayout__tab_button--selected") {
                //             className = "override__tab_button--selected";
                //         }
                //         return className;
                //     }
                // }
                />;
        }

        return <div className="app">
            <div className="toolbar">
                <select onChange={this.onSelectLayout.bind(this)}>
                    <option value="default">Default</option>
                    <option value="simple">Simple</option>
                    <option value="justsplitters">Just Splitters</option>
                    <option value="sub">SubLayout</option>
                    <option value="complex">Complex</option>
                    <option value="preferred">Using Preferred size</option>
                    <option value="trader">Trader</option>
                </select>
                <button onClick={this.onReloadFromFile.bind(this)}>reload from file</button>
                <button disabled={this.state.adding} style={{ float: "right" }} onClick={this.onAddClick.bind(this)}>Add</button>
                <button style={{ float: "right" }} onClick={this.onShowLayoutClick.bind(this)}>Show Layout JSON in Console</button>
                <select style={{ float: "right" }} onChange={this.onThemeChange.bind(this)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
            <div className="contents">
                {contents}
            </div>
        </div>;
    }

    makeFakeData() {
        var data = [];
        var r = Math.random() * 50;
        for (var i = 0; i < r; i++) {
            var rec: { [key: string]: any; } = {};
            rec.Name = this.randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            rec.ISIN = rec.Name + this.randomString(7, "1234567890");
            for (var j = 2; j < fields.length; j++) {
                rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2);
            }
            data.push(rec);
        }
        return data;
    }

    randomString(len:number, chars:string) {
        var a = [];
        for (var i = 0; i < len; i++) {
            a.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        return a.join("");
    }
}

class SimpleTable extends React.Component<{ fields: any, data: any, onClick: any }, any> {
    shouldComponentUpdate() {
        return true;
    }

    render() {
        var headercells = this.props.fields.map(function (field:any) {
            return <th key={field}>{field}</th>;
        });

        var rows = [];
        for (var i = 0; i < this.props.data.length; i++) {
            var row = this.props.fields.map((field:any) => <td key={field}>{this.props.data[i][field]}</td>);
            rows.push(<tr key={i}>{row}</tr>);
        }

        return <table className="simple_table" onClick={this.props.onClick}>
            <tbody>
                <tr>{headercells}</tr>
                {rows}
            </tbody>
        </table>;
    }
}

ReactDOM.render(<App />, document.getElementById("container"));
