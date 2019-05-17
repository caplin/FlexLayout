class Orientation {

    static HORZ = new Orientation("horz");
    static VERT = new Orientation("vert");

    static flip(from: Orientation) {
        if (from === Orientation.HORZ) {
            return Orientation.VERT;
        }
        else {
            return Orientation.HORZ;
        }
    }

     /** @hidden @internal */
     private _name: string;

     /** @hidden @internal */
     private constructor(name: string) {
        this._name = name;
    }

    toString() {
        return this._name;
    }
}

export default Orientation;