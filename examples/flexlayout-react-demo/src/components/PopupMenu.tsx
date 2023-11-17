// Libs

// Project imports

interface ComponentProps {
  title: string
  items: string[]
  currentDocument: Document
  onHide: (item?: string) => void
}

const PopupMenu: React.FC<ComponentProps> = ({ title, items, onHide }) => {
  const onItemClick = (item: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onHide(item)
    event.stopPropagation()
  }

  const itemElements = items.map((item) => (
    <div key={item} className="popup_menu_item" onClick={(event) => onItemClick(item, event)}>
      {item}
    </div>
  ))

  return (
    <div className="popup_menu">
      <div className="popup_menu_title">{title}</div>
      {itemElements}
    </div>
  )
}

export default PopupMenu
