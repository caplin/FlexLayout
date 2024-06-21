import * as React from "react";
import { CLASSES } from "../src/Types";
import { App, twoTabs, threeTabs, withBorders } from "./App";
import { AppEx, layoutEx2, layoutEx1 } from "./AppEx";


enum Location {
    TOP, BOTTOM,LEFT,RIGHT,CENTER,
    LEFTEDGE
}
/*

    Key elements have data-layout-path attributes:

    /ts0 - the first tabset in the root row
    /ts1 - the second tabset in the root row
    /ts1/tabstrip - the second tabsets tabstrip
    /ts1/header - the second tabsets header
    /c2/ts0 - the first tabset in the column at position 2 in the root row
    /s0 - the first splitter in the root row (the one after the first tabset/column)
    /ts1/t2 - the third tab (the tab content) in the second tabset in the root row
    /ts1/tb2 - the third tab button (the tab button in the tabstrip) in the second tabset in the root row
    /border/top/t1
    /border/top/tb1
    ...

    Note: use it.only(... to run a single test

*/

describe("Drag tests", () => {
    context("two tabs", () => {
        beforeEach(() => {
            mount(<App json={twoTabs} />);
            findAllTabSets().should("have.length", 2);
            // find the first tab button in the first tabset
            // the .as() function gives an alias (name) to this element that can be used later using the @ selector
            findTabButton("/ts0", 0).as("from");
        });

        it("tab to tab center", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.CENTER); // drag to the center of the @to tabset
            findAllTabSets().should("have.length", 1);
            checkTab("/ts0", 0, false, "Two");
            checkTab("/ts0", 1, true, "One");
        })

        it("tab to tab top", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.TOP);
            findAllTabSets().should("have.length", 2);
            checkTab("/c0/ts0", 0, true, "One");
            checkTab("/c0/ts1", 0, true, "Two");
        })

        it("tab to tab bottom", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.BOTTOM);
            findAllTabSets().should("have.length", 2);
            checkTab("/c0/ts0", 0, true, "Two");
            checkTab("/c0/ts1", 0, true, "One");
        })

        it("tab to tab left", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.LEFT);
            findAllTabSets().should("have.length", 2);
            checkTab("/ts0", 0, true, "One");
            checkTab("/ts1", 0, true, "Two");
        })

        it("tab to tab right", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.RIGHT);
            findAllTabSets().should("have.length", 2);
            checkTab("/ts0", 0, true, "Two");
            checkTab("/ts1", 0, true, "One");
        })

        it("tab to edge", () => {
            dragToEdge("@from", 2);
            checkTab("/c0/ts0", 0, true, "Two");
            checkTab("/c0/ts1", 0, true, "One");
        })
    });

    context("three tabs", () => {
        beforeEach(() => {
            mount(<App json={threeTabs} />);
            findAllTabSets().should("have.length", 3);
            findTabButton("/ts0", 0).as("from");
        });

        it("tab to tabset", () => {
            findPath("/ts1/tabstrip").as("to");
            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 2);
            checkTab("/ts0", 0, false, "Two");
            checkTab("/ts0", 1, true, "One");
            checkTab("/ts1", 0, true, "Three");
        })

        it("tab to tab center", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 2);
            checkTab("/ts0", 0, false, "Two");
            checkTab("/ts0", 1, true, "One");
            checkTab("/ts1", 0, true, "Three");
        })

        it("tab to tab top", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.TOP);
            findAllTabSets().should("have.length", 3);
            checkTab("/c0/ts0", 0, true, "One");
            checkTab("/c0/ts1", 0, true, "Two");
            checkTab("/ts1", 0, true, "Three");
        })

        it("tab to tab bottom", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.BOTTOM);
            findAllTabSets().should("have.length", 3);
            checkTab("/c0/ts0", 0, true, "Two");
            checkTab("/c0/ts1", 0, true, "One");
            checkTab("/ts1", 0, true, "Three");
        })

        it("tab to tab left", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.LEFT);
            findAllTabSets().should("have.length", 3);
            checkTab("/ts0", 0, true, "One");
            checkTab("/ts1", 0, true, "Two");
            checkTab("/ts2", 0, true, "Three");
        })

        it("tab to tab right", () => {
            findPath("/ts1/t0").as("to");
            drag("@from", "@to", Location.RIGHT);
            findAllTabSets().should("have.length", 3);
            checkTab("/ts0", 0, true, "Two");
            checkTab("/ts1", 0, true, "One");
            checkTab("/ts2", 0, true, "Three");
        })

        it("tab to edge top", () => {
            dragToEdge("@from", 0);
            checkTab("/c0/ts0", 0, true, "One");
            checkTab("/c0/r1/ts0", 0, true, "Two");
            checkTab("/c0/r1/ts1", 0, true, "Three");
        })

        it("tab to edge left", () => {
            dragToEdge("@from", 1);
            checkTab("/ts0", 0, true, "One");
            checkTab("/ts1", 0, true, "Two");
            checkTab("/ts2", 0, true, "Three");
        })

        it("tab to edge bottom", () => {
            dragToEdge("@from", 2);
            checkTab("/c0/r0/ts0", 0, true, "Two");
            checkTab("/c0/r0/ts1", 0, true, "Three");
            checkTab("/c0/ts1", 0, true, "One");
        })

        it("tab to edge right", () => {
            dragToEdge("@from", 3);
            checkTab("/ts0", 0, true, "Two");
            checkTab("/ts1", 0, true, "Three");
            checkTab("/ts2", 0, true, "One");
        })

        it("row to column", () => {
            findPath("/ts2/t0").as("to");
            drag("@from", "@to", Location.BOTTOM);

            findTabButton("/ts0", 0).as("from");
            findPath("/c1/ts0/t0").as("to");
            drag("@from", "@to", Location.BOTTOM);

            findAllTabSets().should("have.length", 3);
            checkTab("/c0/ts0", 0, true, "Three");
            checkTab("/c0/ts1", 0, true, "Two");
            checkTab("/c0/ts2", 0, true, "One");
        })

        it("row to single tabset", () => {
            findPath("/ts2/t0").as("to");
            drag("@from", "@to", Location.CENTER);

            findTabButton("/ts0", 0).as("from");
            findPath("/ts1/t1").as("to");
            drag("@from", "@to", Location.CENTER);

            findAllTabSets().should("have.length", 1);
            checkTab("/ts0", 0, false, "Three");
            checkTab("/ts0", 1, false, "One");
            checkTab("/ts0", 2, true, "Two");
        })

        it("move tab in tabstrip", () => {
            findPath("/ts2/t0").as("to");
            drag("@from", "@to", Location.CENTER);

            findTabButton("/ts0", 0).as("from");
            findPath("/ts1/t1").as("to");
            drag("@from", "@to", Location.CENTER);
            checkTab("/ts0", 0, false, "Three");
            checkTab("/ts0", 1, false, "One");
            checkTab("/ts0", 2, true, "Two");
            // now all in single tabstrip

            findTabButton("/ts0", 2).as("from");
            findTabButton("/ts0", 0).as("to");
            drag("@from", "@to", Location.LEFT);
            checkTab("/ts0", 0, true, "Two");
            checkTab("/ts0", 1, false, "Three");
            checkTab("/ts0", 2, false, "One");
        })

        it("move tabstrip", () => {
            findPath("/ts2/tabstrip").as("from");
            findPath("/ts0/t0").as("to");
            drag("@from", "@to", Location.CENTER);

            checkTab("/ts0", 0, true, "One");
            checkTab("/ts0", 1, false, "Three");
            checkTab("/ts1", 0, true, "Two");

            findPath("/ts0/tabstrip").as("from");
            findPath("/ts1/tabstrip").as("to");
            drag("@from", "@to", Location.CENTER);

            checkTab("/ts0", 0, true, "Two");
            checkTab("/ts0", 1, false, "One");
            checkTab("/ts0", 2, false, "Three");
        })

        it("move using header", () => {
            findPath("/ts1/header").as("from");
            findPath("/ts0/t0").as("to");
            drag("@from", "@to", Location.TOP);

            checkTab("/c0/ts0", 0, true, "Two");
            checkTab("/c0/ts1", 0, true, "One");
            checkTab("/ts1", 0, true, "Three");

        })
    })

    context("borders", () => {
        beforeEach(() => {
            mount(<App json={withBorders} />);
            findAllTabSets().should("have.length", 3);
        });

        const borderToTabTest = (border, tabtext, index) => {
            findTabButton(border, 0).as("from");
            findPath("/ts0/t0").as("to");
            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 3);
            checkTab("/ts0", 0, false, "One");
            checkTab("/ts0", index, true, tabtext);
        };

        it("border top to tab", () => {
            borderToTabTest("/border/top", "top1", 1);
        })

        it("border bottom to tab", () => {
            borderToTabTest("/border/bottom", "bottom1", 1);
        })

        it("border left to tab", () => {
            borderToTabTest("/border/left", "left1", 1);
        })

        it("border right to tab", () => {
            borderToTabTest("/border/right", "right1", 1);
        })

        const tabToBorderTest = (border, tabtext, index) => {
            findTabButton("/ts0", 0).as("from");
            findTabButton(border, 0).as("to");
            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 2);
            checkBorderTab(border, 0, false, tabtext);
            checkBorderTab(border, index, false, "One");
        };

        it("tab to border top", () => {
            tabToBorderTest("/border/top", "top1", 1);
        })

        it("tab to border bottom", () => {
            tabToBorderTest("/border/bottom", "bottom1", 1);
        })

        it("tab to border left", () => {
            tabToBorderTest("/border/left", "left1", 1);
        })

        it("tab to border right", () => {
            tabToBorderTest("/border/right", "right1", 1);
        })

        const openTabTest = (border, tabtext, index) => {
            findTabButton(border, 0).as("to").click();
            findTabButton("/ts0", 0).as("from");
            findPath(border).as("to");

            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 2);
            checkBorderTab(border, 0, false, tabtext);
            checkBorderTab(border, index, true, "One");
        };

        it("tab to open border top", () => {
            openTabTest("/border/top", "top1", 1);
        })

        it("tab to open border bottom", () => {
            openTabTest("/border/bottom", "bottom1", 2);
        })

        it("tab to open border left", () => {
            openTabTest("/border/left", "left1", 1);
        })

        it("tab to open border right", () => {
            openTabTest("/border/right", "right1", 1);
        })

        const openTabCenterTest = (border, tabtext, index) => {
            findTabButton(border, 0).click();
            findTabButton("/ts0", 0).as("from");
            findPath(border + "/t0").as("to");

            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 2);
            checkBorderTab(border, 0, false, tabtext);
            checkBorderTab(border, index, true, "One");
        };

        it("tab to open border top center", () => {
            openTabCenterTest("/border/top", "top1", 1);
        })

        it("tab to open border bottom center", () => {
            openTabCenterTest("/border/bottom", "bottom1", 2);
        })

        it("tab to open border left center", () => {
            openTabCenterTest("/border/left", "left1", 1);
        })

        it("tab to open border right center", () => {
            openTabCenterTest("/border/right", "right1", 1);
        })

        const inBorderTabMoveTest = (border, tabtext, index) => {
            findTabButton("/ts0", 0).as("from");
            findPath(border).as("to");
            drag("@from", "@to", Location.CENTER);
            findAllTabSets().should("have.length", 2);
            checkBorderTab(border, 0, false, tabtext);
            checkBorderTab(border, index, false, "One");

            findTabButton(border, 0).as("from");
            findTabButton(border, index).as("to");
            drag("@from", "@to", Location.RIGHT);
            checkBorderTab(border, index, false, tabtext);
        };

        it("move tab in border top", () => {
            inBorderTabMoveTest("/border/top", "top1", 1);
        })

        it("move tab in border bottom", () => {
            inBorderTabMoveTest("/border/bottom", "bottom1", 2);
        })

        it("move tab in border left", () => {
            inBorderTabMoveTest("/border/left", "left1", 1);
        })

        it("move tab in border right", () => {
            inBorderTabMoveTest("/border/right", "right1", 1);
        })
    })

    context("Splitters", () => {
        beforeEach(() => {
            mount(<App json={twoTabs} />);
        });

        it("vsplitter", () => {
            findPath("/s0").as("from");
            dragsplitter("@from", false, 100); // right 100px
            findPath("/ts1").then(e1 => {
                const w1 = e1.width();
                findPath("/ts0").then(e2 => {
                    const w2 = e2.width();
                    assert.isTrue(w2 - w1 > 99);
                });
            });
        })

        it("vsplitter to edge", () => {
            findPath("/s0").as("from");
            dragsplitter("@from", false, 1000); // to right edge
            dragsplitter("@from", false, -100); // 100px back
            findPath("/ts1").then(e1 => {
                const w1 = e1.width();
                assert.isTrue(Math.abs(w1 - 100) < 2);
            });
        })

        it("vsplitter to edge left", () => {
            findPath("/s0").as("from");
            dragsplitter("@from", false, -1000); // to left edge
            dragsplitter("@from", false, 100); // 100px back
            findPath("/ts0").then(e1 => {
                const w1 = e1.width();
                assert.isTrue(Math.abs(w1 - 100) < 2);
            });
        })

        context("horizontal", () => {
            beforeEach(() => {
                findTabButton("/ts0", 0).as("from");
                findPath("/ts1/t0").as("to");
                drag("@from", "@to", Location.BOTTOM);
                findAllTabSets().should("have.length", 2);
                checkTab("/c0/ts0", 0, true, "Two");
                checkTab("/c0/ts1", 0, true, "One");
            });

            it("hsplitter", () => {
                findPath("/c0/s0").as("from");
                dragsplitter("@from", true, 100); // down 100px
                findPath("/c0/ts1").then(e1 => {
                    const h1 = e1.height();
                    findPath("/c0/ts0").then(e2 => {
                        const h2 = e2.height();
                        assert.isTrue(h2 - h1 > 99);
                    });
                });
            })

            it("hsplitter to edge", () => {
                findPath("/c0/s0").as("from");
                dragsplitter("@from", true, 1000); // to bottom edge
                dragsplitter("@from", true, -100); // 100px back
                findPath("/c0/ts1").then(e1 => {
                    const h1 = e1.height();
                    assert.isTrue(Math.abs(h1 - 100) < 2);
                });
            })

            it("hsplitter to edge top", () => {
                findPath("/c0/s0").as("from");
                dragsplitter("@from", true, -1000); // to top edge
                dragsplitter("@from", true, 100); // 100px back
                findPath("/c0/ts0").then(e1 => {
                    const h1 = e1.height();
                    assert.isTrue(Math.abs(h1 - 100) < 2);
                });
            })
        })
    })
})

