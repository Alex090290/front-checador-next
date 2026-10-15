// Tipos mínimos de d3-org-chart@3.1.1 (la librería no trae los suyos). Solo lo que usa el organigrama.
declare module "d3-org-chart" {
  export interface OrgChartNode<T> {
    data: T & {
      _expanded?: boolean;
      _highlighted?: boolean;
      _upToTheRootHighlighted?: boolean;
      _directSubordinates?: number;
      _directSubordinatesPaging?: number;
      _totalSubordinates?: number;
    };
    children?: OrgChartNode<T>[];
    _children?: OrgChartNode<T>[];
    depth: number;
    width: number;
    height: number;
  }

  export class OrgChart<T = unknown> {
    container(container: HTMLElement | string): this;
    data(data: T[]): this;
    nodeId(fn: (d: T) => string): this;
    parentNodeId(fn: (d: T) => string | null): this;
    nodeWidth(fn: (d: OrgChartNode<T>) => number): this;
    nodeHeight(fn: (d: OrgChartNode<T>) => number): this;
    childrenMargin(fn: (d: OrgChartNode<T>) => number): this;
    compactMarginBetween(fn: (d: OrgChartNode<T>) => number): this;
    compactMarginPair(fn: (d: OrgChartNode<T>) => number): this;
    siblingsMargin(fn: (d: OrgChartNode<T>) => number): this;
    nodeContent(fn: (d: OrgChartNode<T>) => string): this;
    buttonContent(fn: (params: { node: OrgChartNode<T>; state: unknown }) => string): this;
    nodeUpdate(fn: (this: SVGGElement, d: OrgChartNode<T>) => void): this;
    linkUpdate(fn: (this: SVGPathElement, d: OrgChartNode<T>) => void): this;
    svgHeight(height: number): this;
    imageName(name: string): this;
    render(): this;
    fit(options?: { animate?: boolean; scale?: boolean }): this;
    expandAll(): this;
    collapseAll(): this;
    setCentered(nodeId: string): this;
    setHighlighted(nodeId: string): this;
    clearHighlighting(): this;
    exportImg(options?: { full?: boolean; scale?: number; backgroundColor?: string; save?: boolean }): void;
    zoomTreeBounds(bounds: {
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      params?: { animate?: boolean; scale?: boolean };
    }): void;
    getChartState(): unknown;
  }
}
