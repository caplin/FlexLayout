import React from "react";
import FlexLayout from "flexlayout-react";
import { useState } from "react";
import "flexlayout-react/style/light.css";

const json = {
    global: {},
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: "tab",
                        name: "FX",
                        component: "button",
                    },
                ],
            },
            {
                type: "tabset",
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: "tab",
                        name: "FI",
                        component: "button",
                    },
                ],
            },
        ],
    },
};

const factory = (): any => {};

function App() {
    const [model] = useState(FlexLayout.Model.fromJson(json));

    return (
        <div className="App">
            <FlexLayout.Layout model={model} factory={factory} />
        </div>
    );
}

export default App;
