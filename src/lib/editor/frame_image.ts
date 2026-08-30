import { fabric } from "./fabric_loader"
import type { FabricObjectWithFrame } from "./types"

interface FrameImageOptions {
  fitRatio?: number
  replaceExisting?: boolean
  selectable?: boolean
}

export function loadFrameImageOntoCanvas(
  canvas: fabric.Canvas,
  img: HTMLImageElement,
  options: FrameImageOptions = {}
): fabric.Image {
  if (options.replaceExisting ?? true) {
    canvas
      .getObjects()
      .filter((obj) => (obj as FabricObjectWithFrame).isFrame)
      .forEach((obj) => canvas.remove(obj))
  }

  const fitRatio = options.fitRatio ?? 0.9
  const scale =
    Math.min(canvas.getWidth() / img.width, canvas.getHeight() / img.height) *
    fitRatio
  const selectable = options.selectable ?? true
  const frame = new fabric.Image(img, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
    selectable,
    evented: selectable,
    cornerStyle: "circle",
    transparentCorners: false,
    lockUniScaling: true
  }) as fabric.Image & FabricObjectWithFrame

  frame.isFrame = true
  canvas.add(frame)
  canvas.sendToBack(frame)
  canvas.setActiveObject(frame)
  canvas.isDrawingMode = false
  canvas.renderAll()

  return frame
}
