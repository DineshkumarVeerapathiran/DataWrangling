var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Property, NotifyPropertyChanges, Collection, Complex } from '@syncfusion/ej2-base';
import { initSheet, getSheet, getSheetIndexFromId, getSheetIndexByName, getSheetIndex, Sheet, moveSheet, duplicateSheet } from './sheet';
import { Event, merge, L10n, isNullOrUndefined } from '@syncfusion/ej2-base';
import { getWorkbookRequiredModules } from '../common/module';
import { getData } from './index';
import { DefineName, CellStyle, updateRowColCount, getIndexesFromAddress, localeData, workbookLocale, getSheetIndexFromAddress, inRange } from '../common/index';
import * as events from '../common/event';
import { insertModel, getAddressInfo } from '../common/index';
import { setCellFormat, sheetCreated, deleteModel, setLockCells } from '../common/index';
import { AutoFillSettings, dateToInt } from '../common/index';
import { getCellIndexes, getCellAddress, unMerge } from '../common/index';
import { setMerge, dataChanged } from '../common/index';
import { getCell, skipDefaultValue, setCell, wrap as wrapText } from './cell';
import { DataBind, setRow, setColumn } from '../index';
import { WorkbookSave, WorkbookFormula, WorkbookOpen, WorkbookSort, WorkbookFilter, WorkbookImage } from '../integrations/index';
import { WorkbookChart } from '../integrations/index';
import { WorkbookNumberFormat, getFormatFromType } from '../integrations/number-format';
import { WorkbookEdit, WorkbookCellFormat, WorkbookHyperlink, WorkbookInsert, WorkbookProtectSheet, WorkbookAutoFill } from '../actions/index';
import { WorkbookDataValidation, WorkbookMerge } from '../actions/index';
import { ServiceLocator } from '../services/index';
import { setLinkModel, setImage, setChart, activeCellChanged, setAutoFill, updateCell } from '../common/index';
import { deleteChart, formulaBarOperation } from '../../spreadsheet/common/event';
import { beginAction, WorkbookFindAndReplace, getRangeIndexes, workbookEditOperation, clearCFRule, setCFRule } from '../index';
import { WorkbookConditionalFormat } from '../actions/conditional-formatting';
import { setVisibleMergeIndex } from '../common/index';
/**
 * Represents the Workbook.
 */
