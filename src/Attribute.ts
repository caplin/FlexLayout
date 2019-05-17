/** @hidden @internal */
class Attribute {

    public static ENUM = "Enum";
    public static INT = "Int";
    public static NUMBER = "Number";
    public static STRING = "String";
    public static BOOLEAN = "Boolean";
    public static ID = "Id";
    public static JSON = "Json";

    public name: string;
    public modelName?: string ;
    public defaultValue: any;
    public alwaysWriteJson?: boolean;
    public type?: string;
    public values: any[];
    public from: number;
    public to: number;

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

    public setType(value: string) {
        this.type = value;
        return this;
    }

    public setValues(...args: any[]) {
        this.values = args;
        return this;
    }

    public setFrom(value: number) {
        this.from = value;
        return this;
    }

    public setTo(value: number) {
        this.to = value;
        return this;
    }
}

/** @hidden @internal */
export default Attribute;
