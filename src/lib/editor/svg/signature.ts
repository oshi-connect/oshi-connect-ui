import { fabric } from "../fabric_loader"

const isWhiteFill = (fill: unknown): boolean => {
  if (typeof fill !== "string") return false
  const f = fill.toLowerCase().replace(/\s+/g, "")
  return (
    f === "#fff" ||
    f === "#ffffff" ||
    f === "white" ||
    f === "rgb(255,255,255)" ||
    f === "rgba(255,255,255,1)"
  )
}

export function stripBackgroundRect(objects: fabric.Object[]): fabric.Object[] {
  return objects.filter((obj) => {
    if (!obj || obj.type !== "rect") return true
    const nearOrigin = Math.abs(obj.left || 0) < 1 && Math.abs(obj.top || 0) < 1
    return !(nearOrigin && isWhiteFill(obj.fill))
  })
}

export function svgHasNeonGlow(svg: string): boolean {
  return typeof svg === "string" && svg.includes("feGaussianBlur")
}

export function reapplyNeonGlow(
  group: fabric.Group,
  svg: string,
  color?: string
): void {
  if (!svgHasNeonGlow(svg)) return
  group.set(
    "shadow",
    new fabric.Shadow({
      color: color || '#e85d9a',
      blur: 16,
      offsetX: 0,
      offsetY: 0
    })
  )
}

export function loadSvgOntoCanvas(
  canvas: fabric.Canvas,
  svg: string,
  color: string | undefined,
  options: {
    left?: number
    top?: number
    originX?: string
    originY?: string
    selectable?: boolean
    evented?: boolean
    scaleToWidth?: number
    center?: boolean
    onAdded?: (group: fabric.Group) => void
  } = {}
): void {
  fabric.loadSVGFromString(svg, (objects, svgOptions) => {
    const cleaned = stripBackgroundRect(objects)
    if (cleaned.length === 0) return
    const group = fabric.util.groupSVGElements(cleaned, svgOptions)

    if (options.scaleToWidth) {
      group.scaleToWidth(options.scaleToWidth)
    }

    if (options.center) {
      const maxWidth = canvas.getWidth() * 0.85
      const maxHeight = canvas.getHeight() * 0.85
      if (group.width! * group.scaleX! > maxWidth) group.scaleToWidth(maxWidth)
      if (group.height! * group.scaleY! > maxHeight) group.scaleToHeight(maxHeight)
      group.set({
        left: (canvas.getWidth() - group.width! * group.scaleX!) / 2,
        top: (canvas.getHeight() - group.height! * group.scaleY!) / 2
      })
    } else if (options.left !== undefined && options.top !== undefined) {
      group.set({
        left: options.left,
        top: options.top,
        originX: options.originX || "center",
        originY: options.originY || "center"
      })
    }

    group.set({
      selectable: options.selectable ?? false,
      evented: options.evented ?? false,
      ...(options.selectable
        ? {
            cornerStyle: "circle",
            transparentCorners: false,
            lockUniScaling: true
          }
        : {})
    })

    reapplyNeonGlow(group, svg, color)
    canvas.add(group)
    options.onAdded?.(group)
    canvas.renderAll()
  })
}
