class JsonConverter {

    constructor() {
        this.conversions = [];
    }

    addConversion(name, jsonName, defaultValue, alwayWriteJson) {
        this.conversions.push({
            name: name,
            jsonName: jsonName,
            defaultValue: defaultValue,
            alwaysWriteJson: (alwayWriteJson === undefined) ? false : true
        });
    }

    toJson(jsonObj, obj) {
        for (let i = 0; i < this.conversions.length; i++) {
            let c = this.conversions[i];
            let fromValue = obj[c.name];
            if (c.alwaysWriteJson || fromValue !== c.defaultValue) {
                jsonObj[c.jsonName] = fromValue;
            }
        }
    }

    fromJson(jsonObj, obj) {
        if (jsonObj == null) {
            debugger;
        }
        for (let i = 0; i < this.conversions.length; i++) {
            let c = this.conversions[i];
            let fromValue = jsonObj[c.jsonName];
            if (fromValue === undefined) {
                obj[c.name] = c.defaultValue;
            }
            else {
                obj[c.name] = fromValue;
            }
        }
    }

    updateAttrs(jsonObj, obj) {
        for (let i = 0; i < this.conversions.length; i++) {
            let c = this.conversions[i];
            let fromValue = jsonObj[c.jsonName];
            if (fromValue !== undefined) {
                obj[c.name] = fromValue;
            }
        }
    }

    setDefaults(obj) {
        for (let i = 0; i < this.conversions.length; i++) {
            let c = this.conversions[i];
            obj[c.name] = c.defaultValue;
        }
    }

    toTable() {
        let lines = [];
        lines.push("| Attribute | Default | Description  |");
        lines.push("| ------------- |:-------------:| -----|");
        for (let i = 0; i < this.conversions.length; i++) {
            let c = this.conversions[i];
            lines.push("| " + c.jsonName + " | " + c.defaultValue + " | |");
        }

        return lines.join("\n");
    }

    toTableValues(obj, model) {
        let lines = [];
        lines.push("<table border='1'>");
        lines.push("<tr><th>Attribute</th><th>Default</th><th>Value</th></tr>");
        for (let i = 0; i < this.conversions.length; i++) {
            let c = this.conversions[i];
            //if (obj[c.name] !== c.defaultValue) {
                lines.push("<tr><td>" + c.jsonName + "</td><td>" + c.defaultValue + "</td><td>" + JSON.stringify(obj[c.name]) + "</td></tr>");
            //}
        }
        lines.push("</table>");

        return lines.join("\n");
    }
}

export default JsonConverter;