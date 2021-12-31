import { Attribute } from "./Attribute";

/** @internal */
export class AttributeDefinitions {
    attributes: Attribute[];
    nameToAttribute: Record<string, Attribute>;

    constructor() {
        this.attributes = [];
        this.nameToAttribute = {};
    }

    addWithAll(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
        const attr = new Attribute(name, modelName, defaultValue, alwaysWriteJson);
        this.attributes.push(attr);
        this.nameToAttribute[name] = attr;
        return attr;
    }

    addInherited(name: string, modelName: string) {
        return this.addWithAll(name, modelName, undefined, false);
    }

    add(name: string, defaultValue: any, alwaysWriteJson?: boolean) {
        return this.addWithAll(name, undefined, defaultValue, alwaysWriteJson);
    }

    getAttributes() {
        return this.attributes;
    }

    getModelName(name: string) {
        const conversion = this.nameToAttribute[name];
        if (conversion !== undefined) {
            return conversion.modelName;
        }
        return undefined;
    }

    toJson(jsonObj: any, obj: any) {
        for (const attr of this.attributes) {
            const fromValue = obj[attr.name];
            if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
                jsonObj[attr.name] = fromValue;
            }
        }
    }

    fromJson(jsonObj: any, obj: any) {
        for (const attr of this.attributes) {
            const fromValue = jsonObj[attr.name];
            if (fromValue === undefined) {
                obj[attr.name] = attr.defaultValue;
            } else {
                obj[attr.name] = fromValue;
            }
        }
    }

    update(jsonObj: any, obj: any) {
        for (const attr of this.attributes) {
            if (jsonObj.hasOwnProperty(attr.name)) {
                const fromValue = jsonObj[attr.name];
                if (fromValue === undefined) {
                    delete obj[attr.name];
                } else {
                    obj[attr.name] = fromValue;
                }
            }
        }
    }

    setDefaults(obj: any) {
        for (const attr of this.attributes) {
            obj[attr.name] = attr.defaultValue;
        }
    }

    toTypescriptInterface(name: string, parentAttributes: AttributeDefinitions | undefined) {
        const lines = [];
        const sorted = this.attributes.sort((a, b) => a.name.localeCompare(b.name));
        // const sorted = this.attributes;
        lines.push("export interface I" + name + "Attributes {");
        for (let i = 0; i < sorted.length; i++) {
            const c = sorted[i];
            let type = c.type;
            let defaultValue = undefined;

            let attr = c;
            let inherited = undefined;
            if (attr.defaultValue !== undefined) {
                defaultValue = attr.defaultValue;
            } else if (attr.modelName !== undefined
                && parentAttributes !== undefined
                && parentAttributes.nameToAttribute[attr.modelName] !== undefined) {
                inherited = attr.modelName;
                attr = parentAttributes.nameToAttribute[attr.modelName];
                defaultValue = attr.defaultValue;
                type = attr.type;
            }

            let defValue = JSON.stringify(defaultValue);

            const required = attr.required || attr.fixed ? "" : "?";

            if (c.fixed) {
                lines.push("\t" + c.name + ": " + defValue + ";");
            } else {
                const comment = (defaultValue !== undefined ? "default: " + defValue : "") +
                    (inherited !== undefined ? " - inherited from global " + inherited : "");

                lines.push("\t" + c.name + required + ": " + type + ";" +
                    (comment.length > 0 ? " // " + comment : "")
                );
            }
        }
        lines.push("}");

        return lines.join("\n");
    }
}
