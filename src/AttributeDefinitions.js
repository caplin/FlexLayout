class AttributeDefinitions {

    constructor() {
        this.attributes = [];
        this.nameToAttribute = {};
    }

    addWithAll(name, modelName, defaultValue, alwaysWriteJson) {
        let conversion = {
            name: name,
            modelName: modelName,
            defaultValue: defaultValue,
            alwaysWriteJson: alwaysWriteJson
        };
        this.attributes.push(conversion);
        this.nameToAttribute[name] = conversion;
    }

    addInherited(name, modelName) {
        this.addWithAll(name, modelName, undefined, false);
    }

    add(name, defaultValue, alwaysWriteJson) {
        this.addWithAll(name, null, defaultValue, alwaysWriteJson);
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
        this.attributes.forEach((c) => {
            const fromValue = obj[c.name];
            if (c.alwaysWriteJson || fromValue !== c.defaultValue) {
                jsonObj[c.name] = fromValue;
            }
        });
    }

    fromJson(jsonObj, obj) {
        this.attributes.forEach((c) => {
            const fromValue = jsonObj[c.name];
            if (fromValue === undefined) {
                obj[c.name] = c.defaultValue;
            }
            else {
                obj[c.name] = fromValue;
            }
        });
    }

    update(jsonObj, obj) {
        this.attributes.forEach((c) => {

            const fromValue = jsonObj[c.name];
            if (fromValue !== undefined) {
                obj[c.name] = fromValue;
            }
        });
    }

    setDefaults(obj) {
        this.attributes.forEach((c) => {
            obj[c.name] = c.defaultValue;
        });
    }

}

export default AttributeDefinitions;