import { editAlert, completeAction } from '../index';
import { isValidation, checkDateFormat, applyCellFormat, activeCellChanged } from '../../workbook/common/event';
import { getCell, setCell } from '../../workbook/base/cell';
import { FormValidator, NumericTextBox } from '@syncfusion/ej2-inputs';
import { EventHandler, remove, closest, isNullOrUndefined, select, Browser } from '@syncfusion/ej2-base';
import { dialog, locale, initiateDataValidation, invalidData, editOperation, keyUp, focus } from '../common/index';
import { formulaBarOperation, removeDataValidation } from '../common/index';
import { CheckBox } from '@syncfusion/ej2-buttons';
import { isHiddenRow, setRow, beginAction, getSwapRange, checkColumnValidation } from '../../workbook/index';
import { getRangeIndexes, getIndexesFromAddress, getCellIndexes, cellValidation, updateCell, isInMultipleRange } from '../../workbook/common/index';
import { getData, isCellReference, parseLocaleNumber } from '../../workbook/index';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { getSheet, getSheetIndex, checkIsFormula } from '../../workbook/index';
import { getColumn, isLocked, getRowsHeight, getColumnsWidth, validationHighlight, formulaInValidation } from '../../workbook/index';
/**
 * Represents Data Validation support for Spreadsheet.
 */
