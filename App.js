import React from "react";
import ReactDOM from "react-dom";
import Model from "./scripts/model/Model.js";
import Layout from "./scripts/view/Layout.js";
import Utils from "./scripts/Utils.js";
import SlickGrid from "slickgrid/grid";

var fields=["Name", "ISIN", "Bid", "Ask", "Last","Yield"];

class App
{
    constructor(containerElement)
    {
		console.log("available query parameters: ?layout=<name>&reload=true&log=true&grid=slick");
        this.containerElement = containerElement;
        this.layoutFile = "default";
		this.grid = "table";

        var params = Utils.getQueryParams();
        if (params["layout"])
        {
            this.layoutFile = params["layout"];
        }
		if (params["grid"])
		{
			this.grid = params["grid"];
		}

        if (params["reload"])
        {
            Utils.downloadFile("layouts/" + this.layoutFile + ".layout").then(this.load.bind(this), this.error.bind(this));
        }
        else
        {
            var json = localStorage.getItem(this.layoutFile);
            if (json != null)
            {
                this.load(json);
            }
            else
            {
                Utils.downloadFile("layouts/" + this.layoutFile + ".layout").then(this.load.bind(this), this.error.bind(this));
            }
        }
    }

    load(jsonText)
    {
        this.model = Model.fromJson(JSON.parse(jsonText));

        // fixed submodel for sub layout example
        this.submodel = Model.fromJson(
            {
                size: 100,
                children: [
                    {
                        type: "tabset", size: 50, color: "#ccccff", children: [
                        {type: "tab", name: "simple2", component: "simple2"},
                    ]
                    },
                    {
                        size: 150, children: [
                        {
                            size: 30, children: [
                            {
                                type: "tabset", size: 50, color: "#ffcccc", children: [
                                {type: "tab", name: "grida", component: "grid"},
                            ]
                            },
                        ]
                        },
                        {
                            size: 30, children: [
                            {
                                type: "tabset", size: 50, color: "#ccffcc", children: [
                                {type: "tab", name: "simple1", component: "simple1", config: {name: "a simple button"}},
                                {type: "tab", name: "simple2", component: "simple2"}
                            ]
                            },
                        ]
                        },
                        {
                            size: 50, children: [
                            {
                                size: 30, children: [
                                {
                                    type: "tabset", size: 50, color: "#fccccf", children: [
                                    {type: "tab", name: "gridb", component: "grid"},
                                ]
                                },
                            ]
                            },
                            {
                                size: 30, color: "yellow", children: [
                                {
                                    type: "tabset", size: 50, color: "#ccffff", children: [
                                    {type: "tab", name: "gridc", component: "grid"},
                                ]
                                },
                                {
                                    size: 50, children: [
                                    {
                                        size: 30, children: [
                                        {
                                            type: "tabset", size: 50, color: "#ffffcc", children: [
                                            {type: "tab", name: "gridd", component: "grid"},
                                        ]
                                        },
                                    ]
                                    },
                                    {
                                        size: 30, color: "yellow", children: [
                                        {
                                            type: "tabset", size: 50, color: "#ffccff", children: [
                                            {type: "tab", name: "gride", component: "grid"},
                                        ]
                                        },
                                    ]
                                    }
                                ]
                                }
                            ]
                            }
                        ]
                        }
                    ]
                    }
                ]
            }
        );

        this.render();

        // save layout when unloading page
        window.onbeforeunload = function(event)
        {
            var json = this.model.toJson();
            var jsonStr = JSON.stringify(json,null, "\t");
            localStorage.setItem(this.layoutFile, jsonStr);
        }.bind(this);
    }

    error(reason)
    {
        alert("Error loading json config file: " + this.layoutFile + "\n" + reason);
    }

    render()
    {
        ReactDOM.render(<Main model={this.model} factory={this.factory.bind(this)}/>,
            this.containerElement);
    }

    factory(node)
    {
		// log lifecycle events
		//node.setEventListener("resize", function(p){console.log("resize");});
		//node.setEventListener("maximize", function(p){console.log("maximize");});
		//node.setEventListener("visibility", function(p){console.log("visibility");});
		//node.setEventListener("close", function(p){console.log("close");});

        //console.log("factory: " + node.component);
		if (node.component == "grid")
        {
            if (node.extra.data == null)
            {
                // create data in node extra data first time accessed
                node.extra.data = this.makeFakeData();
            }

			if (this.grid == "table")
			{
				return <SimpleTable fields={fields} node={node} data={node.extra.data}/>;
			}
			else if (this.grid == "slick")
			{
				return <SlickGridWrapper fields={fields} data={node.extra.data}/>;
			}
        }
        else if (node.component == "simple1" )
        {
            return <Simple1 config={node.config}/>;
        }
		else if (node.component == "simple2")
		{
			return <Simple2 config={node.config} node={node}/>;
		}
        else if (node.component == "sub")
        {
            return <SubApp model={this.submodel} node={node} factory={this.factory.bind(this)}/>;
        }
    }

