import { useEffect, useMemo, useRef } from 'react';
import * as Cesium from 'cesium';
import {
  Viewer,
  Entity,
  PointGraphics,
  LabelGraphics,
  PolylineGraphics,
} from 'resium';
import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';
import { useGroundTrack } from '../hooks/useGroundTrack.js';

const TRACK_MIN_ALPHA = 0.05;

// Avoid Cesium Ion: use Esri World Imagery (satellite photos) and a plain
// ellipsoid for terrain. Cesium 1.141 wants `baseLayer` (ImageryLayer), not
// the legacy `imageryProvider`.
Cesium.Ion.defaultAccessToken = '';
const baseLayer = new Cesium.ImageryLayer(
  new Cesium.UrlTemplateImageryProvider({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    credit: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maximumLevel: 19,
  }),
);
const terrainProvider = new Cesium.EllipsoidTerrainProvider();

const LABEL_OFFSET = new Cesium.Cartesian2(0, -16);

export default function Globe() {
  const { state, dispatch } = useApp();
  const { monitoringList, tleCache, positions, selectedId, focusRequest } = state;
  const viewerRef = useRef(null);
  const groundTrack = useGroundTrack();

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

  // Ground-track for the selected satellite. One polyline segment per
  // consecutive sample pair, alpha fading from near-zero at the oldest end
  // to 1.0 at the newest (closest to the satellite marker).
  const trackSegments = useMemo(() => {
    if (groundTrack.length < 2) return [];
    const n = groundTrack.length - 1; // segment count
    return groundTrack.slice(0, -1).map((s, i) => {
      const next = groundTrack[i + 1];
      const positionsArr = Cesium.Cartesian3.fromDegreesArray([
        s.lon, s.lat, next.lon, next.lat,
      ]);
      const alpha = TRACK_MIN_ALPHA + (1 - TRACK_MIN_ALPHA) * ((i + 1) / n);
      const color = Cesium.Color.YELLOW.withAlpha(alpha);
      return (
        <Entity key={`track-${selectedId}-${s.t}`}>
          <PolylineGraphics
            positions={positionsArr}
            width={2}
            material={color}
            arcType={Cesium.ArcType.GEODESIC}
            clampToGround
          />
        </Entity>
      );
    });
  }, [groundTrack, selectedId]);

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
      {trackSegments}
      {entities}
    </Viewer>
  );
}
