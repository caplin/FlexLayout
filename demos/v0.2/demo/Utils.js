class Utils {

    static downloadFile(downloadUrl, onSuccess, onError) {
        console.log("DownloadFile: " + downloadUrl);
        if (downloadUrl) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', downloadUrl);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    onSuccess(xhr.responseText);
                }
                else {
                    onError(xhr.status + " " + xhr.statusText);
                }
            };
            xhr.onerror = function (e) {
                console.log(e.getMessage, e);
                onError(e);
            };
            xhr.send();
        }
    }

    static getQueryParams() {
        var a = window.location.search.substr(1).split('&');
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
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