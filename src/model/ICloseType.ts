export enum ICloseType {
    Visible = 1, // close if selected or hovered, i.e. when x is visible (will only close selected on mobile, where css hover is not available)
    Always = 2, // close always (both selected and unselected when x rect tapped e.g where a custom image has been added for close)
    Selected = 3, // close only if selected
}