    makeFakeData()
    {
        var data = [];
        var r = Math.random() * 50;
        for (var i = 0; i<r; i++)
        {
            var rec = {};
			rec.Name = this.randomString(5,"ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            rec.ISIN = rec.Name + this.randomString(7,"1234567890");
            for (var j=2; j<fields.length; j++)
            {
                rec[fields[j]] =  (1.5 + Math.random()*2).toFixed(2);
            };
            data.push(rec);
        }
        return data;
    }

    randomString(len, chars)
    {
        var a = [];
        for (var i=0; i<len; i++)
        {
            a.push(chars[Math.floor(Math.random()*chars.length)]);
        }

		return a.join("");
    }
}

class Main extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {adding:false};
	}

	onAddClick(event)
	{
		this.refs.layout.addTabWhereClicked("grid", "added", this.onAdded.bind(this));
		this.setState({adding:true});
	}

	onAdded(addedNode)
	{
		this.setState({adding:false});
	}

	render()
	{
		var message  = (this.state.adding)?<div style={{float:"right"}}>Click on location for new tab</div>:null;
		return <div className="app">
			<div className="toolbar">
				<button disabled={this.state.adding} style={{float:"right"}} onClick={this.onAddClick.bind(this)}>Add</button>
				{message}
			</div>
			<div className="contents">
				<Layout ref="layout" model={this.props.model} factory={this.props.factory}/>
			</div>
		</div>;
	}
}

class SubApp extends React.Component
{
    render()
    {
        return <Layout model={this.props.model} factory={this.props.factory}/>;
    }
}

// pretend store to keep track of a value independent of component lifecycle
var store = {value:0};
setInterval(function()
{
    store.value++;
    if (store.callback)
    {
        store.callback();
    }
},1000);

class Simple1 extends React.Component
{
	render()
	{
		return <button>{this.props.config.name}</button>;
	}
}

class Simple2 extends React.Component
{
	constructor(props)
	{
		super(props);
		this.visible = false;
		this.state = {value:store.value};
	}

    componentDidMount()
    {
		store.callback = function()
        {
			if (this.visible)
			{
				this.setState({value:store.value});
			}
        }.bind(this);

		this.visible = true;
		this.props.node.setEventListener("visibility", this.onVisibilityChange.bind(this));
    }

	componentWillUnmount()
	{
		this.visible = false;
		store.callback = null;
	}

	onVisibilityChange(event)
	{
		this.visible = event.visible;
	}

    render()
    {
        return <div>a counter component {this.state.value}</div>;
    }
}

class SimpleTable extends React.Component
{
	shouldComponentUpdate()
	{
		return false;
	}
	
    render()
    {
        var headercells = this.props.fields.map(function(field)
        {
            return <th key={field}>{field}</th>;
        });

        var rows = [];
        for (var i=0; i< this.props.data.length; i++)
        {
            var row = this.props.fields.map(field => <td key={field}>{this.props.data[i][field]}</td>);
            rows.push(<tr key={i}>{row}</tr>);
        }

        return <table className="simple_table">
            <tbody>
				<tr>{headercells}</tr>
				{rows}
            </tbody>
        </table>;
    }
}

class SlickGridWrapper extends React.Component {

	componentDidMount()
	{
		var container = ReactDOM.findDOMNode(this.refs.slickgrid);

		var columns = fields.map(function(field)
		{
			return {name: field,
				field: field,
				width: 130,
				id: field,
				sortable: true
			};
		});

		var options = {
			enableCellNavigation: true,
			enableColumnReorder: false,
			forceFitColumns: false
		};

		this.slickgrid = new Slick.Grid(container, this.props.data, columns, options);
	}

	componentWillReceiveProps(newprops)
	{
		this.slickgrid.resizeCanvas();
	}

	render()
	{
		return <div ref="slickgrid" className="slickgrid"></div>
	}
}

new App(document.getElementById("container"));
