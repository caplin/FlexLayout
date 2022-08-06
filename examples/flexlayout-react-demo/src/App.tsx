// Libs
import React, { useState, useEffect } from "react"
import { Actions, BorderNode, CLASSES, DragDrop, DropInfo, ILayoutProps, Layout, Model, Node, TabNode, TabSetNode } from "flexlayout-react"

// Project imports
import { useAppContext } from "./Context"
import NewFeatures from "./components/NewFeatures"
import Table from "./components/Table"
import TabStorage from "./components/TabStorage"
import Toolbar from "./components/Toolbar"
import { downloadFile, makeFakeData, showPopup } from "./utils"

var fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"]

interface ComponentProps {}

const App: React.FC<ComponentProps> = () => {
  const ctx = useAppContext()
  const layoutRef = React.createRef<Layout>()
  const [loadingLayoutName, setLoadingLayoutName] = useState<string | undefined>()

  useEffect(() => {
    loadLayout("default", false)
    document.body.addEventListener("touchmove", preventIOSScrollingWhenDragging, { passive: false })

    // use to generate json typescript interfaces
    // Model.toTypescriptInterfaces();

    return () => {
      save()
    }
  }, [])

  const save = () => {
    // var jsonStr = JSON.stringify(ctx.model!.toJson(), null, "\t")
    // localStorage.setItem(ctx.layoutFile!, jsonStr)
  }

  const loadLayout = (layoutName: string, reload?: boolean) => {
    if (ctx.layoutFile !== null) {
      save()
    }

    setLoadingLayoutName(layoutName)
    let loaded = false
    if (!reload) {
      var json = localStorage.getItem(layoutName)
      if (json != null) {
        load(json)
        loaded = true
      }
    }

    if (!loaded) {
      downloadFile("layouts/" + layoutName + ".layout", load, error)
    }
  }

  const load = (jsonText: string) => {
    let json = JSON.parse(jsonText)
    let model = Model.fromJson(json)
    ctx.setModel(model)

    // model.setOnCreateTabSet((tabNode?: TabNode) => {
    //     console.log("onCreateTabSet " + tabNode);
    //     // return { type: "tabset", name: "Header Text" };
    //     return { type: "tabset" };
    // });

    // you can control where nodes can be dropped
    //model.setOnAllowDrop(this.allowDrop);

    ctx.setLayoutFile(loadingLayoutName!)
  }

  const error = (reason: string) => {
    alert("Error loading json config file: " + loadingLayoutName + "\n" + reason)
  }

  const preventIOSScrollingWhenDragging = (e: Event) => {
    if (DragDrop.instance.isActive()) {
      e.preventDefault()
    }
  }

  const allowDrop = (dragNode: TabNode | TabSetNode, dropInfo: DropInfo) => {
    let dropNode = dropInfo.node

    // prevent non-border tabs dropping into borders
    if (dropNode.getType() === "border" && (dragNode.getParent() == null || dragNode.getParent()!.getType() != "border")) return false

    // prevent border tabs dropping into main layout
    if (dropNode.getType() !== "border" && dragNode.getParent() != null && dragNode.getParent()!.getType() == "border") return false

    return true
  }

  const onSelectLayout = (event: React.FormEvent) => {
    var target = event.target as HTMLSelectElement
    loadLayout(target.value)
  }

  const onAddFromTabSetButton = (node: TabSetNode | BorderNode) => {
    ctx.incNextGridIndex()
    layoutRef!.current!.addTabToTabSet(node.getId(), {
      component: "grid",
      name: "Grid " + ctx.nextGridIndex,
    })
  }

  const props: ILayoutProps = {
    model: ctx.model!,
    factory(node) {
      // log lifecycle events
      //node.setEventListener("resize", function(p){console.log("resize", node);});
      //node.setEventListener("visibility", function(p){console.log("visibility", node);});
      //node.setEventListener("close", function(p){console.log("close", node);});

      var component = node.getComponent()

      if (component === "json") {
        return <pre style={{ tabSize: "20px" }} dangerouslySetInnerHTML={{ __html: ctx.highlightedJson! }} />
      } else if (component === "grid") {
        if (node.getExtraData().data == null) {
          // create data in node extra data first time accessed
          node.getExtraData().data = makeFakeData(fields)
        }

        return <Table fields={fields} onClick={() => {}} data={node.getExtraData().data} />
        //   return <Table fields={fields} onClick={onTableClick.bind(this, node)} data={node.getExtraData().data} />
      } else if (component === "sub") {
        var model = node.getExtraData().model
        if (model == null) {
          node.getExtraData().model = Model.fromJson(node.getConfig().model)
          model = node.getExtraData().model
          // save submodel on save event
          node.setEventListener("save", (p: any) => {
            ctx.model!.doAction(Actions.updateNodeAttributes(node.getId(), { config: { model: node.getExtraData().model.toJson() } }))
            //  node.getConfig().model = node.getExtraData().model.toJson();
          })
        }

        return <Layout model={model} factory={this.factory} />
      } else if (component === "text") {
        try {
          return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />
        } catch (e) {
          console.log(e)
        }
      } else if (component === "newfeatures") {
        return <NewFeatures />
      } else if (component === "multitype") {
        try {
          const config = node.getConfig()
          if (config.type === "url") {
            return <iframe title={node.getId()} src={config.data} style={{ display: "block", border: "none", boxSizing: "border-box" }} width="100%" height="100%" />
          } else if (config.type === "html") {
            return <div dangerouslySetInnerHTML={{ __html: config.data }} />
          } else if (config.type === "text") {
            return <textarea style={{ position: "absolute", width: "100%", height: "100%", resize: "none", boxSizing: "border-box", border: "none" }} defaultValue={config.data} />
          }
        } catch (e) {
          return <div>{String(e)}</div>
        }
      } else if (component === "tabstorage") {
        return <TabStorage tab={node} layout={layoutRef!.current!} />
      }

      return null
    },
    iconFactory(node) {
      if (node.getId() === "custom-tab") {
        return (
          <>
            <span style={{ marginRight: 3 }}>😎</span>
          </>
        )
      }
      return
    },
    onAction(action) {
      return action
    },
    onModelChange() {
      console.log("Model have changed")
    },
    onRenderDragRect(content, node, json) {
      if (ctx.layoutFile === "newfeatures") {
        return (
          <>
            {content}
            <div style={{ whiteSpace: "pre" }}>
              <br />
              This is a customized
              <br />
              drag rectangle
            </div>
          </>
        )
      } else {
        return undefined // use default rendering
      }
    },
    onRenderTab(node, renderValues) {
      // renderValues.content = (<InnerComponent/>);
      // renderValues.content += " *";
      // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
      // renderValues.name = "tab " + node.getId(); // name used in overflow menu
      // renderValues.buttons.push(<img style={{width:"1em", height:"1em"}} src="images/folder.svg"/>);
    },

    onRenderTabSet(node, renderValues) {
      if (ctx.layoutFile === "default") {
        //renderValues.headerContent = "-- " + renderValues.headerContent + " --";
        //renderValues.buttons.push(<img style={{width:"1em", height:"1em"}} src="images/folder.svg"/>);
        renderValues.stickyButtons.push(
          <img
            src="images/add.svg"
            alt="Add"
            key="Add button"
            title="Add Tab (using onRenderTabSet callback, see Demo)"
            style={{ width: "1.1em", height: "1.1em" }}
            className="flexlayout__tab_toolbar_button"
            onClick={() => onAddFromTabSetButton(node)}
          />
        )
      }
    },

    onTabSetPlaceHolder(node) {
      return <div>Drag tabs to this area</div>
    },

    onExternalDrag(e) {
      // console.log("onExternaldrag ", e.dataTransfer.types);
      // Check for supported content type
      const validTypes = ["text/uri-list", "text/html", "text/plain"]
      if (e.dataTransfer.types.find((t) => validTypes.indexOf(t) !== -1) === undefined) return
      // Set dropEffect (icon)
      e.dataTransfer.dropEffect = "link"
      return {
        dragText: "Drag To New Tab",
        json: {
          type: "tab",
          component: "multitype",
        },
        onDrop: (node?: Node, event?: Event) => {
          if (!node || !event) return // aborted drag

          if (node instanceof TabNode && event instanceof DragEvent) {
            const dragEvent = event as DragEvent
            if (dragEvent.dataTransfer) {
              if (dragEvent.dataTransfer.types.indexOf("text/uri-list") !== -1) {
                const data = dragEvent.dataTransfer!.getData("text/uri-list")
                ctx.model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Url", config: { data, type: "url" } }))
              } else if (dragEvent.dataTransfer.types.indexOf("text/html") !== -1) {
                const data = dragEvent.dataTransfer!.getData("text/html")
                ctx.model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Html", config: { data, type: "html" } }))
              } else if (dragEvent.dataTransfer.types.indexOf("text/plain") !== -1) {
                const data = dragEvent.dataTransfer!.getData("text/plain")
                ctx.model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Text", config: { data, type: "text" } }))
              }
            }
          }
        },
      }
    },

    titleFactory(node) {
      if (node.getId() === "custom-tab") {
        // return "(Added by titleFactory) " + node.getName();
        return {
          titleContent: <div>(Added by titleFactory) {node.getName()}</div>,
          name: "the name for custom tab",
        }
      }
      return
    },

    // icons={{
    //     more: (node: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => {
    //         return (<div style={{fontSize:".7em"}}>{hiddenTabs.length}</div>);
    //     }
    // }}

    // classNameMapper={
    //     className => {
    //         console.log(className);
    //         if (className === "flexlayout__tab_button--selected") {
    //             className = "override__tab_button--selected";
    //         }
    //         return className;
    //     }
    // }
    // i18nMapper = {
    //     (id, param?) => {
    //         if (id === I18nLabel.Move_Tab) {
    //             return `move this tab: ${param}`;
    //         } else if (id === I18nLabel.Move_Tabset) {
    //             return `move this tabset`
    //         }
    //         return undefined;
    //     }
    // }
  }

  let additionalProps: Omit<ILayoutProps, "factory" | "model"> = {
    onContextMenu(node, event) {
      if (!ctx.showingPopupMenu) {
        event.preventDefault()
        event.stopPropagation()
        console.log(node, event)
        showPopup(
          node instanceof TabNode ? "Tab: " + node.getName() : "Type: " + node.getType(),
          layoutRef!.current!.getRootDiv(),
          event.clientX,
          event.clientY,
          ["Option 1", "Option 2"],
          (item: string | undefined) => {
            console.log("selected: " + item)
            ctx.setShowingPopupMenu(false)
          }
        )
        ctx.setShowingPopupMenu(true)
      }
    },
    onAuxMouseClick(node, event) {
      console.log(node, event)
    },
    onRenderFloatingTabPlaceholder(dockPopout, showPopout) {
      return (
        <div className={CLASSES.FLEXLAYOUT__TAB_FLOATING_INNER}>
          <div>Custom renderer for floating tab placeholder</div>
          <div>
            <a href="#" onClick={showPopout}>
              Show the tab
            </a>
          </div>
          <div>
            <a href="#" onClick={dockPopout}>
              Dock the tab
            </a>
          </div>
        </div>
      )
    },
    onTabDrag(dragging, over, x, y, location, refresh) {
      const tabStorageImpl = over.getExtraData().tabStorage_onTabDrag as ILayoutProps["onTabDrag"]
      if (tabStorageImpl) {
        return tabStorageImpl(dragging, over, x, y, location, refresh)
      }
      return undefined
    },
  }

  if (ctx.layoutFile === "newfeatures") {
    additionalProps = {}
  }

  return (
    <React.StrictMode>
      <div className="app">
        <Toolbar layoutRef={layoutRef} loadLayout={loadLayout} />
        <div className="contents">
          {!ctx.model && "loading ..."}
          {ctx.model && <Layout ref={layoutRef} {...ctx} {...props} {...additionalProps} font={{ size: ctx.fontSize }} />}
        </div>
      </div>
    </React.StrictMode>
  )
}

export default App
