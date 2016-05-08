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
        this.state = {json: json};
    }

    factory(node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    }

    onAction(action) {
        console.log(action);

        var newJson = FlexLayout.Model.apply(action, this.state.json);
        this.setState({json: newJson});

        console.log(JSON.stringify(newJson, null, "\t"));
    }

    render() {
        return (
            <FlexLayout.Layout model={this.state.json} factory={this.factory.bind(this)} onAction={this.onAction.bind(this)}/>
        );
    }
}

ReactDOM.render(<Main/>, document.getElementById("container"));
