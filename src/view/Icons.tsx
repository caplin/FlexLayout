const style = { width: "1em", height: "1em", display: "flex", alignItems: "center" };

export const CloseIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path stroke="var(--color-icon)" fill="var(--color-icon)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
};
CloseIcon.displayName = "CloseIcon"; // name in react dev tools

export const PinIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)">
            <path fill="none" d="M0 0h24v24H0z" />
            {/* <path d="M16 9V4h1a1 1 0 000-2H7a1 1 0 000 2h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" /> */}
            <path transform="rotate(45 12 12)" d="M16 9V4h1a1 1 0 000-2H7a1 1 0 000 2h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
        </svg>
    );
};
PinIcon.displayName = "PinIcon"; // name in react dev tools

export const MaximizeIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)">
            <path d="M0 0h24v24H0z" fill="none" />
            <path stroke="var(--color-icon)" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
    );
};
MaximizeIcon.displayName = "MaximizeIcon"; // name in react dev tools

export const OverflowIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)">
            <path d="M0 0h24v24H0z" fill="none" />
            <path stroke="var(--color-icon)" d="M7 10l5 5 5-5z" />
        </svg>
    );
};
OverflowIcon.displayName = "OverflowIcon"; // name in react dev tools

export const EdgeIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: 10, height: 10 }} preserveAspectRatio="none" viewBox="0 0 100 100">
            <path fill="var(--color-edge-icon)" stroke="var(--color-edge-icon)" d="M10 30 L90 30 l-40 40 Z" />
        </svg>
    );
};
EdgeIcon.displayName = "EdgeIcon"; // name in react dev tools

export const PopoutIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 20 20" fill="var(--color-icon)">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
    );
};
PopoutIcon.displayName = "PopoutIcon"; // name in react dev tools

export const PopoutFloatIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" style={style} fill="var(--color-icon)">
            <path d="M360-280q-33 0-56.5-23.5T280-360v-400q0-33 23.5-56.5T360-840h400q33 0 56.5 23.5T840-760v400q0 33-23.5 56.5T760-280H360Zm0-80h400v-400H360v400ZM200-200v80q-33 0-56.5-23.5T120-200h80Zm-80-80v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm160 480v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Z" />
        </svg>
    );
};
PopoutFloatIcon.displayName = "PopoutFloatIcon"; // name in react dev tools

export const RestoreIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)">
            <path d="M0 0h24v24H0z" fill="none" />
            <path stroke="var(--color-icon)" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
        </svg>
    );
};
RestoreIcon.displayName = "RestoreIcon"; // name in react dev tools

export const AsterickIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} height="24px" viewBox="0 -960 960 960" width="24px">
            <path
                fill="var(--color-icon)"
                stroke="var(--color-icon)"
                d="M440-120v-264L254-197l-57-57 187-186H120v-80h264L197-706l57-57 186 187v-264h80v264l186-187 57 57-187 186h264v80H576l187 186-57 57-186-187v264h-80Z"
            />
        </svg>
    );
};
AsterickIcon.displayName = "AsterickIcon"; // name in react dev tools

export const AddIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} height="24px" viewBox="0 0 24 24" fill="var(--color-icon)">
            <path d="M0 0h24v24H0z" fill="none" />
            <path stroke="var(--color-icon)" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
    );
};
AddIcon.displayName = "AddIcon"; // name in react dev tools

export const MenuIcon = () => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={style} height="24px" width="24px" viewBox="0 -960 960 960" fill="var(--color-icon)">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
    );
};
MenuIcon.displayName = "MenuIcon"; // name in react dev tools

export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" {...props} style={style} viewBox="0 0 24 24" fill="var(--color-icon)">
            <g>
                <path d="M0,0h24v24H0V0z" fill="none" />
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </g>
        </svg>
    );
};
SettingsIcon.displayName = "SettingsIcon"; // name in react dev tools
