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

var Main = React.createClass({

    getInitialState: function() {
        return {json: json};
    },

    factory: function (node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    },

    onAction: function (action) {
        console.log(action);
        this.setState({json: FlexLayout.Model.apply(action, json)});
        console.log(JSON.stringify(json, null, "\t"));
    },

    render: function () {
        return (
            <FlexLayout.Layout
                model={this.state.json}
                factory={this.factory.bind(this)}
                onAction={this.onAction.bind(this)}/>
        );
    }
});

ReactDOM.render(<Main/>, document.getElementById("container"));
