class Orientation
{
    static flip(from)
    {
        if (from === Orientation.HORZ)
        {
            return Orientation.VERT;
        }
        else
        {
            return Orientation.HORZ;
        }
    }
}

// statics
Orientation.HORZ = "horz";
Orientation.VERT = "vert";

export default Orientation;