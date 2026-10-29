"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./PixelStudioEditor.module.css";

type Tool = "pencil" | "eraser" | "fill" | "eyedropper" | "line" | "rect" | "ellipse" | "select" | "text";
type Layer = { id: number; name: string; visible: boolean; opacity: number; pixels: string[] };
type Frame = { id: number; duration: number; layers: Layer[] };
type Snapshot = { frames: Frame[]; frameIndex: number; layerId: number };
const TRANSPARENT = "";

const TOOL_LIST: { id: Tool; label: string; icon: string; group: string }[] = [
  { id: "pencil", label: "Pencil (P)", icon: "✏️", group: "DRAW" },
  { id: "eraser", label: "Eraser (E)", icon: "🧽", group: "DRAW" },
  { id: "fill", label: "Bucket (B)", icon: "🪣", group: "DRAW" },
  { id: "eyedropper", label: "Color Picker (V)", icon: "💧", group: "DRAW" },
  { id: "line", label: "Line (L)", icon: "📏", group: "SHAPES" },
  { id: "rect", label: "Rectangle (R)", icon: "▱", group: "SHAPES" },
  { id: "ellipse", label: "Circle (C)", icon: "⭕", group: "SHAPES" },
  { id: "select", label: "Selection (S)", icon: "▧", group: "EDIT" },
  { id: "text", label: "Pixel text (T)", icon: "🔤", group: "EDIT" },
];

const DEFAULT_PALETTE = ["#171923", "#ffffff", "#c4b5fd", "#a78bfa", "#7c3aed", "#3ee0ff", "#00a6a6", "#6fcf97", "#f6c177", "#f38ba8", "#e76f51", "#8b5e3c", "#5d7290", "#38465f", "#737994", "#000000"];

function makeLayer(id: number, width: number, height: number, name: string): Layer {
  return { id, name, visible: true, opacity: 100, pixels: Array(width * height).fill(TRANSPARENT) };
}
function makeFrame(id: number, width: number, height: number, layerId: number): Frame {
  return { id, duration: 120, layers: [makeLayer(layerId, width, height, "Layer 1")] };
}
function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((frame) => ({ ...frame, layers: frame.layers.map((layer) => ({ ...layer, pixels: [...layer.pixels] })) }));
}
function pixelIndex(x: number, y: number, width: number) { return y * width + x; }

