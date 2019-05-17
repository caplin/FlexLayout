/** @hidden @internal */
class Attribute {

    static ENUM = "Enum";
    static INT = "Int";
    static NUMBER = "Number";
    static STRING = "String";
    static BOOLEAN = "Boolean";
    static ID = "Id";
    static JSON = "Json";

    name: string;
    modelName?: string ;
    defaultValue: any;
    alwaysWriteJson?: boolean;
    type?: string;
    values: any[];
    from: number;
    to: number;

    constructor(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
        this.name = name;
        this.modelName = modelName;
        this.defaultValue = defaultValue;
        this.alwaysWriteJson = alwaysWriteJson;

        this.type = undefined;
        this.values = [];
        this.from = -99999999;
        this.to = 99999999;
    }

    setType(value: string) {
        this.type = value;
        return this;
    }

    setValues(...args: any[]) {
        this.values = args;
        return this;
    }

    setFrom(value: number) {
        this.from = value;
        return this;
    }

    setTo(value: number) {
        this.to = value;
        return this;
    }
}

/** @hidden @internal */
export default Attribute;
