var json = {
    global: {}, // {tabSetEnableTabStrip:false}, // to have just splitters
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
                        "name": "Things to try",
                        "component": "text",
                        "config": {"text": "<ul><li>drag tabs</li><li>drag splitters</li><li>double click on tab to rename</li><li>double click on tabstrip to maximize</li><li>use the Add button to add another tab</li></ul>"}
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
                        "name": "two",
                        "component": "text",
                        "config": {"text": ""}
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
        this.state = {model: FlexLayout.Model.fromJson(json)};
    }

    factory = (node) => {
        var component = node.getComponent();
        if (component === "text") {
            return <div dangerouslySetInnerHTML={{__html:node.getConfig().text}}/>;
        }
    }

    onAdd = (event) => {
        this.refs.layout.addTabWithDragAndDropIndirect("Add panel<br>(Drag to location)", {
            component: "text",
            name: "added",
            config: {text: "i was added"}
        }, null);
    }

    render() {
        return (
            <div className="outer">
                <button onClick={this.onAdd}>Add</button>
                <div className="inner">
                    <FlexLayout.Layout ref="layout"
                                       model={this.state.model}
                                       factory={this.factory}/>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Main/>, document.getElementById("container"));