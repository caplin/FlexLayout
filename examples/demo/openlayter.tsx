import * as React from "react";
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import { useEffect } from "react";

function MapComponent() {
    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const map = React.useRef<any>(null);

    useEffect(() => {
        const osmLayer = new TileLayer({
            preload: Infinity,
            source: new OSM(),
        })

        map.current = new Map({
            target: selfRef.current!,
            layers: [osmLayer],
            view: new View({
                center: [0, 0],
                zoom: 0,
              }),
          });
      return () => map.current.setTarget(undefined)
    }, []);

    useEffect(() => {
        map.current.updateSize();
    });

    return (
      <div ref={selfRef} style={{height:'100%',width:'100%'}} id="map" className="map-container" />
    );
}

export default MapComponent;