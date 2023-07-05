import { getCell, getSheet, getSheetIndex, getColumn } from '../base/index';
import { setLinkModel, getRangeIndexes, updateCell, getSwapRange, isLocked } from '../common/index';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * The `WorkbookHyperlink` module is used to handle Hyperlink action in Spreadsheet.
 */
var WorkbookHyperlink = /** @class */ (function () {
    /**
     * Constructor for WorkbookSort module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     */
    function WorkbookHyperlink(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the sort module.
     *
     * @returns {void} - To destroy the sort module.
     */
    WorkbookHyperlink.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookHyperlink.prototype.addEventListener = function () {
        this.parent.on(setLinkModel, this.setLinkHandler, this);
    };
    WorkbookHyperlink.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(setLinkModel, this.setLinkHandler);
        }
    };
    WorkbookHyperlink.prototype.setLinkHandler = function (args) {
        var hyperlink = args.hyperlink;
        var cellAddr = args.cell;
        var sheet;
        if (cellAddr && cellAddr.indexOf('!') !== -1) {
            var addrArr = cellAddr.split('!');
            sheet = getSheet(this.parent, getSheetIndex(this.parent, addrArr[0]));
            cellAddr = addrArr[1];
            if (!sheet) {
                return;
            }
        }
        else {
            sheet = this.parent.getActiveSheet();
            cellAddr = cellAddr || sheet.selectedRange;
        }
        var isProtected = !args.triggerEvt && sheet.isProtected;
        if (isProtected && !sheet.protectSettings.insertLink) {
            return;
        }
        var cellIdx = getSwapRange(getRangeIndexes(cellAddr));
        if (typeof (hyperlink) === 'string') {
            if (hyperlink.toLowerCase().indexOf('www.') === 0) {
                hyperlink = 'http://' + hyperlink;
            }
        }
        else {
            if (hyperlink.address.toLowerCase().indexOf('www.') === 0) {
                hyperlink.address = 'http://' + hyperlink.address;
            }
        }
        var cellModel;
        var activeCell = getRangeIndexes(sheet.activeCell);
        for (var rIdx = cellIdx[0]; rIdx <= cellIdx[2]; rIdx++) {
            for (var cIdx = cellIdx[1]; cIdx <= cellIdx[3]; cIdx++) {
                if (isProtected && isLocked(getCell(rIdx, cIdx, sheet), getColumn(sheet, cIdx))) {
                    continue;
                }
                cellModel = { hyperlink: hyperlink };
                if (!isNullOrUndefined(args.displayText) && rIdx === activeCell[0] && cIdx === activeCell[1]) {
                    if (args.triggerEvt) {
                        if (rIdx === activeCell[0] && cIdx === activeCell[1]) {
                            cellModel.value = args.displayText;
                        }
                    }
                    else if (isNullOrUndefined(getCell(rIdx, cIdx, sheet, false, true).value)) {
                        cellModel.value = args.displayText;
                    }
                }
                cellModel.style = { textDecoration: 'underline', color: '#00e' };
                updateCell(this.parent, sheet, { cell: cellModel, rowIdx: rIdx, colIdx: cIdx, preventEvt: !args.triggerEvt });
            }
        }
    };
    /**
     * Gets the module name.
     *
     *@returns {string} - returns the module name.
     */
    WorkbookHyperlink.prototype.getModuleName = function () {
        return 'workbookHyperlink';
    };
    return WorkbookHyperlink;
}());
export { WorkbookHyperlink };
