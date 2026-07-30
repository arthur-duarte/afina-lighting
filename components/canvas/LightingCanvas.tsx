'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';
import type { CanvasElement, FixtureType } from '@/lib/types';
import { CanvasMinimap } from './CanvasMinimap';
import { v4 as uuidv4 } from 'uuid';

// Dynamic import for SSR compatibility
const Stage = dynamic(() => import('react-konva').then((m) => m.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then((m) => m.Layer), { ssr: false });
const Line = dynamic(() => import('react-konva').then((m) => m.Line), { ssr: false });
const Rect = dynamic(() => import('react-konva').then((m) => m.Rect), { ssr: false });
const Circle = dynamic(() => import('react-konva').then((m) => m.Circle), { ssr: false });
const Text = dynamic(() => import('react-konva').then((m) => m.Text), { ssr: false });
const Group = dynamic(() => import('react-konva').then((m) => m.Group), { ssr: false });
const Transformer = dynamic(() => import('react-konva').then((m) => m.Transformer), { ssr: false });

// Make stage available globally for PNG/PDF export
declare global {
  interface Window { __afinaStageRef?: unknown; }
}


// ── GRID COMPONENT ────────────────────────────────────────
function CanvasGrid({
  width, height, gridPx, stageX, stageY, stageScale,
}: {
  width: number; height: number; gridPx: number;
  stageX: number; stageY: number; stageScale: number;
}) {
  const scaledGrid = gridPx * stageScale;
  const offsetX = (stageX % scaledGrid);
  const offsetY = (stageY % scaledGrid);

  const verticals: number[] = [];
  const horizontals: number[] = [];

  for (let x = offsetX; x < width; x += scaledGrid) verticals.push(x);
  for (let y = offsetY; y < height; y += scaledGrid) horizontals.push(y);

  const majorGridPx = scaledGrid * 5; // major grid every 5 cells
  const majorOffsetX = stageX % majorGridPx;
  const majorOffsetY = stageY % majorGridPx;

  const majorVerticals: number[] = [];
  const majorHorizontals: number[] = [];
  for (let x = majorOffsetX; x < width; x += majorGridPx) majorVerticals.push(x);
  for (let y = majorOffsetY; y < height; y += majorGridPx) majorHorizontals.push(y);

  return (
    <>
      {/* Minor grid lines */}
      {verticals.map((x) => (
        <Line key={`v${x}`} points={[x, 0, x, height]} stroke="rgba(255,255,255,0.12)" strokeWidth={1} listening={false} />
      ))}
      {horizontals.map((y) => (
        <Line key={`h${y}`} points={[0, y, width, y]} stroke="rgba(255,255,255,0.12)" strokeWidth={1} listening={false} />
      ))}
      {/* Major grid lines */}
      {majorVerticals.map((x) => (
        <Line key={`mv${x}`} points={[x, 0, x, height]} stroke="rgba(239,71,50,0.35)" strokeWidth={1.5} listening={false} />
      ))}
      {majorHorizontals.map((y) => (
        <Line key={`mh${y}`} points={[0, y, width, y]} stroke="rgba(239,71,50,0.35)" strokeWidth={1.5} listening={false} />
      ))}
    </>
  );
}

// ── FIXTURE SYMBOL ────────────────────────────────────────
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
    const rotation = Math.round(node.rotation());
    store.updateElement(el.id, {
      scaleX: Math.max(0.1, Math.min(10, scaleX)),
      scaleY: Math.max(0.1, Math.min(10, scaleY)),
      rotation,
    });
  };

  const def = getFixtureDef(el.type);
  const color = isSelected ? '#60a5fa' : (el.color || def?.colorHex || '#facc15');
  const hasConflict = el.dmx?.hasConflict;
  const strokeColor = hasConflict ? '#ef4444' : (isSelected ? '#3b82f6' : color);

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
            <Rect x={0} y={-h / 2} width={w} height={h}
              fill="#334155" stroke="#94a3b8" strokeWidth={isSelected ? 2 : 1} cornerRadius={2} />
            {el.type.startsWith('truss') && (
              <>
                <Line points={[0, -h / 2, w, h / 2]} stroke="#64748b" strokeWidth={1} />
                <Line points={[0, h / 2, w, -h / 2]} stroke="#64748b" strokeWidth={1} />
              </>
            )}
            <Text text={el.label} x={4} y={-14} fontSize={9} fill="#94a3b8" fontFamily="JetBrains Mono, monospace" />
          </Group>
        );
      }

      case 'tripod': {
        const s = 16;
        return (
          <Group>
            <Line points={[0, 0, 0, -s]} stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 1.5} />
            <Line points={[0, 0, -s * 0.86, s * 0.5]} stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 1.5} />
            <Line points={[0, 0, s * 0.86, s * 0.5]} stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 1.5} />
            <Circle radius={4} fill="#64748b" stroke={strokeColor} strokeWidth={1} />
            <Text text={el.label || 'Tripé'} x={-20} y={s + 4} fontSize={8} fill="rgba(255,255,255,0.5)" width={40} align="center" fontFamily="JetBrains Mono, monospace" />
          </Group>
        );
      }

      case 'tower': {
        const w = 24, h = 24;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill="rgba(71,85,105,0.3)" stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 1.5} />
            <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke={strokeColor} strokeWidth={1} />
            <Line points={[-w / 2, h / 2, w / 2, -h / 2]} stroke={strokeColor} strokeWidth={1} />
            <Circle radius={3} fill="#38bdf8" />
            <Text text={el.label || 'Torre'} x={-20} y={h / 2 + 3} fontSize={8} fill="rgba(255,255,255,0.5)" width={40} align="center" fontFamily="JetBrains Mono, monospace" />
          </Group>
        );
      }

      case 'floor_base': {
        const s = 14;
        return (
          <Group>
            <Line points={[-s, s, 0, 0]} stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 2} lineCap="round" />
            <Line points={[s, s, 0, 0]} stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 2} lineCap="round" />
            <Line points={[0, -s, 0, 0]} stroke={strokeColor} strokeWidth={isSelected ? 2.5 : 2} lineCap="round" />
            <Circle radius={3.5} fill="#facc15" stroke={strokeColor} strokeWidth={1} />
            <Text text={el.label || 'Pé de Galinha'} x={-35} y={s + 4} fontSize={8} fill="rgba(255,255,255,0.5)" width={70} align="center" fontFamily="JetBrains Mono, monospace" />
          </Group>
        );
      }

      case 'wall': {
        const w = (el.customProps?.width as number) ?? 100;
        const h = (el.customProps?.height as number) ?? 100;
        const fill = el.customProps?.fill as string ?? '#1e293b';
        const stroke = el.customProps?.stroke as string ?? '#475569';
        const opacity = el.customProps?.opacity as number ?? 1;
        return (
          <Group>
            <Rect x={0} y={0} width={w} height={h} fill={fill}
              stroke={isSelected ? '#3b82f6' : stroke} strokeWidth={isSelected ? 2 : 1}
              opacity={opacity} />
            {el.label && (
              <Text text={el.label} x={w / 2} y={h / 2 - 7} fontSize={10}
                fill="rgba(255,255,255,0.3)" align="center" offsetX={el.label.length * 3}
                fontFamily="Inter, sans-serif" />
            )}
          </Group>
        );
      }

      case 'ellipsoidal': {
        const angle = el.angle ?? 26;
        const size = 18;
        return (
          <Group>
            {/* Body triangle */}
            <Line points={[-size * 0.6, -size * 0.4, size * 0.6, -size * 0.4, 0, size * 0.7]}
              closed fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            {/* Beam lines */}
            <Line points={[0, size * 0.7, -size * 0.5, size * 1.4]} stroke={`${color}60`} strokeWidth={1} />
            <Line points={[0, size * 0.7, size * 0.5, size * 1.4]} stroke={`${color}60`} strokeWidth={1} />
            {/* Angle text */}
            <Text text={`${angle}°`} x={-10} y={-size * 0.35} fontSize={8}
              fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono, monospace" />
          </Group>
        );
      }

      case 'fresnel': {
        const r = 14;
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            <Circle radius={r * 0.7} fill="none" stroke={`${color}50`} strokeWidth={1} />
            <Circle radius={r * 0.4} fill="none" stroke={`${color}50`} strokeWidth={1} />
            <Circle radius={r * 0.15} fill={strokeColor} />
          </Group>
        );
      }

      case 'pc': {
        const r = 14;
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            <Line points={[-r, r * 0.3, r, r * 0.3]} stroke={strokeColor} strokeWidth={2} />
            <Circle radius={r * 0.2} fill={strokeColor} />
          </Group>
        );
      }

      case 'par64': {
        const w = 20, h = 16;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h} cornerRadius={3}
              fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            <Circle radius={5} fill={`${color}80`} stroke={strokeColor} strokeWidth={1} />
          </Group>
        );
      }

      case 'parled': {
        const r = 14;
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            {/* LED dot matrix */}
            {[-5, 0, 5].map((dx) =>
              [-5, 0, 5].map((dy) => (
                <Circle key={`${dx}${dy}`} x={dx} y={dy} radius={2.5}
                  fill={strokeColor} opacity={0.7} />
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
            <Rect x={-w / 2} y={-h / 2} width={w} height={h}
              fill="#1e1b4b" stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={2} />
            {Array.from({ length: cells }).map((_, i) => (
              <Rect key={i} x={-w / 2 + i * cellW + 2} y={-h / 2 + 3}
                width={cellW - 4} height={h - 6} fill={color} opacity={0.7} cornerRadius={1} />
            ))}
          </Group>
        );
      }

      case 'moving_spot':
      case 'moving_beam':
      case 'moving_wash': {
        const r = 15;
        const letter = el.type === 'moving_spot' ? 'S' : el.type === 'moving_beam' ? 'B' : 'W';
        return (
          <Group>
            <Circle radius={r} fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            <Circle radius={r + 4} fill="none" stroke={strokeColor} strokeWidth={1} opacity={0.4} />
            <Text text={letter} x={-4} y={-5} fontSize={10} fill="#0f0f13"
              fontStyle="bold" fontFamily="Inter, sans-serif" />
          </Group>
        );
      }

      case 'svoboda': {
        const w = 60, h = 12;
        const bulbs = 8;
        const bw = w / bulbs;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h}
              fill="#451a03" stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} />
            {Array.from({ length: bulbs }).map((_, i) => (
              <Circle key={i} x={-w / 2 + i * bw + bw / 2} y={0} radius={3.5}
                fill={color} opacity={0.8} />
            ))}
          </Group>
        );
      }

      case 'minibruta': {
        const size = 28;
        const cols = 4, rows = 2;
        const cw = size / cols, ch = size / rows;
        return (
          <Group>
            <Rect x={-size / 2} y={-size / 4} width={size} height={size / 2}
              fill="#292524" stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={2} />
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => (
                <Circle key={`${r}${c}`}
                  x={-size / 2 + c * cw + cw / 2}
                  y={-size / 4 + r * ch + ch / 2}
                  radius={4} fill={color} opacity={0.85} />
              ))
            )}
          </Group>
        );
      }

      case 'strobe': {
        const w = 30, h = 18;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h}
              fill="#1e293b" stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={3} />
            <Line points={[-4, -6, 0, 0, 4, -6, 8, 6, -8, 6, -4, -6]}
              closed fill="#fef08a" stroke="#fbbf24" strokeWidth={1} scaleX={0.6} scaleY={0.6} />
          </Group>
        );
      }

      case 'uv': {
        const r = 13;
        return (
          <Group>
            <Circle radius={r} fill="#4c1d95" stroke="#7c3aed" strokeWidth={isSelected ? 2 : 1.5} />
            <Text text="UV" x={-8} y={-6} fontSize={9} fill="#c4b5fd"
              fontStyle="bold" fontFamily="Inter, sans-serif" />
          </Group>
        );
      }

      case 'fogmachine': {
        const size = 22;
        return (
          <Group>
            <Rect x={-size / 2} y={-size / 2} width={size} height={size}
              fill="#1e293b" stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={3} />
            {/* Cloud wisps */}
            <Circle x={-4} y={-4} radius={5} fill="rgba(148,163,184,0.3)" />
            <Circle x={2} y={-6} radius={4} fill="rgba(148,163,184,0.3)" />
            <Circle x={0} y={-2} radius={6} fill="rgba(148,163,184,0.2)" />
          </Group>
        );
      }

      case 'mirrorball': {
        const r = 16;
        return (
          <Group>
            <Circle radius={r} fill="#334155" stroke="#e2e8f0" strokeWidth={isSelected ? 2 : 1} />
            {/* Dot grid to simulate mirrors */}
            {[-8, -4, 0, 4, 8].map((dx) =>
              [-8, -4, 0, 4, 8].map((dy) => {
                if (dx * dx + dy * dy > r * r) return null;
                return <Rect key={`${dx}${dy}`} x={dx - 1.5} y={dy - 1.5} width={3} height={3}
                  fill="rgba(255,255,255,0.6)" cornerRadius={0.5} />;
              })
            )}
          </Group>
        );
      }

      case 'setlight': {
        const w = 36, h = 20;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h}
              fill="#451a03" stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={2} />
            <Circle x={0} y={0} radius={7} fill={color} opacity={0.8} />
            <Circle x={0} y={0} radius={3} fill="#fff" opacity={0.4} />
          </Group>
        );
      }

      case 'scenery_rect': {
        const w = (el.customProps?.width as number) ?? 120;
        const h = (el.customProps?.height as number) ?? 60;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h}
              fill="rgba(71,85,105,0.35)" stroke={isSelected ? '#3b82f6' : '#64748b'} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={4} />
            <Text text={el.label || 'Cenário'} x={-w / 2} y={-6} width={w} align="center"
              fontSize={10} fill="rgba(255,255,255,0.8)" fontFamily="Inter, sans-serif" />
          </Group>
        );
      }

      case 'scenery_circle': {
        const r = (el.customProps?.radius as number) ?? 40;
        return (
          <Group>
            <Circle radius={r} fill="rgba(71,85,105,0.35)" stroke={isSelected ? '#3b82f6' : '#64748b'} strokeWidth={isSelected ? 2 : 1.5} />
            <Text text={el.label || 'Objeto'} x={-r} y={-6} width={r * 2} align="center"
              fontSize={10} fill="rgba(255,255,255,0.8)" fontFamily="Inter, sans-serif" />
          </Group>
        );
      }

      case 'scenery_platform': {
        const w = (el.customProps?.width as number) ?? 140;
        const h = (el.customProps?.height as number) ?? 70;
        return (
          <Group>
            <Rect x={-w / 2} y={-h / 2} width={w} height={h}
              fill="rgba(120,53,15,0.4)" stroke={isSelected ? '#3b82f6' : '#b45309'} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={2} />
            <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke="rgba(180,83,9,0.3)" strokeWidth={1} />
            <Line points={[-w / 2, h / 2, w / 2, -h / 2]} stroke="rgba(180,83,9,0.3)" strokeWidth={1} />
            <Text text={el.label || 'Praticável'} x={-w / 2} y={-6} width={w} align="center"
              fontSize={10} fill="#fde68a" fontFamily="Inter, sans-serif" />
          </Group>
        );
      }
      case 'scenery_curtain': {
        const w = (el.customProps?.width as number) ?? 200;
        return (
          <Group>
            <Line points={[-w / 2, 0, w / 2, 0]} stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth={6} lineCap="round" />
            <Text text={el.label || 'Cortina / Perneta'} x={-w / 2} y={-16} width={w} align="center"
              fontSize={9} fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif" />
          </Group>
        );
      }

      case 'wall': {
        const w = (el.customProps?.width as number) ?? 100;
        const h = (el.customProps?.height as number) ?? 100;
        const isLight = store.colorTheme === 'light';
        const fill = el.customProps?.fill as string ?? (isLight ? '#e2e8f0' : '#1e293b');
        const stroke = el.customProps?.stroke as string ?? (isSelected ? '#38bdf8' : '#64748b');
        const opacity = el.customProps?.opacity as number ?? 1;

        return (
          <Group>
            <Rect
              x={0} y={0} width={w} height={h}
              fill={fill}
              stroke={isSelected ? '#38bdf8' : stroke}
              strokeWidth={isSelected ? 2.5 : 1.5}
              opacity={opacity}
              cornerRadius={3}
            />
            {el.label && (
              <Text
                text={el.label.toUpperCase()}
                x={0} y={h / 2 - 8} width={w}
                fontSize={11}
                fontStyle="bold"
                fill={isLight ? '#0f172a' : 'rgba(255,255,255,0.75)'}
                align="center"
                fontFamily="Inter, sans-serif"
              />
            )}
          </Group>
        );
      }

      case 'custom_stage': {
        const w = (el.customProps?.width as number) ?? 500;
        const h = (el.customProps?.height as number) ?? 350;
        const varanda = (el.customProps?.varanda as number) ?? 80;
        const isLight = store.colorTheme === 'light';
        return (
          <Group>
            {/* Stage Floor Background */}
            <Rect
              x={-w / 2} y={-h / 2} width={w} height={h}
              fill={isLight ? '#f1f5f9' : '#1e293b'}
              stroke={isSelected ? '#38bdf8' : '#64748b'}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={2}
            />
            {/* Stage Floor Grid Hatch Lines */}
            <Line points={[-w / 2, -h / 2, w / 2, h / 2]} stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'} strokeWidth={1} />
            <Line points={[-w / 2, h / 2, w / 2, -h / 2]} stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'} strokeWidth={1} />

            {/* Varanda / Proscênio extending forward */}
            {varanda > 0 && (
              <Rect
                x={-w / 2} y={h / 2} width={w} height={varanda}
                fill={isLight ? '#e2e8f0' : 'rgba(51, 65, 85, 0.4)'}
                stroke={isSelected ? '#38bdf8' : '#475569'}
                strokeWidth={1.5}
                dash={[6, 4]}
              />
            )}
            {/* Line at Proscenium (Boca de cena) */}
            <Line points={[-w / 2, h / 2, w / 2, h / 2]} stroke="#38bdf8" strokeWidth={3} />

            {/* Labels */}
            <Text text="PALCO" x={-w / 2} y={-h / 4} width={w} align="center"
              fontSize={16} fill={isLight ? 'rgba(15,23,42,0.3)' : 'rgba(255,255,255,0.3)'} fontStyle="bold" fontFamily="Inter, sans-serif" />
            <Text text="BOCA DE CENA" x={-w / 2} y={h / 2 - 14} width={w} align="center"
              fontSize={10} fill="#0284c7" fontStyle="bold" fontFamily="JetBrains Mono, monospace" />
            {varanda > 0 && (
              <Text text="VARANDA / PROSCÊNIO" x={-w / 2} y={h / 2 + varanda / 2 - 6} width={w} align="center"
                fontSize={9} fill={isLight ? '#475569' : 'rgba(255,255,255,0.4)'} fontFamily="JetBrains Mono, monospace" />
            )}
          </Group>
        );
      }

      case 'hqi':
      case 'linestra':
      case 'pinspot':
      default: {
        const s = 14;
        return (
          <Group>
            <Rect x={-s / 2} y={-s / 2} width={s} height={s}
              fill={color} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1.5} cornerRadius={2} />
          </Group>
        );
      }
    }
  };

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
        {/* Label below fixture */}
        {el.label && el.category !== 'architecture' && el.category !== 'rigging' && (
          <Text
            text={el.customName || el.label}
            x={-30} y={20}
            fontSize={9}
            fill={isSelected ? (store.colorTheme === 'light' ? '#1d4ed8' : '#93c5fd') : (store.colorTheme === 'light' ? '#0f172a' : 'rgba(255,255,255,0.85)')}
            fontFamily="JetBrains Mono, monospace"
            width={60}
            align="center"
          />
        )}
        {/* DMX address badge */}
        {el.dmx && el.dmx.address > 0 && (
          <Text
            text={`${el.dmx.universe}/${el.dmx.address}`}
            x={-20} y={-28}
            fontSize={8}
            fill={el.dmx.hasConflict ? '#ef4444' : (store.colorTheme === 'light' ? '#2563eb' : 'rgba(96,165,250,0.85)')}
            fontFamily="JetBrains Mono, monospace"
            width={40}
            align="center"
          />
        )}
      </Group>

      {isSelected && !el.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          anchorSize={7}
          borderStroke="#3b82f6"
          anchorStroke="#3b82f6"
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
  const gel = el.gelatin ?? 'NC';

  // Map common gel codes to colors
  const gelColors: Record<string, string> = {
    'R-27': 'rgba(220,50,50,0.12)',
    'R-80': 'rgba(20,40,200,0.12)',
    'R-74': 'rgba(40,50,200,0.12)',
    'R-68': 'rgba(106,180,245,0.12)',
    'R-09': 'rgba(245,200,66,0.12)',
    'R-312': 'rgba(245,245,66,0.12)',
    'R-393': 'rgba(66,200,120,0.12)',
    'NC': 'rgba(255,255,220,0.1)',
  };
  const coneColor = gelColors[gel] ?? 'rgba(255,255,200,0.1)';
  const coneStroke = gelColors[gel]?.replace('0.12', '0.3') ?? 'rgba(255,255,200,0.25)';

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
        opacity={0.9}
      />
    </Group>
  );
}

