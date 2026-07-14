import * as React from "react";
import Editor from "@monaco-editor/react";

const initialCode = `// Monaco editor

export function fibonacci(n: number): number {
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
    console.log(fibonacci(i));
}
`;

function MonacoComponent() {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const editorDocument = React.useRef<Document | null>(null);
    // the editor state to carry across rebuilds: the text, captured on change
    const valueRef = React.useRef(initialCode);
    // key + initial text for the current editor instance
    const [editorSeed, setEditorSeed] = React.useState({ version: 0, value: initialCode });

    // monaco binds its listeners and popups to the document it was created in, so when the
    // tab moves between windows (popout/popin) rebuild the editor by re-keying it; the text
    // is carried over via defaultValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        const target = containerRef.current;
        if (!target) return;
        if (editorDocument.current !== target.ownerDocument) {
            if (editorDocument.current !== null) {
                setEditorSeed((s) => ({ version: s.version + 1, value: valueRef.current }));
            }
            editorDocument.current = target.ownerDocument;
        }
    });

    return (
        <div ref={containerRef} style={{ height: "100%", width: "100%" }}>
            <Editor
                key={editorSeed.version}
                defaultLanguage="typescript"
                defaultValue={editorSeed.value}
                onChange={(value) => {
                    valueRef.current = value ?? "";
                }}
                options={{
                    minimap: { enabled: false },
                    automaticLayout: true, // monaco tracks its container size itself
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
}

export default MonacoComponent;
