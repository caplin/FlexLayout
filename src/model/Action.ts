import { JSMap } from "../Types";

class Action {
    public type: string;
    public data: JSMap<any>;

    constructor(type: string, data: JSMap<any>) {
        this.type = type;
        this.data = data;
    }
}

export default Action;
