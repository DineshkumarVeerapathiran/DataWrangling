import { getCell, setCell, getSheetIndex, getCellIndexes } from './../index';
import { getCellAddress, getRangeIndexes, beforeCellUpdate, workbookEditOperation, isNumber } from './index';
import { getColumnHeaderText, clearFormulaDependentCells } from './index';
import { isHiddenCol, isHiddenRow } from './../index';
import { isUndefined, defaultCurrencyCode, getNumberDependable, getNumericObject } from '@syncfusion/ej2-base';
/**
 * Check whether the text is formula or not.
 *
 * @param {string} text - Specify the text.
 * @param {boolean} isEditing - Specify the isEditing.
 * @returns {boolean} - Check whether the text is formula or not.
 */
export function checkIsFormula(text, isEditing) {
    return text && text[0] === '=' && (text.length > 1 || isEditing);
}
/**
 * Check whether the value is cell reference or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 */
export function isCellReference(value) {
    var range = value;
    range = range.split('$').join('');
    if (range.indexOf(':') > -1) {
        var rangeSplit = range.split(':');
        if (isValidCellReference(rangeSplit[0]) && isValidCellReference(rangeSplit[1])) {
            return true;
        }
    }
    else if (range.indexOf(':') < 0) {
        if (isValidCellReference(range)) {
            return true;
        }
    }
    return false;
}
/**
 * Check whether the value is character or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 */
export function isChar(value) {
    if ((value.charCodeAt(0) >= 65 && value.charCodeAt(0) <= 90) || (value.charCodeAt(0) >= 97 && value.charCodeAt(0) <= 122)) {
        return true;
    }
    return false;
}
/**
 * Check whether the range selection is on complete row.
 *
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number[]} range - Specify the range index.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export function isRowSelected(sheet, range) {
    return range[1] === 0 && range[3] === sheet.colCount - 1;
}
/**
 * Check whether the range selection is on complete column.
 *
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number[]} range - Specify the range index.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export function isColumnSelected(sheet, range) {
    return range[0] === 0 && range[2] === sheet.rowCount - 1;
}
/**
 * @param {number[]} range - Specify the range
 * @param {number} rowIdx - Specify the row index
 * @param {number} colIdx - Specify the col index
 * @returns {boolean} - Returns boolean value
 */
export function inRange(range, rowIdx, colIdx) {
    return range && (rowIdx >= range[0] && rowIdx <= range[2] && colIdx >= range[1] && colIdx <= range[3]);
}
/**
 * @param {number[]} address - Specify the address
 * @param {number} rowIdx - Specify the row index
 * @param {number} colIdx - Specify the col index
 * @returns {boolean} - Returns boolean value
 */
export function isInMultipleRange(address, rowIdx, colIdx) {
    var range;
    var isInRange;
    var splitedAddress = address.split(' ');
    for (var i = 0, len = splitedAddress.length; i < len; i++) {
        range = getRangeIndexes(splitedAddress[i]);
        isInRange = inRange(range, rowIdx, colIdx);
        if (isInRange) {
            break;
        }
    }
    return isInRange;
}
/** @hidden
 * @param {number[]} range - Specify the range
 * @param {number[]} testRange - Specify the test range
 * @param {boolean} isModify - Specify the boolean value
 * @returns {boolean} - Returns boolean value
 */
export function isInRange(range, testRange, isModify) {
    var inRange = range[0] <= testRange[0] && range[2] >= testRange[2] && range[1] <= testRange[1] && range[3] >= testRange[3];
    if (inRange) {
        return true;
    }
    if (isModify) {
        if (testRange[0] < range[0] && testRange[2] < range[0] || testRange[0] > range[2] && testRange[2] > range[2]) {
            return false;
        }
        else {
            if (testRange[0] < range[0] && testRange[2] > range[0]) {
                testRange[0] = range[0];
                inRange = true;
            }
            if (testRange[2] > range[2]) {
                testRange[2] = range[2];
                inRange = true;
            }
        }
        if (testRange[1] < range[1] && testRange[3] < range[1] || testRange[1] > range[3] && testRange[3] > range[3]) {
            return false;
        }
        else {
            if (testRange[1] < range[1] && testRange[3] > range[1]) {
                testRange[1] = range[1];
                inRange = true;
            }
            if (testRange[3] > range[3]) {
                testRange[3] = range[3];
                inRange = true;
            }
        }
    }
    return inRange;
}
/**
 * @hidden
 * @param {string} address - Specifies the address for whole column.
 * @param {number[]} testRange - Specifies range used to split the address.
 * @param {number} colIdx - Specifies the column index.
 * @returns {string} - returns the modified address.
 */
