import { Attribute } from "./Attribute";

/** @internal */
export class AttributeDefinitions {
    attributes: Attribute[];
    nameToAttribute: Map<string, Attribute>;

    constructor() {
        this.attributes = [];
        this.nameToAttribute = new Map();
    }

    addWithAll(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
        const attr = new Attribute(name, modelName, defaultValue, alwaysWriteJson);
        this.attributes.push(attr);
        this.nameToAttribute.set(name, attr);
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
        const conversion = this.nameToAttribute.get(name);
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
            let fromValue = jsonObj[attr.name];
            if (fromValue === undefined && attr.alias) {
                fromValue = jsonObj[attr.alias];
            }
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

    pairAttributes(type: string, childAttributes: AttributeDefinitions) {
        for (const attr of childAttributes.attributes) {
            if (attr.modelName && this.nameToAttribute.has(attr.modelName)) {
                const pairedAttr = this.nameToAttribute.get(attr.modelName)!;
                pairedAttr.setpairedAttr(attr);
                attr.setpairedAttr(pairedAttr);
                pairedAttr.setPairedType(type);
            }
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
                && parentAttributes.nameToAttribute.get(attr.modelName) !== undefined) {
                inherited = attr.modelName;
                attr = parentAttributes.nameToAttribute.get(inherited)!;
                defaultValue = attr.defaultValue;
                type = attr.type;
            }

            let defValue = JSON.stringify(defaultValue);

            const required = attr.required ? "" : "?";

            let sb = "\t/**\n\t  ";
            if (c.description) {
                sb += c.description;
            } else if (c.pairedType && c.pairedAttr?.description) {
                sb += `Value for ${c.pairedType} attribute ${c.pairedAttr.name} if not overridden`
                sb += "\n\n\t  ";
                sb += c.pairedAttr?.description;
            }
            sb += "\n\n\t  ";
            if (c.fixed) {
                sb += `Fixed value: ${defValue}`;
            } else if (inherited) {
                sb += `Default: inherited from Global attribute ${c.modelName} (default ${defValue})`;
            } else {
                sb += `Default: ${defValue}`;
            }
            sb += "\n\t */";
            lines.push(sb);
            lines.push("\t" + c.name + required + ": " + type + ";\n");
        }
        lines.push("}");

        return lines.join("\n");
    }
}
