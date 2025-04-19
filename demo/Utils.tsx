export class Utils {

    static downloadFile(downloadUrl: any, onSuccess: any, onError: any) {
        console.log("DownloadFile: " + downloadUrl);
        if (downloadUrl) {
            const xhr = new XMLHttpRequest();
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
                console.log(e);
                onError(e);
            };
            xhr.send();
        }
    }

    static getQueryParams() {
        const a = window.location.search.substr(1);
        if (a == "") return {};
        const params = a.split('&');
        const b: any = {};
        for (let i = 0; i < params.length; ++i) {
            const p = params[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    }
}
