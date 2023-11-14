import * as React from "react";

const style = { width: "1em", height: "1em", display: "flex", alignItems: "center" };

export const CloseIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" >
            <path fill="none" d="M0 0h24v24H0z" />
            <path stroke="var(--color-icon)" fill="var(--color-icon)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
}

export const MaximizeIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none" /><path stroke="var(--color-icon)" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
    );
}

export const OverflowIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none" /><path stroke="var(--color-icon)" d="M7 10l5 5 5-5z" /></svg>
    );
}

export const EdgeIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={{display:"block",  width:10, height:10}} preserveAspectRatio="none" viewBox="0 0 100 100"><path  fill="var(--color-edge-icon)" stroke="var(--color-edge-icon)" 
            d="M10 30 L90 30 l-40 40 Z" /></svg>
    );
}

export const PopoutIcon = () => {
    return (
        // <svg xmlns="http://www.w3.org/2000/svg"  style={style}  viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none"/><path stroke="var(--color-icon)" d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/></svg>
        
        // <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="none" viewBox="0 0 24 24" stroke="var(--color-icon)" stroke-width="2">
        //     <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        // </svg>

        <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 20 20" fill="var(--color-icon)">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>

    );
}

export const RestoreIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none" /><path stroke="var(--color-icon)" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
    );
}
