import { Spreadsheet } from '../base/index';
/**
 * Represents selection support for Spreadsheet.
 */
export declare class Selection {
    private parent;
    private startCell;
    private isRowSelected;
    private isColSelected;
    private scrollInterval;
    private touchEvt;
    private mouseMoveEvt;
    private uniqueOBracket;
    private uniqueCBracket;
    private uniqueCSeparator;
    private uniqueCOperator;
    private uniquePOperator;
    private uniqueSOperator;
    private uniqueMOperator;
    private uniqueDOperator;
    private uniqueModOperator;
    private uniqueConcateOperator;
    private uniqueEqualOperator;
    private uniqueExpOperator;
    private uniqueGTOperator;
    private uniqueLTOperator;
    private invalidOperators;
    private formulaRange;
    private tableRangesFormula;
    private dStartCell;
    private dEndCell;
    private touchSelectionStarted;
    private isautoFillClicked;
    dAutoFillCell: string;
    /**
     * Constructor for the Spreadsheet selection module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet selection module.
     * @private
     */
    constructor(parent: Spreadsheet);
    private addEventListener;
    private removeEventListener;
    private isTouchSelectionStarted;
    private rowHeightChanged;
    private colWidthChanged;
    private selectRange;
    private init;
    private selectMultiRange;
    private createSelectionElement;
    private mouseDownHandler;
    private mouseMoveHandler;
    private mouseUpHandler;
    private isSelected;
    private virtualContentLoadedHandler;
    private clearInterval;
    private getScrollLeft;
    private cellNavigateHandler;
    private getColIdxFromClientX;
    private isScrollableArea;
    private getRowIdxFromClientY;
    private initFormulaReferenceIndicator;
    private selectRangeByIdx;
    private isRowColSelected;
    private updateActiveCell;
    private getOffset;
    private getSelectionElement;
    private getActiveCell;
    private getSheetElement;
    private highlightHdr;
    private protectHandler;
    private initiateFormulaSelection;
    private processFormulaEditRange;
    private updateFormulaEditRange;
    private chartBorderHandler;
    private focusBorder;
    private getEleFromRange;
    private getRowCells;
    private merge;
    private clearBorder;
    private parseFormula;
    private isUniqueChar;
    private getUniqueCharVal;
    private markSpecialChar;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Get the module name.
     */
    protected getModuleName(): string;
    destroy(): void;
}
