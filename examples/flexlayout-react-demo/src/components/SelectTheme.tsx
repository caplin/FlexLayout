// Libs

// Project imports

const options = [
  { text: "Underline", value: "underline" },
  { text: "Light", value: "light" },
  { text: "Gray", value: "gray" },
  { text: "Dark", value: "dark" },
]

interface ComponentProps extends React.ComponentProps<"select"> {}

const SelectTheme: React.FC<ComponentProps> = (props) => {
  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    let flexlayout_stylesheet: any = window.document.getElementById("flexlayout-stylesheet")
    let index = flexlayout_stylesheet.href.lastIndexOf("/")
    let newAddress = flexlayout_stylesheet.href.substr(0, index)
    flexlayout_stylesheet.setAttribute("href", newAddress + "/" + e.target.value + ".css")
    let page_stylesheet = window.document.getElementById("page-stylesheet")
    page_stylesheet!.setAttribute("href", e.target.value + ".css")
    // this.forceUpdate()
  }

  return (
    <select {...props} onChange={onChange} defaultValue="light">
      {options.map((el) => (
        <option key={el.value} value={el.value}>
          {el.text}
        </option>
      ))}
    </select>
  )
}

export default SelectTheme
