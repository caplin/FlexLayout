import { Rect } from "../src";

describe("Rect", () => {
    it("centerInRect accounts for the outer rect origin", () => {
        const inner = new Rect(0, 0, 100, 50);
        inner.centerInRect(new Rect(200, 300, 400, 250));
        expect(inner.x).equal(200 + (400 - 100) / 2);
        expect(inner.y).equal(300 + (250 - 50) / 2);
    });
});
