import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import pkg from "../package.json" with { type: "json" };

export default defineConfig({
    root: "./examples/",
    base: "./", // use relative paths
    plugins: [react()],
    define: {
        __VERSION__: JSON.stringify(pkg.version),
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                index: fileURLToPath(new URL("index.html", import.meta.url)),
                basic: fileURLToPath(new URL("basic/index.html", import.meta.url)),
                "action-interception": fileURLToPath(new URL("action-interception/index.html", import.meta.url)),
                "keyboard-accessibility": fileURLToPath(new URL("keyboard-accessibility/index.html", import.meta.url)),
                "bottom-tabs": fileURLToPath(new URL("bottom-tabs/index.html", import.meta.url)),
                "custom-overflow-menu": fileURLToPath(new URL("custom-overflow-menu/index.html", import.meta.url)),
                popout: fileURLToPath(new URL("popout/index.html", import.meta.url)),
                "popout/popout": fileURLToPath(new URL("popout/popout.html", import.meta.url)),
                theme: fileURLToPath(new URL("theme/index.html", import.meta.url)),
                borders: fileURLToPath(new URL("borders/index.html", import.meta.url)),
                "tab-rendering": fileURLToPath(new URL("tab-rendering/index.html", import.meta.url)),
                "tabset-rendering": fileURLToPath(new URL("tabset-rendering/index.html", import.meta.url)),
                "context-menu": fileURLToPath(new URL("context-menu/index.html", import.meta.url)),
                "min-sizes": fileURLToPath(new URL("min-sizes/index.html", import.meta.url)),
                "preferred-sizes": fileURLToPath(new URL("preferred-sizes/index.html", import.meta.url)),
                "pinned-tabs": fileURLToPath(new URL("pinned-tabs/index.html", import.meta.url)),
                "sticky-button": fileURLToPath(new URL("sticky-button/index.html", import.meta.url)),
                "tab-groups": fileURLToPath(new URL("tab-groups/index.html", import.meta.url)),
                "tab-wrapping": fileURLToPath(new URL("tab-wrapping/index.html", import.meta.url)),
                sublayout: fileURLToPath(new URL("sublayout/index.html", import.meta.url)),
                "external-drag": fileURLToPath(new URL("external-drag/index.html", import.meta.url)),
                "many-tabs": fileURLToPath(new URL("many-tabs/index.html", import.meta.url)),
                "undo-redo": fileURLToPath(new URL("undo-redo/index.html", import.meta.url)),
                localstorage: fileURLToPath(new URL("localstorage/index.html", import.meta.url)),
                placeholder: fileURLToPath(new URL("placeholder/index.html", import.meta.url)),
                i18n: fileURLToPath(new URL("i18n/index.html", import.meta.url)),
                iframe: fileURLToPath(new URL("iframe/index.html", import.meta.url)),
            },
        },
    },
    server: {
        open: true,
    },
} as UserConfig);
