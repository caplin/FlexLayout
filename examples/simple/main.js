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

const model = FlexLayout.Model.fromJson(json);

function Main(props) {

    const factory = (node) => {
        var component = node.getComponent();
        if (component === "panel") {
            return <div className="tab_content">{node.getName()}</div>;
        }
    }
    
    return (
        <FlexLayout.Layout
            model={model}
            factory={factory}/>
    );
}

ReactDOM.createRoot(document.getElementById("container")).render(<Main/>);
