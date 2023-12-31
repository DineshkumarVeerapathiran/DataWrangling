import { extend, select } from '@syncfusion/ej2-base';
import { remove, isNullOrUndefined, updateBlazorTemplate } from '@syncfusion/ej2-base';
import { parentsUntil, isGroupAdaptive, refreshForeignData, getObject, gridActionHandler } from '../base/util';
import * as events from '../base/constant';
import { RowRenderer } from '../renderer/row-renderer';
import { DataUtil } from '@syncfusion/ej2-data';
import { addRemoveEventListener } from '../base/util';
import * as literals from '../base/string-literals';
/**
 * `NormalEdit` module is used to handle normal('inline, dialog, external') editing actions.
 *
 * @hidden
 */
var NormalEdit = /** @class */ (function () {
    function NormalEdit(parent, serviceLocator, renderer) {
        this.args = {};
        this.currentVirtualData = {};
        this.parent = parent;
        this.renderer = renderer;
        this.serviceLocator = serviceLocator;
        this.addEventListener();
    }
    NormalEdit.prototype.clickHandler = function (e) {
        var target = e.target;
        var gObj = this.parent;
        if ((((parentsUntil(target, literals.gridContent) &&
            parentsUntil(parentsUntil(target, literals.gridContent), 'e-grid').id === gObj.element.id)) || (gObj.frozenRows
            && parentsUntil(target, literals.headerContent))) && !parentsUntil(target, 'e-unboundcelldiv')) {
            this.rowIndex = parentsUntil(target, literals.rowCell)
                ? parseInt(target.parentElement.getAttribute(literals.dataRowIndex), 10) : -1;
            if (gObj.isEdit) {
                gObj.editModule.endEdit();
            }
        }
    };
    NormalEdit.prototype.dblClickHandler = function (e) {
        if (parentsUntil(e.target, literals.rowCell) && this.parent.editSettings.allowEditOnDblClick) {
            this.parent.editModule.startEdit(parentsUntil(e.target, literals.row));
        }
    };
    /**
     * The function used to trigger editComplete
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    NormalEdit.prototype.editComplete = function (e) {
        this.parent.isEdit = false;
        var action = 'action';
        switch (e.requestType) {
            case 'save':
                if (!(this.parent.isCheckBoxSelection || this.parent.selectionSettings.type === 'Multiple')
                    || (!this.parent.isPersistSelection)) {
                    if (e["" + action] !== 'edit') {
                        this.parent.selectRow(0);
                    }
                }
                this.parent.trigger(events.actionComplete, extend(e, {
                    requestType: 'save',
                    type: events.actionComplete
                }));
                break;
            case 'delete':
                this.parent.trigger(events.actionComplete, extend(e, {
                    requestType: 'delete',
                    type: events.actionComplete
                }));
                if (!this.parent.isCheckBoxSelection) {
                    this.parent.selectRow(this.editRowIndex);
                }
                break;
        }
    };
    NormalEdit.prototype.getEditArgs = function (editedData, rowObj, isScroll) {
        var primaryKeys = this.parent.getPrimaryKeyFieldNames();
        var primaryKeyValues = [];
        for (var i = 0; i < primaryKeys.length; i++) {
            primaryKeyValues.push(getObject(primaryKeys[parseInt(i.toString(), 10)], editedData));
        }
        var args = {
            primaryKey: primaryKeys, primaryKeyValue: primaryKeyValues, requestType: 'beginEdit',
            rowData: editedData, rowIndex: this.rowIndex, type: 'edit', cancel: false,
            foreignKeyData: rowObj && rowObj.foreignKeyData, target: undefined, isScroll: isScroll
        };
        return args;
    };
    NormalEdit.prototype.startEdit = function (tr) {
        var _this = this;
        var gObj = this.parent;
        this.rowIndex = this.editRowIndex = parseInt(tr.getAttribute(literals.dataRowIndex), 10);
        if (gObj.enableVirtualization || gObj.enableInfiniteScrolling) {
            var selector = '.e-row[data-rowindex="' + this.rowIndex + '"]';
            var virtualRow = this.parent.element.querySelector(selector);
            if (!virtualRow) {
                return;
            }
        }
        var e = { data: undefined, index: this.rowIndex, isScroll: false };
        this.parent.notify(events.virtualScrollEditActionBegin, e);
        if (isGroupAdaptive(gObj)) {
            var rObj = gObj.getRowObjectFromUID(tr.getAttribute('data-uid'));
            this.previousData = rObj.data;
        }
        else if (!this.previousData && (this.parent.enableVirtualization || this.parent.enableInfiniteScrolling)) {
            this.previousData = e.data;
        }
        else if (!this.parent.enableVirtualization) {
            this.previousData = extend({}, {}, gObj.getCurrentViewRecords()[this.rowIndex], true);
        }
        var editedData = extend({}, {}, e.data || this.previousData, true);
        this.uid = tr.getAttribute('data-uid');
        var rowObj = gObj.getRowObjectFromUID(this.uid);
        var args = this.getEditArgs(editedData, rowObj, e.isScroll);
        args.row = tr;
        if (!args.isScroll) {
            this.parent.notify(events.createVirtualValidationForm, { uid: this.uid, prevData: this.previousData, argsCreator: this.getEditArgs.bind(this), renderer: this.renderer });
            gObj.trigger(events.beginEdit, args, function (begineditargs) {
                begineditargs.type = 'actionBegin';
                gObj.trigger(events.actionBegin, begineditargs, function (editargs) {
                    if (!editargs.cancel) {
                        _this.inlineEditHandler(editargs, tr);
                    }
                });
            });
        }
        else {
            this.inlineEditHandler(args, tr);
        }
    };
    NormalEdit.prototype.inlineEditHandler = function (editargs, tr) {
        var gObj = this.parent;
        gObj.isEdit = true;
        editargs.row = editargs.row ? editargs.row : tr;
        if (gObj.editSettings.mode !== 'Dialog') {
            gObj.clearSelection();
        }
        if (gObj.editSettings.mode === 'Dialog' && gObj.selectionModule) {
            gObj.selectionModule.preventFocus = true;
            editargs.row.classList.add('e-dlgeditrow');
        }
        this.renderer.update(editargs);
        this.uid = tr.getAttribute('data-uid');
        gObj.editModule.applyFormValidation();
        editargs.type = 'actionComplete';
        gObj.trigger(events.actionComplete, editargs);
        if (gObj.editSettings.template) {
            gObj.editModule.applyFormValidation(undefined, editargs.form.ej2_instances[0].rules);
        }
        this.args = editargs;
        if (this.parent.allowTextWrap) {
            this.parent.notify(events.freezeRender, { case: 'textwrap' });
        }
    };
    NormalEdit.prototype.updateRow = function (index, data) {
        var _this = this;
        var gObj = this.parent;
        this.editRowIndex = index;
        var args = {
            requestType: 'save', action: 'edit', type: events.actionBegin, data: data, cancel: false,
            previousData: gObj.getCurrentViewRecords()[parseInt(index.toString(), 10)],
            row: gObj.getRowByIndex(index)
        };
        gObj.showSpinner();
        if (gObj.enableInfiniteScrolling) {
            this.uid = args.row.getAttribute('data-uid');
            var index_1 = parseInt(args.row.getAttribute('data-rowindex'), 10);
            this.parent.notify(events.refreshInfiniteEditrowindex, { index: index_1 });
        }
        gObj.notify(events.updateData, args);
        if (args.promise) {
            args.promise.then(function () { return gObj.refresh(); }).catch(function (e) { return _this.edFail(e); });
        }
        else {
            if (!gObj.enableInfiniteScrolling) {
                gObj.refresh();
            }
        }
    };
    NormalEdit.prototype.editFormValidate = function () {
        var gObj = this.parent;
        var isValid = gObj.editModule.editFormValidate();
        var validationArgs = {
            prevData: this.previousData, isValid: true, editIdx: this.editRowIndex, addIdx: this.addedRowIndex
        };
        gObj.notify(events.validateVirtualForm, validationArgs);
        return (isValid && validationArgs.isValid);
    };
    NormalEdit.prototype.endEdit = function () {
        var _this = this;
        var gObj = this.parent;
        if (!this.parent.isEdit || !this.editFormValidate()) {
            return;
        }
        var editedData = extend({}, {}, this.previousData, true);
        var args = extend(this.args, {
            requestType: 'save', type: events.actionBegin, data: editedData, cancel: false,
            previousData: this.previousData, selectedRow: gObj.selectedRowIndex, foreignKeyData: {}
        });
        var index = gObj.getFrozenMode() === 'Right' ? 1 : 0;
        var isDlg = gObj.editSettings.mode === 'Dialog';
        var dlgWrapper = select('#' + gObj.element.id + '_dialogEdit_wrapper', document);
        var dlgForm = isDlg ? dlgWrapper.querySelector('.e-gridform') : gObj.element.getElementsByClassName('e-gridform')[parseInt(index.toString(), 10)];
        var data = {
            virtualData: extend({}, {}, this.previousData, true), isAdd: false, isScroll: false, endEdit: true
        };
        this.parent.notify(events.getVirtualData, data);
        if ((this.parent.enableVirtualization || this.parent.enableInfiniteScrolling)
            && this.parent.editSettings.mode === 'Normal' && Object.keys(data.virtualData).length) {
            if (this.parent.isEdit) {
                this.currentVirtualData = editedData = args.data = data.virtualData;
            }
        }
        else {
            editedData = gObj.editModule.getCurrentEditedData(dlgForm, editedData);
        }
        if (gObj.isFrozenGrid() && gObj.editSettings.mode === 'Normal') {
            var mhdrFrm = gObj.getMovableVirtualHeader().querySelector('.e-gridform');
            var mCntFrm = gObj.getMovableVirtualContent().querySelector('.e-gridform');
            var mvblEle = [mhdrFrm || mCntFrm];
            var frHdrFrm = void 0;
            var frCntFrm = void 0;
            var frEle = [];
            if (gObj.getFrozenMode() === literals.leftRight) {
                frHdrFrm = gObj.getFrozenRightHeader().querySelector('.e-gridform');
                frCntFrm = gObj.getFrozenRightContent().querySelector('.e-gridform');
                frEle = [frHdrFrm || frCntFrm];
            }
            gridActionHandler(this.parent, function (tableName, elements) {
                for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                    var ele = elements_1[_i];
                    if (ele) {
                        editedData = gObj.editModule.getCurrentEditedData(ele, editedData);
                    }
                }
            }, [[], mvblEle, frEle]);
        }
        var eleLength = [].slice.call(gObj.element.getElementsByClassName(literals.editedRow)).length;
        if (!data.isAdd && Object.keys(this.currentVirtualData).length && !eleLength) {
            eleLength = 1;
        }
        if (isDlg ? dlgWrapper.getElementsByClassName(literals.editedRow).length : eleLength) {
            args.action = 'edit';
            gObj.trigger(events.actionBegin, args, function (endEditArgs) {
                if (endEditArgs.cancel) {
                    return;
                }
                if (_this.parent.loadingIndicator.indicatorType === 'Spinner') {
                    gObj.showSpinner();
                }
                if (_this.parent.loadingIndicator.indicatorType === 'Shimmer') {
                    _this.parent.showMaskRow();
                }
                gObj.notify(events.updateData, endEditArgs);
            });
        }
        else {
            args.action = 'add';
            args.selectedRow = 0;
            args.index = this.addedRowIndex;
            gObj.notify(events.virtualScrollEditSuccess, {});
            gObj.notify(events.modelChanged, args);
            this.addedRowIndex = null;
            if (args.cancel) {
                return;
            }
        }
        gObj.editModule.resetMovableContentValidation();
    };
    NormalEdit.prototype.destroyElements = function () {
        var gObj = this.parent;
        gObj.editModule.destroyWidgets();
        gObj.editModule.destroyForm();
        this.parent.notify(events.dialogDestroy, {});
    };
    NormalEdit.prototype.editHandler = function (args) {
        var _this = this;
        if (args.promise) {
            args.promise.then(function (e) { return _this.edSucc(e, args); }).catch(function (e) { return _this.edFail(e); });
        }
        else {
            this.editSuccess(args.data, args);
        }
    };
    NormalEdit.prototype.edSucc = function (e, args) {
        this.editSuccess(e, args);
    };
    NormalEdit.prototype.edFail = function (e) {
        this.editFailure(e);
    };
    NormalEdit.prototype.updateCurrentViewData = function (data) {
        if (!this.parent.enableVirtualization && !this.parent.enableInfiniteScrolling) {
            this.parent.getCurrentViewRecords()[this.editRowIndex] = data;
        }
    };
    NormalEdit.prototype.requestSuccess = function (args) {
        if (this.parent.editModule.formObj && !this.parent.editModule.formObj.isDestroyed) {
            this.destroyElements();
            this.stopEditStatus();
            if (this.parent.editSettings.mode === 'Dialog' && args.action !== 'add' &&
                this.parent.selectionModule) {
                this.parent.element.querySelector('.e-dlgeditrow').classList.remove('e-dlgeditrow');
            }
        }
    };
    NormalEdit.prototype.editSuccess = function (e, args) {
        var _this = this;
        if (!isNullOrUndefined(e) && !(e instanceof Array)) {
            var rowData = 'rowData';
            args.data = extend({}, extend({}, args["" + rowData], args.data), e);
        }
        this.requestSuccess(args);
        this.parent.trigger(events.beforeDataBound, args);
        args.type = events.actionComplete;
        this.parent.isEdit = false;
        this.refreshRow(args.data);
        this.parent.notify(events.virtualScrollEditSuccess, args);
        this.parent.editModule.checkLastRow(args.row);
        this.parent.editModule.isLastRow = false;
        this.updateCurrentViewData(args.data);
        this.blazorTemplate();
        this.editRowIndex = null;
        if (this.parent.allowGrouping && this.parent.groupSettings.columns.length) {
            var dragRow = args.row;
            var rows = this.parent.getRowsObject();
            var dragRowUid = dragRow.getAttribute('data-uid');
            var dragRowObject_1 = this.parent.getRowObjectFromUID(dragRowUid);
            var _loop_1 = function (i) {
                rows = rows.filter(function (data) {
                    return data.isDataRow && data.data[_this.parent.groupSettings.columns[parseInt(i.toString(), 10)]] ===
                        args.data[_this.parent.groupSettings.columns[parseInt(i.toString(), 10)]] && data !== dragRowObject_1;
                });
            };
            for (var i = 0; i < this.parent.groupSettings.columns.length; i++) {
                _loop_1(i);
            }
            var dropRowObject = rows[0];
            if (!isNullOrUndefined(dragRowObject_1) && !isNullOrUndefined(dropRowObject) &&
                dragRowObject_1.parentUid !== dropRowObject.parentUid) {
                this.parent['groupModule'].groupedRowReorder(dragRowObject_1, dropRowObject);
            }
            else if (this.parent.aggregates.length) {
                this.parent.aggregateModule.refresh(args.data, this.parent.groupSettings.enableLazyLoading ? args.row : undefined);
            }
        }
        else if (this.parent.aggregates.length) {
            this.parent.aggregateModule.refresh(args.data, this.parent.groupSettings.enableLazyLoading ? args.row : undefined);
        }
        this.parent.trigger(events.actionComplete, args);
        if (!(this.parent.isCheckBoxSelection || this.parent.selectionSettings.type === 'Multiple')
            || (!this.parent.isPersistSelection) && !this.parent.selectionSettings.checkboxOnly) {
            if (this.parent.editSettings.mode !== 'Dialog') {
                this.parent.selectRow(this.rowIndex > -1 ? this.rowIndex : this.editRowIndex);
            }
        }
        if (this.parent.aggregates.length && this.parent.groupSettings.enableLazyLoading && this.parent.groupSettings.columns.length
            && (this.parent.groupModule.getGroupAggregateTemplates(true).length
                || this.parent.groupModule.getGroupAggregateTemplates(false).length)) {
            return;
        }
        this.parent.removeMaskRow();
        this.parent.hideSpinner();
    };
    NormalEdit.prototype.closeForm = function () {
        if (!this.cloneRow && this.parent.isEdit) {
            this.stopEditStatus();
        }
        if (this.cloneRow) {
            this.cloneRow.remove();
            this.cloneRow = null;
            this.originalRow.classList.remove('e-hiddenrow');
        }
        if (this.parent.isFrozenGrid() && this.cloneFrozen) {
            this.cloneFrozen.remove();
            this.frozen.classList.remove('e-hiddenrow');
        }
    };
    NormalEdit.prototype.blazorTemplate = function () {
        var cols = this.parent.getColumns();
        if (this.parent.editSettings.template && this.parent.editSettings.mode === 'Normal') {
            updateBlazorTemplate(this.parent.element.id + 'editSettingsTemplate', 'Template', this.parent.editSettings);
        }
        for (var i = 0; i < cols.length; i++) {
            var col = cols[parseInt(i.toString(), 10)];
            if (col.template) {
                updateBlazorTemplate(this.parent.element.id + col.uid, 'Template', col, false);
            }
            if (col.editTemplate) {
                updateBlazorTemplate(this.parent.element.id + col.uid + 'editTemplate', 'EditTemplate', col);
            }
        }
    };
    NormalEdit.prototype.editFailure = function (e) {
        this.parent.removeMaskRow();
        this.parent.trigger(events.actionFailure, ({ error: e }));
        this.parent.hideSpinner();
        this.parent.log('actionfailure', { error: e });
    };
    NormalEdit.prototype.needRefresh = function () {
        var refresh = true;
        var editedRow = this.parent.element.querySelector('.e-gridform');
        if ((this.parent.enableVirtualization || this.parent.infiniteScrollSettings.enableCache)
            && this.parent.editSettings.mode === 'Normal' && !editedRow) {
            refresh = false;
        }
        return refresh;
    };
    NormalEdit.prototype.refreshRow = function (data) {
        var frzCols = this.parent.isFrozenGrid();
        var row = new RowRenderer(this.serviceLocator, null, this.parent);
        var rowObj = this.parent.getRowObjectFromUID(this.uid);
        if (rowObj) {
            rowObj.changes = data;
            this.parent.notify(events.refreshVirtualCache, { data: data });
            refreshForeignData(rowObj, this.parent.getForeignKeyColumns(), rowObj.changes);
            if (this.needRefresh()) {
                row.refresh(rowObj, this.parent.getColumns(), true);
            }
            var tr = [].slice.call(this.parent.element.querySelectorAll('[data-rowindex="' + rowObj.index + '"]'));
            if (frzCols && tr.length) {
                for (var i = 0; i < tr.length; i++) {
                    var rowUid = tr[parseInt(i.toString(), 10)].getAttribute('data-uid');
                    if (rowUid !== this.uid) {
                        rowObj = this.parent.getRowObjectFromUID(rowUid);
                        rowObj.changes = data;
                        refreshForeignData(rowObj, this.parent.getForeignKeyColumns(), rowObj.changes);
                        row.refresh(rowObj, this.parent.getColumns(), true);
                        this.parent.editModule.checkLastRow(tr[parseInt(i.toString(), 10)]);
                    }
                }
            }
        }
    };
    NormalEdit.prototype.closeEdit = function () {
        var _this = this;
        if (!this.parent.isEdit) {
            return;
        }
        var gObj = this.parent;
        var args = extend(this.args, {
            requestType: 'cancel', type: events.actionBegin, cancel: false, data: this.previousData, selectedRow: gObj.selectedRowIndex
        });
        gObj.notify(events.virtualScrollEditCancel, args);
        this.blazorTemplate();
        gObj.trigger(events.actionBegin, args, function (closeEditArgs) {
            if (closeEditArgs.cancel) {
                return;
            }
            if (_this.parent.editSettings.mode === 'Dialog') {
                _this.parent.notify(events.dialogDestroy, {});
            }
            gObj.isEdit = false;
            _this.stopEditStatus();
            closeEditArgs.type = events.actionComplete;
            if (gObj.editSettings.mode !== 'Dialog') {
                _this.refreshRow(closeEditArgs.data);
            }
            var isLazyLoad = gObj.groupSettings.enableLazyLoading && gObj.groupSettings.columns.length
                && !gObj.getContentTable().querySelector('tr.e-emptyrow');
            if (!gObj.getContentTable().querySelector('tr.e-emptyrow') &&
                !gObj.getContentTable().querySelector('tr.e-row') && !isLazyLoad) {
                gObj.renderModule.emptyRow();
            }
            if (gObj.editSettings.mode !== 'Dialog') {
                gObj.selectRow(_this.rowIndex);
            }
            gObj.editModule.resetMovableContentValidation();
            gObj.trigger(events.actionComplete, closeEditArgs);
        });
    };
    NormalEdit.prototype.addRecord = function (data, index) {
        var _this = this;
        var gObj = this.parent;
        this.addedRowIndex = index = !isNullOrUndefined(index) ? index : 0;
        if (data) {
            gObj.notify(events.modelChanged, {
                requestType: 'save', type: events.actionBegin, data: data, selectedRow: 0, action: 'add', index: index
            });
            return;
        }
        if (gObj.isEdit) {
            return;
        }
        this.previousData = {};
        this.uid = '';
        var cols = gObj.getColumns();
        var rowData = { virtualData: {}, isScroll: false };
        this.parent.notify(events.getVirtualData, rowData);
        for (var i = 0; i < cols.length; i++) {
            if (rowData.isScroll && cols[parseInt(i.toString(), 10)].getFreezeTableName() !== 'movable') {
                continue;
            }
            if (cols[parseInt(i.toString(), 10)].field) {
                if (cols[parseInt(i.toString(), 10)].type === 'string') {
                    cols[parseInt(i.toString(), 10)].defaultValue = this.parent.sanitize(cols[parseInt(i.toString(), 10)].defaultValue);
                }
                DataUtil.setValue(cols[parseInt(i.toString(), 10)].field, cols[parseInt(i.toString(), 10)].defaultValue, this.previousData);
            }
        }
        var args = {
            cancel: false, foreignKeyData: {},
            requestType: 'add', data: this.previousData, type: events.actionBegin, index: index,
            rowData: this.previousData, target: undefined, isScroll: rowData.isScroll
        };
        if ((this.parent.enableVirtualization || this.parent.infiniteScrollSettings.enableCache)
            && Object.keys(rowData.virtualData).length) {
            args.data = args.rowData = rowData.virtualData;
        }
        if (!args.isScroll) {
            this.parent.notify(events.createVirtualValidationForm, { uid: this.uid, prevData: this.previousData, argsCreator: this.getEditArgs.bind(this), renderer: this.renderer });
            gObj.trigger(events.actionBegin, args, function (addArgs) {
                if (addArgs.cancel) {
                    return;
                }
                _this.inlineAddHandler(addArgs);
            });
        }
        else {
            this.inlineAddHandler(args);
        }
    };
    NormalEdit.prototype.inlineAddHandler = function (addArgs) {
        var gObj = this.parent;
        gObj.isEdit = true;
        if (gObj.editSettings.mode !== 'Dialog') {
            gObj.clearSelection();
        }
        this.renderer.addNew(addArgs);
        gObj.editModule.applyFormValidation();
        addArgs.type = events.actionComplete;
        addArgs.row = gObj.element.querySelector('.' + literals.addedRow);
        gObj.trigger(events.actionComplete, addArgs);
        if (gObj.editSettings.template) {
            gObj.editModule.applyFormValidation(undefined, addArgs.form.ej2_instances[0].rules);
        }
        this.args = addArgs;
    };
    NormalEdit.prototype.deleteRecord = function (fieldname, data) {
        this.editRowIndex = this.parent.selectedRowIndex;
        if (data) {
            data = (data instanceof Array) ? data : [data];
            var gObj = this.parent;
            var dataLen = Object.keys(data).length;
            fieldname = fieldname || this.parent.getPrimaryKeyFieldNames()[0];
            var _loop_2 = function (i) {
                var _a;
                var tmpRecord;
                var contained = gObj.currentViewData.some(function (record) {
                    tmpRecord = record;
                    return data[parseInt(i.toString(), 10)] === getObject(fieldname, record) || data[parseInt(i.toString(), 10)] === record;
                });
                data[parseInt(i.toString(), 10)] = contained ? tmpRecord : data[parseInt(i.toString(), 10)]["" + fieldname] ?
                    data[parseInt(i.toString(), 10)] : (_a = {}, _a[fieldname] = data[parseInt(i.toString(), 10)], _a);
            };
            for (var i = 0; i < dataLen; i++) {
                _loop_2(i);
            }
        }
        var args = {
            requestType: 'delete', type: events.actionBegin, foreignKeyData: {},
            data: data ? data : this.parent.getSelectedRecords(), tr: this.parent.getSelectedRows(), cancel: false
        };
        if (!isNullOrUndefined(this.parent.commandDelIndex)) {
            args.data[0] =
                this.parent.getRowObjectFromUID(this.parent.getRowByIndex(this.parent.commandDelIndex).getAttribute('data-uid')).data;
        }
        if (this.parent.enableVirtualization && args.data.length > 1) {
            var uid = this.parent.getSelectedRows()[0].getAttribute('data-uid');
            args.data = [this.parent.getRowObjectFromUID(uid).data];
        }
        this.parent.notify(events.modelChanged, args);
    };
    NormalEdit.prototype.stopEditStatus = function () {
        var gObj = this.parent;
        var addElements = [].slice.call(gObj.element.getElementsByClassName(literals.addedRow));
        var editElements = [].slice.call(gObj.element.getElementsByClassName(literals.editedRow));
        for (var i = 0; i < addElements.length; i++) {
            remove(addElements[parseInt(i.toString(), 10)]);
        }
        for (var i = 0; i < editElements.length; i++) {
            editElements[parseInt(i.toString(), 10)].classList.remove(literals.editedRow);
        }
    };
    /**
     * @returns {void}
     * @hidden
     */
    NormalEdit.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.evtHandlers = [{ event: events.crudAction, handler: this.editHandler },
            { event: events.doubleTap, handler: this.dblClickHandler },
            { event: events.click, handler: this.clickHandler },
            { event: events.recordAdded, handler: this.requestSuccess },
            { event: events.dblclick, handler: this.dblClickHandler },
            { event: events.deleteComplete, handler: this.editComplete },
            { event: events.saveComplete, handler: this.editComplete },
            { event: events.rowModeChange, handler: this.closeEdit },
            { event: events.closeInline, handler: this.closeForm }];
        addRemoveEventListener(this.parent, this.evtHandlers, true, this);
    };
    /**
     * @returns {void}
     * @hidden
     */
    NormalEdit.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        addRemoveEventListener(this.parent, this.evtHandlers, false);
    };
    /**
     * @returns {void}
     * @hidden
     */
    NormalEdit.prototype.destroy = function () {
        this.removeEventListener();
        this.renderer.destroy();
    };
    return NormalEdit;
}());
export { NormalEdit };