function hexToHsv(hex: string) {
  const value = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.slice(1) : "000000";
  const r = parseInt(value.slice(0, 2), 16) / 255, g = parseInt(value.slice(2, 4), 16) / 255, b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) { if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return { h, s: max ? d / max * 100 : 0, v: max * 100 };
}
function hsvToHex(h: number, s: number, v: number) {
  const c = (v / 100) * (s / 100), x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v / 100 - c;
  const [r, g, b] = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return "#" + [r,g,b].map(n => Math.round((n+m)*255).toString(16).padStart(2,"0")).join("");
}
function HexColorPicker({ value, onChange, label, swatchClass }: { value: string; onChange: (value: string) => void; label: string; swatchClass: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [position, setPosition] = useState({ x: 120, y: 100 });
  const dragRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const hsv = hexToHsv(/^#[0-9a-fA-F]{6}$/.test(draft) ? draft : value);
  const choose = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const s = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const v = Math.max(0, Math.min(100, (1 - (event.clientY - rect.top) / rect.height) * 100));
    setDraft(hsvToHex(hsv.h, s, v));
  };
  const openPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    const height = 270;
    setPosition({ x: Math.max(8, Math.min(rect.right + 8, window.innerWidth - width - 8)), y: Math.max(8, Math.min(rect.top, window.innerHeight - height - 8)) });
    setDraft(value);
    setOpen((current) => !current);
  };
  const dragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y };
  };
  const dragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    const width = Math.min(320, window.innerWidth - 16), height = 270;
    setPosition({ x: Math.max(8, Math.min(window.innerWidth - width - 8, start.x + event.clientX - start.pointerX)), y: Math.max(8, Math.min(window.innerHeight - height - 8, start.y + event.clientY - start.pointerY)) });
  };
  const selectColor = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(draft)) onChange(draft.toLowerCase());
    setOpen(false);
  };
  return <div className={styles.pickerPopoverWrap}>
    <button type="button" className={swatchClass} style={{ background: value }} aria-label={label + " color"} title={label + " · Click to choose HEX color"} onClick={openPicker} />
    {open && <div className={styles.pickerPopover} style={{ position: "fixed", left: position.x, top: position.y }} role="dialog" aria-label={label + " color picker"}>
      <div className={styles.pickerDragBar} onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}><span>{label.toUpperCase()} COLOR</span><span className={styles.dragHint}>DRAG TO MOVE</span><button type="button" aria-label="Close color picker" onClick={() => setOpen(false)}>×</button></div>
      <div className={styles.saturationArea} style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); choose(e); }} onPointerMove={(e) => { if (e.buttons === 1) choose(e); }}><span style={{ left: `${hsv.s}%`, top: `${100-hsv.v}%` }} /></div>
      <input className={styles.hueRainbow} aria-label={label + " hue"} type="range" min="0" max="359" value={hsv.h} onChange={(e) => setDraft(hsvToHex(Number(e.target.value), hsv.s, hsv.v))} />
      <label className={styles.pickerHexLabel}>HEX<input aria-label={label + " HEX"} value={draft.toUpperCase()} maxLength={7} spellCheck={false} onChange={(e) => { const next = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(next)) setDraft(next); }} onBlur={() => { if (!/^#[0-9a-fA-F]{6}$/.test(draft)) setDraft(value); }} /></label>
      <button type="button" className={styles.pickerSelectButton} onClick={selectColor}>Select Color</button>
    </div>}
  </div>;
}
function LayerThumbnail({ pixels, width, height }: { pixels: string[]; width: number; height: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = width; canvas.height = height;
    const image = ctx.createImageData(width, height);
    pixels.forEach((value, i) => {
      if (!value) return;
      const hex = Number.parseInt(value.slice(1), 16);
      image.data[i * 4] = (hex >> 16) & 255;
      image.data[i * 4 + 1] = (hex >> 8) & 255;
      image.data[i * 4 + 2] = hex & 255;
      image.data[i * 4 + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);
  }, [pixels, width, height]);
  return <canvas ref={ref} className={styles.layerThumbnail} width={width} height={height} aria-hidden="true" />;
}

export default function PixelStudioEditor() {
  const [dimensions, setDimensions] = useState({ width: 32, height: 32 });
  const [documentName, setDocumentName] = useState("Untitled");
  const [importing, setImporting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [frames, setFrames] = useState<Frame[]>([makeFrame(1, 32, 32, 1)]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [activeLayerId, setActiveLayerId] = useState(1);
  const [nextId, setNextId] = useState(2);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [brushSize, setBrushSize] = useState(1);
  const [zoom, setZoom] = useState(12);
  const [showGrid, setShowGrid] = useState(true);
  const [symmetry, setSymmetry] = useState(false);
  const [dither, setDither] = useState(false);
  const [onionSkin, setOnionSkin] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Ready to create");
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pngInputRef = useRef<HTMLInputElement>(null);
  const canvasScrollerRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<{ width: number; height: number; pixels: string[] } | null>(null);
  const drawingRef = useRef(false);
  const eraseGestureRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const previewRef = useRef<string[] | null>(null);
  const historyRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const activeFrame = frames[frameIndex] ?? frames[0];
  const activeLayer = activeFrame.layers.find((layer) => layer.id === activeLayerId) ?? activeFrame.layers[activeFrame.layers.length - 1];
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cryptopanim-pixel-studio-v1");
      if (saved) {
        const data = JSON.parse(saved) as { dimensions?: { width: number; height: number }; frames?: Frame[]; frameIndex?: number; activeLayerId?: number; nextId?: number; palette?: string[] };
        if (data.dimensions && data.dimensions.width >= 8 && data.dimensions.width <= 128 && data.dimensions.height >= 8 && data.dimensions.height <= 128) setDimensions(data.dimensions);
        if (Array.isArray(data.frames) && data.frames.length && data.frames.every((frame) => Array.isArray(frame.layers))) {
          setFrames(data.frames);
          setFrameIndex(Math.min(data.frameIndex ?? 0, data.frames.length - 1));
          setActiveLayerId(data.activeLayerId ?? data.frames[0].layers[0]?.id ?? 1);
          setNextId(data.nextId ?? 2);
        }
        if (Array.isArray(data.palette) && data.palette.every((item) => typeof item === "string")) setPalette(data.palette);
        setStatus("Recovered local workspace");
      }
    } catch {
      setStatus("Starting a fresh workspace");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("cryptopanim-pixel-studio-v1", JSON.stringify({ dimensions, frames, frameIndex, activeLayerId, nextId, palette }));
    } catch {
      setStatus("Local storage is full — export your artwork to keep a backup");
    }
  }, [hydrated, dimensions, frames, frameIndex, activeLayerId, nextId, palette]);

  const composite = useMemo(() => {
    const pixels = Array(dimensions.width * dimensions.height).fill(TRANSPARENT) as string[];
    for (const layer of activeFrame.layers) {
      if (!layer.visible || layer.opacity <= 0) continue;
      layer.pixels.forEach((value, i) => { if (value) pixels[i] = value; });
    }
    return pixels;
  }, [activeFrame, dimensions]);

  const remember = useCallback(() => {
    historyRef.current.push({ frames: cloneFrames(frames), frameIndex, layerId: activeLayerId });
    if (historyRef.current.length > 80) historyRef.current.shift();
    futureRef.current = [];
  }, [frames, frameIndex, activeLayerId]);

  const updateActiveLayer = useCallback((pixels: string[]) => {
    setFrames((current) => current.map((frame, i) => i !== frameIndex ? frame : ({
      ...frame,
      layers: frame.layers.map((layer) => layer.id === activeLayerId ? { ...layer, pixels } : layer),
    })));
  }, [frameIndex, activeLayerId]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    const drawPixels = (pixels: string[], alpha = 1) => {
      ctx.globalAlpha = alpha;
      pixels.forEach((value, i) => {
        if (!value) return;
        ctx.fillStyle = value;
        ctx.fillRect(i % width, Math.floor(i / width), 1, 1);
      });
    };
    if (onionSkin && frameIndex > 0) {
      const previous = frames[frameIndex - 1];
      const merged = Array(width * height).fill(TRANSPARENT) as string[];
      previous.layers.filter((layer) => layer.visible).forEach((layer) => layer.pixels.forEach((v, i) => { if (v) merged[i] = v; }));
      drawPixels(merged, 0.22);
    }
    drawPixels(previewRef.current ?? composite);
    ctx.globalAlpha = 1;
    if (showGrid && zoom >= 8) {
      ctx.strokeStyle = "rgba(142, 147, 171, .28)";
      ctx.lineWidth = 0.04;
      ctx.beginPath();
      for (let x = 0; x <= width; x++) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y <= height; y++) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
    }
    if (selection) {
      ctx.save();
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 0.35;
      ctx.setLineDash([0.5, 0.5]);
      ctx.strokeRect(selection.x + 0.175, selection.y + 0.175, Math.max(0.65, selection.w - 0.35), Math.max(0.65, selection.h - 0.35));
      ctx.strokeStyle = "#3ee0ff";
      ctx.lineDashOffset = 0.5;
      ctx.strokeRect(selection.x + 0.175, selection.y + 0.175, Math.max(0.65, selection.w - 0.35), Math.max(0.65, selection.h - 0.35));
      ctx.restore();
    }
  }, [dimensions, composite, showGrid, zoom, onionSkin, frameIndex, frames, selection]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  useEffect(() => {
    const scroller = canvasScrollerRef.current;
    if (!scroller) return;
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      if (event.deltaY === 0) return;
      setZoom((current) => Math.max(4, Math.min(28, current + (event.deltaY < 0 ? 2 : -2))));
    };
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrameIndex((index) => (index + 1) % frames.length), Math.max(40, activeFrame.duration));
    return () => window.clearInterval(timer);
  }, [playing, frames.length, activeFrame.duration]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(dimensions.width - 1, Math.floor((event.clientX - rect.left) / rect.width * dimensions.width))),
      y: Math.max(0, Math.min(dimensions.height - 1, Math.floor((event.clientY - rect.top) / rect.height * dimensions.height))),
    };
  };

  const stamp = (pixels: string[], x: number, y: number, value: string) => {
    const half = Math.floor(brushSize / 2);
    for (let dy = -half; dy < brushSize - half; dy++) for (let dx = -half; dx < brushSize - half; dx++) {
      const px = x + dx; const py = y + dy;
      if (px < 0 || py < 0 || px >= dimensions.width || py >= dimensions.height) continue;
      if (dither && (px + py) % 2) continue;
      pixels[pixelIndex(px, py, dimensions.width)] = value;
      if (symmetry) pixels[pixelIndex(dimensions.width - 1 - px, py, dimensions.width)] = value;
    }
  };

  const drawLine = (pixels: string[], x0: number, y0: number, x1: number, y1: number, value: string) => {
    let dx = Math.abs(x1 - x0); let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0); let sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    while (true) {
      stamp(pixels, x0, y0, value);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };

  const floodFill = (pixels: string[], x: number, y: number, replacement = color) => {
    const start = pixelIndex(x, y, dimensions.width);
    const target = pixels[start];
    if (target === replacement) return pixels;
    const result = [...pixels];
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      if (result[i] !== target) continue;
      result[i] = replacement;
      const px = i % dimensions.width; const py = Math.floor(i / dimensions.width);
      if (px > 0) stack.push(i - 1);
      if (px < dimensions.width - 1) stack.push(i + 1);
      if (py > 0) stack.push(i - dimensions.width);
      if (py < dimensions.height - 1) stack.push(i + dimensions.width);
    }
    return result;
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button === 2) event.preventDefault();
    if (event.button !== 0 && event.button !== 2) return;
    eraseGestureRef.current = event.button === 2;
    if (playing) setPlaying(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    if (tool === "eyedropper") {
      const value = composite[pixelIndex(point.x, point.y, dimensions.width)];
      if (value) setColor(value);
      return;
    }
    if (tool === "text") {
      const text = window.prompt("Text to pixelate (short text works best):");
      if (!text) return;
      remember();
      const pixels = [...activeLayer.pixels];
      const offscreen = document.createElement("canvas");
      offscreen.width = dimensions.width; offscreen.height = dimensions.height;
      const ctx = offscreen.getContext("2d");
      if (ctx) {
        ctx.fillStyle = color; ctx.font = "6px monospace"; ctx.textBaseline = "top";
        ctx.fillText(text.slice(0, 24), point.x, point.y);
        const image = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
        for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]) pixels[i / 4] = color;
        updateActiveLayer(pixels); setStatus("Pixel text added");
      }
      return;
    }
    if (tool === "fill") { remember(); updateActiveLayer(floodFill([...activeLayer.pixels], point.x, point.y, eraseGestureRef.current ? TRANSPARENT : color)); setStatus(eraseGestureRef.current ? "Area erased" : "Area filled"); return; }
    if (tool === "select") { startRef.current = point; drawingRef.current = true; setSelection({ x: point.x, y: point.y, w: 1, h: 1 }); return; }
    remember();
    drawingRef.current = true;
    startRef.current = point;
    if (tool === "pencil" || tool === "eraser") {
      const pixels = [...activeLayer.pixels];
      stamp(pixels, point.x, point.y, tool === "eraser" || eraseGestureRef.current ? TRANSPARENT : color);
      updateActiveLayer(pixels);
    } else {
      previewRef.current = [...activeLayer.pixels];
      renderCanvas();
    }
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !startRef.current) return;
    const point = pointFromEvent(event);
    if (tool === "select") {
      const start = startRef.current;
      setSelection({ x: Math.min(start.x, point.x), y: Math.min(start.y, point.y), w: Math.abs(point.x - start.x) + 1, h: Math.abs(point.y - start.y) + 1 });
      return;
    }
    if (tool === "pencil" || tool === "eraser") {
      const pixels = [...activeLayer.pixels];
      stamp(pixels, point.x, point.y, tool === "eraser" ? TRANSPARENT : color);
      updateActiveLayer(pixels);
      return;
    }
    const start = startRef.current;
    const pixels = [...activeLayer.pixels];
    const value = tool === "eraser" || eraseGestureRef.current ? TRANSPARENT : color;
    if (tool === "line") drawLine(pixels, start.x, start.y, point.x, point.y, value);
    if (tool === "rect") {
      for (let x = Math.min(start.x, point.x); x <= Math.max(start.x, point.x); x++) { stamp(pixels, x, start.y, value); stamp(pixels, x, point.y, value); }
      for (let y = Math.min(start.y, point.y); y <= Math.max(start.y, point.y); y++) { stamp(pixels, start.x, y, value); stamp(pixels, point.x, y, value); }
    }
    if (tool === "ellipse") {
      const cx = (start.x + point.x) / 2; const cy = (start.y + point.y) / 2;
      const rx = Math.max(0.5, Math.abs(point.x - start.x) / 2); const ry = Math.max(0.5, Math.abs(point.y - start.y) / 2);
      for (let y = Math.floor(Math.min(start.y, point.y)); y <= Math.ceil(Math.max(start.y, point.y)); y++) for (let x = Math.floor(Math.min(start.x, point.x)); x <= Math.ceil(Math.max(start.x, point.x)); x++) {
        const edge = Math.abs(((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) - 1) < 0.55;
        if (edge) stamp(pixels, x, y, value);
      }
    }
    previewRef.current = pixels;
    renderCanvas();
  };

  const pointerUp = () => {
    if (!drawingRef.current) return;
    if (previewRef.current && startRef.current && (tool === "line" || tool === "rect" || tool === "ellipse")) {
      updateActiveLayer(previewRef.current);
      setStatus("Shape drawn");
    }
    drawingRef.current = false;
    startRef.current = null;
    previewRef.current = null;
    eraseGestureRef.current = false;
  };

  const undo = () => {
    const snapshot = historyRef.current.pop();
    if (!snapshot) return;
    futureRef.current.push({ frames: cloneFrames(frames), frameIndex, layerId: activeLayerId });
    setFrames(snapshot.frames); setFrameIndex(snapshot.frameIndex); setActiveLayerId(snapshot.layerId); setStatus("Undo");
  };
  const redo = () => {
    const snapshot = futureRef.current.pop();
    if (!snapshot) return;
    historyRef.current.push({ frames: cloneFrames(frames), frameIndex, layerId: activeLayerId });
    setFrames(snapshot.frames); setFrameIndex(snapshot.frameIndex); setActiveLayerId(snapshot.layerId); setStatus("Redo");
  };
  const addFrame = (duplicate = false) => {
    const id = nextId;
    const frame: Frame = duplicate
      ? { ...activeFrame, id, layers: activeFrame.layers.map((layer) => ({ ...layer, id: id * 1000 + layer.id, pixels: [...layer.pixels], name: layer.name })) }
      : makeFrame(id, dimensions.width, dimensions.height, id * 1000);
    setFrames((current) => [...current, frame]); setFrameIndex(frames.length); setActiveLayerId(frame.layers[frame.layers.length - 1].id);
    setNextId(id + 1); setStatus(duplicate ? "Frame duplicated" : "Frame added");
  };
  const removeFrame = () => {
    if (frames.length <= 1) return;
    const next = frames.filter((_, i) => i !== frameIndex);
    setFrames(next); setFrameIndex(Math.max(0, frameIndex - 1)); setActiveLayerId(next[Math.max(0, frameIndex - 1)].layers[0].id); setStatus("Frame removed");
  };
  const addLayer = () => {
    const id = nextId;
    const layer = makeLayer(id, dimensions.width, dimensions.height, "Layer " + (activeFrame.layers.length + 1));
    setFrames((current) => current.map((frame, i) => i === frameIndex ? { ...frame, layers: [...frame.layers, layer] } : frame));
    setActiveLayerId(id); setNextId(id + 1); setStatus("Layer added");
  };
  const updateLayer = (id: number, patch: Partial<Layer>) => setFrames((current) => current.map((frame, i) => i !== frameIndex ? frame : ({ ...frame, layers: frame.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer) })));
  const deleteLayer = (id: number) => {
    if (activeFrame.layers.length <= 1) return;
    const layers = activeFrame.layers.filter((layer) => layer.id !== id);
    setFrames((current) => current.map((frame, i) => i === frameIndex ? { ...frame, layers } : frame));
    if (activeLayerId === id) setActiveLayerId(layers[layers.length - 1].id);
  };
  const moveLayer = (id: number, direction: -1 | 1) => {
    const layers = [...activeFrame.layers];
    const index = layers.findIndex((layer) => layer.id === id);
    const target = index + direction;
    if (target < 0 || target >= layers.length) return;
    [layers[index], layers[target]] = [layers[target], layers[index]];
    setFrames((current) => current.map((frame, i) => i === frameIndex ? { ...frame, layers } : frame));
  };

  const exportPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width; canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = ctx.createImageData(dimensions.width, dimensions.height);
    composite.forEach((value, i) => {
      if (!value) return;
      const hex = value.replace("#", "");
      const n = Number.parseInt(hex, 16);
      image.data[i * 4] = (n >> 16) & 255; image.data[i * 4 + 1] = (n >> 8) & 255; image.data[i * 4 + 2] = n & 255; image.data[i * 4 + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);
    const link = document.createElement("a"); link.download = "panim-pixel-art.png"; link.href = canvas.toDataURL("image/png"); link.click();
    setStatus("PNG exported");
  };
  const exportPixil = () => {
    try {
      const projectFrames = frames.map((frame) => ({
        speed: frame.duration,
        selectedLayer: frame.layers.find((layer) => layer.id === activeLayerId)?.id ?? frame.layers[frame.layers.length - 1]?.id ?? 1,
        layers: frame.layers.map((layer) => {
          const bitmap = document.createElement("canvas");
          bitmap.width = dimensions.width;
          bitmap.height = dimensions.height;
          const ctx = bitmap.getContext("2d");
          if (!ctx) throw new Error("Canvas export is unavailable.");
          const image = ctx.createImageData(dimensions.width, dimensions.height);
          layer.pixels.forEach((value, i) => {
            if (!value) return;
            const n = Number.parseInt(value.slice(1), 16);
            image.data[i * 4] = (n >> 16) & 255;
            image.data[i * 4 + 1] = (n >> 8) & 255;
            image.data[i * 4 + 2] = n & 255;
            image.data[i * 4 + 3] = 255;
          });
          ctx.putImageData(image, 0, 0);
          return { id: layer.id, name: layer.name, src: bitmap.toDataURL("image/png"), opacity: layer.opacity / 100, visible: layer.visible, options: { visible: layer.visible } };
        }),
      }));
      const project = {
        application: "pixil",
        version: "2.0",
        name: documentName || "Panim Pixel Studio",
        width: dimensions.width,
        height: dimensions.height,
        currentFrame: frameIndex,
        frames: projectFrames,
        colors: { default: palette, "bottom palette": palette },
      };
      const blob = new Blob([JSON.stringify(project)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (documentName.trim() || "panim-pixel-art").replace(/[^a-z0-9-_]+/gi, "-") + ".pixil";
      link.click();
      URL.revokeObjectURL(url);
      setStatus("Pixil project exported");
    } catch (error) {
      setStatus(error instanceof Error ? "Pixil export failed: " + error.message : "Pixil export failed");
    }
  };

  const importPng = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("The PNG image could not be decoded."));
      });
      const bitmap = document.createElement("canvas");
      bitmap.width = dimensions.width;
      bitmap.height = dimensions.height;
      const ctx = bitmap.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas image import is unavailable.");
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
      const imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
      const pixels = Array(dimensions.width * dimensions.height).fill(TRANSPARENT) as string[];
      for (let i = 0; i < pixels.length; i++) {
        if (imageData.data[i * 4 + 3] < 128) continue;
        const red = imageData.data[i * 4].toString(16).padStart(2, "0");
        const green = imageData.data[i * 4 + 1].toString(16).padStart(2, "0");
        const blue = imageData.data[i * 4 + 2].toString(16).padStart(2, "0");
        pixels[i] = "#" + red + green + blue;
      }
      remember();
      updateActiveLayer(pixels);
      setDocumentName(file.name.replace(/\.png$/i, "") || "Imported PNG");
      setStatus("PNG imported into the active layer · scaled to canvas size");
    } catch (error) {
      setStatus(error instanceof Error ? "PNG import failed: " + error.message : "PNG import failed");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const saveProject = () => {
    try {
      window.localStorage.setItem("cryptopanim-pixel-studio-v1", JSON.stringify({ dimensions, frames, frameIndex, activeLayerId, nextId, palette }));
      setStatus("Project saved locally");
    } catch {
      setStatus("Save failed — local storage may be full");
    }
  };

  const exportGifFallback = () => {
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width; canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = ctx.createImageData(dimensions.width, dimensions.height);
    composite.forEach((value, i) => {
      if (!value) return;
      const n = Number.parseInt(value.slice(1), 16);
      image.data[i * 4] = (n >> 16) & 255; image.data[i * 4 + 1] = (n >> 8) & 255; image.data[i * 4 + 2] = n & 255; image.data[i * 4 + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "panim-frame.png"; link.click(); URL.revokeObjectURL(url);
      setStatus("Current frame exported as PNG");
    });
  };
  const clearLayer = () => { remember(); updateActiveLayer(Array(dimensions.width * dimensions.height).fill(TRANSPARENT)); setStatus("Layer cleared"); };

  const importPixil = async (file: File) => {
    setImporting(true);
    try {
      const raw = JSON.parse(await file.text()) as any;
      if (raw?.application !== "pixil" || !Array.isArray(raw.frames) || !raw.frames.length) throw new Error("This is not a supported Pixil project.");
      const width = Number(raw.width); const height = Number(raw.height);
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 512 || height > 512) throw new Error("Unsupported canvas dimensions.");
      let id = 1;
      const importedFrames: Frame[] = [];
      for (let fi = 0; fi < raw.frames.length; fi++) {
        const sourceFrame = raw.frames[fi]; const sourceLayers = Array.isArray(sourceFrame.layers) ? sourceFrame.layers : [];
        const layers: Layer[] = [];
        for (const sourceLayer of sourceLayers) {
          const src = typeof sourceLayer.src === "string" ? sourceLayer.src.replace(/^data:image\/png[^,]*,/i, "data:image/png;base64,") : "";
          const pixels = Array(width * height).fill(TRANSPARENT) as string[];
          if (src) {
            const image = new Image(); image.src = src;
            await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("A layer image could not be decoded.")); });
            const bitmap = document.createElement("canvas"); bitmap.width = width; bitmap.height = height;
            const ctx = bitmap.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("Canvas image decoding is unavailable.");
            ctx.clearRect(0, 0, width, height); ctx.drawImage(image, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            for (let i = 0; i < width * height; i++) {
              if (imageData.data[i * 4 + 3] < 128) continue;
              const r = imageData.data[i * 4].toString(16).padStart(2, "0");
              const g = imageData.data[i * 4 + 1].toString(16).padStart(2, "0");
              const b = imageData.data[i * 4 + 2].toString(16).padStart(2, "0");
              pixels[i] = "#" + r + g + b;
            }
          }
          const opacityValue = Number(sourceLayer.opacity ?? 1);
          layers.push({ id: id++, name: String(sourceLayer.name || ("Layer " + (layers.length + 1))), visible: sourceLayer.visible !== false && sourceLayer.options?.visible !== false, opacity: Math.round(Math.max(0, Math.min(1, opacityValue)) * 100), pixels });
        }
        if (!layers.length) layers.push(makeLayer(id++, width, height, "Layer 1"));
        importedFrames.push({ id: fi + 1, duration: Math.max(1, Number(sourceFrame.speed ?? raw.speed ?? 100)), layers });
      }
      const activeFrameIndex = Math.max(0, Math.min(importedFrames.length - 1, Number(raw.currentFrame ?? 0)));
      const selectedSourceId = Number(raw.frames[activeFrameIndex]?.selectedLayer ?? 0);
      const importedActiveLayer = importedFrames[activeFrameIndex].layers.find((layer, index) => Number((raw.frames[activeFrameIndex].layers ?? [])[index]?.id) === selectedSourceId) ?? importedFrames[activeFrameIndex].layers[importedFrames[activeFrameIndex].layers.length - 1];
      const importedPalette = raw.colors?.["bottom palette"] ?? raw.colors?.default;
      setDimensions({ width, height }); setFrames(importedFrames); setFrameIndex(activeFrameIndex); setActiveLayerId(importedActiveLayer.id); setNextId(id + 1); setDocumentName(String(raw.name || file.name.replace(/\\.pixil$/i, "")));
      if (Array.isArray(importedPalette) && importedPalette.length) setPalette(importedPalette.map((value: unknown) => { const hex = String(value).replace(/^#/, ""); return /^[0-9a-f]{6}$/i.test(hex) ? "#" + hex : "#000000"; }));
      setSelection(null); historyRef.current = []; futureRef.current = []; setStatus("Imported " + file.name + " · " + importedFrames.length + " frame(s), " + importedFrames[0].layers.length + " layers");
    } catch (error) { setStatus(error instanceof Error ? "Import failed: " + error.message : "Import failed"); }
    finally { setImporting(false); }
  };
  const resizeCanvas = (width: number, height: number) => {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 8 || height < 8 || width > 128 || height > 128) return;
    if (!window.confirm("Resize the canvas? Existing pixels will be cleared.")) return;
    const nextFrames = frames.map((frame) => ({ ...frame, layers: frame.layers.map((layer) => ({ ...layer, pixels: Array(width * height).fill(TRANSPARENT) })) }));
    setDimensions({ width, height }); setFrames(nextFrames); setSelection(null); setStatus("Canvas resized");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "Escape") {
        if (selection || drawingRef.current) {
          event.preventDefault();
          drawingRef.current = false;
          startRef.current = null;
          previewRef.current = null;
          setSelection(null);
          setStatus("Selection cancelled");
        }
        return;
      }
      const command = event.ctrlKey || event.metaKey;
      if (command && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); return; }
      if (command && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); return; }
      if (command && ["c", "x", "v"].includes(event.key.toLowerCase())) {
        if (event.key.toLowerCase() === "v") {
          const clipboard = clipboardRef.current;
          if (!clipboard) return;
          event.preventDefault();
          const originX = selection?.x ?? 0;
          const originY = selection?.y ?? 0;
          const pixels = [...activeLayer.pixels];
          let copiedWidth = 0;
          let copiedHeight = 0;
          for (let y = 0; y < clipboard.height; y++) {
            for (let x = 0; x < clipboard.width; x++) {
              const targetX = originX + x;
              const targetY = originY + y;
              if (targetX < 0 || targetY < 0 || targetX >= dimensions.width || targetY >= dimensions.height) continue;
              pixels[pixelIndex(targetX, targetY, dimensions.width)] = clipboard.pixels[y * clipboard.width + x];
              copiedWidth = Math.max(copiedWidth, x + 1);
              copiedHeight = Math.max(copiedHeight, y + 1);
            }
          }
          if (copiedWidth && copiedHeight) {
            remember();
            updateActiveLayer(pixels);
            setSelection({ x: originX, y: originY, w: Math.min(copiedWidth, dimensions.width - originX), h: Math.min(copiedHeight, dimensions.height - originY) });
            setStatus("Selection pasted");
          }
          return;
        }
        if (!selection) return;
        event.preventDefault();
        const copiedPixels: string[] = [];
        for (let y = 0; y < selection.h; y++) {
          for (let x = 0; x < selection.w; x++) {
            const sx = selection.x + x;
            const sy = selection.y + y;
            copiedPixels.push(sx >= 0 && sy >= 0 && sx < dimensions.width && sy < dimensions.height ? activeLayer.pixels[pixelIndex(sx, sy, dimensions.width)] : TRANSPARENT);
          }
        }
        clipboardRef.current = { width: selection.w, height: selection.h, pixels: copiedPixels };
        if (event.key.toLowerCase() === "x") {
          remember();
          const pixels = [...activeLayer.pixels];
          for (let y = selection.y; y < selection.y + selection.h; y++) for (let x = selection.x; x < selection.x + selection.w; x++) if (x >= 0 && y >= 0 && x < dimensions.width && y < dimensions.height) pixels[pixelIndex(x, y, dimensions.width)] = TRANSPARENT;
          updateActiveLayer(pixels);
          setStatus("Selection cut");
        } else setStatus("Selection copied");
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selection) {
        event.preventDefault();
        remember();
        const pixels = [...activeLayer.pixels];
        for (let y = selection.y; y < selection.y + selection.h; y++) for (let x = selection.x; x < selection.x + selection.w; x++) if (x >= 0 && y >= 0 && x < dimensions.width && y < dimensions.height) pixels[pixelIndex(x, y, dimensions.width)] = TRANSPARENT;
        updateActiveLayer(pixels);
        setStatus("Selection cleared");
        return;
      }
      if (!command && event.key.toLowerCase() === "x") { event.preventDefault(); setColor((primary) => { setSecondaryColor(primary); return secondaryColor; }); return; }
      const keyTools: Record<string, Tool> = { p: "pencil", b: "fill", e: "eraser", v: "eyedropper", l: "line", r: "rect", c: "ellipse", s: "select", t: "text" };
      if (keyTools[event.key.toLowerCase()]) setTool(keyTools[event.key.toLowerCase()]);
      if (event.key === "[") setBrushSize((size) => Math.max(1, size - 1));
      if (event.key === "]") setBrushSize((size) => Math.min(8, size + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const toolGroups = ["DRAW", "SHAPES", "EDIT"];
  return (
    <main className={styles.studio}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/velozart">Panim Pixel Studio</a>
      </header>
      <section className={styles.workspace}>
        <aside className={styles.toolRail} aria-label="Drawing tools">
          {toolGroups.map((group) => <div className={styles.toolGroup} key={group}><span className={styles.groupLabel}>{group}</span>
            {TOOL_LIST.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} className={tool === item.id ? styles.activeTool : styles.toolButton} onClick={() => setTool(item.id)} title={item.label} aria-label={item.label}><span>{item.icon}</span><small>{item.label.split(" (")[0]}</small></button>)}
          </div>)}
          <div className={styles.toolOptions}>
            <label>BRUSH <strong>{brushSize}px</strong><input type="range" min="1" max="8" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} /></label>
            <label className={styles.check}><input type="checkbox" checked={symmetry} onChange={(e) => setSymmetry(e.target.checked)} /> Mirror</label>
            <label className={styles.check}><input type="checkbox" checked={dither} onChange={(e) => setDither(e.target.checked)} /> Dither</label>
            <label className={styles.check}><input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} /> Grid</label>
          </div>
        </aside>
        <section className={styles.canvasArea} aria-label="Pixel canvas">
          <div className={styles.canvasToolbar}>
            <span>CANVAS <b>{dimensions.width} × {dimensions.height}</b></span>
        <div className={styles.fileToolbar} role="toolbar" aria-label="Project tools">
          <label className={styles.iconTool} title={importing ? "Importing project…" : "Import .pixil"} aria-label="Import .pixil" style={{ cursor: importing ? "wait" : "pointer" }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h4M12 17V10m-3 3 3-3 3 3" /></svg>
            <input type="file" accept=".pixil,application/json" disabled={importing} onChange={(event) => { const file = event.target.files?.[0]; if (file) void importPixil(file); event.currentTarget.value = ""; }} />
          </label>
          <button type="button" className={styles.iconTool} onClick={exportPixil} title="Export .pixil" aria-label="Export .pixil">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4M12 10v7m-3-3 3 3 3-3" /></svg>
          </button>
          <button type="button" className={styles.iconTool} onClick={exportPng} title="Export PNG" aria-label="Export PNG">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM7 16l4-4 3 3 2-2 2 3M8 8h.01" /><path d="M12 2v6m-3-3 3 3 3-3" /></svg>
          </button>
          <label className={styles.iconTool} title="Import PNG" aria-label="Import PNG">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM7 16l4-4 3 3 2-2 2 3M8 8h.01" /><path d="M12 2v6m-3-3 3 3 3-3" /></svg>
            <input ref={pngInputRef} type="file" accept="image/png,.png" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importPng(file); event.currentTarget.value = ""; }} />
          </label>
          <button type="button" className={styles.iconTool} onClick={saveProject} title="Save project" aria-label="Save project">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h14l3 3v15H4zM8 3v6h8V3M8 21v-8h8v8" /></svg>
          </button>
          <span className={styles.toolbarDivider} aria-hidden="true" />
          <button type="button" className={styles.iconTool} onClick={undo} title="Undo (Ctrl+Z)" aria-label="Undo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h9a6 6 0 0 1 6 6" /></svg>
          </button>
          <button type="button" className={styles.iconTool} onClick={redo} title="Redo (Ctrl+Y)" aria-label="Redo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 7 5 5-5 5m5-5h-9a6 6 0 0 0-6 6" /></svg>
          </button>
        </div>
            <div className={styles.canvasControls}>
              <button type="button" onClick={() => setZoom((v) => Math.max(4, v - 2))}>−</button><span>{Math.round(zoom / 12 * 100)}%</span><button type="button" onClick={() => setZoom((v) => Math.min(28, v + 2))}>+</button>
              <button type="button" onClick={() => setOnionSkin((v) => !v)} className={onionSkin ? styles.toggled : ""}>Onion skin</button>
            </div>
          </div>
          <div className={styles.canvasScroller} ref={canvasScrollerRef}>
            <div className={styles.canvasChecker} style={{
              width: dimensions.width * zoom,
              height: dimensions.height * zoom,
              backgroundSize: `${zoom * 2}px ${zoom * 2}px`,
              backgroundPosition: `0 0, 0 ${zoom}px, ${zoom}px -${zoom}px, -${zoom}px 0`,
            }}>
              <canvas ref={canvasRef} style={{ width: dimensions.width * zoom, height: dimensions.height * zoom, imageRendering: "pixelated", touchAction: "none" }} onContextMenu={(event) => event.preventDefault()} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />
            </div>
          </div>
          <footer className={styles.canvasFooter}><span>{status}</span><span>{tool.toUpperCase()} · {color.toUpperCase()}</span><span>PIXEL PERFECT MODE</span></footer>
          <div className={styles.timeline}>
            <div className={styles.panelHeading}><div><span className={styles.panelIcon}>▤</span><strong>ANIMATION TIMELINE</strong><small>{frames.length} FRAME{frames.length === 1 ? "" : "S"}</small></div><div className={styles.panelActions}><button type="button" onClick={() => setPlaying((v) => !v)}>{playing ? "Ⅱ Pause" : "▶ Play"}</button><button type="button" onClick={() => addFrame(false)}>＋ Frame</button><button type="button" onClick={() => addFrame(true)}>⧉ Duplicate</button><button type="button" onClick={removeFrame} disabled={frames.length <= 1}>−</button></div></div>
            <div className={styles.frameStrip}>{frames.map((frame, index) => <button type="button" key={frame.id} onClick={() => { setFrameIndex(index); setActiveLayerId(frame.layers[frame.layers.length - 1].id); }} className={index === frameIndex ? styles.activeFrame : styles.frameButton}><span className={styles.frameMini}>{frame.layers.filter((layer) => layer.visible).flatMap((layer) => layer.pixels).some(Boolean) ? "▦" : "＋"}</span><span>F{index + 1}</span><small>{frame.duration}ms</small></button>)}</div>
            <label className={styles.duration}>FRAME DURATION <input type="number" min="40" max="2000" step="20" value={activeFrame.duration} onChange={(e) => setFrames((current) => current.map((frame, i) => i === frameIndex ? { ...frame, duration: Math.max(40, Number(e.target.value)) } : frame))} /> ms</label>
          </div>
        </section>
        <aside className={styles.properties}>
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.panelIcon}>◈</span><strong>COLOR LAB</strong></div><button type="button" onClick={() => setPalette((p) => [...p, color])} title="Add current color to palette">＋</button></div>
            <div className={styles.colorControls}><div className={styles.colorSwatches} aria-label="Primary and secondary colors"><HexColorPicker value={color} onChange={setColor} label="Primary" swatchClass={styles.primaryColor} /><HexColorPicker value={secondaryColor} onChange={setSecondaryColor} label="Secondary" swatchClass={styles.secondaryColor} /><button type="button" className={styles.swapColors} onClick={() => { setColor(secondaryColor); setSecondaryColor(color); }} title="Swap primary and secondary colors (X)">⇄</button><button type="button" className={styles.defaultColors} onClick={() => { setColor("#000000"); setSecondaryColor("#ffffff"); }} title="Reset colors to black and white">↖</button></div></div>
            <div className={styles.swatches}>{palette.map((swatch, i) => <button type="button" key={swatch + i} title={`${swatch} · Left-click to select · Right-click to remove`} style={{ background: swatch }} className={color === swatch ? styles.selectedSwatch : ""} onClick={() => setColor(swatch)} onContextMenu={(event) => { event.preventDefault(); setPalette((current) => current.filter((_, index) => index !== i)); setStatus(`Removed color ${swatch.toUpperCase()} from palette`); }} />)}</div>
            
            <button type="button" className={styles.fullButton} onClick={() => setPalette(DEFAULT_PALETTE)}>Reset default palette</button>
          </section>
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.panelIcon}>▧</span><strong>LAYERS</strong></div><button type="button" onClick={addLayer}>＋ Add</button></div>
            <div className={styles.layerList}>{[...activeFrame.layers].reverse().map((layer) => <div key={layer.id} className={layer.id === activeLayerId ? styles.activeLayer : styles.layerRow}>
              <button type="button" className={styles.visibility} onClick={() => updateLayer(layer.id, { visible: !layer.visible })}>{layer.visible ? "◉" : "○"}</button>
              <LayerThumbnail pixels={layer.pixels} width={dimensions.width} height={dimensions.height} /><button type="button" className={styles.layerName} onClick={() => setActiveLayerId(layer.id)} onDoubleClick={() => { const name = window.prompt("Layer name", layer.name); if (name?.trim()) updateLayer(layer.id, { name: name.trim() }); }} title="Click to select · double-click to rename">{layer.name}</button>
              <button type="button" className={styles.layerMove} onClick={() => moveLayer(layer.id, 1)} title="Move layer up">↑</button><button type="button" className={styles.layerMove} onClick={() => moveLayer(layer.id, -1)} title="Move layer down">↓</button>
              <button type="button" className={styles.layerMove} onClick={() => deleteLayer(layer.id)} title="Delete layer" disabled={activeFrame.layers.length <= 1}>×</button>
              <input aria-label={layer.name + " opacity"} type="range" min="0" max="100" value={layer.opacity} onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })} />
            </div>)}</div>
          </section>
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.panelIcon}>⚙</span><strong>DOCUMENT</strong></div></div>
            <div className={styles.dimensionFields}><label>WIDTH<input type="number" min="8" max="128" defaultValue={dimensions.width} key={"w" + dimensions.width} id="studio-width" /></label><span>×</span><label>HEIGHT<input type="number" min="8" max="128" defaultValue={dimensions.height} key={"h" + dimensions.height} id="studio-height" /></label></div>
            <button type="button" className={styles.fullButton} onClick={() => resizeCanvas(Number((document.getElementById("studio-width") as HTMLInputElement)?.value), Number((document.getElementById("studio-height") as HTMLInputElement)?.value))}>Resize canvas</button>
            <button type="button" className={styles.dangerButton} onClick={clearLayer}>Clear active layer</button>
            <button type="button" className={styles.fullButton} onClick={exportGifFallback}>Export frame PNG</button>
          </section>
        </aside>
      </section>
      <footer className={styles.bottomBar}><span>✦ PANIM PIXEL STUDIO</span><span>DRAW · ANIMATE · CREATE</span><span>YOUR ART STAYS IN YOUR BROWSER</span></footer>
    </main>
  );
}
