export class Action {
    type: string;
    data: Record<string, any>;

    constructor(type: string, data: Record<string, any>) {
        this.type = type;
        this.data = data;
    }
}
