import 'babel-core/polyfill';


class Utils {

    static downloadFile(downloadUrl)
    {
        console.log("DownloadFile: " + downloadUrl);
        var promise = new Promise(function (resolve, reject)
        {
            if (downloadUrl)
            {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', downloadUrl);
                xhr.onload = function ()
                {
                    if (xhr.status == 200)
                    {
                        resolve(xhr.responseText);
                    }
                    else
                    {
                        reject(xhr.status + " " + xhr.statusText);
                    }
                };
                xhr.onerror = function (e)
                {
                    console.log(e.getMessage, e);
                    reject(e);
                };
                xhr.send();
            }
            else
            {
                reject(null);
            }
        });

        return promise;
    }

    static getQueryParams()
    {
        var a = window.location.search.substr(1).split('&');
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p = a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    }
}

export default Utils;