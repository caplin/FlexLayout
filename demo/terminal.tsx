import * as React from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { SerializeAddon } from "@xterm/addon-serialize";
import { Actions, ILayoutApi, Model, TabNode } from "../src/index";
import "@xterm/xterm/css/xterm.css";

interface ITerminalProps {
    getModel: () => Model | null;
    layoutApi: React.RefObject<ILayoutApi | null>;
}

const PROMPT = "$ ";

const HELP = `commands (drive the layout from the terminal):
  tabs               list the tabs in the layout
  add <name>         add a tab to the active tabset
  close <name>       close the named tab
  select <name>      select the named tab
  maximize           toggle maximize on the active tabset
  layout             print the layout json
  echo <text>        print text
  date               print the date
  clear              clear the terminal
  help               this message`;

// an xterm.js terminal with a small in-browser shell that drives the FlexLayout model
function TerminalComponent(props: ITerminalProps) {
    const { getModel, layoutApi } = props;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const termRef = React.useRef<Terminal | null>(null);
    const fitRef = React.useRef<FitAddon | null>(null);
    const serializeRef = React.useRef<SerializeAddon | null>(null);
    const termDocument = React.useRef<Document | null>(null);
    const savedContent = React.useRef<string | null>(null);
    // shell state lives outside the terminal instance so it survives rebuilds
    const lineRef = React.useRef("");
    const historyRef = React.useRef<string[]>([]);
    const historyIndexRef = React.useRef(-1);

    const findTabs = (model: Model) => {
        const tabs: TabNode[] = [];
        model.visitNodes((node) => {
            if (node instanceof TabNode) {
                tabs.push(node);
            }
        });
        return tabs;
    };

    const findTabByName = (model: Model, name: string) => {
        return findTabs(model).find((tab) => tab.getName() === name);
    };

    const execute = (term: Terminal, line: string) => {
        const writeln = (text: string) => term.write(text + "\r\n");
        const trimmed = line.trim();
        const command = trimmed.split(/\s+/)[0];
        const arg = trimmed.slice(command.length).trim();
        const model = getModel();

        switch (command) {
            case "":
                break;
            case "help":
                writeln(HELP);
                break;
            case "clear":
                term.clear();
                break;
            case "echo":
                writeln(arg);
                break;
            case "date":
                writeln(new Date().toString());
                break;
            case "tabs":
                if (model) {
                    for (const tab of findTabs(model)) {
                        const parentType = tab.getParent()?.getType() ?? "?";
                        writeln(`${tab.getName().padEnd(20)} ${parentType.padEnd(8)} ${tab.getId()}`);
                    }
                }
                break;
            case "add":
                if (!arg) {
                    writeln("usage: add <name>");
                } else {
                    const added = layoutApi.current?.addTabToActiveTabSet({ component: "grid", name: arg });
                    writeln(added ? `added ${arg}` : "no active tabset");
                }
                break;
            case "close": {
                const tab = model && findTabByName(model, arg);
                if (!tab) {
                    writeln(`no tab named '${arg}'`);
                } else if (!tab.isEnableClose()) {
                    writeln(`tab '${arg}' is not closeable`);
                } else {
                    model!.doAction(Actions.deleteTab(tab.getId()));
                    writeln(`closed ${arg}`);
                }
                break;
            }
            case "select": {
                const tab = model && findTabByName(model, arg);
                if (!tab) {
                    writeln(`no tab named '${arg}'`);
                } else {
                    model!.doAction(Actions.selectTab(tab.getId()));
                    writeln(`selected ${arg}`);
                }
                break;
            }
            case "maximize": {
                const tabset = model?.getActiveTabset();
                if (!tabset) {
                    writeln("no active tabset");
                } else {
                    model!.doAction(Actions.maximizeToggle(tabset.getId()));
                }
                break;
            }
            case "layout":
                if (model) {
                    writeln(JSON.stringify(model.toJson(), null, 2));
                }
                break;
            default:
                writeln(`unknown command: ${command} (try 'help')`);
                break;
        }
    };

    const createTerminal = (target: HTMLDivElement) => {
        const term = new Terminal({
            convertEol: true,
            fontSize: 13,
            cursorBlink: true,
        });
        const fit = new FitAddon();
        const serialize = new SerializeAddon();
        term.loadAddon(fit);
        term.loadAddon(serialize);
        term.open(target);
        fit.fit();

        if (savedContent.current !== null) {
            term.write(savedContent.current);
        } else {
            term.write("FlexLayout demo shell - type 'help' for commands\r\n" + PROMPT);
        }
        lineRef.current = "";

        // replace the visible input line (used by the history keys)
        const setLine = (text: string) => {
            term.write("\x1b[2K\r" + PROMPT + text);
            lineRef.current = text;
        };

        term.onData((data) => {
            let i = 0;
            while (i < data.length) {
                const ch = data[i];
                if (ch === "\x1b") {
                    const seq = data.slice(i, i + 3);
                    const history = historyRef.current;
                    if (seq === "\x1b[A" && history.length > 0) { // up
                        historyIndexRef.current = historyIndexRef.current <= 0 ? 0 : historyIndexRef.current - 1;
                        setLine(history[historyIndexRef.current] ?? "");
                    } else if (seq === "\x1b[B") { // down
                        if (historyIndexRef.current >= history.length - 1) {
                            historyIndexRef.current = history.length;
                            setLine("");
                        } else {
                            historyIndexRef.current++;
                            setLine(history[historyIndexRef.current] ?? "");
                        }
                    }
                    i += 3; // skip the escape sequence (arrow keys are 3 bytes)
                    continue;
                }
                if (ch === "\r") {
                    term.write("\r\n");
                    const line = lineRef.current;
                    lineRef.current = "";
                    if (line.trim() !== "") {
                        historyRef.current.push(line);
                    }
                    historyIndexRef.current = historyRef.current.length;
                    execute(term, line);
                    term.write(PROMPT);
                } else if (ch === "\x7f") { // backspace
                    if (lineRef.current.length > 0) {
                        lineRef.current = lineRef.current.slice(0, -1);
                        term.write("\b \b");
                    }
                } else if (ch >= " ") {
                    lineRef.current += ch;
                    term.write(ch);
                }
                i++;
            }
        });

        termRef.current = term;
        fitRef.current = fit;
        serializeRef.current = serialize;
    };

    React.useEffect(() => {
        createTerminal(containerRef.current!);
        termDocument.current = containerRef.current!.ownerDocument;
        return () => {
            termRef.current?.dispose();
            termRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // xterm binds its keyboard and selection listeners to the document it was opened in, so
    // when the tab moves between windows (popout/popin) rebuild the terminal, carrying the
    // buffer contents over via the serialize addon
    React.useEffect(() => {
        const target = containerRef.current;
        if (!target) return;
        if (termDocument.current !== target.ownerDocument) {
            termDocument.current = target.ownerDocument;
            if (termRef.current) {
                savedContent.current = serializeRef.current!.serialize();
                termRef.current.dispose();
                createTerminal(target);
            }
        }
    });

    // refit on container resizes, using the container's current window
    React.useEffect(() => {
        const target = containerRef.current;
        if (!target) return;

        const win = target.ownerDocument.defaultView || window;
        const Observer = win.ResizeObserver || ResizeObserver;

        const resizeObserver = new Observer(() => {
            win.requestAnimationFrame(() => {
                fitRef.current?.fit();
            });
        });

        resizeObserver.observe(target);

        return () => {
            resizeObserver.disconnect();
        };
    });

    return (
        <div ref={containerRef} style={{ height: "100%", width: "100%", backgroundColor: "#000000" }} />
    );
}

export default TerminalComponent;
