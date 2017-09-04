import Attribute from "./Attribute";

class AttributeDefinitions {

    constructor() {
        this.attributes = [];
        this.nameToAttribute = {};
    }

    addWithAll(name, modelName, defaultValue, alwaysWriteJson) {
        let attr = new Attribute(name, modelName, defaultValue, alwaysWriteJson);
        this.attributes.push(attr);
        this.nameToAttribute[name] = attr;
        return attr;
    }

    addInherited(name, modelName) {
        return this.addWithAll(name, modelName, undefined, false);
    }

    add(name, defaultValue, alwaysWriteJson) {
        return this.addWithAll(name, null, defaultValue, alwaysWriteJson);
    }

    getAttributes() {
        return this.attributes;
    }

    getModelName(name){
        let conversion = this.nameToAttribute[name];
        if (conversion != null) {
            return conversion.modelName;
        } else {
            return null;
        }
    }

    toJson(jsonObj, obj) {
        this.attributes.forEach((attr) => {
            const fromValue = obj[attr.name];
            if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
                jsonObj[attr.name] = fromValue;
            }
        });
    }

    fromJson(jsonObj, obj) {
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

    update(jsonObj, obj) {
        this.attributes.forEach((attr) => {

            const fromValue = jsonObj[attr.name];
            if (fromValue !== undefined) {
                obj[attr.name] = fromValue;
            }
        });
    }

    setDefaults(obj) {
        this.attributes.forEach((attr) => {
            obj[attr.name] = attr.defaultValue;
        });
    }

}

export default AttributeDefinitions;