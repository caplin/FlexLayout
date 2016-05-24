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

var Main = React.createClass({

    getInitialState: function() {
        return {model: FlexLayout.Model.fromJson(json)};
    },

    factory: function (node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    },

    render: function () {
        return (
            <FlexLayout.Layout
                model={this.state.model}
                factory={this.factory.bind(this)}/>
        );
    }
});

ReactDOM.render(<Main/>, document.getElementById("container"));
