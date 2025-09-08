import * as React from 'react';
import { Rect } from '../Rect';
import { ErrorBoundary } from './ErrorBoundary';
import { I18nLabel } from '../I18nLabel';
import { LayoutInternal } from './Layout';
import { TabNode } from '../model/TabNode';

export interface ISizeTrackerProps {
  layout: LayoutInternal;
  node: TabNode;
  rect: Rect;
  visible: boolean;
  forceRevision: number;
  tabsRevision: number;
}

export const SizeTracker = React.memo(({ layout, node }: ISizeTrackerProps) => {
  return (
    <ErrorBoundary
      message={layout.i18nName(I18nLabel.Error_rendering_component)}
      retryText={layout.i18nName(I18nLabel.Error_rendering_component_retry)}
    >
      {layout.props.factory(node)}
    </ErrorBoundary>
  );
}, arePropsEqual);

// only re-render if visible && (size changed or forceRevision changed or tabsRevision changed)
function arePropsEqual(
  prevProps: ISizeTrackerProps,
  nextProps: ISizeTrackerProps,
) {
  const reRender =
    nextProps.visible &&
    (!prevProps.rect.equalSize(nextProps.rect) ||
      prevProps.forceRevision !== nextProps.forceRevision ||
      prevProps.tabsRevision !== nextProps.tabsRevision);
  return !reRender;
}