context("Overflow menu", () => {
    beforeEach(() => {
        mount(<App json={withBorders} />);
        findPath("/ts0/tabstrip").click();
        cy.get("[data-id=add-active").click();
        cy.get("[data-id=add-active").click();

    });

    it("show menu", () => {
        findPath("/ts0/button/overflow").should("not.exist");
        findPath("/s0").as("from");
        dragsplitter("@from", false, -1000); // to left edge
        dragsplitter("@from", false, 150); // 100px back

        checkTab("/ts0", 2, true, "Text1").should("be.visible");
        checkTab("/ts0", 0, false, "One").should("not.be.visible");
        findPath("/ts0/button/overflow")
            .should("exist")
            .click();
        findPath("/popup-menu")
            .should("exist");

        findPath("/popup-menu/tb0")
            .click();

        checkTab("/ts0", 2, false, "Text1").should("not.be.visible");
        checkTab("/ts0", 0, true, "One").should("be.visible");

        // now expand the tabset so oveflow menu dissapears
        dragsplitter("@from", false, 300);
        findPath("/ts0/button/overflow").should("not.exist");
    })
})

context("Add methods", () => {
    beforeEach(() => {
        mount(<App json={withBorders} />);
        findAllTabSets().should("have.length", 3);
    });

    it("drag to tabset", () => {
        cy.get("[data-id=add-drag").as("from");
        findPath("/ts1/tabstrip").as("to"); // drag to the second tabset
        drag("@from", "@to", Location.CENTER);
        findAllTabSets().should("have.length", 3);
        checkTab("/ts1", 0, false, "Two");
        checkTab("/ts1", 1, true, "Text0");
    })

    it("drag to border", () => {
        cy.get("[data-id=add-drag").as("from");
        findPath("/border/right").as("to");
        drag("@from", "@to", Location.CENTER);
        findAllTabSets().should("have.length", 3);
        checkBorderTab("/border/right", 0, false, "right1");
        checkBorderTab("/border/right", 1, false, "Text0");
    })

    it("drag indirect to tabset", () => {
        cy.get("[data-id=add-indirect").click();
        findPath("/drag-rectangle").as("from");
        findPath("/ts1/tabstrip").as("to"); // drag to the second tabset
        drag("@from", "@to", Location.CENTER);
        findAllTabSets().should("have.length", 3);
        checkTab("/ts1", 0, false, "Two");
        checkTab("/ts1", 1, true, "Text0");
    })

    it("drag indirect to border", () => {
        cy.get("[data-id=add-indirect").click();
        findPath("/drag-rectangle").as("from");
        findPath("/border/right").as("to");
        drag("@from", "@to", Location.CENTER);
        findAllTabSets().should("have.length", 3);
        checkBorderTab("/border/right", 0, false, "right1");
        checkBorderTab("/border/right", 1, false, "Text0");
    })

    it("add to tabset with id #1", () => {
        cy.get("[data-id=add-byId").click();
        findAllTabSets().should("have.length", 3);
        checkTab("/ts1", 0, false, "Two");
        checkTab("/ts1", 1, true, "Text0");
    })

    it("add to active tabset", () => {
        findPath("/ts1/tabstrip").click();
        cy.get("[data-id=add-active").click();
        findAllTabSets().should("have.length", 3);
        checkTab("/ts1", 0, false, "Two");
        checkTab("/ts1", 1, true, "Text0");
    })
})

