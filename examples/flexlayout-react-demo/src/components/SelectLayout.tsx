// Libs

// Project imports
import { useAppContext } from "../Context"

const options = [
  { text: "Default", value: "default" },
  { text: "New Features", value: "newfeatures" },
  { text: "Simple", value: "simple" },
  { text: "SubLayout", value: "sub" },
  { text: "Complex", value: "complex" },
  { text: "Headers", value: "headers" },
]

interface ComponentProps extends React.ComponentProps<"select"> {
  loadLayout: any
}

const SelectLayout: React.FC<ComponentProps> = (props) => {
  //   const { loadLayout } = useAppContext()
  const { loadLayout, ...rest } = props

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    loadLayout(e.target.value)
  }

  return (
    <select {...rest} onChange={onChange}>
      {options.map((el) => (
        <option key={el.value} value={el.value}>
          {el.text}
        </option>
      ))}
    </select>
  )
}

export default SelectLayout
