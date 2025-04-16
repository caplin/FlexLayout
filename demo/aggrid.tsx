import * as React from 'react'; 
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
]);

// Row Data Interface
interface IRow {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

export const AGGridExample = () => {

    // Row Data: The data to be displayed.
    const [rowData] = React.useState<IRow[]>([
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
        { make: 'Fiat', model: '500', price: 15774, electric: false },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
    ]);

    // Column Definitions: Defines & controls grid columns.
    const [colDefs] = React.useState<ColDef<IRow>[]>([
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
        { field: 'electric' },
    ]);

    return (
        <div className={"ag-theme-alpine"} style={{ height: '100%' }}>
            <AgGridReact rowData={rowData} columnDefs={colDefs} />
        </div>
    );
};

