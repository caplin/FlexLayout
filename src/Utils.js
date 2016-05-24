
class Utils {

    static getGetters(thisObj, obj, valueMap) {
        let propertyNames = Object.getOwnPropertyNames(obj);
        for (var i = 0; i < propertyNames.length; i++) {
            let name = propertyNames[i];
            if (typeof obj[name] === 'function' && name.startsWith("get")) {
                let value = null;
                try {
                    value = thisObj[name]();
                }
                catch (e) {
                }
                valueMap[name] = value;
            }
        }

        var proto = Object.getPrototypeOf(obj);
        if (proto != undefined) {
            Utils.getGetters(thisObj, proto, valueMap);
        }

        return valueMap;
    }
}

export default Utils;

