// @vitest-environment jsdom
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
            model = Model.fromJson({
                layout: {
                    type: "row",
                    children: [
                        {
                            type: "tabset",
                            children: [{ type: "tab", name: "One" }],
                        },
                    ],
                },
            });

            textRender(model);
            expect(tabs).equal("/ts0/t0[One]*");
        });

        it("clamps an out of range selected index from the json", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        {
                            type: "tabset",
                            selected: 5,
                            children: [
                                { type: "tab", name: "One" },
                                { type: "tab", name: "Two" },
                            ],
                        },
                    ],
                },
            });

            textRender(model);
            expect(tabs).equal("/ts0/t0[One],/ts0/t1[Two]*");
        });

        it("tolerates a dangling subLayoutId", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [{ type: "tabset", children: [{ type: "tab", id: "t1", name: "One", subLayoutId: "missing" }] }],
                },
            });

            const t = model.getNodeById("t1") as TabNode;
            expect(t.isCloseable()).equal(true);
            expect(() => t.isAllowedInWindow()).not.toThrow();
        });

        it("throws a descriptive error for an invalid row child type", function () {
            expect(() =>
                Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [{ type: "tab", name: "One" } as any],
                    },
                }),
            ).toThrowError(/invalid row child type "tab"/);
        });

        it("throws a descriptive error for an invalid tabset child type", function () {
            expect(() =>
                Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [{ type: "tabset", children: [{ type: "row", children: [] } as any] }],
                    },
                }),
            ).toThrowError(/invalid tabset child type "row"/);
        });

        it("accepts tabset and border children without an explicit type (legacy json)", function () {
            model = Model.fromJson({
                global: {},
                borders: [{ type: "border", location: "left", children: [{ name: "borderless" } as any] }],
                layout: { type: "row", children: [{ type: "tabset", children: [{ name: "One" } as any] }] },
            });
            textRender(model);
            expect(tabs).equal("/b/left/t0[borderless],/ts0/t0[One]*");
        });

        it("throws a descriptive error for an unknown border location", function () {
            expect(() =>
                Model.fromJson({
                    global: {},
                    borders: [{ type: "border", location: "ttop", children: [] } as any],
                    layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", name: "One" }] }] },
                }),
            ).toThrowError(/unknown dock location "ttop"/);
        });

        it("clamps a negative selected index from the json to no selection", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        {
                            type: "tabset",
                            selected: -5,
                            children: [{ type: "tab", name: "One" }],
                        },
                    ],
                },
            });
            expect(model.getFirstTabSet()!.getSelected()).equal(-1);
        });

        it("ignores a subLayouts entry keyed as the main layout id", function () {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [{ type: "tabset", children: [{ type: "tab", name: "One" }] }],
                },
                subLayouts: {
                    [Model.MAIN_LAYOUT_ID]: { type: "window", rect: { x: 0, y: 0, width: 100, height: 100 }, layout: { type: "row", children: [] } },
                } as any,
            });

            textRender(model);
            expect(tabs).equal("/ts0/t0[One]*");
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
                    { type: "border", location: "bottom", selected: 0, children: [] },
                ],
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", name: "One" }] }] },
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
                    children: [{ type: "tabset", children: [{ type: "tab", name: "One", minWidth: 300, maxWidth: 100 }] }],
                },
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
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "t1", name: "One" }] }] },
            });
            const t = model.getNodeById("t1") as TabNode;
            let resizes = 0;
            t.setEventListener("resize", () => {
                resizes++;
            });

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
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "t1", name: "One" }] }] },
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
                        {
                            type: "tabset",
                            children: [
                                { type: "tab", id: "tA", name: "A", subLayoutId: "L1" },
                                { type: "tab", name: "Keep" },
                            ],
                        },
                    ],
                },
                subLayouts: {
                    L1: { type: "tab", layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tB", name: "B", subLayoutId: "L2" }] }] } },
                    L2: { type: "tab", layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tC", name: "C" }] }] } },
                },
            });
            expect(model.getLayouts().has("L1")).equal(true);
            expect(model.getLayouts().has("L2")).equal(true);

            const closed: string[] = [];
            (model.getNodeById("tA") as TabNode).setEventListener("close", () => closed.push("A"));
            (model.getNodeById("tB") as TabNode).setEventListener("close", () => closed.push("B"));
            (model.getNodeById("tC") as TabNode).setEventListener("close", () => closed.push("C"));

            doAction(Actions.deleteTab("tA"));

            expect(model.getLayouts().has("L1")).equal(false);
            expect(model.getLayouts().has("L2")).equal(false);
            expect(closed).toEqual(["C", "B", "A"]);
        });

        it("deleting a tab releases the moveable elements of tabs in its nested sublayouts", function () {
            model = Model.fromJson({
                global: {},
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tA", name: "A", subLayoutId: "L1" }] }] },
                subLayouts: {
                    L1: { type: "tab", layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tB", name: "B", subLayoutId: "L2" }] }] } },
                    L2: { type: "tab", layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "tC", name: "C" }] }] } },
                },
            });
            const tB = model.getNodeById("tB") as TabNode;
            const tC = model.getNodeById("tC") as TabNode;
            const elB = tB.getMoveableElement();
            const elC = tC.getMoveableElement();

            doAction(Actions.deleteTab("tA"));

            expect(tB.getMoveableElement()).not.equal(elB);
            expect(tC.getMoveableElement()).not.equal(elC);
        });

        it("a model created from a previous model adopts its tabs' moveable elements", function () {
            const json: IJsonModel = {
                global: {},
                layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "t1", name: "One" }] }] },
            };
            const previous = Model.fromJson(json);
            const el = (previous.getNodeById("t1") as TabNode).getMoveableElement();

            model = Model.fromJson(json, previous);

            expect((model.getNodeById("t1") as TabNode).getMoveableElement()).equal(el);
            expect((previous.getNodeById("t1") as TabNode).getMoveableElement()).not.equal(el);
        });
    });

    describe("Actions", () => {
        describe("Add", () => {
            it("empty tabset", function () {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            {
                                type: "tabset",
                                id: "1",
                                enableDeleteWhenEmpty: false,
                                children: [],
                            },
                        ],
                    },
                });

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

            it("dock onto a nested row uses the row's own orientation", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            {
                                type: "row",
                                children: [
                                    { type: "tabset", children: [{ type: "tab", name: "One", component: "text" }] },
                                    { type: "tabset", children: [{ type: "tab", name: "Two", component: "text" }] },
                                ],
                            },
                            { type: "tabset", children: [{ type: "tab", name: "Three", component: "text" }] },
                        ],
                    },
                });
                textRender(model);
                // the nested row /r0 is vertical (root is horizontal) and holds One/Two; Three sits at root level
                expect(tabs).equal("/r0/ts0/t0[One]*,/r0/ts1/t0[Two]*,/ts1/t0[Three]*");
                // docking Three LEFT onto that vertical row must split horizontally: Three becomes a
                // left column with the vertical row to its right, not a tab stacked inside /r0
                const nestedRow = model.getRootRow()!.getChildren()[0];
                doAction(Actions.moveNode(tabset("/ts1").getId(), nestedRow.getId(), DockLocation.LEFT, -1));
                expect(tabs).equal("/ts0/t0[Three]*,/r1/ts0/t0[One]*,/r1/ts1/t0[Two]*");
            });

            it("dock onto a nested row respects a vertical root layout", () => {
                model = Model.fromJson({
                    global: { rootOrientationVertical: true },
                    layout: {
                        type: "row",
                        children: [
                            {
                                type: "row",
                                children: [
                                    { type: "tabset", children: [{ type: "tab", name: "One", component: "text" }] },
                                    { type: "tabset", children: [{ type: "tab", name: "Two", component: "text" }] },
                                ],
                            },
                            { type: "tabset", children: [{ type: "tab", name: "Three", component: "text" }] },
                        ],
                    },
                });
                textRender(model);
                // the nested row /r0 is horizontal (root is vertical) and holds One/Two; Three sits at root level
                expect(tabs).equal("/r0/ts0/t0[One]*,/r0/ts1/t0[Two]*,/ts1/t0[Three]*");
                // docking Three TOP onto that horizontal row must split vertically: Three becomes a
                // top row with the horizontal row below, not a tab stacked inside /r0
                const nestedRow = model.getRootRow()!.getChildren()[0];
                doAction(Actions.moveNode(tabset("/ts1").getId(), nestedRow.getId(), DockLocation.TOP, -1));
                expect(tabs).equal("/ts0/t0[Three]*,/r1/ts0/t0[One]*,/r1/ts1/t0[Two]*");
            });

            it("ignores moves into the dragged node's own subtree", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            {
                                type: "row",
                                id: "r1",
                                weight: 50,
                                children: [
                                    { type: "tabset", id: "ts_inner", weight: 50, children: [{ type: "tab", name: "One" }] },
                                    { type: "tabset", id: "ts_inner2", weight: 50, children: [{ type: "tab", name: "Three" }] },
                                ],
                            },
                            { type: "tabset", id: "ts_outer", weight: 50, children: [{ type: "tab", name: "Two" }] },
                        ],
                    },
                });
                textRender(model);
                const before = tabs;
                expect(before).equal("/r0/ts0/t0[One]*,/r0/ts1/t0[Three]*,/ts1/t0[Two]*");

                // dropping a row into its own descendant would corrupt the tree
                doAction(Actions.moveNode("r1", "ts_inner", DockLocation.CENTER, -1));
                doAction(Actions.moveNode("r1", "ts_inner", DockLocation.TOP, -1));
                // a node moved into itself is a no-op rather than a self-nesting cycle
                doAction(Actions.moveNode("r1", "r1", DockLocation.CENTER, 0));

                expect(tabs).equal(before);
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
                            {
                                type: "tabset",
                                id: "A",
                                selected: 1,
                                children: [
                                    { type: "tab", name: "One" },
                                    { type: "tab", name: "Two" },
                                ],
                            },
                        ],
                    },
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
                        {
                            type: "border",
                            location: "top",
                            selected: 1,
                            children: [
                                { type: "tab", name: "top1" },
                                { type: "tab", name: "top2" },
                            ],
                        },
                    ],
                    layout: {
                        type: "row",
                        children: [{ type: "tabset", children: [{ type: "tab", name: "One" }] }],
                    },
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
                            {
                                type: "tabset",
                                id: "A",
                                selected: 1,
                                children: [
                                    { type: "tab", name: "One" },
                                    { type: "tab", name: "Two" },
                                ],
                            },
                            { type: "tabset", id: "B", children: [{ type: "tab", name: "Three" }] },
                        ],
                    },
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
                            { type: "tabset", id: "B", ...bAttrs, children: [{ type: "tab", name: "Two" }] },
                        ],
                    },
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

        describe("Splitter weight conservation", () => {
            // splitter at index 1 sits between A and B in [A, B, C]
            const makeRow = (aAttrs: object, bAttrs: object, cAttrs: object) =>
                Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", ...aAttrs, children: [{ type: "tab", name: "One" }] },
                            { type: "tabset", id: "B", ...bAttrs, children: [{ type: "tab", name: "Two" }] },
                            { type: "tabset", id: "C", ...cAttrs, children: [{ type: "tab", name: "Three" }] },
                        ],
                    },
                });

            const sumWeights = (weights: number[]) => weights.reduce((a, b) => a + b, 0);

            it("conserves the total on a plain 3-child move in both directions", () => {
                model = makeRow({}, {}, {});
                const row = model.getRootRow() as RowNode;
                row.calcMinMaxSize();

                // moved right by 100: A grows, B shrinks, C unchanged
                const right = row.calculateSplit(1, 350, [250, 250, 250], 750, 250);
                expect(sumWeights(right)).toBeCloseTo(100);

                // moved left by 100: B grows, A shrinks, C unchanged
                const left = row.calculateSplit(1, 150, [250, 250, 250], 750, 250);
                expect(sumWeights(left)).toBeCloseTo(100);
            });

            it("propagates a growth cap on B to the non-adjacent child C", () => {
                model = makeRow({}, { maxWidth: 300 }, {});
                const row = model.getRootRow() as RowNode;
                row.calcMinMaxSize();
                // moved left by 200: B (250 -> 450) is capped at 300, so the overflow of 150 must
                // flow into C (250 -> 400); A shrinks to its min of 50. total must stay conserved
                const weights = row.calculateSplit(1, 50, [250, 250, 250], 750, 250);
                expect(weights[0]).toBeCloseTo((50 * 100) / 750);
                expect(weights[1]).toBeCloseTo((300 * 100) / 750);
                expect(weights[2]).toBeCloseTo((400 * 100) / 750);
                expect(sumWeights(weights)).toBeCloseTo(100);
            });

            it("propagates a shrink floor across the whole right side", () => {
                model = makeRow({}, { minWidth: 100 }, { minWidth: 100 });
                const row = model.getRootRow() as RowNode;
                row.calcMinMaxSize();
                // moved right by 300 to the bound (550): A (250 -> 550), B and C both floor at 100
                // and the remaining shift flows onward; the total must stay conserved
                const weights = row.calculateSplit(1, 550, [250, 250, 250], 750, 250);
                expect(sumWeights(weights)).toBeCloseTo(100);
                expect(weights[0]).toBeCloseTo((550 * 100) / 750);
                expect(weights[1]).toBeCloseTo((100 * 100) / 750);
                expect(weights[2]).toBeCloseTo((100 * 100) / 750);
            });
        });

        describe("Splitter bounds robustness", () => {
            it("keeps bounds ordered when the child min sizes exceed the available space", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", minWidth: 400, children: [{ type: "tab", name: "One" }] },
                            { type: "tabset", id: "B", minWidth: 400, children: [{ type: "tab", name: "Two" }] },
                            { type: "tabset", id: "C", minWidth: 400, children: [{ type: "tab", name: "Three" }] },
                        ],
                    },
                });
                const row = model.getRootRow() as RowNode;
                const children = row.getChildren();
                (children[0] as TabSetNode).setRect(new Rect(0, 0, 100, 100));
                (children[1] as TabSetNode).setRect(new Rect(108, 0, 100, 100));
                (children[2] as TabSetNode).setRect(new Rect(216, 0, 84, 100));

                const bounds = row.getSplitterBounds(1);
                // without the degenerate guard this would be [lo, hi] with lo > hi, collapsing every
                // splitter position and poisoning the weight math
                expect(bounds[0]).toBeLessThanOrEqual(bounds[1]);

                const weights = row.calculateSplit(1, bounds[0], [100, 100, 84], 284, 108);
                expect(weights.every((w) => Number.isFinite(w) && w >= 0)).equal(true);
            });

            it("does not invert bounds when a child has minWidth > maxWidth", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", minWidth: 300, maxWidth: 100, children: [{ type: "tab", name: "One" }] },
                            { type: "tabset", id: "B", children: [{ type: "tab", name: "Two" }] },
                        ],
                    },
                });
                const row = model.getRootRow() as RowNode;
                const children = row.getChildren();
                (children[0] as TabSetNode).setRect(new Rect(0, 0, 300, 100));
                (children[1] as TabSetNode).setRect(new Rect(308, 0, 200, 100));

                const bounds = row.getSplitterBounds(1);
                // without the per-child max clamp, A's maxWidth (100) would pull the upper bound
                // below the lower bound (300), inverting the range
                expect(bounds[0]).toBeLessThanOrEqual(bounds[1]);
            });

            it("calculateSplit returns an empty array instead of Infinity for an unmeasured row", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            { type: "tabset", id: "A", children: [{ type: "tab", name: "One" }] },
                            { type: "tabset", id: "B", children: [{ type: "tab", name: "Two" }] },
                        ],
                    },
                });
                const row = model.getRootRow() as RowNode;
                // zero rects -> zero sum: a division by zero would otherwise emit Infinity weights
                expect(row.calculateSplit(1, 100, [0, 0], 0, 100)).toEqual([]);
            });

            it("ignores non-finite weights in adjustWeights", () => {
                model = Model.fromJson(twoTabs);
                textRender(model);
                const row = model.getRootRow()!;
                const w0 = (row.getChildren()[0] as TabSetNode).getWeight();

                doAction(Actions.adjustWeights(row.getId(), [Infinity, 5]));
                expect((row.getChildren()[0] as TabSetNode).getWeight()).equal(w0);
                expect((row.getChildren()[1] as TabSetNode).getWeight()).equal(5);
            });
        });

        describe("Border splitter bounds", () => {
            const locations = ["top", "left", "bottom", "right"] as const;
            const makeModel = (location: (typeof locations)[number]) =>
                Model.fromJson({
                    global: {},
                    borders: [{ type: "border", location, size: 100, children: [{ type: "tab", name: "B" }] }],
                    layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", name: "T" }] }] },
                });

            for (const location of locations) {
                it(`returns ordered finite bounds and a consistent split for the ${location} border`, () => {
                    model = makeModel(location);
                    const border = model.getBorderSet().getBorderMap().get(DockLocation.getByName(location)) as BorderNode;
                    // measured inner area (the root row) plus the border's own tab strip
                    model.getRootRow()!.setRect(new Rect(10, 10, 500, 300));
                    if (location === "top") {
                        border.setTabHeaderRect(new Rect(10, 0, 500, 20)); // strip above the inner area
                    } else if (location === "left") {
                        border.setTabHeaderRect(new Rect(0, 10, 20, 300)); // strip left of the inner area
                    } else if (location === "bottom") {
                        border.setTabHeaderRect(new Rect(10, 310, 500, 20)); // strip below the inner area
                    } else {
                        border.setTabHeaderRect(new Rect(510, 10, 20, 300)); // strip right of the inner area
                    }

                    const bounds = border.getSplitterBounds(true);
                    expect(Number.isFinite(bounds[0])).equal(true);
                    expect(bounds[0]).toBeLessThanOrEqual(bounds[1]);

                    const sizeAtMin = border.calculateSplit(border, bounds[0]);
                    const sizeAtMax = border.calculateSplit(border, bounds[1]);
                    expect(Number.isFinite(sizeAtMin)).equal(true);
                    expect(Number.isFinite(sizeAtMax)).equal(true);
                    expect(sizeAtMin).toBeGreaterThanOrEqual(0);
                    expect(sizeAtMax).toBeGreaterThanOrEqual(0);
                    // growing the splitter grows the border for top/left and shrinks it for
                    // bottom/right
                    if (location === "top" || location === "left") {
                        expect(sizeAtMax).toBeGreaterThanOrEqual(sizeAtMin);
                    } else {
                        expect(sizeAtMin).toBeGreaterThanOrEqual(sizeAtMax);
                    }
                });
            }

            it("returns [0,0] before the root row has been measured", () => {
                model = makeModel("left");
                const border = model.getBorderSet().getBorderMap().get(DockLocation.LEFT) as BorderNode;
                border.setTabHeaderRect(new Rect(0, 10, 20, 300));
                // the root row rect is still Rect.empty(): clamp against its edges must not produce
                // negative/locked bounds
                expect(border.getSplitterBounds(true)).toEqual([0, 0]);
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
                            { type: "tabset", id: "B", children: [{ type: "tab", name: "Two" }] },
                        ],
                    },
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

            it("moving an ancestor row of the maximized tabset clears maximized state", () => {
                model = Model.fromJson({
                    global: {},
                    layout: {
                        type: "row",
                        children: [
                            {
                                type: "row",
                                id: "r1",
                                weight: 50,
                                children: [
                                    { type: "tabset", id: "ts_inner", weight: 50, children: [{ type: "tab", name: "One" }] },
                                    { type: "tabset", id: "ts_inner2", weight: 50, children: [{ type: "tab", name: "Three" }] },
                                ],
                            },
                            { type: "tabset", id: "ts_outer", weight: 50, children: [{ type: "tab", name: "Two" }] },
                        ],
                    },
                });
                textRender(model);

                doAction(Actions.maximizeToggle("ts_inner"));
                expect(model.getMaximizedTabset()).equal(tabset("/r0/ts0"));

                // moving the row containing the maximized tabset must not leave a stale reference
                // behind (it would reroute all drop targeting to the displaced tabset)
                doAction(Actions.moveNode("r1", "ts_outer", DockLocation.RIGHT, -1));
                expect(model.getMaximizedTabset()).equal(undefined);

                // moving a node unrelated to the maximized tabset keeps it maximized
                doAction(Actions.maximizeToggle("ts_outer"));
                expect(model.getMaximizedTabset()).equal(tabset("/ts0"));
            });
        });

        describe("Active tabset cleanup", () => {
            it("popout of the active tabset clears the source layout's active reference", () => {
                model = Model.fromJson(twoTabs);
                textRender(model);
                const tsA = tabset("/ts0");

                doAction(Actions.setActiveTabset(tsA.getId()));
                expect(model.getActiveTabset()).equal(tsA);

                doAction(Actions.popoutTabset(tsA.getId()));
                // tsA now belongs to the popout layout: the main layout must not report it as active
                expect(model.getActiveTabset()).equal(undefined);
                // the popout layout owns the tabset and inherits its active state
                expect(model.getActiveTabset(tsA.getLayoutId())).equal(tsA);
            });

            it("popout of a non-active tabset keeps the active tabset", () => {
                model = Model.fromJson(twoTabs);
                textRender(model);
                const tsA = tabset("/ts0");

                doAction(Actions.setActiveTabset(tsA.getId()));
                doAction(Actions.popoutTabset(tabset("/ts1").getId()));

                expect(model.getActiveTabset()).equal(tsA);
            });
        });

        describe("Delete", () => {
            beforeEach(() => {});

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
            tab("/ts0/t0").setEventListener("close", () => {
                closed = true;
            });
            doAction(Actions.deleteTab(tab("/ts0/t0").getId()));
            expect(closed).equals(true);
        });

        it("close listener can still reach the tab's moveable element", () => {
            const t = tab("/ts0/t0");
            const el = t.getMoveableElement();
            let elInClose: HTMLElement | undefined;
            t.setEventListener("close", () => {
                elInClose = t.getMoveableElement();
            });
            doAction(Actions.deleteTab(t.getId()));
            expect(elInClose).equal(el);
        });

        it("delete tabset closes its closeable tabs and keeps the others", () => {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        {
                            type: "tabset",
                            id: "ts",
                            children: [
                                { type: "tab", id: "a", name: "A" },
                                { type: "tab", id: "b", name: "B", enableClose: false },
                                { type: "tab", id: "c", name: "C" },
                            ],
                        },
                    ],
                },
            });
            const closed: string[] = [];
            for (const id of ["a", "b", "c"]) {
                (model.getNodeById(id) as TabNode).setEventListener("close", () => closed.push(id));
            }

            doAction(Actions.deleteTabset("ts"));

            expect(closed).toEqual(["a", "c"]);
            expect(model.getNodeById("a")).toBeUndefined();
            expect(model.getNodeById("b")).toBeInstanceOf(TabNode);
            expect(model.getNodeById("c")).toBeUndefined();
        });

        it("delete tab releases its moveable element", () => {
            const t = tab("/ts0/t0");
            const el = t.getMoveableElement();
            doAction(Actions.deleteTab(t.getId()));
            expect(t.getMoveableElement()).not.equal(el);
        });

        it("delete tabset releases the moveable elements of the tabs it closes", () => {
            model = Model.fromJson({
                global: {},
                layout: {
                    type: "row",
                    children: [
                        {
                            type: "tabset",
                            id: "ts",
                            children: [
                                { type: "tab", id: "a", name: "A" },
                                { type: "tab", id: "b", name: "B", enableClose: false },
                            ],
                        },
                    ],
                },
            });
            const a = model.getNodeById("a") as TabNode;
            const b = model.getNodeById("b") as TabNode;
            const elA = a.getMoveableElement();
            const elB = b.getMoveableElement();

            doAction(Actions.deleteTabset("ts"));

            expect(a.getMoveableElement()).not.equal(elA);
            expect(b.getMoveableElement()).equal(elB);
        });

        it("save tab", () => {
            let saved = false;
            tab("/ts0/t0").setEventListener("save", () => {
                saved = true;
            });
            model.toJson();
            expect(saved).equals(true);
        });

        it("visibility changes fire once per actual change", () => {
            const t = tab("/ts0/t0");
            const events: boolean[] = [];
            t.setEventListener("visibility", (p: { visible: boolean }) => {
                events.push(p.visible);
            });
            t.setVisible(true); // false -> true, fires
            t.setVisible(true); // no change, no event
            t.setVisible(false); // true -> false, fires
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
    return tabsArray.filter((t) => regex.test(t)).join(",");
}

function tabsDontMatch(regExStr: string) {
    const regex = new RegExp(regExStr);
    return tabsArray.filter((t) => !regex.test(t)).join(",");
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
            const parent = c.getParent() as BorderNode | TabSetNode;
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
                    },
                ],
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
                    },
                ],
            },
        ],
    },
};

