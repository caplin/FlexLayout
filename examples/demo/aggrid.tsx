import * as React from 'react';
import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Row Data Interface
interface IRow {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

// Create new GridExample component
export const AGGridExample = () => {
    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const gridRef = React.useRef<AgGridReact | null>(null);
    const width = React.useRef<number>(0);

    // Row Data: The data to be displayed.
    const [rowData] = useState<IRow[]>([
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
        { make: 'Fiat', model: '500', price: 15774, electric: false },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
    ]);

    // Column Definitions: Defines & controls grid columns.
    const [colDefs] = useState<ColDef<IRow>[]>([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
        { field: 'electric' },
    ]);

    const defaultColDef: ColDef = {
        flex: 1,
    };

    React.useEffect(()=> {
        // fix resizing in popouts, since resize observer will be lost
        if (gridRef.current!.api) {
            const newWidth = selfRef.current!.getBoundingClientRect().width;
            if (newWidth !== width.current) {
                width.current = newWidth;
                gridRef.current!.api.sizeColumnsToFit(newWidth);
            }
        }
    });

    // Container: Defines the grid's theme & dimensions.
    return (
        <div ref={selfRef} className={"ag-theme-alpine"} style={{ width: '100%', height: '100%' }}>
            <AgGridReact ref={gridRef}  rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDef} />
        </div>
    );
};

