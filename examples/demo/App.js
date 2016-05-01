import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "../../src/index.js";
import Utils from "./Utils.js";

var fields = ["Name", "ISIN", "Bid", "Ask", "Last", "Yield"];

class App {
    constructor(containerElement) {
        console.log("available query parameters: ?layout=<name>&reload=true");

        this.containerElement = containerElement;
        this.layoutFile = "default";

        this.params = Utils.getQueryParams();
        if (this.params["layout"]) {
            this.layoutFile = this.params["layout"];
        }

        if (this.params["reload"]) {
            Utils.downloadFile("layouts/" + this.layoutFile + ".layout", this.load.bind(this), this.error.bind(this));
        }
        else {
            var json = localStorage.getItem(this.layoutFile);
            if (json != null) {
                this.load(json);
            }
            else {
                Utils.downloadFile("layouts/" + this.layoutFile + ".layout", this.load.bind(this), this.error.bind(this));
            }
        }
    }

    load(jsonText) {
        this.json = JSON.parse(jsonText);
        ReactDOM.render(<Main initialJson={this.json} layoutFile={this.layoutFile}/>, this.containerElement);
    }

    error(reason) {
        alert("Error loading json config file: " + this.layoutFile + "\n" + reason);
    }
}

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {json: this.props.initialJson, adding: false, zoom: false};
        this.nodeStateMap = {};

        // save layout when unloading page
        window.onbeforeunload = function (event) {
            var jsonStr = JSON.stringify(this.state.json, null, "\t");
            localStorage.setItem(this.props.layoutFile, jsonStr);
        }.bind(this);
    }

    onZoomClick(event) // expand tabs and splitters for easier selection on mobile devices!
    {
        var zoom = !this.state.zoom;
        this.setState({zoom: zoom});
        this.onAction(FlexLayout.Actions.updateModelAttributes({
            splitterSize: zoom ? 40 : 8,
            tabSetHeaderHeight: zoom ? 40 : 20,
            tabSetTabStripHeight: zoom ? 40 : 20
        }));
    }

    onAddClick(event) {
        this.refs.layout.addTabWithDragAndDropIndirect("Add grid<br>(Drag to location)", {
            component: "grid",
            name: "a new grid"
        }, this.onAdded.bind(this));
        this.setState({adding: true});
    }

    onAdded() {
        this.setState({adding: false});
    }

    onAction(action) {
        this.setState({json: FlexLayout.Model.apply(action, this.state.json)});
    }

    factory(node) {
        var component = node.getComponent();
        var nodeState = this.nodeStateMap[node.getId()];

        if (component === "grid") {
            if (nodeState === undefined) {
                nodeState = this.makeFakeData();
                this.nodeStateMap[node.getId()] = nodeState;
            }

            return <SimpleTable fields={fields} data={nodeState}/>;
        }
        else if (component === "sub")
        {
            if (nodeState === undefined) {
                nodeState = FlexLayout.Model.fromJson(node.getConfig().model);
                //console.log(JSON.stringify(nodeState.toJson(), null, "\t"));
                this.nodeStateMap[node.getId()] = nodeState;
            }
            return <FlexLayout.Layout id={"sub:" + node.getId()} model={nodeState} factory={this.factory.bind(this)}/>;
        }
    }

    render() {
        var onRenderTab = function (node, renderValues) {
            //renderValues.content += " *";
        };

        var onRenderTabSet = function (node, renderValues) {
            //renderValues.headerContent = "-- " + renderValues.headerContent + " --";
            //renderValues.buttons.push(<img src="images/grey_ball.png"/>);
        };

        //var message  = (this.state.adding)?<div style={{float:"right"}}>Click on location for new tab</div>:null;
        return <div className="app">
            <div className="toolbar">
                <button disabled={this.state.adding} style={{float:"right"}} onClick={this.onAddClick.bind(this)}>Add
                </button>
                <button disabled={this.state.adding} style={{float:"right"}} onClick={this.onZoomClick.bind(this)}>Zoom
                    Toggle
                </button>
            </div>
            <div className="contents">
                <FlexLayout.Layout
                        ref="layout"
                        id="main"
                        model={this.state.json}
                        factory={this.factory.bind(this)}
                        onAction={this.onAction.bind(this)}
                        onRenderTab={onRenderTab}
                        onRenderTabSet={onRenderTabSet}/>
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

new App(document.getElementById("container"));
