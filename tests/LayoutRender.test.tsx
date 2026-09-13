// @vitest-environment jsdom
import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Actions, DockLocation, IJsonModel, ILayoutApi, Layout, Model, TabNode, TabSetNode } from "../src";

const factory = (node: TabNode) => <div data-testid="tab-content">content for {node.getName()}</div>;

const baseJson: IJsonModel = {
    global: {},
    borders: [
        {
            type: "border",
            location: "left",
            children: [
                { type: "tab", id: "bl0", name: "Left Tab" },
                { type: "tab", id: "bl1", name: "Left Tab 2" },
            ],
        },
    ],
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [
                    { type: "tab", id: "t0", name: "Tab One", component: "c0" },
                    { type: "tab", id: "t1", name: "Tab Two" },
                ],
            },
            {
                type: "tabset",
                id: "ts1",
                children: [{ type: "tab", id: "t2", name: "Tab Three", enableClose: false }],
            },
        ],
    },
};

const renderLayout = (json: IJsonModel = baseJson, props: Partial<React.ComponentProps<typeof Layout>> = {}) => {
    const model = Model.fromJson(json);
    const ref = React.createRef<ILayoutApi>();
    const view = render(<Layout model={model} factory={factory} ref={ref} {...props} />);
    return { model, view, ref };
};

describe("Layout render", () => {
    it("renders the tabs, tabset and border buttons", () => {
        renderLayout();
        expect(screen.getByRole("tab", { name: "Tab One" })).not.toBeNull();
        expect(screen.getByRole("tab", { name: "Tab Two" })).not.toBeNull();
        expect(screen.getByRole("tab", { name: "Tab Three" })).not.toBeNull();
        // border tabs render as tabs too
        expect(screen.getByRole("tab", { name: "Left Tab" })).not.toBeNull();
        expect(screen.getByRole("tab", { name: "Left Tab 2" })).not.toBeNull();
        // the selected tab's content is mounted via the factory
        expect(screen.getAllByTestId("tab-content").length).toBeGreaterThan(0);
    });

    it("selects a tab when its button is clicked", () => {
        const { model } = renderLayout();
        fireEvent.click(document.body.querySelector('[data-layout-path="/ts0/tb1"]')!);
        expect((model.getNodeById("ts0") as TabSetNode).getSelectedNode()?.getId()).equal("t1");
    });

    it("closes a closeable tab from its button", () => {
        const { model } = renderLayout();
        const close = document.body.querySelector('[data-layout-path="/ts0/tb0/button/close"]')!;
        fireEvent.click(close);
        expect(model.getNodeById("t0")).toBeUndefined();
        expect(document.body.querySelector('[data-layout-path="/ts0/tb0"][aria-label="Tab One"]')).toBeNull();
    });

    it("re-renders when the model changes through doAction", async () => {
        const { model } = renderLayout();
        act(() => {
            model.doAction(Actions.addTab({ type: "tab", id: "tNew", name: "New Tab", component: "c0" }, "ts1", DockLocation.CENTER, -1));
        });
        await waitFor(() => expect(document.body.querySelector('[data-layout-path="/ts1/tb1"]')).not.toBeNull());
    });

    it("reports model changes to the onModelChange callback", () => {
        const onModelChange = vi.fn();
        const { model } = renderLayout(baseJson, { onModelChange });
        model.doAction(Actions.selectTab("t1"));
        expect(onModelChange).toHaveBeenCalled();
    });

    it("exposes the imperative api through the ref", () => {
        const { model, ref } = renderLayout();
        const api = ref.current!;
        expect(api).not.toBeNull();
        expect(api.getRootDiv()).not.toBeNull();
        expect(model.getNodeById("tAdded")).toBeUndefined();
        act(() => {
            api.addTabToTabSet("ts1", { type: "tab", id: "tAdded", name: "Added", component: "c0" });
        });
        expect(model.getNodeById("tAdded")).not.toBeUndefined();
        act(() => {
            api.redraw();
        });
    });

    it("edits a tab name through the imperative api", () => {
        const { ref, model } = renderLayout();
        const api = ref.current!;
        act(() => {
            api.editTabName("t0");
        });
        // the edit is requested on the controller
        expect(model.getNodeById("t0")).not.toBeUndefined();
    });

    it("remounts when given a brand new model", () => {
        const { view } = renderLayout();
        const model2 = Model.fromJson(baseJson);
        view.rerender(<Layout model={model2} factory={factory} />);
        expect(screen.getByRole("tab", { name: "Tab One" })).not.toBeNull();
    });

    it("renders a floating sublayout inside a tab", async () => {
        const json: IJsonModel = {
            global: {},
            layout: {
                type: "row",
                children: [
                    {
                        type: "tabset",
                        id: "ts0",
                        children: [{ type: "tab", id: "host", name: "Host", subLayoutId: "L1" }],
                    },
                ],
            },
            subLayouts: {
                L1: {
                    type: "tab",
                    layout: { type: "row", children: [{ type: "tabset", children: [{ type: "tab", id: "sub", name: "Inner" }] }] },
                },
            },
        };
        const { ref } = renderLayout(json);
        // the sublayout LayoutInternal renders after the host content portal mounts; a redraw
        // deterministically completes that second render (in jsdom the rAF-driven pass is timing dependent)
        act(() => {
            ref.current!.redraw();
        });
        await waitFor(() => expect(screen.getByRole("tab", { name: "Inner" })).not.toBeNull());
    });

    it("pops a tab out to a float window via action", async () => {
        const { model, ref } = renderLayout();
        act(() => {
            model.doAction(Actions.popoutTab("t0", "float"));
        });
        // the float window's own LayoutInternal renders minimal on its first commit; a redraw
        // after that commit completes it
        act(() => {
            ref.current!.redraw();
        });
        await waitFor(() => expect(screen.getByRole("tab", { name: "Tab One" })).not.toBeNull());
    });

    it("re-invokes the factory when the host re-renders by default", async () => {
        const countingFactory = vi.fn(factory);
        const { model, view } = renderLayout(baseJson, { factory: countingFactory });
        await waitFor(() => expect(screen.getAllByTestId("tab-content").length).toBeGreaterThan(0));
        const initialCalls = countingFactory.mock.calls.length;

        // an unrelated re-render of <Layout> invalidates memoized tab content by default
        view.rerender(<Layout model={model} factory={countingFactory} />);
        await waitFor(() => expect(countingFactory.mock.calls.length).toBeGreaterThan(initialCalls));
    });

    it("keeps memoized tab content across host re-renders with invalidateTabContentOnParentRender false", async () => {
        const countingFactory = vi.fn(factory);
        const { model, view } = renderLayout(baseJson, { factory: countingFactory, invalidateTabContentOnParentRender: false });
        await waitFor(() => expect(screen.getAllByTestId("tab-content").length).toBeGreaterThan(0));
        const initialCalls = countingFactory.mock.calls.length;
        expect(initialCalls).toBeGreaterThan(0);

        // content only refreshes on model changes / redraw(), so an unrelated re-render is free
        view.rerender(<Layout model={model} factory={countingFactory} invalidateTabContentOnParentRender={false} />);
        expect(countingFactory.mock.calls.length).toEqual(initialCalls);
    });

    it("ignores a keydown event that carries no key", () => {
        renderLayout();
        const onError = vi.fn();
        window.addEventListener("error", onError);
        try {
            act(() => {
                document.body.dispatchEvent(new Event("keydown", { bubbles: true }));
            });
        } finally {
            window.removeEventListener("error", onError);
        }
        expect(onError).not.toHaveBeenCalled();
    });
});
