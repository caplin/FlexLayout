import * as React from "react";
import { CLASSES } from "../Types";
import { LayoutInternal } from "./Layout";
import { IJsonFloating } from "../model/IJsonModel";
import { Rect } from "../Rect";

/** @internal */
export interface IFloatingTabProps {
    floating: IJsonFloating;
    floatingId: string;
    layout: LayoutInternal;
    tabNode: any; // The actual TabNode instance
    onCloseFloating: (floatingId: string) => void;
    onDockFloating: (floatingId: string, x: number, y: number) => void;
    onUpdateFloating: (floatingId: string, rect: Rect, zIndex: number) => void;
}

/** @internal */
export const FloatingTab = (props: React.PropsWithChildren<IFloatingTabProps>) => {
    const { floating, floatingId, layout, tabNode, onCloseFloating, onDockFloating, onUpdateFloating, children } = props;
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [position, setPosition] = React.useState({ x: floating.rect.x, y: floating.rect.y });
    const [size, setSize] = React.useState({ width: floating.rect.width, height: floating.rect.height });
    const [zIndex, setZIndex] = React.useState(floating.zIndex);
    const floatingRef = React.useRef<HTMLDivElement>(null);
    const headerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Allow dragging only from header area
        if (headerRef.current && headerRef.current.contains(e.target as Node)) {
            const target = e.target as HTMLElement;
            // Don't start dragging if clicking on buttons
            if (!target.closest('button')) {
                setIsDragging(true);
                setDragOffset({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y
                });
                // Bring to front
                const newZ = layout.getModel().getNextZIndex();
                setZIndex(newZ);
            }
        }
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            setPosition({ x: newX, y: newY });
        }
    }, [isDragging, dragOffset]);

    const handleMouseUp = React.useCallback((e: MouseEvent) => {
        if (isDragging) {
            setIsDragging(false);

            // Update the floating position in the model
            const rect = new Rect(position.x, position.y, size.width, size.height);
            onUpdateFloating(floatingId, rect, zIndex);
        }
    }, [isDragging, position, size, zIndex, floatingId, onUpdateFloating]);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Close button clicked!");
        onCloseFloating(floatingId);
    };

    const handleDock = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Dock button clicked!");
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        onDockFloating(floatingId, centerX, centerY);
    };

    const cm = layout.getClassName;
    const icons = layout.getIcons();

    const style: React.CSSProperties = {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
        cursor: isDragging ? 'grabbing' : 'default',
        resize: 'both',
        overflow: 'hidden'
    };

    // Sync size changes from CSS resize with state (debounced for performance)
    React.useEffect(() => {
        let resizeTimer: NodeJS.Timeout;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === floatingRef.current && !isDragging) {
                    const newWidth = entry.contentRect.width;
                    const newHeight = entry.contentRect.height;

                    if (newWidth !== size.width || newHeight !== size.height) {
                        // Update visual size immediately for smooth UX
                        setSize({ width: newWidth, height: newHeight });

                        // Debounce model update to avoid performance issues
                        clearTimeout(resizeTimer);
                        resizeTimer = setTimeout(() => {
                            const rect = new Rect(position.x, position.y, newWidth, newHeight);
                            onUpdateFloating(floatingId, rect, zIndex);
                        }, 100); // 100ms debounce
                    }
                }
            }
        });

        if (floatingRef.current) {
            resizeObserver.observe(floatingRef.current);
        }

        return () => {
            clearTimeout(resizeTimer);
            resizeObserver.disconnect();
        };
    }, [position, size, zIndex, floatingId, onUpdateFloating, isDragging]);

    return (
        <div
            ref={floatingRef}
            className={cm(CLASSES.FLEXLAYOUT__FLOATING_TAB)}
            style={style}
            onDragStart={(e) => {
                    // Prevent dragging from floating tab content to main layout
                    e.preventDefault();
                    e.stopPropagation();
                }}
                                draggable={false}

            
            onMouseDown={handleMouseDown}
        >
            <div
                ref={headerRef}
                className={cm(CLASSES.FLEXLAYOUT__FLOATING_TAB_HEADER)}
            >
                <div className={cm(CLASSES.FLEXLAYOUT__FLOATING_TAB_TITLE)}>
                    {tabNode?.getName() || "[Unnamed Tab]"}
                </div>
                <div className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR)}>
                    <button
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__FLOATING_TAB_DOCK)}
                        onClick={handleDock}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="Dock back to layout"
                    >
                        {typeof icons.restore === "function" ? icons.restore(tabNode) : icons.restore}
                    </button>
                    <button
                        className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__FLOATING_TAB_CLOSE)}
                        onClick={handleClose}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="Close tab"
                    >
                        {typeof icons.close === "function" ? icons.close(tabNode) : icons.close}
                    </button>
                </div>
            </div>
            <div
                className={cm(CLASSES.FLEXLAYOUT__FLOATING_TAB_CONTENT)}
                onMouseDown={(e) => e.stopPropagation()}
                onDragStart={(e) => {
                    // Prevent dragging from floating tab content to main layout
                    e.preventDefault();
                    e.stopPropagation();
                }}
                draggable={false}
            >
                {children}
            </div>
        </div>
    );
};