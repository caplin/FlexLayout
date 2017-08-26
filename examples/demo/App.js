import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "../../src/index.js";
import Utils from "./Utils.js";

var fields = ["Name", "ISIN", "Bid", "Ask", "Last", "Yield"];

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {layoutFile:null, model: null, adding: false};

        // save layout when unloading page
        window.onbeforeunload = function (event) {
            this.save();
        }.bind(this);

    }

    componentDidMount() {
        this.loadLayout("default", false);
    }

    save() {
        var jsonStr = JSON.stringify(this.state.model.toJson(), null, "\t");
        localStorage.setItem(this.state.layoutFile, jsonStr);
    }

    loadLayout(layoutName, reload) {
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

    load(jsonText) {
        let json = JSON.parse(jsonText);
        let model = FlexLayout.Model.fromJson(json);

        // you can control where nodes can be dropped
        //model.setOnAllowDrop(this.allowDrop.bind(this));

        this.setState({layoutFile: this.loadingLayoutName, model: model});
    }

    allowDrop(dragNode, dropInfo) {
        let dropNode = dropInfo.node;

        // prevent non-border tabs dropping into borders
        if (dropNode.getType() == "border" && (dragNode.getParent() == null || dragNode.getParent().getType() != "border"))
            return false;

        // prevent border tabs dropping into main layout
        if (dropNode.getType() != "border" && (dragNode.getParent() != null && dragNode.getParent().getType() == "border"))
            return false;

        return true;
    }

    error(reason) {
        alert("Error loading json config file: " + this.loadingLayoutName + "\n" + reason);
    }

    onAddClick(event) {
        this.refs.layout.addTabWithDragAndDropIndirect("Add grid<br>(Drag to location)", {
            component: "grid",
            name: "a new grid"
        }, this.onAdded.bind(this));
        this.setState({adding: true});
    }

    onShowLayoutClick(event) {
        console.log(JSON.stringify(this.state.model.toJson(),null, "\t"));
    }

    onAdded() {
        this.setState({adding: false});
    }

    factory(node) {
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

            return <SimpleTable fields={fields} data={node.getExtraData().data}/>;
        }
        else if (component === "sub") {
            var model = node.getExtraData().model;
            if (model == null) {
                node.getExtraData().model = FlexLayout.Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                // save submodel on save event
                node.setEventListener("save", function(p) {
                        node.getConfig().model = node.getExtraData().model.toJson();
                    }
                );
            }

            return <FlexLayout.Layout model={model} factory={this.factory.bind(this)}/>;
        }
        else if (component === "text") {
            return <div dangerouslySetInnerHTML={{__html:node.getConfig().text}}/>;
        }
    }

    onSelectLayout(event) {
        this.loadLayout(event.target.value);
    }

    onReloadFromFile(event)
    {
        this.loadLayout(this.state.layoutFile, true);
    }

    render() {
        var onRenderTab = function (node, renderValues) {
            //renderValues.content += " *";
        };

        var onRenderTabSet = function (node, renderValues) {
            //renderValues.headerContent = "-- " + renderValues.headerContent + " --";
            //renderValues.buttons.push(<img src="images/grey_ball.png"/>);
        };

        let contents = "loading ...";
        if (this.state.model !== null) {
            contents = <FlexLayout.Layout
                ref="layout"
                model={this.state.model}
                factory={this.factory.bind(this)}
                    onRenderTab={onRenderTab}
                onRenderTabSet={onRenderTabSet}/>;
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
                <button disabled={this.state.adding} style={{float:"right"}} onClick={this.onAddClick.bind(this)}>Add</button>
                <button style={{float:"right"}} onClick={this.onShowLayoutClick.bind(this)}>Show Layout JSON in Console</button>
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
            var rec = {};
            rec.Name = this.randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            rec.ISIN = rec.Name + this.randomString(7, "1234567890");
            for (var j = 2; j < fields.length; j++) {
                rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2);
            }
            data.push(rec);
        }
        return data;
    }

    randomString(len, chars) {
        var a = [];
        for (var i = 0; i < len; i++) {
            a.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        return a.join("");
    }
}

class SimpleTable extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        var headercells = this.props.fields.map(function (field) {
            return <th key={field}>{field}</th>;
        });

        var rows = [];
        for (var i = 0; i < this.props.data.length; i++) {
            var row = this.props.fields.map(field => <td key={field}>{this.props.data[i][field]}</td>);
            rows.push(<tr key={i}>{row}</tr>);
        }

        return <table className="simple_table">
            <tbody>
            <tr>{headercells}</tr>
            {rows}
            </tbody>
        </table>;
    }
}

ReactDOM.render(<App/>, document.getElementById("container"));