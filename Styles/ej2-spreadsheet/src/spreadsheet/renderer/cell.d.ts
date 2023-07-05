import { Spreadsheet } from '../base/index';
import { ICellRenderer, CellRenderArgs } from '../common/index';
/**
 * CellRenderer class which responsible for building cell content.
 *
 * @hidden
 */
export declare class CellRenderer implements ICellRenderer {
    private parent;
    private element;
    private th;
    private tableRow;
    constructor(parent?: Spreadsheet);
    renderColHeader(index: number, row: Element, refChild?: Element): void;
    renderRowHeader(index: number, row: Element, refChild?: Element): void;
    render(args: CellRenderArgs): Element;
    private setWrapByValue;
    private update;
    private applyStyle;
    private createImageAndChart;
    private calculateFormula;
    private checkMerged;
    private mergeFreezeRow;
    private updateSpanTop;
    private mergeFreezeCol;
    private updateColZIndex;
    private updateSelectAllZIndex;
    private updatedHeaderZIndex;
    private updateRowZIndex;
    private processTemplates;
    private compileCellTemplate;
    private getRowHeightOnInit;
    private removeStyle;
    /**
     * @hidden
     * @param {number[]} range - Specifies the range.
     * @param {boolean} refreshing - Specifies the refresh.
     * @param {boolean} checkWrap - Specifies the range.
     * @param {boolean} checkHeight - Specifies the checkHeight.
     * @param {boolean} checkCF - Specifies the check for conditional format.
     * @param {boolean} skipFormatCheck - Specifies whether to skip the format checking while applying the number format.
     * @returns {void}
     */
    refreshRange(range: number[], refreshing?: boolean, checkWrap?: boolean, checkHeight?: boolean, checkCF?: boolean, skipFormatCheck?: boolean): void;
    refresh(rowIdx: number, colIdx: number, lastCell?: boolean, element?: Element, checkCF?: boolean, checkWrap?: boolean, skipFormatCheck?: boolean, isRandomFormula?: boolean): void;
    private updateView;
    /**
     * Removes the added event handlers and clears the internal properties of CellRenderer module.
     *
     * @returns {void}
     */
    destroy(): void;
}
