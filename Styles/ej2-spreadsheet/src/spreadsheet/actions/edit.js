import { EventHandler, Browser, closest, isUndefined, isNullOrUndefined, select, detach } from '@syncfusion/ej2-base';
import { getRangeIndexes, getRangeFromAddress, getIndexesFromAddress, getRangeAddress, isSingleCell } from '../../workbook/common/address';
import { keyDown, editOperation, clearCopy, mouseDown, enableToolbarItems, completeAction } from '../common/event';
import { formulaBarOperation, formulaOperation, setActionData, keyUp, getCellPosition, deleteImage, focus, isLockedCells } from '../common/index';
import { workbookEditOperation, getFormattedBarText, getFormattedCellObject, wrapEvent, isValidation, activeCellMergedRange, activeCellChanged, getUniqueRange, removeUniquecol, checkUniqueRange, reApplyFormula, refreshChart } from '../../workbook/common/event';
import { getSheetName, getSheetIndex, getCell, getColumn, getRowsHeight, getColumnsWidth, checkColumnValidation } from '../../workbook/base/index';
import { getSheetNameFromAddress, getSheet, selectionComplete, isHiddenRow, isHiddenCol, applyCF, setVisibleMergeIndex } from '../../workbook/index';
import { beginAction, updateCell, parseLocaleNumber, getViewportIndexes } from '../../workbook/index';
import { hasTemplate, editAlert, getTextWidth } from '../common/index';
import { getSwapRange, getCellIndexes, wrap as wrapText, checkIsFormula, isNumber, isLocked, isCellReference, workbookFormulaOperation } from '../../workbook/index';
import { initiateFormulaReference, initiateCur, clearCellRef, addressHandle, clearRange, dialog, locale } from '../common/index';
import { editValue, initiateEdit, forRefSelRender, isFormulaBarEdit, deleteChart, activeSheetChanged } from '../common/event';
import { checkFormulaRef, getData } from '../../workbook/index';
/**
 * The `Protect-Sheet` module is used to handle the Protecting functionalities in Spreadsheet.
 */
