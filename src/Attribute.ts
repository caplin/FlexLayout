/** @internal */
export class Attribute {
    static NUMBER = "number";
    static STRING = "string";
    static BOOLEAN = "boolean";

    name: string;
    alias: string | undefined;
    modelName?: string;
    pairedAttr?: Attribute;
    pairedType?: string;
    defaultValue: any;
    alwaysWriteJson?: boolean;
    type?: string; 
    required: boolean;
    fixed: boolean;
    description?: string;

    constructor(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
        this.name = name;
        this.alias = undefined;
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

    setAlias(value: string) {
        this.alias = value;
        return this;
    }

    setDescription(value: string) {
        this.description = value;
    }

    setRequired() {
        this.required = true;
        return this;
    }

    setFixed() {
        this.fixed = true;
        return this;
    }

    // sets modelAttr for nodes, and nodeAttr for model
    setpairedAttr(value: Attribute) {
        this.pairedAttr = value;
    }

    setPairedType(value: string) {
        this.pairedType = value;
    }

}
