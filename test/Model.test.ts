import { Action, Actions, BorderNode, DockLocation, IJsonModel, Model, Node, Orientation, Rect, RowNode, TabNode, TabSetNode } from "../src";

/*
* The textRendered tabs: a representation of the model 'rendered' to a list of tab paths 
* where /ts0/t1[One]* is tab index 1 in tabset 0 of the root row with name=One and its selected (ie. path + tabname and selected indicator))
*/
let tabsArray: string[] = []; // the rendered tabs as an array
let tabs = ""; // the rendered tabs array as a comma separated string
let pathMap: Record<string, Node> = {}; // maps tab path (e.g /ts1/t0) to the actual Node

let model: Model;

describe("Tree", function () {

    context("Actions", () => {
        // afterEach(() => {
        //     checkLayout(model);
        // });

        context("Add", () => {

            it("empty tabset", function () {
                model = Model.fromJson(
                    {
                        global: {},
                        layout: {
                            type: "row",
                            children: [
                                {
                                    type: "tabset",
                                    id: "1",
                                    enableDeleteWhenEmpty: false,
                                    children: []
                                }
                            ]
                        }
                    }
                );

                doAction(Actions.addNode({ id: "2", name: "newtab1", component: "grid" }, "1", DockLocation.CENTER, -1));

                expect(tabs).equal("/ts0/t0[newtab1]*");
                expect(tab("/ts0/t0").getId()).equal("2");
                expect(tab("/ts0/t0").getComponent()).equal("grid");
            });

            context("tabsets", () => {
                beforeEach(() => {
                    model = Model.fromJson(twoTabs);
                    textRender(model);
                    // two tabsets in a row, each with a single tab will textRender as:
                    expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*");
                });

                it("add to tabset center", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabs).equal("/ts0/t0[One],/ts0/t1[newtab1]*,/ts1/t0[Two]*");

                    const id1 = tabset("/ts1").getId();
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id1, DockLocation.CENTER, -1));

                    expect(tabs).equal("/ts0/t0[One],/ts0/t1[newtab1]*,/ts1/t0[Two],/ts1/t1[newtab2]*");
                });

                it("add to tabset at position", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabs).equal("/ts0/t0[newtab1]*,/ts0/t1[One],/ts1/t0[Two]*");

                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabs).equal("/ts0/t0[newtab1],/ts0/t1[newtab2]*,/ts0/t2[One],/ts1/t0[Two]*");

                    doAction(Actions.addNode({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 3));

                    expect(tabs).equal("/ts0/t0[newtab1],/ts0/t1[newtab2],/ts0/t2[One],/ts0/t3[newtab3]*,/ts1/t0[Two]*");
                });

                it("add to tabset top", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.TOP, -1));

                    expect(tabs).equal("/c0/ts0/t0[newtab1]*,/c0/ts1/t0[One]*,/ts1/t0[Two]*");

                    const id1 = tabset("/ts1").getId();
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id1, DockLocation.TOP, -1));

                    expect(tabs).equal("/c0/ts0/t0[newtab1]*,/c0/ts1/t0[One]*,/c1/ts0/t0[newtab2]*,/c1/ts1/t0[Two]*");
                });

                it("add to tabset bottom", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.BOTTOM, -1));

                    expect(tabs).equal("/c0/ts0/t0[One]*,/c0/ts1/t0[newtab1]*,/ts1/t0[Two]*");

                    const id1 = tabset("/ts1").getId();
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id1, DockLocation.BOTTOM, -1));

                    expect(tabs).equal("/c0/ts0/t0[One]*,/c0/ts1/t0[newtab1]*,/c1/ts0/t0[Two]*,/c1/ts1/t0[newtab2]*");
                });

                it("add to tabset left", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.LEFT, -1));

                    expect(tabs).equal("/ts0/t0[newtab1]*,/ts1/t0[One]*,/ts2/t0[Two]*");

                    const id1 = tabset("/ts2").getId();
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id1, DockLocation.LEFT, -1));

                    expect(tabs).equal("/ts0/t0[newtab1]*,/ts1/t0[One]*,/ts2/t0[newtab2]*,/ts3/t0[Two]*");
                });

                it("add to tabset right", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.RIGHT, -1));

                    expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[newtab1]*,/ts2/t0[Two]*");

                    const id1 = tabset("/ts2").getId();
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id1, DockLocation.RIGHT, -1));

                    expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[newtab1]*,/ts2/t0[Two]*,/ts3/t0[newtab2]*");
                });
            });

            context("borders", () => {
                beforeEach(() => {
                    model = Model.fromJson(withBorders);
                    textRender(model);

                    expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");
                });

                it("add to top border", () => {
                    const path = "/b/top";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/top/t0[top1],/b/top/t1[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/top/t0[newtab2],/b/top/t1[top1],/b/top/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addNode({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/top/t0[newtab2],/b/top/t1[newtab3],/b/top/t2[top1],/b/top/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });

                it("add to bottom border", () => {
                    const path = "/b/bottom";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/bottom/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/bottom/t0[newtab2],/b/bottom/t1[bottom1],/b/bottom/t2[bottom2],/b/bottom/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addNode({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/bottom/t0[newtab2],/b/bottom/t1[newtab3],/b/bottom/t2[bottom1],/b/bottom/t3[bottom2],/b/bottom/t4[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });

                it("add to left border", () => {
                    const path = "/b/left";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/left/t0[left1],/b/left/t1[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/left/t0[newtab2],/b/left/t1[left1],/b/left/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addNode({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/left/t0[newtab2],/b/left/t1[newtab3],/b/left/t2[left1],/b/left/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });

                it("add to right border", () => {
                    const path = "/b/right";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addNode({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/right/t0[right1],/b/right/t1[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addNode({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/right/t0[newtab2],/b/right/t1[right1],/b/right/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addNode({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/right/t0[newtab2],/b/right/t1[newtab3],/b/right/t2[right1],/b/right/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });
            });
        });

        context("Move", () => {
            beforeEach(() => {
                model = Model.fromJson(threeTabs);
                textRender(model);
                expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*,/ts2/t0[Three]*");
            });

            it("move to center", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/ts0/t0[Two],/ts0/t1[One]*,/ts1/t0[Three]*");
            });

            it("move to center position", () => {
                let fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, 0));
                expect(tabs).equal("/ts0/t0[One]*,/ts0/t1[Two],/ts1/t0[Three]*");

                fromId = tab("/ts1/t0").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, 1));
                expect(tabs).equal("/ts0/t0[One],/ts0/t1[Three]*,/ts0/t2[Two]");
            });

            it("move to top", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.TOP, -1));
                expect(tabs).equal("/c0/ts0/t0[One]*,/c0/ts1/t0[Two]*,/ts1/t0[Three]*");
            });

            it("move to bottom", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.BOTTOM, -1));
                expect(tabs).equal("/c0/ts0/t0[Two]*,/c0/ts1/t0[One]*,/ts1/t0[Three]*");
            });

            it("move to left", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.LEFT, -1));
                expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*,/ts2/t0[Three]*");
            });

            it("move to right", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.RIGHT, -1));
                expect(tabs).equal("/ts0/t0[Two]*,/ts1/t0[One]*,/ts2/t0[Three]*");
            });
        });

        context("Move to/from borders", () => {
            beforeEach(() => {
                model = Model.fromJson(withBorders);
                textRender(model);
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");
            });

            it("move to border top", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/b/top").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/top/t1[One],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1]");
            });

            it("move to border bottom", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/b/bottom").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/bottom/t2[One],/b/left/t0[left1],/b/right/t0[right1]");
            });

            it("move to border left", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/b/left").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/left/t1[One],/b/right/t0[right1]");
            });

            it("move to border right", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/b/right").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/b/right/t1[One]");
            });


            it("move from border top", () => {
                const fromId = tab("/b/top/t0").getId();
                const toId = tab("/ts0").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One],/ts0/t1[top1]*");
            });

            it("move from border bottom", () => {
                const fromId = tab("/b/bottom/t0").getId();
                const toId = tab("/ts0").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One],/ts0/t1[bottom1]*");
            });

            it("move from border left", () => {
                const fromId = tab("/b/left/t0").getId();
                const toId = tab("/ts0").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/right/t0[right1],/ts0/t0[One],/ts0/t1[left1]*");
            });

            it("move from border right", () => {
                const fromId = tab("/b/right/t0").getId();
                const toId = tab("/ts0").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/ts0/t0[One],/ts0/t1[right1]*");
            });
        });

        context("Delete", () => {
            beforeEach(() => {
            });

            it("delete from tabset with 1 tab", () => {
                model = Model.fromJson(threeTabs);
                textRender(model);
                expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*,/ts2/t0[Three]*");

                doAction(Actions.deleteTab(tab("/ts0/t0").getId()));
                expect(tabs).equal("/ts0/t0[Two]*,/ts1/t0[Three]*");
            });

            it("delete tab from tabset with 3 tabs", () => {
                model = Model.fromJson(threeTabs);
                textRender(model);
                expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*,/ts2/t0[Three]*");
                let fromId = tab("/ts0/t0").getId();
                let toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                fromId = tab("/ts1/t0").getId();
                toId = tab("/ts0").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/ts0/t0[Two],/ts0/t1[One],/ts0/t2[Three]*");
                // now had three tabs in /ts0

                doAction(Actions.deleteTab(tab("/ts0/t1").getId()));
                expect(tabs).equal("/ts0/t0[Two],/ts0/t1[Three]*");

                doAction(Actions.deleteTab(tab("/ts0/t1").getId()));
                expect(tabs).equal("/ts0/t0[Two]*");
            });

            it("delete tabset", () => {
                model = Model.fromJson(threeTabs);
                textRender(model);
                expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*,/ts2/t0[Three]*");
                let fromId = tab("/ts0/t0").getId();
                let toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, -1));
                expect(tabs).equal("/ts0/t0[Two],/ts0/t1[One]*,/ts1/t0[Three]*");

                doAction(Actions.deleteTabset(tabset("/ts0").getId()));
                expect(tabs).equal("/ts0/t0[Three]*");
            });

            it("delete tab from borders", () => {
                model = Model.fromJson(withBorders);
                textRender(model);

                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");

                doAction(Actions.deleteTab(tab("/b/top/t0").getId()));
                expect(tabs).equal("/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");

                doAction(Actions.deleteTab(tab("/b/bottom/t0").getId()));
                expect(tabs).equal("/b/bottom/t0[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");

                doAction(Actions.deleteTab(tab("/b/bottom/t0").getId()));
                expect(tabs).equal("/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");

                doAction(Actions.deleteTab(tab("/b/left/t0").getId()));
                expect(tabs).equal("/b/right/t0[right1],/ts0/t0[One]*");

                doAction(Actions.deleteTab(tab("/b/right/t0").getId()));
                expect(tabs).equal("/ts0/t0[One]*");
            });

        });

        context("Other Actions", () => {
            beforeEach(() => {
                model = Model.fromJson(twoTabs);
                textRender(model);
                expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*");
            });

            it("rename tab", () => {
                doAction(Actions.renameTab(tab("/ts0/t0").getId(), "renamed"));
                expect(tabs).equal("/ts0/t0[renamed]*,/ts1/t0[Two]*");
            });

            it("select tab", () => {
                doAction(Actions.addNode({ name: "newtab1", component: "grid" }, tabset("/ts0").getId(), DockLocation.CENTER, -1));
                expect(tabs).equal("/ts0/t0[One],/ts0/t1[newtab1]*,/ts1/t0[Two]*");

                doAction(Actions.selectTab(tab("/ts0/t0").getId()));
                expect(tabs).equal("/ts0/t0[One]*,/ts0/t1[newtab1],/ts1/t0[Two]*");
            });

            it("set active tabset", () => {
                const ts0 = tabset("/ts0");
                const ts1 = tabset("/ts1");
                expect(ts0.isActive()).equal(false);
                expect(ts1.isActive()).equal(false);
                doAction(Actions.selectTab(tab("/ts0/t0").getId()));
                expect(ts0.isActive()).equal(true);
                expect(ts1.isActive()).equal(false);
                doAction(Actions.selectTab(tab("/ts1/t0").getId()));
                expect(ts0.isActive()).equal(false);
                expect(ts1.isActive()).equal(true);

                doAction(Actions.setActiveTabset(tabset("/ts0").getId()));
                expect(ts0.isActive()).equal(true);
                expect(ts1.isActive()).equal(false);
            });

            it("maximize tabset", () => {
                expect(tabset("/ts0").isMaximized()).equals(false);
                expect(tabset("/ts1").isMaximized()).equals(false);
                doAction(Actions.maximizeToggle(tabset("/ts0").getId()));
                expect(tabset("/ts0").isMaximized()).equals(true);
                expect(tabset("/ts1").isMaximized()).equals(false);
                doAction(Actions.maximizeToggle(tabset("/ts1").getId()));
                expect(tabset("/ts0").isMaximized()).equals(false);
                expect(tabset("/ts1").isMaximized()).equals(true);

                expect(model.getMaximizedTabset()).equals(tabset("/ts1"));

                doAction(Actions.maximizeToggle(tabset("/ts1").getId()));
                expect(tabset("/ts0").isMaximized()).equals(false);
                expect(tabset("/ts1").isMaximized()).equals(false);

                expect(model.getMaximizedTabset()).equals(undefined);
            });

            // it("float/unfloat tab", () => {
            //     expect(tab("/ts1/t0").isFloating()).equals(false);
            //     doAction(Actions.floatTab(tab("/ts1/t0").getId()));
            //     expect(tab("/ts1/t0").isFloating()).equals(true);

            //     doAction(Actions.unFloatTab(tab("/ts1/t0").getId()));
            //     expect(tab("/ts1/t0").isFloating()).equals(false);
            // });

            it("set tab attributes", () => {
                expect(tab("/ts1/t0").getConfig()).equals(undefined);
                doAction(Actions.updateNodeAttributes(tab("/ts1/t0").getId(), { config: "newConfig" }));
                expect(tab("/ts1/t0").getConfig()).equals("newConfig");
            });

            it("set model attributes", () => {
                expect(model.getSplitterSize()).equals(8);
                doAction(Actions.updateModelAttributes({ splitterSize: 10 }));
                expect(model.getSplitterSize()).equals(10);
            });

        });
    });

    context("Node events", () => {
        beforeEach(() => {
            model = Model.fromJson(twoTabs);
            textRender(model);
            expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*");
        });

        it("close tab", () => {
            let closed = false;
            tab("/ts0/t0").setEventListener("close", () => { closed = true; })
            doAction(Actions.deleteTab(tab("/ts0/t0").getId()));
            expect(closed).equals(true);
        });

        it("save tab", () => {
            let saved = false;
            tab("/ts0/t0").setEventListener("save", () => { saved = true; })
            model.toJson();
            expect(saved).equals(true);
        });

        // it("visibility tab", () => {
        //     const layoutRect = new Rect(0, 0, 1000, 800);
        //     model._layout(layoutRect, {
        //         headerBarSize: 30,
        //         tabBarSize: 30,
        //         borderBarSize: 30
        //     })

        //     let visibility = true;
        //     tab("/ts0/t0").setEventListener("visibility", (data) => {
        //         visibility = data.visible;
        //         console.log(data);
        //     })
        //     doAction(Actions.moveNode(tab("/ts1/t0").getId(), tabset("/ts0").getId(), DockLocation.CENTER, -1));
        //     expect(tabs).equal("/ts0/t0[One],/ts0/t1[Two]*");

        //     // need to layout for visibility to change!
        //     model._layout(layoutRect, {
        //         headerBarSize: 30,
        //         tabBarSize: 30,
        //         borderBarSize: 30
        //     })

        //     expect(visibility).equals(false);
        // });

        // it("resize tab", () => {
        //     const layoutRect = new Rect(0, 0, 1000, 800);
        //     model._layout(layoutRect, {
        //         headerBarSize: 30,
        //         tabBarSize: 30,
        //         borderBarSize: 30
        //     })

        //     let resized = false;
        //     tab("/ts0/t0").setEventListener("resize", () => { resized = true; })
        //     expect(resized).equals(false);

        //     model._layout(layoutRect, {
        //         headerBarSize: 30,
        //         tabBarSize: 130, // changed size
        //         borderBarSize: 30
        //     })
        //     expect(resized).equals(true);
        // });
    });
    
});


