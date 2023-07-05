import { refreshCellElement, rowFillHandler, getTextSpace } from '../../workbook/common/event';
import { getTextWidth, getExcludedColumnWidth } from '../common/index';
import { activeCellMergedRange } from '../../workbook/index';
/**
 * Specifies number format.
 */
var NumberFormat = /** @class */ (function () {
    function NumberFormat(parent) {
        this.parent = parent;
        this.addEventListener();
        //Spreadsheet.Inject(WorkbookNumberFormat);
    }
    NumberFormat.prototype.refreshCellElement = function (args) {
        if (args.cellEle) {
            this.parent.refreshNode(args.cellEle, args);
        }
    };
    NumberFormat.prototype.getTextSpace = function (args) {
        args.width = getTextWidth(args.char, args.cell.style, this.parent.cellStyle);
    };
    NumberFormat.prototype.rowFillHandler = function (args) {
        var cellElem = args.cellEle;
        if (cellElem) {
            var repeatCharWidth = getTextWidth(args.repeatChar, args.cell.style, this.parent.cellStyle);
            var endCol = args.colIdx;
            if (args.cell.colSpan > 1) {
                var mergeArgs = { range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx] };
                this.parent.notify(activeCellMergedRange, mergeArgs);
                endCol = mergeArgs.range[3];
            }
            var cellWidth = getExcludedColumnWidth(this.parent.getActiveSheet(), args.rowIdx, args.colIdx, endCol);
            cellElem.innerText = '';
            if (args.beforeFillText) {
                cellElem.innerText = args.beforeFillText;
                cellWidth -= getTextWidth(args.beforeFillText, args.cell.style, this.parent.cellStyle);
            }
            var repeatCharSpan = this.parent.createElement('span', { className: 'e-fill' });
            cellElem.appendChild(repeatCharSpan);
            if (args.afterFillText) {
                var textSpan = this.parent.createElement('span', { className: 'e-fill-sec' });
                textSpan.innerText = args.afterFillText;
                cellElem.appendChild(textSpan);
                cellWidth -= getTextWidth(args.afterFillText, args.cell.style, this.parent.cellStyle);
            }
            var repeatCount = parseInt((cellWidth / repeatCharWidth).toString(), 10);
            args.formattedText = repeatCount > 0 ? args.repeatChar.repeat(repeatCount) : '';
            repeatCharSpan.textContent = args.formattedText;
        }
    };
    /**
     * Adding event listener for number format.
     *
     * @hidden
     * @returns {void} - Adding event listener for number format.
     */
    NumberFormat.prototype.addEventListener = function () {
        this.parent.on(refreshCellElement, this.refreshCellElement, this);
        this.parent.on(rowFillHandler, this.rowFillHandler, this);
        this.parent.on(getTextSpace, this.getTextSpace, this);
    };
    /**
     * Removing event listener for number format.
     *
     * @hidden
     * @returns {void} - Removing event listener for number format.
     */
    NumberFormat.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(refreshCellElement, this.refreshCellElement);
            this.parent.off(rowFillHandler, this.rowFillHandler);
            this.parent.off(getTextSpace, this.getTextSpace);
        }
    };
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    NumberFormat.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the workbook import module name.
     *
     * @returns {string} - Get the workbook import module name.
     */
    NumberFormat.prototype.getModuleName = function () {
        return 'numberFormat';
    };
    return NumberFormat;
}());
export { NumberFormat };
