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
                        "name": "One",
                        "component": "panel"
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
                        "name": "Two",
                        "component": "panel"
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
                        "name": "Three",
                        "component": "panel"
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

    factory = (node) => {
        var component = node.getComponent();
        if (component === "panel") {
            return <div className="tab_content">{node.getName()}</div>;
        }
    }

    render() {
        return (
            <FlexLayout.Layout
                model={this.state.model}
                factory={this.factory}/>
        );
    }
}

ReactDOM.createRoot(document.getElementById("container")).render(<Main/>);