const withBorders: IJsonModel = {
    global: {},
    borders: [
        {
            type: "border",
            location: "top",
            children: [
                {
                    type: "tab",
                    name: "top1",
                    component: "text",
                },
            ],
        },
        {
            type: "border",
            location: "bottom",
            children: [
                {
                    type: "tab",
                    name: "bottom1",
                    component: "text",
                },
                {
                    type: "tab",
                    name: "bottom2",
                    component: "text",
                },
            ],
        },
        {
            type: "border",
            location: "left",
            children: [
                {
                    type: "tab",
                    name: "left1",
                    component: "text",
                },
            ],
        },
        {
            type: "border",
            location: "right",
            children: [
                {
                    type: "tab",
                    name: "right1",
                    component: "text",
                },
            ],
        },
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
                    },
                ],
            },
        ],
    },
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
                    },
                ],
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
                    },
                ],
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Three",
                        component: "text",
                    },
                ],
            },
        ],
    },
};

describe("attribute definitions", () => {
    it("pairs the global attributes with the node attributes at runtime", () => {
        const global = Model.getGlobalAttributeDefinitions();
        const tabSetEnableClose = global.getAttributes().find((a) => a.name === "tabSetEnableClose")!;
        expect(tabSetEnableClose.pairedAttr?.name).toBe("enableClose");
        expect(tabSetEnableClose.pairedType).toBe("TabSetNode");

        const tabEnableClose = global.getAttributes().find((a) => a.name === "tabEnableClose")!;
        expect(tabEnableClose.pairedAttr?.name).toBe("enableClose");
        expect(tabEnableClose.pairedType).toBe("TabNode");

        const borderSize = global.getAttributes().find((a) => a.name === "borderSize")!;
        expect(borderSize.pairedAttr?.name).toBe("size");
        expect(borderSize.pairedType).toBe("BorderNode");

        // the node side is reciprocal
        const enableClose = TabSetNode.getAttributeDefinitions()
            .getAttributes()
            .find((a) => a.name === "enableClose")!;
        expect(enableClose.pairedAttr?.name).toBe("tabSetEnableClose");
    });

    it("resolves the effective type of an inherited attribute from its global counterpart", () => {
        const tabSetDefs = TabSetNode.getAttributeDefinitions().getAttributes();
        const minWidth = tabSetDefs.find((a) => a.name === "minWidth")!;
        expect(minWidth.getEffectiveType()).toBe("number");

        const tabLocation = tabSetDefs.find((a) => a.name === "tabLocation")!;
        expect(tabLocation.getEffectiveType()).toBe("ITabLocation");

        const enableClose = tabSetDefs.find((a) => a.name === "enableClose")!;
        expect(enableClose.getEffectiveType()).toBe("boolean");
    });

    it("keeps an explicitly set type and returns undefined for a free-form 'any' attribute", () => {
        const tabNodeDefs = TabNode.getAttributeDefinitions().getAttributes();
        const enableClose = tabNodeDefs.find((a) => a.name === "enableClose")!;
        expect(enableClose.getEffectiveType()).toBe("boolean");

        const config = tabNodeDefs.find((a) => a.name === "config")!;
        expect(config.getEffectiveType()).toBeUndefined();
    });
});

