// @vitest-environment node
import { describe, expect, it } from "vitest";
import { defaultKeyMap, IKeyMap } from "../src";
import { matchesKey, resolveKeyMap, toAriaKeyShortcuts, IKeyEventLike } from "../src/view/Utils";

const keyEvent = (key: string, mods: Partial<IKeyEventLike> = {}): IKeyEventLike => ({
    key,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    ...mods,
});

describe("matchesKey", () => {
    it("matches a bare key case-insensitively", () => {
        expect(matchesKey(keyEvent("F2"), "F2")).toBe(true);
        expect(matchesKey(keyEvent("escape"), "Escape")).toBe(true);
        expect(matchesKey(keyEvent("F3"), "F2")).toBe(false);
    });

    it("requires exactly the specified modifiers", () => {
        expect(matchesKey(keyEvent("Delete", { ctrlKey: true }), "Ctrl+Delete")).toBe(true);
        expect(matchesKey(keyEvent("Delete"), "Ctrl+Delete")).toBe(false);
        expect(matchesKey(keyEvent("Delete", { ctrlKey: true, shiftKey: true }), "Ctrl+Delete")).toBe(false);
        expect(matchesKey(keyEvent("Delete", { ctrlKey: true }), "Delete")).toBe(false);
    });

    it("supports multiple modifiers in any order", () => {
        const event = keyEvent("w", { ctrlKey: true, shiftKey: true });
        expect(matchesKey(event, "Ctrl+Shift+W")).toBe(true);
        expect(matchesKey(event, "Shift+Ctrl+W")).toBe(true);
        expect(matchesKey(keyEvent("w", { altKey: true, metaKey: true }), "Alt+Meta+W")).toBe(true);
    });

    it("never matches an undefined or empty spec (a disabled binding)", () => {
        expect(matchesKey(keyEvent("Delete", { ctrlKey: true }), undefined)).toBe(false);
        expect(matchesKey(keyEvent("Escape"), "")).toBe(false);
    });
});

describe("resolveKeyMap", () => {
    it("returns the defaults when nothing is configured", () => {
        expect(resolveKeyMap(undefined)).toEqual(defaultKeyMap);
    });

    it("merges configured bindings over the defaults", () => {
        const resolved = resolveKeyMap({ closeTab: "Ctrl+W" });
        expect(resolved.closeTab).toBe("Ctrl+W");
        expect(resolved.renameTab).toBe(defaultKeyMap.renameTab);
        expect(resolved.closeOverlayBorder).toBe(defaultKeyMap.closeOverlayBorder);
    });

    it("disables a binding given as an explicit undefined", () => {
        const keyMap: IKeyMap = { closeTab: undefined };
        expect(resolveKeyMap(keyMap).closeTab).toBeUndefined();
        expect(resolveKeyMap(keyMap).renameTab).toBe(defaultKeyMap.renameTab);
    });

    it("focusTabToggle is off by default and enabled by configuring a binding", () => {
        expect(resolveKeyMap(undefined).focusTabToggle).toBeUndefined();
        expect(resolveKeyMap({ focusTabToggle: "F6" }).focusTabToggle).toBe("F6");
    });

    it("tabset cycling is off by default and enabled by configuring bindings", () => {
        expect(resolveKeyMap(undefined).focusNextTabset).toBeUndefined();
        expect(resolveKeyMap(undefined).focusPreviousTabset).toBeUndefined();
        const resolved = resolveKeyMap({ focusNextTabset: "Ctrl+ArrowRight", focusPreviousTabset: "Ctrl+ArrowLeft" });
        expect(resolved.focusNextTabset).toBe("Ctrl+ArrowRight");
        expect(resolved.focusPreviousTabset).toBe("Ctrl+ArrowLeft");
        expect(resolved.closeTab).toBe(defaultKeyMap.closeTab);
    });
});

describe("toAriaKeyShortcuts", () => {
    it("spells Ctrl as Control per the aria-keyshortcuts attribute", () => {
        expect(toAriaKeyShortcuts("Ctrl+Delete")).toBe("Control+Delete");
        expect(toAriaKeyShortcuts("F2")).toBe("F2");
        expect(toAriaKeyShortcuts(undefined)).toBeUndefined();
    });
});