export function getSplittedAddressForColumn(address, testRange, colIdx) {
    var colName = getColumnHeaderText(colIdx + 1);
    if (address) {
        address.split(' ').forEach(function (addrs) {
            var range = getRangeIndexes(addrs);
            if (isInRange(range, testRange)) {
                address = address.split(addrs).join(colName + (range[0] + 1) +
                    ':' + colName + testRange[0] + ' ' + colName + (testRange[2] + 2) +
                    ':' + colName + (range[2] + 1));
            }
            else if (isInRange(range, testRange, true)) {
                var modifiedAddress = void 0;
                if (testRange[0] > range[0]) {
                    modifiedAddress = colName + (range[0] + 1) + ':' + colName + testRange[0];
                }
                else {
                    modifiedAddress = colName + (testRange[2] + 2) + ':' + colName + (range[2] + 1);
                }
                address = address.split(addrs).join(modifiedAddress);
            }
        });
    }
    else {
        address = colName + '1:' + colName + testRange[0] + ' ' + colName + (testRange[2] + 2) + ':' + colName + '1048576';
    }
    return address;
}
/**
 * Check whether the cell is locked or not
 *
 * @param {CellModel} cell - Specify the cell.
 * @param {ColumnModel} column - Specify the column.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export function isLocked(cell, column) {
    if (!cell) {
        cell = {};
    }
    if (cell.isLocked) {
        return true;
    }
    else if (cell.isLocked === false) {
        return false;
    }
    else if (column && column.isLocked) {
        return true;
    }
    else if (!cell.isLocked && (column && column.isLocked !== false)) {
        return true;
    }
    return false;
}
/**
 * Check whether the value is cell reference or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export function isValidCellReference(value) {
    var text = value;
    var startNum = 0;
    var endNum = 0;
    var j = 0;
    var numArr = [89, 71, 69];
    // XFD is the last column, for that we are using ascii values of Z, G, E (89, 71, 69) to restrict the flow.
    var cellText = '';
    var textLength = text.length;
    for (var i = 0; i < textLength; i++) {
        if (isChar(text[i])) {
            endNum++;
        }
    }
    cellText = text.substring(startNum, endNum);
    var cellTextLength = cellText.length;
    if (cellTextLength !== textLength) {
        if (cellTextLength < 4) {
            if (textLength !== 1 && (isNaN(parseInt(text, 10)))) {
                while (j < cellTextLength) {
                    if ((cellText[j]) && cellText[j].charCodeAt(0) < numArr[j]) {
                        j++;
                        continue;
                    }
                    else if (!cellText[j] && j > 0) {
                        break;
                    }
                    else {
                        return false;
                    }
                }
                var cellNumber = parseFloat(text.substring(endNum, textLength));
                if (cellNumber > 0 && cellNumber < 1048577) { // 1048576 - Maximum number of rows in excel.
                    return true;
                }
            }
        }
    }
    return false;
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} index - specify the index
 * @param {boolean} increase - specify the boolean value.
 * @param {string} layout - specify the string
 * @returns {number} - To skip the hidden index
 *
 */
export function skipHiddenIdx(sheet, index, increase, layout) {
    if (layout === void 0) { layout = 'rows'; }
    var rowColObj;
    if (increase) {
        for (var i = index; i < Infinity; i++) {
            rowColObj = sheet["" + layout];
            if (rowColObj[index] && rowColObj[index].hidden) {
                index++;
            }
            else {
                break;
            }
        }
    }
    else {
        for (var i = index; i > -1; i--) {
            rowColObj = sheet["" + layout];
            if (rowColObj[index] && rowColObj[index].hidden) {
                index--;
            }
            else {
                break;
            }
        }
    }
    return index;
}
/**
 * @param {CellStyleModel} style - Cell style.
 * @param {boolean} onActionUpdate - Specifies the action.
 * @returns {boolean} - retruns `true` is height needs to be checked.
 * @hidden
 */
