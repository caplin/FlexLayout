import * as React from "react";
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import { useEffect } from "react";

function MapComponent() {
    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const map = React.useRef<any>(null);
    const mapDocument = React.useRef<Document | null>(null);

    // creates the map on the given target, reusing the given view (so the zoom/pan state
    // survives a rebuild)
    const createMap = (target: HTMLDivElement, view: View) => {
        map.current = new Map({
            target,
            layers: [
                new TileLayer({
                    preload: Infinity,
                    source: new OSM(),
                })
            ],
            view,
        });
    };

    useEffect(() => {
        createMap(selfRef.current!, new View({ center: [0, 0], zoom: 0 }));
        mapDocument.current = selfRef.current!.ownerDocument;
        return () => {
            map.current.setTarget(undefined);
        }
    }, []);

    useEffect(() => {
        const target = selfRef.current;
        if (!target) return;

        // when the tab moves between windows (popout/popin) the map's canvas is adopted into
        // another document, which invalidates its rendering context (draws silently no-op).
        // Rebuild the map with fresh renderers, keeping the same View so zoom/pan survive
        if (mapDocument.current !== target.ownerDocument && map.current) {
            mapDocument.current = target.ownerDocument;
            const view = map.current.getView();
            map.current.setTarget(undefined);
            createMap(target, view);
        }

        const win = target.ownerDocument.defaultView || window;
        const Observer = win.ResizeObserver || ResizeObserver;

        const resizeObserver = new Observer(() => {
            win.requestAnimationFrame(() => {
                if (map.current) {
                    map.current.updateSize();
                }
            });
        });

        resizeObserver.observe(target);

        return () => {
            resizeObserver.disconnect();
        };
    });

    return (
        <div ref={selfRef} style={{ height: '100%', width: '100%' }} id="map" className="map-container" />
    );
}

export default MapComponent;