context("Delete methods", () => {
    beforeEach(() => {
        mount(<App json={withBorders} />);
        findAllTabSets().should("have.length", 3);
    });

    it("delete tab", () => {
        findPath("/ts1/tb0/button/close").click();
        findAllTabSets().should("have.length", 2);
        checkTab("/ts0", 0, true, "One");
        checkTab("/ts1", 0, true, "Three");
    })

    it("delete all tabs", () => {
        findPath("/ts1/tb0/button/close").click();
        findPath("/ts1/tb0/button/close").click();
        findPath("/ts0/tb0/button/close").click();
        findAllTabSets().should("have.length", 1);
        findPath("/ts1/tb0").should("not.exist");
    })

    it("delete tab in border", () => {
        checkBorderTab("/border/bottom", 0, false, "bottom1");
        findPath("/border/bottom/tb0/button/close").click({ force: true });
        checkBorderTab("/border/bottom", 0, false, "bottom2");
    })
})

context("Maximize methods", () => {
    beforeEach(() => {
        mount(<App json={withBorders} />);
        findAllTabSets().should("have.length", 3);
    });

    it("maximize tabset using max button", () => {
        findPath("/ts1/button/max").click();
        findPath("/ts0").should("not.be.visible");
        findPath("/ts1").should("be.visible");
        findPath("/ts2").should("not.be.visible");

        findPath("/ts1/button/max").click();
        findPath("/ts0").should("be.visible");
        findPath("/ts1").should("be.visible");
        findPath("/ts2").should("be.visible");
    })

    it("maximize tabset using double click", () => {
        findPath("/ts1/tabstrip").dblclick();
        findPath("/ts0").should("not.be.visible");
        findPath("/ts1").should("be.visible");
        findPath("/ts2").should("not.be.visible");

        findPath("/ts1/button/max").click();
        findPath("/ts0").should("be.visible");
        findPath("/ts1").should("be.visible");
        findPath("/ts2").should("be.visible");
    })
})

