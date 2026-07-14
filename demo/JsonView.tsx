import * as React from "react";
import { Model } from "../src/index";
import * as Prism from "prismjs";

export function JsonView({ model }: { model: Model }) {
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [json, setJson] = React.useState<string>(() => highlightModel(model));

    React.useEffect(() => {
        const onModelChange = () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                setJson(highlightModel(model));
                timer.current = undefined;
            }, 1000);
        };
        model.addChangeListener(onModelChange);
        return () => {
            model.removeChangeListener(onModelChange);
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <pre style={{ tabSize: "20px" }} dangerouslySetInnerHTML={{ __html: json! }} />;
}

function highlightModel(model: Model) {
    const jsonText = JSON.stringify(model.toJson(), null, "\t");
    return Prism.highlight(jsonText, Prism.languages.javascript, "javascript");
}