var DataValidation = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet Data Validation module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet Data Validation module.
     */
    function DataValidation(parent) {
        this.data = [];
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the Data Validation module.
     *
     * @returns {void}
     */
    DataValidation.prototype.destroy = function () {
        this.removeEventListener();
        var dataValPopup = select('#' + this.parent.element.id + '_datavalidation-popup');
        if (dataValPopup) {
            dataValPopup.remove();
        }
        this.parent = null;
    };
    DataValidation.prototype.addEventListener = function () {
        EventHandler.add(this.parent.element, 'dblclick', this.listOpen, this);
        this.parent.on(initiateDataValidation, this.initiateDataValidationHandler, this);
        this.parent.on(invalidData, this.invalidDataHandler, this);
        this.parent.on(isValidation, this.checkDataValidation, this);
        this.parent.on(activeCellChanged, this.listHandler, this);
        this.parent.on(keyUp, this.keyUpHandler, this);
        this.parent.on(removeDataValidation, this.removeValidationHandler, this);
        this.parent.on(validationHighlight, this.InvalidElementHandler, this);
    };
    DataValidation.prototype.removeEventListener = function () {
        EventHandler.remove(this.parent.element, 'dblclick', this.listOpen);
        if (!this.parent.isDestroyed) {
            this.parent.off(initiateDataValidation, this.initiateDataValidationHandler);
            this.parent.off(invalidData, this.invalidDataHandler);
            this.parent.off(isValidation, this.checkDataValidation);
            this.parent.off(activeCellChanged, this.listHandler);
            this.parent.off(keyUp, this.keyUpHandler);
            this.parent.off(removeDataValidation, this.removeValidationHandler);
            this.parent.off(validationHighlight, this.InvalidElementHandler);
        }
    };
    DataValidation.prototype.removeValidationHandler = function (eventArgs) {
        var sheet;
        var range;
        var args = { cancel: false, isColSelected: eventArgs.isCol };
        var actualRange = eventArgs.range;
        if (eventArgs.range && eventArgs.range.includes('!')) {
            range = eventArgs.range;
            sheet = getSheet(this.parent, getSheetIndex(this.parent, range.split('!')[0]));
            if (!sheet) {
                return;
            }
        }
        else {
            sheet = this.parent.getActiveSheet();
            range = sheet.name + '!';
            if (eventArgs.range) {
                range += eventArgs.range;
            }
            else {
                var rangeArgs = this.getRange(sheet.selectedRange);
                range += rangeArgs.range;
                args.isColSelected = rangeArgs.isColSelected;
            }
        }
        actualRange = sheet.selectedRange;
        args.range = range;
        if (eventArgs.isAction) {
            this.parent.notify(beginAction, { eventArgs: args, action: 'removeValidation' });
        }
        if (!args.cancel) {
            var isListValidation = void 0;
            var modelObj = void 0;
            var actCelIdx = void 0;
            if (sheet.name === this.parent.getActiveSheet().name) {
                actCelIdx = getCellIndexes(sheet.activeCell);
                var indexes = getSwapRange(getRangeIndexes(actualRange));
                if (actCelIdx[0] >= indexes[0] && actCelIdx[1] >= indexes[1] && actCelIdx[0] <= indexes[2] && actCelIdx[1] <= indexes[3]) {
                    modelObj = args.isColSelected ? getColumn(sheet, actCelIdx[1]) || {} :
                        getCell(actCelIdx[0], actCelIdx[1], sheet, false, true);
                    isListValidation = modelObj.validation && modelObj.validation.type === 'List';
                }
            }
            this.parent.notify(cellValidation, { range: range, isRemoveValidation: true, viewport: this.parent.viewport });
            if (isListValidation && !modelObj.validation) {
                var td = this.parent.getCell(actCelIdx[0], actCelIdx[1]);
                if (td && td.getElementsByClassName('e-validation-list')[0]) {
                    this.listObj.destroy();
                    td.removeChild(td.getElementsByClassName('e-validation-list')[0]);
                }
            }
            if (eventArgs.isAction) {
                delete args.cancel;
                this.parent.notify(completeAction, { eventArgs: args, action: 'removeValidation' });
            }
        }
    };
    DataValidation.prototype.keyUpHandler = function (e) {
        var target = e.target;
        var dlgEle = this.parent.element.querySelector('.e-datavalidation-dlg');
        if (closest(target, '.e-values') && dlgEle && e.keyCode !== 13) {
            var valuesCont = dlgEle.querySelector('.e-values');
            var errorEle = valuesCont.querySelector('.e-dlg-error');
            var footerCont = dlgEle.querySelector('.e-footer-content');
            var primaryBut = footerCont.querySelector('.e-primary');
            if (primaryBut.hasAttribute('disabled')) {
                primaryBut.removeAttribute('disabled');
            }
            if (errorEle) {
                valuesCont.removeChild(errorEle);
            }
        }
    };
    DataValidation.prototype.listOpen = function (e) {
        var target = e.target;
        if (this.listObj && target.classList.contains('e-cell') && target.querySelector('.e-validation-list')) {
            this.listObj.showPopup();
        }
    };
    DataValidation.prototype.invalidDataHandler = function (args) {
        var eventArgs = { range: args.range || this.parent.dataValidationRange, cancel: false };
        if (!eventArgs.range) {
            return;
        }
        var actionArgs;
        if (!args.isPublic) {
            actionArgs = { eventArgs: eventArgs, action: args.isRemoveHighlight ? 'removeHighlight' : 'addHighlight' };
            this.parent.notify(beginAction, actionArgs);
            if (eventArgs.cancel) {
                return;
            }
        }
        if (args.isRemoveHighlight) {
            this.parent.removeInvalidHighlight(eventArgs.range);
        }
        else {
            this.parent.addInvalidHighlight(eventArgs.range);
        }
        if (!args.isPublic) {
            this.parent.notify(completeAction, actionArgs);
        }
    };
    DataValidation.prototype.listHandler = function () {
        var _this = this;
        if (this.parent.allowDataValidation) {
            var sheet_1 = this.parent.getActiveSheet();
            var indexes = getCellIndexes(sheet_1.activeCell);
            var cell = getCell(indexes[0], indexes[1], sheet_1);
            var tdEle_1 = this.parent.getCell(indexes[0], indexes[1]);
            if (!tdEle_1) {
                return;
            }
            if (document.getElementsByClassName('e-validation-list')[0]) {
                remove(document.getElementsByClassName('e-validation-list')[0]);
                this.data = [];
            }
            var validation = (cell && cell.validation) || (sheet_1.columns && sheet_1.columns[indexes[1]] &&
                sheet_1.columns[indexes[1]].validation);
            if (validation && validation.type === 'List') {
                if (validation.address && !isInMultipleRange(validation.address, indexes[0], indexes[1])) {
                    return;
                }
                validation.ignoreBlank = !isNullOrUndefined(validation.ignoreBlank) ? validation.ignoreBlank : true;
                validation.inCellDropDown = !isNullOrUndefined(validation.inCellDropDown) ?
                    validation.inCellDropDown : true;
                if (validation.inCellDropDown) {
                    var ddlCont = this.parent.createElement('div', { className: 'e-validation-list' });
                    var ddlEle = this.parent.createElement('input', { id: this.parent.element.id + 'listValid' });
                    ddlCont.appendChild(ddlEle);
                    if (!validation.inCellDropDown) {
                        ddlCont.style.display = 'none';
                    }
                    var parent_1 = tdEle_1.getElementsByClassName('e-wrap-content')[0] || tdEle_1;
                    parent_1.insertBefore(ddlCont, parent_1.firstChild);
                    var dataSource = this.updateDataSource(cell, validation);
                    this.listObj = new DropDownList({
                        index: this.setDropDownListIndex(dataSource, cell),
                        dataSource: dataSource,
                        fields: { text: 'text', value: 'id' },
                        width: '0px',
                        popupHeight: '200px',
                        change: function () { return _this.listValueChange(_this.listObj.text); },
                        open: function (args) {
                            args.popup.offsetX = -(tdEle_1.offsetWidth - 20) + 4;
                            args.popup.offsetY = -13;
                            args.popup.element.style.width = tdEle_1.offsetWidth - 1 + 'px';
                            // Positioning popup in mobile device based on transform css applied on virtual element as suggested by dropdown team
                            if (Browser.isDevice && _this.parent.scrollModule) {
                                var offset = _this.parent.scrollModule.offset;
                                var viewport = _this.parent.viewport;
                                args.popup.offsetY += viewport.topIndex ? offset.top.size -
                                    getRowsHeight(sheet_1, viewport.topIndex + 1, offset.top.idx, true) : 0;
                                args.popup.offsetX += viewport.leftIndex ? offset.left.size -
                                    getColumnsWidth(sheet_1, viewport.leftIndex + 1, offset.left.idx, true) : 0;
                                args.popup.refresh();
                                args.popup.element.style.width = tdEle_1.offsetWidth - 1 + 'px';
                            }
                        },
                        close: function (args) {
                            if (args.event && (args.event.keyCode === 13 ||
                                (args.event.altKey && args.event.keyCode === 38))) {
                                args.event.preventDefault();
                                args.event.stopPropagation();
                            }
                            focus(_this.parent.element);
                        }
                    });
                    this.listObj.appendTo('#' + this.parent.element.id + 'listValid');
                }
            }
            if (cell && cell.validation) {
                cell.validation = validation;
            }
        }
    };
    DataValidation.prototype.setDropDownListIndex = function (dataSource, cell) {
        if (cell && cell.value) {
            for (var dataIdx = 0, len = dataSource.length; dataIdx < len; dataIdx++) {
                if (dataSource[dataIdx].text === cell.value.toString()) {
                    return dataIdx;
                }
            }
        }
        return null;
    };
    DataValidation.prototype.updateDataSource = function (cell, validation) {
        var _this = this;
        this.data = [];
        var count = 0;
        var definedNames = this.parent.definedNames;
        var value = validation.value1;
        var isRange = value.indexOf('=') !== -1;
        if (definedNames.length > 0 && isRange) {
            var listValue = value.split('=')[1];
            for (var idx = 0, len = definedNames.length; idx < len; idx++) {
                if (definedNames[idx].name === listValue) {
                    var definedNameRange = definedNames[idx].refersTo;
                    // eslint-disable-next-line
                    while (definedNameRange.includes("'")) {
                        // eslint-disable-next-line
                        definedNameRange = definedNameRange.replace("'", '');
                    }
                    value = definedNameRange;
                }
            }
        }
        if (isRange) {
            var sheet = value.indexOf('!') > -1 ?
                getSheet(this.parent, getSheetIndex(this.parent, value.split('=')[1].split('!')[0])) : this.parent.getActiveSheet();
            var address = value.indexOf('!') > -1 ? value.split('!')[1] : value.split('=')[1];
            var activeSheet_1 = this.parent.getActiveSheet();
            if (sheet.name !== activeSheet_1.name) {
                var isNotLoaded_1;
                var selectedRange_1 = getRangeIndexes(activeSheet_1.selectedRange);
                sheet.ranges.forEach(function (range) {
                    if (!range.info || !range.info.loadedRange || !range.info.loadedRange.length) {
                        isNotLoaded_1 = true;
                        return;
                    }
                });
                if (isNotLoaded_1) {
                    this.parent.showSpinner();
                    getData(this.parent, sheet.name + "!" + address).then(function () {
                        _this.parent.hideSpinner();
                        if (activeSheet_1.name === _this.parent.getActiveSheet().name) {
                            var curRange = getRangeIndexes(_this.parent.getActiveSheet().selectedRange);
                            if (curRange[0] === selectedRange_1[0] && curRange[1] === selectedRange_1[1]) {
                                _this.listObj.dataSource = _this.updateDataSource(cell, validation);
                                _this.listObj.dataBind();
                            }
                        }
                    });
                }
            }
            var indexes = void 0;
            var range = address.split(':');
            if ((range[0].match(/[a-z]+$/ig) && range[1].match(/[a-z]+$/ig)) || (range[0].match(/^[0-9]/g) && range[1].match(/^[0-9]/g))) {
                var addressInfo = this.parent.getIndexes(address);
                if (addressInfo.isCol) {
                    indexes = [0, addressInfo.startIdx, sheet.usedRange.rowIndex, addressInfo.startIdx];
                }
                else {
                    indexes = [addressInfo.startIdx, 0, addressInfo.startIdx, sheet.usedRange.colIndex];
                }
            }
            else {
                indexes = getRangeIndexes(address);
            }
            for (var rowIdx = indexes[0]; rowIdx <= indexes[2]; rowIdx++) {
                if (!sheet.rows[rowIdx]) {
                    setRow(sheet, rowIdx, {});
                }
                for (var colIdx = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                    if (!sheet.rows[rowIdx].cells) {
                        setCell(rowIdx, colIdx, sheet, {});
                    }
                    count += 1;
                    cell = sheet.rows[rowIdx].cells[colIdx];
                    var data = this.parent.getDisplayText(cell) || '';
                    this.data.push({ text: data, id: 'list-' + count });
                }
            }
        }
        else {
            var listValues = value.split(',');
            for (var idx = 0; idx < listValues.length; idx++) {
                count += 1;
                this.data.push({ text: listValues[idx], id: 'list-' + count });
            }
        }
        return this.data;
    };
    DataValidation.prototype.listValueChange = function (value) {
        this.parent.notify(formulaBarOperation, { action: 'refreshFormulabar', value: value });
        var sheet = this.parent.getActiveSheet();
        var cellIdx = getIndexesFromAddress(sheet.activeCell);
        var cellObj = Object.assign({}, getCell(cellIdx[0], cellIdx[1], sheet));
        if (sheet.isProtected && isLocked(cellObj, getColumn(sheet, cellIdx[1]))) {
            this.parent.notify(editAlert, null);
        }
        else {
            if (this.parent.isEdit) {
                this.parent.closeEdit();
            }
            var args = { value: value, oldValue: cellObj.value, address: sheet.name + '!' + sheet.activeCell, cancel: false };
            this.parent.notify(beginAction, { action: 'cellSave', eventArgs: args });
            if (args.cancel) {
                return;
            }
            updateCell(this.parent, sheet, { cell: { value: value }, rowIdx: cellIdx[0], colIdx: cellIdx[1], valChange: true, lastCell: true,
                uiRefresh: true, checkCF: true });
            this.parent.notify(completeAction, { action: 'cellSave', eventArgs: { value: value, oldValue: cellObj.value, address: sheet.name + '!' + sheet.activeCell } });
        }
    };
    DataValidation.prototype.getRange = function (range) {
        var indexes = getRangeIndexes(range);
        var sheet = this.parent.getActiveSheet();
        var maxRowCount = sheet.rowCount;
        var maxColCount = sheet.colCount;
        var isColSelected;
        if (indexes[2] === maxRowCount - 1 && indexes[0] === 0) {
            range = range.replace(/[0-9]/g, '');
            isColSelected = true;
        }
        else if (indexes[3] === maxColCount - 1 && indexes[2] === 0) {
            range = range.replace(/\D/g, '');
        }
        return { range: range, isColSelected: isColSelected };
    };
    DataValidation.prototype.initiateDataValidationHandler = function (okClick, noClick) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var type;
        var operator;
        var value1;
        var value2;
        var ignoreBlank = true;
        var inCellDropDown = true;
        var isNew = true;
        var sheet = this.parent.getActiveSheet();
        var cell;
        var range = sheet.selectedRange;
        var indexes = getSwapRange(getRangeIndexes(range));
        range = this.getRange(range).range;
        var validationArgs = this.validateRange(indexes, sheet);
        if (!validationArgs.extendValidation && !validationArgs.moreValidation || okClick) {
            for (var rowIdx = indexes[0]; rowIdx <= indexes[2]; rowIdx++) {
                if (sheet.rows[rowIdx]) {
                    for (var colIdx = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                        if (sheet.rows[rowIdx].cells && sheet.rows[rowIdx].cells[colIdx]) {
                            cell = sheet.rows[rowIdx].cells[colIdx];
                            if (cell.validation) {
                                isNew = false;
                                type = cell.validation.type;
                                operator = cell.validation.operator;
                                value1 = cell.validation.value1;
                                value2 = cell.validation.value2;
                                ignoreBlank = !isNullOrUndefined(cell.validation.ignoreBlank) ?
                                    cell.validation.ignoreBlank : ignoreBlank;
                                inCellDropDown = !isNullOrUndefined(cell.validation.inCellDropDown) ?
                                    cell.validation.inCellDropDown : inCellDropDown;
                            }
                        }
                    }
                }
            }
            if (isNew) {
                for (var i = indexes[1]; i <= indexes[3]; i++) {
                    var column = getColumn(sheet, i);
                    if (column && column.validation) {
                        isNew = false;
                        type = column.validation.type;
                        operator = column.validation.operator;
                        value1 = column.validation.value1;
                        value2 = column.validation.value2;
                        ignoreBlank = !isNullOrUndefined(column.validation.ignoreBlank) ?
                            column.validation.ignoreBlank : ignoreBlank;
                        inCellDropDown = !isNullOrUndefined(column.validation.inCellDropDown) ?
                            column.validation.inCellDropDown : inCellDropDown;
                    }
                }
            }
            if (!this.parent.element.querySelector('.e-datavalidation-dlg')) {
                var dialogInst_1 = this.parent.serviceLocator.getService(dialog);
                dialogInst_1.show({
                    width: 375, showCloseIcon: true, isModal: true, cssClass: 'e-datavalidation-dlg',
                    header: l10n.getConstant('DataValidation'),
                    beforeOpen: function (args) {
                        var dlgArgs = {
                            dialogName: 'ValidationDialog', element: args.element,
                            target: args.target, cancel: args.cancel
                        };
                        _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                        if (dlgArgs.cancel) {
                            args.cancel = true;
                        }
                        if (noClick) {
                            isNew = true;
                        }
                        dialogInst_1.dialogInstance.content =
                            _this.dataValidationContent(isNew, type, operator, value1, value2, ignoreBlank, inCellDropDown, range);
                        dialogInst_1.dialogInstance.dataBind();
                        focus(_this.parent.element);
                    },
                    buttons: [{
                            buttonModel: {
                                content: l10n.getConstant('ClearAll'),
                                cssClass: 'e-btn e-clearall-btn e-flat'
                            },
                            click: function () {
                                dialogInst_1.dialogInstance.content =
                                    _this.dataValidationContent(true, type, operator, value1, value2, ignoreBlank, inCellDropDown, range);
                                dialogInst_1.dialogInstance.dataBind();
                            }
                        },
                        {
                            buttonModel: {
                                content: l10n.getConstant('Apply'), isPrimary: true
                            },
                            click: function () {
                                _this.dlgClickHandler(dialogInst_1);
                            }
                        }]
                });
                dialogInst_1.dialogInstance.refresh();
            }
        }
        else {
            if (validationArgs.moreValidation) {
                this.moreValidationDlg();
            }
            if (validationArgs.extendValidation) {
                this.extendValidationDlg();
            }
        }
    };
    DataValidation.prototype.dataValidationContent = function (isNew, type, operator, val1, val2, ignoreBlank, inCellDropDown, range) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var value1 = isNew ? '0' : val1;
        var value2 = isNew ? '0' : val2;
        var dlgContent = this.parent.createElement('div', { className: 'e-validation-dlg' });
        var cellRangeCont = this.parent.createElement('div', { className: 'e-cellrange' });
        var allowDataCont = this.parent.createElement('div', { className: 'e-allowdata' });
        var valuesCont = this.parent.createElement('div', { className: 'e-values' });
        var ignoreBlankCont = this.parent.createElement('div', { className: 'e-ignoreblank' });
        dlgContent.appendChild(cellRangeCont);
        dlgContent.appendChild(allowDataCont);
        dlgContent.appendChild(valuesCont);
        dlgContent.appendChild(ignoreBlankCont);
        var cellRangeText = this.parent.createElement('span', { className: 'e-header' });
        cellRangeText.innerText = l10n.getConstant('CellRange');
        var cellRangeEle = this.parent.createElement('input', {
            className: 'e-input',
            attrs: { value: range, 'aria-label': l10n.getConstant('CellRange') }
        });
        cellRangeCont.appendChild(cellRangeText);
        cellRangeCont.appendChild(cellRangeEle);
        var allowCont = this.parent.createElement('div', { className: 'e-allow' });
        var dataCont = this.parent.createElement('div', { className: 'e-data' });
        allowDataCont.appendChild(allowCont);
        allowDataCont.appendChild(dataCont);
        var allowText = this.parent.createElement('span', { className: 'e-header' });
        allowText.innerText = l10n.getConstant('Allow');
        this.typeData = [
            { text: l10n.getConstant('WholeNumber'), id: 'type-1' },
            { text: l10n.getConstant('Decimal'), id: 'type-2' },
            { text: l10n.getConstant('Date'), id: 'type-3' },
            { text: l10n.getConstant('Time'), id: 'type-4' },
            { text: l10n.getConstant('TextLength'), id: 'type-5' },
            { text: l10n.getConstant('List'), id: 'type-6' }
        ];
        this.operatorData = [
            { text: l10n.getConstant('Between'), id: 'operator-1' },
            { text: l10n.getConstant('NotBetween'), id: 'operator-2' },
            { text: l10n.getConstant('EqualTo'), id: 'operator-3' },
            { text: l10n.getConstant('NotEqualTo'), id: 'operator-4' },
            { text: l10n.getConstant('GreaterThan'), id: 'operator-5' },
            { text: l10n.getConstant('LessThan'), id: 'operator-6' },
            { text: l10n.getConstant('GreaterThanOrEqualTo'), id: 'operator-7' },
            { text: l10n.getConstant('LessThanOrEqualTo'), id: 'operator-8' }
        ];
        var allowSelectEle = this.parent.createElement('input', { className: 'e-select' });
        if (type) {
            type = this.FormattedType(type);
        }
        var allowIdx = 0;
        if (!isNew) {
            for (var idx = 0; idx < this.typeData.length; idx++) {
                if (type === this.FormattedType(this.typeData[idx].text)) {
                    allowIdx = idx;
                    break;
                }
            }
        }
        if (isNew || type !== 'List') {
            var dataIdx = 0;
            var dataText = this.parent.createElement('span', { className: 'e-header' });
            dataText.innerText = l10n.getConstant('Data');
            var dataSelectEle = this.parent.createElement('input', { className: 'e-select' });
            if (!isNew) {
                for (var idx = 0; idx < this.operatorData.length; idx++) {
                    if (operator === this.FormattedValue(this.operatorData[idx].text)) {
                        dataIdx = idx;
                        break;
                    }
                }
            }
            dataCont.appendChild(dataText);
            dataCont.appendChild(dataSelectEle);
            this.dataList = new DropDownList({
                dataSource: this.operatorData,
                index: dataIdx,
                popupHeight: '200px',
                change: function () { _this.userInput(listObj, _this.dataList); }
            });
            this.dataList.appendTo(dataSelectEle);
        }
        else {
            var ignoreBlankEle_1 = this.parent.createElement('input', { className: 'e-checkbox' });
            dataCont.appendChild(ignoreBlankEle_1);
            var ignoreBlankObj_1 = new CheckBox({ label: l10n.getConstant('InCellDropDown'), checked: inCellDropDown });
            ignoreBlankObj_1.appendTo(ignoreBlankEle_1);
        }
        allowCont.appendChild(allowText);
        allowCont.appendChild(allowSelectEle);
        var listObj = new DropDownList({
            dataSource: this.typeData,
            index: allowIdx,
            popupHeight: '200px',
            change: function () { _this.userInput(listObj, _this.dataList); }
        });
        listObj.appendTo(allowSelectEle);
        if (isNew || (listObj.value !== l10n.getConstant('List') && (this.dataList.value === l10n.getConstant('Between') || this.dataList.value === l10n.getConstant('NotBetween')))) {
            var minimumCont = this.parent.createElement('div', { className: 'e-minimum' });
            var maximumCont = this.parent.createElement('div', { className: 'e-maximum' });
            valuesCont.appendChild(minimumCont);
            valuesCont.appendChild(maximumCont);
            var minimumText = this.parent.createElement('span', { className: 'e-header' });
            minimumText.innerText = l10n.getConstant('Minimum');
            var maximumText = this.parent.createElement('span', { className: 'e-header' });
            maximumText.innerText = l10n.getConstant('Maximum');
            var minimumInp = this.parent.createElement('input', {
                id: 'minvalue',
                className: 'e-input', attrs: { value: value1, 'aria-label': l10n.getConstant('Minimum') }
            });
            var maximumInp = this.parent.createElement('input', {
                id: 'maxvalue',
                className: 'e-input', attrs: { value: value2, 'aria-label': l10n.getConstant('Maximum') }
            });
            minimumCont.appendChild(minimumText);
            minimumCont.appendChild(minimumInp);
            maximumCont.appendChild(maximumText);
            maximumCont.appendChild(maximumInp);
            var numericMin = new NumericTextBox({
                value: 0
            });
            numericMin.appendTo('#minvalue');
            var numericMax = new NumericTextBox({
                value: 0
            });
            numericMax.appendTo('#maxvalue');
        }
        else if (!isNew && type === 'List') {
            var valueText = this.parent.createElement('span', { className: 'e-header' });
            valueText.innerText = l10n.getConstant('Sources');
            var valueEle = this.parent.createElement('input', { className: 'e-input', attrs: { value: value1 } });
            valuesCont.appendChild(valueText);
            valuesCont.appendChild(valueEle);
        }
        else {
            var valueText = this.parent.createElement('span', { className: 'e-header' });
            valueText.innerText = l10n.getConstant('Value');
            var valueEle = this.parent.createElement('input', { className: 'e-input', attrs: { value: value1 } });
            valuesCont.appendChild(valueText);
            valuesCont.appendChild(valueEle);
        }
        var isChecked = ignoreBlank;
        var ignoreBlankEle = this.parent.createElement('input', { className: 'e-checkbox' });
        ignoreBlankCont.appendChild(ignoreBlankEle);
        var ignoreBlankObj = new CheckBox({ label: l10n.getConstant('IgnoreBlank'), checked: isChecked });
        ignoreBlankObj.appendTo(ignoreBlankEle);
        return dlgContent;
    };
    DataValidation.prototype.validateRange = function (indexes, sheet) {
        var moreValidation = false;
        var extendValidation = false;
        var type = [];
        var operator = [];
        var value1 = [];
        var value2 = [];
        for (var rowIndex = indexes[0]; rowIndex <= indexes[2]; rowIndex++) {
            if (sheet.rows[rowIndex]) {
                for (var colIdx = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                    if (sheet.rows[rowIndex].cells && sheet.rows[rowIndex].cells[colIdx]) {
                        var cell = sheet.rows[rowIndex].cells[colIdx];
                        if (cell.validation) {
                            type.push(cell.validation.type);
                            operator.push(cell.validation.operator);
                            value1.push(cell.validation.value1);
                            value2.push(cell.validation.value2);
                        }
                    }
                }
            }
        }
        for (var i = indexes[1]; i <= indexes[3]; i++) {
            var column = getColumn(sheet, i);
            if (column && column.validation) {
                type.push(column.validation.type);
                operator.push(column.validation.operator);
                value1.push(column.validation.value1);
                value2.push(column.validation.value2);
            }
        }
        var tmp = [];
        for (var i = 0; i < type.length; i++) {
            if (tmp.indexOf(type[i]) === -1) {
                tmp.push(type[i]);
            }
        }
        if (tmp.length > 1) {
            moreValidation = true;
        }
        if (!moreValidation) {
            tmp = [];
            for (var j = 0; j < operator.length; j++) {
                if (tmp.indexOf(operator[j]) === -1) {
                    tmp.push(operator[j]);
                }
            }
            if (tmp.length > 1) {
                moreValidation = true;
            }
        }
        if (!moreValidation) {
            tmp = [];
            for (var j = 0; j < value1.length; j++) {
                if (tmp.indexOf(value1[j]) === -1) {
                    tmp.push(value1[j]);
                }
            }
            if (tmp.length > 1) {
                moreValidation = true;
            }
        }
        if (!moreValidation) {
            tmp = [];
            for (var j = 0; j < value2.length; j++) {
                if (tmp.indexOf(value2[j]) === -1) {
                    tmp.push(value2[j]);
                }
            }
            if (tmp.length > 1) {
                moreValidation = true;
            }
        }
        if (!moreValidation) {
            var count = 0;
            var cellCount = 0;
            for (var startRow = indexes[0]; startRow <= indexes[2]; startRow++) {
                if (sheet.rows[startRow]) {
                    for (var colIdx = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                        if (sheet.rows[startRow].cells && sheet.rows[startRow].cells[colIdx]) {
                            var cell = sheet.rows[startRow].cells[colIdx];
                            cellCount++;
                            if (cell.validation) {
                                count++;
                            }
                        }
                    }
                }
            }
            if (count === 0) {
                for (var i = indexes[1]; i <= indexes[3]; i++) {
                    var column = getColumn(sheet, i);
                    if (column && column.validation) {
                        count++;
                    }
                }
            }
            if (count > 0 && cellCount > 1 && count !== cellCount) {
                extendValidation = true;
            }
        }
        return { moreValidation: moreValidation, extendValidation: extendValidation };
    };
    DataValidation.prototype.moreValidationDlg = function () {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var dialogInst = this.parent.serviceLocator.getService(dialog);
        var skip = false;
        var dlg = {
            width: 350, isModal: true, showCloseIcon: true, cssClass: 'e-goto-dlg',
            header: l10n.getConstant('Spreadsheet'),
            beforeOpen: function (args) {
                var dlgArgs = {
                    dialogName: 'MoreValidation',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                }
                dialogInst.dialogInstance.content = l10n.getConstant('MoreValidation');
                dialogInst.dialogInstance.dataBind();
                focus(_this.parent.element);
            },
            buttons: [{
                    buttonModel: {
                        content: l10n.getConstant('Ok'), isPrimary: true, cssClass: 'e-btn-goto-ok'
                    },
                    click: function () {
                        dialogInst.hide();
                        skip = true;
                    }
                }], close: function () {
                if (skip) {
                    _this.initiateDataValidationHandler(true);
                    skip = false;
                }
                else {
                    dialogInst.hide();
                }
            }
        };
        dialogInst.show(dlg);
    };
    DataValidation.prototype.extendValidationDlg = function () {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var dialogInst = this.parent.serviceLocator.getService(dialog);
        var skip = false;
        var noClick = false;
        var dlg = {
            width: 550, isModal: true, showCloseIcon: true, cssClass: 'e-goto-dlg',
            header: l10n.getConstant('Spreadsheet'),
            beforeOpen: function (args) {
                var dlgArgs = {
                    dialogName: 'ExtendValidation',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                }
                dialogInst.dialogInstance.content = l10n.getConstant('ExtendValidation');
                dialogInst.dialogInstance.dataBind();
                focus(_this.parent.element);
            },
            buttons: [{
                    buttonModel: {
                        content: l10n.getConstant('Yes'), isPrimary: true, cssClass: 'e-btn-goto-ok'
                    },
                    click: function () {
                        dialogInst.hide();
                        skip = true;
                    }
                },
                {
                    buttonModel: {
                        content: l10n.getConstant('No'), isPrimary: true, cssClass: 'e-btn-goto-ok'
                    },
                    click: function () {
                        dialogInst.hide();
                        skip = true;
                        noClick = true;
                    }
                }], close: function () {
                if (skip) {
                    _this.initiateDataValidationHandler(true, noClick);
                    skip = false;
                }
                else {
                    dialogInst.hide();
                }
            }
        };
        dialogInst.show(dlg);
    };
    DataValidation.prototype.userInput = function (listObj, listObj1) {
        var dlgEle = this.parent.element.querySelector('.e-datavalidation-dlg');
        var dlgCont = dlgEle.querySelector('.e-validation-dlg');
        var allowDataCont = dlgCont.querySelector('.e-allowdata');
        var valuesCont = dlgCont.querySelector('.e-values');
        var l10n = this.parent.serviceLocator.getService(locale);
        var dataCont = allowDataCont.querySelector('.e-data');
        while (valuesCont.lastChild) {
            valuesCont.removeChild(valuesCont.lastChild);
        }
        if (listObj.value === l10n.getConstant('List')) {
            while (dataCont.lastChild) {
                dataCont.removeChild(dataCont.lastChild);
            }
            var ignoreBlankEle = this.parent.createElement('input', { className: 'e-checkbox' });
            dataCont.appendChild(ignoreBlankEle);
            var ignoreBlankObj = new CheckBox({ label: l10n.getConstant('InCellDropDown'), checked: true });
            ignoreBlankObj.appendTo(ignoreBlankEle);
        }
        else {
            if (dataCont.getElementsByClassName('e-checkbox-wrapper')[0]) {
                while (dataCont.lastChild) {
                    dataCont.removeChild(dataCont.lastChild);
                }
                var dataText = this.parent.createElement('span', { className: 'e-header' });
                dataText.innerText = l10n.getConstant('Data');
                var dataSelectEle = this.parent.createElement('input', { className: 'e-select' });
                dataCont.appendChild(dataText);
                dataCont.appendChild(dataSelectEle);
                listObj1.appendTo(dataSelectEle);
            }
        }
        if (listObj.value !== l10n.getConstant('List') && (listObj1.value === l10n.getConstant('Between') || listObj1.value === l10n.getConstant('NotBetween'))) {
            var minimumCont = this.parent.createElement('div', { className: 'e-minimum' });
            var maximumCont = this.parent.createElement('div', { className: 'e-maximum' });
            valuesCont.appendChild(minimumCont);
            valuesCont.appendChild(maximumCont);
            var minimumText = this.parent.createElement('span', { className: 'e-header' });
            minimumText.innerText = l10n.getConstant('Minimum');
            var maximumText = this.parent.createElement('span', { className: 'e-header' });
            maximumText.innerText = l10n.getConstant('Maximum');
            var minimumInp = this.parent.createElement('input', { id: 'min', className: 'e-input', attrs: { value: '0' } });
            var maximumInp = this.parent.createElement('input', { id: 'max', className: 'e-input', attrs: { value: '0' } });
            var numericMin = new NumericTextBox({
                value: 0
            });
            numericMin.appendTo('min');
            var numericMax = new NumericTextBox({
                value: 0
            });
            numericMax.appendTo('max');
            minimumCont.appendChild(minimumText);
            minimumCont.appendChild(minimumInp);
            maximumCont.appendChild(maximumText);
            maximumCont.appendChild(maximumInp);
        }
        else {
            var valueText = this.parent.createElement('span', { className: 'e-header' });
            valueText.innerText = listObj.value === l10n.getConstant('List') ? l10n.getConstant('Sources') : l10n.getConstant('Value');
            var valueEle = listObj.value === l10n.getConstant('List') ? this.parent.createElement('input', {
                className: 'e-input',
                attrs: { placeholder: 'Enter value' }
            }) :
                this.parent.createElement('input', { className: 'e-input', attrs: { value: '0' } });
            valuesCont.appendChild(valueText);
            valuesCont.appendChild(valueEle);
        }
    };
    DataValidation.prototype.dlgClickHandler = function (dialogInst) {
        var l10n = this.parent.serviceLocator.getService(locale);
        var errorMsg;
        var dlgEle = this.parent.element.querySelector('.e-datavalidation-dlg');
        var dlgFooter = dlgEle.querySelector('.e-footer-content');
        var dlgContEle = dlgEle.getElementsByClassName('e-dlg-content')[0].
            getElementsByClassName('e-validation-dlg')[0];
        var allowData = dlgContEle.getElementsByClassName('e-allowdata')[0];
        var allowEle = allowData.getElementsByClassName('e-allow')[0].getElementsByTagName('input')[0];
        var dataEle = allowData.getElementsByClassName('e-data')[0].getElementsByTagName('input')[0];
        var values = dlgContEle.getElementsByClassName('e-values')[0];
        var valueArr = [];
        valueArr[0] = values.getElementsByTagName('input')[0].value;
        valueArr[1] = values.getElementsByTagName('input')[1] ? values.getElementsByTagName('input')[1].value : '';
        parseLocaleNumber(valueArr, this.parent.locale);
        var ignoreBlank = dlgContEle.querySelector('.e-ignoreblank .e-checkbox').checked;
        var inCellDropDown = allowData.querySelector('.e-data').querySelector('.e-checkbox-wrapper') ?
            allowData.querySelector('.e-data').querySelector('.e-checkbox-wrapper').querySelector('.e-check') ? true : false : null;
        var range = dlgContEle.querySelector('.e-cellrange').getElementsByTagName('input')[0].value;
        var operator;
        var type = allowEle.value;
        type = this.FormattedType(type);
        if (dataEle) {
            operator = dataEle.value;
            operator = this.FormattedValue(operator);
        }
        var rangeAdd = [];
        var valArr = [];
        if (valueArr[0] !== '') {
            valArr.push(valueArr[0]);
        }
        if (valueArr[1] !== '') {
            valArr.push(valueArr[1]);
        }
        var isValid = true;
        if (type === 'List') {
            if (valueArr[0].indexOf('=') !== -1) {
                if (valueArr[0].indexOf(':') !== -1) {
                    var address = valueArr[0].indexOf('!') > -1 ? valueArr[0].split('!')[1] : valueArr[0].split('=')[1];
                    var isSheetNameValid = valueArr[0].indexOf('!') > -1 ?
                        getSheetIndex(this.parent, valueArr[0].split('=')[1].split('!')[0]) > -1 : true;
                    rangeAdd = address.split(':');
                    var isSingleCol = address.match(/[a-z]/gi) ?
                        rangeAdd[0].replace(/[0-9]/g, '') === rangeAdd[1].replace(/[0-9]/g, '') : false;
                    var isSingleRow = address.match(/\d/g) ?
                        rangeAdd[0].replace(/\D/g, '') === rangeAdd[1].replace(/\D/g, '') : false;
                    isValid = isSheetNameValid ? (isSingleCol ? true : isSingleRow ? true : false) : false;
                    if (!isValid) {
                        errorMsg = l10n.getConstant('DialogError');
                    }
                }
            }
            else if (valueArr[0].length > 256) {
                isValid = false;
                errorMsg = l10n.getConstant('ListLengthError');
            }
        }
        if (isValid) {
            var sheet = this.parent.getActiveSheet();
            var format = type;
            var validDlg = this.isDialogValidator(valArr, format, operator);
            if (operator === 'Between') {
                if (!isNaN(parseFloat(valueArr[0])) && !isNaN(parseFloat(valueArr[1])) &&
                    parseFloat(valueArr[0]) > parseFloat(valueArr[1])) {
                    validDlg.isValidate = false;
                    validDlg.errorMsg = l10n.getConstant('MinMaxError');
                }
            }
            errorMsg = validDlg.errorMsg;
            isValid = validDlg.isValidate;
            if (isValid) {
                var indexes = getCellIndexes(sheet.activeCell);
                var cell = getCell(indexes[0], indexes[1], sheet, false, true);
                var isListValidationApplied = cell.validation && cell.validation.type === 'List';
                var args = { range: sheet.name + '!' + range, value1: valueArr[0], value2: valueArr[1],
                    ignoreBlank: ignoreBlank, type: type, operator: operator, inCellDropDown: inCellDropDown, cancel: false };
                this.parent.notify(beginAction, { eventArgs: args, action: 'validation' });
                if (!args.cancel) {
                    this.parent.notify(cellValidation, { rules: { type: args.type, operator: args.operator, value1: args.value1, value2: args.value2,
                            ignoreBlank: args.ignoreBlank, inCellDropDown: args.inCellDropDown }, range: args.range });
                    cell = getCell(indexes[0], indexes[1], sheet, false, true);
                    if (cell.validation) {
                        if (isListValidationApplied) {
                            var tdEle = this.parent.getCell(indexes[0], indexes[1]);
                            if (tdEle && tdEle.getElementsByClassName('e-validation-list')[0]) {
                                this.listObj.destroy();
                                tdEle.removeChild(tdEle.getElementsByClassName('e-validation-list')[0]);
                            }
                        }
                        if (cell.validation.type === 'List') {
                            this.listHandler();
                        }
                    }
                    delete args.cancel;
                    if (!document.getElementsByClassName('e-validation-error-dlg')[0]) {
                        if (dialogInst.dialogInstance) {
                            dialogInst.dialogInstance.hide();
                        }
                        else {
                            dialogInst.hide();
                        }
                    }
                    this.parent.notify(completeAction, { eventArgs: args, action: 'validation' });
                }
            }
        }
        if (!isValid) {
            var errorEle = this.parent.createElement('div', { className: 'e-dlg-error', id: 'e-invalid' });
            errorEle.innerText = errorMsg;
            values.appendChild(errorEle);
            dlgFooter.querySelector('.e-primary').setAttribute('disabled', 'true');
        }
    };
    DataValidation.prototype.FormattedValue = function (value) {
        var l10n = this.parent.serviceLocator.getService(locale);
        switch (value) {
            case l10n.getConstant('Between'):
                value = 'Between';
                break;
            case l10n.getConstant('NotBetween'):
                value = 'NotBetween';
                break;
            case l10n.getConstant('EqualTo'):
                value = 'EqualTo';
                break;
            case l10n.getConstant('NotEqualTo'):
                value = 'NotEqualTo';
                break;
            case l10n.getConstant('GreaterThan'):
                value = 'GreaterThan';
                break;
            case l10n.getConstant('LessThan'):
                value = 'LessThan';
                break;
            case l10n.getConstant('GreaterThanOrEqualTo'):
                value = 'GreaterThanOrEqualTo';
                break;
            case l10n.getConstant('LessThanOrEqualTo'):
                value = 'LessThanOrEqualTo';
                break;
            default:
                value = 'Between';
                break;
        }
        return value;
    };
    DataValidation.prototype.FormattedType = function (value) {
        var l10n = this.parent.serviceLocator.getService(locale);
        switch (value) {
            case l10n.getConstant('WholeNumber'):
                value = 'WholeNumber';
                break;
            case l10n.getConstant('Decimal'):
                value = 'Decimal';
                break;
            case l10n.getConstant('Date'):
                value = 'Date';
                break;
            case l10n.getConstant('TextLength'):
                value = 'TextLength';
                break;
            case l10n.getConstant('List'):
                value = 'List';
                break;
            case l10n.getConstant('Time'):
                value = 'Time';
                break;
            default:
                break;
        }
        return value;
    };
    DataValidation.prototype.isDialogValidator = function (values, type, operator) {
        var l10n = this.parent.serviceLocator.getService(locale);
        var count = 0;
        var isEmpty = false;
        var formValidation;
        if (type === 'List') {
            isEmpty = values.length > 0 ? false : true;
        }
        else {
            if (operator === 'Between' || operator === 'NotBetween') {
                isEmpty = values.length === 2 ? false : true;
            }
            else {
                isEmpty = values.length > 0 ? false : true;
            }
        }
        if (!isEmpty) {
            for (var idx = 0; idx < values.length; idx++) {
                var value = checkIsFormula(values[idx]) ? this.parent.computeExpression(values[idx]).toString() : values[idx];
                formValidation = this.formatValidation(value, type, true);
                if (formValidation.isValidate) {
                    count = count + 1;
                }
                else {
                    break;
                }
            }
            formValidation.isValidate = count === values.length ? true : false;
        }
        else {
            formValidation = { isValidate: false, errorMsg: l10n.getConstant('EmptyError') };
        }
        return { isValidate: formValidation.isValidate, errorMsg: formValidation.errorMsg };
    };
    DataValidation.prototype.isValidationHandler = function (args) {
        var l10n = this.parent.serviceLocator.getService(locale);
        args.value = args.value ? args.value : '';
        var isValidate;
        var errorMsg;
        var enterValue = args.value;
        var sheet = this.parent.sheets[args.sheetIdx];
        var validation;
        var cell = getCell(args.range[0], args.range[1], sheet);
        var column = getColumn(sheet, args.range[1]);
        if (cell && cell.validation) {
            validation = cell.validation;
        }
        else if (checkColumnValidation(column, args.range[0], args.range[1])) {
            validation = column.validation;
        }
        if (validation) {
            var value1 = validation.value1;
            var value2 = validation.value2;
            if (checkIsFormula(value1) && validation.type !== 'List') {
                value1 = this.parent.computeExpression(value1).toString();
            }
            if (checkIsFormula(value2) && validation.type !== 'List') {
                value2 = this.parent.computeExpression(value2).toString();
            }
            if (checkIsFormula(args.value) && validation.type !== 'List') {
                args.value = this.parent.computeExpression(args.value).toString();
            }
            var value = args.value;
            var opt = validation.operator || 'Between';
            var type = validation.type || 'WholeNumber';
            var ignoreBlank = isNullOrUndefined(validation.ignoreBlank) ? true : validation.ignoreBlank;
            if (ignoreBlank && enterValue === '') {
                isValidate = true;
            }
            else {
                var formValidation = this.formatValidation(args.value, type);
                isValidate = formValidation.isValidate;
                errorMsg = formValidation.errorMsg;
                if (isValidate) {
                    isValidate = false;
                    if (type === 'Date' || type === 'Time') {
                        args.value = args.value.toString().slice(args.value.toString().indexOf(' ') + 1, args.value.length);
                        for (var idx = 0; idx < 3; idx++) {
                            args.value = idx === 0 ? args.value : idx === 1 ? value1 : value2;
                            var dateEventArgs = {
                                value: args.value,
                                rowIndex: args.range[0],
                                colIndex: args.range[1],
                                sheetIndex: args.sheetIdx,
                                updatedVal: ''
                            };
                            if (args.value !== '') {
                                this.parent.notify(checkDateFormat, dateEventArgs);
                            }
                            var updatedVal = dateEventArgs.updatedVal;
                            updatedVal = updatedVal === '' ? args.value : updatedVal;
                            if (idx === 0) {
                                value = updatedVal;
                            }
                            else if (idx === 1) {
                                value1 = updatedVal;
                            }
                            else {
                                value2 = updatedVal;
                            }
                        }
                    }
                    else if (validation.type === 'TextLength') {
                        var dateEventArgs = {
                            value: args.value,
                            rowIndex: args.range[0],
                            colIndex: args.range[1],
                            sheetIndex: args.sheetIdx,
                            updatedVal: ''
                        };
                        this.parent.notify(checkDateFormat, dateEventArgs);
                        var updatedVal = dateEventArgs.updatedVal;
                        if (updatedVal !== '') {
                            value = updatedVal.toString().length.toString();
                        }
                        else {
                            value = args.value.toString().length.toString();
                        }
                    }
                    if (type === 'List') {
                        if (value1.indexOf('=') !== -1) {
                            for (var idx = 0; idx < this.data.length; idx++) {
                                if (args.value.toString() === this.data[idx].text) {
                                    isValidate = true;
                                }
                            }
                        }
                        else {
                            var values = value1.split(',');
                            for (var idx = 0; idx < values.length; idx++) {
                                if (args.value.toString() === values[idx]) {
                                    isValidate = true;
                                }
                            }
                        }
                        if (!isValidate && ignoreBlank && args.value.toString() === '') {
                            isValidate = true;
                        }
                    }
                    else {
                        if (type === 'Decimal' || type === 'Time') {
                            value = parseFloat(value.toString());
                            value1 = parseFloat(value1.toString());
                            value2 = value2 ? parseFloat(value2.toString()) : null;
                        }
                        else {
                            value = parseInt(value.toString(), 10);
                            value1 = parseInt(value1.toString(), 10);
                            value2 = value2 ? parseInt(value2.toString(), 10) : null;
                        }
                        switch (opt) {
                            case 'EqualTo':
                                if (value === value1) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            case 'NotEqualTo':
                                if (value !== value1) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            case 'Between':
                                if (value >= value1 && value <= value2) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            case 'NotBetween':
                                if (value >= value1 && value <= value2) {
                                    isValidate = false;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = true;
                                }
                                break;
                            case 'GreaterThan':
                                if (value > value1) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            case 'LessThan':
                                if (value < value1) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            case 'GreaterThanOrEqualTo':
                                if (value >= value1) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            case 'LessThanOrEqualTo':
                                if (value <= value1) {
                                    isValidate = true;
                                }
                                else if (ignoreBlank && enterValue === '') {
                                    isValidate = true;
                                }
                                else {
                                    isValidate = false;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }
        errorMsg = l10n.getConstant('ValidationError');
        if (isValidate && ((cell && cell.validation && cell.validation.isHighlighted) || (column && column.validation && column.validation.isHighlighted))) {
            var style = this.parent.getCellStyleValue(['backgroundColor', 'color'], [args.range[0], args.range[1]]);
            if (!isHiddenRow(sheet, args.range[0])) {
                this.parent.notify(applyCellFormat, {
                    style: style, rowIdx: args.range[0], colIdx: args.range[1], isHeightCheckNeeded: true, manualUpdate: true,
                    onActionUpdate: true, cell: args.td
                });
            }
        }
        return { isValidate: isValidate, errorMsg: errorMsg };
    };
    DataValidation.prototype.checkDataValidation = function (args) {
        var cell = getCell(args.range[0], args.range[1], this.parent.getActiveSheet());
        args.td = args.td || this.parent.getCell(args.range[0], args.range[1]);
        args.sheetIdx = args.sheetIdx || this.parent.activeSheetIndex;
        var formulaArgs = { skip: false, value: '' };
        if (cell && cell.validation) {
            if (checkIsFormula(cell.validation.value1) &&
                !isCellReference(cell.validation.value1.substring(1, cell.validation.value1.length)) &&
                cell.validation.value1.indexOf('(') > -1) {
                var val = cell.validation.value1;
                val = val.substring(val.indexOf('=') + 1, val.indexOf('('));
                formulaArgs.value = val.toUpperCase();
                this.parent.notify(formulaInValidation, formulaArgs);
            }
            if (!formulaArgs.skip && checkIsFormula(cell.validation.value2) &&
                !isCellReference(cell.validation.value2.substring(1, cell.validation.value2.length)) &&
                cell.validation.value1.indexOf('(') > -1) {
                var val2 = cell.validation.value2;
                val2 = val2.substring(val2.indexOf('=') + 1, val2.indexOf('('));
                formulaArgs.value = val2.toUpperCase();
                this.parent.notify(formulaInValidation, formulaArgs);
            }
        }
        if (!formulaArgs.skip) {
            var isValid = this.isValidationHandler({
                value: args.value, range: args.range, sheetIdx: args.sheetIdx, td: args.td
            });
            if (!isValid.isValidate && args.isCell) {
                this.validationErrorHandler(isValid.errorMsg);
            }
            args.isValid = isValid.isValidate;
        }
    };
    DataValidation.prototype.formatValidation = function (value, type, isDialogValidator) {
        var sheetPanel = this.parent.element.getElementsByClassName('e-sheet-panel')[0];
        var errorMsg;
        var formEle = this.parent.createElement('form', { id: 'formId', className: 'form-horizontal' });
        var inputEle = this.parent.createElement('input', { id: 'e-validation' });
        inputEle.setAttribute('name', 'validation');
        inputEle.setAttribute('type', 'text');
        inputEle.setAttribute('value', value);
        formEle.appendChild(inputEle);
        sheetPanel.appendChild(formEle);
        var options;
        switch (type) {
            case 'Date':
                options = {
                    rules: {
                        'validation': { date: true }
                    },
                    customPlacement: function (inputElement, error) {
                        errorMsg = error.innerText;
                    }
                };
                break;
            case 'Decimal':
                options = {
                    rules: {
                        'validation': { number: true }
                    },
                    customPlacement: function (inputElement, error) {
                        errorMsg = error.innerText;
                    }
                };
                break;
            case 'WholeNumber':
                options = {
                    rules: {
                        'validation': { regex: /^-?\d*\.?[0]*$/ }
                    },
                    customPlacement: function (inputElement, error) {
                        errorMsg = error.innerText;
                    }
                };
                break;
            case 'TextLength':
                if (isDialogValidator) {
                    options = {
                        rules: {
                            'validation': { regex: /^\d*\.?[0]*$/ }
                        },
                        customPlacement: function (inputElement, error) {
                            errorMsg = error.innerText;
                        }
                    };
                }
                break;
            default:
                break;
        }
        var formObj = new FormValidator('#formId', options);
        var isValidate = formObj.validate();
        sheetPanel.removeChild(sheetPanel.getElementsByClassName('form-horizontal')[0]);
        return { isValidate: isValidate, errorMsg: errorMsg };
    };
    DataValidation.prototype.InvalidElementHandler = function (args) {
        var rowIdx = args.rowIdx;
        var colIdx = args.colIdx;
        var isRemoveHighlightedData = args.isRemoveHighlightedData;
        if (!isRemoveHighlightedData) {
            this.parent.notify(applyCellFormat, {
                style: { backgroundColor: '#ffff00', color: '#ff0000' }, rowIdx: rowIdx, colIdx: colIdx, cell: args.td
            });
        }
        else if (isRemoveHighlightedData) {
            var style = this.parent.getCellStyleValue(['backgroundColor', 'color'], [rowIdx, colIdx]);
            this.parent.notify(applyCellFormat, {
                style: style, rowIdx: rowIdx, colIdx: colIdx, cell: args.td
            });
        }
    };
    DataValidation.prototype.validationErrorHandler = function (error) {
        var _this = this;
        var el = document.getElementsByClassName('e-spreadsheet-edit')[0];
        var l10n = this.parent.serviceLocator.getService(locale);
        if (!this.parent.element.querySelector('.e-validation-error-dlg')) {
            var erroDialogInst_1 = this.parent.serviceLocator.getService(dialog);
            var disableCancel = false;
            var dlgModel = {
                width: 400, height: 200, isModal: true, showCloseIcon: true, cssClass: 'e-validation-error-dlg',
                target: document.querySelector('.e-control.e-spreadsheet'),
                beforeOpen: function (args) {
                    var dlgArgs = {
                        dialogName: 'ValidationErrorDialog',
                        element: args.element, target: args.target, cancel: args.cancel, content: error
                    };
                    _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                    if (dlgArgs.cancel) {
                        _this.errorDlgHandler(erroDialogInst_1, 'Cancel');
                        args.cancel = true;
                    }
                    el.focus();
                    erroDialogInst_1.dialogInstance.content = dlgArgs.content;
                    erroDialogInst_1.dialogInstance.dataBind();
                },
                buttons: [{
                        buttonModel: {
                            content: l10n.getConstant('Retry'), isPrimary: true
                        },
                        click: function () {
                            _this.errorDlgHandler(erroDialogInst_1, 'Retry');
                        }
                    },
                    {
                        buttonModel: {
                            content: l10n.getConstant('Cancel')
                        },
                        click: function () {
                            _this.errorDlgHandler(erroDialogInst_1, 'Cancel');
                        }
                    }]
            };
            erroDialogInst_1.show(dlgModel, disableCancel);
        }
    };
    DataValidation.prototype.errorDlgHandler = function (errorDialogInst, buttonName) {
        if (buttonName === 'Retry') {
            var el = document.getElementsByClassName('e-spreadsheet-edit')[0];
            errorDialogInst.hide();
            if (el.innerText) {
                window.getSelection().selectAllChildren(el);
                if (this.listObj) {
                    this.listObj.showPopup();
                }
            }
        }
        else {
            var indexes = getCellIndexes(this.parent.getActiveSheet().activeCell);
            var cell = getCell(indexes[0], indexes[1], this.parent.getActiveSheet());
            var value = cell ? this.parent.getDisplayText(cell) : '';
            this.parent.notify(editOperation, {
                action: 'cancelEdit', value: value, refreshFormulaBar: true,
                refreshEditorElem: true, isAppend: false, trigEvent: true
            });
            errorDialogInst.hide();
        }
    };
    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    DataValidation.prototype.getModuleName = function () {
        return 'dataValidation';
    };
    return DataValidation;
}());
export { DataValidation };
