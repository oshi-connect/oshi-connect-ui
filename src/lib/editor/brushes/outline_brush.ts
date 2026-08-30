import { fabric } from "../fabric_loader"

const OUTLINE_COLOR = "#ffffff"
const outlinePadding = (coreWidth: number) => Math.max(3, coreWidth * 0.7)

export function applyOutlineBrush(
  brush: fabric.PencilBrush,
  isOutline: () => boolean
): void {
  const baseRender = fabric.PencilBrush.prototype._render
  const baseNeedsFullRender = fabric.PencilBrush.prototype.needsFullRender
  const baseCreatePath = fabric.PencilBrush.prototype.createPath

  brush.needsFullRender = function (this: fabric.PencilBrush) {
    return isOutline() ? true : baseNeedsFullRender.call(this)
  }

  brush._render = function (this: fabric.PencilBrush, ctx?: CanvasRenderingContext2D) {
    ctx = ctx || this.canvas!.contextTop
    if (!isOutline()) {
      baseRender.call(this, ctx)
      return
    }
    const coreWidth = this.width
    ctx.strokeStyle = OUTLINE_COLOR
    ctx.lineWidth = coreWidth + outlinePadding(coreWidth) * 2
    baseRender.call(this, ctx)
    ctx.strokeStyle = this.color
    ctx.lineWidth = coreWidth
    baseRender.call(this, ctx)
  }

  brush.createPath = function (this: fabric.PencilBrush, pathData: string) {
    const core = baseCreatePath.call(this, pathData)
    if (!isOutline()) return core
    const coreWidth = core.strokeWidth!
    const white = new fabric.Path(pathData, {
      fill: null,
      stroke: OUTLINE_COLOR,
      strokeWidth: coreWidth + outlinePadding(coreWidth) * 2,
      strokeLineCap: this.strokeLineCap,
      strokeMiterLimit: this.strokeMiterLimit,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray,
      objectCaching: false
    })
    core.set("objectCaching", false)
    return new fabric.Group([white, core], {
      selectable: false,
      evented: false,
      objectCaching: false
    })
  }
}
