import { Component, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";
import type Konva from "konva";
import {
  SPINE_REGIONS,
  VERTEBRA_HEIGHT,
  VERTEBRA_WIDTH,
  CANVAS_HEIGHT,
} from "@/lib/spineConfig";
import { TechniquePopover } from "./TechniquePopover";
import { SpineMapFallback } from "./SpineMapFallback";
import type { SpineMapData, SpineMapTechnique, TechniqueOption } from "@/types/spineMap";

interface SpineMapCanvasProps {
  selected: string[];
  techniques: SpineMapTechnique[];
  onChange: (data: SpineMapData) => void;
  readOnly?: boolean;
  width?: number;
}

interface PopoverState {
  vertebra: string;
  x: number;
  y: number;
}

interface VertebraRectProps {
  vertebra: string;
  x: number;
  y: number;
  isSelected: boolean;
  readOnly: boolean;
  onClick: (vertebra: string, konvaX: number, konvaY: number) => void;
}

function VertebraRect({ vertebra, x, y, isSelected, readOnly, onClick }: VertebraRectProps) {
  const [hovered, setHovered] = useState(false);

  const fillColor = isSelected
    ? "#3b82f6"
    : hovered
      ? "#dbeafe"
      : "#f1f5f9";

  const strokeColor = isSelected
    ? "#1d4ed8"
    : hovered
      ? "#93c5fd"
      : "#cbd5e1";

  const textColor = isSelected ? "#ffffff" : "#374151";

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={() => { if (!readOnly) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!readOnly) onClick(vertebra, x, y); }}
    >
      <Rect
        width={VERTEBRA_WIDTH}
        height={VERTEBRA_HEIGHT}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
        cornerRadius={3}
      />
      <Text
        text={vertebra}
        width={VERTEBRA_WIDTH}
        height={VERTEBRA_HEIGHT}
        align="center"
        verticalAlign="middle"
        fontSize={11}
        fill={textColor}
      />
    </Group>
  );
}

interface SpineMapCanvasInnerProps extends SpineMapCanvasProps {
  canvasWidth: number;
}

function SpineMapCanvasInner({
  selected,
  techniques,
  onChange,
  readOnly = false,
  canvasWidth,
}: SpineMapCanvasInnerProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const paddingX = (canvasWidth - VERTEBRA_WIDTH) / 2;

  function handleVertebraClick(vertebra: string, _konvaX: number, konvaY: number) {
    if (!stageRef.current) return;

    const container = stageRef.current.container();
    const rect = container.getBoundingClientRect();

    const stageScale = stageRef.current.scaleX();
    const stageY = stageRef.current.y();

    const viewportX = rect.left + paddingX * stageScale;
    const viewportY = rect.top + (konvaY + stageY) * stageScale + VERTEBRA_HEIGHT * stageScale;

    setPopover({ vertebra, x: viewportX, y: viewportY });
  }

  function handleSelect(vertebra: string, technique: TechniqueOption, notes?: string) {
    const alreadySelected = selected.includes(vertebra);
    const newAdjusted = alreadySelected ? selected : [...selected, vertebra];

    const existingIndex = techniques.findIndex((t) => t.vertebra === vertebra);
    const newEntry: SpineMapTechnique = { vertebra, technique, ...(notes ? { notes } : {}) };

    const newTechniques =
      existingIndex >= 0
        ? techniques.map((t, i) => (i === existingIndex ? newEntry : t))
        : [...techniques, newEntry];

    onChange({ adjusted: newAdjusted, techniques: newTechniques });
  }

  function handleDeselect(vertebra: string) {
    onChange({
      adjusted: selected.filter((v) => v !== vertebra),
      techniques: techniques.filter((t) => t.vertebra !== vertebra),
    });
  }

  const labelFontSize = 10;
  const labelHeight = 14;

  return (
    <div className="relative inline-block">
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={CANVAS_HEIGHT}
        listening={!readOnly}
        pixelRatio={window.devicePixelRatio}
      >
        <Layer>
          {SPINE_REGIONS.map((region) => {
            const regionStartY = region.startY;

            return (
              <Group key={region.name}>
                <Text
                  x={paddingX}
                  y={regionStartY}
                  text={region.label}
                  fontSize={labelFontSize}
                  fontStyle="bold"
                  fill="#6b7280"
                  width={VERTEBRA_WIDTH}
                  align="left"
                />
                {region.vertebrae.map((vertebra, index) => (
                  <VertebraRect
                    key={vertebra}
                    vertebra={vertebra}
                    x={paddingX}
                    y={regionStartY + labelHeight + index * (VERTEBRA_HEIGHT + 2)}
                    isSelected={selected.includes(vertebra)}
                    readOnly={readOnly}
                    onClick={handleVertebraClick}
                  />
                ))}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {popover && (
        <TechniquePopover
          vertebra={popover.vertebra}
          technique={techniques.find((t) => t.vertebra === popover.vertebra)?.technique}
          anchorPosition={{ x: popover.x, y: popover.y }}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SpineMapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Konva failure captured silently — fallback renders
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function SpineMapCanvas({ selected, techniques, onChange, readOnly, width }: SpineMapCanvasProps) {
  const canvasWidth = width ?? 200;

  return (
    <SpineMapErrorBoundary
      fallback={
        <SpineMapFallback
          selected={selected}
          techniques={techniques}
          onChange={onChange}
          readOnly={readOnly}
        />
      }
    >
      <SpineMapCanvasInner
        selected={selected}
        techniques={techniques}
        onChange={onChange}
        readOnly={readOnly}
        canvasWidth={canvasWidth}
      />
    </SpineMapErrorBoundary>
  );
}
