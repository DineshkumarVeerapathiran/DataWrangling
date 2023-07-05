var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { getCell, getSheet, isHiddenRow, isHiddenCol, getColumn } from '../base/index';
import { getCellIndexes, getCellAddress, find, count, getRangeIndexes, getSheetIndexFromAddress } from '../common/index';
import { goto, replace, replaceAll, showDialog, replaceAllDialog } from '../common/index';
import { isNullOrUndefined, isUndefined } from '@syncfusion/ej2-base';
import { findAllValues, workBookeditAlert, updateCell, beginAction } from '../common/index';
import { isLocked } from '../common/index';
/**
 * `WorkbookFindAndReplace` module is used to handle the search action in Spreadsheet.
 */
var WorkbookFindAndReplace = /** @class */ (function () {
    /**
     * Constructor for WorkbookFindAndReplace module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     */
    function WorkbookFindAndReplace(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the FindAndReplace module.
     *
     * @returns {void} - To destroy the FindAndReplace module.
     */
    WorkbookFindAndReplace.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookFindAndReplace.prototype.addEventListener = function () {
        this.parent.on(find, this.find, this);
        this.parent.on(replace, this.replace, this);
        this.parent.on(replaceAll, this.replaceAll, this);
        this.parent.on(count, this.totalCount, this);
        this.parent.on(findAllValues, this.findAllValues, this);
    };
    WorkbookFindAndReplace.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(find, this.find);
            this.parent.off(replace, this.replace);
            this.parent.off(replaceAll, this.replaceAll);
            this.parent.off(count, this.totalCount);
            this.parent.off(findAllValues, this.findAllValues);
        }
    };
    WorkbookFindAndReplace.prototype.find = function (args) {
        var sheet = this.parent.sheets[args.sheetIndex];
        var activeCell = getRangeIndexes(sheet.activeCell);
        var findArgs = { startRow: activeCell[0], startCol: activeCell[1],
            findVal: args.isCSen ? args.value : args.value.toLowerCase(), activeCell: activeCell };
        if (args.searchBy === 'By Row' ? findArgs.startRow > sheet.usedRange.rowIndex : findArgs.startCol > sheet.usedRange.colIndex) {
            if (args.findOpt === 'next') {
                findArgs.startRow = findArgs.startCol = 0;
            }
            else {
                findArgs.startRow = sheet.usedRange.rowIndex;
                findArgs.startCol = sheet.usedRange.colIndex;
            }
        }
        else {
            if (args.searchBy === 'By Row') {
                if (findArgs.startCol > sheet.usedRange.colIndex) {
                    if (args.findOpt === 'next') {
                        findArgs.startRow++;
                        if (findArgs.startRow > sheet.usedRange.rowIndex) {
                            findArgs.startRow = 0;
                        }
                        findArgs.startCol = 0;
                    }
                    else {
                        findArgs.startRow--;
                        if (findArgs.startRow < 0) {
                            findArgs.startRow = sheet.usedRange.rowIndex;
                        }
                        findArgs.startCol = sheet.usedRange.colIndex;
                    }
                }
            }
            else {
                if (findArgs.startRow > sheet.usedRange.rowIndex) {
                    if (args.findOpt === 'next') {
                        findArgs.startCol++;
                        if (findArgs.startCol > sheet.usedRange.colIndex) {
                            findArgs.startRow = 0;
                        }
                        findArgs.startRow = 0;
                    }
                    else {
                        findArgs.startCol--;
                        if (findArgs.startCol < 0) {
                            findArgs.startCol = sheet.usedRange.colIndex;
                        }
                        findArgs.startRow = sheet.usedRange.colIndex;
                    }
                }
            }
        }
        if (args.mode === 'Workbook') {
            findArgs.sheets = this.parent.sheets;
            findArgs.sheetIdx = args.sheetIndex;
        }
        else {
            findArgs.sheets = [sheet];
            findArgs.sheetIdx = 0;
        }
        if (args.findOpt === 'next') {
            this.findNext(args, findArgs);
        }
        else {
            this.findPrevious(args, findArgs);
        }
    };
    WorkbookFindAndReplace.prototype.findNext = function (args, findArgs) {
        var _this = this;
        var findOnSheet = function (startIdx, endIdx, initIteration) {
            var sheet;
            var cellAddr;
            for (var sheetIdx = startIdx; sheetIdx <= endIdx; sheetIdx++) {
                sheet = findArgs.sheets[sheetIdx];
                if (sheetIdx === findArgs.sheetIdx) {
                    if (initIteration) {
                        cellAddr = _this.findNextOnSheet(args, findArgs.startRow, findArgs.startCol, findArgs.findVal, sheet, undefined, findArgs.activeCell);
                    }
                    else {
                        cellAddr = _this.findNextOnSheet(args, 0, 0, findArgs.findVal, sheet, args.searchBy === 'By Row' ? findArgs.startRow : findArgs.startCol);
                    }
                }
                else {
                    cellAddr = _this.findNextOnSheet(args, 0, 0, findArgs.findVal, sheet);
                }
                if (cellAddr) {
                    break;
                }
            }
            return cellAddr;
        };
        var cellAddr;
        cellAddr = findOnSheet(findArgs.sheetIdx, findArgs.sheets.length - 1, true);
        if (!cellAddr) {
            cellAddr = findOnSheet(0, findArgs.sheetIdx);
        }
        if (cellAddr) {
            this.parent.notify(goto, { address: cellAddr });
        }
        else {
            this.parent.notify(showDialog, null);
        }
    };
    WorkbookFindAndReplace.prototype.findNextOnSheet = function (args, startRow, startCol, findVal, sheet, endIdx, activeCell) {
        var cellAddr;
        var rowIdx;
        var colIdx;
        if (args.searchBy === 'By Row') {
            if (endIdx === undefined) {
                endIdx = sheet.rows.length - 1;
            }
            var colLen = void 0;
            for (rowIdx = startRow; rowIdx <= endIdx; rowIdx++) {
                if (isHiddenRow(sheet, rowIdx)) {
                    continue;
                }
                colIdx = activeCell && rowIdx === startRow ? startCol : 0;
                colLen = sheet.rows[rowIdx] && sheet.rows[rowIdx].cells && sheet.rows[rowIdx].cells.length;
                for (colIdx; colIdx < colLen; colIdx++) {
                    if (!isHiddenCol(sheet, colIdx)) {
                        cellAddr = this.checkMatch(args, findVal, rowIdx, colIdx, sheet, activeCell);
                        if (cellAddr) {
                            return cellAddr;
                        }
                    }
                }
            }
        }
        else {
            if (endIdx === undefined) {
                endIdx = sheet.usedRange.colIndex;
            }
            var endRow = sheet.rows && sheet.rows.length - 1;
            for (colIdx = startCol; colIdx <= endIdx; colIdx++) {
                if (isHiddenCol(sheet, colIdx)) {
                    continue;
                }
                rowIdx = activeCell && colIdx === startCol ? startRow : 0;
                for (rowIdx; rowIdx <= endRow; rowIdx++) {
                    if (!isHiddenRow(sheet, rowIdx)) {
                        cellAddr = this.checkMatch(args, findVal, rowIdx, colIdx, sheet, activeCell);
                        if (cellAddr) {
                            return cellAddr;
                        }
                    }
                }
            }
        }
        return cellAddr;
    };
    WorkbookFindAndReplace.prototype.findPrevious = function (args, findArgs) {
        var _this = this;
        var findOnSheet = function (startIdx, endIdx, initIteration) {
            var sheet;
            var cellAddr;
            for (var sheetIdx = startIdx; sheetIdx >= endIdx; sheetIdx--) {
                sheet = findArgs.sheets[sheetIdx];
                if (sheetIdx === findArgs.sheetIdx) {
                    if (initIteration) {
                        cellAddr = _this.findPrevOnSheet(args, findArgs.startRow, findArgs.startCol, 0, 0, findArgs.findVal, sheet, findArgs.activeCell);
                    }
                    else {
                        if (args.searchBy === 'By Row') {
                            cellAddr = _this.findPrevOnSheet(args, sheet.usedRange.rowIndex, sheet.usedRange.colIndex, findArgs.startRow, 0, findArgs.findVal, sheet);
                        }
                        else {
                            cellAddr = _this.findPrevOnSheet(args, sheet.usedRange.rowIndex, sheet.usedRange.colIndex, 0, findArgs.startCol, findArgs.findVal, sheet);
                        }
                    }
                }
                else {
                    cellAddr = _this.findPrevOnSheet(args, sheet.usedRange.rowIndex, sheet.usedRange.colIndex, 0, 0, findArgs.findVal, sheet);
                }
                if (cellAddr) {
                    break;
                }
            }
            return cellAddr;
        };
        var cellAddr;
        cellAddr = findOnSheet(findArgs.sheetIdx, 0, true);
        if (!cellAddr) {
            cellAddr = findOnSheet(findArgs.sheets.length - 1, findArgs.sheetIdx);
        }
        if (cellAddr) {
            this.parent.notify(goto, { address: cellAddr });
        }
        else {
            this.parent.notify(showDialog, null);
        }
    };
    WorkbookFindAndReplace.prototype.findPrevOnSheet = function (args, startRow, startCol, endRow, endCol, findVal, sheet, activeCell) {
        var cellAddr;
        var colIdx;
        var rowIdx;
        if (args.searchBy === 'By Row') {
            for (rowIdx = startRow; rowIdx >= endRow; rowIdx--) {
                if (isHiddenRow(sheet, rowIdx)) {
                    continue;
                }
                colIdx = activeCell && rowIdx === startRow ? startCol : sheet.rows[rowIdx] &&
                    sheet.rows[rowIdx].cells && sheet.rows[rowIdx].cells.length - 1;
                for (colIdx; colIdx >= endCol; colIdx--) {
                    if (!isHiddenCol(sheet, colIdx)) {
                        cellAddr = this.checkMatch(args, findVal, rowIdx, colIdx, sheet, activeCell);
                        if (cellAddr) {
                            return cellAddr;
                        }
                    }
                }
            }
        }
        else {
            for (colIdx = startCol; colIdx >= endCol; colIdx--) {
                if (isHiddenCol(sheet, colIdx)) {
                    continue;
                }
                rowIdx = activeCell && colIdx === startCol ? startRow : sheet.rows && sheet.rows.length - 1;
                for (rowIdx; rowIdx >= endRow; rowIdx--) {
                    if (!isHiddenRow(sheet, rowIdx)) {
                        cellAddr = this.checkMatch(args, findVal, rowIdx, colIdx, sheet, activeCell);
                        if (cellAddr) {
                            return cellAddr;
                        }
                    }
                }
            }
        }
        return cellAddr;
    };
    WorkbookFindAndReplace.prototype.checkMatch = function (args, findVal, rowIdx, colIdx, sheet, curCell) {
        if (curCell && rowIdx === curCell[0] && colIdx === curCell[1]) {
            return null;
        }
        var cell = getCell(rowIdx, colIdx, sheet, false, true);
        if (sheet.isProtected && !sheet.protectSettings.selectCells && sheet.protectSettings.selectUnLockedCells &&
            isLocked(cell, getColumn(sheet, colIdx))) {
            return null;
        }
        var cellVal = this.parent.getDisplayText(cell);
        if (cellVal) {
            if (!args.isCSen) {
                cellVal = cellVal.toLowerCase();
            }
            if (args.isEMatch) {
                if (cellVal === findVal) {
                    return sheet.name + "!" + getCellAddress(rowIdx, colIdx);
                }
            }
            else if (cellVal.includes(findVal)) {
                return sheet.name + "!" + getCellAddress(rowIdx, colIdx);
            }
        }
        return null;
    };
    WorkbookFindAndReplace.prototype.replace = function (args) {
        var sheetIndex = isUndefined(args.sheetIndex) ? this.parent.activeSheetIndex : args.sheetIndex;
        var sheet = getSheet(this.parent, args.sheetIndex);
        if (sheet.isProtected) {
            this.parent.notify(workBookeditAlert, null);
            return;
        }
        var address = args.address;
        var activeCell = getRangeIndexes(address || sheet.activeCell);
        var compareVal = this.parent.getDisplayText(getCell(activeCell[0], activeCell[1], sheet, false, true)).toString();
        var checkValue;
        args.value = args.value.toString();
        if (!args.isCSen) {
            checkValue = args.value.toLowerCase();
        }
        var replacedValue = this.getReplaceValue(args, compareVal, checkValue);
        if (!replacedValue) {
            args.findOpt = 'next';
            this.find(args);
            activeCell = getCellIndexes(sheet.activeCell);
            compareVal = this.parent.getDisplayText(getCell(activeCell[0], activeCell[1], sheet)).toString();
            replacedValue = this.getReplaceValue(args, compareVal, checkValue);
            if (!replacedValue) {
                return;
            }
        }
        var eventArgs = { address: sheet.name + "!" + getCellAddress(activeCell[0], activeCell[1]), cancel: false,
            compareValue: args.value, replaceValue: args.replaceValue, sheetIndex: sheetIndex };
        if (args.isAction) {
            this.parent.notify(beginAction, { action: 'beforeReplace', eventArgs: eventArgs });
            if (eventArgs.cancel) {
                return;
            }
            delete eventArgs.cancel;
        }
        updateCell(this.parent, sheet, { cell: { value: replacedValue }, rowIdx: activeCell[0], colIdx: activeCell[1], uiRefresh: true,
            valChange: true });
        if (args.isAction) {
            this.parent.notify('actionComplete', { action: 'replace', eventArgs: eventArgs });
        }
    };
    WorkbookFindAndReplace.prototype.replaceAll = function (args) {
        var _this = this;
        var startSheet = args.mode === 'Sheet' ? args.sheetIndex : 0;
        var sheet = this.parent.sheets[startSheet];
        var endRow = sheet.usedRange.rowIndex;
        var startRow = 0;
        var endColumn = sheet.usedRange.colIndex;
        var startColumn = 0;
        var addressCollection = [];
        var triggerEvent = args.isAction;
        var eventArgs = __assign({ addressCollection: addressCollection, cancel: false }, args);
        var updateAsync = function (cellValue, index) {
            if (requestAnimationFrame) {
                requestAnimationFrame(function () {
                    if (!eventArgs.cancel && eventArgs.addressCollection[index]) {
                        var indexes = getCellIndexes(eventArgs.addressCollection[index].split('!')[1]);
                        var sheetIndex = getSheetIndexFromAddress(_this.parent, eventArgs.addressCollection[index]);
                        updateCell(_this.parent, _this.parent.sheets[sheetIndex], { cell: { value: cellValue }, rowIdx: indexes[0],
                            uiRefresh: true, colIdx: indexes[1], valChange: true,
                            skipFormatCheck: args.skipFormatCheck });
                        if (index === eventArgs.addressCollection.length - 1 && triggerEvent) {
                            _this.parent.notify('actionComplete', { action: 'replaceAll', eventArgs: eventArgs });
                        }
                    }
                });
            }
            else {
                _this.parent.updateCell({ value: cellValue }, eventArgs.addressCollection[index]);
            }
        };
        var cellval;
        var row;
        var regX;
        for (startRow; startRow <= endRow + 1; startRow++) {
            if (startColumn > endColumn && startRow > endRow) {
                if (args.mode === 'Workbook') {
                    startSheet++;
                    sheet = this.parent.sheets[startSheet];
                    if (sheet) {
                        startColumn = 0;
                        startRow = 0;
                        endColumn = sheet.usedRange.colIndex;
                        endRow = sheet.usedRange.rowIndex;
                    }
                    else {
                        break;
                    }
                }
            }
            row = sheet.rows[startRow];
            if (row) {
                if (startColumn === endColumn + 1) {
                    startColumn = 0;
                }
                for (startColumn; startColumn <= endColumn; startColumn++) {
                    if (row) {
                        if (row.cells && row.cells[startColumn]) {
                            cellval = this.parent.getDisplayText(sheet.rows[startRow].cells[startColumn]).toString();
                            if (cellval) {
                                if (args.isCSen) {
                                    if (args.isEMatch) {
                                        if (cellval === args.value) {
                                            updateAsync(args.replaceValue, addressCollection.length);
                                            addressCollection.push(sheet.name + '!' + getCellAddress(startRow, startColumn));
                                        }
                                    }
                                    else {
                                        if (cellval.indexOf(args.value) > -1) {
                                            updateAsync(cellval.replace(args.value, args.replaceValue), addressCollection.length);
                                            addressCollection.push(sheet.name + '!' + getCellAddress(startRow, startColumn));
                                        }
                                    }
                                }
                                else {
                                    if (args.isEMatch) {
                                        if (cellval.toLowerCase() === args.value) {
                                            updateAsync(args.replaceValue, addressCollection.length);
                                            addressCollection.push(sheet.name + '!' + getCellAddress(startRow, startColumn));
                                        }
                                    }
                                    else {
                                        var val = cellval.toLowerCase();
                                        if ((cellval === args.value || val.indexOf(args.value.toString().toLowerCase()) > -1) || val ===
                                            args.value || cellval === args.value || val.indexOf(args.value) > -1) {
                                            var regExp = RegExp;
                                            regX = new regExp(args.value.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
                                            updateAsync(cellval.replace(regX, args.replaceValue), addressCollection.length);
                                            addressCollection.push(sheet.name + '!' + getCellAddress(startRow, startColumn));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (addressCollection.length && triggerEvent) {
            this.parent.notify('actionBegin', { action: 'beforeReplaceAll', eventArgs: eventArgs });
            if (!eventArgs.cancel) {
                this.parent.notify(replaceAllDialog, { count: eventArgs.addressCollection.length, replaceValue: eventArgs.replaceValue });
            }
        }
        else {
            this.parent.notify(replaceAllDialog, { count: eventArgs.addressCollection.length, replaceValue: eventArgs.replaceValue });
        }
    };
    WorkbookFindAndReplace.prototype.getReplaceValue = function (args, cellval, checkValue) {
        if (args.isCSen) {
            if (args.isEMatch) {
                return cellval === args.value && args.replaceValue;
            }
            else {
                return cellval.indexOf(args.value) > -1 && cellval.replace(args.value, args.replaceValue);
            }
        }
        else {
            if (args.isEMatch) {
                return cellval.toLowerCase() === checkValue && args.replaceValue;
            }
            else {
                var regExp = RegExp;
                return (cellval.toLowerCase().includes(checkValue)) &&
                    cellval.replace(new regExp(args.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), args.replaceValue);
            }
        }
    };
    WorkbookFindAndReplace.prototype.totalCount = function (args) {
        var _this = this;
        var sheet = this.parent.sheets[args.sheetIndex];
        var activeCell = getCellIndexes(sheet.activeCell);
        var count = 0;
        var requiredCount = 0;
        var cellValue;
        var findValue = args.value.toLowerCase();
        sheet.rows.filter(function (row, rowIdx) { return row && row.cells && (!row.isFiltered && !row.hidden) &&
            row.cells.filter(function (cell, colIdx) {
                if (cell && (cell.value || cell.value === 0) && !isHiddenCol(sheet, colIdx) && (!sheet.isProtected ||
                    sheet.protectSettings.selectCells || !isLocked(cell, getColumn(sheet, colIdx)))) {
                    cellValue = (cell.format ? _this.parent.getDisplayText(cell) : cell.value.toString()).toLowerCase();
                    if (cellValue.includes(findValue)) {
                        count++;
                        if ((rowIdx === activeCell[0] && colIdx >= activeCell[1]) || rowIdx > activeCell[0]) {
                            requiredCount++;
                        }
                    }
                }
            }); });
        requiredCount -= 1;
        var totalCount = count;
        count = totalCount - requiredCount;
        if (count > totalCount) {
            count = totalCount;
        }
        if (count !== 0 && !this.parent.getDisplayText(getCell(activeCell[0], activeCell[1], sheet)).toLowerCase().includes(findValue)) {
            count -= 1;
        }
        args.findCount = count + " of " + totalCount;
    };
    WorkbookFindAndReplace.prototype.findAllValues = function (findAllArguments) {
        var startSheet = findAllArguments.sheetIndex;
        var sheet = this.parent.sheets[startSheet];
        var endRow = sheet.usedRange.rowIndex;
        var rowIndex = 0;
        var count = 0;
        var address;
        var endColumn = sheet.usedRange.colIndex;
        var columnIndex = 0;
        var sheetLength = this.parent.sheets.length;
        var initialSheet = findAllArguments.sheetIndex;
        for (rowIndex; rowIndex <= endRow + 1; rowIndex++) {
            if ((initialSheet !== 1) && (findAllArguments.sheetIndex === sheetLength)) {
                startSheet = 1;
            }
            if (rowIndex > endRow && columnIndex > endColumn) {
                if (findAllArguments.mode === 'Workbook') {
                    startSheet++;
                    if (initialSheet === startSheet) {
                        if (count === 0) {
                            return;
                        }
                        return;
                    }
                    if (startSheet > sheetLength - 1) {
                        startSheet = 0;
                    }
                    sheet = this.parent.sheets[startSheet];
                    if (sheet) {
                        rowIndex = 0;
                        columnIndex = 0;
                        endColumn = sheet.usedRange.colIndex;
                        endRow = sheet.usedRange.rowIndex;
                    }
                }
            }
            if (!isNullOrUndefined(sheet)) {
                if (sheet.rows[rowIndex]) {
                    var row = sheet.rows[rowIndex];
                    if (columnIndex === endColumn + 2) {
                        columnIndex = 0;
                    }
                    for (columnIndex; columnIndex <= endColumn + 1; columnIndex++) {
                        if (row) {
                            if (row.cells && row.cells[columnIndex]) {
                                var cell = sheet.rows[rowIndex].cells[columnIndex];
                                if (cell && !isNullOrUndefined(cell.value) && cell.value !== '' && (!sheet.isProtected ||
                                    sheet.protectSettings.selectCells || (sheet.protectSettings.selectUnLockedCells &&
                                    !isLocked(cell, getColumn(sheet, columnIndex))))) {
                                    var cellFormat = cell.format;
                                    var cellvalue = void 0;
                                    if (cellFormat) {
                                        var displayTxt = this.parent.getDisplayText(sheet.rows[rowIndex].cells[columnIndex]);
                                        cellvalue = displayTxt.toString();
                                    }
                                    else {
                                        cellvalue = cell.value.toString();
                                    }
                                    if (findAllArguments.isCSen && findAllArguments.isEMatch) {
                                        if (cellvalue === findAllArguments.value) {
                                            address = sheet.name + '!' + getCellAddress(rowIndex, columnIndex);
                                            findAllArguments.findCollection.push(address);
                                            count++;
                                        }
                                    }
                                    else if (findAllArguments.isCSen && !findAllArguments.isEMatch) {
                                        var index = cellvalue.indexOf(findAllArguments.value) > -1;
                                        if ((cellvalue === findAllArguments.value) || (index)) {
                                            address = sheet.name + '!' + getCellAddress(rowIndex, columnIndex);
                                            findAllArguments.findCollection.push(address);
                                            count++;
                                        }
                                    }
                                    else if (!findAllArguments.isCSen && findAllArguments.isEMatch) {
                                        var val = cellvalue.toString().toLowerCase();
                                        if (val === findAllArguments.value) {
                                            address = sheet.name + '!' + getCellAddress(rowIndex, columnIndex);
                                            findAllArguments.findCollection.push(address);
                                            count++;
                                        }
                                    }
                                    else if (!findAllArguments.isCSen && !findAllArguments.isEMatch) {
                                        var val = cellvalue.toString().toLowerCase();
                                        var index = val.indexOf(findAllArguments.value.toLowerCase()) > -1;
                                        if ((val === findAllArguments.value) || ((cellvalue === findAllArguments.value) || (index)) ||
                                            ((cellvalue === findAllArguments.value))) {
                                            address = sheet.name + '!' + getCellAddress(rowIndex, columnIndex);
                                            findAllArguments.findCollection.push(address);
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (count === 0) {
            return;
        }
        return;
    };
    /**
     * Gets the module name.
     *
     * @returns {string} - Return the string
     */
    WorkbookFindAndReplace.prototype.getModuleName = function () {
        return 'workbookfindAndReplace';
    };
    return WorkbookFindAndReplace;
}());
export { WorkbookFindAndReplace };
