import { TabNode } from "../model/TabNode";
import { CLASSES } from "./CSSClassNames";
import { LayoutInternal } from "./layout/LayoutInternal";

export interface ITabLayoutProps {
    tabNode: TabNode;
}
/**
 * Component that can be used within the factory to render a tabs defined sublayout.
 * This allows the sublayout to be surrounded by other controls, e.g. a header and footer bars
 *
 * @category Components
 * @group Main Layout
 */
export const TabLayout = (props: ITabLayoutProps) => {
    const { tabNode } = props;

    const layout = tabNode.getLayout();
    const controller = layout!.getController()!;

    if (!controller) return;

    return (
        <div className={controller.getClassName(CLASSES.FLEXLAYOUT__TAB_LAYOUT_CONTAINER_USER)}>
            <LayoutInternal {...controller.getProps()} layoutId={tabNode.getSubLayoutId()} mainLayoutController={controller.getMainController()} />;
        </div>
    );
};