context("Others", () => {
    beforeEach(() => {
    });

    it("rename tab", () => {
        mount(<App json={withBorders} />);
        findPath("/ts1/tb0").dblclick();
        findPath("/ts1/tb0/textbox")
            .should("exist")
            .should("contain.value", "Two")
            .type("Renamed{enter}");
        checkTab("/ts1", 0, true, "Renamed");
    })

    it("rename tab cancelled with esc", () => {
        mount(<App json={withBorders} />);
        findPath("/ts1/tb0").dblclick();
        findPath("/ts1/tb0/textbox").should("exist").type("Renamed{esc}");
        checkTab("/ts1", 0, true, "Two");
    })

    it("click on tab contents causes tabset activate", () => {
        mount(<App json={withBorders} />);
        findPath("/ts1/t0").click();
        findPath("/ts0/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts0/t0").click();
        findPath("/ts0/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/t0").click();
        findPath("/ts0/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
    })

    it("click on tab button causes tabset activate", () => {
        mount(<App json={withBorders} />);
        findPath("/ts1/tb0").click();
        findPath("/ts0/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts0/tb0").click();
        findPath("/ts0/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tb0").click();
        findPath("/ts0/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
    })

    it("click on tabstrip causes tabset activate", () => {
        mount(<App json={withBorders} />);
        findPath("/ts1/tabstrip").click();
        findPath("/ts0/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts0/tabstrip").click();
        findPath("/ts0/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").click();
        findPath("/ts0/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts1/tabstrip").should("not.have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
        findPath("/ts2/tabstrip").should("have.class", CLASSES.FLEXLAYOUT__TABSET_SELECTED);
    })

    it("tab can have icon", () => {
        mount(<App json={threeTabs} />);
        findPath("/ts1/tb0")
            .find("." + CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)
            .find("img")
            .should("have.attr", "src", "/test/images/settings.svg");
    })
})

context("Extended App", () => {
    beforeEach(() => {
        mount(<AppEx json={layoutEx1} />);
    });

    it("onRenderTab", () => {
        findPath("/ts1/tb0")
            .find("." + CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)
            .find("img")
            .should("have.attr", "src", "/test/images/settings.svg");
        findPath("/ts1/tb0")
            .find("img").eq(1)
            .should("have.attr", "src", "/test/images/folder.svg");
    })

    it("onRenderTab in border", () => {
        findPath("/border/top/tb0")
            .find("." + CLASSES.FLEXLAYOUT__BORDER_BUTTON_LEADING)
            .find("img")
            .should("have.attr", "src", "/test/images/settings.svg");
        findPath("/ts1/tb0")
            .find("img").eq(1)
            .should("have.attr", "src", "/test/images/folder.svg");
    })

    it("onRenderTabSet", () => {
        findPath("/ts1/tabstrip")
            .find("." + CLASSES.FLEXLAYOUT__TAB_TOOLBAR)
            .find("img").eq(0)
            .should("have.attr", "src", "/test/images/folder.svg");
        findPath("/ts1/tabstrip")
            .find("." + CLASSES.FLEXLAYOUT__TAB_TOOLBAR)
            .find("img").eq(1)
            .should("have.attr", "src", "/test/images/settings.svg");
    })

    it("onRenderTabSet sticky buttons", () => {
        findPath("/ts2/tabstrip")
            .find("." + CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)
            .find("img").eq(0)
            .should("have.attr", "src", "/test/images/add.svg");
    })

    it("onRenderTabSet for header", () => {
        findPath("/ts1/header")
            .find("." + CLASSES.FLEXLAYOUT__TAB_TOOLBAR)
            .find("img").eq(0)
            .should("have.attr", "src", "/test/images/settings.svg");
        findPath("/ts1/header")
            .find("." + CLASSES.FLEXLAYOUT__TAB_TOOLBAR)
            .find("img").eq(1)
            .should("have.attr", "src", "/test/images/folder.svg");
    })

    it("onRenderTabSet for border", () => {
        findPath("/border/top")
            .find("." + CLASSES.FLEXLAYOUT__BORDER_TOOLBAR)
            .find("img").eq(0)
            .should("have.attr", "src", "/test/images/folder.svg");
        findPath("/border/top")
            .find("." + CLASSES.FLEXLAYOUT__BORDER_TOOLBAR)
            .find("img").eq(1)
            .should("have.attr", "src", "/test/images/settings.svg");
    })

})

context("Extended layout2", () => {
    beforeEach(() => {
        mount(<AppEx json={layoutEx2} />);
    });

    it("check tabset min size", () => {
        findPath("/s0").as("from");
        dragsplitter("@from", false, -1000);
        findPath("/ts0").then(e1 => {
            const w1 = e1.width();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });

        findPath("/s1").as("from");
        dragsplitter("@from", false, 1000);
        findPath("/c2/ts0").then(e1 => {
            const w1 = e1.width();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });

        findPath("/c2/s0").as("from");
        dragsplitter("@from", true, -1000);
        findPath("/c2/ts0").then(e1 => {
            const w1 = e1.height();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });

        findPath("/c2/s0").as("from");
        dragsplitter("@from", true, 1000);
        findPath("/c2/ts1").then(e1 => {
            const w1 = e1.height();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });
    })

    it("check border top min size", () => {
        findPath("/border/top/tb0").click();
        findPath("/border/top/s").as("from");
        dragsplitter("@from", true, -1000);
        findPath("/border/top/t0").then(e1 => {
            const w1 = e1.height();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });
    });

    it("check border bottom min size", () => {
        findPath("/border/bottom/tb0").click();
        findPath("/border/bottom/s").as("from");
        dragsplitter("@from", true, 1000);
        findPath("/border/bottom/t0").then(e1 => {
            const w1 = e1.height();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });
    });

    it("check border left min size", () => {
        findPath("/border/left/tb0").click();
        findPath("/border/left/s").as("from");
        dragsplitter("@from", false, -1000);
        findPath("/border/left/t0").then(e1 => {
            const w1 = e1.width();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });
    });

    it("check border right min size", () => {
        findPath("/border/right/tb0").click();
        findPath("/border/right/s").as("from");
        dragsplitter("@from", false, 1000);
        findPath("/border/right/t0").then(e1 => {
            const w1 = e1.width();
            assert.isTrue(Math.abs(w1 - 100) < 2);
        });
    });

    it("tabset close", () => {
        findPath("/ts0").should("exist");
        findPath("/ts1").should("exist");
        findPath("/ts2").should("not.exist");

        findPath("/c2/ts0/button/close").click();

        findPath("/c2/ts0").should("not.exist");
        findPath("/ts0").should("exist");
        findPath("/ts1").should("exist");
        findPath("/ts2").should("exist");
    });

    it("borders autohide top", () => {
        findPath("/border/top/tb0/button/close").click({ force: true });
        findPath("/border/top").should("not.exist");

        findTabButton("/ts0", 0).as("from");
        findTabButton("/ts0", 0).as("to");
        drag("@from", "@to", Location.TOP);
        findPath("/border/top").should("exist");
    });

    it("borders autohide left", () => {
        findPath("/border/left/tb0/button/close").click({ force: true });
        findPath("/border/left").should("not.exist");

        findTabButton("/ts0", 0).as("from");
        findTabButton("/ts0", 0).as("to");
        drag("@from", "@to", Location.LEFTEDGE);
        findPath("/border/left").should("exist");
    });
})


// ---------------------------- helpers ------------------------ 

function drag(from: string, to: string, loc: Location) {
    cy.get(from)
        .trigger("mousedown", { which: 1 }).then(e => {
            const fr = e[0].getBoundingClientRect();
            const cf = getLocation(fr, Location.CENTER)
            cy.get(to).then(e => {
                const tr = e[0].getBoundingClientRect();
                const ct = getLocation(tr, loc);
                cy.document()
                    .trigger("mousemove", { clientX: cf.x + 10, clientY: cf.y + 10 })
                    .trigger("mousemove", { clientX: (cf.x + ct.x) / 2, clientY: (cf.y + ct.y) / 2 })
                    .trigger("mousemove", { clientX: ct.x, clientY: ct.y })
                    .trigger("mouseup", { clientX: ct.x, clientY: ct.y });
            });
        });
}

function dragToEdge(from: string, edgeIndex: number) {
    cy.get(from)
        .trigger("mousedown", { which: 1 }).then(e => {
            const fr = e[0].getBoundingClientRect();
            const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
            cy.document() // need to start move for edges to show
                .trigger("mousemove", { clientX: cf.x + 10, clientY: cf.y + 10 });
            cy.get(".flexlayout__edge_rect").eq(edgeIndex).then(e => {
                const tr = e[0].getBoundingClientRect();
                const ct = { x: tr.x + tr.width / 2, y: tr.y + tr.height / 2 };
                cy.document()
                    .trigger("mousemove", { clientX: (cf.x + ct.x) / 2, clientY: (cf.y + ct.y) / 2 })
                    .trigger("mousemove", { clientX: ct.x, clientY: ct.y })
                    .trigger("mouseup", { clientX: ct.x, clientY: ct.y });
            });
        });
}

function dragsplitter(from: string, upDown: boolean, distance: number) {
    cy.get(from)
        .trigger("mousedown", { which: 1 })
        .then(e => {
            const fr = e[0].getBoundingClientRect();
            const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
            const ct = { x: cf.x + (upDown ? 0 : distance), y: cf.y + (upDown ? distance : 0) };
            cy.document()
                .trigger("mousemove", { clientX: cf.x + 10, clientY: cf.y + 10 })
                .trigger("mousemove", { clientX: (cf.x + ct.x) / 2, clientY: (cf.y + ct.y) / 2 })
                .trigger("mousemove", { clientX: ct.x, clientY: ct.y })
                .trigger("mouseup", { clientX: ct.x, clientY: ct.y });
        });
}

beforeEach(() => {
   // unmount();
});

const findAllTabSets = () => {
    return cy.get(".flexlayout__tabset");
}

const findPath = (path: string) => {
    return cy.get("[data-layout-path="" + path + ""]");
}

const findTabButton = (path: string, index: number) => {
    return findPath(path + "/tb" + index);
}

const checkTab = (path: string, index: number, selected: boolean, text: string) => {
    findTabButton(path, index)
        .should("exist")
        .should("have.class", selected ? "flexlayout__tab_button--selected" : "flexlayout__tab_button--unselected")
        .find(".flexlayout__tab_button_content")
        .should("contain.text", text);
    return findPath(path + "/t" + index)
        .should("exist")
        .should("contain.text", text);
}

const checkBorderTab = (path: string, index: number, selected: boolean, text: string) => {
    findTabButton(path, index)
        .should("exist")
        .should("have.class", selected ? "flexlayout__border_button--selected" : "flexlayout__border_button--unselected")
        .find(".flexlayout__border_button_content")
        .should("contain.text", text);
    if (selected) {
        findPath(path + "/t" + index)
            .should("exist")
            .should("contain.text", text);
    }
}

const getLocation = (r: { x: number, y: number, width: number, height: number }, location: Location) => {
    switch (location) {
        case Location.CENTER:
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        case Location.TOP:
            return { x: r.x + r.width / 2, y: r.y + r.height / 8 };
        case Location.BOTTOM:
            return { x: r.x + r.width / 2, y: r.y + (r.height / 8) * 7 };
        case Location.LEFT:
            return { x: r.x + r.width / 8, y: r.y + r.height / 2 };
        case Location.LEFTEDGE:
            return { x: r.x , y: r.y + r.height / 2 };
            case Location.RIGHT:
            return { x: r.x + (r.width / 8) * 7, y: r.y + r.height / 2 };
    }
}