// ---------------------------- helpers ------------------------ 

function doAction(action: Action) {
    model.doAction(action);
    textRender(model);
}

// functions to save some inline casting
function tab(path: string) {
    return pathMap[path] as TabNode;
}

function tabset(path: string) {
    return pathMap[path] as TabSetNode;
}

function row(path: string) {
    return pathMap[path] as RowNode;
}

function border(path: string) {
    return pathMap[path] as BorderNode;
}

function tabsMatch(regExStr: string) {
    const regex = new RegExp(regExStr);
    return tabsArray.filter(t => regex.test(t)).join(",");
}

function tabsDontMatch(regExStr: string) {
    const regex = new RegExp(regExStr);
    return tabsArray.filter(t => !regex.test(t)).join(",");
}

function textRender(model: Model) {
    pathMap = {};
    tabsArray = [];
    textRenderInner(pathMap, "", model.getBorderSet().getBorders());
    textRenderInner(pathMap, "", model.getRoot().getChildren());
    tabs = tabsArray.join(",");
}

function textRenderInner(pathMap: Record<string, Node>, path: string, children: Node[]) {
    let index = 0;
    let splitterIndex = 0;
    children.forEach((c) => {
        if (c instanceof BorderNode) {
            const newpath = path + "/b/" + c.getLocation().getName();
            pathMap[newpath] = c;
            textRenderInner(pathMap, newpath, c.getChildren());
        } else if (c instanceof TabSetNode) {
            const newpath = path + "/ts" + index++;
            pathMap[newpath] = c;
            textRenderInner(pathMap, newpath, c.getChildren());
        } else if (c instanceof TabNode) {
            const newpath = path + "/t" + index++;
            pathMap[newpath] = c;
            const parent = c.getParent() as (BorderNode | TabSetNode);
            const selected = parent.getSelectedNode() === c;
            tabsArray.push(newpath + "[" + c.getName() + "]" + (selected ? "*" : ""));
            textRenderInner(pathMap, newpath, c.getChildren());
        } else if (c instanceof RowNode) {
            const newpath = path + ((c.getOrientation() === Orientation.HORZ) ? "/r" : "/c") + index++;
            pathMap[newpath] = c;
            textRenderInner(pathMap, newpath, c.getChildren());
        // } else if (c instanceof SplitterNode) {
        //     const newpath = path + "/s" + splitterIndex++;
        //     pathMap[newpath] = c;
        //     textRenderInner(pathMap, newpath, c.getChildren());
        }
    });
}

