// Libs

// Project imports
import { useAppContext } from "../Context"

interface ComponentProps {}

const InputRealtimeResize: React.FC<ComponentProps> = () => {
  const { realtimeResize, setRealtimeResize } = useAppContext()

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setRealtimeResize(e.target.checked)
  }

  return (
    <>
      <span style={{ fontSize: "14px" }}>Realtime resize</span>
      <input name="realtimeResize" type="checkbox" checked={realtimeResize} onChange={onChange} />
    </>
  )
}

export default InputRealtimeResize