export function isHeightCheckNeeded(style, onActionUpdate) {
    var keys = Object.keys(style);
    return (onActionUpdate ? keys.indexOf('fontSize') > -1 : keys.indexOf('fontSize') > -1
        && Number(style.fontSize.split('pt')[0]) > 12) || keys.indexOf('fontFamily') > -1 || keys.indexOf('borderTop') > -1
        || keys.indexOf('borderBottom') > -1;
}
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
export function getUpdatedFormula(currIndexes, prevIndexes, sheet, prevCell, context, isSort) {
    var cIdxValue;
    var cell;
    if (prevIndexes) {
        cell = prevCell || getCell(prevIndexes[0], prevIndexes[1], sheet, false, true);
        cIdxValue = cell.formula || '';
    }
    if (cIdxValue) {
        if (isSort) {
            context.notify(clearFormulaDependentCells, { cellRef: getCellAddress(prevIndexes[0], prevIndexes[1]) });
        }
        if (cIdxValue.indexOf('=') === 0) {
            cIdxValue = cIdxValue.slice(1);
        }
        cIdxValue = cIdxValue.split('(').join(',').split(')').join(',');
        var formulaOperators = ['+', '-', '*', '/', '>=', '<=', '<>', '>', '<', '=', '%'];
        var splitArray = void 0;
        var value = cIdxValue;
        for (var i = 0; i < formulaOperators.length; i++) {
            splitArray = value.split(formulaOperators[i]);
            value = splitArray.join(',');
        }
        splitArray = value.split(',');
        var newAddress = [];
        var newRef = void 0;
        var refObj = void 0;
        var isSheetRef = void 0;
        var cellRefArr = void 0;
        var cellRef = void 0;
        for (var j = 0; j < splitArray.length; j++) {
            isSheetRef = splitArray[j].includes('!');
            if (isSheetRef) {
                cellRefArr = splitArray[j].split('!');
                cellRef = cellRefArr[1].toUpperCase();
            }
            else {
                cellRef = splitArray[j].toUpperCase();
            }
            if (isCellReference(cellRef)) {
                var range = getRangeIndexes(cellRef);
                var newRange = [currIndexes[0] - (prevIndexes[0] - range[0]), currIndexes[1] - (prevIndexes[1] - range[1]),
                    currIndexes[0] - (prevIndexes[0] - range[2]), currIndexes[1] - (prevIndexes[1] - range[3])];
                if (newRange[1] < 0 || newRange[2] < 0 || newRange[3] < 0 || (!isSort && newRange[0] < 0)) {
                    newRef = '#REF!';
                }
                else {
                    if (isSort && newRange[0] < 0) {
                        newRange[0] = newRange[2];
                    }
                    newRef = getCellAddress(newRange[0], newRange[1]);
                    if (cellRef.includes(':')) {
                        newRef += (':' + getCellAddress(newRange[2], newRange[3]));
                    }
                    newRef = isCellReference(newRef) ? newRef : '#REF!';
                }
                refObj = {};
                if (isSheetRef) {
                    newRef = cellRefArr[0] + "!" + newRef;
                }
                refObj[splitArray[j]] = newRef;
                if (splitArray[j].includes(':')) {
                    newAddress.splice(0, 0, refObj);
                }
                else {
                    newAddress.push(refObj);
                }
            }
        }
        var objKey = void 0;
        var objValue = void 0;
        cIdxValue = cell.formula;
        var newCIdxValue = cIdxValue;
        for (var j = 0; j < newAddress.length; j++) {
            objKey = Object.keys(newAddress[j])[0];
            objValue = newAddress[j]["" + objKey];
            var objKeyLen = objKey.length;
            var positionIdx = newCIdxValue.indexOf(objKey);
            var emptyString = '';
            for (var idx = 0; idx < objValue.length; idx++) {
                emptyString += ' ';
            }
            cIdxValue = cIdxValue.slice(0, positionIdx) + objValue + cIdxValue.slice(positionIdx + objKeyLen);
            newCIdxValue = newCIdxValue.slice(0, positionIdx) + emptyString + newCIdxValue.slice(positionIdx + objKeyLen);
        }
        return cIdxValue;
    }
    else {
        return null;
    }
}
/**@hidden */
export function updateCell(context, sheet, prop) {
    var args = { cell: prop.cell, rowIndex: prop.rowIdx, colIndex: prop.colIdx, cancel: false, sheet: sheet.name };
    if (!prop.preventEvt) { // Prevent event triggering for public method cell update.
        context.trigger(beforeCellUpdate, args);
    }
    if (!prop.eventOnly && !args.cancel) { // `eventOnly` - To trigger event event and return without cell model update.
        if (prop.valChange) {
            var prevCell = getCell(args.rowIndex, args.colIndex, sheet);
            var prevCellVal = !prop.preventEvt && context.getDisplayText(prevCell);
            var isFormulaCell = !!(prevCell && prevCell.formula);
            setCell(args.rowIndex, args.colIndex, sheet, args.cell, !prop.pvtExtend);
            var cell = getCell(args.rowIndex, args.colIndex, sheet, false, true);
            var evtArgs = { action: 'updateCellValue',
                address: [args.rowIndex, args.colIndex], sheetIndex: getSheetIndex(context, sheet.name), value: isFormulaCell && !cell.formula ? (cell.value || (cell.value === 0 ? '0' : '')) : (cell.formula || cell.value ||
                    (cell.value === 0 ? '0' : '')), skipFormatCheck: prop.skipFormatCheck, isRandomFormula: prop.isRandomFormula };
            context.notify(workbookEditOperation, evtArgs);
            prop.isFormulaDependent = evtArgs.isFormulaDependent;
            if (prop.requestType && args.cell === null) {
                setCell(args.rowIndex, args.colIndex, sheet, args.cell, !prop.pvtExtend);
            }
            if (prop.cellDelete) {
                delete cell.value;
                delete cell.formula;
                delete cell.hyperlink;
            }
            if (prop.uiRefresh) {
                context.serviceLocator.getService('cell').refresh(args.rowIndex, args.colIndex, prop.lastCell, prop.td, prop.checkCF, prop.checkWrap, prop.skipFormatCheck, prop.isRandomFormula);
            }
            if (!prop.preventEvt) {
                var cellDisplayText = context.getDisplayText(cell);
                if (cellDisplayText !== prevCellVal) {
                    var cellValue = getCell(args.rowIndex, args.colIndex, sheet, false, true).value;
                    cellValue = cellValue || (cellValue === 0 ? '0' : '');
                    var evtArgs_1 = { value: cellValue, oldValue: prevCellVal, formula: cell.formula || '',
                        address: sheet.name + "!" + getCellAddress(args.rowIndex, args.colIndex), displayText: cellDisplayText };
                    if (prop.requestType) {
                        evtArgs_1.requestType = prop.requestType;
                    }
                    context.trigger('cellSave', evtArgs_1);
                }
            }
        }
        else {
            setCell(args.rowIndex, args.colIndex, sheet, args.cell, !prop.pvtExtend);
        }
    }
    return args.cancel;
}
/**
 * @param {number} rowIdx - row index
 * @param {number} colIdx - column index
 * @param {SheetModel} sheet - sheet model
 * @returns {number[]} - retruns data range
 * @hidden
 */
