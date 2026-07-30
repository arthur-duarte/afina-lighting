'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Group, Transformer } from 'react-konva';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';
import type { CanvasElement, FixtureType } from '@/lib/types';
import { CanvasMinimap } from './CanvasMinimap';

// Make stage available globally for PNG/PDF export
declare global {
  interface Window { __afinaStageRef?: unknown; }
}

// ── GRID COMPONENT ─────────────────────────────────────────
function CanvasGrid({
  stageX, stageY, stageScale, canvasW, canvasH, gridPx,
}: {
  stageX: number; stageY: number; stageScale: number;
  canvasW: number; canvasH: number; gridPx: number;
}) {
  const lines: React.ReactNode[] = [];

  const worldLeft   = -stageX / stageScale;
  const worldTop    = -stageY / stageScale;
  const worldRight  = worldLeft + canvasW / stageScale;
  const worldBottom = worldTop  + canvasH / stageScale;

  const startX = Math.floor(worldLeft  / gridPx) * gridPx;
  const startY = Math.floor(worldTop   / gridPx) * gridPx;

  const majorEvery = 5;

  for (let wx = startX; wx <= worldRight; wx += gridPx) {
    const isMajor = Math.abs(Math.round(wx / gridPx) % majorEvery) === 0;
    lines.push(
      <Line
        key={`vx${wx}`}
        points={[wx, worldTop, wx, worldBottom]}
        stroke={isMajor ? 'rgba(239,71,50,0.30)' : 'rgba(148,163,184,0.22)'}
        strokeWidth={isMajor ? 1.5 : 0.8}
        listening={false}
      />
    );
  }
  for (let wy = startY; wy <= worldBottom; wy += gridPx) {
    const isMajor = Math.abs(Math.round(wy / gridPx) % majorEvery) === 0;
    lines.push(
      <Line
        key={`hy${wy}`}
        points={[worldLeft, wy, worldRight, wy]}
        stroke={isMajor ? 'rgba(239,71,50,0.30)' : 'rgba(148,163,184,0.22)'}
        strokeWidth={isMajor ? 1.5 : 0.8}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}

// ── FIXTURE & ARCHITECTURE SYMBOL ─────────────────────────
function FixtureSymbol({ el, isSelected, onClick, onDragEnd }: {
  el: CanvasElement; isSelected: boolean; onClick: (e: unknown) => void; onDragEnd?: (e: { target: { x: () => number; y: () => number } }) => void;
}) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const store = useEditorStore();

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    if (!groupRef.current) return;
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    node.scaleX(1);
    node.scaleY(1);

    store.updateElement(el.id, {
      scaleX: Math.max(0.1, Math.min(10, scaleX)),
      scaleY: Math.max(0.1, Math.min(10, scaleY)),
      rotation,
    });
  };

  const def = getFixtureDef(el.type);
  const color = el.color || def?.colorHex || '#ef4732';
  const hasConflict = el.dmx?.hasConflict;

  const strokeColor = hasConflict ? '#dc2626' : (isSelected ? '#2563eb' : '#0f172a');
  const strokeWidth = isSelected ? 2.5 : 1.5;

  const renderSymbol = () => {
    switch (el.type) {
      case 'lightingbar':
      case 'truss_q25':
      case 'truss_q30':
      case 'truss_q50': {
        const w = (el.customProps?.width as number) ?? 200;
        const h = (el.customProps?.height as number) ?? 8;
        return (
          <Group>
            <Rect
              x={0} y={-h / 2} width={w} height={h}
              fill="#334155" stroke={isSelected ? '#2563eb' : '#0f172a'}
              strokeWidth={strokeWidth} cornerRadius={2}
            />
            {el.type.startsWith('truss') && (
              <>
                <Line points={[0, -h / 2, w, h / 2]} stroke="#94a3b8" strokeWidth={1} />
                <Line points={[0, h / 2, w, -h / 2]} stroke="#94a3b8" strokeWidth={1} />
              </>
            )}
            {el.label && (
              <Text
                text={el.label} x={4} y={-14} fontSize={10} fontStyle="bold"
                fill="#0f172a" fontFamily="JetBrains Mono, monospace"
              />
            )}
          </Group>
        );
      }

      case 'wall': {
        const w = (el.customProps?.width as number) ?? 100;
        const h = (el.customProps?.height as number) ?? 100;
        const fill = (el.customProps?.fill as string) || '#ffffff';
        const opacity = (el.customProps?.opacity as number) ?? 1;

        return (
          <Group>
            <Rect
              x={0} y={0} width={w} height={h}
              fill={fill}
              stroke={isSelected ? '#2563eb' : '#0f172a'}
              strokeWidth={isSelected ? 3 : 2}
              opacity={opacity}
              cornerRadius={2}
            />
            {el.label && (
              <Text
                text={el.label.toUpperCase()}
                x={0} y={h / 2 - 7} width={w}
                fontSize={11}
                fontStyle="bold"
                fill="#0f172a"
                align="center"
                fontFamily="Inter, sans-serif"
              />
            )}
          </Group>
        );
      }

      case 'custom_stage':
      case 'stage_polygon': {
        const w = (el.customProps?.width as number) ?? 500;
        const h = (el.customProps?.height as number) ?? 350;
        const varanda = (el.customProps?.varanda as number) ?? 80;

        return (
          <Group>
            {/* Stage Floor Background */}
            <Rect
              x={-w / 2} y={-h / 2} width={w} height={h}
              fill="#ffffff"
              stroke={isSelected ? '#2563eb' : '#0f172a'}
              strokeWidth={isSelected ? 3.5 : 2.5}
              cornerRadius={2}
            />
            {/* Stage Floor Hatch Grid Lines */}
            <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke="rgba(148,163,184,0.25)" strokeWidth={1} />
            <Line points={[-w / 2, h / 2, w / 2, -h / 2]} stroke="rgba(148,163,184,0.25)" strokeWidth={1} />

            {/* Varanda / Proscênio */}
            {varanda > 0 && (
              <Rect
                x={-w / 2} y={h / 2} width={w} height={varanda}
                fill="#f1f5f9"
                stroke={isSelected ? '#2563eb' : '#475569'}
                strokeWidth={1.5}
                dash={[6, 4]}
              />
            )}
            {/* Boca de cena line */}
            <Line points={[-w / 2, h / 2, w / 2, h / 2]} stroke="#0284c7" strokeWidth={3.5} />

            {/* Labels */}
            <Text
              text={el.label ? el.label.toUpperCase() : 'PALCO PRINCIPAL'}
              x={-w / 2} y={-h / 4} width={w} align="center"
              fontSize={16} fill="#0f172a" fontStyle="bold" fontFamily="Inter, sans-serif"
            />
            <Text
              text="BOCA DE CENA" x={-w / 2} y={h / 2 - 14} width={w} align="center"
              fontSize={10} fill="#0284c7" fontStyle="bold" fontFamily="JetBrains Mono, monospace"
            />
            {varanda > 0 && (
              <Text
                text="VARANDA / PROSCÊNIO" x={-w / 2} y={h / 2 + varanda / 2 - 6} width={w} align="center"
                fontSize={9} fill="#475569" fontStyle="bold" fontFamily="JetBrains Mono, monospace"
              />
            )}
          </Group>
        );
      }

      case 'ellipsoidal': {
        const angle = el.angle ?? 26;
        const size = 18;
        return (
          <Group>
            <Line
              points={[-size * 0.6, -size * 0.4, size * 0.6, -size * 0.4, 0, size * 0.7]}
              closed fill={color} stroke={strokeColor} strokeWidth={strokeWidth}
            />
            <Line points={[0, size * 0.7, -size * 0.5, size * 1.4]} stroke="#0f172a" strokeWidth={1} />
            <Line points={[0, size * 0.7, size * 0.5, size * 1.4]} stroke="#0f172a" strokeWidth={1} />
            <Text
              text={`${angle}°`} x={-10} y={-size * 0.35} fontSize={8} fontStyle="bold"
              fill="#0f172a" fontFamily="JetBrains Mono, monospace"
            />
          </Group>
        );
      }

      case 'fresnel': {
        const r = 14;
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Circle radius={r * 0.7} fill="none" stroke="#0f172a" strokeWidth={1} opacity={0.6} />
            <Circle radius={r * 0.4} fill="none" stroke="#0f172a" strokeWidth={1} opacity={0.6} />
            <Circle radius={r * 0.15} fill="#0f172a" />
          </Group>
        );
      }

      case 'pc': {
        const r = 14;
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line points={[-r, r * 0.3, r, r * 0.3]} stroke="#0f172a" strokeWidth={2} />
            <Circle radius={r * 0.2} fill="#0f172a" />
          </Group>
        );
      }

      case 'par64': {
        const w = 20, h = 16;
        return (
          <Group>
            <Rect
              x={-w / 2} y={-h / 2} width={w} height={h} cornerRadius={3}
              fill={color} stroke={strokeColor} strokeWidth={strokeWidth}
            />
            <Circle radius={5} fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
          </Group>
        );
      }

      case 'parled': {
        const r = 14;
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
            {[-5, 0, 5].map((dx) =>
              [-5, 0, 5].map((dy) => (
                <Circle key={`${dx}${dy}`} x={dx} y={dy} radius={2} fill="#0f172a" />
              ))
            )}
          </Group>
        );
      }

      case 'barled': {
        const w = 40, h = 14, cells = 6;
        const cellW = w / cells;
        return (
          <Group>
            <Rect
              x={-w / 2} y={-h / 2} width={w} height={h}
              fill={color} stroke={strokeColor} strokeWidth={strokeWidth} cornerRadius={2}
            />
            {Array.from({ length: cells }).map((_, i) => (
              <Rect
                key={i} x={-w / 2 + i * cellW + 2} y={-h / 2 + 3}
                width={cellW - 3} height={h - 6} fill="#ffffff" stroke="#0f172a" strokeWidth={0.8}
              />
            ))}
          </Group>
        );
      }

      case 'moving_spot':
      case 'moving_beam':
      case 'moving_wash': {
        const r = 16;
        return (
          <Group>
            <Rect
              x={-r * 0.85} y={-r * 0.85} width={r * 1.7} height={r * 1.7}
              fill="#ffffff" stroke={strokeColor} strokeWidth={1.5} cornerRadius={4}
            />
            <Circle radius={r * 0.65} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line points={[-r * 0.4, 0, r * 0.4, 0]} stroke="#0f172a" strokeWidth={1.5} />
            <Line points={[0, -r * 0.4, 0, r * 0.4]} stroke="#0f172a" strokeWidth={1.5} />
          </Group>
        );
      }

      case 'tripod': {
        const s = 16;
        return (
          <Group>
            <Line points={[0, 0, 0, -s]} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line points={[0, 0, -s * 0.86, s * 0.5]} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line points={[0, 0, s * 0.86, s * 0.5]} stroke={strokeColor} strokeWidth={strokeWidth} />
            <Circle radius={4} fill="#0f172a" />
          </Group>
        );
      }

      case 'tower': {
        const w = 24, h = 24;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#ffffff" stroke={strokeColor} strokeWidth={strokeWidth} />
            <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke={strokeColor} strokeWidth={1} />
            <Line points={[-w / 2, h / 2, w / 2, -h / 2]} stroke={strokeColor} strokeWidth={1} />
            <Circle radius={4} fill="#0284c7" />
          </Group>
        );
      }

      default: {
        const s = 14;
        return (
          <Group>
            <Rect
              x={-s / 2} y={-s / 2} width={s} height={s}
              fill={color} stroke={strokeColor} strokeWidth={strokeWidth} cornerRadius={2}
            />
          </Group>
        );
      }
    }
  };

  const showTextLabel = el.label && (store.showFixtureLabels || isSelected) && el.category !== 'architecture' && el.type !== 'wall' && el.type !== 'custom_stage' && el.type !== 'stage_polygon';

  return (
    <>
      <Group
        ref={groupRef}
        x={el.x}
        y={el.y}
        rotation={el.rotation}
        scaleX={el.scaleX}
        scaleY={el.scaleY}
        onClick={onClick}
        onTap={onClick}
        draggable={!el.locked}
        onDragEnd={onDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {renderSymbol()}

        {/* Fixture Name Label (Togglable) */}
        {showTextLabel && (
          <Text
            text={el.customName || el.label}
            x={-35} y={20}
            fontSize={10}
            fontStyle="bold"
            fill={isSelected ? '#2563eb' : '#0f172a'}
            fontFamily="JetBrains Mono, monospace"
            width={70}
            align="center"
          />
        )}

        {/* DMX Address Badge */}
        {el.dmx && el.dmx.address > 0 && (
          <Group x={0} y={-26}>
            <Rect
              x={-18} y={-7} width={36} height={14}
              fill="#dbeafe" stroke={el.dmx.hasConflict ? '#dc2626' : '#2563eb'}
              strokeWidth={1} cornerRadius={3}
            />
            <Text
              text={`${el.dmx.universe}/${el.dmx.address}`}
              x={-18} y={-5}
              fontSize={8}
              fontStyle="bold"
              fill={el.dmx.hasConflict ? '#dc2626' : '#1d4ed8'}
              fontFamily="JetBrains Mono, monospace"
              width={36}
              align="center"
            />
          </Group>
        )}
      </Group>

      {/* Transformer handle on selection */}
      {isSelected && !el.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorSize={8}
          borderStroke="#2563eb"
          anchorStroke="#2563eb"
          anchorFill="#ffffff"
          anchorCornerRadius={2}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 8 || newBox.height < 8) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ── FOCUS CONE ────────────────────────────────────────────
function FocusCone({ el }: { el: CanvasElement }) {
  if (!el.angle) return null;
  const halfAngle = (el.angle / 2) * (Math.PI / 180);
  const length = 120;
  const coneColor = 'rgba(239, 68, 68, 0.12)';
  const coneStroke = 'rgba(239, 68, 68, 0.35)';

  const x1 = Math.sin(-halfAngle) * length;
  const y1 = Math.cos(-halfAngle) * length;
  const x2 = Math.sin(halfAngle) * length;
  const y2 = Math.cos(halfAngle) * length;

  return (
    <Group x={el.x} y={el.y} rotation={el.rotation} listening={false}>
      <Line
        points={[0, 0, x1, y1, x2, y2]}
        closed
        fill={coneColor}
        stroke={coneStroke}
        strokeWidth={1}
      />
    </Group>
  );
}

// ── MAIN LIGHTING CANVAS ─────────────────────────────────
export default function LightingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  const isPanningRef = useRef(false);
  const isSpaceRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [showLegendOverlay, setShowLegendOverlay] = useState(true);

  const store = useEditorStore();
  const {
    stageX, stageY, stageScale,
    setStagePosition, setStageScale,
    gridVisible, gridSize, gridPixelsPerMeter,
    activeTool, pendingFixtureType,
    elements, selectedIds,
    layers,
    showFocusCoverage, showFixtureLabels, toggleFixtureLabels,
    selectElement, clearSelection, addElement,
    snapToGrid,
  } = store;

  // Handle Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
    });
    ro.observe(el);
    setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Global ref export
  useEffect(() => {
    if (stageRef.current) {
      window.__afinaStageRef = stageRef.current;
    }
  });

  // Key tracking
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        isSpaceRef.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const getCursor = () => {
    if (activeTool === 'pan' || isPanningRef.current) return 'grabbing';
    if (activeTool === 'insert_fixture') return 'crosshair';
    return 'default';
  };

  const gridPx = (gridSize / 1000) * gridPixelsPerMeter;

  // Zoom on Wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.9;
    const newScale = Math.max(0.1, Math.min(10, stageScale * zoomFactor));

    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition() || { x: dimensions.width / 2, y: dimensions.height / 2 };

    const mousePointX = (pointer.x - stageX) / stageScale;
    const mousePointY = (pointer.y - stageY) / stageScale;

    const newX = pointer.x - mousePointX * newScale;
    const newY = pointer.y - mousePointY * newScale;

    setStageScale(newScale);
    setStagePosition(newX, newY);
  }, [stageScale, stageX, stageY, dimensions, setStageScale, setStagePosition]);

  // Stage Mouse Down
  const handleStageMouseDown = useCallback((e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (e.evt.button === 1 || isSpaceRef.current || activeTool === 'pan') {
      isPanningRef.current = true;
      lastPointerRef.current = pointer;
      return;
    }

    const clickedOnEmpty = e.target === stage || e.target.className === 'Stage';
    if (activeTool === 'select' && clickedOnEmpty && !e.evt.shiftKey) {
      const worldX = (pointer.x - stageX) / stageScale;
      const worldY = (pointer.y - stageY) / stageScale;
      setSelectionBox({ x1: worldX, y1: worldY, x2: worldX, y2: worldY });
    }
  }, [activeTool, stageX, stageY, stageScale]);

  // Mouse Move
  const handleStageMouseMove = useCallback((e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (isPanningRef.current) {
      const dx = pointer.x - lastPointerRef.current.x;
      const dy = pointer.y - lastPointerRef.current.y;
      setStagePosition(stageX + dx, stageY + dy);
      lastPointerRef.current = pointer;
      return;
    }

    if (selectionBox) {
      const worldX = (pointer.x - stageX) / stageScale;
      const worldY = (pointer.y - stageY) / stageScale;
      setSelectionBox((prev) => prev ? { ...prev, x2: worldX, y2: worldY } : null);
    }
  }, [stageX, stageY, stageScale, selectionBox, setStagePosition]);

  // Mouse Up
  const handleStageMouseUp = useCallback(() => {
    isPanningRef.current = false;

    if (selectionBox) {
      const x1 = Math.min(selectionBox.x1, selectionBox.x2);
      const x2 = Math.max(selectionBox.x1, selectionBox.x2);
      const y1 = Math.min(selectionBox.y1, selectionBox.y2);
      const y2 = Math.max(selectionBox.y1, selectionBox.y2);

      if (Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5) {
        elements.forEach((el) => {
          if (el.x >= x1 && el.x <= x2 && el.y >= y1 && el.y <= y2 && !el.locked) {
            selectElement(el.id, true);
          }
        });
      }
      setSelectionBox(null);
    }
  }, [selectionBox, elements, selectElement]);

  // Click handler (Insert or deselect)
  const handleStageClick = useCallback((e: any) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (activeTool === 'insert_fixture' && pendingFixtureType) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const x = snapToGrid((pointer.x - stageX) / stageScale);
      const y = snapToGrid((pointer.y - stageY) / stageScale);

      const def = getFixtureDef(pendingFixtureType as FixtureType);
      if (!def) return;

      const id = addElement({
        type: pendingFixtureType as FixtureType,
        category: def.category,
        layerId: def.defaultLayerId,
        x, y,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        label: def.label,
        color: def.colorHex,
        gelatin: 'NC',
        wattage: def.defaultWattage,
        phase: 'unassigned',
        angle: def.defaultAngle,
        locked: false,
        visible: true,
        dmx: def.defaultDmxFootprint > 0 ? {
          universe: 1,
          address: 1,
          footprint: def.defaultDmxFootprint,
          hasConflict: false,
        } : undefined,
        customProps: pendingFixtureType === 'lightingbar' ? { width: 300, height: 8 } : {},
      });
      selectElement(id);
      return;
    }

    const clickedOnEmpty = e.target === stage || e.target.className === 'Stage';
    if (activeTool === 'select' && clickedOnEmpty && !e.evt.shiftKey) clearSelection();
  }, [activeTool, pendingFixtureType, stageX, stageY, stageScale, addElement, selectElement, clearSelection, snapToGrid]);

  // Magnetic Snap Helper
  const snapToRiggingBar = useCallback((x: number, y: number, isRigging = false): { x: number; y: number } => {
    if (isRigging) return { x, y };
    const riggingBars = elements.filter((el) => el.category === 'rigging' || el.type === 'lightingbar' || el.type.startsWith('truss'));
    for (const bar of riggingBars) {
      const barW = (bar.customProps?.width as number) ?? 200;
      if (Math.abs(y - bar.y) < 30 && x >= bar.x - 20 && x <= bar.x + barW + 20) {
        return { x, y: bar.y };
      }
    }
    return { x, y };
  }, [elements]);

  // Drag End
  const handleFixtureDragEnd = useCallback((id: string, e: any) => {
    const rawX = snapToGrid(e.target.x());
    const rawY = snapToGrid(e.target.y());
    const el = elements.find((item) => item.id === id);
    const isRigging = Boolean(
      el?.category === 'rigging' ||
      el?.type === 'lightingbar' ||
      el?.type?.startsWith('truss')
    );
    const { x, y } = snapToRiggingBar(rawX, rawY, isRigging);
    store.updateElement(id, { x, y });
  }, [store, snapToGrid, snapToRiggingBar, elements]);

  // Drag and Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('fixtureType') as FixtureType;
    if (!type) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const rawX = snapToGrid((e.clientX - rect.left - stageX) / stageScale);
    const rawY = snapToGrid((e.clientY - rect.top - stageY) / stageScale);

    const def = getFixtureDef(type);
    if (!def) return;

    const isRigging = def.category === 'rigging' || type === 'lightingbar' || type.startsWith('truss');
    const { x, y } = snapToRiggingBar(rawX, rawY, isRigging);

    const id = addElement({
      type,
      category: def.category,
      layerId: def.defaultLayerId,
      x, y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      label: def.label,
      color: def.colorHex,
      gelatin: 'NC',
      wattage: def.defaultWattage,
      phase: 'unassigned',
      angle: def.defaultAngle,
      locked: false,
      visible: true,
      dmx: def.defaultDmxFootprint > 0 ? {
        universe: 1,
        address: 1,
        footprint: def.defaultDmxFootprint,
        hasConflict: false,
      } : undefined,
      customProps: type === 'lightingbar' ? { width: 300, height: 8 } : {},
    });
    selectElement(id);
  }, [addElement, selectElement, stageX, stageY, stageScale, snapToGrid, snapToRiggingBar]);

  // Active layers lookup
  const activeLayerMap = (layers || []).reduce<Record<string, { visible: boolean; locked: boolean }>>((acc, l) => {
    acc[l.id] = { visible: l.visible, locked: l.locked };
    return acc;
  }, {});

  const isLayerVisible = (layerId?: string) => {
    if (!layerId || !activeLayerMap[layerId]) return true;
    return activeLayerMap[layerId].visible;
  };

  const visibleElements = elements.filter((el) => el.visible !== false && isLayerVisible(el.layerId));
  const focusEls = showFocusCoverage ? visibleElements.filter((el) => (el.angle ?? 0) > 0) : [];

  // Fixture count summary for legend card
  const fixtureSummary: { label: string; color: string; count: number }[] = [];
  const countMap = new Map<string, { label: string; color: string; count: number }>();
  elements
    .filter((el) => el.category !== 'architecture' && el.category !== 'annotation')
    .forEach((el) => {
      const def = getFixtureDef(el.type);
      const label = def?.description || el.type;
      const color = el.color || def?.colorHex || '#ef4732';
      const existing = countMap.get(el.type);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(el.type, { label, color, count: 1 });
      }
    });
  countMap.forEach((val) => fixtureSummary.push(val));

  return (
    <div
      ref={containerRef}
      className="editor-canvas canvas-wrapper"
      style={{ cursor: getCursor(), position: 'relative' }}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Tool hint */}
      {activeTool === 'insert_fixture' && pendingFixtureType && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-afina-600 text-white text-xs font-semibold rounded-full shadow-lg border border-afina-400 pointer-events-none animate-fade-in">
          Clique no canvas para posicionar · ESC para cancelar
        </div>
      )}

      {/* Screen Floating Legend & Label Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20 }} className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-lg border border-slate-300">
          <button
            onClick={toggleFixtureLabels}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              showFixtureLabels ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Exibir/Ocultar Rótulos com Nomes dos Equipamentos"
          >
            🏷️ Nomes {showFixtureLabels ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowLegendOverlay(!showLegendOverlay)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              showLegendOverlay ? 'bg-afina-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Exibir/Ocultar Legenda no Canvas"
          >
            📋 Legenda
          </button>
        </div>

        {/* Interactive Floating Equipment Legend Card */}
        {showLegendOverlay && fixtureSummary.length > 0 && (
          <div className="w-64 p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legenda de Equipamentos</span>
              <button
                onClick={() => setShowLegendOverlay(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {fixtureSummary.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-slate-400" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-800 font-medium truncate">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-afina-600 text-xs ml-2">×{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prominent Zoom Controls */}
      <div
        style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 20 }}
        className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-lg border border-slate-300"
      >
        <button
          onClick={() => store.setStageScale(stageScale / 1.2)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
          title="Diminuir Zoom"
        >
          −
        </button>
        <div className="font-mono text-xs font-bold text-slate-800 px-2 min-w-[50px] text-center">
          {Math.round(stageScale * 100)}%
        </div>
        <button
          onClick={() => store.setStageScale(stageScale * 1.2)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
          title="Aumentar Zoom"
        >
          +
        </button>
        <button
          onClick={() => store.resetView()}
          className="px-2 h-7 text-[10px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Resetar Zoom e Centralizar"
        >
          Reset
        </button>
      </div>

      {/* Minimap Radar Navigator */}
      <CanvasMinimap />

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stageX}
        y={stageY}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
      >
        {/* ── GRID LAYER ─── */}
        <Layer listening={false}>
          {gridVisible && (
            <CanvasGrid
              stageX={stageX}
              stageY={stageY}
              stageScale={stageScale}
              canvasW={dimensions.width}
              canvasH={dimensions.height}
              gridPx={gridPx}
            />
          )}
        </Layer>

        {/* ── ELEMENTS LAYER ─── */}
        <Layer>
          {/* Focus cones behind fixtures */}
          {focusEls.map((el) => (
            <FocusCone key={`cone-${el.id}`} el={el} />
          ))}

          {/* Render all visible elements */}
          {visibleElements.map((el) => (
            <FixtureSymbol
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              onClick={(e: any) => {
                selectElement(el.id, e?.evt?.shiftKey ?? false);
              }}
              onDragEnd={(e) => handleFixtureDragEnd(el.id, e)}
            />
          ))}
        </Layer>

        {/* ── SELECTION MARQUEE ─── */}
        {selectionBox && (
          <Layer listening={false}>
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(37, 99, 235, 0.08)"
              stroke="#2563eb"
              strokeWidth={1.5}
              dash={[4, 4]}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
}
