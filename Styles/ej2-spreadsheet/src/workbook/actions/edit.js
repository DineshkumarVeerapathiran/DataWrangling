import { getCell, getSheet } from '../base/index';
import { workbookEditOperation, checkDateFormat, workbookFormulaOperation, refreshChart, checkUniqueRange } from '../common/event';
import { getRangeIndexes, parseIntValue, setLinkModel, getCellAddress } from '../common/index';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { checkIsFormula } from '../../workbook/common/index';
import { getTypeFromFormat } from '../integrations/index';
/**
 * The `WorkbookEdit` module is used to handle the editing functionalities in Workbook.
 */
var WorkbookEdit = /** @class */ (function () {
    /**
     * Constructor for edit module in Workbook.
     *
     * @private
     * @param {Workbook} workbook - Specifies the workbook.
     */
    function WorkbookEdit(workbook) {
        this.parent = workbook;
        this.addEventListener();
    }
    /**
     * To destroy the edit module.
     *
     * @returns {void} - destroy the edit module
     * @hidden
     */
    WorkbookEdit.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookEdit.prototype.addEventListener = function () {
        this.parent.on(workbookEditOperation, this.performEditOperation, this);
    };
    WorkbookEdit.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(workbookEditOperation, this.performEditOperation);
        }
    };
    /**
     * Get the module name.
     *
     * @returns {string} - string
     * @private
     */
    WorkbookEdit.prototype.getModuleName = function () {
        return 'workbookEdit';
    };
    WorkbookEdit.prototype.performEditOperation = function (args) {
        var action = args.action;
        switch (action) {
            case 'updateCellValue':
                args.isFormulaDependent = this.updateCellValue(args.address, args.value, args.sheetIndex, args.isValueOnly, args.skipFormatCheck, args.isRandomFormula);
                break;
        }
    };
    WorkbookEdit.prototype.updateCellValue = function (address, value, sheetIdx, isValueOnly, skipFormatCheck, isRandomFormula) {
        if (sheetIdx === undefined) {
            sheetIdx = this.parent.activeSheetIndex;
        }
        var range;
        var isFormulaDependent;
        if (typeof address === 'string') {
            range = getRangeIndexes(address);
        }
        else {
            range = address;
        }
        var sheet = getSheet(this.parent, sheetIdx);
        var cell = getCell(range[0], range[1], sheet, true);
        if (!cell) {
            cell = sheet.rows[range[0]].cells[range[1]] = {};
        }
        if (!isValueOnly) {
            var isFormula = checkIsFormula(value);
            isFormula = value === '#SPILL!' ? true : isFormula;
            var skipFormula = false; // for unique formula
            if (cell.formula && cell.formula.indexOf('UNIQUE') > -1 && value === '') {
                skipFormula = true;
            }
            var isNotTextFormat = getTypeFromFormat(cell.format) !== 'Text' && (!isFormula ||
                !value.toLowerCase().startsWith('=text('));
            if (!isFormula && !skipFormula) {
                if (cell.formula) {
                    cell.formula = '';
                }
                cell.value = isNotTextFormat ? parseIntValue(value) : value;
            }
            var eventArgs = {
                action: 'refreshCalculate',
                value: value,
                rowIndex: range[0],
                colIndex: range[1],
                sheetIndex: sheetIdx,
                isFormula: isFormula,
                isRandomFormula: isRandomFormula
            };
            if (isNotTextFormat && !skipFormatCheck) {
                var dateEventArgs = {
                    value: value,
                    rowIndex: range[0],
                    colIndex: range[1],
                    sheetIndex: sheetIdx,
                    updatedVal: ''
                };
                if (!isFormula) {
                    this.parent.notify(checkDateFormat, dateEventArgs);
                }
                else if (value.toLowerCase().includes('unique(')) {
                    dateEventArgs.updatedVal = value;
                }
                if (!isNullOrUndefined(dateEventArgs.updatedVal) && dateEventArgs.updatedVal.length > 0) {
                    cell.value = dateEventArgs.updatedVal;
                }
            }
            if (value === '#SPILL!') {
                cell.value = value;
            }
            else {
                var args = { cellIdx: range, isUnique: false };
                this.parent.notify(checkUniqueRange, args);
                if (!skipFormula) {
                    this.parent.notify(workbookFormulaOperation, eventArgs);
                    isFormulaDependent = eventArgs.isFormulaDependent;
                }
                else {
                    value = cell.value;
                }
                if (isFormula) {
                    cell.formula = eventArgs.value;
                    value = cell.value;
                    var formula = cell.formula.toLowerCase();
                    if (formula === '=now()' && !cell.format) {
                        cell.format = 'M/d/yyyy h:mm';
                    }
                    else if (formula.includes('=time(') && !cell.format) {
                        cell.format = 'h:mm AM/PM';
                    }
                }
                else if (cell.value && typeof cell.value === 'string' && (cell.value.indexOf('www.') === 0 ||
                    cell.value.indexOf('https://') === 0 || cell.value.indexOf('http://') === 0 || cell.value.indexOf('ftp://') === 0)) {
                    this.parent.notify(setLinkModel, { hyperlink: cell.value, cell: sheet.name + "!" + getCellAddress(range[0], range[1]) });
                }
            }
        }
        else {
            cell.value = value;
        }
        this.parent.setUsedRange(range[0], range[1], sheet);
        if (this.parent.chartColl.length && !this.parent.isEdit && !isRandomFormula) {
            this.parent.notify(refreshChart, { cell: cell, rIdx: range[0], cIdx: range[1], sheetIdx: sheetIdx });
        }
        return isFormulaDependent;
    };
    return WorkbookEdit;
}());
export { WorkbookEdit };