export function getDataRange(rowIdx, colIdx, sheet) {
    var sRowIdx = rowIdx;
    var eRowIdx = rowIdx;
    var sColIdx = colIdx;
    var eColIdx = colIdx;
    var usedRowIdx = sheet.usedRange.rowIndex;
    var usedColIdx = sheet.usedRange.colIndex;
    var isEmptyRow = function (idx) {
        for (var i = 0; i <= usedColIdx; i++) {
            if (!isUndefined(getCell(idx, i, sheet, null, true).value)) {
                return false;
            }
        }
        return true;
    };
    var isEmptyColumn = function (idx) {
        for (var i = sRowIdx; i <= eRowIdx; i++) {
            if (!isUndefined(getCell(i, idx, sheet, null, true).value)) {
                return false;
            }
        }
        return true;
    };
    for (var i = sRowIdx; i <= usedRowIdx; i++) { // To find end row index
        if (isUndefined(getCell(i, colIdx, sheet, null, true).value) && isEmptyRow(i)) {
            break;
        }
        else {
            eRowIdx = i;
        }
    }
    for (var i = sRowIdx; i >= 0; i--) { // To find start row index
        if (isUndefined(getCell(i, colIdx, sheet, null, true).value) && isEmptyRow(i)) {
            break;
        }
        else {
            sRowIdx = i;
        }
    }
    for (var i = sColIdx; i <= usedColIdx; i++) { // To find end column index
        if (isUndefined(getCell(rowIdx, i, sheet, null, true).value) && isEmptyColumn(i)) {
            break;
        }
        else {
            eColIdx = i;
        }
    }
    for (var i = sColIdx; i >= 0; i--) { // To find start column index
        if (isUndefined(getCell(rowIdx, i, sheet, null, true).value) && isEmptyColumn(i)) {
            break;
        }
        else {
            sColIdx = i;
        }
    }
    return [sRowIdx, sColIdx, eRowIdx, eColIdx];
}
/**
 * @param {InsertDeleteModelArgs} args - row index
 * @param {number[]} formatRange - format range index
 * @returns {number[]} - retruns updated range
 * @hidden
 */
