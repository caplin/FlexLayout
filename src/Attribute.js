class Attribute {
    constructor(name, modelName, defaultValue, alwaysWriteJson) {
        this.name = name;
        this.modelName = modelName;
        this.defaultValue = defaultValue;
        this.alwaysWriteJson = alwaysWriteJson;

        this.type = null;
        this.values = [];
        this.from = -99999999;
        this.to = 99999999;
    }

    setType(value){
        this.type = value;
        return this;
    }

    setValues(){
        this.values = Array.from(arguments);
        return this;
    }

    setFrom(value){
        this.from = value;
        return this;
    }

    setTo(value){
        this.to = value;
        return this;
    }
}

Attribute.ENUM = "Enum";
Attribute.INT = "Int";
Attribute.NUMBER = "Number";
Attribute.STRING = "String";
Attribute.BOOLEAN = "Boolean";
Attribute.ID = "Id";
Attribute.JSON = "Json";

export default Attribute;