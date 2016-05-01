import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "../../src/index.js";

var json = {
    global: {}, // {tabSetEnableTabStrip:false}, // to have just splitters
    layout: {
        "type": "row",
        "id": 1,
        "weight": 100,
        "children": [
            {
                "type": "tabset",
                "id": 2,
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "id": 3,
                        "name": "Things to try",
                        "component": "text",
                        "config": {"text": "<ul><li>drag tabs</li><li>drag splitters</li><li>double click on tab to rename</li><li>double click on tabstrip to maximize</li><li>use the Add button to add another tab</li></ul>"}
                    }
                ]
            },
            {
                "type": "tabset",
                "id": 4,
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "id": 5,
                        "name": "two",
                        "component": "text",
                        "config": {"text": ""}
                    }
                ]
            },
            {
                "type": "tabset",
                "id": 6,
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "id": 7,
                        "name": "three",
                        "component": "text",
                        "config": {"text": ""}
                    }
                ]
            }
        ]
    }
};

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {json: json};
    }

    factory(node) {
        var component = node.getComponent();
        if (component === "text") {
            return <div dangerouslySetInnerHTML={{__html:node.getConfig().text}}/>;
        }
    }

    onAdd(event) {
        this.refs.layout.addTabWithDragAndDropIndirect("Add panel<br>(Drag to location)", {
            component: "text",
            name: "added",
            config: {text: "i was added"}
        }, null);
    }

    onAction(action) {
        this.setState({json: FlexLayout.Model.apply(action, this.state.json)});
    }

    render() {
        return (
            <div className="outer">
                <button onClick={this.onAdd.bind(this)}>Add</button>
                <div className="inner">
                    <FlexLayout.Layout ref="layout"
                                       model={this.state.json}
                                       factory={this.factory.bind(this)}
                                       onAction={this.onAction.bind(this)}/>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Main/>, document.getElementById("container"));