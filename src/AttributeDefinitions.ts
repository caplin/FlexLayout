import Attribute from "./Attribute";
import { JSMap } from "./Types";

/** @hidden @internal */
class AttributeDefinitions {

    attributes: Attribute[];
    nameToAttribute: JSMap<Attribute>;

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
        this.attributes.forEach((attr) => {
            const fromValue = obj[attr.name];
            if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
                jsonObj[attr.name] = fromValue;
            }
        });
    }

    fromJson(jsonObj: any, obj: any) {
        this.attributes.forEach((attr) => {
            const fromValue = jsonObj[attr.name];
            if (fromValue === undefined) {
                obj[attr.name] = attr.defaultValue;
            }
            else {
                obj[attr.name] = fromValue;
            }
        });
    }

    update(jsonObj: any, obj: any) {
        this.attributes.forEach((attr) => {

            const fromValue = jsonObj[attr.name];
            if (fromValue !== undefined) {
                obj[attr.name] = fromValue;
            }
        });
    }

    setDefaults(obj: any) {
        this.attributes.forEach((attr) => {
            obj[attr.name] = attr.defaultValue;
        });
    }

}

/** @hidden @internal */
export default AttributeDefinitions;
