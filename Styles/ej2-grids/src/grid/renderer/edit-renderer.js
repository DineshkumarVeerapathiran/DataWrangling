import { isNullOrUndefined, closest, extend } from '@syncfusion/ej2-base';
import { InlineEditRender } from './inline-edit-renderer';
import { BatchEditRender } from './batch-edit-renderer';
import { DialogEditRender } from './dialog-edit-renderer';
import { attributes, classList, select } from '@syncfusion/ej2-base';
import { CellType } from '../base/enum';
import { RowModelGenerator } from '../services/row-model-generator';
import { getComplexFieldID, getObject, appendChildren, parentsUntil, extendObjWithFn, padZero } from '../base/util';
import * as events from '../base/constant';
import * as literals from '../base/string-literals';
/**
 * Edit render module is used to render grid edit row.
 *
 * @hidden
 */
var EditRender = /** @class */ (function () {
    /**
     * Constructor for render module
     *
     * @param {IGrid} parent -specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the serviceLocator
     */
    function EditRender(parent, serviceLocator) {
        //Internal variables
        this.editType = {
            'Inline': InlineEditRender,
            'Normal': InlineEditRender, 'Batch': BatchEditRender, 'Dialog': DialogEditRender
        };
        this.parent = parent;
        this.serviceLocator = serviceLocator;
        this.renderer = new this.editType[this.parent.editSettings.mode](parent, serviceLocator);
        this.focus = serviceLocator.getService('focus');
    }
    EditRender.prototype.addNew = function (args) {
        this.renderer.addNew(this.getEditElements(args), args);
        this.convertWidget(args);
    };
    EditRender.prototype.update = function (args) {
        this.renderer.update(this.getEditElements(args), args);
        var isCustomFormValidation = args.isCustomFormValidation;
        if (!isCustomFormValidation) {
            this.parent.notify(events.beforeStartEdit, args);
            this.convertWidget(args);
        }
    };
    EditRender.prototype.convertWidget = function (args) {
        var gObj = this.parent;
        var isFocused;
        var cell;
        var value;
        var fForm;
        var frForm;
        var frzCols = gObj.isFrozenGrid();
        var index = gObj.getFrozenMode() === 'Right' && gObj.editSettings.mode === 'Normal' ? 1 : 0;
        var form = gObj.editSettings.mode === 'Dialog' ?
            select('#' + gObj.element.id + '_dialogEdit_wrapper .e-gridform', document) :
            gObj.element.getElementsByClassName('e-gridform')[parseInt(index.toString(), 10)];
        var isVirtualFrozen = frzCols && this.parent.enableColumnVirtualization && args.isScroll;
        if (frzCols && gObj.editSettings.mode === 'Normal') {
            var rowIndex = parseInt(args.row.getAttribute(literals.dataRowIndex), 10);
            if (gObj.frozenRows && ((args.requestType === 'add' && gObj.editSettings.newRowPosition === 'Top')
                || rowIndex < gObj.frozenRows)) {
                fForm = gObj.element.querySelector('.' + literals.movableHeader).querySelector('.e-gridform');
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    frForm = args.frozenRightForm;
                }
            }
            else {
                fForm = gObj.element.querySelector('.' + literals.movableContent).querySelector('.e-gridform');
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    frForm = args.frozenRightForm;
                }
            }
        }
        var cols = gObj.editSettings.mode !== 'Batch' ? gObj.getColumns() : [gObj.getColumnByField(args.columnName)];
        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
            var col = cols_1[_i];
            if (isVirtualFrozen && col.getFreezeTableName() !== 'movable') {
                continue;
            }
            if (this.parent.editSettings.template && !isNullOrUndefined(col.field)) {
                var cellArgs = extend({}, args);
                cellArgs.element = form.querySelector('[name=' + getComplexFieldID(col.field) + ']');
                if (isNullOrUndefined(cellArgs.element) && frzCols) {
                    cellArgs.element = fForm.querySelector('[name=' + getComplexFieldID(col.field) + ']');
                }
                if (typeof col.edit.write === 'string') {
                    getObject(col.edit.write, window)(cellArgs);
                }
                else {
                    col.edit.write(cellArgs);
                }
                continue;
            }
            if (this.parent.editModule.checkColumnIsGrouped(col) || col.commands) {
                continue;
            }
            // eslint-disable-next-line
            value = (col.valueAccessor(col.field, args.rowData, col));
            if (fForm && col.getFreezeTableName() === 'movable' && gObj.editSettings.mode === 'Normal') {
                cell = fForm.querySelector('[e-mappinguid=' + col.uid + ']');
            }
            else if (frForm && col.getFreezeTableName() === literals.frozenRight && gObj.editSettings.mode === 'Normal') {
                cell = frForm.querySelector('[e-mappinguid=' + col.uid + ']');
            }
            else {
                cell = form.querySelector('[e-mappinguid=' + col.uid + ']');
            }
            var temp = col.edit.write;
            if (!isNullOrUndefined(cell)) {
                if (typeof temp === 'string') {
                    temp = getObject(temp, window);
                    temp({
                        rowData: args.rowData, element: cell, column: col, requestType: args.requestType, row: args.row,
                        foreignKeyData: col.isForeignColumn() && getObject(col.field, args.foreignKeyData)
                    });
                }
                else {
                    col.edit.write({
                        rowData: args.rowData, element: cell, column: col, requestType: args.requestType, row: args.row,
                        foreignKeyData: col.isForeignColumn() && getObject(col.field, args.foreignKeyData)
                    });
                }
                if (!isFocused && !cell.getAttribute('disabled') && !parentsUntil(cell, 'e-checkbox-disabled')) {
                    this.focusElement(cell, args.type);
                    isFocused = true;
                }
            }
        }
        if (frzCols && !this.parent.allowTextWrap && ((args.requestType === 'add') || args.requestType === 'beginEdit')
            && this.parent.editSettings.mode !== 'Dialog' && !isNullOrUndefined(form) && !isNullOrUndefined(fForm)) {
            var mTdElement = (fForm.querySelector('tr').children[0]);
            var fTdElement = (form.querySelector('tr').children[0]);
            if (fTdElement.offsetHeight > mTdElement.offsetHeight) {
                mTdElement.style.height = fTdElement.offsetHeight + 'px';
                if (frForm) {
                    var frTdElement = fForm.querySelector('tr').children[0];
                    frTdElement.style.height = fTdElement.offsetHeight + 'px';
                }
            }
            else {
                fTdElement.style.height = mTdElement.offsetHeight + 'px';
                if (frForm) {
                    var frTdElement = fForm.querySelector('tr').children[0];
                    frTdElement.style.height = mTdElement.offsetHeight + 'px';
                }
            }
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EditRender.prototype.focusElement = function (elem, type) {
        var chkBox = this.parent.element.querySelector('.e-edit-checkselect');
        if (!isNullOrUndefined(chkBox) && chkBox.nextElementSibling) {
            chkBox.nextElementSibling.classList.add('e-focus');
        }
        if (this.parent.editSettings.mode === 'Batch') {
            this.focus.onClick({ target: closest(elem, 'td') }, true);
        }
        else {
            var isFocus = this.parent.enableVirtualization && this.parent.editSettings.mode === 'Normal' ? false : true;
            if (isFocus || (this.parent.enableVirtualization && this.parent.editSettings.newRowPosition === 'Bottom'
                && parentsUntil(elem, literals.addedRow))) {
                elem.focus();
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                elem.focus({ preventScroll: true });
            }
        }
        if (elem.classList.contains('e-defaultcell')) {
            elem.setSelectionRange(elem.value.length, elem.value.length);
        }
    };
    EditRender.prototype.getEditElements = function (args) {
        var gObj = this.parent;
        var elements = {};
        var cols = gObj.editSettings.mode !== 'Batch' ? gObj.getColumns() : [gObj.getColumnByField(args.columnName)];
        if (args.isCustomFormValidation) {
            cols = this.parent.columnModel;
        }
        if (this.parent.editSettings.template) {
            return {};
        }
        var isVirtualFrozen = gObj.isFrozenGrid() && gObj.enableColumnVirtualization && args.isScroll;
        for (var i = 0, len = cols.length; i < len; i++) {
            var col = cols[parseInt(i.toString(), 10)];
            if (this.parent.editModule.checkColumnIsGrouped(col) || (isVirtualFrozen && cols[parseInt(i.toString(), 10)].getFreezeTableName() !== 'movable')
                || (args.isCustomFormValidation && (col.commands || col.commandsTemplate || !col.field))) {
                continue;
            }
            if (col.commands || col.commandsTemplate) {
                var cellRendererFact = this.serviceLocator.getService('cellRendererFactory');
                var model = new RowModelGenerator(this.parent);
                var cellRenderer = cellRendererFact.getCellRenderer(CellType.CommandColumn);
                var cells = model.generateRows(args.rowData)[0].cells;
                var cell = cells.filter(function (cell) { return cell.rowID; });
                var td = cellRenderer.render(cell[parseInt(i.toString(), 10)], args.rowData, { 'index': args.row ? args.row.getAttribute(literals.dataRowIndex) : 0 }, this.parent.enableVirtualization);
                var div = td.firstElementChild;
                div.setAttribute('textAlign', td.getAttribute('textAlign'));
                elements[col.uid] = div;
                continue;
            }
            if (col.type === 'dateonly' && args.rowData[col.field] instanceof Date) {
                var cellValue = args.rowData[col.field];
                args.rowData[col.field] = cellValue.getFullYear() + '-' + padZero(cellValue.getMonth() + 1) + '-' + padZero(cellValue.getDate());
            }
            var value = (col.valueAccessor(col.field, args.rowData, col));
            var tArgs = { column: col, value: value, type: args.requestType, data: args.rowData };
            var temp = col.edit.create;
            var input = void 0;
            if (col.editTemplate) {
                input = this.parent.createElement('span', { attrs: { 'e-mappinguid': col.uid } });
                var tempID = this.parent.element.id + col.uid + 'editTemplate';
                var tempData = extendObjWithFn({}, args.rowData, { column: col });
                var isReactCompiler = this.parent.isReact && typeof (col.editTemplate) !== 'string';
                var isReactChild = this.parent.parentDetails && this.parent.parentDetails.parentInstObj &&
                    this.parent.parentDetails.parentInstObj.isReact;
                if (isReactCompiler || isReactChild) {
                    col.getEditTemplate()(extend({ 'index': args.rowIndex }, tempData), this.parent, 'editTemplate', tempID, null, null, input);
                    this.parent.renderTemplates();
                }
                else {
                    var template = col.getEditTemplate()(extend({ 'index': args.rowIndex }, tempData), this.parent, 'editTemplate', tempID);
                    appendChildren(input, template);
                }
            }
            else {
                if (typeof temp === 'string') {
                    temp = getObject(temp, window);
                    input = temp(tArgs);
                }
                else {
                    input = col.edit.create(tArgs);
                }
                if (typeof input === 'string') {
                    var div = this.parent.createElement('div');
                    div.innerHTML = input;
                    input = div.firstChild;
                }
                var isInput = input.tagName !== 'input' && input.querySelectorAll('input').length;
                var complexFieldName = getComplexFieldID(col.field);
                attributes(isInput ? input.querySelector('input') : input, {
                    name: complexFieldName, 'e-mappinguid': col.uid,
                    id: gObj.element.id + complexFieldName
                });
                classList(input, ['e-input', 'e-field'], []);
                if (col.textAlign === 'Right') {
                    input.classList.add('e-ralign');
                }
                if ((col.isPrimaryKey || col.isIdentity) && args.requestType === 'beginEdit' ||
                    (col.isIdentity && args.requestType === 'add')) { // already disabled in cell plugins
                    input.setAttribute('disabled', '');
                }
            }
            elements[col.uid] = input;
        }
        return elements;
    };
    EditRender.prototype.destroy = function () {
        this.renderer.removeEventListener();
    };
    return EditRender;
}());
export { EditRender };
