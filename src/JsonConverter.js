class JsonConverter {

    constructor() {
        this.conversions = [];
    }

    addConversion(name, jsonName, defaultValue, alwayWriteJson) {
        this.conversions.push({
            name: name,
            jsonName: jsonName,
            defaultValue: defaultValue,
            alwaysWriteJson: alwayWriteJson
        });
    }

    toJson(jsonObj, obj) {
        this.conversions.forEach((c) => {
            const fromValue = obj[c.name];
            if (c.alwaysWriteJson || fromValue !== c.defaultValue) {
                jsonObj[c.jsonName] = fromValue;
            }
        });
    }

    fromJson(jsonObj, obj) {
        if (jsonObj == null) {
            debugger;
        }
        this.conversions.forEach((c) => {
            const fromValue = jsonObj[c.jsonName];
            if (fromValue === undefined) {
                obj[c.name] = c.defaultValue;
            }
            else {
                obj[c.name] = fromValue;
            }
        });
    }

    updateAttrs(jsonObj, obj) {
        this.conversions.forEach((c) => {
            const fromValue = jsonObj[c.jsonName];
            if (fromValue !== undefined) {
                obj[c.name] = fromValue;
            }
        });
    }

    setDefaults(obj) {
        this.conversions.forEach((c) => {
            obj[c.name] = c.defaultValue;
        });
    }

    toTable() {
        const lines = [];
        lines.push("| Attribute | Default | Description  |");
        lines.push("| ------------- |:-------------:| -----|");
        this.conversions.forEach((c) => {
            lines.push("| " + c.jsonName + " | " + c.defaultValue + " | |");
        });

        return lines.join("\n");
    }

    toTableValues(obj, model) {
        const lines = [];
        lines.push("<table border='1'>");
        lines.push("<tr><th>Attribute</th><th>Default</th><th>Value</th></tr>");
        this.conversions.forEach((c) => {
            //if (obj[c.name] !== c.defaultValue) {
            lines.push("<tr><td>" + c.jsonName + "</td><td>" + c.defaultValue + "</td><td>" + JSON.stringify(obj[c.name]) + "</td></tr>");
            //}
        });
        lines.push("</table>");

        return lines.join("\n");
    }
}

export default JsonConverter;