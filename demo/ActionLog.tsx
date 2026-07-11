import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import {
    ModuleRegistry,
    ClientSideRowModelModule,
    RowApiModule,
    ScrollApiModule,
    ValidationModule
} from 'ag-grid-community';
import { Action, Actions, Model } from '../src';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowApiModule,
    ScrollApiModule,
    ValidationModule, // This will turn "Error #200" into a readable text message
]);

export interface IActionEntry {
    id: number;
    type: string;
    data: string;
}

export const ActionLog = (props: { model: Model }) => {

    const nextActionId = React.useRef<number>(0);
    const [actions, setActions] = React.useState<IActionEntry[]>([]);
    const lastSplitterResizeAction = React.useRef<Action | undefined>(undefined);
    const currentActions = React.useRef<IActionEntry[]>(actions);

    const [colDefs] = React.useState<ColDef<IActionEntry>[]>([
        { field: 'id', width: 80 },
        { field: 'type', width: 200 },
        { field: 'data', width: 2000 },
    ]);

    React.useEffect(() => {
        currentActions.current = actions;
    });

    React.useEffect(() => {
        const currentModel = props.model;
        let timer: ReturnType<typeof setInterval>;

        const addAction = (action: Action) => {
            nextActionId.current++;
            const newEntry: IActionEntry = {
                id: nextActionId.current,
                type: action.type,
                data: JSON.stringify(action.data)
            };
            currentActions.current = [...currentActions.current, newEntry];
            if (currentActions.current.length > 1000) {
                currentActions.current.shift();
            }
        }

        const listener = (action: Action) => {
            // only show last splitter change in log
            if (action.type === Actions.ADJUST_WEIGHTS || action.type === Actions.ADJUST_BORDER_SPLIT) {
                lastSplitterResizeAction.current = action;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    if (lastSplitterResizeAction.current) {
                        addAction(lastSplitterResizeAction.current);
                        setActions(currentActions.current);
                        lastSplitterResizeAction.current = undefined;
                    }
                }, 500);
            } else {
                if (lastSplitterResizeAction.current) {
                    addAction(lastSplitterResizeAction.current);
                    setActions(currentActions.current);
                    lastSplitterResizeAction.current = undefined;
                    if (timer) {
                        clearTimeout(timer);
                    }
                }
                addAction(action);
                setActions(currentActions.current);
            }
        };

        currentModel.addChangeListener(listener);
        return () => {
            currentModel.removeChangeListener(listener);
            clearTimeout(timer);
        }
    }, [props.model])

    const onRowDataUpdated = (params: any) => {
        // Get the index of the very last row
        const lastIndex = params.api.getDisplayedRowCount() - 1;

        if (lastIndex >= 0) {
            // Scroll the grid so the last row is at the bottom
            params.api.ensureIndexVisible(lastIndex, 'bottom');
        }
    };

    return (
        <div className={"ag-theme-alpine"} style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                rowData={actions}
                columnDefs={colDefs}
                headerHeight={30}
                rowHeight={30}
                onRowDataUpdated={onRowDataUpdated}
            />
        </div>
    );
};
