// Libs

// Project imports
import SelectLayout from "./SelectLayout"
import SelectFontsize from "./SelectFontsize"
import InputRealtimeResize from "./InputRealtimeResize"
import SelectTheme from "./SelectTheme"
import { useAppContext } from "../Context"

interface ComponentProps {
  layoutRef: any
  loadLayout: any
}

const Toolbar: React.FC<ComponentProps> = ({ layoutRef, loadLayout }) => {
  const ctx = useAppContext()

  const onAdded = () => {
    ctx.setIsAdding(false)
  }

  const onShowLayoutClick = (event: React.MouseEvent) => {
    console.log(JSON.stringify(ctx.model!.toJson(), null, "\t"))
  }

  const onAddActiveClick = (event: React.MouseEvent) => {
    ctx.incNextGridIndex()
    layoutRef!.current!.addTabToActiveTabSet({
      component: "grid",
      icon: "images/article.svg",
      name: "Grid " + ctx.nextGridIndex,
    })
  }

  const onAddIndirectClick = (event: React.MouseEvent) => {
    ctx.incNextGridIndex()
    layoutRef!.current!.addTabWithDragAndDropIndirect(
      "Add grid\n(Drag to location)",
      {
        component: "grid",
        name: "Grid " + ctx.nextGridIndex,
      },
      onAdded
    )
    ctx.setIsAdding(true)
  }

  const onAddDragMouseDown = (event: React.MouseEvent | React.TouchEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    ctx.incNextGridIndex()
    layoutRef!.current!.addTabWithDragAndDrop(
      undefined,
      {
        component: "grid",
        icon: "images/article.svg",
        name: "Grid " + ctx.nextGridIndex,
      },
      onAdded
    )
    // this.setState({ adding: true });
  }

  const onReloadFromFile = (event: React.MouseEvent) => {
    loadLayout(ctx.layoutFile!, true)
  }

  return (
    <div className="toolbar" dir="ltr">
      <SelectLayout loadLayout={loadLayout} className="toolbar_control" />
      <button className="toolbar_control" onClick={onReloadFromFile} style={{ marginLeft: 5 }}>
        Reload
      </button>
      <div style={{ flexGrow: 1 }}></div>
      <InputRealtimeResize />

      <SelectFontsize className="toolbar_control" style={{ marginLeft: 5 }} />

      <SelectTheme className="toolbar_control" style={{ marginLeft: 5 }} />
      <button className="toolbar_control" style={{ marginLeft: 5 }} onClick={onShowLayoutClick}>
        Show Layout JSON in Console
      </button>
      <button
        className="toolbar_control drag-from"
        disabled={ctx.isAdding}
        style={{ height: "30px", marginLeft: 5, border: "none", outline: "none" }}
        title="Add using Layout.addTabWithDragAndDrop"
        onMouseDown={onAddDragMouseDown}
        onTouchStart={onAddDragMouseDown}
      >
        Add Drag
      </button>
      <button className="toolbar_control" disabled={ctx.isAdding} style={{ marginLeft: 5 }} title="Add using Layout.addTabToActiveTabSet" onClick={onAddActiveClick}>
        Add Active
      </button>
      <button className="toolbar_control" disabled={ctx.isAdding} style={{ marginLeft: 5 }} title="Add using Layout.addTabWithDragAndDropIndirect" onClick={onAddIndirectClick}>
        Add Indirect
      </button>
    </div>
  )
}

export default Toolbar