export function insertFormatRange(args, formatRange, isAction) {
    var sltRangeIndex = getRangeIndexes(args.model.selectedRange);
    var insertStartIndex = 0;
    var insertEndIndex = 0;
    if (args.modelType === 'Column') {
        if (isAction) {
            sltRangeIndex = [0, args.start, 0, args.end];
        }
        if (args.insertType === 'before') {
            if ((formatRange[1] <= sltRangeIndex[1] && formatRange[3] >= sltRangeIndex[1])) {
                insertStartIndex = 0;
                insertEndIndex = (sltRangeIndex[3] - sltRangeIndex[1]) + 1;
            }
            else if (sltRangeIndex[1] < formatRange[1]) {
                insertStartIndex = insertEndIndex = (sltRangeIndex[3] - sltRangeIndex[1]) + 1;
            }
        }
        else {
            if ((formatRange[1] <= sltRangeIndex[3] && formatRange[3] >= sltRangeIndex[3])) {
                insertStartIndex = 0;
                insertEndIndex = (sltRangeIndex[3] - sltRangeIndex[1]) + 1;
            }
            else if (sltRangeIndex[3] < formatRange[3]) {
                insertStartIndex = insertEndIndex = (sltRangeIndex[3] - sltRangeIndex[1]) + 1;
            }
        }
        return [formatRange[0], formatRange[1] + insertStartIndex, formatRange[2], formatRange[3] + insertEndIndex];
    }
    else {
        if (isAction) {
            sltRangeIndex = [args.start, 0, args.end, 0];
        }
        if (args.insertType === 'above') {
            if ((formatRange[0] <= sltRangeIndex[0] && formatRange[2] >= sltRangeIndex[0])) {
                insertStartIndex = 0;
                insertEndIndex = (sltRangeIndex[2] - sltRangeIndex[0]) + 1;
            }
            else if (sltRangeIndex[0] < formatRange[0]) {
                insertStartIndex = insertEndIndex = (sltRangeIndex[2] - sltRangeIndex[0]) + 1;
            }
        }
        else {
            if ((formatRange[0] <= sltRangeIndex[2] && formatRange[2] >= sltRangeIndex[2])) {
                insertStartIndex = 0;
                insertEndIndex = (sltRangeIndex[2] - sltRangeIndex[0]) + 1;
            }
            else if (sltRangeIndex[2] < formatRange[2]) {
                insertStartIndex = insertEndIndex = (sltRangeIndex[2] - sltRangeIndex[0]) + 1;
            }
        }
        return [formatRange[0] + insertStartIndex, formatRange[1], formatRange[2] + insertEndIndex, formatRange[3]];
    }
}
/**
 * @param {InsertDeleteModelArgs} args - row index
 * @param {number[]} formatRange - cell range index
 * @returns {number[]} - retruns data range
 * @hidden
 */