var Edit = /** @class */ (function () {
    /**
     * Constructor for edit module in Spreadsheet.
     *
     * @param {Spreadsheet} parent - Constructor for edit module in Spreadsheet.
     * @private
     */
    function Edit(parent) {
        this.editorElem = null;
        this.editCellData = {};
        this.isEdit = false;
        this.isCellEdit = true;
        this.isNewValueEdit = true;
        this.isAltEnter = false;
        this.validCharacters = ['+', '-', '*', '/', ',', '(', '=', '&', ':'];
        this.formulaBarCurStartPos = null;
        this.curEndPos = null;
        this.curStartPos = null;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.uniqueColl = '';
        this.uniqueActCell = '';
        this.isSpill = false;
        this.keyCodes = {
            BACKSPACE: 8,
            SPACE: 32,
            TAB: 9,
            DELETE: 46,
            ESC: 27,
            ENTER: 13,
            FIRSTALPHABET: 65,
            LASTALPHABET: 90,
            FIRSTNUMBER: 48,
            LASTNUMBER: 59,
            FIRSTNUMPAD: 96,
            LASTNUMPAD: 111,
            SYMBOLSETONESTART: 186,
            SYMBOLSETONEEND: 192,
            SYMBOLSETTWOSTART: 219,
            SYMBOLSETTWOEND: 222,
            FIREFOXEQUALPLUS: 61,
            FIREFOXMINUS: 173,
            F2: 113
        };
        this.parent = parent;
        this.addEventListener();
        //Spreadsheet.Inject(WorkbookEdit);
    }
    /**
     * To destroy the edit module.
     *
     * @returns {void} - To destroy the edit module.
     * @hidden
     */
    Edit.prototype.destroy = function () {
        if (this.isEdit) {
            this.cancelEdit(true, false);
        }
        this.removeEventListener();
        this.parent = null;
        this.editorElem = null;
    };
    Edit.prototype.addEventListener = function () {
        EventHandler.add(this.parent.element, 'dblclick', this.dblClickHandler, this);
        this.parent.on(mouseDown, this.mouseDownHandler, this);
        this.parent.on(keyUp, this.keyUpHandler, this);
        this.parent.on(keyDown, this.keyDownHandler, this);
        this.parent.on(editOperation, this.performEditOperation, this);
        this.parent.on(initiateCur, this.initiateCurPosition, this);
        this.parent.on(editValue, this.updateFormulaBarValue, this);
        this.parent.on(addressHandle, this.addressHandler, this);
        this.parent.on(initiateEdit, this.initiateRefSelection, this);
        this.parent.on(forRefSelRender, this.refSelectionRender, this);
        this.parent.on(checkUniqueRange, this.checkUniqueRange, this);
        this.parent.on(reApplyFormula, this.reApplyFormula, this);
        this.parent.on(activeSheetChanged, this.sheetChangeHandler, this);
    };
    Edit.prototype.removeEventListener = function () {
        EventHandler.remove(this.parent.element, 'dblclick', this.dblClickHandler);
        if (!this.parent.isDestroyed) {
            this.parent.off(mouseDown, this.mouseDownHandler);
            this.parent.off(keyUp, this.keyUpHandler);
            this.parent.off(keyDown, this.keyDownHandler);
            this.parent.off(editOperation, this.performEditOperation);
            this.parent.off(initiateCur, this.initiateCurPosition);
            this.parent.off(editValue, this.updateFormulaBarValue);
            this.parent.off(addressHandle, this.addressHandler);
            this.parent.off(initiateEdit, this.initiateRefSelection);
            this.parent.off(forRefSelRender, this.refSelectionRender);
            this.parent.off(checkUniqueRange, this.checkUniqueRange);
            this.parent.off(reApplyFormula, this.reApplyFormula);
            this.parent.off(activeSheetChanged, this.sheetChangeHandler);
        }
    };
    /**
     * Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    Edit.prototype.getModuleName = function () {
        return 'edit';
    };
    Edit.prototype.performEditOperation = function (args) {
        var action = args.action;
        switch (action) {
            case 'renderEditor':
                this.renderEditor();
                break;
            case 'refreshEditor':
                this.refreshEditor(args.value, args.refreshFormulaBar, args.refreshEditorElem, args.isAppend, args.trigEvent);
                if (args.refreshCurPos) {
                    this.setCursorPosition();
                }
                break;
            case 'startEdit':
                if (!this.isEdit) {
                    this.isNewValueEdit = args.isNewValueEdit;
                    this.startEdit(args.address, args.value, args.refreshCurPos);
                }
                else {
                    var isEdit = false;
                    var arg = { isEdit: isEdit };
                    this.parent.notify(isFormulaBarEdit, arg);
                    if (arg.isEdit) {
                        this.isNewValueEdit = args.isNewValueEdit;
                        this.startEdit(args.address, args.value, args.refreshCurPos);
                    }
                }
                break;
            case 'endEdit':
                if (this.isEdit) {
                    this.endEdit(args.refreshFormulaBar, null, args.isPublic);
                }
                break;
            case 'cancelEdit':
                if (this.isEdit) {
                    this.cancelEdit(args.refreshFormulaBar);
                }
                break;
            case 'getCurrentEditValue':
                args.editedValue = this.editCellData.value;
                if (args.endFormulaRef !== undefined) {
                    args.endFormulaRef = this.endFormulaRef;
                }
                break;
            case 'refreshDependentCellValue':
                this.refreshDependentCellValue(args.rowIdx, args.colIdx, args.sheetIdx);
                break;
            case 'getElement':
                args.element = this.getEditElement(this.parent.getActiveSheet());
                break;
            case 'focusEditorElem':
                this.editorElem.focus();
                break;
            case 'getCurrentEditSheetIdx':
                args.sheetIndex = this.editCellData.sheetIndex;
                break;
        }
    };
    Edit.prototype.keyUpHandler = function (e) {
        if (this.isEdit) {
            var editElement = this.getEditElement(this.parent.getActiveSheet());
            if (e.altKey && e.keyCode === 13) {
                editElement.focus();
                this.altEnter();
                this.isAltEnter = true;
            }
            else if (this.isCellEdit && this.editCellData.value !== editElement.textContent && e.keyCode !== 16) {
                this.refreshEditor(editElement.textContent, this.isCellEdit);
            }
            var isFormulaEdit = checkIsFormula(this.editCellData.value, true);
            if (isFormulaEdit && (!e || e.keyCode !== 16)) {
                this.updateFormulaReference(editElement);
                if (this.endFormulaRef) {
                    var curOffset = this.getCurPosition();
                    if (curOffset.end && this.validCharacters.indexOf(this.editCellData.value[curOffset.end - 1]) > -1) {
                        this.endFormulaRef = false;
                    }
                }
            }
        }
    };
    Edit.prototype.updateFormulaReference = function (editElement) {
        var formulaRefIndicator = this.parent.element.querySelector('.e-formularef-indicator');
        if (formulaRefIndicator) {
            formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
        }
        if (this.editCellData.value !== editElement.textContent) {
            this.refreshEditor(editElement.textContent, true);
        }
        var sheetIdx = this.editCellData.sheetIndex;
        var editValue = this.editCellData.value;
        this.parent.notify(initiateFormulaReference, { range: editValue, formulaSheetIdx: sheetIdx });
    };
    Edit.prototype.keyDownHandler = function (e) {
        var trgtElem = e.target;
        var keyCode = e.keyCode;
        var sheet = this.parent.getActiveSheet();
        var actCell = getCellIndexes(sheet.activeCell);
        var cell = getCell(actCell[0], actCell[1], sheet, false, true);
        if (!closest(trgtElem, '.e-dialog')) {
            if (!sheet.isProtected || trgtElem.classList.contains('e-sheet-rename') || !isLocked(cell, getColumn(sheet, actCell[1]))) {
                if (this.isEdit) {
                    var editorElem = this.getEditElement(sheet);
                    var isFormulaEdit = checkIsFormula(this.editCellData.value, true);
                    if (this.isCellEdit || (isFormulaEdit && this.editCellData.value !== editorElem.textContent && e.keyCode !== 16)) {
                        if (actCell[1] < this.parent.frozenColCount(sheet) && (!sheet.frozenRows || actCell[0] >=
                            this.parent.frozenRowCount(sheet)) && editorElem && editorElem.style.height !== 'auto') {
                            if (getTextWidth(editorElem.textContent, cell.style, this.parent.cellStyle) > parseInt(editorElem.style.maxWidth, 10)) {
                                editorElem.style.height = 'auto';
                            }
                        }
                        if (getTextWidth(editorElem.textContent, cell.style, this.parent.cellStyle) > parseInt(editorElem.style.maxWidth, 10) - 5) { // 5 decreased for padding.
                            editorElem.style.height = 'auto';
                        }
                        if (actCell[0] < this.parent.frozenRowCount(sheet) && editorElem && !editorElem.style.overflow && getTextWidth(editorElem.textContent, cell.style, this.parent.cellStyle) > parseInt(editorElem.style.maxWidth, 10)) {
                            editorElem.style.overflow = 'auto';
                        }
                        this.refreshEditor(editorElem.textContent, this.isCellEdit, false, false, false);
                    }
                    if (!e.altKey) {
                        switch (keyCode) {
                            case this.keyCodes.ENTER:
                                if (Browser.isWindows) {
                                    e.preventDefault();
                                }
                                if (this.isAltEnter) {
                                    var text = editorElem.textContent;
                                    if (text && text.indexOf('\n') > -1) {
                                        wrapText(this.parent.getActiveSheet().selectedRange, true, this.parent, true);
                                        this.refreshEditor(editorElem.textContent, this.isCellEdit, false, false, false);
                                        this.isAltEnter = false;
                                    }
                                }
                                if (!isFormulaEdit) {
                                    this.endEdit(false, e);
                                }
                                else {
                                    var formulaRefIndicator = this.parent.element.querySelector('.e-formularef-indicator');
                                    if (formulaRefIndicator) {
                                        formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                    }
                                    if (getSheet(this.parent, this.editCellData.sheetIndex).id === sheet.id) {
                                        this.endEdit(false, e);
                                    }
                                    else {
                                        this.parent.goTo(this.editCellData.fullAddr);
                                        this.endEdit(false, e);
                                    }
                                }
                                break;
                            case this.keyCodes.TAB:
                                if (!this.hasFormulaSuggSelected()) {
                                    this.endEdit(false, e);
                                }
                                break;
                            case this.keyCodes.ESC:
                                this.cancelEdit(true, true, e);
                                break;
                        }
                    }
                }
                else if (trgtElem.classList.contains('e-spreadsheet') || closest(trgtElem, '.e-sheet-panel')) {
                    if (keyCode === 13 && trgtElem.contentEditable === 'true') {
                        e.preventDefault();
                    }
                    var key = String.fromCharCode(keyCode);
                    var isAlphabet = (keyCode >= this.keyCodes.FIRSTALPHABET && keyCode <= this.keyCodes.LASTALPHABET) ||
                        (key.toLowerCase() !== key.toUpperCase() && !(keyCode >= 112 && keyCode <= 123));
                    var isNumeric = (keyCode >= this.keyCodes.FIRSTNUMBER && keyCode <= this.keyCodes.LASTNUMBER);
                    var isNumpadKeys = (keyCode >= this.keyCodes.FIRSTNUMPAD && keyCode <= this.keyCodes.LASTNUMPAD);
                    var isSymbolkeys = (keyCode >= this.keyCodes.SYMBOLSETONESTART &&
                        keyCode <= this.keyCodes.SYMBOLSETONEEND);
                    if (!isSymbolkeys) {
                        isSymbolkeys = (keyCode >= this.keyCodes.SYMBOLSETTWOSTART && keyCode <= this.keyCodes.SYMBOLSETTWOEND);
                    }
                    var isFirefoxExceptionkeys = (keyCode === this.keyCodes.FIREFOXEQUALPLUS) ||
                        (keyCode === this.keyCodes.FIREFOXMINUS);
                    var isF2Edit = (!e.shiftKey && !e.ctrlKey && !e.metaKey && keyCode === this.keyCodes.F2);
                    var isBackSpace = keyCode === this.keyCodes.BACKSPACE;
                    var isMacDelete = /(Macintosh|MacIntel|MacPPC|Mac68K|Mac|Mac OS|iPod|iPad)/i.test(navigator.userAgent) && isBackSpace;
                    if ((!e.ctrlKey && !e.metaKey && !e.altKey && ((!e.shiftKey && keyCode === this.keyCodes.SPACE) || isAlphabet || isNumeric ||
                        isNumpadKeys || isSymbolkeys || (Browser.info.name === 'mozilla' && isFirefoxExceptionkeys))) || isF2Edit || isBackSpace) {
                        if (isF2Edit) {
                            this.isNewValueEdit = false;
                        }
                        var overlayElements = document.getElementsByClassName('e-ss-overlay-active');
                        if (overlayElements.length) {
                            if (isBackSpace && !isMacDelete) {
                                this.editingHandler('delete');
                            }
                        }
                        else {
                            this.startEdit(null, null, true, true);
                            this.getEditElement(sheet).focus();
                        }
                    }
                    if (keyCode === this.keyCodes.DELETE || isMacDelete) {
                        var islockcell = sheet.isProtected && isLockedCells(this.parent);
                        if (!islockcell) {
                            this.editingHandler('delete');
                            this.parent.notify(activeCellChanged, null);
                        }
                        else {
                            this.parent.notify(editAlert, null);
                        }
                    }
                }
            }
            else if (((keyCode >= this.keyCodes.FIRSTALPHABET && keyCode <= this.keyCodes.LASTALPHABET) ||
                (keyCode >= this.keyCodes.FIRSTNUMBER && keyCode <= this.keyCodes.LASTNUMBER)
                || (keyCode === this.keyCodes.DELETE) || (keyCode === this.keyCodes.BACKSPACE) || (keyCode === this.keyCodes.SPACE)
                || (keyCode >= this.keyCodes.FIRSTNUMPAD && keyCode <= this.keyCodes.LASTNUMPAD) ||
                (keyCode >= this.keyCodes.SYMBOLSETONESTART && keyCode <= this.keyCodes.SYMBOLSETONEEND)
                || (keyCode >= 219 && keyCode <= 222) || (!e.shiftKey && !e.ctrlKey && !e.metaKey && keyCode === this.keyCodes.F2))
                && (keyCode !== 67) && (keyCode !== 89) && (keyCode !== 90)) {
                if (sheet.protectSettings.insertLink && keyCode === 75) {
                    return;
                }
                if (!e.ctrlKey && e.keyCode !== 70 && !this.parent.element.querySelector('.e-editAlert-dlg') &&
                    !trgtElem.parentElement.classList.contains('e-unprotectpwd-content') &&
                    !trgtElem.parentElement.classList.contains('e-password-content') &&
                    !trgtElem.parentElement.classList.contains('e-sheet-password-content') &&
                    !trgtElem.parentElement.classList.contains('e-unprotectsheetpwd-content') &&
                    !trgtElem.parentElement.classList.contains('e-reenterpwd-content')) {
                    this.parent.notify(editAlert, null);
                }
            }
        }
    };
    Edit.prototype.renderEditor = function () {
        if (!this.editorElem || !select('#' + this.parent.element.id + '_edit', this.parent.element)) {
            var editor = this.parent.createElement('div', { id: this.parent.element.id + '_edit', className: 'e-spreadsheet-edit', attrs: { 'contentEditable': 'true',
                    'role': 'textbox', 'spellcheck': 'false', 'aria-multiline': 'true' } });
            if (this.parent.element.getElementsByClassName('e-spreadsheet-edit')[0]) {
                this.parent.element.getElementsByClassName('e-spreadsheet-edit')[0].remove();
            }
            var sheetContentElem = this.parent.element.querySelector('.e-sheet-content');
            if (!sheetContentElem) {
                return;
            }
            sheetContentElem.appendChild(editor);
            this.editorElem = editor;
        }
        this.parent.notify(formulaOperation, { action: 'renderAutoComplete' });
    };
    Edit.prototype.refreshEditor = function (value, refreshFormulaBar, refreshEditorElem, isAppend, trigEvent) {
        if (trigEvent === void 0) { trigEvent = true; }
        if (isAppend) {
            value = this.editCellData.value = this.editCellData.value + value;
        }
        else {
            this.editCellData.value = value;
        }
        var editorElem = this.getEditElement(this.parent.getActiveSheet());
        if (refreshEditorElem && editorElem) {
            editorElem.textContent = value;
        }
        if (refreshFormulaBar) {
            this.parent.notify(formulaBarOperation, { action: 'refreshFormulabar', value: value });
        }
        if (this.parent.isEdit && editorElem && trigEvent && this.editCellData.value === editorElem.textContent) {
            if (this.triggerEvent('cellEditing').cancel) {
                this.cancelEdit();
            }
        }
        // if (this.editorElem.scrollHeight + 2 <= this.editCellData.element.offsetHeight) {
        //     this.editorElem.style.height = (this.editCellData.element.offsetHeight + 1) + 'px';
        // } else {
        //     this.editorElem.style.removeProperty('height');
        // }
    };
    Edit.prototype.startEdit = function (address, value, refreshCurPos, preventFormulaReference) {
        if (refreshCurPos === void 0) { refreshCurPos = true; }
        if (this.parent.showSheetTabs) {
            this.parent.element.querySelector('.e-add-sheet-tab').setAttribute('disabled', 'true');
        }
        var sheet = this.parent.getActiveSheet();
        var range = getCellIndexes(sheet.activeCell);
        var cell = getCell(range[0], range[1], sheet, false, true);
        if (hasTemplate(this.parent, range[0], range[1], this.parent.activeSheetIndex)) {
            var cellEle = this.parent.getCell(range[0], range[1]);
            var isDelTemplate = false;
            var value_1 = cellEle.innerHTML;
            if (cellEle) {
                if (value_1.indexOf('<') > -1 && value_1.indexOf('>') > -1 && value_1.indexOf('input') > -1) {
                    isDelTemplate = true;
                }
            }
            if (isDelTemplate) {
                return;
            }
        }
        var isMergedHiddenCell = this.updateEditCellDetail(address, value);
        this.initiateEditor(refreshCurPos, isMergedHiddenCell);
        this.positionEditor();
        this.parent.isEdit = this.isEdit = true;
        this.parent.notify(clearCopy, null);
        this.parent.notify(enableToolbarItems, [{ enable: false }]);
        if (cell.formula && !preventFormulaReference) {
            this.parent.notify(initiateFormulaReference, { range: cell.formula, formulaSheetIdx: this.editCellData.sheetIndex });
        }
    };
    Edit.prototype.setCursorPosition = function () {
        var elem = this.getEditElement(this.parent.getActiveSheet());
        var textLen = elem.textContent.length;
        if (textLen) {
            var selection = document.getSelection();
            var range = document.createRange();
            range.setStart(elem.firstChild, textLen);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        elem.focus();
    };
    Edit.prototype.hasFormulaSuggSelected = function () {
        var suggDdlElem = document.getElementById(this.parent.element.id + '_ac_popup');
        return suggDdlElem && suggDdlElem.style.visibility === 'visible' &&
            suggDdlElem.querySelectorAll('.e-item-focus').length > 0;
    };
    Edit.prototype.editingHandler = function (action) {
        var pictureElements = document.getElementsByClassName('e-ss-overlay-active');
        var pictureLen = pictureElements.length;
        var isSpill;
        switch (action) {
            case 'delete':
                if (pictureLen > 0) {
                    if (pictureElements[0].classList.contains('e-datavisualization-chart')) {
                        this.parent.notify(deleteChart, {
                            id: pictureElements[0].id, sheetIdx: this.parent.activeSheetIndex + 1
                        });
                    }
                    else {
                        this.parent.notify(deleteImage, {
                            id: pictureElements[0].id, sheetIdx: this.parent.activeSheetIndex + 1
                        });
                    }
                }
                else {
                    var sheet = this.parent.getActiveSheet();
                    var address = sheet.selectedRange;
                    var range = getIndexesFromAddress(address);
                    range = range[0] > range[2] ? getSwapRange(range) : range;
                    address = getRangeAddress(range);
                    var cellDeleteArgs = { address: sheet.name + '!' + address, cancel: false };
                    this.parent.notify(beginAction, { action: 'cellDelete', eventArgs: cellDeleteArgs });
                    if (cellDeleteArgs.cancel) {
                        return;
                    }
                    address = getRangeFromAddress(cellDeleteArgs.address);
                    range = getRangeIndexes(address);
                    clearRange(this.parent, range, this.parent.activeSheetIndex);
                    this.parent.notify(selectionComplete, {});
                    if (range[0] === 0 && range[1] === 0 && range[2] >= sheet.usedRange.rowIndex && range[3] >= sheet.usedRange.colIndex) {
                        this.parent.setUsedRange(0, 0, sheet, false, true);
                    }
                    var args = { cellIdx: range, isUnique: false };
                    this.checkUniqueRange(args);
                    if (args.isUnique) {
                        var indexes = getRangeIndexes(this.uniqueColl);
                        var cell = getCell(indexes[0], indexes[1], this.parent.getActiveSheet());
                        if (cell && cell.value) {
                            isSpill = cell.value.toString().indexOf('#SPILL!') > -1;
                        }
                    }
                    if (args.isUnique && this.uniqueColl.split(':')[0] === address.split(':')[0]) {
                        var index = getRangeIndexes(this.uniqueColl);
                        for (var i = index[0]; i <= index[2]; i++) {
                            for (var j = index[1]; j <= index[3]; j++) {
                                this.parent.updateCell({ value: '', formula: '' }, getRangeAddress([i, j]));
                            }
                        }
                        this.parent.notify(removeUniquecol, null);
                        this.uniqueColl = '';
                    }
                    else if (args.isUnique) {
                        var uniqueRange = getRangeIndexes(this.uniqueColl);
                        if (getCell(uniqueRange[0], uniqueRange[1], sheet).value === '#SPILL!') {
                            var skip = false;
                            for (var j = uniqueRange[0]; j <= uniqueRange[2]; j++) {
                                for (var k = uniqueRange[1]; k <= uniqueRange[3]; k++) {
                                    var cell = getCell(j, k, sheet);
                                    if (j === uniqueRange[0] && k === uniqueRange[1]) {
                                        skip = false;
                                    }
                                    else if (!isNullOrUndefined(cell.value) && cell.value !== '') {
                                        skip = true;
                                    }
                                }
                            }
                            if (!skip) {
                                this.reApplyFormula();
                            }
                        }
                    }
                    if (args.isUnique) {
                        this.parent.notify(completeAction, { action: 'cellDelete',
                            eventArgs: { address: sheet.name + '!' + address, isSpill: isSpill } });
                    }
                    else {
                        this.parent.notify(completeAction, { action: 'cellDelete', eventArgs: { address: sheet.name + '!' + address } });
                    }
                }
                break;
        }
    };
    Edit.prototype.getCurPosition = function () {
        var cursorOffset = {};
        var selection = window.getSelection();
        if (this.editorElem.textContent === this.editCellData.value) {
            cursorOffset.start = selection.anchorOffset;
            cursorOffset.end = selection.focusOffset;
            if (cursorOffset.start > cursorOffset.end) {
                var x = cursorOffset.start;
                cursorOffset.start = cursorOffset.end;
                cursorOffset.end = x;
            }
        }
        if (selection && selection.focusNode && selection.focusNode.classList &&
            selection.focusNode.classList.contains('e-formula-bar-panel') &&
            this.editorElem.textContent === this.editCellData.value) {
            var formulaBar = selection.focusNode.getElementsByClassName('e-formula-bar e-css')[0];
            cursorOffset.start = formulaBar.selectionStart;
            cursorOffset.end = formulaBar.selectionEnd;
        }
        return cursorOffset;
    };
    Edit.prototype.mouseDownHandler = function (e) {
        if (!closest(e.target, '.e-findtool-dlg') && !closest(e.target, '.e-validation-error-dlg')) {
            if (this.isEdit) {
                var curOffset = this.getCurPosition();
                if (curOffset.start) {
                    this.curStartPos = this.selectionStart = curOffset.start;
                }
                if (curOffset.end) {
                    this.curEndPos = this.selectionEnd = curOffset.end;
                }
                var trgtElem = e.target;
                var sheet = this.parent.getActiveSheet();
                var formulaRefIndicator = this.parent.element.querySelector('.e-formularef-indicator');
                this.isCellEdit = trgtElem.classList.contains('e-spreadsheet-edit');
                var isFormula = checkIsFormula(this.editCellData.value, true);
                var editorElem = this.getEditElement(sheet);
                if (trgtElem.classList.contains('e-cell') || trgtElem.classList.contains('e-header-cell') ||
                    trgtElem.classList.contains('e-selectall') || closest(trgtElem, '.e-toolbar-item.e-active') || closest(trgtElem, '.e-table')) {
                    if (this.isAltEnter) {
                        var editText = editorElem.textContent;
                        if (editText && editText.indexOf('\n') > -1) {
                            this.isAltEnter = false;
                            wrapText(this.parent.getActiveSheet().selectedRange, true, this.parent);
                            this.refreshEditor(editorElem.textContent, this.isCellEdit);
                        }
                    }
                    if (!isFormula || this.endFormulaRef) {
                        this.endFormulaRef = false;
                        this.endEdit(false, e);
                    }
                    else {
                        var curPos = this.selectionEnd;
                        var actCellIdx = getCellIndexes(sheet.activeCell);
                        var cell = getCell(actCellIdx[0], actCellIdx[1], sheet);
                        if (this.selectionStart !== this.selectionEnd && this.editCellData.value === editorElem.textContent &&
                            this.validCharacters.indexOf(editorElem.textContent.substring((this.selectionStart - 1), this.selectionStart)) !== -1) {
                            if (isCellReference(editorElem.textContent.substring(this.selectionStart, this.selectionEnd)) &&
                                editorElem.textContent.indexOf(':') !== this.selectionEnd) {
                                this.editCellData.value = editorElem.textContent.substring(0, this.selectionStart) +
                                    editorElem.textContent.substring(this.selectionEnd, editorElem.textContent.length);
                            }
                        }
                        if (this.editCellData.value === editorElem.textContent && (editorElem.textContent.indexOf('(') !==
                            editorElem.textContent.length - 1 && editorElem.textContent.indexOf('(') !== -1) &&
                            this.selectionStart === this.selectionEnd) {
                            if (this.editCellData.sheetIndex !== getSheetIndex(this.parent, sheet.name)) {
                                var elem = this.parent.element.querySelector('.e-formula-bar');
                                if (editorElem.textContent.substring(elem.selectionEnd - 1, elem.selectionEnd) !== ',' &&
                                    !e.shiftKey) {
                                    if (formulaRefIndicator) {
                                        formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                    }
                                    this.parent.goTo(this.editCellData.fullAddr);
                                    this.endEdit(false, e);
                                    return;
                                }
                            }
                            else {
                                if (this.validCharacters.indexOf(editorElem.textContent.substring(curPos - 1, curPos)) === -1) {
                                    if (formulaRefIndicator) {
                                        formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                    }
                                    this.endEdit(false, e);
                                    return;
                                }
                            }
                        }
                        if (!cell) {
                            return;
                        }
                        isFormula = cell.formula ?
                            checkIsFormula(getCell(actCellIdx[0], actCellIdx[1], sheet).formula) ||
                                (this.editCellData.value && this.editCellData.value.toString().indexOf('=') === 0) : false;
                        if (isFormula && this.parent.isEdit) {
                            var curPos_1 = this.selectionEnd;
                            if (this.editCellData.value.length === curPos_1) {
                                if (this.editCellData.value.substring(this.editCellData.value.length - 1) === ')' ||
                                    isNumber(this.editCellData.value.substring(this.editCellData.value.length - 1))) {
                                    if (formulaRefIndicator) {
                                        formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                    }
                                    this.endEdit(false, e);
                                }
                            }
                            else if (this.editCellData.value === editorElem.textContent) {
                                if (this.validCharacters.indexOf((this.editCellData.value +
                                    sheet.selectedRange).substring(curPos_1 - 1, curPos_1)) === -1) {
                                    if (formulaRefIndicator) {
                                        formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                    }
                                    this.endEdit(false, e);
                                }
                                else if (this.validCharacters.indexOf(editorElem.textContent.substring(curPos_1 - 1, curPos_1)) === -1 ||
                                    (editorElem.textContent.substring(curPos_1, curPos_1 + 1) !== ')' &&
                                        this.validCharacters.indexOf(editorElem.textContent.substring(curPos_1, curPos_1 + 1)) === -1)) {
                                    if (formulaRefIndicator) {
                                        formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                    }
                                    this.endEdit(false, e);
                                }
                            }
                        }
                    }
                }
                else {
                    if (isFormula && this.editCellData.value === editorElem.textContent && editorElem.textContent.indexOf('(') !==
                        editorElem.textContent.length - 1 && !this.isCellEdit &&
                        this.validCharacters.indexOf(this.editCellData.value.substring(this.selectionStart - 1, this.selectionStart)) === -1) {
                        if (getSheet(this.parent, this.editCellData.sheetIndex).id === sheet.id) {
                            var curPos = window.getSelection().focusOffset;
                            if (this.validCharacters.indexOf(editorElem.textContent.substring(curPos - 1, curPos)) === -1) {
                                if (formulaRefIndicator) {
                                    formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
                                }
                                this.parent.goTo(this.editCellData.fullAddr);
                                if (this.isEdit) {
                                    this.endEdit(false, e);
                                }
                                return;
                            }
                        }
                    }
                }
            }
        }
    };
    Edit.prototype.dblClickHandler = function (e) {
        var trgtElem = e.target;
        var sheet = this.parent.getActiveSheet();
        var actCell = getCellIndexes(sheet.activeCell);
        var cell = getCell(actCell[0], actCell[1], sheet) || {};
        if (closest(trgtElem, '.e-datavisualization-chart')) {
            return;
        }
        if (!sheet.isProtected || !isLocked(cell, getColumn(sheet, actCell[1]))) {
            if ((trgtElem.className.indexOf('e-ss-overlay') < 0) &&
                (trgtElem.classList.contains('e-active-cell') || trgtElem.classList.contains('e-cell')
                    || closest(trgtElem, '.e-sheet-content') || trgtElem.classList.contains('e-table'))) {
                if (this.isEdit) {
                    if (checkIsFormula(this.editCellData.value)) {
                        var sheetName = this.editCellData.fullAddr.substring(0, this.editCellData.fullAddr.indexOf('!'));
                        if (this.parent.getActiveSheet().name === sheetName) {
                            this.endEdit();
                        }
                    }
                    else {
                        if (trgtElem.className.indexOf('e-spreadsheet-edit') < 0) {
                            this.endEdit();
                        }
                    }
                }
                else {
                    this.isNewValueEdit = false;
                    this.startEdit();
                }
            }
        }
        else {
            if (trgtElem.classList.contains('e-active-cell') || trgtElem.classList.contains('e-cell')) {
                this.parent.notify(editAlert, null);
            }
        }
    };
    Edit.prototype.updateEditCellDetail = function (addr, value) {
        var sheetIdx;
        var sheet;
        var isMergedHiddenCell;
        if (isNullOrUndefined(this.editCellData.sheetIndex)) {
            if (addr && addr.split('!').length > 1) {
                sheetIdx = getSheetIndex(this.parent, getSheetNameFromAddress(addr));
            }
            else {
                sheetIdx = this.parent.activeSheetIndex;
            }
        }
        else {
            sheetIdx = this.editCellData.sheetIndex;
        }
        if (!this.editCellData.addr) {
            sheet = getSheet(this.parent, sheetIdx);
            if (addr) {
                addr = getRangeFromAddress(addr);
            }
            else {
                addr = sheet.activeCell;
            }
        }
        else if (checkIsFormula(this.editCellData.value, true)) {
            sheet = getSheet(this.parent, sheetIdx);
            this.isNewValueEdit = false;
        }
        if (addr) {
            var range = getRangeIndexes(addr);
            var rowIdx = range[0];
            var colIdx = range[1];
            var model = getCell(rowIdx, colIdx, sheet, false, true);
            if (model.colSpan > 1 || model.rowSpan > 1) {
                var mergeArgs = { sheet: sheet, cell: model, rowIdx: rowIdx, colIdx: colIdx };
                setVisibleMergeIndex(mergeArgs);
                rowIdx = mergeArgs.rowIdx;
                colIdx = mergeArgs.colIdx;
                isMergedHiddenCell = mergeArgs.isMergedHiddenCell;
            }
            var cellElem = this.parent.getCell(rowIdx, colIdx);
            var cellPosition = getCellPosition(sheet, range, this.parent.frozenRowCount(sheet), this.parent.frozenColCount(sheet), this.parent.viewport.beforeFreezeHeight, this.parent.viewport.beforeFreezeWidth, this.parent.sheetModule.colGroupWidth);
            this.editCellData = {
                addr: addr,
                fullAddr: getSheetName(this.parent, sheetIdx) + '!' + addr,
                rowIndex: rowIdx,
                colIndex: colIdx,
                sheetIndex: sheetIdx,
                element: cellElem,
                value: value || '',
                position: cellPosition
            };
        }
        return isMergedHiddenCell;
    };
    Edit.prototype.initiateEditor = function (refreshCurPos, isMergedHiddenCell) {
        var _this = this;
        getData(this.parent, this.editCellData.fullAddr, false, isMergedHiddenCell).then(function (values) {
            if (!_this.parent) {
                return;
            }
            values.forEach(function (cell) {
                var args = { cell: cell, value: cell ? cell.value : '' };
                _this.parent.notify(getFormattedBarText, args);
                var value = cell ? args.value : '';
                if (cell && cell.formula) {
                    value = cell.formula;
                }
                _this.editCellData.oldValue = value;
                if (_this.editCellData.value) {
                    value = _this.editCellData.value;
                }
                else {
                    _this.editCellData.value = value;
                }
                if (_this.isNewValueEdit) {
                    value = '';
                }
                else {
                    _this.isNewValueEdit = true;
                }
                if (!isUndefined(value)) {
                    _this.refreshEditor(value, false, true, false, false);
                }
                if (refreshCurPos) {
                    _this.setCursorPosition();
                }
                if (_this.triggerEvent('cellEdit').cancel) {
                    _this.cancelEdit(true, false);
                }
            });
        });
    };
    Edit.prototype.positionEditor = function (isWrap) {
        var tdElem = this.editCellData.element;
        var isEdit = false;
        var cellEle;
        var arg = { isEdit: isEdit };
        this.parent.notify(isFormulaBarEdit, arg);
        if (arg.isEdit && isNullOrUndefined(tdElem)) {
            cellEle = this.parent.getCell(this.editCellData.rowIndex, this.editCellData.colIndex);
            tdElem = cellEle;
            this.editCellData.element = cellEle;
        }
        if (tdElem) {
            tdElem.classList.add('e-ss-edited');
            var sheet = this.parent.getActiveSheet();
            var cell = getCell(this.editCellData.rowIndex, this.editCellData.colIndex, sheet, false, true);
            var left = this.editCellData.position.left + 1;
            var top_1 = this.editCellData.position.top + 1;
            var args = { range: [this.editCellData.rowIndex, this.editCellData.colIndex, this.editCellData.rowIndex,
                    this.editCellData.colIndex] };
            this.parent.notify(activeCellMergedRange, args);
            var minHeight = getRowsHeight(sheet, args.range[0], args.range[2]) - 3;
            var minWidth = getColumnsWidth(sheet, args.range[1], args.range[3]) - 3;
            var cont = this.parent.getMainContent();
            var mainContElement = cont.parentElement;
            var editWidth = void 0;
            var frozenCol = this.parent.frozenColCount(sheet);
            var zIndex = void 0;
            var preventWrap = void 0;
            var frozenRow = this.parent.frozenRowCount(sheet);
            var addWrap = void 0;
            if (this.editCellData.colIndex < frozenCol) {
                editWidth = Math.abs(this.parent.getRowHeaderContent().getBoundingClientRect()[this.parent.enableRtl ? 'left' : 'right'] -
                    tdElem.getBoundingClientRect()[this.parent.enableRtl ? 'right' : 'left']) - 1;
                if (this.editCellData.rowIndex < frozenRow) {
                    if (this.parent.getRowHeaderContent().style.zIndex === '2') {
                        zIndex = '3';
                    }
                }
                else {
                    if (getTextWidth(cell.value, cell.style, this.parent.cellStyle) > editWidth) {
                        addWrap = true;
                    }
                }
            }
            else {
                editWidth = (mainContElement.offsetWidth - (left - cont.scrollLeft) - 28) - this.parent.sheetModule.getRowHeaderWidth(sheet);
                var tdEleInf = tdElem.getBoundingClientRect();
                var mainContEleInf = mainContElement.getBoundingClientRect();
                var getCellRight = this.parent.enableRtl ? tdEleInf.left : tdEleInf.right;
                var getMainConEleRight = this.parent.enableRtl ? mainContEleInf.left : mainContEleInf.right;
                var horizontalScrollBar = this.parent.getScrollElement();
                var verticalScrollBarWidth = this.parent.sheetModule.getScrollSize();
                if (this.parent.enableRtl) {
                    if ((getMainConEleRight + verticalScrollBarWidth) > getCellRight) {
                        horizontalScrollBar.scrollLeft -= tdEleInf.width;
                    }
                }
                else {
                    if ((getMainConEleRight - verticalScrollBarWidth) < getCellRight) {
                        horizontalScrollBar.scrollLeft += tdEleInf.width;
                    }
                }
            }
            if (this.editCellData.rowIndex < frozenRow) {
                preventWrap = true;
            }
            var height = !preventWrap && ((cell && cell.wrap) || (tdElem && isWrap) || addWrap) ? 'auto;' : minHeight + 'px;';
            // let editHeight: number = mainContElement.offsetHeight - top - 28;
            var inlineStyles = 'display:block;top:' + top_1 + 'px;' + (this.parent.enableRtl ? 'right:' : 'left:') + left + 'px;' +
                'min-width:' + minWidth + 'px;max-width:' + (cell && cell.wrap ? minWidth : editWidth) + 'px;' +
                'height:' + height + (cell && cell.wrap ? ('width:' + minWidth + 'px;') : '') + 'min-height:' + minHeight + 'px;' +
                (zIndex ? 'z-index: ' + zIndex + ';' : '') + (preventWrap && ((cell && !cell.wrap) || (tdElem && isWrap)) && (getTextWidth(cell.value, cell.style, this.parent.cellStyle) > editWidth || (tdElem && isWrap)) ? 'overflow: auto;' : '');
            inlineStyles += tdElem.style.cssText;
            var editorElem = this.getEditElement(sheet, true);
            editorElem.setAttribute('style', inlineStyles);
            if (getTextWidth(editorElem.textContent, cell.style, this.parent.cellStyle) > editWidth) {
                editorElem.style.height = 'auto';
            }
            // we using edit div height as auto , while editing div enlarges and hide active cell bottom border for that
            // we increasing 1px height to active cell.
            var actCell = this.parent.element.querySelector('.e-active-cell');
            if (actCell) {
                actCell.style.height = (minHeight + 4) + 'px';
            }
            if (tdElem.classList.contains('e-right-align')) {
                editorElem.classList.add('e-right-align');
            }
            else if (tdElem.classList.contains('e-center-align')) {
                editorElem.classList.add('e-center-align');
            }
        }
    };
    Edit.prototype.updateEditedValue = function (tdRefresh, value, e, isPublic) {
        var _this = this;
        var oldCellValue = this.editCellData.oldValue;
        if (value) {
            this.editCellData.value = value;
        }
        var newVal = this.editCellData.value;
        /* To set the before cell details for undo redo. */
        this.parent.notify(setActionData, { args: { action: 'beforeCellSave', eventArgs: { address: this.editCellData.addr } } });
        var isValidCellValue = true;
        if (this.parent.allowDataValidation) {
            var sheet = this.parent.getActiveSheet();
            var cellIndex = getRangeIndexes(sheet.activeCell);
            var cell = getCell(cellIndex[0], cellIndex[1], sheet, false, true);
            var column = getColumn(sheet, cellIndex[1]);
            if (cell.validation || checkColumnValidation(column, cellIndex[0], cellIndex[1])) {
                var value_2 = parseLocaleNumber([this.editCellData.value || this.getEditElement(sheet).innerText], this.parent.locale)[0];
                var isCell = true;
                var sheetIdx = this.parent.activeSheetIndex;
                var range = typeof this.editCellData.addr === 'string' ? getRangeIndexes(this.editCellData.addr) :
                    this.editCellData.addr;
                var validEventArgs = { value: value_2, range: range, sheetIdx: sheetIdx, isCell: isCell, td: null, isValid: true };
                this.parent.notify(isValidation, validEventArgs);
                isValidCellValue = validEventArgs.isValid;
                if (isValidCellValue) {
                    this.editCellData.value = value_2;
                }
                else {
                    this.isCellEdit = true;
                }
            }
        }
        if (!isPublic && checkIsFormula(this.editCellData.value)) {
            var eventArgs_1 = { formula: this.editCellData.value };
            this.parent.notify(checkFormulaRef, eventArgs_1);
            if (eventArgs_1.isInvalid) {
                var isYesBtnClick_1;
                this.isCellEdit = true;
                isValidCellValue = false;
                var l10n = this.parent.serviceLocator.getService(locale);
                var erroDialogInst_1 = this.parent.serviceLocator.getService(dialog);
                erroDialogInst_1.show({
                    width: 400, isModal: true, showCloseIcon: true, target: this.parent.element, cssClass: 'e-validation-error-dlg',
                    content: l10n.getConstant('CellReferenceTypoError') + "<br>" + eventArgs_1.formula,
                    beforeOpen: function () { return _this.editCellData.element.focus(); },
                    buttons: [{
                            buttonModel: { content: l10n.getConstant('Yes'), isPrimary: true },
                            click: function () {
                                isYesBtnClick_1 = true;
                                erroDialogInst_1.hide();
                                value = _this.editCellData.value = eventArgs_1.formula;
                                _this.updateCell(oldCellValue, tdRefresh, value, newVal, e);
                                _this.parent.notify(formulaBarOperation, { action: 'refreshFormulabar', value: eventArgs_1.formula });
                            }
                        },
                        {
                            buttonModel: { content: l10n.getConstant('No') },
                            click: function () { return erroDialogInst_1.hide(); }
                        }],
                    close: function () {
                        var editorElem = _this.getEditElement(_this.parent.getActiveSheet());
                        if (!isYesBtnClick_1 && editorElem.innerText) {
                            window.getSelection().selectAllChildren(editorElem);
                        }
                    }
                }, false);
            }
        }
        if (isValidCellValue) {
            this.updateCell(oldCellValue, tdRefresh, value, newVal, e);
        }
        else if (e) {
            e.preventDefault();
        }
    };
    Edit.prototype.updateCell = function (oldCellValue, tdRefresh, value, newVal, e) {
        var oldValue = oldCellValue ? oldCellValue.toString().toUpperCase() : '';
        if (oldCellValue !== this.editCellData.value || oldValue.indexOf('=NOW()') > -1 || oldValue.indexOf('=RAND()') > -1 ||
            oldValue.indexOf('RAND()') > -1 || oldValue.indexOf('=RANDBETWEEN(') > -1 || oldValue.indexOf('RANDBETWEEN(') > -1) {
            var sheet = this.parent.getActiveSheet();
            var cellIndex = getRangeIndexes(sheet.activeCell);
            if (oldCellValue && oldCellValue.toString().indexOf('=UNIQUE(') > -1 && this.editCellData.value === '') {
                this.parent.notify(removeUniquecol, null);
            }
            var args = { cellIdx: cellIndex, isUnique: false };
            this.checkUniqueRange(args);
            var isUniqueRange = args.isUnique;
            if (isUniqueRange && oldCellValue !== '' && this.editCellData.value === '') {
                var rangeIdx = getRangeIndexes(this.uniqueColl);
                if (getCell(rangeIdx[0], rangeIdx[1], sheet).value.toString().indexOf('#SPILL!') === -1) {
                    return;
                }
            }
            if (oldCellValue && oldCellValue.toString().indexOf('UNIQUE') > -1 &&
                this.editCellData.value && this.editCellData.value.toString().indexOf('UNIQUE') > -1 && isUniqueRange) {
                this.updateUniqueRange('');
            }
            var evtArgs = {
                action: 'updateCellValue',
                address: this.editCellData.addr, value: this.editCellData.value
            };
            this.parent.notify(workbookEditOperation, evtArgs);
            var indexes = void 0;
            if (evtArgs.isFormulaDependent) {
                indexes = getViewportIndexes(this.parent, this.parent.viewport);
            }
            this.parent.notify(refreshChart, { cell: null, rIdx: this.editCellData.rowIndex, cIdx: this.editCellData.colIndex, viewportIndexes: indexes });
            if (sheet.conditionalFormats && sheet.conditionalFormats.length) {
                this.parent.notify(applyCF, {
                    indexes: [this.editCellData.rowIndex, this.editCellData.colIndex], isAction: true,
                    refreshAll: evtArgs.isFormulaDependent, isEdit: true
                });
            }
            var cell = getCell(cellIndex[0], cellIndex[1], sheet, true);
            var eventArgs = this.getRefreshNodeArgs(cell, this.editCellData.element, this.editCellData.rowIndex, this.editCellData.colIndex);
            this.editCellData.value = eventArgs.value;
            if (cell && cell.formula) {
                this.editCellData.formula = cell.formula;
            }
            if (cell && cell.wrap) {
                this.parent.notify(wrapEvent, { range: cellIndex, wrap: true, sheet: sheet });
            }
            if (tdRefresh) {
                this.parent.refreshNode(this.editCellData.element, eventArgs);
            }
            if (cell && cell.hyperlink) {
                this.parent.serviceLocator.getService('cell').refreshRange(cellIndex);
            }
            if (isUniqueRange) {
                var rangeIdx = getRangeIndexes(this.uniqueColl);
                if (getCell(rangeIdx[0], rangeIdx[1], sheet).value.toString().indexOf('#SPILL!') > -1) {
                    this.isSpill = true;
                }
                if ((oldCellValue !== '' && this.editCellData.value === '') ||
                    (this.editCellData.formula && this.editCellData.formula.length > 1 && oldCellValue !== this.editCellData.formula)) {
                    var skip = false;
                    for (var j = rangeIdx[0]; j <= rangeIdx[2]; j++) {
                        for (var k = rangeIdx[1]; k <= rangeIdx[3]; k++) {
                            var cell_1 = getCell(j, k, sheet);
                            if (j === rangeIdx[0] && k === rangeIdx[1]) {
                                skip = false;
                            }
                            else if (cell_1 && !isNullOrUndefined(cell_1.value) && cell_1.value !== '') {
                                skip = true;
                            }
                        }
                    }
                    if (!skip) {
                        this.reApplyFormula();
                    }
                }
                else {
                    this.updateUniqueRange(newVal);
                }
            }
        }
        this.triggerEvent('cellSave', e, value);
        this.resetEditState();
        this.focusElement();
        if (this.parent.showSheetTabs && !this.parent.isProtected) {
            this.parent.element.querySelector('.e-add-sheet-tab').removeAttribute('disabled');
        }
    };
    Edit.prototype.checkUniqueRange = function (uniquArgs) {
        var args = { range: [] };
        this.parent.notify(getUniqueRange, args);
        var collection = args.range;
        if (!uniquArgs.sheetName) {
            uniquArgs.sheetName = this.parent.getActiveSheet().name;
        }
        for (var i = 0; i < collection.length; i++) {
            if (collection[i].split('!')[0] === uniquArgs.sheetName) {
                var rangeIdx = getRangeIndexes(collection[i]);
                for (var j = rangeIdx[0]; j <= rangeIdx[2]; j++) {
                    for (var k = rangeIdx[1]; k <= rangeIdx[3]; k++) {
                        if (uniquArgs.cellIdx[0] === j && uniquArgs.cellIdx[1] === k) {
                            uniquArgs.isUnique = true;
                            this.uniqueCell = true;
                            var uniqueIndex = this.uniqueColl !== '' ? getRangeIndexes(this.uniqueColl) : [0, 0, 0, 0];
                            var collectionIndex = getRangeIndexes(collection[i]);
                            if (uniqueIndex[0] === collectionIndex[0] && uniqueIndex[1] === collectionIndex[1]) {
                                var index = [uniqueIndex[0], collectionIndex[1], uniqueIndex[0], collectionIndex[1]];
                                index[2] = uniqueIndex[2] > collectionIndex[2] ? uniqueIndex[2] : collectionIndex[2];
                                index[3] = uniqueIndex[3] > collectionIndex[3] ? uniqueIndex[3] : collectionIndex[3];
                                this.uniqueColl = getRangeAddress(index);
                                uniquArgs.uniqueRange = getRangeAddress(index);
                            }
                            else {
                                this.uniqueColl = collection[i];
                                uniquArgs.uniqueRange = collection[i];
                            }
                        }
                    }
                }
            }
        }
    };
    Edit.prototype.updateUniqueRange = function (value) {
        var rangeIdx = getRangeIndexes(this.uniqueColl);
        var skip = false;
        if (getCell(rangeIdx[0], rangeIdx[1], this.parent.getActiveSheet()).value !== '#SPILL!') {
            skip = true;
        }
        for (var j = rangeIdx[0]; j <= rangeIdx[2]; j++) {
            for (var k = rangeIdx[1]; k <= rangeIdx[3]; k++) {
                if (skip) {
                    if (j === rangeIdx[0] && k === rangeIdx[1]) {
                        this.parent.updateCell({ value: '#SPILL!' }, getRangeAddress([j, k]));
                    }
                    else {
                        if (getRangeAddress([j, k]).split(':')[0] === this.editCellData.addr) {
                            this.parent.updateCell({ value: value }, getRangeAddress([j, k]));
                        }
                        else {
                            this.parent.updateCell({ value: '' }, getRangeAddress([j, k]));
                        }
                    }
                }
            }
        }
    };
    Edit.prototype.reApplyFormula = function () {
        var cellIdx = getRangeIndexes(this.uniqueColl);
        var cell = getCell(cellIdx[0], cellIdx[1], this.parent.getActiveSheet());
        this.parent.updateCell({ value: '' }, getRangeAddress([cellIdx[0], cellIdx[1]]));
        var sheets = this.parent.sheets;
        var formula = cell.formula;
        for (var i = 0; i < sheets.length; i++) {
            if (formula.indexOf(sheets[i].name) > -1) {
                formula = formula.replace(sheets[i].name, '!' + i);
            }
        }
        this.parent.notify(workbookFormulaOperation, { action: 'computeExpression', formula: formula });
        this.uniqueCell = false;
        if (this.uniqueActCell !== '') {
            this.editCellData.value = this.uniqueActCell;
            this.uniqueActCell = '';
        }
    };
    Edit.prototype.refreshDependentCellValue = function (rowIdx, colIdx, sheetIdx) {
        if (rowIdx && colIdx) {
            rowIdx--;
            colIdx--;
            if (((this.editCellData.rowIndex !== rowIdx || this.editCellData.colIndex !== colIdx)
                && this.parent.activeSheetIndex === sheetIdx) || (this.uniqueCell && this.parent.activeSheetIndex === sheetIdx)) {
                var sheet = getSheet(this.parent, sheetIdx);
                var td = void 0;
                if (!isHiddenRow(sheet, rowIdx) && !isHiddenCol(sheet, colIdx)) {
                    td = this.parent.getCell(rowIdx, colIdx);
                }
                if (td) {
                    if (td.parentElement) {
                        var curRowIdx = td.parentElement.getAttribute('aria-rowindex');
                        if (curRowIdx && Number(curRowIdx) - 1 !== rowIdx) {
                            return;
                        }
                    }
                    var cell = getCell(rowIdx, colIdx, sheet);
                    var actCell = getRangeIndexes(sheet.activeCell);
                    if (actCell[0] === rowIdx && actCell[1] === colIdx) {
                        this.uniqueActCell = cell.value;
                    }
                    var eventArgs = this.getRefreshNodeArgs(cell, td, rowIdx, colIdx);
                    this.parent.refreshNode(td, eventArgs);
                }
            }
        }
    };
    Edit.prototype.getRefreshNodeArgs = function (cell, tdEle, rowIdx, colIdx) {
        cell = cell || {};
        var eventArgs = { value: cell.value, format: cell.format, formattedText: '', isRightAlign: false,
            type: 'General', cell: cell, rowIndex: rowIdx, td: tdEle, colIndex: colIdx, refresh: true, isEdit: true };
        this.parent.notify(getFormattedCellObject, eventArgs);
        return { isRightAlign: eventArgs.isRightAlign, type: eventArgs.type, value: eventArgs.value,
            result: this.parent.allowNumberFormatting ? eventArgs.formattedText : eventArgs.value, curSymbol: eventArgs.curSymbol,
            isRowFill: eventArgs.isRowFill };
    };
    Edit.prototype.endEdit = function (refreshFormulaBar, event, isPublic) {
        if (refreshFormulaBar === void 0) { refreshFormulaBar = false; }
        if (refreshFormulaBar) {
            this.refreshEditor(this.editCellData.oldValue, false, true, false, false);
        }
        var triggerEventArgs = this.triggerEvent('beforeCellSave');
        if (triggerEventArgs.cancel) {
            if (this.parent.isEdit && event) {
                event.preventDefault();
            }
            return;
        }
        if (triggerEventArgs.value && triggerEventArgs.value.toString().indexOf('\n') > -1) {
            wrapText(this.parent.getActiveSheet().selectedRange, true, this.parent);
            this.refreshEditor(triggerEventArgs.value, this.isCellEdit, false, false, false);
        }
        this.updateEditedValue(true, triggerEventArgs.value, event, isPublic);
    };
    Edit.prototype.cancelEdit = function (refreshFormulaBar, trigEvent, event) {
        if (refreshFormulaBar === void 0) { refreshFormulaBar = true; }
        if (trigEvent === void 0) { trigEvent = true; }
        this.refreshEditor(this.editCellData.oldValue, refreshFormulaBar, false, false, false);
        if (trigEvent) {
            this.triggerEvent('cellSave', event);
        }
        this.resetEditState();
        this.focusElement();
    };
    Edit.prototype.focusElement = function () {
        focus(this.parent.element);
        this.parent.notify(enableToolbarItems, [{ enable: true }]);
    };
    Edit.prototype.triggerEvent = function (eventName, event, value) {
        var sheet = this.parent.getActiveSheet();
        var cell = getCell(this.editCellData.rowIndex, this.editCellData.colIndex, sheet);
        var eventArgs = {
            element: this.editCellData.element,
            value: value ? value : this.editCellData.value,
            oldValue: this.editCellData.oldValue,
            address: this.editCellData.fullAddr,
            displayText: this.parent.getDisplayText(cell)
        };
        if (eventArgs.address) {
            var indexes = getRangeIndexes(eventArgs.address);
            var args = { cellIdx: indexes, isUnique: false };
            this.checkUniqueRange(args);
            if (args.isUnique) {
                eventArgs.isSpill = this.isSpill;
            }
        }
        if (eventArgs.value !== eventArgs.oldValue) {
            if (eventName !== 'cellSave') {
                eventArgs.cancel = false;
            }
            if (eventName === 'beforeCellSave') {
                this.parent.notify(beginAction, { eventArgs: eventArgs, action: 'cellSave', preventAction: true });
                cell = checkIsFormula(eventArgs.value) ? { formula: eventArgs.value } : { value: eventArgs.value };
                var cancel = updateCell(this.parent, sheet, { cell: cell, rowIdx: this.editCellData.rowIndex, colIdx: this.editCellData.colIndex,
                    eventOnly: true });
                if (cancel) {
                    this.cancelEdit(false, false);
                    eventArgs.cancel = true;
                    return eventArgs;
                }
            }
            this.parent.trigger(eventName, eventArgs);
            if (eventName === 'cellSave') {
                if (this.editCellData.formula) {
                    eventArgs.formula = this.editCellData.formula;
                }
                eventArgs.originalEvent = event;
                this.parent.notify(completeAction, { eventArgs: eventArgs, action: 'cellSave' });
            }
        }
        else if (eventName !== 'cellSave' && eventName !== 'beforeCellSave') {
            this.parent.trigger(eventName, eventArgs);
        }
        return { value: eventArgs.value, oldValue: null, element: null, address: null, cancel: eventArgs.cancel };
    };
    Edit.prototype.altEnter = function () {
        this.positionEditor(true);
        var selection = window.getSelection();
        var node = selection.anchorNode;
        var offset;
        var range = document.createRange();
        offset = (node.nodeType === 3) ? selection.anchorOffset : node.textContent.length;
        if (offset === 0 && node.textContent.length > 0) {
            offset = node.textContent.length;
        }
        var text = node.textContent;
        var textBefore = text.slice(0, offset);
        var textAfter = text.slice(offset) || ' ';
        node.textContent = textBefore + '\n' + textAfter;
        range = document.createRange();
        if (node.nodeType === 3) {
            range.setStart(node, offset + 1);
            range.setEnd(node, offset + 1);
        }
        else if (node.nodeType === 1) {
            range.setStart(node.firstChild, offset + 1);
            range.setEnd(node.firstChild, offset + 1);
        }
        selection.removeAllRanges();
        selection.addRange(range);
    };
    Edit.prototype.resetEditState = function (elemRefresh) {
        if (elemRefresh === void 0) { elemRefresh = true; }
        if (elemRefresh) {
            var editorElem = this.getEditElement(this.parent.getActiveSheet());
            if (checkIsFormula(editorElem.textContent) || editorElem.textContent === '') {
                this.parent.notify(clearCellRef, null);
            }
            if (this.editCellData.element) {
                this.editCellData.element.classList.remove('e-ss-edited');
                this.editorElem.textContent = '';
                if (editorElem === this.editorElem) {
                    this.editorElem.removeAttribute('style');
                    this.editorElem.classList.remove('e-right-align');
                }
                else {
                    detach(editorElem);
                }
            }
        }
        this.editCellData = {};
        this.parent.isEdit = this.isEdit = false;
        this.isCellEdit = true;
        this.parent.notify(formulaOperation, { action: 'endEdit' });
    };
    Edit.prototype.refSelectionRender = function () {
        var editorElem = this.getEditElement(this.parent.getActiveSheet());
        if (editorElem) {
            if (checkIsFormula(editorElem.textContent)) {
                this.parent.notify(initiateFormulaReference, {
                    range: editorElem.textContent, formulaSheetIdx: this.editCellData.sheetIndex
                });
            }
        }
    };
    // Start edit the formula cell and set cursor position
    Edit.prototype.initiateRefSelection = function () {
        var sheetName = this.editCellData.fullAddr.substring(0, this.editCellData.fullAddr.indexOf('!'));
        var value = this.editCellData.value;
        if (this.parent.getActiveSheet().name === sheetName && checkIsFormula(this.editCellData.value, true)) {
            this.startEdit(this.editCellData.addr, value, false);
            this.parent.notify(initiateFormulaReference, {
                range: this.editCellData.value, formulaSheetIdx: this.editCellData.sheetIndex
            });
            this.getEditElement(this.parent.getActiveSheet()).textContent = value;
            this.initiateCurPosition();
        }
        else {
            this.initiateCurPosition();
        }
    };
    Edit.prototype.addressHandler = function (args) {
        var selection = window.getSelection();
        this.selectionStart = selection.anchorOffset;
        this.selectionEnd = selection.focusOffset;
        if (this.selectionStart > this.selectionEnd) {
            var x = this.selectionStart;
            this.selectionStart = this.selectionEnd;
            this.selectionEnd = x;
        }
        if ((selection && selection.focusNode && selection.focusNode.classList &&
            selection.focusNode.classList.contains('e-formula-bar-panel'))) {
            var formulaBar = selection.focusNode.getElementsByClassName('e-formula-bar e-css')[0];
            this.selectionStart = formulaBar.selectionStart;
            this.selectionEnd = formulaBar.selectionEnd;
        }
        var eventArgs = { action: 'getCurrentEditValue', editedValue: '' };
        this.parent.notify(editOperation, eventArgs);
        var address = args.range;
        var sheetName = this.editCellData.fullAddr.substring(0, this.editCellData.fullAddr.indexOf('!'));
        var sheetIdx = this.editCellData.sheetIndex;
        var editorEle = this.getEditElement(this.parent.getActiveSheet());
        if (this.parent.getActiveSheet().name !== sheetName) {
            address = '\'' + this.parent.getActiveSheet().name + '\'' + '!' + address;
        }
        if (args.isSelect) {
            this.parent.notify(initiateFormulaReference, { range: eventArgs.editedValue + address, formulaSheetIdx: sheetIdx });
        }
        else {
            var sheetName_1 = this.editCellData.fullAddr.substring(0, this.editCellData.fullAddr.indexOf('!'));
            if (this.parent.getActiveSheet().name === sheetName_1) {
                var editedValue = eventArgs.editedValue;
                if (this.selectionStart !== this.selectionEnd) {
                    this.formulaBarCurStartPos = this.selectionStart;
                    this.curStartPos = this.selectionStart;
                    this.curEndPos = this.selectionStart + address.length;
                    editorEle.textContent = editedValue.substring(0, this.selectionStart)
                        + address + editedValue.substring(this.selectionStart);
                }
                else if (editedValue.indexOf(')') === editedValue.length - 1 && this.selectionEnd === editedValue.length) {
                    editorEle.textContent = editedValue.substring(0, editedValue.length - 1)
                        + address + editedValue.substring(editedValue.length - 1);
                    this.curEndPos = editorEle.textContent.length - 1;
                }
                else if (editedValue.indexOf(')') !== editedValue.length - 1) {
                    editorEle.textContent = editedValue + address;
                    this.curEndPos = editorEle.textContent.length;
                }
                else if (editorEle.textContent !== editedValue) {
                    editorEle.textContent = editedValue.substring(0, this.curStartPos)
                        + address + editedValue.substring(this.curStartPos);
                    this.curEndPos = this.curStartPos + address.length;
                }
                else if (this.selectionStart === this.selectionEnd &&
                    this.validCharacters.indexOf(editedValue.substring(this.selectionStart - 1, this.selectionEnd)) !== -1 &&
                    (this.validCharacters.indexOf(editedValue.substring(this.selectionStart, this.selectionEnd + 1)) !== -1 ||
                        editedValue.substring(this.selectionStart, this.selectionEnd + 1) === ')')) {
                    editorEle.textContent = editedValue.substring(0, this.selectionStart)
                        + address + editedValue.substring(this.selectionEnd);
                    this.curStartPos = this.selectionStart;
                    this.curEndPos = this.selectionStart + address.length;
                    this.formulaBarCurStartPos = this.curStartPos;
                }
            }
        }
    };
    Edit.prototype.updateFormulaBarValue = function () {
        var selection = window.getSelection();
        var value = this.editCellData.value;
        var address = this.parent.getActiveSheet().selectedRange;
        address = isSingleCell(getIndexesFromAddress(address)) ? address.split(':')[0] : address;
        var formulaBar = this.parent.element.querySelector('.e-formula-bar');
        if (value && checkIsFormula(value, true)) {
            var sheetName = this.editCellData.fullAddr.substring(0, this.editCellData.fullAddr.indexOf('!'));
            if (this.parent.getActiveSheet().name !== sheetName) {
                address = '\'' + this.parent.getActiveSheet().name + '\'' + '!' + address;
            }
            if (!isNullOrUndefined(this.formulaBarCurStartPos)) {
                formulaBar.value = value.substring(0, this.formulaBarCurStartPos)
                    + address + value.substring(this.formulaBarCurStartPos);
            }
            else if (value.indexOf(')') === value.length - 1 && selection.focusOffset === value.length) {
                formulaBar.value = value.substring(0, value.length - 1) + address + value.substring(value.length - 1);
            }
            else if (value.indexOf(')') !== value.length - 1) {
                formulaBar.value = value + address;
            }
            else if (formulaBar.value !== value) {
                formulaBar.value = value.substring(0, this.curStartPos)
                    + address + value.substring(this.curStartPos);
            }
            this.curEndPos = this.curStartPos + address.length;
        }
    };
    Edit.prototype.setFormulaBarCurPosition = function (input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.selectionStart = selectionStart;
            input.selectionEnd = selectionStart;
            input.setSelectionRange(selectionStart, selectionEnd);
        }
    };
    Edit.prototype.initiateCurPosition = function (args) {
        if (args === void 0) { args = { isCellEdit: false }; }
        var el = this.getEditElement(this.parent.getActiveSheet(), true);
        if (args.isCellEdit) {
            var curOffset = this.getCurPosition();
            if (!this.endFormulaRef && curOffset.start === curOffset.end) {
                this.updateFormulaReference(el);
                if (curOffset.end && this.validCharacters.indexOf(this.editCellData.value[curOffset.end - 1]) === -1) {
                    this.endFormulaRef = true;
                }
            }
            return;
        }
        var value = el.innerText;
        var selection = window.getSelection();
        if ((selection && selection.focusNode && selection.focusNode.classList &&
            selection.focusNode.classList.contains('e-formula-bar-panel'))) {
            var formulaBar = this.parent.element.querySelector('.e-formula-bar');
            this.setFormulaBarCurPosition(formulaBar, this.curEndPos, this.curEndPos);
            return;
        }
        if (value) {
            var range = document.createRange();
            if (value.indexOf(')') === value.length - 1) {
                range.setStart(el.childNodes[0], this.curEndPos);
                range.setEnd(el.childNodes[0], this.curEndPos);
            }
            else {
                range.setStart(el.childNodes[0], this.curEndPos);
                range.setEnd(el.childNodes[0], this.curEndPos);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }
        var sheetIdx = this.editCellData.sheetIndex;
        if (sheetIdx !== this.parent.getActiveSheet().id - 1) {
            var elem = this.parent.element.querySelector('.e-formula-bar');
            if (elem.value) {
                var valueLength = elem.value.length;
                if (elem.value.indexOf(')') === valueLength - 1) {
                    this.setFormulaBarCurPosition(elem, valueLength - 1, valueLength - 1);
                }
                else {
                    this.setFormulaBarCurPosition(elem, valueLength, valueLength);
                }
            }
        }
    };
    Edit.prototype.getEditElement = function (sheet, isEdit) {
        if ((this.isEdit || isEdit) && (sheet.frozenRows || sheet.frozenColumns)) {
            var frozenRow = this.parent.frozenRowCount(sheet);
            var frozenCol = this.parent.frozenColCount(sheet);
            var range = getCellIndexes(sheet.activeCell);
            var content = void 0;
            if (range[0] < frozenRow && range[1] < frozenCol) {
                content = this.parent.getSelectAllContent();
            }
            else if (range[0] < frozenRow) {
                content = this.parent.getColumnHeaderContent();
            }
            else if (range[1] < frozenCol) {
                content = this.parent.getRowHeaderContent();
            }
            else {
                return this.editorElem;
            }
            var editEle = content.getElementsByClassName('e-spreadsheet-edit')[0];
            if (!editEle && isEdit) {
                editEle = content.appendChild(this.editorElem.cloneNode());
            }
            return editEle;
        }
        return this.editorElem;
    };
    Edit.prototype.sheetChangeHandler = function () {
        if (!this.isEdit) {
            this.editCellData.value = null;
        }
    };
    return Edit;
}());
export { Edit };