// // check layout covers area
// function checkLayout(model: Model) {
//     const layoutRect = new Rect(0, 0, 1000, 800);
//     model._layout(layoutRect, {
//         headerBarSize: 30,
//         tabBarSize: 30,
//         borderBarSize: 30
//     })
//     if (model.getMaximizedTabset() === undefined) {
//         // should also check borders
//         checkRowLayout(model.getRoot());
//     }
// }

// // check row children take up all space in row
// function checkRowLayout(row: RowNode) {
//     const r = row.getRect();
//     if (row.getOrientation() === Orientation.HORZ) {
//         let x = r.x;
//         row._getDrawChildren().forEach(c => {
//             const cr = c.getRect();
//             expect(cr.height).equal(r.height);
//             x += cr.width;
//             if (c instanceof RowNode) {
//                 checkRowLayout(c);
//             }
//         });
//         expect(x).equal(r.getRight());
//     } else {
//         let y = r.y;
//         row._getDrawChildren().forEach(c => {
//             const cr = c.getRect();
//             expect(cr.width).equal(r.width);
//             y += cr.height;
//             if (c instanceof RowNode) {
//                 checkRowLayout(c);
//             }
//         });
//         expect(y).equal(r.getBottom());

//     }
// }

// -------------------- layouts --------------------

const twoTabs: IJsonModel = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                id: "#1",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        component: "text",
                    }
                ]
            }
        ]
    }
};

const withBorders: IJsonModel = {
    global: {},
    borders: [
        {
            "type": "border",
            "location": "top",
            "children": [
                {
                    "type": "tab",
                    "name": "top1",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "bottom",
            "children": [
                {
                    "type": "tab",
                    "name": "bottom1",
                    "component": "text"
                },
                {
                    "type": "tab",
                    "name": "bottom2",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "left",
            "children": [
                {
                    "type": "tab",
                    "name": "left1",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "right",
            "children": [
                {
                    "type": "tab",
                    "name": "right1",
                    "component": "text"
                }
            ]
        }
    ],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "text",
                    }
                ]
            }
        ]
    }
};

const threeTabs: IJsonModel = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                name: "TheHeader",
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        icon: "/test/images/settings.svg",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Three",
                        component: "text",
                    }
                ]
            }

        ]
    }
};
