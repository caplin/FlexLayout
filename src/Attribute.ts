/** @internal */
export class Attribute {
    static NUMBER = "number";
    static STRING = "string";
    static BOOLEAN = "boolean";

    name: string;
    modelName?: string;
    defaultValue: any;
    alwaysWriteJson?: boolean;
    type?: string; 
    required: boolean;
    fixed: boolean;

    constructor(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
        this.name = name;
        this.modelName = modelName;
        this.defaultValue = defaultValue;
        this.alwaysWriteJson = alwaysWriteJson;
        this.required = false;
        this.fixed = false;

        this.type = "any";
    }

    setType(value: string) {
        this.type = value;
        return this;
    }

    setRequired() {
        this.required = true;
        return this;
    }

    setFixed() {
        this.fixed = true;
        return this;
    }

}
