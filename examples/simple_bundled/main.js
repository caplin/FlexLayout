import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "../../src/index.js";

var json = {
    global: {},
    layout: {
        "type": "row",
        "weight": 100,
        "children": [
            {
                "type": "tabset",
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "FX",
                        "component": "button"
                    }
                ]
            },
            {
                "type": "tabset",
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "FI",
                        "component": "button"
                    }
                ]
            }
        ]
    }
};

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {model: FlexLayout.Model.fromJson(json)};
    }

    factory(node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    }

    render() {
        return (
            <FlexLayout.Layout
                model={this.state.model}
                factory={this.factory.bind(this)}/>
        )
    }
}

ReactDOM.render(<Main/>, document.getElementById("container"));

