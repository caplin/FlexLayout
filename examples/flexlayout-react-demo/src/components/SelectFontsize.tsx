// Libs

// Project imports
import { useAppContext } from "../Context"

const options = [
  { text: "Size xx-small", value: "xx-small" },
  { text: "Size x-small", value: "x-small" },
  { text: "Size small", value: "small" },
  { text: "Size medium", value: "medium" },
  { text: "Size large", value: "large" },
  { text: "Size 8px", value: "8px" },
  { text: "Size 10px", value: "10px" },
  { text: "Size 12px", value: "12px" },
  { text: "Size 14px", value: "14px" },
  { text: "Size 16px", value: "16px" },
  { text: "Size 18px", value: "18px" },
  { text: "Size 20px", value: "20px" },
  { text: "Size 25px", value: "25px" },
  { text: "Size 30px", value: "30px" },
]

interface ComponentProps extends React.ComponentProps<"select"> {}

const SelectFontsize: React.FC<ComponentProps> = (props) => {
  const { fontSize, setFontsize } = useAppContext()

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setFontsize(e.target.value)
  }

  return (
    <select {...props} onChange={onChange} defaultValue={fontSize}>
      {options.map((el) => (
        <option key={el.value} value={el.value}>
          {el.text}
        </option>
      ))}
    </select>
  )
}

export default SelectFontsize
