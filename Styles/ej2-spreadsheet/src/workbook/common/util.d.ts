import { CellModel, ColumnModel, SheetModel, Workbook, CellStyleModel } from './../index';
import { CellUpdateArgs } from './index';
import { InsertDeleteModelArgs, ConditionalFormat, ConditionalFormatModel } from './index';
import { VisibleMergeIndexArgs } from './../index';
/**
 * Check whether the text is formula or not.
 *
 * @param {string} text - Specify the text.
 * @param {boolean} isEditing - Specify the isEditing.
 * @returns {boolean} - Check whether the text is formula or not.
 */
export declare function checkIsFormula(text: string, isEditing?: boolean): boolean;
/**
 * Check whether the value is cell reference or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 */
export declare function isCellReference(value: string): boolean;
/**
 * Check whether the value is character or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 */
export declare function isChar(value: string): boolean;
/**
 * Check whether the range selection is on complete row.
 *
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number[]} range - Specify the range index.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export declare function isRowSelected(sheet: SheetModel, range: number[]): boolean;
/**
 * Check whether the range selection is on complete column.
 *
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number[]} range - Specify the range index.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export declare function isColumnSelected(sheet: SheetModel, range: number[]): boolean;
/**
 * @param {number[]} range - Specify the range
 * @param {number} rowIdx - Specify the row index
 * @param {number} colIdx - Specify the col index
 * @returns {boolean} - Returns boolean value
 */
export declare function inRange(range: number[], rowIdx: number, colIdx: number): boolean;
/**
 * @param {number[]} address - Specify the address
 * @param {number} rowIdx - Specify the row index
 * @param {number} colIdx - Specify the col index
 * @returns {boolean} - Returns boolean value
 */
export declare function isInMultipleRange(address: string, rowIdx: number, colIdx: number): boolean;
/** @hidden
 * @param {number[]} range - Specify the range
 * @param {number[]} testRange - Specify the test range
 * @param {boolean} isModify - Specify the boolean value
 * @returns {boolean} - Returns boolean value
 */
export declare function isInRange(range: number[], testRange: number[], isModify?: boolean): boolean;
/**
 * @hidden
 * @param {string} address - Specifies the address for whole column.
 * @param {number[]} testRange - Specifies range used to split the address.
 * @param {number} colIdx - Specifies the column index.
 * @returns {string} - returns the modified address.
 */
export declare function getSplittedAddressForColumn(address: string, testRange: number[], colIdx: number): string;
/**
 * Check whether the cell is locked or not
 *
 * @param {CellModel} cell - Specify the cell.
 * @param {ColumnModel} column - Specify the column.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export declare function isLocked(cell: CellModel, column: ColumnModel): boolean;
/**
 * Check whether the value is cell reference or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export declare function isValidCellReference(value: string): boolean;
/**
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} index - specify the index
 * @param {boolean} increase - specify the boolean value.
 * @param {string} layout - specify the string
 * @returns {number} - To skip the hidden index
 *
 */
export declare function skipHiddenIdx(sheet: SheetModel, index: number, increase: boolean, layout?: string): number;
/**
 * @param {CellStyleModel} style - Cell style.
 * @param {boolean} onActionUpdate - Specifies the action.
 * @returns {boolean} - retruns `true` is height needs to be checked.
 * @hidden
 */
export declare function isHeightCheckNeeded(style: CellStyleModel, onActionUpdate?: boolean): boolean;
/**
 * @param {number[]} currIndexes - current indexes in which formula get updated
 * @param {number[]} prevIndexes - copied indexes
 * @param {SheetModel} sheet - sheet model
 * @param {CellModel} prevCell - copied or prev cell
 * @param {Workbook} context - Represents workbook instance
 * @param {boolean} isSort - Represents sort action
 * @returns {string} - retruns updated formula
 * @hidden
 */
export declare function getUpdatedFormula(currIndexes: number[], prevIndexes: number[], sheet: SheetModel, prevCell?: CellModel, context?: Workbook, isSort?: boolean): string;
/**@hidden */
export declare function updateCell(context: Workbook, sheet: SheetModel, prop: CellUpdateArgs): boolean;
/**
 * @param {number} rowIdx - row index
 * @param {number} colIdx - column index
 * @param {SheetModel} sheet - sheet model
 * @returns {number[]} - retruns data range
 * @hidden
 */
export declare function getDataRange(rowIdx: number, colIdx: number, sheet: SheetModel): number[];
/**
 * @param {InsertDeleteModelArgs} args - row index
 * @param {number[]} formatRange - format range index
 * @returns {number[]} - retruns updated range
 * @hidden
 */
export declare function insertFormatRange(args: InsertDeleteModelArgs, formatRange: number[], isAction: boolean): number[];
/**
 * @param {InsertDeleteModelArgs} args - row index
 * @param {number[]} formatRange - cell range index
 * @returns {number[]} - retruns data range
 * @hidden
 */
export declare function deleteFormatRange(args: InsertDeleteModelArgs, formatRange: number[]): number[];
/** @hidden */
export declare function updateCFModel(curCF: ConditionalFormat[], cfRule: ConditionalFormatModel[], rowIdx: number, colIdx: number): void;
/** @hidden */
export declare function checkRange(indexes: number[][], range: string): boolean;
/** @hidden */
export declare function parseLocaleNumber(valArr: string[], locale: string): string[];
/**
 * Returns the overall viewport indexes by including the freeze and movable part.
 *
 * @param {Workbook} parent - Specify the Workbook object.
 * @param {number} viewport - Specifies the top, bottom, left, and right index of the current viewport.
 * @returns {number[][]} - Returns the viewport indexes.
 * @hidden
 */
export declare function getViewportIndexes(parent: Workbook, viewport: {
    topIndex?: number;
    leftIndex?: number;
    bottomIndex?: number;
    rightIndex?: number;
}): number[][];
/**
 * If the primary cell in the merged range row/column is hidden, then this method will update
 * the next visible row/column index within the merged range.
 *
 * @param {SheetModel} args.sheet - Specifies the active sheet model.
 * @param {CellModel} args.cell - Specifies the primary merged cell model.
 * @param {number} args.rowIdx - Specifies the row index of the primary merged cell. If the row is hidden,
 * then this method will update the next visible row index.
 * @param {number} args.colIdx - Specifies the column index of the primary merged cell. If the column is hidden,
 * then this method will update the next visible column index.
 * @param {boolean} args.isMergedHiddenCell - If either row or column index is changed, we set this property as true.
 * @hidden
 */
export declare function setVisibleMergeIndex(args: VisibleMergeIndexArgs): void;
