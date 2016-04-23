
class JsonConverter
{
    constructor()
    {
        this.conversions = [];
    }

    addConversion(name, jsonName, defaultValue, alwayWriteJson)
    {
        this.conversions.push({name:name, jsonName:jsonName, defaultValue:defaultValue, alwaysWriteJson:(alwayWriteJson===undefined)?false:true});
    }

    toJson(jsonObj, obj)
    {
        for (var i=0; i<this.conversions.length; i++)
        {
            var c = this.conversions[i];
            var fromValue = obj[c.name];
            if (c.alwaysWriteJson || fromValue !== c.defaultValue)
            {
                jsonObj[c.jsonName] = fromValue;
            }
        }
    }

    fromJson(jsonObj, obj)
    {
        if (jsonObj == null)
        {
            debugger;
        }
        for (var i=0; i<this.conversions.length; i++)
        {
            var c = this.conversions[i];
            var fromValue = jsonObj[c.jsonName];
            if (fromValue === undefined)
            {
                obj[c.name] = c.defaultValue;
            }
            else
            {
                obj[c.name] = fromValue;
            }
        }
    }

    updateAttrs(jsonObj, obj)
    {
        for (var i=0; i<this.conversions.length; i++)
        {
            var c = this.conversions[i];
            var fromValue = jsonObj[c.jsonName];
            if (fromValue !== undefined)
            {
                obj[c.name] = fromValue;
            }
        }
    }

    setDefaults(obj)
    {
        for (var i=0; i<this.conversions.length; i++)
        {
            var c = this.conversions[i];
            obj[c.name] = c.defaultValue;
        }
    }

    toTable()
    {
        var lines = [];
        lines.push("| Attribute | Default | Description  |");
        lines.push("| ------------- |:-------------:| -----|");
        for (var i=0; i<this.conversions.length; i++)
        {
            var c = this.conversions[i];
            lines.push("| " + c.jsonName + " | " + c.defaultValue + " | |");
        }

        return lines.join("\n");
    }
}

export default JsonConverter;