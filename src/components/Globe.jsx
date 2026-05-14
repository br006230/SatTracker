import { useEffect, useMemo, useRef } from 'react';
import * as Cesium from 'cesium';
import {
  Viewer,
  Entity,
  PointGraphics,
  LabelGraphics,
} from 'resium';
import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';

// Avoid Cesium Ion: use OSM tiles for imagery and a plain ellipsoid for terrain.
// Cesium 1.141 wants `baseLayer` (ImageryLayer), not the legacy `imageryProvider`.
Cesium.Ion.defaultAccessToken = '';
const baseLayer = new Cesium.ImageryLayer(
  new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
    credit: '© OpenStreetMap contributors',
  }),
);
const terrainProvider = new Cesium.EllipsoidTerrainProvider();

const LABEL_OFFSET = new Cesium.Cartesian2(0, -16);

export default function Globe() {
  const { state, dispatch } = useApp();
  const { monitoringList, tleCache, positions, selectedId, focusRequest } = state;
  const viewerRef = useRef(null);

  // Initial camera: pulled back so the whole Earth is visible.
  useEffect(() => {
    const v = viewerRef.current?.cesiumElement;
    if (!v) return;
    v.scene.globe.enableLighting = true;
    v.camera.flyHome(0);
  }, []);

  // Honor Focus button: fly to the requested entity.
  useEffect(() => {
    if (!focusRequest?.id) return;
    const v = viewerRef.current?.cesiumElement;
    if (!v) return;
    const ent = v.entities.getById(focusRequest.id);
    if (ent) v.flyTo(ent, { duration: 1.2 });
  }, [focusRequest]);

  const entities = useMemo(
    () =>
      monitoringList
        .map((id) => {
          const pos = positions[id];
          if (!pos) return null;
          const name = tleCache[id]?.name ?? id;
          const isSelected = id === selectedId;
          const cart = Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt * 1000);
          return (
            <Entity
              key={id}
              id={id}
              position={cart}
              onClick={() => dispatch({ type: ACT.SELECT, payload: id })}
            >
              <PointGraphics
                pixelSize={isSelected ? 14 : 10}
                color={isSelected ? Cesium.Color.YELLOW : Cesium.Color.CYAN}
                outlineColor={Cesium.Color.BLACK}
                outlineWidth={1}
              />
              <LabelGraphics
                text={name}
                font="12px sans-serif"
                fillColor={Cesium.Color.WHITE}
                outlineColor={Cesium.Color.BLACK}
                outlineWidth={2}
                style={Cesium.LabelStyle.FILL_AND_OUTLINE}
                pixelOffset={LABEL_OFFSET}
                verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
                showBackground
                backgroundColor={new Cesium.Color(0, 0, 0, 0.4)}
              />
            </Entity>
          );
        })
        .filter(Boolean),
    [monitoringList, positions, tleCache, selectedId, dispatch],
  );

  return (
    <Viewer
      style={{ position: 'absolute', inset: 0 }}
      ref={viewerRef}
      baseLayer={baseLayer}
      terrainProvider={terrainProvider}
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      infoBox={false}
      selectionIndicator={false}
    >
      {entities}
    </Viewer>
  );
}
