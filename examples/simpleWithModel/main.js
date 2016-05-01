import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "../../src/index.js";

var json = {
    global: {},
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
                        "name": "FX",
                        "component": "button"
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
        this.state = {model: FlexLayout.Model.fromJson(json)}; // Model.fromJson(json) creates a mutable Model object
    }

    factory(node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    }

    render() {
        // pass a mutable Model object to the model prop, now layout will send actions
        // directly to to model to update the view
        return (
            <FlexLayout.Layout
                model={this.state.model}
                factory={this.factory.bind(this)}/>
        )
    }
}

ReactDOM.render(<Main/>, document.getElementById("container"));

