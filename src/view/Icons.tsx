import * as React from "react";

const style = {width:"1em", height:"1em", display: "flex", alignItems:"center"};

export const CloseIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" >
            <path fill="none" d="M0 0h24v24H0z"/>
            <path  stroke="gray" fill="gray" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
}

export const MaximizeIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style}  viewBox="0 0 24 24" fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path stroke="gray" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
    );
}

export const OverflowIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style}  viewBox="0 0 24 24" fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path stroke="gray" d="M7 10l5 5 5-5z"/></svg>
    );
}

export const PopoutIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"  style={style}  viewBox="0 0 24 24" fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path stroke="gray" d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/></svg>
    );
}

export const RestoreIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style}  viewBox="0 0 24 24" fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path stroke="gray" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
    );
}
