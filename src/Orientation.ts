class Orientation {

    public static HORZ = new Orientation("horz");
    public static VERT = new Orientation("vert");

    public static flip(from: Orientation) {
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

    public toString() {
        return this._name;
    }
}

export default Orientation;