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
                                "name": "Things to try",
                                "component":"text",
                                "config":{"text":"<ul><li>drag tabs</li><li>drag splitters</li><li>double click on tab to rename</li><li>double click on tabstrip to maximize</li><li>press ctrl enter to add another tab</li></ul>"}
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
                                "component":"text",
                                "config":{"text":""}
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
                                "component":"text",
                                "config":{"text":""}
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
    if (component === "text")
    {
          return  <div dangerouslySetInnerHTML={{__html:node.getConfig().text}}/>;
    }
}

// enable ctrl enter to add a new tab
document.addEventListener("keydown", onKeyPress);

function onKeyPress(event)
{
    console.log(event);
    if (event.ctrlKey == true && event.keyCode == 13) // ctrl enter
    {
        layout.addTabWithDragAndDropIndirect("Add panel<br>(Drag to location)", {component:"text", name:"added", config:{text:"i was added"}}, null);
    }
}

var layout = ReactDOM.render(<Layout model={model} factory={factory}/>,  document.getElementById("container"));
