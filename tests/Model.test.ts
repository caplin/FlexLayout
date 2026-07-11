/** @jest-environment jsdom */
import { Action, Actions, BorderNode, DockLocation, IJsonModel, Model, Node, Rect, RowNode, TabNode, TabSetNode } from "../src";

/*
* The textRendered tabs: a representation of the model 'rendered' to a list of tab paths 
* where /ts0/t1[One]* is tab index 1 in tabset 0 of the root row with name=One and its selected (ie. path + tabname and selected indicator))
*/
let tabsArray: string[] = []; // the rendered tabs as an array
let tabs = ""; // the rendered tabs array as a comma separated string
let pathMap: Record<string, Node> = {}; // maps tab path (e.g /ts1/t0) to the actual Node

let model: Model;

describe("Tree", function () {

    describe("fromJson", () => {

        it("loads a model without the optional global key", function () {
            model = Model.fromJson(
                {
                    layout: {
                        type: "row",
                        children: [
                            {
                                type: "tabset",
                                children: [
                                    { type: "tab", name: "One" }
                                ]
                            }
                        ]
                    }
                }
            );

            textRender(model);
            expect(tabs).equal("/ts0/t0[One]*");
        });

        it("clamps an out of range selected index from the json", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        { type: "tabset", selected: 5, children: [{ type: "tab", name: "One" }, { type: "tab", name: "Two" }] }
                    ]
                }
            });

            textRender(model);
            expect(tabs).equal("/ts0/t0[One],/ts0/t1[Two]*");
        });

        it("tolerates a dangling subLayoutId", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        { type: "tabset", children: [{ type: "tab", id: "t1", name: "One", subLayoutId: "missing" }] }
                    ]
                }
            });

            const t = model.getNodeById("t1") as TabNode;
            expect(t.isCloseable()).equal(true);
            expect(() => t.isAllowedInWindow()).not.toThrow();
        });
    });

    describe("Robustness", () => {

        it("returns undefined for unknown layout ids", function () {
            model = Model.fromJson(twoTabs);
            expect(model.getMaximizedTabset("nope")).equal(undefined);
            expect(model.getRootRow("nope")).equal(undefined);
        });

        it("ignores short weights arrays and unknown ids in adjustWeights", function () {
            model = Model.fromJson(twoTabs);
            textRender(model);
            const row = model.getRootRow()!;
            const w1 = (row.getChildren()[1] as TabSetNode).getWeight();

            doAction(Actions.adjustWeights(row.getId(), [70]));
            expect((row.getChildren()[0] as TabSetNode).getWeight()).equal(70);
            expect((row.getChildren()[1] as TabSetNode).getWeight()).equal(w1);

            // unknown id is a no-op rather than a throw
            doAction(Actions.adjustWeights("unknown", [1, 2]));
        });

        it("clamps an out of range border selected index from json", function () {
            model = Model.fromJson({
                global: {},
                borders: [
                    // selected index 5 with a single child would otherwise crash getSize/setSize
                    { type: "border", location: "top", selected: 5, children: [{ type: "tab", name: "top1" }] },
                    // selected on an empty border clamps to -1 (nothing selected)
                    { type: "border", location: "bottom", selected: 0, children: [] }
                ],
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", name: "One" }] }] }
            });
            const borders = model.getBorderSet().getBorders();
            expect(borders[0].getSelected()).equal(0);
            expect(borders[1].getSelected()).equal(-1);
            expect(() => borders[0].getSize()).not.toThrow();
        });

        it("ignores unknown ids in setActiveTabset, maximizeToggle and updateNodeAttributes", function () {
            model = Model.fromJson(twoTabs);
            textRender(model);
            expect(() => model.doAction(Actions.setActiveTabset("unknownTabset", "badLayout"))).not.toThrow();
            expect(() => model.doAction(Actions.maximizeToggle("unknownTabset", "badLayout"))).not.toThrow();
            expect(() => model.doAction(Actions.updateNodeAttributes("unknownNode", { name: "x" }))).not.toThrow();
        });

        it("keeps calculated max >= min when a tab has contradictory min/max attributes", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        { type: "tabset", children: [{ type: "tab", name: "One", minWidth: 300, maxWidth: 100 }] }
                    ]
                }
            });
            const root = model.getRootRow()!;
            root.calcMinMaxSize();
            const tabset = root.getChildren()[0] as TabSetNode;
            // without the clamp, maxWidth (100) would end up below minWidth (300), inverting the
            // bounds fed to the splitter/weight math
            expect(tabset.getMaxWidth()).toBeGreaterThanOrEqual(tabset.getMinWidth());
            expect(root.getMaxWidth()).toBeGreaterThanOrEqual(root.getMinWidth());
        });

        it("getFirstTabSet returns undefined for an empty row instead of throwing", function () {
            model = Model.fromJson({ global: {}, layout: { type: "row", children: [] } });
            expect(() => model.getFirstTabSet()).not.toThrow();
            const normal = Model.fromJson(twoTabs);
            expect(normal.getFirstTabSet()).toBeInstanceOf(TabSetNode);
        });

        it("setRect fires resize only on a whole-pixel change", function () {
            model = Model.fromJson({
                global: {},
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "t1", name: "One" }] }] }
            });
            const t = model.getNodeById("t1") as TabNode;
            let resizes = 0;
            t.setEventListener("resize", () => { resizes++; });

            t.setRect(new Rect(0, 0, 100, 100));
            expect(resizes).equal(1);

            // sub-pixel change rounds equal: positionTabPanels re-applies the rect every measure
            // pass, so this must NOT re-fire resize
            t.setRect(new Rect(0, 0, 100.2, 100.2));
            expect(resizes).equal(1);

            // a whole-pixel change does fire
            t.setRect(new Rect(0, 0, 101, 101));
            expect(resizes).equal(2);
        });

        it("restores horizontal scroll when vertical scroll is zero", async function () {
            model = Model.fromJson({
                global: {},
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "t1", name: "One" }] }] }
            });
            const t = model.getNodeById("t1") as TabNode;
            const el = t.getMoveableElement();
            t.setScrollTop(0);
            t.setScrollLeft(123);

            t.restoreScrollPosition();
            await new Promise((resolve) => requestAnimationFrame(resolve));

            expect(el.scrollLeft).equal(123);
        });

        it("deleting a tab removes nested sublayouts and closes their tabs", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        { type: "tabset", children: [{ type: "tab", id: "tA", name: "A", subLayoutId: "L1" }, { type: "tab", name: "Keep" }] }
                    ]
                },
                subLayouts: {
                    L1: { type: "tab", layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tB", name: "B", subLayoutId: "L2" }] }] } },
                    L2: { type: "tab", layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tC", name: "C" }] }] } }
                }
            });
            expect(model.getLayouts().has("L1")).equal(true);
            expect(model.getLayouts().has("L2")).equal(true);

            const closed: string[] = [];
            (model.getNodeById("tB") as TabNode).setEventListener("close", () => closed.push("B"));

            doAction(Actions.deleteTab("tA"));

            expect(model.getLayouts().has("L1")).equal(false);
            expect(model.getLayouts().has("L2")).equal(false);
            expect(closed).toEqual(["B"]);
        });
    });

    describe("Actions", () => {

        describe("Add", () => {

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

                doAction(Actions.addTab({ id: "2", name: "newtab1", component: "grid" }, "1", DockLocation.CENTER, -1));

                expect(tabs).equal("/ts0/t0[newtab1]*");
                expect(tab("/ts0/t0").getId()).equal("2");
                expect(tab("/ts0/t0").getComponent()).equal("grid");
            });

            describe("tabsets", () => {
                beforeEach(() => {
                    model = Model.fromJson(twoTabs);
                    textRender(model);
                    // two tabsets in a row, each with a single tab will textRender as:
                    expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[Two]*");
                });

                it("add to tabset center", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabs).equal("/ts0/t0[One],/ts0/t1[newtab1]*,/ts1/t0[Two]*");

                    const id1 = tabset("/ts1").getId();
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id1, DockLocation.CENTER, -1));

                    expect(tabs).equal("/ts0/t0[One],/ts0/t1[newtab1]*,/ts1/t0[Two],/ts1/t1[newtab2]*");
                });

                it("add to tabset at position", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabs).equal("/ts0/t0[newtab1]*,/ts0/t1[One],/ts1/t0[Two]*");

                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabs).equal("/ts0/t0[newtab1],/ts0/t1[newtab2]*,/ts0/t2[One],/ts1/t0[Two]*");

                    doAction(Actions.addTab({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 3));

                    expect(tabs).equal("/ts0/t0[newtab1],/ts0/t1[newtab2],/ts0/t2[One],/ts0/t3[newtab3]*,/ts1/t0[Two]*");
                });

                it("add to tabset top", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.TOP, -1));

                    expect(tabs).equal("/r0/ts0/t0[newtab1]*,/r0/ts1/t0[One]*,/ts1/t0[Two]*");

                    const id1 = tabset("/ts1").getId();
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id1, DockLocation.TOP, -1));

                    expect(tabs).equal("/r0/ts0/t0[newtab1]*,/r0/ts1/t0[One]*,/r1/ts0/t0[newtab2]*,/r1/ts1/t0[Two]*");
                });

                it("add to tabset bottom", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.BOTTOM, -1));

                    expect(tabs).equal("/r0/ts0/t0[One]*,/r0/ts1/t0[newtab1]*,/ts1/t0[Two]*");

                    const id1 = tabset("/ts1").getId();
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id1, DockLocation.BOTTOM, -1));

                    expect(tabs).equal("/r0/ts0/t0[One]*,/r0/ts1/t0[newtab1]*,/r1/ts0/t0[Two]*,/r1/ts1/t0[newtab2]*");
                });

                it("add to tabset left", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.LEFT, -1));

                    expect(tabs).equal("/ts0/t0[newtab1]*,/ts1/t0[One]*,/ts2/t0[Two]*");

                    const id1 = tabset("/ts2").getId();
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id1, DockLocation.LEFT, -1));

                    expect(tabs).equal("/ts0/t0[newtab1]*,/ts1/t0[One]*,/ts2/t0[newtab2]*,/ts3/t0[Two]*");
                });

                it("add to tabset right", () => {
                    const id0 = tabset("/ts0").getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.RIGHT, -1));

                    expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[newtab1]*,/ts2/t0[Two]*");

                    const id1 = tabset("/ts2").getId();
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id1, DockLocation.RIGHT, -1));

                    expect(tabs).equal("/ts0/t0[One]*,/ts1/t0[newtab1]*,/ts2/t0[Two]*,/ts3/t0[newtab2]*");
                });
            });

            describe("borders", () => {
                beforeEach(() => {
                    model = Model.fromJson(withBorders);
                    textRender(model);

                    expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");
                });

                it("add to top border", () => {
                    const path = "/b/top";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/top/t0[top1],/b/top/t1[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/top/t0[newtab2],/b/top/t1[top1],/b/top/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addTab({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/top/t0[newtab2],/b/top/t1[newtab3],/b/top/t2[top1],/b/top/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });

                it("add to bottom border", () => {
                    const path = "/b/bottom";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/bottom/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/bottom/t0[newtab2],/b/bottom/t1[bottom1],/b/bottom/t2[bottom2],/b/bottom/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addTab({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/bottom/t0[newtab2],/b/bottom/t1[newtab3],/b/bottom/t2[bottom1],/b/bottom/t3[bottom2],/b/bottom/t4[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });

                it("add to left border", () => {
                    const path = "/b/left";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/left/t0[left1],/b/left/t1[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/left/t0[newtab2],/b/left/t1[left1],/b/left/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addTab({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/left/t0[newtab2],/b/left/t1[newtab3],/b/left/t2[left1],/b/left/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });

                it("add to right border", () => {
                    const path = "/b/right";
                    const others = tabsDontMatch(path);
                    const id0 = border(path).getId();
                    doAction(Actions.addTab({ name: "newtab1", component: "grid" }, id0, DockLocation.CENTER, -1));

                    expect(tabsMatch(path)).equal("/b/right/t0[right1],/b/right/t1[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 0
                    doAction(Actions.addTab({ name: "newtab2", component: "grid" }, id0, DockLocation.CENTER, 0));

                    expect(tabsMatch(path)).equal("/b/right/t0[newtab2],/b/right/t1[right1],/b/right/t2[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);

                    // add tab at position 1
                    doAction(Actions.addTab({ name: "newtab3", component: "grid" }, id0, DockLocation.CENTER, 1));

                    expect(tabsMatch(path)).equal("/b/right/t0[newtab2],/b/right/t1[newtab3],/b/right/t2[right1],/b/right/t3[newtab1]");
                    expect(tabsDontMatch(path)).equal(others);
                });
            });
        });

        describe("Move", () => {
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
                expect(tabs).equal("/r0/ts0/t0[One]*,/r0/ts1/t0[Two]*,/ts1/t0[Three]*");
            });

            it("move to bottom", () => {
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.BOTTOM, -1));
                expect(tabs).equal("/r0/ts0/t0[Two]*,/r0/ts1/t0[One]*,/ts1/t0[Three]*");
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

        describe("Move to/from borders", () => {
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

            it("move tabset to border is rejected without losing the tabset", () => {
                const fromId = tabset("/ts0").getId();
                const toId = tab("/b/top").getId();
                doAction(Actions.moveNode(fromId, toId, DockLocation.CENTER, 0));
                expect(tabs).equal("/b/top/t0[top1],/b/bottom/t0[bottom1],/b/bottom/t1[bottom2],/b/left/t0[left1],/b/right/t0[right1],/ts0/t0[One]*");
            });
        });

        describe("Selection preserved on insert", () => {
            it("add tab before selected keeps same tab selected (tabset)", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", selected: 1, children: [{ type: "tab", name: "One" }, { type: "tab", name: "Two" }] }
                        ]
                    }
                });
                textRender(model);
                expect(tabs).equal("/ts0/t0[One],/ts0/t1[Two]*");

                doAction(Actions.addTab({ name: "New", component: "grid" }, "A", DockLocation.CENTER, 0, false));
                expect(tabs).equal("/ts0/t0[New],/ts0/t1[One],/ts0/t2[Two]*");
            });

            it("add tab before selected keeps same tab selected (border)", () => {
                model = Model.fromJson({
                    global: {},
                    borders: [
                        { type: "border", location: "top", selected: 1, children: [{ type: "tab", name: "top1" }, { type: "tab", name: "top2" }] }
                    ],
                    layout: {
                        type: "row",
                        children: [{ type: "tabset", children: [{ type: "tab", name: "One" }] }]
                    }
                });
                textRender(model);
                expect(tabs).equal("/b/top/t0[top1],/b/top/t1[top2]*,/ts0/t0[One]*");

                const borderId = border("/b/top").getId();
                doAction(Actions.addTab({ name: "New", component: "grid" }, borderId, DockLocation.CENTER, 0, false));
                expect(tabs).equal("/b/top/t0[New],/b/top/t1[top1],/b/top/t2[top2]*,/ts0/t0[One]*");
            });

            it("merge tabset before selected keeps same tab selected", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", selected: 1, children: [{ type: "tab", name: "One" }, { type: "tab", name: "Two" }] },
                            { type: "tabset", id: "B", children: [{ type: "tab", name: "Three" }] }
                        ]
                    }
                });
                textRender(model);
                expect(tabs).equal("/ts0/t0[One],/ts0/t1[Two]*,/ts1/t0[Three]*");

                doAction(Actions.moveNode("B", "A", DockLocation.CENTER, 0));
                expect(tabs).equal("/ts0/t0[Three],/ts0/t1[One],/ts0/t2[Two]*");
            });
        });

        describe("Splitter max size", () => {
            // splitter at index 1 sits between tabsets A and B; initial sizes [250, 250]
            const makeModel = (aAttrs: object, bAttrs: object) =>
                Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", ...aAttrs, children: [{ type: "tab", name: "One" }] },
                            { type: "tabset", id: "B", ...bAttrs, children: [{ type: "tab", name: "Two" }] }
                        ]
                    }
                });

            it("drag right caps growing left child at its own maxWidth", () => {
                model = makeModel({ maxWidth: 300 }, {});
                const row = model.getRootRow() as RowNode;
                row.calcMinMaxSize();
                // move splitter right by 100: A would grow 250 -> 350, must cap at 300
                const weights = row.calculateSplit(1, 350, [250, 250], 500, 250);
                expect(weights[0]).equal((300 * 100) / 500);
            });

            it("drag left caps growing right child at its own maxWidth", () => {
                model = makeModel({}, { maxWidth: 300 });
                const row = model.getRootRow() as RowNode;
                row.calcMinMaxSize();
                // move splitter left by 100: B would grow 250 -> 350, must cap at 300
                const weights = row.calculateSplit(1, 150, [250, 250], 500, 250);
                expect(weights[1]).equal((300 * 100) / 500);
            });
        });

        describe("Maximized tabset cleanup", () => {
            it("delete tabset clears maximized state", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", enableDeleteWhenEmpty: false, children: [{ type: "tab", name: "One" }] },
                            { type: "tabset", id: "B", children: [{ type: "tab", name: "Two" }] }
                        ]
                    }
                });
                textRender(model);
                const tsA = tabset("/ts0");

                doAction(Actions.maximizeToggle("A"));
                expect(model.getMaximizedTabset()).equal(tsA);

                doAction(Actions.deleteTabset("A"));
                expect(model.getMaximizedTabset()).equal(undefined);
            });

            it("popout of maximized tabset clears maximized state on its own layout", () => {
                model = Model.fromJson(twoTabs);
                textRender(model);
                const tsA = tabset("/ts0");
                const tsB = tabset("/ts1");

                doAction(Actions.popoutTabset(tsA.getId()));
                const windowLayoutId = tsA.getLayoutId();
                expect(windowLayoutId).not.equal(Model.MAIN_LAYOUT_ID);

                // move the second tabset into the same window so the layout survives the next popout
                doAction(Actions.moveNode(tsB.getId(), tsA.getId(), DockLocation.RIGHT, -1));
                doAction(Actions.maximizeToggle(tsA.getId(), windowLayoutId));
                expect(model.getMaximizedTabset(windowLayoutId)).equal(tsA);

                doAction(Actions.popoutTabset(tsA.getId()));
                expect(model.getMaximizedTabset(windowLayoutId)).equal(undefined);
            });
        });

        describe("Delete", () => {
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
                const fromId = tab("/ts0/t0").getId();
                const toId = tab("/ts1").getId();
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

        describe("Other Actions", () => {
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
                doAction(Actions.addTab({ name: "newtab1", component: "grid" }, tabset("/ts0").getId(), DockLocation.CENTER, -1));
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
                doAction(Actions.updateModelAttributes({ borderSize: 10 }));
                expect(model.getAttribute("borderSize")).equals(10);
            });

        });
    });

    describe("Node events", () => {
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

        it("visibility changes fire once per actual change", () => {
            const t = tab("/ts0/t0");
            const events: boolean[] = [];
            t.setEventListener("visibility", (p: { visible: boolean }) => { events.push(p.visible); });
            t.setVisible(true);   // false -> true, fires
            t.setVisible(true);   // no change, no event
            t.setVisible(false);  // true -> false, fires
            expect(events).toEqual([true, false]);
        });
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

// function row(path: string) {
//     return pathMap[path] as RowNode;
// }

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
    textRenderInner(pathMap, "", model.getRootRow()!.getChildren());
    tabs = tabsArray.join(",");
}

function textRenderInner(pathMap: Record<string, Node>, path: string, children: Node[]) {
    let index = 0;
    // let splitterIndex = 0;
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
            const newpath = path + "/r" + index++;
            pathMap[newpath] = c;
            textRenderInner(pathMap, newpath, c.getChildren());
        }
    });
}

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