// ── MAIN CANVAS ───────────────────────────────────────────
export default function LightingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const isSpaceRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const store = useEditorStore();
  const {
    stageX, stageY, stageScale,
    setStagePosition, setStageScale,
    gridVisible, gridSize, gridPixelsPerMeter,
    activeTool, pendingFixtureType,
    elements, selectedIds,
    layers,
    showFocusCoverage,
    selectElement, clearSelection, addElement,
    snapToGrid,
  } = store;

  // Resize observer
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

  // Expose stage ref globally for PNG/PDF export
  useEffect(() => {
    if (stageRef.current) {
      window.__afinaStageRef = stageRef.current;
    }
  });

  // Space-bar pan key tracking
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

  // Cursor style
  const getCursor = () => {
    if (activeTool === 'pan' || isPanningRef.current) return 'grabbing';
    if (activeTool === 'insert_fixture') return 'crosshair';
    return 'default';
  };

  const gridPx = (gridSize / 1000) * gridPixelsPerMeter;

  // ── WHEEL ZOOM ──────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleBy = 1.1;
    const stage = (stageRef.current as { getPointerPosition: () => { x: number; y: number } | null });
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = stageScale;
    const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.max(0.05, Math.min(8, newScale));

    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };

    setStageScale(clamped);
    setStagePosition(
      pointer.x - mousePointTo.x * clamped,
      pointer.y - mousePointTo.y * clamped
    );
  }, [stageScale, stageX, stageY, setStageScale, setStagePosition]);

  // Selection box state for rubberband drag selection
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isSelectingRef = useRef(false);

  // ── STAGE MOUSE DOWN ────────────────────────────────────
  const handleStageMouseDown = useCallback((e: { target: { getStage: () => unknown; className?: string }; evt: MouseEvent }) => {
    const isMiddle = e.evt.button === 1;
    if (activeTool === 'pan' || isSpaceRef.current || isMiddle) {
      isPanningRef.current = true;
      lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }

    const clickedOnEmpty = e.target === (stageRef.current as { getStage: () => unknown })?.getStage?.() || e.target.className === 'Stage';
    if (activeTool === 'select' && clickedOnEmpty) {
      const stage = (stageRef.current as { getPointerPosition: () => { x: number; y: number } | null });
      const pointer = stage?.getPointerPosition();
      if (pointer) {
        const x = (pointer.x - stageX) / stageScale;
        const y = (pointer.y - stageY) / stageScale;
        isSelectingRef.current = true;
        setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
        if (!e.evt.shiftKey) clearSelection();
      }
    }
  }, [activeTool, stageX, stageY, stageScale, clearSelection]);

  // ── STAGE MOUSE MOVE ────────────────────────────────────
  const handleStageMouseMove = useCallback((e: { evt: MouseEvent }) => {
    if (isPanningRef.current) {
      const dx = e.evt.clientX - lastPointerRef.current.x;
      const dy = e.evt.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
      setStagePosition(stageX + dx, stageY + dy);
      return;
    }

    if (isSelectingRef.current) {
      const stage = (stageRef.current as { getPointerPosition: () => { x: number; y: number } | null });
      const pointer = stage?.getPointerPosition();
      if (pointer) {
        const x = (pointer.x - stageX) / stageScale;
        const y = (pointer.y - stageY) / stageScale;
        setSelectionBox((prev) => (prev ? { ...prev, x2: x, y2: y } : null));
      }
    }
  }, [stageX, stageY, setStagePosition, stageScale]);

  // ── STAGE MOUSE UP ──────────────────────────────────────
  const handleStageMouseUp = useCallback(() => {
    isPanningRef.current = false;
    if (isSelectingRef.current && selectionBox) {
      isSelectingRef.current = false;
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

  // ── STAGE CLICK (insert fixture or deselect) ──────────────
  const handleStageClick = useCallback((e: { target: { getStage: () => unknown; className?: string }; evt: MouseEvent }) => {
    const stage = (stageRef.current as { getPointerPosition: () => { x: number; y: number } | null });
    if (!stage) return;

    if (activeTool === 'insert_fixture' && pendingFixtureType) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Convert to canvas coordinates
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

    // Deselect on background click
    const clickedOnEmpty = e.target === (stageRef.current as { getStage: () => unknown })?.getStage?.() || e.target.className === 'Stage';
    if (activeTool === 'select' && clickedOnEmpty) clearSelection();
  }, [activeTool, pendingFixtureType, stageX, stageY, stageScale, addElement, selectElement, clearSelection, snapToGrid]);

  // Magnetic Snap to Rigging Bars Helper
  const snapToRiggingBar = useCallback((x: number, y: number, isRigging = false): { x: number; y: number } => {
    if (isRigging) return { x, y };
    const riggingBars = elements.filter((el) => el.category === 'rigging' || el.type === 'lightingbar' || el.type.startsWith('truss'));
    for (const bar of riggingBars) {
      const barW = (bar.customProps?.width as number) ?? 200;
      if (Math.abs(y - bar.y) < 30 && x >= bar.x - 20 && x <= bar.x + barW + 20) {
        return { x, y: bar.y }; // Snap right onto bar center line!
      }
    }
    return { x, y };
  }, [elements]);

  // ── DRAG END (update position) ───────────────────────────
  const handleFixtureDragEnd = useCallback((id: string, e: { target: { x: () => number; y: () => number } }) => {
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

  // Layer visibility lookup
  const layerMap = Object.fromEntries(layers.map((l) => [l.id, l]));

  // ── DRAG-AND-DROP FROM PANEL ───────────────────────────
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

    addElement({
      type,
      category: def.category,
      layerId: def.defaultLayerId,
      x, y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      label: '',
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
  }, [addElement, stageX, stageY, stageScale, snapToGrid, snapToRiggingBar]);

  // Build activeLayerMap lookup table
  const activeLayerMap = (layers || []).reduce<Record<string, { visible: boolean; locked: boolean }>>((acc, l) => {
    acc[l.id] = { visible: l.visible, locked: l.locked };
    return acc;
  }, {});

  const isLayerVisible = (layerId?: string) => {
    if (!layerId || !activeLayerMap[layerId]) return true;
    return activeLayerMap[layerId].visible;
  };

  // Split elements by layer/category with fallback so NOTHING is ever hidden
  const archElements = elements.filter((el) => el.visible !== false && isLayerVisible(el.layerId) && (el.category === 'architecture' || el.layerId === 'layer_architecture'));
  const riggingElements = elements.filter((el) => el.visible !== false && isLayerVisible(el.layerId) && (el.category === 'rigging' || el.layerId === 'layer_rigging'));
  const annotationElements = elements.filter((el) => el.visible !== false && isLayerVisible(el.layerId) && (el.category === 'annotation' || el.layerId === 'layer_annotations'));
  const categorizedIds = new Set([
    ...archElements.map((e) => e.id),
    ...riggingElements.map((e) => e.id),
    ...annotationElements.map((e) => e.id),
  ]);
  const lightingElements = elements.filter((el) => !categorizedIds.has(el.id) && el.visible !== false && isLayerVisible(el.layerId));

  const focusEls = showFocusCoverage
    ? elements.filter((el) => el.angle && el.angle > 0 && isLayerVisible(el.layerId))
    : [];

  return (
    <div
      ref={containerRef}
      className="editor-canvas canvas-wrapper"
      style={{ cursor: getCursor() }}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Tool hint */}
      {activeTool === 'insert_fixture' && pendingFixtureType && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-afina-600/90 text-white text-xs rounded-full backdrop-blur-sm border border-afina-400/30 pointer-events-none">
          Clique no canvas para inserir · ESC para cancelar
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 z-10 font-mono text-[10px] text-white/30 bg-editor-raised px-2 py-1 rounded border border-editor-border">
        {Math.round(stageScale * 100)}%
      </div>

      {/* Snap indicator */}
      {store.snapEnabled && (
        <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-afina-400/60 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-afina-500" />
          Snap
        </div>
      )}

      {/* Minimap Radar Navigator */}
      <CanvasMinimap />

      <Stage
        ref={stageRef as any}
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
              width={dimensions.width / stageScale}
              height={dimensions.height / stageScale}
              gridPx={gridPx}
              stageX={stageX / stageScale}
              stageY={stageY / stageScale}
              stageScale={1}
            />
          )}
        </Layer>

        {/* ── ARCHITECTURE LAYER ─── */}
        <Layer>
          {archElements.map((el) => (
            <FixtureSymbol
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              onClick={() => selectElement(el.id)}
              onDragEnd={(e) => handleFixtureDragEnd(el.id, e)}
            />
          ))}
        </Layer>

        {/* ── RIGGING LAYER ─── */}
        <Layer>
          {riggingElements.map((el) => (
            <FixtureSymbol
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              onClick={() => selectElement(el.id)}
              onDragEnd={(e) => handleFixtureDragEnd(el.id, e)}
            />
          ))}
        </Layer>

        {/* ── LIGHTING LAYER ─── */}
        <Layer>
          {/* Focus cones (behind fixtures) */}
          {focusEls.map((el) => (
            <FocusCone key={`cone-${el.id}`} el={el} />
          ))}
          {lightingElements.map((el) => (
            <FixtureSymbol
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              onClick={(e: unknown) => {
                const evt = e as { evt: MouseEvent };
                selectElement(el.id, evt.evt?.shiftKey ?? false);
              }}
              onDragEnd={(e) => handleFixtureDragEnd(el.id, e)}
            />
          ))}
        </Layer>

        {/* ── ANNOTATION LAYER ─── */}
        <Layer>
          {annotationElements.map((el) => (
            <FixtureSymbol
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              onClick={() => selectElement(el.id)}
              onDragEnd={(e) => handleFixtureDragEnd(el.id, e)}
            />
          ))}
        </Layer>

        {/* ── SELECTION MARQUEE BOX LAYER ─── */}
        {selectionBox && (
          <Layer listening={false}>
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3b82f6"
              strokeWidth={1}
              dash={[4, 4]}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
}
