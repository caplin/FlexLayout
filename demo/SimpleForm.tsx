import * as React from "react";

export function SimpleForm() {

    const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const [value, setValue] = React.useState<number>(0);


    const [formData, setFormData] = React.useState({
      username: "",
      password: ""
    });

    React.useEffect(()=> {
      timer.current = setInterval(()=> {
        setValue(v=> v=v+1);
      }, 1000);
      return () => {
        clearInterval(timer.current);
      }
    })
  
    const handleChange = (event: { target: { name: any; value: any; }; }) => {
      const { name, value } = event.target;
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    };
  
  
    const handleSubmit = (event: { preventDefault: () => void; }) => {
      event.preventDefault();
    };
  
    return (
      <div style={{padding:10, display:"flex", 
      flexDirection:"column", gap:10, overflow:"auto", 
      height:"100%", boxSizing:"border-box"}}>
      <p>See that the form keeps state when popped out</p>
      <form style={{display:"flex", flexDirection:"column", gap:10}} onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <div>{value}</div>
        <input type="submit" value="Submit" />
      </form>
      </div>
    );
  }