describe("enableFloat attribute", () => {
    const model = () =>
        Model.fromJson({
            global: {},
            layout: {
                type: "row",
                children: [
                    {
                        type: "tabset",
                        id: "ts0",
                        children: [{ type: "tab", id: "t0", name: "One", component: "text" }],
                    },
                ],
            },
        });

    it("enableFloat is independent of enablePopout", () => {
        const m = model();
        const tab = m.getNodeById("t0") as TabNode;
        expect(tab.isEnableFloat()).toBe(false);
        expect(tab.isEnablePopout()).toBe(false);
        m.doAction(Actions.updateNodeAttributes("t0", { enableFloat: true } as any));
        expect(tab.isEnableFloat()).toBe(true);
        expect(tab.isEnablePopout()).toBe(false);
    });

    it("enableFloat inherits the tabEnableFloat global", () => {
        const m = model();
        const tab = m.getNodeById("t0") as TabNode;
        m.doAction(Actions.updateModelAttributes({ tabEnableFloat: true } as any));
        expect(tab.isEnableFloat()).toBe(true);
        expect(tab.isEnablePopout()).toBe(false);
    });

    it("setting enableFloat to undefined removes the override", () => {
        const m = model();
        const tab = m.getNodeById("t0") as TabNode;
        m.doAction(Actions.updateNodeAttributes("t0", { enableFloat: true } as any));
        m.doAction(Actions.updateNodeAttributes("t0", { enableFloat: undefined } as any));
        expect(tab.getAttributeOwn("enableFloat")).toBeUndefined();
        expect(tab.isEnableFloat()).toBe(false);
    });

    it("updateModelAttributes honors tabEnableFloat", () => {
        const m = model();
        const tab = m.getNodeById("t0") as TabNode;
        m.doAction(Actions.updateModelAttributes({ tabEnableFloat: true } as any));
        expect(tab.isEnableFloat()).toBe(true);
    });

    it("enableFloatIcon honors the tabEnablePopoutFloatIcon alias", () => {
        const m = model();
        const tab = m.getNodeById("t0") as TabNode;
        expect(tab.isEnableFloatIcon()).toBe(false);
        m.doAction(Actions.updateModelAttributes({ tabEnablePopoutFloatIcon: true } as any));
        expect(tab.isEnableFloatIcon()).toBe(true);
    });
});

describe("getAttributeOwn", () => {
    it("returns the own value without the global fallback, exposing overrides", () => {
        const model = Model.fromJson({
            global: { tabEnableClose: true },
            layout: {
                type: "row",
                children: [{ type: "tabset", children: [{ type: "tab", id: "t0", name: "One" }] }],
            },
        });
        const tab = model.getNodeById("t0") as TabNode;

        // inherited attribute not overridden: no own value, getAttr falls back to the global
        expect(tab.getAttributeOwn("enableClose")).toBeUndefined();
        expect(tab.getAttr("enableClose")).toBe(true);

        // overriding it sets the own value
        model.doAction(Actions.updateNodeAttributes("t0", { enableClose: false }));
        expect(tab.getAttributeOwn("enableClose")).toBe(false);
        expect(tab.getAttr("enableClose")).toBe(false);

        // own attributes always have a value, unknown names do not
        expect(tab.getAttributeOwn("name")).toBe("One");
        expect(tab.getAttributeOwn("nonexistent")).toBeUndefined();
    });
});
