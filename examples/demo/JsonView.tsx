import * as React from "react";
import { Model } from "../../src/index";
import * as Prism from "prismjs";

export function JsonView({ model }: { model: Model }) {

  const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const [json, setJson] = React.useState<string>("");

  React.useEffect(() => {
    const onModelChange = () => {
      if (timer) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        update();
        timer.current = undefined;
      }, 1000);
    }
    model.addChangeListener(onModelChange);
    update();
    return () => {
      model.removeChangeListener(onModelChange);
    }
  }, [])

  const update = () => {
    const jsonText = JSON.stringify(model.toJson(), null, "\t");
    const newJson = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
    setJson(newJson);
  }

  return (
    <pre style={{ tabSize: "20px" }} dangerouslySetInnerHTML={{ __html: json! }} />
  );
}