var Workbook = /** @class */ (function (_super) {
    __extends(Workbook, _super);
    /**
     * Constructor for initializing the library.
     *
     * @param {WorkbookModel} options - Configures Workbook model.
     */
    function Workbook(options) {
        var _this = _super.call(this, options) || this;
        /** @hidden */
        _this.isEdit = false;
        /**
         * To generate sheet name based on sheet count.
         *
         * @hidden
         */
        _this.sheetNameCount = 1;
        /**
         * @hidden
         */
        _this.dataValidationRange = '';
        /**
         * @hidden
         */
        _this.isOpen = false;
        /**
         * @hidden
         */
        _this.chartColl = [];
        /** @hidden */
        _this.customFormulaCollection = new Map();
        Workbook_1.Inject(DataBind, WorkbookSave, WorkbookOpen, WorkbookNumberFormat, WorkbookCellFormat, WorkbookEdit, WorkbookFormula, WorkbookSort, WorkbookHyperlink, WorkbookFilter, WorkbookInsert, WorkbookFindAndReplace, WorkbookDataValidation, WorkbookProtectSheet, WorkbookMerge, WorkbookConditionalFormat, WorkbookImage, WorkbookChart, WorkbookAutoFill);
        _this.commonCellStyle = {};
        if (options && options.cellStyle) {
            _this.commonCellStyle = options.cellStyle;
        }
        if (_this.getModuleName() === 'workbook') {
            _this.serviceLocator = new ServiceLocator;
            _this.initWorkbookServices();
            _this.dataBind();
            _this.initEmptySheet();
        }
        return _this;
    }
    Workbook_1 = Workbook;
    /**
     * For internal use only.
     *
     * @returns {void} - For internal use only.
     * @hidden
     */
    Workbook.prototype.preRender = function () {
        if (!Object.keys(this.commonCellStyle).length) {
            this.commonCellStyle = skipDefaultValue(this.cellStyle, true);
        }
        if (this.getModuleName() === 'spreadsheet' && !this.refreshing) {
            this.initEmptySheet();
        }
    };
    Workbook.prototype.initWorkbookServices = function () {
        this.serviceLocator.register(workbookLocale, new L10n(this.getModuleName(), localeData, this.locale));
    };
    /**
     * For internal use only.
     *
     * @returns {void} - For internal use only.
     * @hidden
     */
    Workbook.prototype.render = function () {
        /** code snippets */
    };
    /**
     * To provide the array of modules needed for workbook.
     *
     * @returns {ModuleDeclaration[]} - To provide the array of modules needed for workbook.
     * @hidden
     */
    Workbook.prototype.requiredModules = function () {
        return getWorkbookRequiredModules(this);
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} - Get the properties to be maintained in the persisted state.
     * @hidden
     */
    Workbook.prototype.getPersistData = function () {
        return this.addOnPersist([]);
    };
    /**
     * Applies the style (font family, font weight, background color, etc...) to the specified range of cells.
     *
     * {% codeBlock src='spreadsheet/cellFormat/index.md' %}{% endcodeBlock %}
     *
     * @param {CellStyleModel} style - Specifies the cell style.
     * @param {string} range - Specifies the address for the range of cells.
     * @returns {void} - Applies the style (font family, font weight, background color, etc...) to the specified range of cells.
     */
    Workbook.prototype.cellFormat = function (style, range) {
        var sheet = this.getActiveSheet();
        range = range || sheet.selectedRange;
        this.notify(setCellFormat, { style: style, range: range, refreshRibbon: range.indexOf(sheet.activeCell) > -1 ? true : false });
    };
    /**
     * Applies cell lock to the specified range of cells.
     *
     * {% codeBlock src='spreadsheet/lockCells/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - Specifies the address for the range of cells.
     * @param {boolean} isLocked -Specifies the cell is locked or not.
     * @returns {void} - To Applies cell lock to the specified range of cells.
     */
    Workbook.prototype.lockCells = function (range, isLocked) {
        var sheet = this.getActiveSheet();
        range = range || sheet.selectedRange;
        this.notify(setLockCells, { range: range, isLocked: isLocked, triggerEvent: true });
    };
    /**
     * @hidden
     * @param {Workbook} cssProps - Specifies the cssProps.
     * @param {number[]} indexes - Specifies the indexes.
     * @returns {CellStyleModel} - To get Cell Style Value.
     */
    Workbook.prototype.getCellStyleValue = function (cssProps, indexes) {
        var _this = this;
        var cell = getCell(indexes[0], indexes[1], this.getActiveSheet());
        var style = {};
        cssProps.forEach(function (cssProp) {
            style["" + cssProp] = _this.cellStyle["" + cssProp];
            if (cell && cell.style && cell.style["" + cssProp]) {
                style["" + cssProp] = cell.style["" + cssProp];
            }
        });
        return style;
    };
    /**
     * Applies the number format (number, currency, percentage, short date, etc...) to the specified range of cells.
     *
     * {% codeBlock src='spreadsheet/numberFormat/index.md' %}{% endcodeBlock %}
     *
     * @param {string} format - Specifies the number format code.
     * @param {string} range - Specifies the address for the range of cells.
     * @returns {void} - Applies the number format (number, currency, percentage, short date, etc...) to the specified range of cells.
     */
    Workbook.prototype.numberFormat = function (format, range) {
        this.notify(events.applyNumberFormatting, { format: format, range: range });
        this.notify(events.addFormatToCustomFormatDlg, { format: format });
    };
    /**
     * Used to create new sheet.
     *
     * @hidden
     * @param {number} index - Specifies the index.
     * @param {SheetModel[]} sheets - Specifies the sheets.
     * @returns {void} - To create new sheet.
     */
    Workbook.prototype.createSheet = function (index, sheets) {
        if (index === void 0) { index = this.sheets.length; }
        if (sheets === void 0) { sheets = [{}]; }
        var _a;
        (_a = this.sheets).splice.apply(_a, [index, 0].concat(sheets));
        initSheet(this, sheets);
        this.notify(sheetCreated, { sheetIndex: index || 0, sheets: sheets });
        this.notify(events.workbookFormulaOperation, {
            action: 'registerSheet', sheetIndex: index || 0, sheetCount: index + sheets.length
        });
    };
    /**
     * Used to remove sheet.
     *
     * @hidden
     * @param  {number} idx - Specifies the index.
     * @returns {void} - To remove sheet
     */
    Workbook.prototype.removeSheet = function (idx) {
        this.sheets.splice(idx, 1);
    };
    /**
     * Destroys the Workbook library.
     *
     * @returns {void} - To destroy sheet
     */
    Workbook.prototype.destroy = function () {
        this.notify(events.workbookDestroyed, null);
        _super.prototype.destroy.call(this);
    };
    /**
     * Called internally if any of the property value changed.
     *
     * @param {WorkbookModel} newProp - To set the properties
     * @param {WorkbookModel} oldProp - To get the properties
     * @returns {void} - property value changed
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Workbook.prototype.onPropertyChanged = function (newProp, oldProp) {
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'cellStyle':
                    merge(this.commonCellStyle, newProp.cellStyle);
                    break;
                case 'sheets':
                    if (newProp.sheets === this.sheets) {
                        this.notify(events.workbookFormulaOperation, { action: 'unRegisterSheet', propertyChange: true });
                        this.sheetNameCount = 1;
                        this.notify(events.sheetsDestroyed, {});
                        initSheet(this);
                        this.notify(sheetCreated, null);
                        this.notify(events.workbookFormulaOperation, { action: 'registerSheet' });
                    }
                    else {
                        initSheet(this);
                    }
                    break;
            }
        }
    };
    /**
     * Not applicable for workbook.
     *
     * @hidden
     * @param {string | HTMLElement} selector - Specifies the selector.
     * @returns {void} - To append the element.
     */
    Workbook.prototype.appendTo = function (selector) {
        _super.prototype.appendTo.call(this, selector);
    };
    /**
     * Used to hide/show the rows in spreadsheet.
     *
     * @param {number} startIndex - Specifies the start row index.
     * @param {number} endIndex - Specifies the end row index.
     * @param {boolean} hide - To hide/show the rows in specified range.
     * @returns {void} - To hide/show the rows in spreadsheet.
     */
    Workbook.prototype.hideRow = function (startIndex, endIndex, hide) {
        if (endIndex === void 0) { endIndex = startIndex; }
        if (hide === void 0) { hide = true; }
        var sheet = this.getActiveSheet();
        for (var i = startIndex; i <= endIndex; i++) {
            setRow(sheet, i, { hidden: hide });
        }
    };
    /**
     * Used to hide/show the columns in spreadsheet.
     *
     * @param {number} startIndex - Specifies the start column index.
     * @param {number} endIndex - Specifies the end column index.
     * @param {boolean} hide - Set `true` / `false` to hide / show the columns.
     * @returns {void} - To hide/show the columns in spreadsheet.
     */
    Workbook.prototype.hideColumn = function (startIndex, endIndex, hide) {
        if (endIndex === void 0) { endIndex = startIndex; }
        if (hide === void 0) { hide = true; }
        var sheet = this.getActiveSheet();
        for (var i = startIndex; i <= endIndex; i++) {
            setColumn(sheet, i, { hidden: hide });
        }
    };
    /**
     * Sets the border to specified range of cells.
     *
     * {% codeBlock src='spreadsheet/setBorder/index.md' %}{% endcodeBlock %}
     *
     * @param {CellStyleModel} style - Specifies the style property which contains border value.
     * @param {string} range - Specifies the range of cell reference. If not specified, it will considered the active cell reference.
     * @param {BorderType} type - Specifies the range of cell reference. If not specified, it will considered the active cell reference.
     * @returns {void} - To Sets the border to specified range of cells.
     */
    Workbook.prototype.setBorder = function (style, range, type) {
        this.notify(setCellFormat, {
            style: style, borderType: type, range: range || this.getActiveSheet().selectedRange
        });
    };
    /**
     * Used to insert rows in to the spreadsheet.
     *
     * {% codeBlock src='spreadsheet/insertRow/index.md' %}{% endcodeBlock %}
     *
     * @param {number | RowModel[]} startRow - Specifies the start row index / row model which needs to be inserted.
     * @param {number} endRow - Specifies the end row index.
     * @param {number | string} sheet - Specifies the sheet name or index in which the insert operation will perform. By default,
     * active sheet will be considered.
     * @returns {void} - To insert rows in to the spreadsheet.
     */
    Workbook.prototype.insertRow = function (startRow, endRow, sheet) {
        this.notify(insertModel, { model: this.getSheetModel(sheet), start: startRow, end: endRow,
            modelType: 'Row', insertType: 'below' });
    };
    /**
     * Used to insert columns in to the spreadsheet.
     *
     * {% codeBlock src='spreadsheet/insertColumn/index.md' %}{% endcodeBlock %}
     *
     * @param {number | ColumnModel[]} startColumn - Specifies the start column index / column model which needs to be inserted.
     * @param {number} endColumn - Specifies the end column index.
     * @param {number | string} sheet - Specifies the sheet name or index in which the insert operation will perform. By default,
     * active sheet will be considered.
     * @returns {void} - To insert columns in to the spreadsheet.
     */
    Workbook.prototype.insertColumn = function (startColumn, endColumn, sheet) {
        this.notify(insertModel, { model: this.getSheetModel(sheet), start: startColumn, end: endColumn,
            modelType: 'Column', insertType: 'after' });
    };
    /**
     * Used to insert sheets in to the spreadsheet.
     *
     * {% codeBlock src='spreadsheet/insertSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number | SheetModel[]} startSheet - Specifies the start sheet index / sheet model which needs to be inserted.
     * @param {number} endSheet - Specifies the end sheet index.
     * @returns {void} - To insert sheets in to the spreadsheet.
     */
    Workbook.prototype.insertSheet = function (startSheet, endSheet) {
        this.notify(insertModel, { model: this, start: startSheet, end: endSheet, modelType: 'Sheet' });
    };
    /**
     * Used to delete rows, columns and sheets from the spreadsheet.
     *
     * {% codeBlock src='spreadsheet/delete/index.md' %}{% endcodeBlock %}
     *
     * @param {number} startIndex - Specifies the start sheet / row / column index.
     * @param {number} endIndex - Specifies the end sheet / row / column index.
     * @param {ModelType} model - Specifies the delete model type. By default, the model is considered as `Sheet`. The possible values are,
     * - Row: To delete rows.
     * - Column: To delete columns.
     * - Sheet: To delete sheets.
     * @param {number | string} sheet - Specifies the sheet name or index in which the delete operation will perform. By default,
     * active sheet will be considered. It is applicable only for model type Row and Column.
     * @returns {void} - To delete rows, columns and sheets from the spreadsheet.
     */
    Workbook.prototype.delete = function (startIndex, endIndex, model, sheet) {
        startIndex = startIndex || 0;
        var sheetModel;
        if (!model || model === 'Sheet') {
            sheetModel = this;
        }
        else {
            sheetModel = this.getSheetModel(sheet);
            if (!sheetModel) {
                return;
            }
        }
        this.notify(deleteModel, {
            model: sheetModel, start: startIndex, end: isNullOrUndefined(endIndex) ? startIndex : endIndex, modelType: model || 'Sheet'
        });
    };
    /**
     * Used to move the sheets to the specified position in the list of sheets.
     *
     * {% codeBlock src='spreadsheet/moveSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number} position - Specifies the position to move a sheet in the list of sheets.
     * @param {number[]} sheetIndexes - Specifies the indexes of the sheet to be moved. By default, the active sheet will be moved.
     * @returns {void} - Used to move the sheets to the specified position in the list of sheets.
     */
    Workbook.prototype.moveSheet = function (position, sheetIndexes) {
        moveSheet(this, position, sheetIndexes);
    };
    /**
     * Used to make a duplicate/copy of the sheet in the spreadsheet.
     *
     * {% codeBlock src='spreadsheet/duplicateSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number} sheetIndex - Specifies the index of the sheet to be duplicated. By default, the active sheet will be duplicated.
     * @returns {void} - Used to make a duplicate/copy of the sheet in the spreadsheet.
     */
    Workbook.prototype.duplicateSheet = function (sheetIndex) {
        duplicateSheet(this, sheetIndex);
    };
    Workbook.prototype.getSheetModel = function (sheet) {
        if (isNullOrUndefined(sheet)) {
            return this.getActiveSheet();
        }
        else {
            var index = typeof sheet === 'string' ? getSheetIndex(this, sheet) : sheet;
            if (isNullOrUndefined(index) || index >= this.sheets.length) {
                return null;
            }
            return this.sheets[index];
        }
    };
    /**
     * Used to merge the range of cells.
     *
     * {% codeBlock src='spreadsheet/merge/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - Specifies the range of cells as address.
     * @param {MergeType} type - Specifies the merge type. The possible values are,
     * - All: Merge all the cells between provided range.
     * - Horizontally: Merge the cells row-wise.
     * - Vertically: Merge the cells column-wise.
     * @returns {void} - To merge the range of cells.
     */
    Workbook.prototype.merge = function (range, type) {
        var sheetIdx;
        var sheet;
        if (range) {
            sheetIdx = getSheetIndexFromAddress(this, range);
            sheet = getSheet(this, sheetIdx);
        }
        else {
            sheet = this.getActiveSheet();
            range = sheet.selectedRange;
        }
        this.notify(setMerge, { merge: true, range: range, type: type || 'All', sheetIndex: sheetIdx, refreshRibbon: range.indexOf(sheet.activeCell) > -1 ? true : false, preventRefresh: this.activeSheetIndex !== sheetIdx });
    };
    /**
     * Used to split the merged cell into multiple cells.
     *
     * {% codeBlock src='spreadsheet/unMerge/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - Specifies the range of cells as address.
     * @returns {void} - To split the merged cell into multiple cells.
     */
    Workbook.prototype.unMerge = function (range) {
        this.notify(unMerge, { range: range });
    };
    /** Used to compute the specified expression/formula.
     *
     * {% codeBlock src='spreadsheet/computeExpression/index.md' %}{% endcodeBlock %}
     *
     * @param {string} formula - Specifies the formula(=SUM(A1:A3)) or expression(2+3).
     * @returns {string | number} - to compute the specified expression/formula.
     */
    Workbook.prototype.computeExpression = function (formula) {
        var args = {
            action: 'computeExpression', formula: formula, isFromComputeExpression: true
        };
        this.notify(events.workbookFormulaOperation, args);
        return args.calcValue;
    };
    Workbook.prototype.initEmptySheet = function () {
        if (!this.sheets.length) {
            this.createSheet();
        }
        else {
            initSheet(this);
        }
    };
    /** @hidden
     * @returns {SheetModel} - To get Active Sheet.
     */
    Workbook.prototype.getActiveSheet = function () {
        return this.sheets[this.activeSheetIndex];
    };
    /** @hidden
     * @param {number} index - Specifies the index.
     * @param {number} initIdx - Specifies the initIdx.
     * @param {number} hiddenCount - Specifies the initIdx.
     * @returns {number} - To skip Hidden Sheets.
     */
    Workbook.prototype.skipHiddenSheets = function (index, initIdx, hiddenCount) {
        if (hiddenCount === void 0) { hiddenCount = 0; }
        if (this.sheets[index] && this.sheets[index].state !== 'Visible') {
            if (initIdx === undefined) {
                initIdx = index;
            }
            if (index && index + 1 === this.sheets.length) {
                index = initIdx - 1;
            }
            else {
                index = index < initIdx ? --index : ++index;
            }
            index = this.skipHiddenSheets(index, initIdx, ++hiddenCount);
        }
        if (hiddenCount === this.sheets.length) {
            this.setSheetPropertyOnMute(this.sheets[0], 'state', 'Visible');
            return 0;
        }
        return index;
    };
    /**
     * Used for setting the used range row and column index.
     *
     * @hidden
     * @param {number} rowIdx - Specifies the rowIndex.
     * @param {number} colIdx - Specifies the colIndex.
     * @param {SheetModel} sheet - Specifies the active sheet.
     * @param {boolean} preventRowColUpdate - To prevent updating row and column count.
     * @param {boolean} forceUpdate - To force updating row and column count.
     * @returns {void} - To setting the used range row and column index.
     */
    Workbook.prototype.setUsedRange = function (rowIdx, colIdx, sheet, preventRowColUpdate, forceUpdate) {
        if (sheet === void 0) { sheet = this.getActiveSheet(); }
        if (forceUpdate) {
            sheet.usedRange.rowIndex = rowIdx;
            sheet.usedRange.colIndex = colIdx;
            return;
        }
        if (rowIdx > sheet.usedRange.rowIndex) {
            sheet.usedRange.rowIndex = rowIdx;
            if (sheet === this.getActiveSheet() && !preventRowColUpdate) {
                this.notify(updateRowColCount, { index: rowIdx, update: 'row' });
            }
        }
        if (colIdx > sheet.usedRange.colIndex) {
            sheet.usedRange.colIndex = colIdx;
            if (sheet === this.getActiveSheet() && !preventRowColUpdate) {
                this.notify(updateRowColCount, { index: colIdx, update: 'col' });
            }
        }
    };
    /**
     * Gets the range of data as JSON from the specified address.
     *
     * {% codeBlock src='spreadsheet/getData/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the address for range of cells.
     * @returns {Promise<Map<string, CellModel>>} - Gets the range of data as JSON from the specified address.
     */
    Workbook.prototype.getData = function (address) {
        return getData(this, address);
    };
    /**
     * Get component name.
     *
     * @returns {string} - Gets the module name.
     * @hidden
     */
    Workbook.prototype.getModuleName = function () {
        return 'workbook';
    };
    /** @hidden
     * @param {string} address - Specifies the sheet id.
     * @returns {void} - To set the value for row and col.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Workbook.prototype.goTo = function (address) {
        /** */
    };
    /** @hidden
     * @param {number} sheetId - Specifies the sheet id.
     * @param {number} rowIndex - Specifies the rowIndex.
     * @param {number} colIndex - Specifies the colIndex.
     * @param {string} formulaCellReference - Specifies the formulaCellReference.
     * @param {boolean} refresh - Specifies the refresh.
     * @returns {string | number} - To set the value for row and col.
     */
    Workbook.prototype.getValueRowCol = function (sheetId, rowIndex, colIndex, formulaCellReference, refresh, isUnique) {
        var args = {
            action: 'getSheetInfo', sheetInfo: []
        };
        this.notify(events.workbookFormulaOperation, args);
        if (getSheetIndexByName(this, 'Sheet' + sheetId, args.sheetInfo) === -1) {
            var errArgs = { action: 'getReferenceError', refError: '' };
            this.notify(events.workbookFormulaOperation, errArgs);
            return errArgs.refError;
        }
        var sheetIndex = getSheetIndexFromId(this, sheetId);
        var sheet = getSheet(this, sheetIndex);
        var cell = getCell(rowIndex - 1, colIndex - 1, sheet);
        if (formulaCellReference && formulaCellReference.includes('!') && !cell && sheet.ranges && sheet.ranges.length) {
            var isNotLoaded_1;
            if (this.formulaRefCell && this.formulaRefCell === formulaCellReference) {
                return cell && cell.value;
            }
            sheet.ranges.forEach(function (range) {
                if (!range.info || !range.info.loadedRange || !range.info.loadedRange.length) {
                    isNotLoaded_1 = true;
                    return;
                }
            });
            if (isNotLoaded_1) {
                this.formulaRefCell = formulaCellReference;
                sheetIndex = getSheetIndexFromId(this, Number(formulaCellReference.substring(formulaCellReference.lastIndexOf(',') + 1, formulaCellReference.length)));
                if (isNullOrUndefined(sheetIndex)) {
                    return cell && cell.value;
                }
                formulaCellReference = formulaCellReference.substring(formulaCellReference.lastIndexOf('!') + 1, formulaCellReference.lastIndexOf(','));
                getData(this, sheet.name + "!A1:" + getCellAddress(rowIndex - 1, colIndex - 1), null, null, null, null, formulaCellReference, sheetIndex);
            }
        }
        else if (cell && cell.formula && (refresh || isNullOrUndefined(cell.value)) && !isUnique) {
            this.notify('calculateFormula', { cell: cell, rowIdx: rowIndex - 1, colIdx: colIndex - 1, sheetIndex: sheetIndex,
                formulaRefresh: true });
        }
        return cell && cell.value;
    };
    /** @hidden
     * @param {number} sheetId - Specifies the sheet id.
     * @param {string | number} value - Specifies the value.
     * @param {number} rowIndex - Specifies the rowIndex.
     * @param {number} colIndex - Specifies the colIndex.
     * @param {string} formula - Specifies the colIndex.
     * @returns {void} - To set the value for row and col.
     */
    Workbook.prototype.setValueRowCol = function (sheetId, value, rowIndex, colIndex, formula, isRandomFormula) {
        this.notify(workbookEditOperation, {
            action: 'updateCellValue', address: [rowIndex - 1, colIndex - 1], value: value,
            sheetIndex: getSheetIndexFromId(this, sheetId), isValueOnly: true, formula: formula, isRandomFormula: isRandomFormula
        });
    };
    /**
     * Opens the specified excel file or stream.
     *
     * @param {OpenOptions} options - Options for opening the excel file.
     * @returns {void} - Opens the specified excel file or stream.
     */
    Workbook.prototype.open = function (options) {
        this.notify(events.workbookOpen, options);
    };
    /**
     * Opens the specified JSON object.
     *
     * {% codeBlock src='spreadsheet/openFromJson/index.md' %}{% endcodeBlock %}
     *
     * The available arguments in options are:
     * * file: Specifies the spreadsheet model as object or string. And the object contains the jsonObject,
     * which is saved from spreadsheet using saveAsJson method.
     *
     * @param {Object} options - Options for opening the JSON object.
     * @param {string | object} options.file - Options for opening the JSON object.
     * @returns {void} - Opens the specified JSON object.
     */
    Workbook.prototype.openFromJson = function (options) {
        this.isOpen = true;
        var jsonObject = typeof options.file === 'object' ? JSON.stringify(options.file) : options.file;
        this.notify(events.workbookOpen, { jsonObject: jsonObject });
    };
    /**
     * Saves the Spreadsheet data to Excel file.
     *
     * {% codeBlock src='spreadsheet/save/index.md' %}{% endcodeBlock %}
     *
     * The available arguments in saveOptions are:
     * * url: Specifies the save URL.
     * * fileName: Specifies the file name.
     * * saveType: Specifies the file type need to be saved.
     *
     * @param {SaveOptions} saveOptions - Options for saving the excel file.
     * @returns {void} - To Saves the Spreadsheet data to Excel file.
     */
    Workbook.prototype.save = function (saveOptions) {
        if (saveOptions === void 0) { saveOptions = {}; }
        if (this.allowSave) {
            var defaultProps = {
                url: this.saveUrl,
                fileName: saveOptions.fileName || 'Sample',
                saveType: 'Xlsx'
                //passWord: args.passWord
            };
            var eventArgs = __assign({}, defaultProps, saveOptions, { customParams: {}, isFullPost: true, needBlobData: false, cancel: false, pdfLayoutSettings: { fitSheetOnOnePage: false, orientation: 'Portrait' } });
            this.trigger('beforeSave', eventArgs);
            this.notify(beginAction, { eventArgs: eventArgs, action: 'beforeSave' });
            if (!eventArgs.cancel) {
                this.notify(events.beginSave, {
                    saveSettings: eventArgs, isFullPost: eventArgs.isFullPost,
                    needBlobData: eventArgs.needBlobData, customParams: eventArgs.customParams, pdfLayoutSettings: eventArgs.pdfLayoutSettings
                });
            }
        }
    };
    /**
     * Saves the Spreadsheet data as JSON object.
     *
     * {% codeBlock src='spreadsheet/saveAsJson/index.md' %}{% endcodeBlock %}
     *
     * @returns {Promise<object>} - To Saves the Spreadsheet data as JSON object.
     */
    Workbook.prototype.saveAsJson = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.on(events.onSave, function (args) {
                args.cancel = true;
                _this.off(events.onSave);
                resolve({ jsonObject: { Workbook: args.jsonObject } });
                _this.notify(events.saveCompleted, args);
            });
            _this.save();
        });
    };
    Workbook.prototype.addHyperlink = function (hyperlink, cellAddress) {
        var args = { hyperlink: hyperlink, cell: cellAddress };
        this.notify(setLinkModel, args);
    };
    /**
     * To find the specified cell value.
     *
     * @hidden
     * @param {FindOptions} args - options for find.
     * {% codeBlock src='spreadsheet/findHandler/index.md' %}{% endcodeBlock %}
     * @returns {void} - To find the specified cell value.
     */
    Workbook.prototype.findHandler = function (args) {
        this.notify(events.find, args);
    };
    /**
     * @hidden
     * @param {FindOptions} args - Specifies the FindOptions.
     * @returns {void} - To replace the value.
     */
    Workbook.prototype.replaceHandler = function (args) {
        if (args.replaceBy === 'replace') {
            this.notify(events.replace, args);
        }
        else {
            this.notify(events.replaceAll, args);
        }
    };
    /**
     * Protect the active sheet based on the protect sheetings.
     *
     * @param {number} sheet - Specifies the sheet to protect.
     * @param {ProtectSettingsModel} protectSettings - Specifies the protect settings of the sheet.
     * @param {string} password - Specifies the password to protect
     * @returns {void} - protect the active sheet.
     */
    Workbook.prototype.protectSheet = function (sheet, protectSettings, password) {
        if (isNullOrUndefined(sheet)) {
            sheet = this.activeSheetIndex;
        }
        else if (typeof (sheet) === 'string') {
            sheet = getSheetIndex(this, sheet);
        }
        var sheetModel = this.sheets[sheet];
        if (!sheetModel) {
            return;
        }
        this.setSheetPropertyOnMute(sheetModel, 'isProtected', true);
        this.setSheetPropertyOnMute(sheetModel, 'password', password ? password : '');
        this.setSheetPropertyOnMute(sheetModel, 'protectSettings', protectSettings ? protectSettings : {});
        this.notify(events.protectsheetHandler, { protectSettings: sheetModel.protectSettings, password: sheetModel.password, sheetIndex: sheet });
    };
    /**
     * Unprotect the active sheet.
     *
     * @param {number} sheet - Specifies the sheet to Unprotect.
     * @returns {void} - Unprotect the active sheet.
     */
    Workbook.prototype.unprotectSheet = function (sheet) {
        if (isNullOrUndefined(sheet)) {
            sheet = this.activeSheetIndex;
        }
        else if (typeof (sheet) === 'string') {
            sheet = getSheetIndex(this, sheet);
        }
        if (!this.sheets[sheet]) {
            return;
        }
        var args = { sheet: sheet };
        this.notify(events.unprotectsheetHandler, args);
    };
    /**
     * Sorts the range of cells in the active Spreadsheet.
     *
     * @param {SortOptions} sortOptions - options for sorting.
     * @param {string} range - address of the data range.
     * @returns {Promise<SortEventArgs>} - Sorts the range of cells in the active Spreadsheet.
     */
    Workbook.prototype.sort = function (sortOptions, range) {
        if (!this.allowSorting) {
            return Promise.reject();
        }
        var eventArgs = {
            range: range || this.getActiveSheet().selectedRange,
            sortOptions: sortOptions || { sortDescriptors: {} },
            cancel: false
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        var promise = new Promise(function (resolve, reject) { resolve((function () { })()); });
        var sortArgs = { args: eventArgs, promise: promise };
        this.notify(events.initiateSort, sortArgs);
        return sortArgs.promise;
    };
    Workbook.prototype.addDataValidation = function (rules, range) {
        if (rules.type === 'List' && rules.value1.length > 256) {
            rules.value1 = rules.value1.substring(0, 255);
        }
        this.notify(events.cellValidation, { rules: rules, range: range || this.getActiveSheet().selectedRange });
    };
    Workbook.prototype.removeDataValidation = function (range) {
        this.notify(events.cellValidation, { range: range, isRemoveValidation: true });
    };
    Workbook.prototype.addInvalidHighlight = function (range) {
        this.notify(events.addHighlight, { range: range });
    };
    Workbook.prototype.removeInvalidHighlight = function (range) {
        this.notify(events.removeHighlight, { range: range });
    };
    /**
     * To determine whether the cell value in a data validation applied cell is valid or not.
     *
     * @param {string} cellAddress - Address of the cell.
     * @returns {boolean} - It return true if the cell value is valid; otherwise, false.
     */
    Workbook.prototype.isValidCell = function (cellAddress) {
        var range = getCellIndexes(cellAddress);
        var cell = getCell(range[0], range[1], this.getActiveSheet());
        if (cell && cell.validation) {
            var value = cell.value ? cell.value : '';
            var sheetIdx = this.activeSheetIndex;
            var validEventArgs = { value: value, range: range, sheetIdx: sheetIdx, isCell: false, td: null, isValid: true };
            this.notify(events.isValidation, validEventArgs);
            return validEventArgs.isValid;
        }
        else {
            return true;
        }
    };
    Workbook.prototype.conditionalFormat = function (conditionalFormat) {
        conditionalFormat.range = conditionalFormat.range || this.getActiveSheet().selectedRange;
        this.notify(setCFRule, { cfModel: conditionalFormat });
    };
    Workbook.prototype.clearConditionalFormat = function (range) {
        var clearCFArgs = {};
        if (!range || !range.includes('!')) {
            clearCFArgs.range = range || this.getActiveSheet().selectedRange;
            clearCFArgs.sheetIdx = this.activeSheetIndex;
        }
        else {
            var addrInfo = range.split('!');
            clearCFArgs.range = addrInfo[1];
            clearCFArgs.sheetIdx = getSheetIndex(this, addrInfo[0]);
        }
        this.notify(clearCFRule, clearCFArgs);
    };
    /**
     * To update a cell properties.
     *
     * @param {CellModel} cell - Cell properties.
     * @param {string} address - Address to update.
     * @returns {void} - To update a cell properties
     * {% codeBlock src='spreadsheet/updateCell/index.md' %}{% endcodeBlock %}
     */
    Workbook.prototype.updateCell = function (cell, address) {
        var range;
        var sheetIdx;
        if (!address) {
            address = this.getActiveSheet().activeCell;
        }
        if (address.includes('!')) {
            range = getIndexesFromAddress(address);
            sheetIdx = getSheetIndex(this, address.split('!')[0]);
            if (sheetIdx === undefined) {
                return;
            }
        }
        else {
            range = getRangeIndexes(address);
            sheetIdx = this.activeSheetIndex;
        }
        var sheet = getSheet(this, sheetIdx);
        updateCell(this, sheet, { cell: cell, rowIdx: range[0], colIdx: range[1], preventEvt: true });
        var val = isNullOrUndefined(cell.value) ? (cell.formula || null) : cell.value;
        if (val !== null) {
            this.notify(workbookEditOperation, { action: 'updateCellValue', address: range, value: val, sheetIndex: sheetIdx });
        }
        if (sheetIdx === this.activeSheetIndex) {
            var cellEle = void 0;
            var cellModel = getCell(range[0], range[1], sheet, false, true);
            var mergeArgs = { sheet: sheet, cell: cellModel, rowIdx: range[0], colIdx: range[1] };
            if (cellModel.rowSpan > 1 || cellModel.colSpan > 1) {
                setVisibleMergeIndex(mergeArgs);
                cellEle = this.getCell(mergeArgs.rowIdx, mergeArgs.colIdx);
            }
            this.serviceLocator.getService('cell').refresh(range[0], range[1], true, cellEle, val !== null);
            this.notify(activeCellChanged, null);
            if (inRange(getRangeIndexes(sheet.activeCell), mergeArgs.rowIdx, mergeArgs.colIdx)) {
                this.notify(formulaBarOperation, { action: 'refreshFormulabar', value: this.getDisplayText(cell) || cell.formula });
            }
        }
    };
    /**
     * Used to get a row data from the data source with updated cell value.
     *
     * {% codeBlock src='spreadsheet/getRowData/index.md' %}{% endcodeBlock %}
     *
     * @param {number} index - Specifies the row index.
     * @param {number} sheetIndex - Specifies the sheet index. By default, it consider the active sheet index.
     * @returns {Object[]} - Return row data.
     */
    Workbook.prototype.getRowData = function (index, sheetIndex) {
        if (isNullOrUndefined(index)) {
            index = 0;
        }
        if (isNullOrUndefined(sheetIndex)) {
            sheetIndex = this.activeSheetIndex;
        }
        var eventArgs = { sheetIdx: sheetIndex, startIndex: index, modelType: 'Row', isDataRequest: true };
        this.notify(dataChanged, eventArgs);
        return eventArgs.data;
    };
    /**
     * This method is used to update the Range property in specified sheetIndex.
     *
     * @param {RangeModel} range - Specifies the range properties to update.
     * @param {number} sheetIdx - Specifies the sheetIdx to update.
     * @returns {void} - To update a range properties.
     */
    Workbook.prototype.updateRange = function (range, sheetIdx) {
        sheetIdx = sheetIdx ? sheetIdx - 1 : this.activeSheetIndex;
        var sheet = getSheet(this, sheetIdx);
        var ranges = sheet.ranges;
        if (!isNullOrUndefined(sheet)) {
            ranges.push(range);
            sheet.ranges = ranges;
        }
    };
    /**
     * This method is used to wrap/unwrap the text content of the cell.
     *
     * {% codeBlock src='spreadsheet/wrap/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Address of the cell to be wrapped.
     * @param {boolean} wrap - Set `false` if the text content of the cell to be unwrapped.
     * @returns {void} - To wrap/unwrap the text content of the cell.
     * {% codeBlock src='spreadsheet/wrap/index.md' %}{% endcodeBlock %}
     */
    Workbook.prototype.wrap = function (address, wrap) {
        if (wrap === void 0) { wrap = true; }
        wrapText(address, wrap, this);
    };
    /**
     * Adds the defined name to the Spreadsheet.
     *
     * @param {DefineNameModel} definedName - Specifies the name.
     * @returns {boolean} - Return the added status of the defined name.
     * {% codeBlock src='spreadsheet/addDefinedName/index.md' %}{% endcodeBlock %}
     */
    Workbook.prototype.addDefinedName = function (definedName) {
        var eventArgs = {
            action: 'addDefinedName',
            isAdded: false,
            definedName: definedName
        };
        this.notify(events.workbookFormulaOperation, eventArgs);
        return eventArgs.isAdded;
    };
    /**
     * Removes the defined name from the Spreadsheet.
     *
     * @param {string} definedName - Specifies the name.
     * @param {string} scope - Specifies the scope of the defined name.
     * @returns {boolean} - Return the removed status of the defined name.
     * {% codeBlock src='spreadsheet/removeDefinedName/index.md' %}{% endcodeBlock %}
     */
    Workbook.prototype.removeDefinedName = function (definedName, scope) {
        if (scope === void 0) { scope = ''; }
        var eventArgs = {
            action: 'removeDefinedName',
            isRemoved: false,
            definedName: definedName,
            scope: scope
        };
        this.notify(events.workbookFormulaOperation, eventArgs);
        return eventArgs.isRemoved;
    };
    /** @hidden
     * @param {string} address - Specifies the address.
     * @param {number} sheetIndex - Specifies the sheetIndex.
     * @param {boolean} valueOnly - Specifies the bool value.
     * @returns {void} - To clear range.
     */
    Workbook.prototype.clearRange = function (address, sheetIndex, valueOnly) {
        //** */
    };
    /**
     * Used to set the image in spreadsheet.
     *
     * @param {ImageModel} images - Specifies the options to insert image in spreadsheet.
     * @param {string} range - Specifies the range in spreadsheet.
     * @returns {void} - To set the image in spreadsheet.
     */
    Workbook.prototype.insertImage = function (images, range) {
        this.notify(setImage, { options: images, range: range ? range : this.getActiveSheet().selectedRange });
    };
    /**
     * Used to perform autofill action based on the specified range in spreadsheet.
     *
     * @param {string} fillRange - Specifies the fill range.
     * @param {string} dataRange - Specifies the data range.
     * @param {AutoFillDirection} direction - Specifies the direction("Down","Right","Up","Left") to be filled.
     * @param {AutoFillType} fillType - Specifies the fill type("FillSeries","CopyCells","FillFormattingOnly","FillWithoutFormatting") for autofill action.
     * @returns {void} - To perform autofill action based on the specified range in spreadsheet.
     */
    Workbook.prototype.autoFill = function (fillRange, dataRange, direction, fillType) {
        var options = {
            dataRange: dataRange ? dataRange : this.getActiveSheet().selectedRange,
            fillRange: fillRange,
            direction: direction ? direction : 'Down',
            fillType: fillType ? fillType : 'FillSeries'
        };
        this.notify(setAutoFill, options);
    };
    /**
     * Used to set the chart in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/insertChart/index.md' %}{% endcodeBlock %}
     *
     * @param {ChartModel} chart - Specifies the options to insert chart in spreadsheet
     * @returns {void} - To set the chart in spreadsheet.
     */
    Workbook.prototype.insertChart = function (chart) {
        this.notify(setChart, { chart: chart });
    };
    /**
     * Used to delete the chart from spreadsheet.
     *
     * {% codeBlock src='spreadsheet/deleteChart/index.md' %}{% endcodeBlock %}
     *
     * @param {string} id - Specifies the chart element id.
     * @returns {void} - To delete the chart from spreadsheet.
     */
    Workbook.prototype.deleteChart = function (id) {
        this.notify(deleteChart, { id: id });
    };
    /**
     * Filters the range of cells in the sheet.
     *
     * @param {FilterOptions} filterOptions - Specifies the filterOptions
     * @param {string} range - Specifies the range
     * @returns {Promise<FilterEventArgs>} - To Filters the range of cells in the sheet.
     */
    Workbook.prototype.filter = function (filterOptions, range) {
        if (!this.allowFiltering) {
            return Promise.reject();
        }
        var eventArgs = {
            range: range || this.getActiveSheet().selectedRange,
            filterOptions: filterOptions,
            cancel: false
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        var promise = new Promise(function (resolve, reject) { resolve((function () { })()); });
        var filterArgs = { args: eventArgs, promise: promise };
        this.notify(events.initiateFilter, filterArgs);
        return filterArgs.promise;
    };
    /**
     * To add custom library function.
     *
     * @param {string} functionHandler - Custom function handler name
     * @param {string} functionName - Custom function name
     * {% codeBlock src='spreadsheet/addCustomFunction/index.md' %}{% endcodeBlock %}
     * @returns {void} - To add custom library function.
     */
    Workbook.prototype.addCustomFunction = function (functionHandler, functionName, formulaDescription) {
        functionName = functionName ? functionName : typeof functionHandler === 'string' ? functionHandler :
            functionHandler.name.replace('bound ', '');
        var eventArgs = {
            action: 'addCustomFunction',
            functionHandler: functionHandler,
            functionName: functionName,
            formulaDescription: formulaDescription
        };
        this.notify(events.workbookFormulaOperation, eventArgs);
    };
    /**
     * This method is used to Clear contents, formats and hyperlinks in spreadsheet.
     *
     * @param {ClearOptions} options - Options for clearing the content, formats and hyperlinks in spreadsheet.
     * @returns {void} - To Clear contents, formats and hyperlinks.
     */
    Workbook.prototype.clear = function (options) {
        this.notify(events.clear, options);
    };
    /**
     * Gets the formatted text of the cell.
     *
     * {% codeBlock src='spreadsheet/getDisplayText/index.md' %}{% endcodeBlock %}
     *
     * @param {CellModel} cell - Specifies the cell.
     * @returns {string} - To get Display Text.
     */
    Workbook.prototype.getDisplayText = function (cell) {
        if (!cell) {
            return '';
        }
        if (cell.format && !isNullOrUndefined(cell.value)) {
            var eventArgs = { formattedText: cell.value, value: cell.value, format: cell.format, cell: cell,
                skipFormatCheck: true };
            this.notify(events.getFormattedCellObject, eventArgs);
            return eventArgs.formattedText;
        }
        else if (!cell.value && cell.hyperlink) {
            return typeof cell.hyperlink === 'string' ? cell.hyperlink : cell.hyperlink.address;
        }
        else {
            return cell.value || typeof cell.value === 'number' ? cell.value.toString() : '';
        }
    };
    /**
     * This method is used to freeze rows and columns after the specified cell in the Spreadsheet.
     *
     * @param {number} row - Specifies the freezed row count.
     * @param {number} column - Specifies the freezed column count.
     * @param {number | string} sheet - Specifies the sheet name or index in which the freeze operation will perform. By default,
     * active sheet will be considered.
     * {% codeBlock src='spreadsheet/freezePanes/index.md' %}{% endcodeBlock %}
     * @returns {void}
     */
    Workbook.prototype.freezePanes = function (row, column, sheet) {
        if (row === void 0) { row = 1; }
        if (column === void 0) { column = 1; }
        var model = this.getSheetModel(sheet);
        if (!this.allowFreezePane || (model.frozenRows === row && model.frozenColumns === column)) {
            return;
        }
        this.setSheetPropertyOnMute(model, 'frozenRows', row);
        this.setSheetPropertyOnMute(model, 'frozenColumns', column);
        this.updateTopLeftCell();
        if (model.id === this.getActiveSheet().id && this.getModuleName() === 'spreadsheet') {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            this.renderModule.refreshSheet();
        }
    };
    /**
     * This method is used to unfreeze the frozen rows and columns from the active sheet.
     *
     * @param {number | string} sheet - Specifies the sheet name or index in which the unfreeze operation will perform. By default,
     * active sheet will be considered.
     * {% codeBlock src='spreadsheet/unfreezePanes/index.md' %}{% endcodeBlock %}
     * @returns {void}

     */
    Workbook.prototype.Unfreeze = function (sheet) {
        this.freezePanes(0, 0, sheet);
    };
    /**
     * This method is used to unfreeze the frozen rows and columns from spreadsheet.
     *
     * @param {number | string} sheet - Specifies the sheet name or index in which the unfreeze operation will perform. By default,
     * active sheet will be considered.
     * {% codeBlock src='spreadsheet/unfreezePanes/index.md' %}{% endcodeBlock %}
     * @returns {void}
     */
    Workbook.prototype.unfreezePanes = function (sheet) {
        this.freezePanes(0, 0, sheet);
    };
    /**
     * @param {number} top - Specifies the top.
     * @param {number} left - Specifies the fleft.
     * @param {string} model - Specifies the model.
     * @param {SheetModel} sheet - Specifies the sheet.
     * @returns {void}
     * @hidden
     */
    Workbook.prototype.updateTopLeftCell = function (top, left, model, sheet) {
        if (!sheet) {
            sheet = this.getActiveSheet();
        }
        var indexes = getCellIndexes(sheet.topLeftCell);
        if (sheet.frozenRows || sheet.frozenColumns) {
            if (isNullOrUndefined(top)) {
                top = sheet.frozenRows ? 0 : indexes[0];
            }
            if (isNullOrUndefined(left)) {
                left = sheet.frozenColumns ? 0 : indexes[1];
            }
            top += this.frozenRowCount(sheet);
            left += this.frozenColCount(sheet);
            if (model) {
                if (model === 'row') {
                    top = getCellIndexes(sheet.paneTopLeftCell)[0];
                }
                else {
                    left = getCellIndexes(sheet.paneTopLeftCell)[1];
                }
            }
            this.setSheetPropertyOnMute(sheet, 'paneTopLeftCell', getCellAddress(top, left));
            if (sheet.frozenRows) {
                top = indexes[0];
            }
            if (sheet.frozenColumns) {
                left = indexes[1];
            }
        }
        else {
            if (isNullOrUndefined(top)) {
                top = indexes[0];
            }
            if (isNullOrUndefined(left)) {
                left = indexes[1];
            }
            this.setSheetPropertyOnMute(sheet, 'paneTopLeftCell', getCellAddress(top, left));
        }
        this.setSheetPropertyOnMute(sheet, 'topLeftCell', getCellAddress(top, left));
    };
    /**
     * @hidden
     * @param {string} address - Specifies the address.
     * @returns {number | number[]} - To get address info.
     */
    Workbook.prototype.getAddressInfo = function (address) {
        return getAddressInfo(this, address);
    };
    /**
     * @hidden
     * @param {SheetModel} sheet - Specifies the sheet.
     * @param {string} prop - Specifies the prop.
     * @param {Object} value - Specifies the value.
     * @returns {void} - To set sheet properties.
     */
    Workbook.prototype.setSheetPropertyOnMute = function (sheet, prop, value) {
        this.isProtectedOnChange = true;
        sheet["" + prop] = value;
        this.isProtectedOnChange = false;
    };
    /**
     * To get frozen row count from top index.
     *
     * @hidden
     * @param {SheetModel} sheet - Specifies the sheet.
     * @returns {number} - to get the frozen count.
     */
    Workbook.prototype.frozenRowCount = function (sheet) {
        return sheet.frozenRows ? (sheet.topLeftCell === 'A1' ? sheet.frozenRows : getCellIndexes(sheet.topLeftCell)[0] + sheet.frozenRows)
            : 0;
    };
    /**
     * To get frozen column count from left index.
     *
     * @hidden
     * @param {SheetModel} sheet - Specifies the sheet.
     * @returns {number} - to get the frozen count.
     */
    Workbook.prototype.frozenColCount = function (sheet) {
        return sheet.frozenColumns ? (sheet.topLeftCell === 'A1' ? sheet.frozenColumns : getCellIndexes(sheet.topLeftCell)[1] +
            sheet.frozenColumns) : 0;
    };
    /**
     * To update the provided range while inserting or deleting rows and columns.
     *
     * @param {InsertDeleteEventArgs} args - Insert / Detele event arguments.
     * @param {number[]} index - Existing range.
     * @returns {boolean} - It return `true`, if the insert / delete action happens between the provided range, otherwise `false`.
     * @hidden
     */
    Workbook.prototype.updateRangeOnInsertDelete = function (args, index, isRangeFormula) {
        var diff;
        var updated = false;
        if (args.isInsert) {
            diff = (args.endIndex - args.startIndex) + 1;
            if (args.modelType === 'Row') {
                if (args.startIndex <= index[0]) {
                    index[0] += diff;
                    updated = true;
                }
                if ((args.startIndex <= index[2]) || (isRangeFormula && args.startIndex === index[2] + 1)) {
                    index[2] += diff;
                    updated = true;
                }
            }
            else {
                if (args.startIndex <= index[1]) {
                    index[1] += diff;
                    updated = true;
                }
                if (args.startIndex <= index[3] || (isRangeFormula && args.startIndex === index[3] + 1)) {
                    index[3] += diff;
                    updated = true;
                }
            }
        }
        else {
            if (args.modelType === 'Row') {
                diff = index[0] - args.startIndex;
                if (diff > 0) {
                    if (index[0] > args.endIndex) {
                        diff = (args.endIndex - args.startIndex) + 1;
                        if (diff > 0) {
                            index[0] -= diff;
                            updated = true;
                        }
                    }
                    else {
                        index[0] -= diff;
                        updated = true;
                    }
                }
                if (args.startIndex <= index[2]) {
                    if (args.endIndex <= index[2]) {
                        index[2] -= (args.endIndex - args.startIndex) + 1;
                    }
                    else {
                        index[2] -= (index[2] - args.startIndex) + 1;
                    }
                    updated = true;
                }
            }
            else {
                diff = index[1] - args.startIndex;
                if (diff > 0) {
                    if (index[1] > args.endIndex) {
                        diff = (args.endIndex - args.startIndex) + 1;
                        if (diff > 0) {
                            index[1] -= diff;
                            updated = true;
                        }
                    }
                    else {
                        index[1] -= diff;
                        updated = true;
                    }
                }
                if (args.startIndex <= index[3]) {
                    if (args.endIndex <= index[3]) {
                        index[3] -= (args.endIndex - args.startIndex) + 1;
                    }
                    else {
                        index[3] -= (index[3] - args.startIndex) + 1;
                    }
                    updated = true;
                }
            }
        }
        return updated;
    };
    /** @hidden */
    Workbook.prototype.getCell = function (rowIndex, colIndex, row) {
        return null;
    };
    /**
     * Used in calculate to compute integer value of date
     */
    Workbook.prototype.dateToInt = function (date, isTime) {
        return dateToInt(date, isTime);
    };
    /**
     * Used to update format from calculate.
     */
    Workbook.prototype.setDateFormat = function (sheetId, rowIndex, colIndex) {
        var sheet = getSheet(this, getSheetIndexFromId(this, sheetId));
        if (!getCell(rowIndex, colIndex, sheet, null, true).format) {
            setCell(rowIndex, colIndex, sheet, { format: getFormatFromType('ShortDate') }, true);
        }
    };
    var Workbook_1;
    __decorate([
        Collection([], Sheet)
    ], Workbook.prototype, "sheets", void 0);
    __decorate([
        Property(0)
    ], Workbook.prototype, "activeSheetIndex", void 0);
    __decorate([
        Property('100%')
    ], Workbook.prototype, "height", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowFindAndReplace", void 0);
    __decorate([
        Property()
    ], Workbook.prototype, "filterCollection", void 0);
    __decorate([
        Property()
    ], Workbook.prototype, "sortCollection", void 0);
    __decorate([
        Property('100%')
    ], Workbook.prototype, "width", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "showRibbon", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "showFormulaBar", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "showSheetTabs", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowEditing", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowOpen", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowSave", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowSorting", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowFiltering", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowNumberFormatting", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowCellFormatting", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowHyperlink", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowInsert", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowDelete", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowMerge", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowDataValidation", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowImage", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowChart", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowAutoFill", void 0);
    __decorate([
        Complex({}, AutoFillSettings)
    ], Workbook.prototype, "autoFillSettings", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowConditionalFormat", void 0);
    __decorate([
        Complex({}, CellStyle)
    ], Workbook.prototype, "cellStyle", void 0);
    __decorate([
        Property('')
    ], Workbook.prototype, "openUrl", void 0);
    __decorate([
        Property('')
    ], Workbook.prototype, "saveUrl", void 0);
    __decorate([
        Property('')
    ], Workbook.prototype, "password", void 0);
    __decorate([
        Property(false)
    ], Workbook.prototype, "isProtected", void 0);
    __decorate([
        Collection([], DefineName)
    ], Workbook.prototype, "definedNames", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "beforeOpen", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "openFailure", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "beforeSave", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "saveComplete", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "beforeCellFormat", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "queryCellInfo", void 0);
    __decorate([
        Event()
    ], Workbook.prototype, "beforeCellUpdate", void 0);
    __decorate([
        Property(true)
    ], Workbook.prototype, "allowFreezePane", void 0);
    Workbook = Workbook_1 = __decorate([
        NotifyPropertyChanges
    ], Workbook);
    return Workbook;
}(Component));
export { Workbook };