export function deleteFormatRange(args, formatRange) {
    var cellRange;
    var deleteStartIndex = 0;
    var deleteEndIndex = 0;
    if (args.modelType === 'Column') {
        cellRange = [0, args.start, args.model.usedRange.rowIndex, args.end];
        if (cellRange[3] < formatRange[1]) {
            deleteStartIndex = deleteEndIndex = cellRange[3] - cellRange[1] + 1;
        }
        else if (cellRange[1] >= formatRange[1] && cellRange[3] <= formatRange[3]) {
            deleteEndIndex = cellRange[3] - cellRange[1] + 1;
        }
        else if (cellRange[1] >= formatRange[1] && cellRange[1] <= formatRange[3]) {
            deleteEndIndex = formatRange[3] - cellRange[1] + 1;
        }
        else if (cellRange[1] < formatRange[1] && cellRange[3] >= formatRange[1]) {
            deleteStartIndex = formatRange[1] - cellRange[1];
            deleteEndIndex = cellRange[3] - cellRange[1] + 1;
        }
        else if (cellRange[1] < formatRange[1] && cellRange[3] < formatRange[3]) {
            deleteStartIndex = (cellRange[3] - formatRange[1]) + (cellRange[3] - cellRange[1]) + 1;
            deleteEndIndex = cellRange[3] - cellRange[1] + 1;
        }
        return [formatRange[0], formatRange[1] - deleteStartIndex, formatRange[2], formatRange[3] - deleteEndIndex];
    }
    else {
        cellRange = [args.start, 0, args.end, args.model.usedRange.colIndex];
        if (cellRange[2] < formatRange[0]) {
            deleteStartIndex = deleteEndIndex = cellRange[2] - cellRange[0] + 1;
        }
        else if (cellRange[0] >= formatRange[0] && cellRange[2] <= formatRange[2]) {
            deleteEndIndex = cellRange[2] - cellRange[0] + 1;
        }
        else if (cellRange[0] >= formatRange[0] && cellRange[0] <= formatRange[2]) {
            deleteEndIndex = formatRange[2] - cellRange[0] + 1;
        }
        else if (cellRange[0] < formatRange[0] && cellRange[2] >= formatRange[0]) {
            deleteStartIndex = formatRange[0] - cellRange[0];
            deleteEndIndex = cellRange[2] - cellRange[0] + 1;
        }
        else if (cellRange[0] < formatRange[0] && cellRange[2] < formatRange[2]) {
            deleteStartIndex = (cellRange[2] - formatRange[0]) + (cellRange[2] - cellRange[0]) + 1;
            deleteEndIndex = cellRange[2] - cellRange[0] + 1;
        }
        return [formatRange[0] - deleteStartIndex, formatRange[1], formatRange[2] - deleteEndIndex, formatRange[3]];
    }
}
/** @hidden */
export function updateCFModel(curCF, cfRule, rowIdx, colIdx) {
    var cfRange;
    var indexes;
    for (var i = curCF.length - 1; i >= 0; i--) {
        cfRange = curCF[i].range.trim().split(',');
        for (var j = 0; j < cfRange.length; j++) {
            indexes = getRangeIndexes(cfRange[j].includes(':') ? cfRange[j] :
                cfRange[j] + ":" + cfRange[j]);
            if (rowIdx >= indexes[0] && colIdx >= indexes[1] && rowIdx <= indexes[2] && colIdx <= indexes[3]) {
                cfRule.push(curCF[i]);
                curCF.splice(i, 1);
                break;
            }
        }
    }
}
/** @hidden */
export function checkRange(indexes, range) {
    var ranges = range.trim().split(',');
    var left;
    var right;
    var top;
    var bottom;
    var cfIdx;
    var checkRange = function (idx) {
        for (var i = 0; i < ranges.length; i++) {
            cfIdx = getRangeIndexes(ranges[i].includes(':') ? ranges[i] : ranges[i] + ":" + ranges[i]);
            if (idx[0] <= cfIdx[0] && idx[1] <= cfIdx[1] && idx[2] >= cfIdx[2] && idx[3] >= cfIdx[3]) {
                return true;
            }
            else {
                top = idx[0] >= cfIdx[0] && idx[0] <= cfIdx[2];
                bottom = idx[2] >= cfIdx[0] && idx[2] <= cfIdx[2];
                left = idx[1] >= cfIdx[1] && idx[1] <= cfIdx[3];
                right = idx[3] >= cfIdx[1] && idx[3] <= cfIdx[3];
                if (top && bottom) {
                    if (left || right || (idx[1] < cfIdx[1] && idx[3] > cfIdx[3])) {
                        if (idx[0] - cfIdx[0] > 0) {
                            return true;
                        }
                        if (cfIdx[2] - idx[2] > 0) {
                            return true;
                        }
                    }
                    if (left && idx[1] !== cfIdx[1]) {
                        return true;
                    }
                    if (right && idx[3] !== cfIdx[3]) {
                        return true;
                    }
                }
                else if (left && right) {
                    if (top || bottom || (idx[0] < cfIdx[0] && idx[2] > cfIdx[2])) {
                        if (idx[1] - cfIdx[1] > 0) {
                            return true;
                        }
                        if (cfIdx[3] - idx[3] > 0) {
                            return true;
                        }
                    }
                    if (top) {
                        if (idx[0] !== cfIdx[0]) {
                            return true;
                        }
                    }
                    else if (bottom && idx[2] !== cfIdx[2]) {
                        return true;
                    }
                }
                else if (top || bottom) {
                    if (left) {
                        if (idx[1] !== cfIdx[1]) {
                            return true;
                        }
                        if (idx[0] - cfIdx[0] > 0) {
                            return true;
                        }
                        else if (cfIdx[2] - idx[2] > 0) {
                            return true;
                        }
                    }
                    else if (right) {
                        if (idx[3] !== cfIdx[3]) {
                            return true;
                        }
                        if (idx[0] - cfIdx[0] > 0) {
                            return true;
                        }
                        else if (cfIdx[2] - idx[2] > 0) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    for (var j = 0; j < indexes.length; j++) {
        if (checkRange(indexes[j])) {
            return true;
        }
    }
    return false;
}
/** @hidden */
export function parseLocaleNumber(valArr, locale) {
    var numVal;
    var groupArr;
    var curSymbol = getNumberDependable(locale, defaultCurrencyCode);
    var numObj = getNumericObject(locale);
    for (var idx = 0; idx < valArr.length; idx++) {
        numVal = valArr[idx].toString().split(curSymbol).join('');
        groupArr = numVal.split(numObj.group);
        if (groupArr.length === 1) {
            numVal = groupArr.join('');
        }
        if (numObj.decimal !== '.' && numVal.includes(numObj.decimal)) {
            numVal = numVal.replace(numObj.decimal, '.');
        }
        if (isNumber(numVal)) {
            valArr[idx] = numVal;
        }
    }
    return valArr;
}
/**
 * Returns the overall viewport indexes by including the freeze and movable part.
 *
 * @param {Workbook} parent - Specify the Workbook object.
 * @param {number} viewport - Specifies the top, bottom, left, and right index of the current viewport.
 * @returns {number[][]} - Returns the viewport indexes.
 * @hidden
 */
export function getViewportIndexes(parent, viewport) {
    var sheet = parent.getActiveSheet();
    var indexes = [[viewport.topIndex + parent.frozenRowCount(sheet), viewport.leftIndex + parent.frozenColCount(sheet),
            viewport.bottomIndex, viewport.rightIndex]];
    if (sheet.frozenRows || sheet.frozenColumns) {
        var froezenRow = parent.frozenRowCount(sheet);
        var froezenCol = parent.frozenColCount(sheet);
        var topLeftCell = getCellIndexes(sheet.topLeftCell);
        if (froezenRow && froezenCol) {
            indexes.push([topLeftCell[0], topLeftCell[1], froezenRow - 1, froezenCol - 1]);
            var paneTopLeftCell = getCellIndexes(sheet.paneTopLeftCell);
            indexes.push([paneTopLeftCell[0], topLeftCell[1], viewport.bottomIndex, froezenCol - 1]);
        }
        if (froezenRow) {
            indexes.push([topLeftCell[0], viewport.leftIndex + froezenCol, froezenRow - 1, viewport.rightIndex]);
        }
        if (froezenCol) {
            indexes.push([viewport.topIndex + froezenRow, topLeftCell[1], viewport.bottomIndex,
                froezenCol - 1]);
        }
    }
    return indexes;
}
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
export function setVisibleMergeIndex(args) {
    if (isHiddenRow(args.sheet, args.rowIdx)) {
        var idx = skipHiddenIdx(args.sheet, args.rowIdx, true);
        if (idx < args.rowIdx + args.cell.rowSpan) {
            args.rowIdx = idx;
            args.isMergedHiddenCell = true;
        }
    }
    if (isHiddenCol(args.sheet, args.colIdx)) {
        var idx = skipHiddenIdx(args.sheet, args.colIdx, true, 'columns');
        if (idx < args.colIdx + args.cell.colSpan) {
            args.colIdx = idx;
            args.isMergedHiddenCell = true;
        }
    }
}
