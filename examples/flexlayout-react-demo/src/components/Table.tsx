// Libs

// Project imports

interface ComponentProps extends React.ComponentProps<"table"> {
  fields: any
  data: any
}

const Table: React.FC<ComponentProps> = ({ fields, data, onClick }) => {
  // if (Math.random()>0.8) throw Error("oppps I crashed");
  var headercells = fields.map(function (field: any) {
    return <th key={field}>{field}</th>
  })

  var rows = []
  for (var i = 0; i < data.length; i++) {
    var row = fields.map((field: any) => <td key={field}>{data[i][field]}</td>)
    rows.push(<tr key={i}>{row}</tr>)
  }

  const onTableClick = (node: Node, event: Event) => {
    // console.log("tab: \n" + node._toAttributeString());
    // console.log("tabset: \n" + node.getParent()!._toAttributeString());
    // const n = this.state.model?.getNodeById("#750f823f-8eda-44b7-a887-f8b287ace2c8");
    // (this.refs.layout as Layout).moveTabWithDragAndDrop(n as TabSetNode, "move tabset");
    // (this.refs.layout as Layout).moveTabWithDragAndDrop(node as TabNode);
  }

  return (
    <table className="simple_table" onClick={onClick}>
      <tbody>
        <tr>{headercells}</tr>
        {rows}
      </tbody>
    </table>
  )
}

export default Table
