// Libs
import { highlight, languages } from "prismjs"

// import * as ReactDOM from "react-dom/client"
import { DragDrop } from "flexlayout-react"

export function downloadFile(downloadUrl: any, onSuccess: any, onError: any) {
  console.log("DownloadFile: " + downloadUrl)
  if (downloadUrl) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", downloadUrl)
    xhr.onload = function () {
      if (xhr.status == 200) {
        onSuccess(xhr.responseText)
      } else {
        onError(xhr.status + " " + xhr.statusText)
      }
    }
    xhr.onerror = function (e) {
      console.log(e)
      onError(e)
    }
    xhr.send()
  }
}

export function getQueryParams() {
  var a = window.location.search.substr(1)
  if (a == "") return {}
  var params = a.split("&")
  var b: any = {}
  for (var i = 0; i < params.length; ++i) {
    var p = params[i].split("=", 2)
    if (p.length == 1) b[p[0]] = ""
    else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "))
  }
  return b
}

/** @hidden @internal */
export function showPopup(title: string, layoutDiv: HTMLDivElement, x: number, y: number, items: string[], onSelect: (item: string | undefined) => void) {
  const currentDocument = layoutDiv.ownerDocument
  const layoutRect = layoutDiv.getBoundingClientRect()

  const elm = currentDocument.createElement("div")
  elm.className = "popup_menu_container"

  if (x < layoutRect.left + layoutRect.width / 2) {
    elm.style.left = x - layoutRect.left + "px"
  } else {
    elm.style.right = layoutRect.right - x + "px"
  }

  if (y < layoutRect.top + layoutRect.height / 2) {
    elm.style.top = y - layoutRect.top + "px"
  } else {
    elm.style.bottom = layoutRect.bottom - y + "px"
  }

  DragDrop.instance.addGlass(() => onHide(undefined))
  DragDrop.instance.setGlassCursorOverride("default")
  layoutDiv.appendChild(elm)

  const onHide = (item: string | undefined) => {
    DragDrop.instance.hideGlass()
    onSelect(item)
    layoutDiv.removeChild(elm)
    // root.unmount()
    elm.removeEventListener("mousedown", onElementMouseDown)
    currentDocument.removeEventListener("mousedown", onDocMouseDown)
  }

  const onElementMouseDown = (event: Event) => {
    event.stopPropagation()
  }

  const onDocMouseDown = (event: Event) => {
    onHide(undefined)
  }

  elm.addEventListener("mousedown", onElementMouseDown)
  currentDocument.addEventListener("mousedown", onDocMouseDown)

  //   const root = ReactDOM.createRoot(elm)
  //   root.render(<PopupMenu currentDocument={currentDocument} onHide={onHide} title={title} items={items} />)
}

export function getHighlightedJSON(jsonText: string) {
  return highlight(jsonText, languages.javascript, "javascript")
}

export function makeFakeData(fields: any[]) {
  var data = []
  var r = Math.random() * 50
  for (var i = 0; i < r; i++) {
    var rec: { [key: string]: any } = {}
    rec.Name = randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    for (var j = 1; j < fields.length; j++) {
      rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2)
    }
    data.push(rec)
  }
  return data
}

export function randomString(len: number, chars: string) {
  var a = []
  for (var i = 0; i < len; i++) {
    a.push(chars[Math.floor(Math.random() * chars.length)])
  }

  return a.join("")
}
