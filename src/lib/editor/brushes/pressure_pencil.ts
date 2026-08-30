import { fabric } from "../fabric_loader"
import type { PointerSample } from '../types';

const PRESSURE_MIN_FACTOR = 0.35
const PRESSURE_MAX_FACTOR = 1.85

export function createPressurePencilBrush(
  targetCanvas: fabric.Canvas,
  getBaseSize: () => number,
  getLastPointerSample: () => PointerSample | null,
  debugLog?: (...args: unknown[]) => void
): fabric.PencilBrush {
  class PressurePencilBrush extends fabric.PencilBrush {
    getBaseSize: () => number

    constructor(canvas: fabric.Canvas, getBaseSizeFn: () => number) {
      super(canvas)
      this.getBaseSize = getBaseSizeFn
    }

    updateWidthFromEvent(event?: fabric.IEvent<MouseEvent> | PointerSample) {
      const base = this.getBaseSize()
      const lastSample = getLastPointerSample()
      const source =
        event && "pointerType" in event
          ? event
          : event?.e
            ? {
                pointerType: (event.e as PointerEvent).pointerType || "none",
                pressure:
                  typeof (event.e as PointerEvent).pressure === "number"
                    ? (event.e as PointerEvent).pressure
                    : null
              }
            : lastSample
      const pointerType = source?.pointerType || "none"
      const pressureValue =
        typeof source?.pressure === "number" ? source.pressure : null
      const isPenPointer = pointerType === "pen"

      if (isPenPointer && pressureValue !== null && pressureValue > 0) {
        const pressure = Math.max(0, Math.min(1, pressureValue))
        const pressureFactor =
          PRESSURE_MIN_FACTOR + (PRESSURE_MAX_FACTOR - PRESSURE_MIN_FACTOR) * pressure
        this.width = Math.max(1, base * pressureFactor)
        return {
          usedPressure: true,
          pressure,
          width: this.width,
          pointerType,
          source: event && "e" in event ? "fabric-event" : "dom-fallback"
        }
      }
      if (pressureValue !== null) {
        this.width = base
        return {
          usedPressure: false,
          pressure: pressureValue,
          width: this.width,
          pointerType,
          source: event && "e" in event ? "fabric-event" : "dom-fallback"
        }
      }
      this.width = base
      return {
        usedPressure: false,
        pressure: null,
        width: this.width,
        pointerType: "none",
        source: "none"
      }
    }

    onMouseDown(pointer: fabric.Point, options?: fabric.IEvent<MouseEvent>) {
      const result = this.updateWidthFromEvent(options)
      debugLog?.("stroke-start", {
        pointerType: result.pointerType,
        pressure: result.pressure,
        usedPressure: result.usedPressure,
        source: result.source,
        computedWidth: Number(result.width.toFixed(2)),
        baseBrushSize: this.getBaseSize()
      })
      super.onMouseDown(pointer, options)
    }

    onMouseMove(pointer: fabric.Point, options?: fabric.IEvent<MouseEvent>) {
      this.updateWidthFromEvent(options)
      super.onMouseMove(pointer, options)
    }
  }

  return new PressurePencilBrush(targetCanvas, getBaseSize)
}

export const PRESSURE_DEBUG_INFO = {
  minFactor: PRESSURE_MIN_FACTOR,
  maxFactor: PRESSURE_MAX_FACTOR
}
