import React from "react";
import ReactDOM from "react-dom";
import Model from "../../scripts/model/Model.js";
import Layout from "../../scripts/view/Layout.js";

 var model = Model.fromJson({
            global: {},
            layout:{
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
                                "component":"button",
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
                                "component":"button",
                            }
                        ]
                    }
                ]
            }
        }
    );

function factory(node)
{
    var component = node.getComponent();
    if (component === "button")
    {
        return <button>{node.getName()}</button>;
    }
}

ReactDOM.render(<Layout model={model} factory={factory}/>,  document.getElementById("container"));
