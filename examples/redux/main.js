import React from "react";
import ReactDOM from "react-dom";
import * as Redux from "redux";
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

function reducer(state, action) {

    console.log(action);
    var newState = state;

    if (action.type.startsWith("FlexLayout_")) {
        var newLayoutJson = FlexLayout.Model.apply(action, state.layoutJson);
        newState = Object.assign({}, state, {layoutJson: newLayoutJson});
    }

    console.log(JSON.stringify(newState, null, "\t"));
    return newState;
}

var initialState = {layoutJson: json};
var store = Redux.createStore(reducer, initialState,
    window.devToolsExtension ? window.devToolsExtension() : undefined); // include redux dev tools: https://github.com/zalmoxisus/redux-devtools-extension

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.props.store.subscribe(this.onChange.bind(this));
        this.state = {json: this.props.store.getState().layoutJson};
    }

    onChange() {
        this.setState({json: this.props.store.getState().layoutJson});
    }

    factory(node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    }

    onAction(action) {
        this.props.store.dispatch(action);
    }

    render() {
        return (
            <FlexLayout.Layout
                model={this.state.json}
                factory={this.factory.bind(this)}
                onAction={this.onAction.bind(this)}/>
        );
    }
}

ReactDOM.render(<Main store={store}/>, document.getElementById("container"));
