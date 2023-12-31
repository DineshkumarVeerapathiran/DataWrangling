import { Animation, Browser, ChildProperty, Complex, Component, Event, EventHandler, KeyboardEvents, L10n, NotifyPropertyChanges, Property, SanitizeHtmlHelper, addClass, append, attributes, classList, closest, compile, createElement, detach, extend, formatUnit, getComponent, getUniqueID, getValue, isNullOrUndefined, isUndefined, matches, prepend, remove, removeClass, rippleEffect, select, selectAll, setStyleAttribute, setValue } from '@syncfusion/ej2-base';
import { DataManager, DataUtil, JsonAdaptor, Predicate, Query } from '@syncfusion/ej2-data';
import { ListBase, Sortable, cssClass, moveTo } from '@syncfusion/ej2-lists';
import { Popup, createSpinner, getZindexPartial, hideSpinner, isCollide, showSpinner } from '@syncfusion/ej2-popups';
import { Input, TextBox } from '@syncfusion/ej2-inputs';
import { Button, createCheckBox } from '@syncfusion/ej2-buttons';
import { TreeView } from '@syncfusion/ej2-navigations';

/**
 * IncrementalSearch module file
 */
let queryString = '';
let prevString = '';
let matches$1 = [];
const activeClass = 'e-active';
let prevElementId = '';
/**
 * Search and focus the list item based on key code matches with list text content
 *
 * @param  { number } keyCode - Specifies the key code which pressed on keyboard events.
 * @param  { HTMLElement[]} items - Specifies an array of HTMLElement, from which matches find has done.
 * @param { number } selectedIndex - Specifies the selected item in list item, so that search will happen
 * after selected item otherwise it will do from initial.
 * @param  { boolean } ignoreCase - Specifies the case consideration when search has done.
 * @param {string} elementId - Specifies the list element ID.
 * @returns {Element} Returns list item based on key code matches with list text content.
 */
function incrementalSearch(keyCode, items, selectedIndex, ignoreCase, elementId) {
    queryString += String.fromCharCode(keyCode);
    setTimeout(() => {
        queryString = '';
    }, 1000);
    let index;
    queryString = ignoreCase ? queryString.toLowerCase() : queryString;
    if (prevElementId === elementId && prevString === queryString) {
        for (let i = 0; i < matches$1.length; i++) {
            if (matches$1[i].classList.contains(activeClass)) {
                index = i;
                break;
            }
        }
        index = index + 1;
        return matches$1[index] ? matches$1[index] : matches$1[0];
    }
    else {
        const listItems = items;
        const strLength = queryString.length;
        let text;
        let item;
        selectedIndex = selectedIndex ? selectedIndex + 1 : 0;
        let i = selectedIndex;
        matches$1 = [];
        do {
            if (i === listItems.length) {
                i = -1;
            }
            if (i === -1) {
                index = 0;
            }
            else {
                index = i;
            }
            item = listItems[index];
            text = ignoreCase ? item.innerText.toLowerCase() : item.innerText;
            if (text.substr(0, strLength) === queryString) {
                matches$1.push(listItems[index]);
            }
            i++;
        } while (i !== selectedIndex);
        prevString = queryString;
        prevElementId = elementId;
        return matches$1[0];
    }
}
/**
 * Search the list item based on given input value matches with search type.
 *
 * @param {string} inputVal - Specifies the given input value.
 * @param {HTMLElement[]} items - Specifies the list items.
 * @param {SearchType} searchType - Specifies the filter type.
 * @param {boolean} ignoreCase - Specifies the case sensitive option for search operation.
 * @returns {Element | number} Returns the search matched items.
 */
function Search(inputVal, items, searchType, ignoreCase, dataSource, fields, type) {
    const listItems = items;
    ignoreCase = ignoreCase !== undefined && ignoreCase !== null ? ignoreCase : true;
    const itemData = { item: null, index: null };
    if (inputVal && inputVal.length) {
        const strLength = inputVal.length;
        let queryStr = ignoreCase ? inputVal.toLocaleLowerCase() : inputVal;
        queryStr = escapeCharRegExp(queryStr);
        for (let i = 0, itemsData = listItems; i < itemsData.length; i++) {
            const item = itemsData[i];
            let text;
            let filterValue;
            if (items && dataSource) {
                let checkField = item;
                let fieldValue = fields.text.split('.');
                dataSource.filter(function (data) {
                    Array.prototype.slice.call(fieldValue).forEach(function (value) {
                        /* eslint-disable security/detect-object-injection */
                        if (type === 'object' && (!data.isHeader && checkField.textContent.toString().indexOf(data[value]) !== -1) && checkField.getAttribute('data-value') === data[fields.value].toString() || type === 'string' && checkField.textContent.toString().indexOf(data) !== -1) {
                            filterValue = type === 'object' ? data[value] : data;
                        }
                    });
                });
            }
            text = dataSource && filterValue ? (ignoreCase ? filterValue.toLocaleLowerCase() : filterValue).replace(/^\s+|\s+$/g, '') : (ignoreCase ? item.textContent.toLocaleLowerCase() : item.textContent).replace(/^\s+|\s+$/g, '');
            /* eslint-disable security/detect-non-literal-regexp */
            if ((searchType === 'Equal' && text === queryStr) || (searchType === 'StartsWith' && text.substr(0, strLength) === queryStr) || (searchType === 'EndsWith' && text.substr(text.length - queryStr.length) === queryStr) || (searchType === 'Contains' && new RegExp(queryStr, "g").test(text))) {
                itemData.item = item;
                itemData.index = i;
                return { item: item, index: i };
            }
        }
        return itemData;
        /* eslint-enable security/detect-non-literal-regexp */
    }
    return itemData;
}
/* eslint-enable security/detect-object-injection */
function escapeCharRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function resetIncrementalSearchValues(elementId) {
    if (prevElementId === elementId) {
        prevElementId = '';
        prevString = '';
        queryString = '';
        matches$1 = [];
    }
}

/**
 * Function helps to find which highlightSearch is to call based on your data.
 *
 * @param  {HTMLElement} element - Specifies an li element.
 * @param  {string} query - Specifies the string to be highlighted.
 * @param  {boolean} ignoreCase - Specifies the ignoreCase option.
 * @param  {HightLightType} type - Specifies the type of highlight.
 * @returns {void}
 */
function highlightSearch(element, query, ignoreCase, type) {
    if (query === '') {
        return;
    }
    else {
        const ignoreRegex = ignoreCase ? 'gim' : 'gm';
        // eslint-disable-next-line
        query = /^[a-zA-Z0-9- ]*$/.test(query) ? query : query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        const replaceQuery = type === 'StartsWith' ? '^(' + query + ')' : type === 'EndsWith' ?
            '(' + query + ')$' : '(' + query + ')';
        // eslint-disable-next-line security/detect-non-literal-regexp
        findTextNode(element, new RegExp(replaceQuery, ignoreRegex));
    }
}
/* eslint-enable jsdoc/require-param, valid-jsdoc */
/**
 *
 * @param {HTMLElement} element - Specifies the element.
 * @param {RegExp} pattern - Specifies the regex to match the searched text.
 * @returns {void}
 */
function findTextNode(element, pattern) {
    for (let index = 0; element.childNodes && (index < element.childNodes.length); index++) {
        if (element.childNodes[index].nodeType === 3 && element.childNodes[index].textContent.trim() !== '') {
            const value = element.childNodes[index].nodeValue.trim().replace(pattern, '<span class="e-highlight">$1</span>');
            element.childNodes[index].nodeValue = '';
            element.innerHTML = element.innerHTML.trim() + value;
            break;
        }
        else {
            findTextNode(element.childNodes[index], pattern);
        }
    }
}
/**
 * Function helps to remove highlighted element based on your data.
 *
 * @param  {HTMLElement} content - Specifies an content element.
 * @returns {void}
 */
function revertHighlightSearch(content) {
    const contentElement = content.querySelectorAll('.e-highlight');
    for (let i = contentElement.length - 1; i >= 0; i--) {
        const parent = contentElement[i].parentNode;
        const text = document.createTextNode(contentElement[i].textContent);
        parent.replaceChild(text, contentElement[i]);
    }
}

/**
 * Common source
 */

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FieldSettings extends ChildProperty {
}
__decorate([
    Property()
], FieldSettings.prototype, "text", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "value", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "iconCss", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "groupBy", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "htmlAttributes", void 0);
const dropDownBaseClasses = {
    root: 'e-dropdownbase',
    rtl: 'e-rtl',
    content: 'e-content',
    selected: 'e-active',
    hover: 'e-hover',
    noData: 'e-nodata',
    fixedHead: 'e-fixed-head',
    focus: 'e-item-focus',
    li: 'e-list-item',
    group: 'e-list-group-item',
    disabled: 'e-disabled',
    grouping: 'e-dd-group'
};
const ITEMTEMPLATE_PROPERTY = 'ItemTemplate';
const DISPLAYTEMPLATE_PROPERTY = 'DisplayTemplate';
const SPINNERTEMPLATE_PROPERTY = 'SpinnerTemplate';
const VALUETEMPLATE_PROPERTY = 'ValueTemplate';
const GROUPTEMPLATE_PROPERTY = 'GroupTemplate';
const HEADERTEMPLATE_PROPERTY = 'HeaderTemplate';
const FOOTERTEMPLATE_PROPERTY = 'FooterTemplate';
const NORECORDSTEMPLATE_PROPERTY = 'NoRecordsTemplate';
const ACTIONFAILURETEMPLATE_PROPERTY = 'ActionFailureTemplate';
const HIDE_GROUPLIST = 'e-hide-group-header';
/**
 * DropDownBase component will generate the list items based on given data and act as base class to drop-down related components
 */
let DropDownBase = class DropDownBase extends Component {
    /**
     * * Constructor for DropDownBase class
     *
     * @param {DropDownBaseModel} options - Specifies the DropDownBase model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.preventChange = false;
        this.isAngular = false;
        this.isPreventChange = false;
        this.isDynamicDataChange = false;
        this.addedNewItem = false;
        this.isAddNewItemTemplate = false;
    }
    getPropObject(prop, newProp, oldProp) {
        const newProperty = new Object();
        const oldProperty = new Object();
        const propName = (prop) => {
            return prop;
        };
        newProperty[propName(prop)] = newProp[propName(prop)];
        oldProperty[propName(prop)] = oldProp[propName(prop)];
        const data = new Object();
        data.newProperty = newProperty;
        data.oldProperty = oldProperty;
        return data;
    }
    getValueByText(text, ignoreCase, ignoreAccent) {
        let value = null;
        if (!isNullOrUndefined(this.listData)) {
            if (ignoreCase) {
                value = this.checkValueCase(text, true, ignoreAccent);
            }
            else {
                value = this.checkValueCase(text, false, ignoreAccent);
            }
        }
        return value;
    }
    checkValueCase(text, ignoreCase, ignoreAccent, isTextByValue) {
        let value = null;
        if (isTextByValue) {
            value = text;
        }
        const dataSource = this.listData;
        const fields = this.fields;
        const type = this.typeOfData(dataSource).typeof;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            for (const item of dataSource) {
                if (!isNullOrUndefined(item)) {
                    if (ignoreAccent) {
                        value = this.checkingAccent(String(item), text, ignoreCase);
                    }
                    else {
                        if (ignoreCase) {
                            if (this.checkIgnoreCase(String(item), text)) {
                                value = this.getItemValue(String(item), text, ignoreCase);
                            }
                        }
                        else {
                            if (this.checkNonIgnoreCase(String(item), text)) {
                                value = this.getItemValue(String(item), text, ignoreCase, isTextByValue);
                            }
                        }
                    }
                }
            }
        }
        else {
            if (ignoreCase) {
                dataSource.filter((item) => {
                    const itemValue = getValue(fields.value, item);
                    if (!isNullOrUndefined(itemValue) && this.checkIgnoreCase(getValue(fields.text, item).toString(), text)) {
                        value = getValue(fields.value, item);
                    }
                });
            }
            else {
                if (isTextByValue) {
                    let compareValue = null;
                    compareValue = value;
                    dataSource.filter((item) => {
                        const itemValue = getValue(fields.value, item);
                        if (!isNullOrUndefined(itemValue) && !isNullOrUndefined(value) && itemValue.toString() === compareValue.toString()) {
                            value = getValue(fields.text, item);
                        }
                    });
                }
                else {
                    dataSource.filter((item) => {
                        if (this.checkNonIgnoreCase(getValue(fields.text, item), text)) {
                            value = getValue(fields.value, item);
                        }
                    });
                }
            }
        }
        return value;
    }
    checkingAccent(item, text, ignoreCase) {
        const dataItem = DataUtil.ignoreDiacritics(String(item));
        const textItem = DataUtil.ignoreDiacritics(text.toString());
        let value = null;
        if (ignoreCase) {
            if (this.checkIgnoreCase(dataItem, textItem)) {
                value = this.getItemValue(String(item), text, ignoreCase);
            }
        }
        else {
            if (this.checkNonIgnoreCase(String(item), text)) {
                value = this.getItemValue(String(item), text, ignoreCase);
            }
        }
        return value;
    }
    checkIgnoreCase(item, text) {
        return String(item).toLowerCase() === text.toString().toLowerCase() ? true : false;
    }
    checkNonIgnoreCase(item, text) {
        return String(item) === text.toString() ? true : false;
    }
    getItemValue(dataItem, typedText, ignoreCase, isTextByValue) {
        let value = null;
        const dataSource = this.listData;
        const type = this.typeOfData(dataSource).typeof;
        if (isTextByValue) {
            value = dataItem.toString();
        }
        else {
            if (ignoreCase) {
                value = type === 'string' ? String(dataItem) : this.getFormattedValue(String(dataItem));
            }
            else {
                value = type === 'string' ? typedText : this.getFormattedValue(typedText);
            }
        }
        return value;
    }
    templateCompiler(baseTemplate) {
        let checkTemplate = false;
        if (typeof baseTemplate !== 'function' && baseTemplate) {
            try {
                checkTemplate = (selectAll(baseTemplate, document).length) ? true : false;
            }
            catch (exception) {
                checkTemplate = false;
            }
        }
        return checkTemplate;
    }
    l10nUpdate(actionFailure) {
        const ele = this.getModuleName() === 'listbox' ? this.ulElement : this.list;
        if (this.noRecordsTemplate !== 'No records found' || this.actionFailureTemplate !== 'Request failed') {
            const template = actionFailure ? this.actionFailureTemplate : this.noRecordsTemplate;
            let compiledString;
            const templateId = actionFailure ? this.actionFailureTemplateId : this.noRecordsTemplateId;
            ele.innerHTML = '';
            const tempaltecheck = this.templateCompiler(template);
            if (typeof template !== 'function' && tempaltecheck) {
                compiledString = compile(select(template, document).innerHTML.trim());
            }
            else {
                compiledString = compile(template);
            }
            const templateName = actionFailure ? 'actionFailureTemplate' : 'noRecordsTemplate';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const noDataCompTemp = compiledString({}, this, templateName, templateId, this.isStringTemplate, null, ele);
            if (noDataCompTemp && noDataCompTemp.length > 0) {
                for (let i = 0; i < noDataCompTemp.length; i++) {
                    if (this.getModuleName() === 'listbox' && templateName === 'noRecordsTemplate') {
                        if (noDataCompTemp[i].nodeName === '#text') {
                            const liElem = this.createElement('li');
                            liElem.textContent = noDataCompTemp[i].textContent;
                            liElem.classList.add('e-list-nrt');
                            liElem.setAttribute('role', 'option');
                            ele.appendChild(liElem);
                        }
                        else {
                            noDataCompTemp[i].classList.add('e-list-nr-template');
                            ele.appendChild(noDataCompTemp[i]);
                        }
                    }
                    else {
                        ele.appendChild(noDataCompTemp[i]);
                    }
                }
            }
            this.renderReactTemplates();
        }
        else {
            const l10nLocale = { noRecordsTemplate: 'No records found', actionFailureTemplate: 'Request failed' };
            const componentLocale = new L10n(this.getLocaleName(), {}, this.locale);
            if (componentLocale.getConstant('actionFailureTemplate') !== '') {
                this.l10n = componentLocale;
            }
            else {
                this.l10n = new L10n(this.getModuleName() === 'listbox' ? 'listbox' :
                    this.getModuleName() === 'mention' ? 'mention' : 'dropdowns', l10nLocale, this.locale);
            }
            const content = actionFailure ?
                this.l10n.getConstant('actionFailureTemplate') : this.l10n.getConstant('noRecordsTemplate');
            if (this.getModuleName() === 'listbox') {
                const liElem = this.createElement('li');
                liElem.textContent = content;
                ele.appendChild(liElem);
                liElem.classList.add('e-list-nrt');
                liElem.setAttribute('role', 'option');
            }
            else {
                if (!isNullOrUndefined(ele)) {
                    ele.innerHTML = content;
                }
            }
        }
    }
    getLocaleName() {
        return 'drop-down-base';
    }
    getTextByValue(value) {
        const text = this.checkValueCase(value, false, false, true);
        return text;
    }
    getFormattedValue(value) {
        if (this.listData && this.listData.length) {
            let item;
            if (this.properties.allowCustomValue && this.properties.value && this.properties.value instanceof Array && this.properties.value.length > 0) {
                item = this.typeOfData(this.properties.value);
            }
            else {
                item = this.typeOfData(this.listData);
            }
            if (typeof getValue((this.fields.value ? this.fields.value : 'value'), item.item) === 'number'
                || item.typeof === 'number') {
                return parseFloat(value);
            }
            if (typeof getValue((this.fields.value ? this.fields.value : 'value'), item.item) === 'boolean'
                || item.typeof === 'boolean') {
                return ((value === 'true') || ('' + value === 'true'));
            }
        }
        return value;
    }
    /**
     * Sets RTL to dropdownbase wrapper
     *
     * @returns {void}
     */
    setEnableRtl() {
        if (!isNullOrUndefined(this.enableRtlElements)) {
            if (this.list) {
                this.enableRtlElements.push(this.list);
            }
            if (this.enableRtl) {
                addClass(this.enableRtlElements, dropDownBaseClasses.rtl);
            }
            else {
                removeClass(this.enableRtlElements, dropDownBaseClasses.rtl);
            }
        }
    }
    /**
     * Initialize the Component.
     *
     * @returns {void}
     */
    initialize(e) {
        this.bindEvent = true;
        this.actionFailureTemplateId = `${this.element.id}${ACTIONFAILURETEMPLATE_PROPERTY}`;
        if (this.element.tagName === 'UL') {
            const jsonElement = ListBase.createJsonFromElement(this.element);
            this.setProperties({ fields: { text: 'text', value: 'text' } }, true);
            this.resetList(jsonElement, this.fields);
        }
        else if (this.element.tagName === 'SELECT') {
            const dataSource = this.dataSource instanceof Array ? (this.dataSource.length > 0 ? true : false)
                : !isNullOrUndefined(this.dataSource) ? true : false;
            if (!dataSource) {
                this.renderItemsBySelect();
            }
            else if (this.isDynamicDataChange) {
                this.setListData(this.dataSource, this.fields, this.query);
            }
        }
        else {
            this.setListData(this.dataSource, this.fields, this.query, e);
        }
    }
    /**
     * Get the properties to be maintained in persisted state.
     *
     * @returns {string} Returns the persisted data of the component.
     */
    getPersistData() {
        return this.addOnPersist([]);
    }
    /**
     * Sets the enabled state to DropDownBase.
     *
     * @param {string} value - Specifies the attribute values to add on the input element.
     * @returns {void}
     */
    updateDataAttribute(value) {
        const invalidAttr = ['class', 'style', 'id', 'type', 'aria-expanded', 'aria-autocomplete', 'aria-readonly'];
        const attr = {};
        for (let a = 0; a < this.element.attributes.length; a++) {
            if (invalidAttr.indexOf(this.element.attributes[a].name) === -1 &&
                !(this.getModuleName() === 'dropdownlist' && this.element.attributes[a].name === 'readonly')) {
                attr[this.element.attributes[a].name] = this.element.getAttribute(this.element.attributes[a].name);
            }
        }
        extend(attr, value, attr);
        this.setProperties({ htmlAttributes: attr }, true);
    }
    renderItemsBySelect() {
        const element = this.element;
        const fields = { value: 'value', text: 'text' };
        const jsonElement = [];
        const group = element.querySelectorAll('select>optgroup');
        const option = element.querySelectorAll('select>option');
        this.getJSONfromOption(jsonElement, option, fields);
        if (group.length) {
            for (let i = 0; i < group.length; i++) {
                const item = group[i];
                const optionGroup = {};
                optionGroup[fields.text] = item.label;
                optionGroup.isHeader = true;
                const child = item.querySelectorAll('option');
                jsonElement.push(optionGroup);
                this.getJSONfromOption(jsonElement, child, fields);
            }
            element.querySelectorAll('select>option');
        }
        this.updateFields(fields.text, fields.value, this.fields.groupBy, this.fields.htmlAttributes, this.fields.iconCss);
        this.resetList(jsonElement, fields);
    }
    updateFields(text, value, groupBy, htmlAttributes, iconCss) {
        const field = {
            'fields': {
                text: text,
                value: value,
                groupBy: !isNullOrUndefined(groupBy) ? groupBy : this.fields && this.fields.groupBy,
                htmlAttributes: !isNullOrUndefined(htmlAttributes) ? htmlAttributes : this.fields && this.fields.htmlAttributes,
                iconCss: !isNullOrUndefined(iconCss) ? iconCss : this.fields && this.fields.iconCss
            }
        };
        this.setProperties(field, true);
    }
    getJSONfromOption(items, options, fields) {
        for (const option of options) {
            const json = {};
            json[fields.text] = option.innerText;
            json[fields.value] = !isNullOrUndefined(option.getAttribute(fields.value)) ?
                option.getAttribute(fields.value) : option.innerText;
            items.push(json);
        }
    }
    /**
     * Execute before render the list items
     *
     * @private
     * @returns {void}
     */
    preRender() {
        // there is no event handler
        this.scrollTimer = -1;
        this.enableRtlElements = [];
        this.isRequested = false;
        this.isDataFetched = false;
        this.itemTemplateId = `${this.element.id}${ITEMTEMPLATE_PROPERTY}`;
        this.displayTemplateId = `${this.element.id}${DISPLAYTEMPLATE_PROPERTY}`;
        this.spinnerTemplateId = `${this.element.id}${SPINNERTEMPLATE_PROPERTY}`;
        this.valueTemplateId = `${this.element.id}${VALUETEMPLATE_PROPERTY}`;
        this.groupTemplateId = `${this.element.id}${GROUPTEMPLATE_PROPERTY}`;
        this.headerTemplateId = `${this.element.id}${HEADERTEMPLATE_PROPERTY}`;
        this.footerTemplateId = `${this.element.id}${FOOTERTEMPLATE_PROPERTY}`;
        this.noRecordsTemplateId = `${this.element.id}${NORECORDSTEMPLATE_PROPERTY}`;
    }
    /**
     * Creates the list items of DropDownBase component.
     *
     * @param {Object[] | string[] | number[] | DataManager | boolean[]} dataSource - Specifies the data to generate the list.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @param {Query} query - Accepts the external Query that execute along with data processing.
     * @returns {void}
     */
    setListData(dataSource, fields, query, event) {
        fields = fields ? fields : this.fields;
        let ulElement;
        this.isActive = true;
        const eventArgs = { cancel: false, data: dataSource, query: query };
        this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
        this.trigger('actionBegin', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel) {
                this.showSpinner();
                if (dataSource instanceof DataManager) {
                    this.isRequested = true;
                    if (this.isDataFetched) {
                        this.emptyDataRequest(fields);
                        return;
                    }
                    eventArgs.data.executeQuery(this.getQuery(eventArgs.query)).then((e) => {
                        this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
                        this.trigger('actionComplete', e, (e) => {
                            if (!e.cancel) {
                                const listItems = e.result;
                                if (listItems.length === 0) {
                                    this.isDataFetched = true;
                                }
                                ulElement = this.renderItems(listItems, fields);
                                this.onActionComplete(ulElement, listItems, e);
                                if (this.groupTemplate) {
                                    this.renderGroupTemplate(ulElement);
                                }
                                this.isRequested = false;
                                this.bindChildItems(listItems, ulElement, fields, e);
                            }
                        });
                    }).catch((e) => {
                        this.isRequested = false;
                        this.onActionFailure(e);
                        this.hideSpinner();
                    });
                }
                else {
                    const dataManager = new DataManager(eventArgs.data);
                    const listItems = (this.getQuery(eventArgs.query)).executeLocal(dataManager);
                    const localDataArgs = { cancel: false, result: listItems };
                    this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
                    this.trigger('actionComplete', localDataArgs, (localDataArgs) => {
                        if (!localDataArgs.cancel) {
                            ulElement = this.renderItems(localDataArgs.result, fields);
                            this.onActionComplete(ulElement, localDataArgs.result, event);
                            if (this.groupTemplate) {
                                this.renderGroupTemplate(ulElement);
                            }
                            this.bindChildItems(localDataArgs.result, ulElement, fields);
                            setTimeout(() => {
                                if (this.getModuleName() === 'multiselect' && this.itemTemplate != null && (ulElement.childElementCount > 0 && (ulElement.children[0].childElementCount > 0 || (this.fields.groupBy && ulElement.children[1] && ulElement.children[1].childElementCount > 0)))) {
                                    this.updateDataList();
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    bindChildItems(listItems, ulElement, fields, e) {
        if (listItems.length >= 100 && this.getModuleName() === 'autocomplete') {
            setTimeout(() => {
                const childNode = this.remainingItems(this.sortedData, fields);
                append(childNode, ulElement);
                this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                this.updateListValues();
                this.raiseDataBound(listItems, e);
            }, 0);
        }
        else {
            this.raiseDataBound(listItems, e);
        }
    }
    updateListValues() {
        // Used this method in component side.
    }
    findListElement(list, findNode, attribute, value) {
        let liElement = null;
        if (list) {
            const listArr = [].slice.call(list.querySelectorAll(findNode));
            for (let index = 0; index < listArr.length; index++) {
                if (listArr[index].getAttribute(attribute) === (value + '')) {
                    liElement = listArr[index];
                    break;
                }
            }
        }
        return liElement;
    }
    raiseDataBound(listItems, e) {
        this.hideSpinner();
        const dataBoundEventArgs = {
            items: listItems,
            e: e
        };
        this.trigger('dataBound', dataBoundEventArgs);
    }
    remainingItems(dataSource, fields) {
        const spliceData = new DataManager(dataSource).executeLocal(new Query().skip(100));
        if (this.itemTemplate) {
            const listElements = this.templateListItem(spliceData, fields);
            return [].slice.call(listElements.childNodes);
        }
        const type = this.typeOfData(spliceData).typeof;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return ListBase.createListItemFromArray(this.createElement, spliceData, true, this.listOption(spliceData, fields), this);
        }
        return ListBase.createListItemFromJson(this.createElement, spliceData, this.listOption(spliceData, fields), 1, true, this);
    }
    emptyDataRequest(fields) {
        const listItems = [];
        this.onActionComplete(this.renderItems(listItems, fields), listItems);
        this.isRequested = false;
        this.hideSpinner();
    }
    showSpinner() {
        // Used this method in component side.
    }
    hideSpinner() {
        // Used this method in component side.
    }
    onActionFailure(e) {
        this.liCollections = [];
        this.trigger('actionFailure', e);
        this.l10nUpdate(true);
        if (!isNullOrUndefined(this.list)) {
            addClass([this.list], dropDownBaseClasses.noData);
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    onActionComplete(ulElement, list, e) {
        /* eslint-enable @typescript-eslint/no-unused-vars */
        this.listData = list;
        if (this.getModuleName() !== 'listbox') {
            ulElement.setAttribute('tabindex', '0');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate(['itemTemplate', 'groupTemplate', 'actionFailureTemplate', 'noRecordsTemplate']);
        }
        this.fixedHeaderElement = isNullOrUndefined(this.fixedHeaderElement) ? this.fixedHeaderElement : null;
        if (this.getModuleName() === 'multiselect' && this.properties.allowCustomValue && this.fields.groupBy) {
            for (let i = 0; i < ulElement.childElementCount; i++) {
                if (ulElement.children[i].classList.contains('e-list-group-item')) {
                    if (isNullOrUndefined(ulElement.children[i].innerHTML) || ulElement.children[i].innerHTML == "") {
                        addClass([ulElement.children[i]], HIDE_GROUPLIST);
                    }
                }
            }
        }
        if (!isNullOrUndefined(this.list)) {
            this.list.innerHTML = '';
            this.list.appendChild(ulElement);
            this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
            this.ulElement = this.list.querySelector('ul');
            this.postRender(this.list, list, this.bindEvent);
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    postRender(listElement, list, bindEvent) {
        /* eslint-enable @typescript-eslint/no-unused-vars */
        const focusItem = listElement.querySelector('.' + dropDownBaseClasses.li);
        const selectedItem = listElement.querySelector('.' + dropDownBaseClasses.selected);
        if (focusItem && !selectedItem) {
            focusItem.classList.add(dropDownBaseClasses.focus);
        }
        if (list.length <= 0) {
            this.l10nUpdate();
            addClass([listElement], dropDownBaseClasses.noData);
        }
        else {
            listElement.classList.remove(dropDownBaseClasses.noData);
        }
    }
    /**
     * Get the query to do the data operation before list item generation.
     *
     * @param {Query} query - Accepts the external Query that execute along with data processing.
     * @returns {Query} Returns the query to do the data query operation.
     */
    getQuery(query) {
        return query ? query : this.query ? this.query : new Query();
    }
    /**
     * To render the template content for group header element.
     *
     * @param {HTMLElement} listEle - Specifies the group list elements.
     * @returns {void}
     */
    renderGroupTemplate(listEle) {
        if (this.fields.groupBy !== null && this.dataSource || this.element.querySelector('.' + dropDownBaseClasses.group)) {
            const dataSource = this.dataSource;
            const option = { groupTemplateID: this.groupTemplateId, isStringTemplate: this.isStringTemplate };
            const headerItems = listEle.querySelectorAll('.' + dropDownBaseClasses.group);
            const groupcheck = this.templateCompiler(this.groupTemplate);
            if (typeof this.groupTemplate !== 'function' && groupcheck) {
                const groupValue = select(this.groupTemplate, document).innerHTML.trim();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const tempHeaders = ListBase.renderGroupTemplate(groupValue, dataSource, this.fields.properties, headerItems, option, this);
                //EJ2-55168- Group checkbox is not working with group template
                if (this.isGroupChecking) {
                    for (let i = 0; i < tempHeaders.length; i++) {
                        this.notify('addItem', { module: 'CheckBoxSelection', item: tempHeaders[i] });
                    }
                }
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const tempHeaders = ListBase.renderGroupTemplate(this.groupTemplate, dataSource, this.fields.properties, headerItems, option, this);
                //EJ2-55168- Group checkbox is not working with group template
                if (this.isGroupChecking) {
                    for (let i = 0; i < tempHeaders.length; i++) {
                        this.notify('addItem', { module: 'CheckBoxSelection', item: tempHeaders[i] });
                    }
                }
            }
            this.renderReactTemplates();
        }
    }
    /**
     * To create the ul li list items
     *
     * @param {object []} dataSource - Specifies the data to generate the list.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @returns {HTMLElement} Return the ul li list items.
     */
    createListItems(dataSource, fields) {
        if (dataSource && fields.groupBy || this.element.querySelector('optgroup')) {
            if (fields.groupBy) {
                if (this.sortOrder !== 'None') {
                    dataSource = this.getSortedDataSource(dataSource);
                }
                dataSource = ListBase.groupDataSource(dataSource, fields.properties, this.sortOrder);
            }
            addClass([this.list], dropDownBaseClasses.grouping);
        }
        else {
            dataSource = this.getSortedDataSource(dataSource);
        }
        const options = this.listOption(dataSource, fields);
        const spliceData = (dataSource.length > 100) ?
            new DataManager(dataSource).executeLocal(new Query().take(100))
            : dataSource;
        this.sortedData = dataSource;
        return ListBase.createList(this.createElement, (this.getModuleName() === 'autocomplete') ? spliceData : dataSource, options, true, this);
    }
    listOption(dataSource, fields) {
        const iconCss = isNullOrUndefined(fields.iconCss) ? false : true;
        const fieldValues = !isNullOrUndefined(fields.properties) ?
            fields.properties : fields;
        const options = (fields.text !== null || fields.value !== null) ? {
            fields: fieldValues,
            showIcon: iconCss, ariaAttributes: { groupItemRole: 'presentation' }
        } : { fields: { value: 'text' } };
        return extend({}, options, fields, true);
    }
    setFloatingHeader(e) {
        if (!isNullOrUndefined(this.list) && !this.list.classList.contains(dropDownBaseClasses.noData)) {
            if (isNullOrUndefined(this.fixedHeaderElement)) {
                this.fixedHeaderElement = this.createElement('div', { className: dropDownBaseClasses.fixedHead });
                if (!isNullOrUndefined(this.list) && !this.list.querySelector('li').classList.contains(dropDownBaseClasses.group)) {
                    this.fixedHeaderElement.style.display = 'none';
                }
                if (!isNullOrUndefined(this.fixedHeaderElement) && !isNullOrUndefined(this.list)) {
                    prepend([this.fixedHeaderElement], this.list);
                }
                this.setFixedHeader();
            }
            if (!isNullOrUndefined(this.fixedHeaderElement) && this.fixedHeaderElement.style.zIndex === '0') {
                this.setFixedHeader();
            }
            this.scrollStop(e);
        }
    }
    scrollStop(e) {
        const target = !isNullOrUndefined(e) ? e.target : this.list;
        const liHeight = parseInt(getComputedStyle(this.getValidLi(), null).getPropertyValue('height'), 10);
        const topIndex = Math.round(target.scrollTop / liHeight);
        const liCollections = this.list.querySelectorAll('li' + ':not(.e-hide-listitem)');
        for (let i = topIndex; i > -1; i--) {
            if (!isNullOrUndefined(liCollections[i]) && liCollections[i].classList.contains(dropDownBaseClasses.group)) {
                const currentLi = liCollections[i];
                this.fixedHeaderElement.innerHTML = currentLi.innerHTML;
                this.fixedHeaderElement.style.top = target.scrollTop + 'px';
                this.fixedHeaderElement.style.display = 'block';
                break;
            }
            else {
                this.fixedHeaderElement.style.display = 'none';
                this.fixedHeaderElement.style.top = 'none';
            }
        }
    }
    getValidLi() {
        return this.liCollections[0];
    }
    /**
     * To render the list items
     *
     * @param {object[]} listData - Specifies the list of array of data.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @returns {HTMLElement} Return the list items.
     */
    renderItems(listData, fields) {
        let ulElement;
        if (this.itemTemplate && listData) {
            let dataSource = listData;
            if (dataSource && fields.groupBy) {
                if (this.sortOrder !== 'None') {
                    dataSource = this.getSortedDataSource(dataSource);
                }
                dataSource = ListBase.groupDataSource(dataSource, fields.properties, this.sortOrder);
            }
            else {
                dataSource = this.getSortedDataSource(dataSource);
            }
            this.sortedData = dataSource;
            const spliceData = (dataSource.length > 100) ?
                new DataManager(dataSource).executeLocal(new Query().take(100))
                : dataSource;
            ulElement = this.templateListItem((this.getModuleName() === 'autocomplete') ? spliceData : dataSource, fields);
        }
        else {
            ulElement = this.createListItems(listData, fields);
        }
        return ulElement;
    }
    templateListItem(dataSource, fields) {
        const option = this.listOption(dataSource, fields);
        option.templateID = this.itemTemplateId;
        option.isStringTemplate = this.isStringTemplate;
        const itemcheck = this.templateCompiler(this.itemTemplate);
        if (typeof this.itemTemplate !== 'function' && itemcheck) {
            const itemValue = select(this.itemTemplate, document).innerHTML.trim();
            return ListBase.renderContentTemplate(this.createElement, itemValue, dataSource, fields.properties, option, this);
        }
        else {
            return ListBase.renderContentTemplate(this.createElement, this.itemTemplate, dataSource, fields.properties, option, this);
        }
    }
    typeOfData(items) {
        let item = { typeof: null, item: null };
        for (let i = 0; (!isNullOrUndefined(items) && i < items.length); i++) {
            if (!isNullOrUndefined(items[i])) {
                const listDataType = typeof (items[i]) === 'string' ||
                    typeof (items[i]) === 'number' || typeof (items[i]) === 'boolean';
                const isNullData = listDataType ? isNullOrUndefined(items[i]) :
                    isNullOrUndefined(getValue((this.fields.value ? this.fields.value : 'value'), items[i]));
                if (!isNullData) {
                    return item = { typeof: typeof items[i], item: items[i] };
                }
            }
        }
        return item;
    }
    setFixedHeader() {
        if (!isNullOrUndefined(this.list)) {
            this.list.parentElement.style.display = 'block';
        }
        let borderWidth = 0;
        if (this.list && this.list.parentElement) {
            borderWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-width'), 10);
            /*Shorthand property not working in Firefox for getComputedStyle method.
            Refer bug report https://bugzilla.mozilla.org/show_bug.cgi?id=137688
            Refer alternate solution https://stackoverflow.com/a/41696234/9133493*/
            if (isNaN(borderWidth)) {
                let borderTopWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-top-width'), 10);
                let borderBottomWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-bottom-width'), 10);
                let borderLeftWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-left-width'), 10);
                let borderRightWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-right-width'), 10);
                borderWidth = (borderTopWidth + borderBottomWidth + borderLeftWidth + borderRightWidth);
            }
        }
        if (!isNullOrUndefined(this.liCollections)) {
            const liWidth = this.getValidLi().offsetWidth - borderWidth;
            this.fixedHeaderElement.style.width = liWidth.toString() + 'px';
        }
        setStyleAttribute(this.fixedHeaderElement, { zIndex: 10 });
        const firstLi = this.ulElement.querySelector('.' + dropDownBaseClasses.group + ':not(.e-hide-listitem)');
        this.fixedHeaderElement.innerHTML = firstLi.innerHTML;
    }
    getSortedDataSource(dataSource) {
        if (dataSource && this.sortOrder !== 'None') {
            let textField = this.fields.text ? this.fields.text : 'text';
            if (this.typeOfData(dataSource).typeof === 'string' || this.typeOfData(dataSource).typeof === 'number'
                || this.typeOfData(dataSource).typeof === 'boolean') {
                textField = '';
            }
            dataSource = ListBase.getDataSource(dataSource, ListBase.addSorting(this.sortOrder, textField));
        }
        return dataSource;
    }
    /**
     * Return the index of item which matched with given value in data source
     *
     * @param {string | number | boolean} value - Specifies given value.
     * @returns {number} Returns the index of the item.
     */
    getIndexByValue(value) {
        let index;
        const listItems = this.getItems();
        for (let i = 0; i < listItems.length; i++) {
            if (!isNullOrUndefined(value) && listItems[i].getAttribute('data-value') === value.toString()) {
                index = i;
                break;
            }
        }
        return index;
    }
    /**
     * To dispatch the event manually
     *
     * @param {HTMLElement} element - Specifies the element to dispatch the event.
     * @param {string} type - Specifies the name of the event.
     * @returns {void}
     */
    dispatchEvent(element, type) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent(type, false, true);
        if (element) {
            element.dispatchEvent(evt);
        }
    }
    /**
     * To set the current fields
     *
     * @returns {void}
     */
    setFields() {
        if (this.fields.value && !this.fields.text) {
            this.updateFields(this.fields.value, this.fields.value);
        }
        else if (!this.fields.value && this.fields.text) {
            this.updateFields(this.fields.text, this.fields.text);
        }
        else if (!this.fields.value && !this.fields.text) {
            this.updateFields('text', 'text');
        }
    }
    /**
     * reset the items list.
     *
     * @param {Object[] | string[] | number[] | DataManager | boolean[]} dataSource - Specifies the data to generate the list.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @param {Query} query - Accepts the external Query that execute along with data processing.
     * @returns {void}
     */
    resetList(dataSource, fields, query, e) {
        if (this.list) {
            if ((this.element.tagName === 'SELECT' && this.element.options.length > 0)
                || (this.element.tagName === 'UL' && this.element.childNodes.length > 0)) {
                const data = dataSource instanceof Array ? (dataSource.length > 0)
                    : !isNullOrUndefined(dataSource);
                if (!data && this.selectData && this.selectData.length > 0) {
                    dataSource = this.selectData;
                }
            }
            dataSource = this.getModuleName() === 'combobox' && this.selectData && dataSource instanceof Array && dataSource.length < this.selectData.length && this.addedNewItem ? this.selectData : dataSource;
            this.addedNewItem = false;
            this.setListData(dataSource, fields, query, e);
        }
    }
    updateSelectElementData(isFiltering) {
        if (isFiltering && isNullOrUndefined(this.selectData) && this.listData && this.listData.length > 0) {
            this.selectData = this.listData;
        }
    }
    updateSelection() {
        // This is for after added the item, need to update the selected index values.
    }
    renderList() {
        // This is for render the list items.
        this.render();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateDataSource(props) {
        this.resetList(this.dataSource);
    }
    setUpdateInitial(props, newProp) {
        this.isDataFetched = false;
        const updateData = {};
        for (let j = 0; props.length > j; j++) {
            if (newProp[props[j]] && props[j] === 'fields') {
                this.setFields();
                updateData[props[j]] = newProp[props[j]];
            }
            else if (newProp[props[j]]) {
                updateData[props[j]] = newProp[props[j]];
            }
        }
        if (Object.keys(updateData).length > 0) {
            if (Object.keys(updateData).indexOf('dataSource') === -1) {
                updateData.dataSource = this.dataSource;
            }
            this.updateDataSource(updateData);
        }
    }
    /**
     * When property value changes happened, then onPropertyChanged method will execute the respective changes in this component.
     *
     * @param {DropDownBaseModel} newProp - Returns the dynamic property value of the component.
     * @param {DropDownBaseModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPropertyChanged(newProp, oldProp) {
        if (this.getModuleName() === 'dropdownbase') {
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        this.setUpdateInitial(['sortOrder', 'itemTemplate'], newProp);
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'query':
                case 'sortOrder':
                case 'dataSource':
                case 'itemTemplate':
                    break;
                case 'enableRtl':
                    this.setEnableRtl();
                    break;
                case 'groupTemplate':
                    this.renderGroupTemplate(this.list);
                    if (this.ulElement && this.fixedHeaderElement) {
                        const firstLi = this.ulElement.querySelector('.' + dropDownBaseClasses.group);
                        this.fixedHeaderElement.innerHTML = firstLi.innerHTML;
                    }
                    break;
                case 'locale':
                    if (this.list && (!isNullOrUndefined(this.liCollections) && this.liCollections.length === 0)) {
                        this.l10nUpdate();
                    }
                    break;
                case 'zIndex':
                    this.setProperties({ zIndex: newProp.zIndex }, true);
                    this.setZIndex();
                    break;
            }
        }
    }
    /**
     * Build and render the component
     *
     * @param {boolean} isEmptyData - Specifies the component to initialize with list data or not.
     * @private
     * @returns {void}
     */
    render(e, isEmptyData) {
        if (this.getModuleName() === 'listbox') {
            this.list = this.createElement('div', { className: dropDownBaseClasses.content, attrs: { 'tabindex': '0' } });
        }
        else {
            this.list = this.createElement('div', { className: dropDownBaseClasses.content });
        }
        this.list.classList.add(dropDownBaseClasses.root);
        this.setFields();
        const rippleModel = { duration: 300, selector: '.' + dropDownBaseClasses.li };
        this.rippleFun = rippleEffect(this.list, rippleModel);
        const group = this.element.querySelector('select>optgroup');
        if ((this.fields.groupBy || !isNullOrUndefined(group)) && !this.isGroupChecking) {
            EventHandler.add(this.list, 'scroll', this.setFloatingHeader, this);
        }
        if (this.getModuleName() === 'dropdownbase') {
            if (this.element.getAttribute('tabindex')) {
                this.list.setAttribute('tabindex', this.element.getAttribute('tabindex'));
            }
            removeClass([this.element], dropDownBaseClasses.root);
            this.element.style.display = 'none';
            const wrapperElement = this.createElement('div');
            this.element.parentElement.insertBefore(wrapperElement, this.element);
            wrapperElement.appendChild(this.element);
            wrapperElement.appendChild(this.list);
        }
        this.setEnableRtl();
        if (!isEmptyData) {
            this.initialize(e);
        }
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'dropdownbase';
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets all the list items bound on this component.
     *
     * @returns {Element[]}
     */
    getItems() {
        return this.ulElement.querySelectorAll('.' + dropDownBaseClasses.li);
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Adds a new item to the popup list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the popup list.
     * @returns {void}
     * @deprecated
     */
    addItem(items, itemIndex) {
        if (!this.list || (this.list.textContent === this.noRecordsTemplate && this.getModuleName() !== 'listbox')) {
            this.renderList();
        }
        if (this.sortOrder !== 'None' && isNullOrUndefined(itemIndex)) {
            let newList = [].slice.call(this.listData);
            newList.push(items);
            newList = this.getSortedDataSource(newList);
            if (this.fields.groupBy) {
                newList = ListBase.groupDataSource(newList, this.fields.properties, this.sortOrder);
                itemIndex = newList.indexOf(items);
            }
            else {
                itemIndex = newList.indexOf(items);
            }
        }
        const itemsCount = this.getItems().length;
        const selectedItemValue = this.list.querySelector('.' + dropDownBaseClasses.selected);
        items = (items instanceof Array ? items : [items]);
        let index;
        index = (isNullOrUndefined(itemIndex) || itemIndex < 0 || itemIndex > itemsCount - 1) ? itemsCount : itemIndex;
        const fields = this.fields;
        if (items && fields.groupBy) {
            items = ListBase.groupDataSource(items, fields.properties);
        }
        const liCollections = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const isHeader = item.isHeader;
            const li = this.createElement('li', { className: isHeader ? dropDownBaseClasses.group : dropDownBaseClasses.li, id: 'option-add-' + i });
            const itemText = item instanceof Object ? getValue(fields.text, item) : item;
            if (isHeader) {
                li.innerText = itemText;
            }
            if (this.itemTemplate && !isHeader) {
                const itemCheck = this.templateCompiler(this.itemTemplate);
                const compiledString = typeof this.itemTemplate !== 'function' &&
                    itemCheck ? compile(select(this.itemTemplate, document).innerHTML.trim()) : compile(this.itemTemplate);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const addItemTemplate = compiledString(item, this, 'itemTemplate', this.itemTemplateId, this.isStringTemplate, null, li);
                if (addItemTemplate) {
                    append(addItemTemplate, li);
                }
            }
            else if (!isHeader) {
                li.appendChild(document.createTextNode(itemText));
            }
            li.setAttribute('data-value', item instanceof Object ? getValue(fields.value, item) : item);
            li.setAttribute('role', 'option');
            this.notify('addItem', { module: 'CheckBoxSelection', item: li });
            liCollections.push(li);
            this.listData.push(item);
            if (this.sortOrder === 'None' && isNullOrUndefined(itemIndex) && index === 0) {
                index = null;
            }
            this.updateActionCompleteData(li, item, index);
            //Listbox event
            this.trigger('beforeItemRender', { element: li, item: item });
        }
        if (itemsCount === 0 && isNullOrUndefined(this.list.querySelector('ul'))) {
            if (!isNullOrUndefined(this.list)) {
                this.list.innerHTML = '';
                this.list.classList.remove(dropDownBaseClasses.noData);
                this.isAddNewItemTemplate = true;
                if (!isNullOrUndefined(this.ulElement)) {
                    this.list.appendChild(this.ulElement);
                }
            }
            this.liCollections = liCollections;
            if (!isNullOrUndefined(liCollections) && !isNullOrUndefined(this.ulElement)) {
                append(liCollections, this.ulElement);
            }
            this.updateAddItemList(this.list, itemsCount);
        }
        else {
            if (this.getModuleName() === 'listbox' && itemsCount === 0) {
                this.ulElement.innerHTML = '';
            }
            const attr = [];
            for (let i = 0; i < items.length; i++) {
                const listGroupItem = this.ulElement.querySelectorAll('.e-list-group-item');
                for (let j = 0; j < listGroupItem.length; j++) {
                    attr[j] = listGroupItem[j].innerText;
                }
                if (attr.indexOf(liCollections[i].innerText) > -1 && fields.groupBy) {
                    for (let j = 0; j < listGroupItem.length; j++) {
                        if (attr[j] === liCollections[i].innerText) {
                            if (this.sortOrder === 'None') {
                                this.ulElement.insertBefore(liCollections[i + 1], listGroupItem[j + 1]);
                            }
                            else {
                                this.ulElement.insertBefore(liCollections[i + 1], this.ulElement.childNodes[itemIndex]);
                            }
                            i = i + 1;
                            break;
                        }
                    }
                }
                else {
                    if (this.liCollections[index]) {
                        this.liCollections[index].parentNode.insertBefore(liCollections[i], this.liCollections[index]);
                    }
                    else {
                        this.ulElement.appendChild(liCollections[i]);
                    }
                }
                const tempLi = [].slice.call(this.liCollections);
                tempLi.splice(index, 0, liCollections[i]);
                this.liCollections = tempLi;
                index += 1;
                if (this.getModuleName() === 'multiselect') {
                    this.updateDataList();
                }
            }
        }
        if (this.getModuleName() === 'listbox' && this.isReact) {
            this.renderReactTemplates();
        }
        if (selectedItemValue || itemIndex === 0) {
            this.updateSelection();
        }
        this.addedNewItem = true;
    }
    validationAttribute(target, hidden) {
        const name = target.getAttribute('name') ? target.getAttribute('name') : target.getAttribute('id');
        hidden.setAttribute('name', name);
        target.removeAttribute('name');
        const attributes$$1 = ['required', 'aria-required', 'form'];
        for (let i = 0; i < attributes$$1.length; i++) {
            if (!target.getAttribute(attributes$$1[i])) {
                continue;
            }
            const attr = target.getAttribute(attributes$$1[i]);
            hidden.setAttribute(attributes$$1[i], attr);
            target.removeAttribute(attributes$$1[i]);
        }
    }
    setZIndex() {
        // this is for component wise
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateActionCompleteData(li, item, index) {
        // this is for ComboBox custom value
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAddItemList(list, itemCount) {
        // this is for multiselect add item
    }
    updateDataList() {
        // this is for multiselect update list items
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets the data Object that matches the given value.
     *
     * @param { string | number } value - Specifies the value of the list item.
     * @returns {Object}
     */
    getDataByValue(value) {
        if (!isNullOrUndefined(this.listData)) {
            const type = this.typeOfData(this.listData).typeof;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                for (const item of this.listData) {
                    if (!isNullOrUndefined(item) && item === value) {
                        return item;
                    }
                }
            }
            else {
                for (const item of this.listData) {
                    if (!isNullOrUndefined(item) && getValue((this.fields.value ? this.fields.value : 'value'), item) === value) {
                        return item;
                    }
                }
            }
        }
        return null;
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Removes the component from the DOM and detaches all its related event handlers. It also removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        if (document.body.contains(this.list)) {
            EventHandler.remove(this.list, 'scroll', this.setFloatingHeader);
            if (!isNullOrUndefined(this.rippleFun)) {
                this.rippleFun();
            }
            detach(this.list);
        }
        this.liCollections = null;
        this.ulElement = null;
        this.list = null;
        this.enableRtlElements = null;
        this.rippleFun = null;
        super.destroy();
    }
};
__decorate([
    Complex({ text: null, value: null, iconCss: null, groupBy: null }, FieldSettings)
], DropDownBase.prototype, "fields", void 0);
__decorate([
    Property(null)
], DropDownBase.prototype, "itemTemplate", void 0);
__decorate([
    Property(null)
], DropDownBase.prototype, "groupTemplate", void 0);
__decorate([
    Property('No records found')
], DropDownBase.prototype, "noRecordsTemplate", void 0);
__decorate([
    Property('Request failed')
], DropDownBase.prototype, "actionFailureTemplate", void 0);
__decorate([
    Property('None')
], DropDownBase.prototype, "sortOrder", void 0);
__decorate([
    Property([])
], DropDownBase.prototype, "dataSource", void 0);
__decorate([
    Property(null)
], DropDownBase.prototype, "query", void 0);
__decorate([
    Property('StartsWith')
], DropDownBase.prototype, "filterType", void 0);
__decorate([
    Property(true)
], DropDownBase.prototype, "ignoreCase", void 0);
__decorate([
    Property(1000)
], DropDownBase.prototype, "zIndex", void 0);
__decorate([
    Property(false)
], DropDownBase.prototype, "ignoreAccent", void 0);
__decorate([
    Property()
], DropDownBase.prototype, "locale", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "actionBegin", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "actionComplete", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "actionFailure", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "select", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "dataBound", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "created", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "destroyed", void 0);
DropDownBase = __decorate([
    NotifyPropertyChanges
], DropDownBase);

/**
 * export all modules from current location
 */

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../drop-down-base/drop-down-base-model.d.ts'/>
// don't use space in classnames
const dropDownListClasses = {
    root: 'e-dropdownlist',
    hover: dropDownBaseClasses.hover,
    selected: dropDownBaseClasses.selected,
    rtl: dropDownBaseClasses.rtl,
    li: dropDownBaseClasses.li,
    disable: dropDownBaseClasses.disabled,
    base: dropDownBaseClasses.root,
    focus: dropDownBaseClasses.focus,
    input: 'e-input-group',
    inputFocus: 'e-input-focus',
    icon: 'e-input-group-icon e-ddl-icon',
    iconAnimation: 'e-icon-anim',
    value: 'e-input-value',
    device: 'e-ddl-device',
    backIcon: 'e-input-group-icon e-back-icon e-icons',
    filterBarClearIcon: 'e-input-group-icon e-clear-icon e-icons',
    filterInput: 'e-input-filter',
    filterParent: 'e-filter-parent',
    mobileFilter: 'e-ddl-device-filter',
    footer: 'e-ddl-footer',
    header: 'e-ddl-header',
    clearIcon: 'e-clear-icon',
    clearIconHide: 'e-clear-icon-hide',
    popupFullScreen: 'e-popup-full-page',
    disableIcon: 'e-ddl-disable-icon',
    hiddenElement: 'e-ddl-hidden'
};
const inputObject = {
    container: null,
    buttons: []
};
/**
 * The DropDownList component contains a list of predefined values from which you can
 * choose a single value.
 * ```html
 * <input type="text" tabindex="1" id="list"> </input>
 * ```
 * ```typescript
 *   let dropDownListObj:DropDownList = new DropDownList();
 *   dropDownListObj.appendTo("#list");
 * ```
 */
let DropDownList = class DropDownList extends DropDownBase {
    /**
     * * Constructor for creating the DropDownList component.
     *
     * @param {DropDownListModel} options - Specifies the DropDownList model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.isListSearched = false;
        this.preventChange = false;
        this.isAngular = false;
    }
    /**
     * Initialize the event handler.
     *
     * @private
     * @returns {void}
     */
    preRender() {
        this.valueTempElement = null;
        this.element.style.opacity = '0';
        this.initializeData();
        super.preRender();
        this.activeIndex = this.index;
        this.queryString = '';
    }
    initializeData() {
        this.isPopupOpen = false;
        this.isDocumentClick = false;
        this.isInteracted = false;
        this.isFilterFocus = false;
        this.beforePopupOpen = false;
        this.initial = true;
        this.initRemoteRender = false;
        this.isNotSearchList = false;
        this.isTyped = false;
        this.isSelected = false;
        this.preventFocus = false;
        this.preventAutoFill = false;
        this.isValidKey = false;
        this.typedString = '';
        this.isEscapeKey = false;
        this.isPreventBlur = false;
        this.isTabKey = false;
        this.actionCompleteData = { isUpdated: false };
        this.actionData = { isUpdated: false };
        this.prevSelectPoints = {};
        this.isSelectCustom = false;
        this.isDropDownClick = false;
        this.preventAltUp = false;
        this.isCustomFilter = false;
        this.isSecondClick = false;
        this.previousValue = null;
        this.keyConfigure = {
            tab: 'tab',
            enter: '13',
            escape: '27',
            end: '35',
            home: '36',
            down: '40',
            up: '38',
            pageUp: '33',
            pageDown: '34',
            open: 'alt+40',
            close: 'shift+tab',
            hide: 'alt+38',
            space: '32'
        };
    }
    setZIndex() {
        if (this.popupObj) {
            this.popupObj.setProperties({ 'zIndex': this.zIndex });
        }
    }
    renderList(e, isEmptyData) {
        super.render(e, isEmptyData);
        this.unWireListEvents();
        this.wireListEvents();
    }
    floatLabelChange() {
        if (this.getModuleName() === 'dropdownlist' && this.floatLabelType === 'Auto') {
            const floatElement = this.inputWrapper.container.querySelector('.e-float-text');
            if (this.inputElement.value !== '' || this.isInteracted) {
                classList(floatElement, ['e-label-top'], ['e-label-bottom']);
            }
            else {
                classList(floatElement, ['e-label-bottom'], ['e-label-top']);
            }
        }
    }
    resetHandler(e) {
        e.preventDefault();
        this.clearAll(e);
    }
    resetFocusElement() {
        this.removeHover();
        this.removeSelection();
        this.removeFocus();
        this.list.scrollTop = 0;
        if (this.getModuleName() !== 'autocomplete' && !isNullOrUndefined(this.ulElement)) {
            const li = this.ulElement.querySelector('.' + dropDownListClasses.li);
            if (li) {
                li.classList.add(dropDownListClasses.focus);
            }
        }
    }
    clearAll(e, properties) {
        this.previousItemData = (!isNullOrUndefined(this.itemData)) ? this.itemData : null;
        if (isNullOrUndefined(properties) || (!isNullOrUndefined(properties) &&
            (isNullOrUndefined(properties.dataSource) ||
                (!(properties.dataSource instanceof DataManager) && properties.dataSource.length === 0)))) {
            this.isActive = true;
            this.resetSelection(properties);
        }
        const dataItem = this.getItemData();
        if (this.previousValue === dataItem.value) {
            return;
        }
        this.onChangeEvent(e);
    }
    resetSelection(properties) {
        if (this.list) {
            if ((!isNullOrUndefined(properties) &&
                (isNullOrUndefined(properties.dataSource) ||
                    (!(properties.dataSource instanceof DataManager) && properties.dataSource.length === 0)))) {
                this.selectedLI = null;
                this.actionCompleteData.isUpdated = false;
                this.actionCompleteData.ulElement = null;
                this.actionCompleteData.list = null;
                this.resetList(properties.dataSource);
            }
            else {
                if (this.allowFiltering && this.getModuleName() !== 'autocomplete'
                    && !isNullOrUndefined(this.actionCompleteData.ulElement) && !isNullOrUndefined(this.actionCompleteData.list) &&
                    this.actionCompleteData.list.length > 0) {
                    this.onActionComplete(this.actionCompleteData.ulElement.cloneNode(true), this.actionCompleteData.list);
                }
                this.resetFocusElement();
            }
        }
        if (!isNullOrUndefined(this.hiddenElement)) {
            this.hiddenElement.innerHTML = '';
        }
        if (!isNullOrUndefined(this.inputElement)) {
            this.inputElement.value = '';
        }
        this.value = null;
        this.itemData = null;
        this.text = null;
        this.index = null;
        this.activeIndex = null;
        this.item = null;
        this.queryString = '';
        if (this.valueTempElement) {
            detach(this.valueTempElement);
            this.inputElement.style.display = 'block';
            this.valueTempElement = null;
        }
        this.setSelection(null, null);
        this.isSelectCustom = false;
        this.updateIconState();
        this.cloneElements();
    }
    setHTMLAttributes() {
        if (Object.keys(this.htmlAttributes).length) {
            for (const htmlAttr of Object.keys(this.htmlAttributes)) {
                if (htmlAttr === 'class') {
                    const updatedClassValue = (this.htmlAttributes[`${htmlAttr}`].replace(/\s+/g, ' ')).trim();
                    if (updatedClassValue !== '') {
                        addClass([this.inputWrapper.container], updatedClassValue.split(' '));
                    }
                }
                else if (htmlAttr === 'disabled' && this.htmlAttributes[`${htmlAttr}`] === 'disabled') {
                    this.enabled = false;
                    this.setEnable();
                }
                else if (htmlAttr === 'readonly' && !isNullOrUndefined(this.htmlAttributes[`${htmlAttr}`])) {
                    this.readonly = true;
                    this.dataBind();
                }
                else if (htmlAttr === 'style') {
                    this.inputWrapper.container.setAttribute('style', this.htmlAttributes[`${htmlAttr}`]);
                }
                else if (htmlAttr === 'aria-label') {
                    if (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') {
                        this.inputElement.setAttribute('aria-label', this.htmlAttributes[`${htmlAttr}`]);
                    }
                    else {
                        this.inputWrapper.container.setAttribute('aria-label', this.htmlAttributes[`${htmlAttr}`]);
                    }
                }
                else {
                    const defaultAttr = ['title', 'id', 'placeholder',
                        'role', 'autocomplete', 'autocapitalize', 'spellcheck', 'minlength', 'maxlength'];
                    const validateAttr = ['name', 'required'];
                    if (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') {
                        defaultAttr.push('tabindex');
                    }
                    if (validateAttr.indexOf(htmlAttr) > -1 || htmlAttr.indexOf('data') === 0) {
                        this.hiddenElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                    else if (defaultAttr.indexOf(htmlAttr) > -1) {
                        if (htmlAttr === 'placeholder') {
                            Input.setPlaceholder(this.htmlAttributes[`${htmlAttr}`], this.inputElement);
                        }
                        else {
                            this.inputElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                    }
                    else {
                        this.inputWrapper.container.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                }
            }
        }
        if (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') {
            this.inputWrapper.container.removeAttribute('tabindex');
        }
    }
    getAriaAttributes() {
        return {
            'aria-disabled': 'false',
            'role': 'combobox',
            'aria-expanded': 'false',
            'aria-live': 'polite',
            'aria-labelledby': this.hiddenElement.id
        };
    }
    setEnableRtl() {
        Input.setEnableRtl(this.enableRtl, [this.inputElement.parentElement]);
        if (this.popupObj) {
            this.popupObj.enableRtl = this.enableRtl;
            this.popupObj.dataBind();
        }
    }
    setEnable() {
        Input.setEnabled(this.enabled, this.inputElement);
        if (this.enabled) {
            removeClass([this.inputWrapper.container], dropDownListClasses.disable);
            this.inputElement.setAttribute('aria-disabled', 'false');
            this.targetElement().setAttribute('tabindex', this.tabIndex);
        }
        else {
            this.hidePopup();
            addClass([this.inputWrapper.container], dropDownListClasses.disable);
            this.inputElement.setAttribute('aria-disabled', 'true');
            this.targetElement().tabIndex = -1;
        }
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Returns the persisted data of the component.
     */
    getPersistData() {
        return this.addOnPersist(['value']);
    }
    getLocaleName() {
        return 'drop-down-list';
    }
    preventTabIndex(element) {
        if (this.getModuleName() === 'dropdownlist') {
            element.tabIndex = -1;
        }
    }
    targetElement() {
        return !isNullOrUndefined(this.inputWrapper) ? this.inputWrapper.container : null;
    }
    getNgDirective() {
        return 'EJS-DROPDOWNLIST';
    }
    getElementByText(text) {
        return this.getElementByValue(this.getValueByText(text));
    }
    getElementByValue(value) {
        let item;
        const listItems = this.getItems();
        for (const liItem of listItems) {
            if (this.getFormattedValue(liItem.getAttribute('data-value')) === value) {
                item = liItem;
                break;
            }
        }
        return item;
    }
    initValue() {
        this.renderList();
        if (this.dataSource instanceof DataManager) {
            this.initRemoteRender = true;
        }
        else {
            this.updateValues();
        }
    }
    updateValues() {
        if (!isNullOrUndefined(this.value)) {
            this.setSelection(this.getElementByValue(this.value), null);
        }
        else if (this.text && isNullOrUndefined(this.value)) {
            const element = this.getElementByText(this.text);
            if (isNullOrUndefined(element)) {
                this.setProperties({ text: null });
                return;
            }
            else {
                this.setSelection(element, null);
            }
        }
        else {
            this.setSelection(this.liCollections[this.activeIndex], null);
        }
        this.setHiddenValue();
        Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
    }
    onBlurHandler(e) {
        if (!this.enabled) {
            return;
        }
        const target = e.relatedTarget;
        const currentTarget = e.target;
        const isPreventBlur = this.isPreventBlur;
        this.isPreventBlur = false;
        //IE 11 - issue
        if (isPreventBlur && !this.isDocumentClick && this.isPopupOpen && (!isNullOrUndefined(currentTarget) ||
            !this.isFilterLayout() && isNullOrUndefined(target))) {
            if (this.getModuleName() === 'dropdownlist' && this.allowFiltering && this.isPopupOpen) {
                this.filterInput.focus();
            }
            else {
                this.targetElement().focus();
            }
            return;
        }
        if (this.isDocumentClick || (!isNullOrUndefined(this.popupObj)
            && document.body.contains(this.popupObj.element) &&
            this.popupObj.element.classList.contains(dropDownListClasses.mobileFilter))) {
            if (!this.beforePopupOpen) {
                this.isDocumentClick = false;
            }
            return;
        }
        if (((this.getModuleName() === 'dropdownlist' && !this.isFilterFocus && target !== this.inputElement)
            && (document.activeElement !== target || (document.activeElement === target &&
                currentTarget.classList.contains(dropDownListClasses.inputFocus)))) ||
            (isNullOrUndefined(target) && this.getModuleName() === 'dropdownlist' && this.allowFiltering &&
                currentTarget !== this.inputWrapper.container) || this.getModuleName() !== 'dropdownlist' &&
            !this.inputWrapper.container.contains(target) || this.isTabKey) {
            this.isDocumentClick = this.isPopupOpen ? true : false;
            this.focusOutAction(e);
            this.isTabKey = false;
        }
        if (this.isRequested && !this.isPopupOpen && !this.isPreventBlur) {
            this.isActive = false;
            this.beforePopupOpen = false;
        }
    }
    focusOutAction(e) {
        this.isInteracted = false;
        this.focusOut(e);
        this.onFocusOut();
    }
    onFocusOut() {
        if (!this.enabled) {
            return;
        }
        if (this.isSelected) {
            this.isSelectCustom = false;
            this.onChangeEvent(null);
        }
        this.floatLabelChange();
        this.dispatchEvent(this.hiddenElement, 'change');
        if (this.getModuleName() === 'dropdownlist' && this.element.tagName !== 'INPUT') {
            this.dispatchEvent(this.inputElement, 'blur');
        }
        if (this.inputWrapper.clearButton) {
            addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
        }
        this.trigger('blur');
    }
    onFocus(e) {
        if (!this.isInteracted) {
            this.isInteracted = true;
            const args = { isInteracted: e ? true : false, event: e };
            this.trigger('focus', args);
        }
        this.updateIconState();
    }
    resetValueHandler(e) {
        const formElement = closest(this.inputElement, 'form');
        if (formElement && e.target === formElement) {
            const val = (this.element.tagName === this.getNgDirective()) ? null : this.inputElement.getAttribute('value');
            this.text = val;
        }
    }
    wireEvent() {
        EventHandler.add(this.inputWrapper.container, 'mousedown', this.dropDownClick, this);
        EventHandler.add(this.inputWrapper.container, 'focus', this.focusIn, this);
        EventHandler.add(this.inputWrapper.container, 'keypress', this.onSearch, this);
        this.bindCommonEvent();
    }
    bindCommonEvent() {
        EventHandler.add(this.targetElement(), 'blur', this.onBlurHandler, this);
        const formElement = closest(this.inputElement, 'form');
        if (formElement) {
            EventHandler.add(formElement, 'reset', this.resetValueHandler, this);
        }
        if (!Browser.isDevice) {
            this.keyboardModule = new KeyboardEvents(this.targetElement(), {
                keyAction: this.keyActionHandler.bind(this), keyConfigs: this.keyConfigure, eventName: 'keydown'
            });
        }
        else {
            this.keyboardModule = new KeyboardEvents(this.targetElement(), {
                keyAction: this.mobileKeyActionHandler.bind(this), keyConfigs: this.keyConfigure, eventName: 'keydown'
            });
        }
        this.bindClearEvent();
    }
    bindClearEvent() {
        if (this.showClearButton) {
            EventHandler.add(this.inputWrapper.clearButton, 'mousedown', this.resetHandler, this);
        }
    }
    unBindCommonEvent() {
        if (!isNullOrUndefined(this.inputWrapper) && this.targetElement()) {
            EventHandler.remove(this.targetElement(), 'blur', this.onBlurHandler);
        }
        const formElement = this.inputElement && closest(this.inputElement, 'form');
        if (formElement) {
            EventHandler.remove(formElement, 'reset', this.resetValueHandler);
        }
        if (!Browser.isDevice) {
            this.keyboardModule.destroy();
        }
        if (this.showClearButton) {
            EventHandler.remove(this.inputWrapper.clearButton, 'mousedown', this.resetHandler);
        }
    }
    updateIconState() {
        if (this.showClearButton) {
            if (this.inputElement.value !== '' && !this.readonly) {
                removeClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
            }
            else {
                addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
            }
        }
    }
    /**
     * Event binding for list
     *
     * @returns {void}
     */
    wireListEvents() {
        if (!isNullOrUndefined(this.list)) {
            EventHandler.add(this.list, 'click', this.onMouseClick, this);
            EventHandler.add(this.list, 'mouseover', this.onMouseOver, this);
            EventHandler.add(this.list, 'mouseout', this.onMouseLeave, this);
        }
    }
    onSearch(e) {
        if (e.charCode !== 32 && e.charCode !== 13) {
            if (this.list === undefined) {
                this.renderList();
            }
            this.searchKeyEvent = e;
            this.onServerIncrementalSearch(e);
        }
    }
    onServerIncrementalSearch(e) {
        if (!this.isRequested && !isNullOrUndefined(this.list) &&
            !isNullOrUndefined(this.list.querySelector('li')) && this.enabled && !this.readonly) {
            this.incrementalSearch(e);
        }
    }
    onMouseClick(e) {
        const target = e.target;
        const li = closest(target, '.' + dropDownBaseClasses.li);
        if (!this.isValidLI(li)) {
            return;
        }
        this.setSelection(li, e);
        if (Browser.isDevice && this.isFilterLayout()) {
            history.back();
        }
        else {
            const delay = 100;
            this.closePopup(delay, e);
        }
    }
    onMouseOver(e) {
        const currentLi = closest(e.target, '.' + dropDownBaseClasses.li);
        this.setHover(currentLi);
    }
    setHover(li) {
        if (this.enabled && this.isValidLI(li) && !li.classList.contains(dropDownBaseClasses.hover)) {
            this.removeHover();
            addClass([li], dropDownBaseClasses.hover);
        }
    }
    onMouseLeave() {
        this.removeHover();
    }
    removeHover() {
        if (this.list) {
            const hoveredItem = this.list.querySelectorAll('.' + dropDownBaseClasses.hover);
            if (hoveredItem && hoveredItem.length) {
                removeClass(hoveredItem, dropDownBaseClasses.hover);
            }
        }
    }
    isValidLI(li) {
        return (li && li.hasAttribute('role') && li.getAttribute('role') === 'option');
    }
    incrementalSearch(e) {
        if (this.liCollections.length > 0) {
            const li = incrementalSearch(e.charCode, this.liCollections, this.activeIndex, true, this.element.id);
            if (!isNullOrUndefined(li)) {
                this.setSelection(li, e);
                this.setScrollPosition();
            }
        }
    }
    /**
     * Hides the spinner loader.
     *
     * @returns {void}
     */
    hideSpinner() {
        if (!isNullOrUndefined(this.spinnerElement)) {
            hideSpinner(this.spinnerElement);
            removeClass([this.spinnerElement], dropDownListClasses.disableIcon);
            this.spinnerElement.innerHTML = '';
            this.spinnerElement = null;
        }
    }
    /**
     * Shows the spinner loader.
     *
     * @returns {void}
     */
    showSpinner() {
        if (isNullOrUndefined(this.spinnerElement)) {
            this.spinnerElement = Browser.isDevice && !isNullOrUndefined(this.filterInputObj) && this.filterInputObj.buttons[1] ||
                !isNullOrUndefined(this.filterInputObj) && this.filterInputObj.buttons[0] || this.inputWrapper.buttons[0];
            addClass([this.spinnerElement], dropDownListClasses.disableIcon);
            createSpinner({
                target: this.spinnerElement,
                width: Browser.isDevice ? '16px' : '14px'
            }, this.createElement);
            showSpinner(this.spinnerElement);
        }
    }
    keyActionHandler(e) {
        if (!this.enabled) {
            return;
        }
        const preventAction = e.action === 'pageUp' || e.action === 'pageDown';
        const preventHomeEnd = this.getModuleName() !== 'dropdownlist' && (e.action === 'home' || e.action === 'end');
        this.isEscapeKey = e.action === 'escape';
        this.isTabKey = !this.isPopupOpen && e.action === 'tab';
        const isNavigation = (e.action === 'down' || e.action === 'up' || e.action === 'pageUp' || e.action === 'pageDown'
            || e.action === 'home' || e.action === 'end');
        if ((this.isEditTextBox() || preventAction || preventHomeEnd) && !this.isPopupOpen) {
            return;
        }
        if (!this.readonly) {
            const isTabAction = e.action === 'tab' || e.action === 'close';
            if (isNullOrUndefined(this.list) && !this.isRequested && !isTabAction && e.action !== 'escape') {
                this.searchKeyEvent = e;
                this.renderList(e);
            }
            if (isNullOrUndefined(this.list) || (!isNullOrUndefined(this.liCollections) &&
                isNavigation && this.liCollections.length === 0) || this.isRequested) {
                return;
            }
            if ((isTabAction && this.getModuleName() !== 'autocomplete') && this.isPopupOpen
                || e.action === 'escape') {
                e.preventDefault();
            }
            this.isSelected = e.action === 'escape' ? false : this.isSelected;
            this.isTyped = (isNavigation || e.action === 'escape') ? false : this.isTyped;
            switch (e.action) {
                case 'down':
                case 'up':
                    this.updateUpDownAction(e);
                    break;
                case 'pageUp':
                    this.pageUpSelection(this.activeIndex - this.getPageCount(), e);
                    e.preventDefault();
                    break;
                case 'pageDown':
                    this.pageDownSelection(this.activeIndex + this.getPageCount(), e);
                    e.preventDefault();
                    break;
                case 'home':
                    this.updateHomeEndAction(e);
                    break;
                case 'end':
                    this.updateHomeEndAction(e);
                    break;
                case 'space':
                    if (this.getModuleName() === 'dropdownlist') {
                        if (!this.beforePopupOpen) {
                            this.showPopup();
                        }
                    }
                    break;
                case 'open':
                    this.showPopup(e);
                    break;
                case 'hide':
                    this.preventAltUp = this.isPopupOpen;
                    this.hidePopup(e);
                    this.focusDropDown(e);
                    break;
                case 'enter':
                    this.selectCurrentItem(e);
                    break;
                case 'tab':
                    this.selectCurrentValueOnTab(e);
                    break;
                case 'escape':
                case 'close':
                    if (this.isPopupOpen) {
                        this.hidePopup(e);
                        this.focusDropDown(e);
                    }
                    break;
            }
        }
    }
    updateUpDownAction(e) {
        const focusEle = this.list.querySelector('.' + dropDownListClasses.focus);
        if (this.isSelectFocusItem(focusEle)) {
            this.setSelection(focusEle, e);
        }
        else if (!isNullOrUndefined(this.liCollections)) {
            let index = e.action === 'down' ? this.activeIndex + 1 : this.activeIndex - 1;
            let startIndex = 0;
            if (this.getModuleName() === 'autocomplete') {
                startIndex = e.action === 'down' && isNullOrUndefined(this.activeIndex) ? 0 : this.liCollections.length - 1;
                index = index < 0 ? this.liCollections.length - 1 : index === this.liCollections.length ? 0 : index;
            }
            let nextItem;
            if (this.getModuleName() !== 'autocomplete' || this.getModuleName() === 'autocomplete' && this.isPopupOpen) {
                nextItem = isNullOrUndefined(this.activeIndex) ? this.liCollections[startIndex]
                    : this.liCollections[index];
            }
            if (!isNullOrUndefined(nextItem)) {
                this.setSelection(nextItem, e);
            }
        }
        e.preventDefault();
    }
    updateHomeEndAction(e) {
        if (this.getModuleName() === 'dropdownlist') {
            let findLi = 0;
            if (e.action === 'home') {
                findLi = 0;
            }
            else {
                findLi = this.getItems().length - 1;
            }
            e.preventDefault();
            if (this.activeIndex === findLi) {
                return;
            }
            this.setSelection(this.liCollections[findLi], e);
        }
    }
    selectCurrentValueOnTab(e) {
        if (this.getModuleName() === 'autocomplete') {
            this.selectCurrentItem(e);
        }
        else {
            if (this.isPopupOpen) {
                this.hidePopup(e);
                this.focusDropDown(e);
            }
        }
    }
    mobileKeyActionHandler(e) {
        if (!this.enabled) {
            return;
        }
        if ((this.isEditTextBox()) && !this.isPopupOpen) {
            return;
        }
        if (!this.readonly) {
            if (this.list === undefined && !this.isRequested) {
                this.searchKeyEvent = e;
                this.renderList();
            }
            if (isNullOrUndefined(this.list) || (!isNullOrUndefined(this.liCollections) &&
                this.liCollections.length === 0) || this.isRequested) {
                return;
            }
            if (e.action === 'enter') {
                this.selectCurrentItem(e);
            }
        }
    }
    selectCurrentItem(e) {
        if (this.isPopupOpen) {
            const li = this.list.querySelector('.' + dropDownListClasses.focus);
            if (li) {
                this.setSelection(li, e);
                this.isTyped = false;
            }
            if (this.isSelected) {
                this.isSelectCustom = false;
                this.onChangeEvent(e);
            }
            this.hidePopup(e);
            this.focusDropDown(e);
        }
        else {
            this.showPopup();
        }
    }
    isSelectFocusItem(element) {
        return !isNullOrUndefined(element);
    }
    getPageCount() {
        const liHeight = this.list.classList.contains(dropDownBaseClasses.noData) ? null :
            getComputedStyle(this.getItems()[0], null).getPropertyValue('height');
        return Math.round(this.list.getBoundingClientRect().height / parseInt(liHeight, 10));
    }
    pageUpSelection(steps, event) {
        const previousItem = steps >= 0 ? this.liCollections[steps + 1] : this.liCollections[0];
        this.setSelection(previousItem, event);
    }
    pageDownSelection(steps, event) {
        const list = this.getItems();
        const previousItem = steps <= list.length ? this.liCollections[steps - 1] : this.liCollections[list.length - 1];
        this.setSelection(previousItem, event);
    }
    unWireEvent() {
        if (!isNullOrUndefined(this.inputWrapper)) {
            EventHandler.remove(this.inputWrapper.container, 'mousedown', this.dropDownClick);
            EventHandler.remove(this.inputWrapper.container, 'keypress', this.onSearch);
            EventHandler.remove(this.inputWrapper.container, 'focus', this.focusIn);
        }
        this.unBindCommonEvent();
    }
    /**
     * Event un binding for list items.
     *
     * @returns {void}
     */
    unWireListEvents() {
        if (this.list) {
            EventHandler.remove(this.list, 'click', this.onMouseClick);
            EventHandler.remove(this.list, 'mouseover', this.onMouseOver);
            EventHandler.remove(this.list, 'mouseout', this.onMouseLeave);
        }
    }
    checkSelector(id) {
        return '[id="' + id.replace(/(:|\.|\[|\]|,|=|@|\\|\/|#)/g, '\\$1') + '"]';
    }
    onDocumentClick(e) {
        const target = e.target;
        if (!(!isNullOrUndefined(this.popupObj) && closest(target, this.checkSelector(this.popupObj.element.id))) &&
            !isNullOrUndefined(this.inputWrapper) && !this.inputWrapper.container.contains(e.target)) {
            if (this.inputWrapper.container.classList.contains(dropDownListClasses.inputFocus) || this.isPopupOpen) {
                this.isDocumentClick = true;
                const isActive = this.isRequested;
                this.isInteracted = false;
                this.hidePopup(e);
                if (!isActive) {
                    this.onFocusOut();
                    this.inputWrapper.container.classList.remove(dropDownListClasses.inputFocus);
                }
            }
        }
        else if (target !== this.inputElement && !(this.allowFiltering && target === this.filterInput)
            && !(this.getModuleName() === 'combobox' &&
                !this.allowFiltering && Browser.isDevice && target === this.inputWrapper.buttons[0])) {
            this.isPreventBlur = (Browser.isIE || Browser.info.name === 'edge') && (document.activeElement === this.targetElement() ||
                document.activeElement === this.filterInput);
            e.preventDefault();
        }
    }
    activeStateChange() {
        if (this.isDocumentClick) {
            this.hidePopup();
            this.onFocusOut();
            this.inputWrapper.container.classList.remove(dropDownListClasses.inputFocus);
        }
    }
    focusDropDown(e) {
        if (!this.initial && this.isFilterLayout()) {
            this.focusIn(e);
        }
    }
    dropDownClick(e) {
        if (e.which === 3 || e.button === 2) {
            return;
        }
        if (this.targetElement().classList.contains(dropDownListClasses.disable) || this.inputWrapper.clearButton === e.target) {
            return;
        }
        const target = e.target;
        if (target !== this.inputElement && !(this.allowFiltering && target === this.filterInput) && this.getModuleName() !== 'combobox') {
            e.preventDefault();
        }
        if (!this.readonly) {
            if (this.isPopupOpen) {
                this.hidePopup(e);
                if (this.isFilterLayout()) {
                    this.focusDropDown(e);
                }
            }
            else {
                this.focusIn(e);
                this.floatLabelChange();
                this.queryString = this.inputElement.value.trim() === '' ? null : this.inputElement.value;
                this.isDropDownClick = true;
                this.showPopup(e);
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const proxy = this;
            // eslint-disable-next-line max-len
            const duration = (this.element.tagName === this.getNgDirective() && this.itemTemplate) ? 500 : 100;
            if (!this.isSecondClick) {
                setTimeout(() => {
                    proxy.cloneElements();
                    proxy.isSecondClick = true;
                }, duration);
            }
        }
        else {
            this.focusIn(e);
        }
    }
    cloneElements() {
        if (this.list) {
            let ulElement = this.list.querySelector('ul');
            if (ulElement) {
                ulElement = ulElement.cloneNode ? ulElement.cloneNode(true) : ulElement;
                this.actionCompleteData.ulElement = ulElement;
            }
        }
    }
    updateSelectedItem(li, e, preventSelect, isSelection) {
        this.removeSelection();
        li.classList.add(dropDownBaseClasses.selected);
        this.removeHover();
        const value = li.getAttribute('data-value') !== "null" ? this.getFormattedValue(li.getAttribute('data-value')) : null;
        const selectedData = this.getDataByValue(value);
        if (!this.initial && !preventSelect && !isNullOrUndefined(e)) {
            const items = this.detachChanges(selectedData);
            this.isSelected = true;
            const eventArgs = {
                e: e,
                item: li,
                itemData: items,
                isInteracted: e ? true : false,
                cancel: false
            };
            this.trigger('select', eventArgs, (eventArgs) => {
                if (eventArgs.cancel) {
                    li.classList.remove(dropDownBaseClasses.selected);
                }
                else {
                    this.selectEventCallback(li, e, preventSelect, selectedData, value);
                    if (isSelection) {
                        this.setSelectOptions(li, e);
                    }
                }
            });
        }
        else {
            this.selectEventCallback(li, e, preventSelect, selectedData, value);
            if (isSelection) {
                this.setSelectOptions(li, e);
            }
        }
    }
    selectEventCallback(li, e, preventSelect, selectedData, value) {
        this.previousItemData = (!isNullOrUndefined(this.itemData)) ? this.itemData : null;
        if (this.itemData != selectedData) {
            this.previousValue = (!isNullOrUndefined(this.itemData)) ? typeof this.itemData == "object" ? this.checkFieldValue(this.itemData, this.fields.value.split('.')) : this.itemData : null;
        }
        this.item = li;
        this.itemData = selectedData;
        const focusedItem = this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (focusedItem) {
            removeClass([focusedItem], dropDownBaseClasses.focus);
        }
        li.setAttribute('aria-selected', 'true');
        this.activeIndex = this.getIndexByValue(value);
    }
    activeItem(li) {
        if (this.isValidLI(li) && !li.classList.contains(dropDownBaseClasses.selected)) {
            this.removeSelection();
            li.classList.add(dropDownBaseClasses.selected);
            this.removeHover();
            li.setAttribute('aria-selected', 'true');
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setValue(e) {
        const dataItem = this.getItemData();
        if (dataItem.value === null) {
            Input.setValue(null, this.inputElement, this.floatLabelType, this.showClearButton);
        }
        else {
            Input.setValue(dataItem.text, this.inputElement, this.floatLabelType, this.showClearButton);
        }
        if (this.valueTemplate && this.itemData !== null) {
            this.setValueTemplate();
        }
        else if (!isNullOrUndefined(this.valueTempElement) && this.inputElement.previousSibling === this.valueTempElement) {
            detach(this.valueTempElement);
            this.inputElement.style.display = 'block';
        }
        const clearIcon = dropDownListClasses.clearIcon;
        const isFilterElement = this.isFiltering() && this.filterInput && (this.getModuleName() === 'combobox');
        const clearElement = isFilterElement && this.filterInput.parentElement.querySelector('.' + clearIcon);
        if (this.isFiltering() && clearElement) {
            clearElement.style.removeProperty('visibility');
        }
        if (this.previousValue === dataItem.value) {
            this.isSelected = false;
            return true;
        }
        else {
            this.isSelected = !this.initial ? true : false;
            this.isSelectCustom = false;
            if (this.getModuleName() === 'dropdownlist') {
                this.updateIconState();
            }
            return false;
        }
    }
    setSelection(li, e) {
        if (this.isValidLI(li) && (!li.classList.contains(dropDownBaseClasses.selected) || (this.isPopupOpen && this.isSelected
            && li.classList.contains(dropDownBaseClasses.selected)))) {
            this.updateSelectedItem(li, e, false, true);
        }
        else {
            this.setSelectOptions(li, e);
        }
    }
    setSelectOptions(li, e) {
        if (this.list) {
            this.removeHover();
        }
        this.previousSelectedLI = (!isNullOrUndefined(this.selectedLI)) ? this.selectedLI : null;
        this.selectedLI = li;
        if (this.setValue(e)) {
            return;
        }
        if ((!this.isPopupOpen && !isNullOrUndefined(li)) || (this.isPopupOpen && !isNullOrUndefined(e) &&
            (e.type !== 'keydown' || e.type === 'keydown' && e.action === 'enter'))) {
            this.isSelectCustom = false;
            this.onChangeEvent(e);
        }
        if (this.isPopupOpen && !isNullOrUndefined(this.selectedLI) && this.itemData !== null && (!e || e.type !== 'click')) {
            this.setScrollPosition(e);
        }
        if (Browser.info.name !== 'mozilla') {
            if (this.targetElement()) {
                attributes(this.targetElement(), { 'aria-describedby': this.inputElement.id !== '' ? this.inputElement.id : this.element.id });
                this.targetElement().removeAttribute('aria-live');
            }
        }
        if (this.isPopupOpen && !isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
            attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
        }
        else if (this.isPopupOpen && !isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
            attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
        }
    }
    dropdownCompiler(dropdownTemplate) {
        let checkTemplate = false;
        if (typeof dropdownTemplate !== 'function' && dropdownTemplate) {
            try {
                checkTemplate = (document.querySelectorAll(dropdownTemplate).length) ? true : false;
            }
            catch (exception) {
                checkTemplate = false;
            }
        }
        return checkTemplate;
    }
    setValueTemplate() {
        let compiledString;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate(['valueTemplate']);
            if (this.valueTempElement) {
                detach(this.valueTempElement);
                this.inputElement.style.display = 'block';
                this.valueTempElement = null;
            }
        }
        if (!this.valueTempElement) {
            this.valueTempElement = this.createElement('span', { className: dropDownListClasses.value });
            this.inputElement.parentElement.insertBefore(this.valueTempElement, this.inputElement);
            this.inputElement.style.display = 'none';
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            this.valueTempElement.innerHTML = '';
        }
        const valuecheck = this.dropdownCompiler(this.valueTemplate);
        if (typeof this.valueTemplate !== 'function' && valuecheck) {
            compiledString = compile(document.querySelector(this.valueTemplate).innerHTML.trim());
        }
        else {
            compiledString = compile(this.valueTemplate);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueCompTemp = compiledString(this.itemData, this, 'valueTemplate', this.valueTemplateId, this.isStringTemplate, null, this.valueTempElement);
        if (valueCompTemp && valueCompTemp.length > 0) {
            append(valueCompTemp, this.valueTempElement);
        }
        this.renderReactTemplates();
    }
    removeSelection() {
        if (this.list) {
            const selectedItems = this.list.querySelectorAll('.' + dropDownBaseClasses.selected);
            if (selectedItems.length) {
                removeClass(selectedItems, dropDownBaseClasses.selected);
                selectedItems[0].removeAttribute('aria-selected');
            }
        }
    }
    getItemData() {
        const fields = this.fields;
        let dataItem = null;
        dataItem = this.itemData;
        let dataValue;
        let dataText;
        if (!isNullOrUndefined(dataItem)) {
            dataValue = getValue(fields.value, dataItem);
            dataText = getValue(fields.text, dataItem);
        }
        const value = (!isNullOrUndefined(dataItem) &&
            !isUndefined(dataValue) ? dataValue : dataItem);
        const text = (!isNullOrUndefined(dataItem) &&
            !isUndefined(dataValue) ? dataText : dataItem);
        return { value: value, text: text };
    }
    /**
     * To trigger the change event for list.
     *
     * @param {MouseEvent | KeyboardEvent | TouchEvent} eve - Specifies the event arguments.
     * @returns {void}
     */
    onChangeEvent(eve) {
        const dataItem = this.getItemData();
        const index = this.isSelectCustom ? null : this.activeIndex;
        this.setProperties({ 'index': index, 'text': dataItem.text, 'value': dataItem.value }, true);
        this.detachChangeEvent(eve);
    }
    detachChanges(value) {
        let items;
        if (typeof value === 'string' ||
            typeof value === 'boolean' ||
            typeof value === 'number') {
            items = Object.defineProperties({}, {
                value: {
                    value: value,
                    enumerable: true
                },
                text: {
                    value: value,
                    enumerable: true
                }
            });
        }
        else {
            items = value;
        }
        return items;
    }
    detachChangeEvent(eve) {
        this.isSelected = false;
        this.previousValue = this.value;
        this.activeIndex = this.index;
        this.typedString = !isNullOrUndefined(this.text) ? this.text : '';
        if (!this.initial) {
            const items = this.detachChanges(this.itemData);
            let preItems;
            if (typeof this.previousItemData === 'string' ||
                typeof this.previousItemData === 'boolean' ||
                typeof this.previousItemData === 'number') {
                preItems = Object.defineProperties({}, {
                    value: {
                        value: this.previousItemData,
                        enumerable: true
                    },
                    text: {
                        value: this.previousItemData,
                        enumerable: true
                    }
                });
            }
            else {
                preItems = this.previousItemData;
            }
            this.setHiddenValue();
            const eventArgs = {
                e: eve,
                item: this.item,
                itemData: items,
                previousItem: this.previousSelectedLI,
                previousItemData: preItems,
                isInteracted: eve ? true : false,
                value: this.value,
                element: this.element,
                event: eve
            };
            if (this.isAngular && this.preventChange) {
                this.preventChange = false;
            }
            else {
                this.trigger('change', eventArgs);
            }
        }
        if ((isNullOrUndefined(this.value) || this.value === '') && this.floatLabelType !== 'Always') {
            removeClass([this.inputWrapper.container], 'e-valid-input');
        }
    }
    setHiddenValue() {
        if (!isNullOrUndefined(this.value)) {
            if (this.hiddenElement.querySelector('option')) {
                const selectedElement = this.hiddenElement.querySelector('option');
                selectedElement.textContent = this.text;
                selectedElement.setAttribute('value', this.value.toString());
            }
            else {
                if (!isNullOrUndefined(this.hiddenElement)) {
                    this.hiddenElement.innerHTML = '<option selected>' + this.text + '</option>';
                    const selectedElement = this.hiddenElement.querySelector('option');
                    selectedElement.setAttribute('value', this.value.toString());
                }
            }
        }
        else {
            this.hiddenElement.innerHTML = '';
        }
    }
    /**
     * Filter bar implementation
     *
     * @param {KeyboardEventArgs} e - Specifies the event arguments.
     * @returns {void}
     */
    onFilterUp(e) {
        if (!(e.ctrlKey && e.keyCode === 86) && (this.isValidKey || e.keyCode === 40 || e.keyCode === 38)) {
            this.isValidKey = false;
            switch (e.keyCode) {
                case 38: //up arrow
                case 40: //down arrow
                    if (this.getModuleName() === 'autocomplete' && !this.isPopupOpen && !this.preventAltUp && !this.isRequested) {
                        this.preventAutoFill = true;
                        this.searchLists(e);
                    }
                    else {
                        this.preventAutoFill = false;
                    }
                    this.preventAltUp = false;
                    if (this.getModuleName() === 'autocomplete' && !isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                        attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
                    }
                    e.preventDefault();
                    break;
                case 46: //delete
                case 8: //backspace
                    this.typedString = this.filterInput.value;
                    if (!this.isPopupOpen && this.typedString !== '' || this.isPopupOpen && this.queryString.length > 0) {
                        this.preventAutoFill = true;
                        this.searchLists(e);
                    }
                    else if (this.typedString === '' && this.queryString === '' && this.getModuleName() !== 'autocomplete') {
                        this.preventAutoFill = true;
                        this.searchLists(e);
                    }
                    else if (this.typedString === '') {
                        if (this.list) {
                            this.resetFocusElement();
                        }
                        this.activeIndex = null;
                        if (this.getModuleName() !== 'dropdownlist') {
                            this.preventAutoFill = true;
                            this.searchLists(e);
                            if (this.getModuleName() === 'autocomplete') {
                                this.hidePopup();
                            }
                        }
                    }
                    e.preventDefault();
                    break;
                default:
                    this.typedString = this.filterInput.value;
                    this.preventAutoFill = false;
                    this.searchLists(e);
                    break;
            }
        }
        else {
            this.isValidKey = false;
        }
    }
    onFilterDown(e) {
        switch (e.keyCode) {
            case 13: //enter
                break;
            case 40: //down arrow
            case 38: //up arrow
                this.queryString = this.filterInput.value;
                e.preventDefault();
                break;
            case 9: //tab
                if (this.isPopupOpen && this.getModuleName() !== 'autocomplete') {
                    e.preventDefault();
                }
                break;
            default:
                this.prevSelectPoints = this.getSelectionPoints();
                this.queryString = this.filterInput.value;
                break;
        }
    }
    removeFillSelection() {
        if (this.isInteracted) {
            const selection = this.getSelectionPoints();
            this.inputElement.setSelectionRange(selection.end, selection.end);
        }
    }
    getQuery(query) {
        let filterQuery;
        if (!this.isCustomFilter && this.allowFiltering && this.filterInput) {
            filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
            const filterType = this.typedString === '' ? 'contains' : this.filterType;
            const dataType = this.typeOfData(this.dataSource).typeof;
            if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                filterQuery.where('', filterType, this.typedString, this.ignoreCase, this.ignoreAccent);
            }
            else {
                const fields = (this.fields.text) ? this.fields.text : '';
                filterQuery.where(fields, filterType, this.typedString, this.ignoreCase, this.ignoreAccent);
            }
        }
        else {
            filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
        }
        return filterQuery;
    }
    getSelectionPoints() {
        const input = this.inputElement;
        return { start: Math.abs(input.selectionStart), end: Math.abs(input.selectionEnd) };
    }
    searchLists(e) {
        this.isTyped = true;
        this.activeIndex = null;
        this.isListSearched = true;
        if (this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon)) {
            const clearElement = this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon);
            clearElement.style.visibility = this.filterInput.value === '' ? 'hidden' : 'visible';
        }
        this.isDataFetched = false;
        if (this.isFiltering()) {
            const eventArgs = {
                preventDefaultAction: false,
                text: this.filterInput.value,
                updateData: (dataSource, query, fields) => {
                    if (eventArgs.cancel) {
                        return;
                    }
                    this.isCustomFilter = true;
                    this.filteringAction(dataSource, query, fields);
                },
                baseEventArgs: e,
                cancel: false
            };
            this.trigger('filtering', eventArgs, (eventArgs) => {
                if (!eventArgs.cancel && !this.isCustomFilter && !eventArgs.preventDefaultAction) {
                    this.filteringAction(this.dataSource, null, this.fields);
                }
            });
        }
    }
    /**
     * To filter the data from given data source by using query
     *
     * @param {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param {Query} query - Specify the query to filter the data.
     * @param {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}
     * @deprecated
     */
    filter(dataSource, query, fields) {
        this.isCustomFilter = true;
        this.filteringAction(dataSource, query, fields);
    }
    filteringAction(dataSource, query, fields) {
        if (!isNullOrUndefined(this.filterInput)) {
            this.beforePopupOpen = (!this.isPopupOpen && this.getModuleName() === 'combobox' && this.filterInput.value === '') ?
                false : true;
            if (this.filterInput.value.trim() === '' && !this.itemTemplate) {
                this.actionCompleteData.isUpdated = false;
                this.isTyped = false;
                if (!isNullOrUndefined(this.actionCompleteData.ulElement) && !isNullOrUndefined(this.actionCompleteData.list)) {
                    this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list);
                }
                this.isTyped = true;
                if (!isNullOrUndefined(this.itemData) && this.getModuleName() === 'dropdownlist') {
                    this.focusIndexItem();
                    this.setScrollPosition();
                }
                this.isNotSearchList = true;
            }
            else {
                this.isNotSearchList = false;
                query = (this.filterInput.value.trim() === '') ? null : query;
                this.resetList(dataSource, fields, query);
            }
            this.renderReactTemplates();
        }
    }
    setSearchBox(popupElement) {
        if (this.isFiltering()) {
            const parentElement = popupElement.querySelector('.' + dropDownListClasses.filterParent) ?
                popupElement.querySelector('.' + dropDownListClasses.filterParent) : this.createElement('span', {
                className: dropDownListClasses.filterParent
            });
            this.filterInput = this.createElement('input', {
                attrs: { type: 'text' },
                className: dropDownListClasses.filterInput
            });
            this.element.parentNode.insertBefore(this.filterInput, this.element);
            let backIcon = false;
            if (Browser.isDevice) {
                backIcon = true;
            }
            this.filterInputObj = Input.createInput({
                element: this.filterInput,
                buttons: backIcon ?
                    [dropDownListClasses.backIcon, dropDownListClasses.filterBarClearIcon] : [dropDownListClasses.filterBarClearIcon],
                properties: { placeholder: this.filterBarPlaceholder }
            }, this.createElement);
            if (!isNullOrUndefined(this.cssClass)) {
                if (this.cssClass.split(' ').indexOf('e-outline') !== -1) {
                    addClass([this.filterInputObj.container], 'e-outline');
                }
                else if (this.cssClass.split(' ').indexOf('e-filled') !== -1) {
                    addClass([this.filterInputObj.container], 'e-filled');
                }
            }
            append([this.filterInputObj.container], parentElement);
            prepend([parentElement], popupElement);
            attributes(this.filterInput, {
                'aria-disabled': 'false',
                'role': 'combobox',
                'autocomplete': 'off',
                'autocapitalize': 'off',
                'spellcheck': 'false'
            });
            this.clearIconElement = this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon);
            if (!Browser.isDevice && this.clearIconElement) {
                EventHandler.add(this.clearIconElement, 'click', this.clearText, this);
                this.clearIconElement.style.visibility = 'hidden';
            }
            if (!Browser.isDevice) {
                this.searchKeyModule = new KeyboardEvents(this.filterInput, {
                    keyAction: this.keyActionHandler.bind(this),
                    keyConfigs: this.keyConfigure,
                    eventName: 'keydown'
                });
            }
            else {
                this.searchKeyModule = new KeyboardEvents(this.filterInput, {
                    keyAction: this.mobileKeyActionHandler.bind(this),
                    keyConfigs: this.keyConfigure,
                    eventName: 'keydown'
                });
            }
            EventHandler.add(this.filterInput, 'input', this.onInput, this);
            EventHandler.add(this.filterInput, 'keyup', this.onFilterUp, this);
            EventHandler.add(this.filterInput, 'keydown', this.onFilterDown, this);
            EventHandler.add(this.filterInput, 'blur', this.onBlurHandler, this);
            EventHandler.add(this.filterInput, 'paste', this.pasteHandler, this);
            return this.filterInputObj;
        }
        else {
            return inputObject;
        }
    }
    onInput(e) {
        this.isValidKey = true;
        if (this.getModuleName() === 'combobox') {
            this.updateIconState();
        }
        // For filtering works in mobile firefox.
        if (Browser.isDevice && Browser.info.name === 'mozilla') {
            this.typedString = this.filterInput.value;
            this.preventAutoFill = true;
            this.searchLists(e);
        }
    }
    pasteHandler(e) {
        setTimeout(() => {
            this.typedString = this.filterInput.value;
            this.searchLists(e);
        });
    }
    onActionFailure(e) {
        super.onActionFailure(e);
        if (this.beforePopupOpen) {
            this.renderPopup();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onActionComplete(ulElement, list, e, isUpdated) {
        if (this.isNotSearchList) {
            this.isNotSearchList = false;
            return;
        }
        if (this.isActive) {
            const selectedItem = this.selectedLI ? this.selectedLI.cloneNode(true) : null;
            super.onActionComplete(ulElement, list, e);
            this.updateSelectElementData(this.allowFiltering);
            if (this.isRequested && !isNullOrUndefined(this.searchKeyEvent) && this.searchKeyEvent.type === 'keydown') {
                this.isRequested = false;
                this.keyActionHandler(this.searchKeyEvent);
                this.searchKeyEvent = null;
            }
            if (this.isRequested && !isNullOrUndefined(this.searchKeyEvent)) {
                this.incrementalSearch(this.searchKeyEvent);
                this.searchKeyEvent = null;
            }
            this.list.scrollTop = 0;
            if (!isNullOrUndefined(ulElement)) {
                attributes(ulElement, { 'id': this.element.id + '_options', 'role': 'listbox', 'aria-hidden': 'false' });
            }
            if (this.initRemoteRender) {
                this.initial = true;
                this.activeIndex = this.index;
                this.initRemoteRender = false;
                if (this.value && this.dataSource instanceof DataManager) {
                    const checkField = isNullOrUndefined(this.fields.value) ? this.fields.text : this.fields.value;
                    const fieldValue = this.fields.value.split('.');
                    const checkVal = list.some((x) => isNullOrUndefined(x[checkField]) && fieldValue.length > 1 ?
                        this.checkFieldValue(x, fieldValue) === this.value : x[checkField] === this.value);
                    if (!checkVal) {
                        this.dataSource.executeQuery(this.getQuery(this.query).where(new Predicate(checkField, 'equal', this.value)))
                            .then((e) => {
                            if (e.result.length > 0) {
                                this.addItem(e.result, list.length);
                                this.updateValues();
                            }
                            else {
                                this.updateValues();
                            }
                        });
                    }
                    else {
                        this.updateValues();
                    }
                }
                else {
                    this.updateValues();
                }
                this.initial = false;
            }
            else if (this.getModuleName() === 'autocomplete' && this.value) {
                this.setInputValue();
            }
            if (this.getModuleName() !== 'autocomplete' && this.isFiltering() && !this.isTyped) {
                if (!this.actionCompleteData.isUpdated || ((!this.isCustomFilter
                    && !this.isFilterFocus) || (isNullOrUndefined(this.itemData) && this.allowFiltering)
                    && ((this.dataSource instanceof DataManager)
                        || (!isNullOrUndefined(this.dataSource) && !isNullOrUndefined(this.dataSource.length) &&
                            this.dataSource.length !== 0)))) {
                    if (this.itemTemplate && this.element.tagName === 'EJS-COMBOBOX' && this.allowFiltering) {
                        setTimeout(() => {
                            this.updateActionCompleteDataValues(ulElement, list);
                        }, 0);
                    }
                    else {
                        this.updateActionCompleteDataValues(ulElement, list);
                    }
                }
                this.addNewItem(list, selectedItem);
                if (!isNullOrUndefined(this.itemData)) {
                    this.focusIndexItem();
                }
            }
            if (this.beforePopupOpen) {
                this.renderPopup(e);
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkFieldValue(list, fieldValue) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let checkField = list;
        fieldValue.forEach((value) => {
            checkField = checkField[value];
        });
        return checkField;
    }
    updateActionCompleteDataValues(ulElement, list) {
        this.actionCompleteData = { ulElement: ulElement.cloneNode(true), list: list, isUpdated: true };
        if (this.actionData.list !== this.actionCompleteData.list && this.actionCompleteData.ulElement && this.actionCompleteData.list) {
            this.actionData = this.actionCompleteData;
        }
    }
    addNewItem(listData, newElement) {
        if (!isNullOrUndefined(this.itemData) && !isNullOrUndefined(newElement)) {
            const value = this.getItemData().value;
            const isExist = listData.some((data) => {
                return (((typeof data === 'string' || typeof data === 'number') && data === value) ||
                    (getValue(this.fields.value, data) === value));
            });
            if (!isExist) {
                this.addItem(this.itemData);
            }
        }
    }
    updateActionCompleteData(li, item, index) {
        if (this.getModuleName() !== 'autocomplete' && this.actionCompleteData.ulElement) {
            if (this.itemTemplate && this.element.tagName === 'EJS-COMBOBOX' && this.allowFiltering) {
                setTimeout(() => {
                    this.actionCompleteDataUpdate(li, item, index);
                }, 0);
            }
            else {
                this.actionCompleteDataUpdate(li, item, index);
            }
        }
    }
    actionCompleteDataUpdate(li, item, index) {
        if (index !== null) {
            this.actionCompleteData.ulElement.
                insertBefore(li.cloneNode(true), this.actionCompleteData.ulElement.childNodes[index]);
        }
        else {
            this.actionCompleteData.ulElement.appendChild(li.cloneNode(true));
        }
        if (this.isFiltering() && this.actionCompleteData.list.indexOf(item) < 0) {
            this.actionCompleteData.list.push(item);
        }
    }
    focusIndexItem() {
        const value = this.getItemData().value;
        this.activeIndex = this.getIndexByValue(value);
        const element = this.findListElement(this.list, 'li', 'data-value', value);
        this.selectedLI = element;
        this.activeItem(element);
        this.removeFocus();
    }
    updateSelection() {
        const selectedItem = this.list.querySelector('.' + dropDownBaseClasses.selected);
        if (selectedItem) {
            this.setProperties({ 'index': this.getIndexByValue(selectedItem.getAttribute('data-value')) });
            this.activeIndex = this.index;
        }
        else {
            this.removeFocus();
            this.list.querySelector('.' + dropDownBaseClasses.li).classList.add(dropDownListClasses.focus);
        }
    }
    removeFocus() {
        const highlightedItem = this.list.querySelectorAll('.' + dropDownListClasses.focus);
        if (highlightedItem && highlightedItem.length) {
            removeClass(highlightedItem, dropDownListClasses.focus);
        }
    }
    renderPopup(e) {
        if (this.popupObj && document.body.contains(this.popupObj.element)) {
            this.refreshPopup();
            return;
        }
        const args = { cancel: false };
        this.trigger('beforeOpen', args, (args) => {
            if (!args.cancel) {
                const popupEle = this.createElement('div', {
                    id: this.element.id + '_popup', className: 'e-ddl e-popup ' + (this.cssClass !== null ? this.cssClass : '')
                });
                const searchBox = this.setSearchBox(popupEle);
                this.listHeight = formatUnit(this.popupHeight);
                if (this.headerTemplate) {
                    this.setHeaderTemplate(popupEle);
                }
                append([this.list], popupEle);
                if (this.footerTemplate) {
                    this.setFooterTemplate(popupEle);
                }
                document.body.appendChild(popupEle);
                popupEle.style.visibility = 'hidden';
                if (this.popupHeight !== 'auto') {
                    this.searchBoxHeight = 0;
                    if (!isNullOrUndefined(searchBox.container)) {
                        this.searchBoxHeight = (searchBox.container.parentElement).getBoundingClientRect().height;
                        this.listHeight = (parseInt(this.listHeight, 10) - (this.searchBoxHeight)).toString() + 'px';
                    }
                    if (this.headerTemplate) {
                        this.header = this.header ? this.header : popupEle.querySelector('.e-ddl-header');
                        const height = Math.round(this.header.getBoundingClientRect().height);
                        this.listHeight = (parseInt(this.listHeight, 10) - (height + this.searchBoxHeight)).toString() + 'px';
                    }
                    if (this.footerTemplate) {
                        this.footer = this.footer ? this.footer : popupEle.querySelector('.e-ddl-footer');
                        const height = Math.round(this.footer.getBoundingClientRect().height);
                        this.listHeight = (parseInt(this.listHeight, 10) - (height + this.searchBoxHeight)).toString() + 'px';
                    }
                    this.list.style.maxHeight = (parseInt(this.listHeight, 10) - 2).toString() + 'px'; // due to box-sizing property
                    popupEle.style.maxHeight = formatUnit(this.popupHeight);
                }
                else {
                    popupEle.style.height = 'auto';
                }
                let offsetValue = 0;
                let left;
                if (!isNullOrUndefined(this.selectedLI) && (!isNullOrUndefined(this.activeIndex) && this.activeIndex >= 0)) {
                    this.setScrollPosition();
                }
                else {
                    this.list.scrollTop = 0;
                }
                if (Browser.isDevice && (!this.allowFiltering && (this.getModuleName() === 'dropdownlist' ||
                    (this.isDropDownClick && this.getModuleName() === 'combobox')))) {
                    offsetValue = this.getOffsetValue(popupEle);
                    const firstItem = this.isEmptyList() ? this.list : this.liCollections[0];
                    if (!isNullOrUndefined(this.inputElement)) {
                        left = -(parseInt(getComputedStyle(firstItem).textIndent, 10) -
                            parseInt(getComputedStyle(this.inputElement).paddingLeft, 10) +
                            parseInt(getComputedStyle(this.inputElement.parentElement).borderLeftWidth, 10));
                    }
                }
                this.getFocusElement();
                this.createPopup(popupEle, offsetValue, left);
                this.checkCollision(popupEle);
                if (Browser.isDevice) {
                    this.popupObj.element.classList.add(dropDownListClasses.device);
                    if (this.getModuleName() === 'dropdownlist' || (this.getModuleName() === 'combobox'
                        && !this.allowFiltering && this.isDropDownClick)) {
                        this.popupObj.collision = { X: 'fit', Y: 'fit' };
                    }
                    if (this.isFilterLayout()) {
                        this.popupObj.element.classList.add(dropDownListClasses.mobileFilter);
                        this.popupObj.position = { X: 0, Y: 0 };
                        this.popupObj.dataBind();
                        attributes(this.popupObj.element, { style: 'left:0px;right:0px;top:0px;bottom:0px;' });
                        addClass([document.body, this.popupObj.element], dropDownListClasses.popupFullScreen);
                        this.setSearchBoxPosition();
                        this.backIconElement = searchBox.container.querySelector('.e-back-icon');
                        this.clearIconElement = searchBox.container.querySelector('.' + dropDownListClasses.clearIcon);
                        EventHandler.add(this.backIconElement, 'click', this.clickOnBackIcon, this);
                        EventHandler.add(this.clearIconElement, 'click', this.clearText, this);
                    }
                }
                popupEle.style.visibility = 'visible';
                addClass([popupEle], 'e-popup-close');
                const scrollParentElements = this.popupObj.getScrollableParent(this.inputWrapper.container);
                for (const element of scrollParentElements) {
                    EventHandler.add(element, 'scroll', this.scrollHandler, this);
                }
                if (!isNullOrUndefined(this.list)) {
                    this.unWireListEvents();
                    this.wireListEvents();
                }
                this.selectedElementID = this.selectedLI ? this.selectedLI.id : null;
                attributes(this.targetElement(), { 'aria-expanded': 'true', 'aria-owns': this.inputElement.id + '_options' });
                this.inputElement.setAttribute('aria-expanded', 'true');
                const inputParent = this.isFiltering() ? this.filterInput.parentElement : this.inputWrapper.container;
                addClass([inputParent], [dropDownListClasses.inputFocus]);
                const animModel = { name: 'FadeIn', duration: 100 };
                this.beforePopupOpen = true;
                const popupInstance = this.popupObj;
                const eventArgs = { popup: popupInstance, event: e, cancel: false, animation: animModel };
                this.trigger('open', eventArgs, (eventArgs) => {
                    if (!eventArgs.cancel) {
                        if (!isNullOrUndefined(this.inputWrapper)) {
                            addClass([this.inputWrapper.container], [dropDownListClasses.iconAnimation]);
                        }
                        this.renderReactTemplates();
                        if (!isNullOrUndefined(this.popupObj)) {
                            this.popupObj.show(new Animation(eventArgs.animation), (this.zIndex === 1000) ? this.element : null);
                        }
                    }
                    else {
                        this.beforePopupOpen = false;
                        this.destroyPopup();
                    }
                });
            }
            else {
                this.beforePopupOpen = false;
            }
        });
    }
    checkCollision(popupEle) {
        if (!Browser.isDevice || (Browser.isDevice && !(this.getModuleName() === 'dropdownlist' || this.isDropDownClick))) {
            const collision = isCollide(popupEle);
            if (collision.length > 0) {
                popupEle.style.marginTop = -parseInt(getComputedStyle(popupEle).marginTop, 10) + 'px';
            }
            this.popupObj.resolveCollision();
        }
    }
    getOffsetValue(popupEle) {
        const popupStyles = getComputedStyle(popupEle);
        const borderTop = parseInt(popupStyles.borderTopWidth, 10);
        const borderBottom = parseInt(popupStyles.borderBottomWidth, 10);
        return this.setPopupPosition(borderTop + borderBottom);
    }
    createPopup(element, offsetValue, left) {
        this.popupObj = new Popup(element, {
            width: this.setWidth(), targetType: 'relative',
            relateTo: this.inputWrapper.container, collision: { X: 'flip', Y: 'flip' }, offsetY: offsetValue,
            enableRtl: this.enableRtl, offsetX: left, position: { X: 'left', Y: 'bottom' },
            zIndex: this.zIndex,
            close: () => {
                if (!this.isDocumentClick) {
                    this.focusDropDown();
                }
                // eslint-disable-next-line
                if (this.isReact) {
                    this.clearTemplate(['headerTemplate', 'footerTemplate']);
                }
                this.isNotSearchList = false;
                this.isDocumentClick = false;
                this.destroyPopup();
                if (this.isFiltering() && this.actionCompleteData.list && this.actionCompleteData.list[0]) {
                    this.isActive = true;
                    this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list, null, true);
                }
            },
            open: () => {
                EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
                this.isPopupOpen = true;
                const actionList = this.actionCompleteData && this.actionCompleteData.ulElement &&
                    this.actionCompleteData.ulElement.querySelector('li');
                const ulElement = this.list.querySelector('ul li');
                if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                    attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
                }
                else if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
                    attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
                }
                if (this.isFiltering() && this.itemTemplate && (this.element.tagName === this.getNgDirective()) &&
                    (actionList && ulElement && actionList.textContent !== ulElement.textContent) &&
                    this.element.tagName !== 'EJS-COMBOBOX') {
                    this.cloneElements();
                }
                if (this.isFilterLayout()) {
                    removeClass([this.inputWrapper.container], [dropDownListClasses.inputFocus]);
                    this.isFilterFocus = true;
                    this.filterInput.focus();
                    if (this.inputWrapper.clearButton) {
                        addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
                    }
                }
                this.activeStateChange();
            },
            targetExitViewport: () => {
                if (!Browser.isDevice) {
                    this.hidePopup();
                }
            }
        });
    }
    isEmptyList() {
        return !isNullOrUndefined(this.liCollections) && this.liCollections.length === 0;
    }
    getFocusElement() {
        // combo-box used this method
    }
    isFilterLayout() {
        return this.getModuleName() === 'dropdownlist' && this.allowFiltering;
    }
    scrollHandler() {
        if (Browser.isDevice && ((this.getModuleName() === 'dropdownlist' &&
            !this.isFilterLayout()) || (this.getModuleName() === 'combobox' && !this.allowFiltering && this.isDropDownClick))) {
            this.hidePopup();
        }
    }
    setSearchBoxPosition() {
        const searchBoxHeight = this.filterInput.parentElement.getBoundingClientRect().height;
        this.popupObj.element.style.maxHeight = '100%';
        this.popupObj.element.style.width = '100%';
        this.list.style.maxHeight = (window.innerHeight - searchBoxHeight) + 'px';
        this.list.style.height = (window.innerHeight - searchBoxHeight) + 'px';
        const clearElement = this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon);
        detach(this.filterInput);
        clearElement.parentElement.insertBefore(this.filterInput, clearElement);
    }
    setPopupPosition(border) {
        let offsetValue;
        const popupOffset = border;
        const selectedLI = this.list.querySelector('.' + dropDownListClasses.focus) || this.selectedLI;
        const firstItem = this.isEmptyList() ? this.list : this.liCollections[0];
        const lastItem = this.isEmptyList() ? this.list : this.liCollections[this.getItems().length - 1];
        const liHeight = firstItem.getBoundingClientRect().height;
        const listHeight = this.list.offsetHeight / 2;
        const height = isNullOrUndefined(selectedLI) ? firstItem.offsetTop : selectedLI.offsetTop;
        const lastItemOffsetValue = lastItem.offsetTop;
        if (lastItemOffsetValue - listHeight < height && !isNullOrUndefined(this.liCollections) &&
            this.liCollections.length > 0 && !isNullOrUndefined(selectedLI)) {
            const count = this.list.offsetHeight / liHeight;
            const paddingBottom = parseInt(getComputedStyle(this.list).paddingBottom, 10);
            offsetValue = (count - (this.liCollections.length - this.activeIndex)) * liHeight - popupOffset + paddingBottom;
            this.list.scrollTop = selectedLI.offsetTop;
        }
        else if (height > listHeight) {
            offsetValue = listHeight - liHeight / 2;
            this.list.scrollTop = height - listHeight + liHeight / 2;
        }
        else {
            offsetValue = height;
        }
        const inputHeight = this.inputWrapper.container.offsetHeight;
        offsetValue = offsetValue + liHeight + popupOffset - ((liHeight - inputHeight) / 2);
        return -offsetValue;
    }
    setWidth() {
        let width = formatUnit(this.popupWidth);
        if (width.indexOf('%') > -1) {
            const inputWidth = this.inputWrapper.container.offsetWidth * parseFloat(width) / 100;
            width = inputWidth.toString() + 'px';
        }
        if (Browser.isDevice && (!this.allowFiltering && (this.getModuleName() === 'dropdownlist' ||
            (this.isDropDownClick && this.getModuleName() === 'combobox')))) {
            const firstItem = this.isEmptyList() ? this.list : this.liCollections[0];
            width = (parseInt(width, 10) + (parseInt(getComputedStyle(firstItem).textIndent, 10) -
                parseInt(getComputedStyle(this.inputElement).paddingLeft, 10) +
                parseInt(getComputedStyle(this.inputElement.parentElement).borderLeftWidth, 10)) * 2) + 'px';
        }
        return width;
    }
    scrollBottom(isInitial) {
        if (!isNullOrUndefined(this.selectedLI)) {
            const currentOffset = this.list.offsetHeight;
            const nextBottom = this.selectedLI.offsetTop + this.selectedLI.offsetHeight - this.list.scrollTop;
            let nextOffset = this.list.scrollTop + nextBottom - currentOffset;
            nextOffset = isInitial ? nextOffset + parseInt(getComputedStyle(this.list).paddingTop, 10) * 2 : nextOffset;
            let boxRange = this.selectedLI.offsetTop + this.selectedLI.offsetHeight - this.list.scrollTop;
            boxRange = this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                boxRange - this.fixedHeaderElement.offsetHeight : boxRange;
            if (this.activeIndex === 0) {
                this.list.scrollTop = 0;
            }
            else if (nextBottom > currentOffset || !(boxRange > 0 && this.list.offsetHeight > boxRange)) {
                this.list.scrollTop = nextOffset;
            }
        }
    }
    scrollTop() {
        if (!isNullOrUndefined(this.selectedLI)) {
            let nextOffset = this.selectedLI.offsetTop - this.list.scrollTop;
            nextOffset = this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                nextOffset - this.fixedHeaderElement.offsetHeight : nextOffset;
            const boxRange = (this.selectedLI.offsetTop + this.selectedLI.offsetHeight - this.list.scrollTop);
            if (this.activeIndex === 0) {
                this.list.scrollTop = 0;
            }
            else if (nextOffset < 0) {
                this.list.scrollTop = this.list.scrollTop + nextOffset;
            }
            else if (!(boxRange > 0 && this.list.offsetHeight > boxRange)) {
                this.list.scrollTop = this.selectedLI.offsetTop - (this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                    this.fixedHeaderElement.offsetHeight : 0);
            }
        }
    }
    isEditTextBox() {
        return false;
    }
    isFiltering() {
        return this.allowFiltering;
    }
    isPopupButton() {
        return true;
    }
    setScrollPosition(e) {
        if (!isNullOrUndefined(e)) {
            switch (e.action) {
                case 'pageDown':
                case 'down':
                case 'end':
                    this.scrollBottom();
                    break;
                default:
                    this.scrollTop();
                    break;
            }
        }
        else {
            this.scrollBottom(true);
        }
    }
    clearText() {
        this.filterInput.value = this.typedString = '';
        this.searchLists(null);
    }
    setEleWidth(width) {
        if (!isNullOrUndefined(width)) {
            if (typeof width === 'number') {
                this.inputWrapper.container.style.width = formatUnit(width);
            }
            else if (typeof width === 'string') {
                this.inputWrapper.container.style.width = (width.match(/px|%|em/)) ? (width) : (formatUnit(width));
            }
        }
    }
    closePopup(delay, e) {
        this.isTyped = false;
        if (!(this.popupObj && document.body.contains(this.popupObj.element) && this.beforePopupOpen)) {
            return;
        }
        EventHandler.remove(document, 'mousedown', this.onDocumentClick);
        this.isActive = false;
        this.filterInputObj = null;
        this.isDropDownClick = false;
        this.preventAutoFill = false;
        const scrollableParentElements = this.popupObj.getScrollableParent(this.inputWrapper.container);
        for (const element of scrollableParentElements) {
            EventHandler.remove(element, 'scroll', this.scrollHandler);
        }
        if (Browser.isDevice && this.isFilterLayout()) {
            removeClass([document.body, this.popupObj.element], dropDownListClasses.popupFullScreen);
        }
        if (this.isFilterLayout()) {
            if (!Browser.isDevice) {
                this.searchKeyModule.destroy();
                if (this.clearIconElement) {
                    EventHandler.remove(this.clearIconElement, 'click', this.clearText);
                }
            }
            if (this.backIconElement) {
                EventHandler.remove(this.backIconElement, 'click', this.clickOnBackIcon);
                EventHandler.remove(this.clearIconElement, 'click', this.clearText);
            }
            if (!isNullOrUndefined(this.filterInput)) {
                EventHandler.remove(this.filterInput, 'input', this.onInput);
                EventHandler.remove(this.filterInput, 'keyup', this.onFilterUp);
                EventHandler.remove(this.filterInput, 'keydown', this.onFilterDown);
                EventHandler.remove(this.filterInput, 'blur', this.onBlurHandler);
                EventHandler.remove(this.filterInput, 'paste', this.pasteHandler);
            }
            this.filterInput = null;
        }
        attributes(this.targetElement(), { 'aria-expanded': 'false' });
        this.inputElement.setAttribute('aria-expanded', 'false');
        this.targetElement().removeAttribute('aria-owns');
        this.targetElement().removeAttribute('aria-activedescendant');
        this.inputWrapper.container.classList.remove(dropDownListClasses.iconAnimation);
        if (this.isFiltering()) {
            this.actionCompleteData.isUpdated = false;
        }
        this.beforePopupOpen = false;
        const animModel = {
            name: 'FadeOut',
            duration: 100,
            delay: delay ? delay : 0
        };
        const popupInstance = this.popupObj;
        const eventArgs = { popup: popupInstance, cancel: false, animation: animModel, event: e || null };
        this.trigger('close', eventArgs, (eventArgs) => {
            if (!isNullOrUndefined(this.popupObj) &&
                !isNullOrUndefined(this.popupObj.element.querySelector('.e-fixed-head'))) {
                const fixedHeader = this.popupObj.element.querySelector('.e-fixed-head');
                fixedHeader.parentNode.removeChild(fixedHeader);
                this.fixedHeaderElement = null;
            }
            if (!eventArgs.cancel) {
                if (this.getModuleName() === 'autocomplete') {
                    this.rippleFun();
                }
                if (this.isPopupOpen) {
                    this.popupObj.hide(new Animation(eventArgs.animation));
                }
                else {
                    this.destroyPopup();
                }
            }
        });
    }
    destroyPopup() {
        this.isPopupOpen = false;
        this.isFilterFocus = false;
        if (this.popupObj) {
            this.popupObj.destroy();
            detach(this.popupObj.element);
        }
    }
    clickOnBackIcon() {
        this.hidePopup();
        this.focusIn();
    }
    /**
     * To Initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    render() {
        if (this.element.tagName === 'INPUT') {
            this.inputElement = this.element;
            if (isNullOrUndefined(this.inputElement.getAttribute('role'))) {
                this.inputElement.setAttribute('role', 'combobox');
            }
            if (isNullOrUndefined(this.inputElement.getAttribute('type'))) {
                this.inputElement.setAttribute('type', 'text');
            }
            this.inputElement.setAttribute('aria-expanded', 'false');
        }
        else {
            this.inputElement = this.createElement('input', { attrs: { role: 'combobox', type: 'text' } });
            if (this.element.tagName !== this.getNgDirective()) {
                this.element.style.display = 'none';
            }
            this.element.parentElement.insertBefore(this.inputElement, this.element);
            this.preventTabIndex(this.inputElement);
        }
        let updatedCssClassValues = this.cssClass;
        if (!isNullOrUndefined(this.cssClass) && this.cssClass !== '') {
            updatedCssClassValues = (this.cssClass.replace(/\s+/g, ' ')).trim();
        }
        if (!isNullOrUndefined(closest(this.element, 'fieldset')) && closest(this.element, 'fieldset').disabled) {
            this.enabled = false;
        }
        this.inputWrapper = Input.createInput({
            element: this.inputElement,
            buttons: this.isPopupButton() ? [dropDownListClasses.icon] : null,
            floatLabelType: this.floatLabelType,
            properties: {
                readonly: this.getModuleName() === 'dropdownlist' ? true : this.readonly,
                placeholder: this.placeholder,
                cssClass: updatedCssClassValues,
                enabled: this.enabled,
                enableRtl: this.enableRtl,
                showClearButton: this.showClearButton
            }
        }, this.createElement);
        if (this.element.tagName === this.getNgDirective()) {
            this.element.appendChild(this.inputWrapper.container);
        }
        else {
            this.inputElement.parentElement.insertBefore(this.element, this.inputElement);
        }
        this.hiddenElement = this.createElement('select', {
            attrs: { 'aria-hidden': 'true', 'tabindex': '-1', 'class': dropDownListClasses.hiddenElement }
        });
        prepend([this.hiddenElement], this.inputWrapper.container);
        this.validationAttribute(this.element, this.hiddenElement);
        this.setReadOnly();
        this.setFields();
        this.inputWrapper.container.style.width = formatUnit(this.width);
        this.inputWrapper.container.classList.add('e-ddl');
        if (this.floatLabelType === 'Auto') {
            Input.calculateWidth(this.inputElement, this.inputWrapper.container);
        }
        if (!isNullOrUndefined(this.inputWrapper.buttons[0]) && this.inputWrapper.container.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never') {
            this.inputWrapper.container.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
        }
        this.wireEvent();
        this.tabIndex = this.element.hasAttribute('tabindex') ? this.element.getAttribute('tabindex') : '0';
        this.element.removeAttribute('tabindex');
        const id = this.element.getAttribute('id') ? this.element.getAttribute('id') : getUniqueID('ej2_dropdownlist');
        this.element.id = id;
        this.hiddenElement.id = id + '_hidden';
        this.targetElement().setAttribute('tabindex', this.tabIndex);
        if (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') {
            this.inputElement.setAttribute('aria-label', this.getModuleName());
        }
        else {
            attributes(this.targetElement(), { 'aria-label': this.getModuleName() });
        }
        attributes(this.targetElement(), this.getAriaAttributes());
        this.updateDataAttribute(this.htmlAttributes);
        this.setHTMLAttributes();
        if (this.targetElement() === this.inputElement) {
            this.inputElement.removeAttribute('aria-labelledby');
        }
        if (this.value !== null || this.activeIndex !== null || this.text !== null) {
            this.initValue();
        }
        else if (this.element.tagName === 'SELECT' && this.element.options[0]) {
            const selectElement = this.element;
            this.value = selectElement.options[selectElement.selectedIndex].value;
            this.text = isNullOrUndefined(this.value) ? null : selectElement.options[selectElement.selectedIndex].textContent;
            this.initValue();
        }
        this.setEnabled();
        this.preventTabIndex(this.element);
        if (!this.enabled) {
            this.targetElement().tabIndex = -1;
        }
        this.initial = false;
        this.element.style.opacity = '';
        this.inputElement.onselect = (e) => {
            e.stopImmediatePropagation();
        };
        this.inputElement.onchange = (e) => {
            e.stopImmediatePropagation();
        };
        if (this.element.hasAttribute('autofocus')) {
            this.focusIn();
        }
        if (!isNullOrUndefined(this.text)) {
            this.inputElement.setAttribute('value', this.text);
        }
        if (this.element.hasAttribute('data-val')) {
            this.element.setAttribute('data-val', 'false');
        }
        const floatLabelElement = this.inputWrapper.container.getElementsByClassName('e-float-text')[0];
        if (!isNullOrUndefined(this.element.id) && this.element.id !== '' && !isNullOrUndefined(floatLabelElement)) {
            floatLabelElement.id = 'label_' + this.element.id.replace(/ /g, '_');
            attributes(this.inputElement, { 'aria-labelledby': floatLabelElement.id });
        }
        this.renderComplete();
    }
    setFooterTemplate(popupEle) {
        let compiledString;
        if (this.footer) {
            if (this.isReact) {
                this.clearTemplate(['footerTemplate']);
            }
            else {
                this.footer.innerHTML = '';
            }
        }
        else {
            this.footer = this.createElement('div');
            addClass([this.footer], dropDownListClasses.footer);
        }
        const footercheck = this.dropdownCompiler(this.footerTemplate);
        if (typeof this.footerTemplate !== 'function' && footercheck) {
            compiledString = compile(select(this.footerTemplate, document).innerHTML.trim());
        }
        else {
            compiledString = compile(this.footerTemplate);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const footerCompTemp = compiledString({}, this, 'footerTemplate', this.footerTemplateId, this.isStringTemplate, null, this.footer);
        if (footerCompTemp && footerCompTemp.length > 0) {
            append(footerCompTemp, this.footer);
        }
        append([this.footer], popupEle);
    }
    setHeaderTemplate(popupEle) {
        let compiledString;
        if (this.header) {
            this.header.innerHTML = '';
        }
        else {
            this.header = this.createElement('div');
            addClass([this.header], dropDownListClasses.header);
        }
        const headercheck = this.dropdownCompiler(this.headerTemplate);
        if (typeof this.headerTemplate !== 'function' && headercheck) {
            compiledString = compile(select(this.headerTemplate, document).innerHTML.trim());
        }
        else {
            compiledString = compile(this.headerTemplate);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const headerCompTemp = compiledString({}, this, 'headerTemplate', this.headerTemplateId, this.isStringTemplate, null, this.header);
        if (headerCompTemp && headerCompTemp.length) {
            append(headerCompTemp, this.header);
        }
        const contentEle = popupEle.querySelector('div.e-content');
        popupEle.insertBefore(this.header, contentEle);
    }
    /**
     * Sets the enabled state to DropDownBase.
     *
     * @returns {void}
     */
    setEnabled() {
        this.element.setAttribute('aria-disabled', (this.enabled) ? 'false' : 'true');
    }
    setOldText(text) {
        this.text = text;
    }
    setOldValue(value) {
        this.value = value;
    }
    refreshPopup() {
        if (!isNullOrUndefined(this.popupObj) && document.body.contains(this.popupObj.element) &&
            ((this.allowFiltering && !(Browser.isDevice && this.isFilterLayout())) || this.getModuleName() === 'autocomplete')) {
            removeClass([this.popupObj.element], 'e-popup-close');
            this.popupObj.refreshPosition(this.inputWrapper.container);
            this.popupObj.resolveCollision();
        }
    }
    checkData(newProp) {
        if (newProp.dataSource && !isNullOrUndefined(Object.keys(newProp.dataSource)) && this.itemTemplate && this.allowFiltering &&
            !(this.isListSearched && (newProp.dataSource instanceof DataManager))) {
            this.list = null;
            this.actionCompleteData = { ulElement: null, list: null, isUpdated: false };
        }
        this.isListSearched = false;
        const isChangeValue = Object.keys(newProp).indexOf('value') !== -1 && isNullOrUndefined(newProp.value);
        const isChangeText = Object.keys(newProp).indexOf('text') !== -1 && isNullOrUndefined(newProp.text);
        if (this.getModuleName() !== 'autocomplete' && this.allowFiltering && (isChangeValue || isChangeText)) {
            this.itemData = null;
        }
        if (this.allowFiltering && newProp.dataSource && !isNullOrUndefined(Object.keys(newProp.dataSource))) {
            this.actionCompleteData = { ulElement: null, list: null, isUpdated: false };
            this.actionData = this.actionCompleteData;
        }
        else if (this.allowFiltering && newProp.query && !isNullOrUndefined(Object.keys(newProp.query))) {
            this.actionCompleteData = this.getModuleName() === 'combobox' ?
                { ulElement: null, list: null, isUpdated: false } : this.actionCompleteData;
            this.actionData = this.actionCompleteData;
        }
    }
    updateDataSource(props) {
        if (this.inputElement.value !== '' || (!isNullOrUndefined(props) && (isNullOrUndefined(props.dataSource)
            || (!(props.dataSource instanceof DataManager) && props.dataSource.length === 0)))) {
            this.clearAll(null, props);
        }
        if ((this.fields.groupBy && props.fields) && !this.isGroupChecking && this.list) {
            EventHandler.remove(this.list, 'scroll', this.setFloatingHeader);
            EventHandler.add(this.list, 'scroll', this.setFloatingHeader, this);
        }
        if (!(!isNullOrUndefined(props) && (isNullOrUndefined(props.dataSource)
            || (!(props.dataSource instanceof DataManager) && props.dataSource.length === 0))) || !(props.dataSource === [])) {
            this.typedString = '';
            this.resetList(this.dataSource);
        }
        if (!this.isCustomFilter && !this.isFilterFocus && document.activeElement !== this.filterInput) {
            this.checkCustomValue();
        }
    }
    checkCustomValue() {
        this.itemData = this.getDataByValue(this.value);
        const dataItem = this.getItemData();
        this.setProperties({ 'text': dataItem.text, 'value': dataItem.value });
    }
    updateInputFields() {
        if (this.getModuleName() === 'dropdownlist') {
            Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
        }
    }
    /**
     * Dynamically change the value of properties.
     *
     * @private
     * @param {DropDownListModel} newProp - Returns the dynamic property value of the component.
     * @param {DropDownListModel} oldProp - Returns the previous previous value of the component.
     * @returns {void}
     */
    onPropertyChanged(newProp, oldProp) {
        if (this.getModuleName() === 'dropdownlist') {
            this.checkData(newProp);
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'query':
                case 'dataSource': break;
                case 'htmlAttributes':
                    this.setHTMLAttributes();
                    break;
                case 'width':
                    this.setEleWidth(newProp.width);
                    Input.calculateWidth(this.inputElement, this.inputWrapper.container);
                    break;
                case 'placeholder':
                    Input.setPlaceholder(newProp.placeholder, this.inputElement);
                    break;
                case 'filterBarPlaceholder':
                    if (this.filterInput) {
                        Input.setPlaceholder(newProp.filterBarPlaceholder, this.filterInput);
                    }
                    break;
                case 'readonly':
                    if (this.getModuleName() !== 'dropdownlist') {
                        Input.setReadonly(newProp.readonly, this.inputElement);
                    }
                    this.setReadOnly();
                    break;
                case 'cssClass':
                    this.setCssClass(newProp.cssClass, oldProp.cssClass);
                    Input.calculateWidth(this.inputElement, this.inputWrapper.container);
                    break;
                case 'enableRtl':
                    this.setEnableRtl();
                    break;
                case 'enabled':
                    this.setEnable();
                    break;
                case 'text':
                    if (newProp.text === null) {
                        this.clearAll();
                        break;
                    }
                    if (!this.list) {
                        if (this.dataSource instanceof DataManager) {
                            this.initRemoteRender = true;
                        }
                        this.renderList();
                    }
                    if (!this.initRemoteRender) {
                        const li = this.getElementByText(newProp.text);
                        if (!this.checkValidLi(li)) {
                            if (this.liCollections && this.liCollections.length === 100 &&
                                this.getModuleName() === 'autocomplete' && this.listData.length > 100) {
                                this.setSelectionData(newProp.text, oldProp.text, 'text');
                            }
                            else if (newProp.text && this.dataSource instanceof DataManager) {
                                const listLength = this.getItems().length;
                                const checkField = isNullOrUndefined(this.fields.text) ? this.fields.value : this.fields.text;
                                this.typedString = '';
                                this.dataSource.executeQuery(this.getQuery(this.query).where(new Predicate(checkField, 'equal', newProp.text)))
                                    .then((e) => {
                                    if (e.result.length > 0) {
                                        this.addItem(e.result, listLength);
                                        this.updateValues();
                                    }
                                    else {
                                        this.setOldText(oldProp.text);
                                    }
                                });
                            }
                            else if (this.getModuleName() === 'autocomplete') {
                                this.setInputValue(newProp, oldProp);
                            }
                            else {
                                this.setOldText(oldProp.text);
                            }
                        }
                        this.updateInputFields();
                    }
                    break;
                case 'value':
                    if (newProp.value === null) {
                        this.clearAll();
                        break;
                    }
                    this.notify('beforeValueChange', { newProp: newProp }); // gird component value type change
                    if (!this.list) {
                        if (this.dataSource instanceof DataManager) {
                            this.initRemoteRender = true;
                        }
                        this.renderList();
                    }
                    if (!this.initRemoteRender) {
                        const item = this.getElementByValue(newProp.value);
                        if (!this.checkValidLi(item)) {
                            if (this.liCollections && this.liCollections.length === 100 &&
                                this.getModuleName() === 'autocomplete' && this.listData.length > 100) {
                                this.setSelectionData(newProp.value, oldProp.value, 'value');
                            }
                            else if (newProp.value && this.dataSource instanceof DataManager) {
                                const listLength = this.getItems().length;
                                const checkField = isNullOrUndefined(this.fields.value) ? this.fields.text : this.fields.value;
                                this.typedString = '';
                                this.dataSource.executeQuery(this.getQuery(this.query).where(new Predicate(checkField, 'equal', newProp.value)))
                                    .then((e) => {
                                    if (e.result.length > 0) {
                                        this.addItem(e.result, listLength);
                                        this.updateValues();
                                    }
                                    else {
                                        this.setOldValue(oldProp.value);
                                    }
                                });
                            }
                            else if (this.getModuleName() === 'autocomplete') {
                                this.setInputValue(newProp, oldProp);
                            }
                            else {
                                this.setOldValue(oldProp.value);
                            }
                        }
                        this.updateInputFields();
                        this.preventChange = this.isAngular && this.preventChange ? !this.preventChange : this.preventChange;
                    }
                    break;
                case 'index':
                    if (newProp.index === null) {
                        this.clearAll();
                        break;
                    }
                    if (!this.list) {
                        if (this.dataSource instanceof DataManager) {
                            this.initRemoteRender = true;
                        }
                        this.renderList();
                    }
                    if (!this.initRemoteRender && this.liCollections) {
                        const element = this.liCollections[newProp.index];
                        if (!this.checkValidLi(element)) {
                            if (this.liCollections && this.liCollections.length === 100 &&
                                this.getModuleName() === 'autocomplete' && this.listData.length > 100) {
                                this.setSelectionData(newProp.index, oldProp.index, 'index');
                            }
                            else {
                                this.index = oldProp.index;
                            }
                        }
                        this.updateInputFields();
                    }
                    break;
                case 'footerTemplate':
                    if (this.popupObj) {
                        this.setFooterTemplate(this.popupObj.element);
                    }
                    break;
                case 'headerTemplate':
                    if (this.popupObj) {
                        this.setHeaderTemplate(this.popupObj.element);
                    }
                    break;
                case 'valueTemplate':
                    if (!isNullOrUndefined(this.itemData) && this.valueTemplate !== null) {
                        this.setValueTemplate();
                    }
                    break;
                case 'allowFiltering':
                    if (this.allowFiltering) {
                        this.actionCompleteData = {
                            ulElement: this.ulElement,
                            list: this.listData, isUpdated: true
                        };
                        this.actionData = this.actionCompleteData;
                        this.updateSelectElementData(this.allowFiltering);
                    }
                    break;
                case 'floatLabelType':
                    Input.removeFloating(this.inputWrapper);
                    Input.addFloating(this.inputElement, newProp.floatLabelType, this.placeholder, this.createElement);
                    if (!isNullOrUndefined(this.inputWrapper.buttons[0]) && this.inputWrapper.container.getElementsByClassName('e-float-text-overflow')[0] && this.floatLabelType !== 'Never') {
                        this.inputWrapper.container.getElementsByClassName('e-float-text-overflow')[0].classList.add('e-icon');
                    }
                    break;
                case 'showClearButton':
                    Input.setClearButton(newProp.showClearButton, this.inputElement, this.inputWrapper, null, this.createElement);
                    this.bindClearEvent();
                    break;
                default:
                    {
                        // eslint-disable-next-line max-len
                        const ddlProps = this.getPropObject(prop, newProp, oldProp);
                        super.onPropertyChanged(ddlProps.newProperty, ddlProps.oldProperty);
                    }
                    break;
            }
        }
    }
    checkValidLi(element) {
        if (this.isValidLI(element)) {
            this.setSelection(element, null);
            return true;
        }
        return false;
    }
    setSelectionData(newProp, oldProp, prop) {
        let li;
        this.updateListValues = () => {
            if (prop === 'text') {
                li = this.getElementByText(newProp);
                if (!this.checkValidLi(li)) {
                    this.setOldText(oldProp);
                }
            }
            else if (prop === 'value') {
                li = this.getElementByValue(newProp);
                if (!this.checkValidLi(li)) {
                    this.setOldValue(oldProp);
                }
            }
            else if (prop === 'index') {
                li = this.liCollections[newProp];
                if (!this.checkValidLi(li)) {
                    this.index = oldProp;
                }
            }
        };
    }
    setReadOnly() {
        if (this.readonly) {
            addClass([this.inputWrapper.container], ['e-readonly']);
        }
        else {
            removeClass([this.inputWrapper.container], ['e-readonly']);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setInputValue(newProp, oldProp) {
    }
    setCssClass(newClass, oldClass) {
        if (!isNullOrUndefined(oldClass)) {
            oldClass = (oldClass.replace(/\s+/g, ' ')).trim();
        }
        if (!isNullOrUndefined(newClass)) {
            newClass = (newClass.replace(/\s+/g, ' ')).trim();
        }
        Input.setCssClass(newClass, [this.inputWrapper.container], oldClass);
        if (this.popupObj) {
            Input.setCssClass(newClass, [this.popupObj.element], oldClass);
        }
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'dropdownlist';
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Opens the popup that displays the list of items.
     *
     * @returns {void}
     */
    showPopup(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        if (!this.enabled) {
            return;
        }
        if (this.isReact && this.getModuleName() === 'combobox' && this.itemTemplate && this.isCustomFilter && this.isAddNewItemTemplate) {
            this.renderList();
            this.isAddNewItemTemplate = false;
        }
        if (this.isFiltering() && this.dataSource instanceof DataManager && (this.actionData.list !== this.actionCompleteData.list) &&
            this.actionData.list && this.actionData.ulElement) {
            this.actionCompleteData = this.actionData;
            this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list, null, true);
        }
        if (this.beforePopupOpen) {
            this.refreshPopup();
            return;
        }
        this.beforePopupOpen = true;
        if (this.isFiltering() && !this.isActive && this.actionCompleteData.list && this.actionCompleteData.list[0]) {
            this.isActive = true;
            this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list, null, true);
        }
        else if (isNullOrUndefined(this.list) || !isUndefined(this.list) && (this.list.classList.contains(dropDownBaseClasses.noData) ||
            this.list.querySelectorAll('.' + dropDownBaseClasses.li).length <= 0)) {
            this.renderList(e);
        }
        this.invokeRenderPopup(e);
    }
    invokeRenderPopup(e) {
        if (Browser.isDevice && this.isFilterLayout()) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const proxy = this;
            window.onpopstate = () => {
                proxy.hidePopup();
            };
            history.pushState({}, '');
        }
        if (!isNullOrUndefined(this.list) && (!isNullOrUndefined(this.list.children[0]) ||
            this.list.classList.contains(dropDownBaseClasses.noData))) {
            this.renderPopup(e);
        }
    }
    renderHightSearch() {
        // update high light search
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Hides the popup if it is in an open state.
     *
     * @returns {void}
     */
    hidePopup(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        if (this.isEscapeKey && this.getModuleName() === 'dropdownlist') {
            if (!isNullOrUndefined(this.inputElement)) {
                Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
            }
            this.isEscapeKey = false;
            if (!isNullOrUndefined(this.index)) {
                const element = this.findListElement(this.ulElement, 'li', 'data-value', this.value);
                this.selectedLI = this.liCollections[this.index] || element;
                if (this.selectedLI) {
                    this.updateSelectedItem(this.selectedLI, null, true);
                    if (this.valueTemplate && this.itemData !== null) {
                        this.setValueTemplate();
                    }
                }
            }
            else {
                this.resetSelection();
            }
        }
        this.closePopup(0, e);
        const dataItem = this.getItemData();
        const isSelectVal = !isNullOrUndefined(this.selectedLI);
        if (this.inputElement && this.inputElement.value.trim() === '' && !this.isInteracted && (this.isSelectCustom ||
            isSelectVal && this.inputElement.value !== dataItem.text)) {
            this.isSelectCustom = false;
            this.clearAll(e);
        }
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Sets the focus on the component for interaction.
     *
     * @returns {void}
     */
    focusIn(e) {
        if (!this.enabled) {
            return;
        }
        if (this.targetElement().classList.contains(dropDownListClasses.disable)) {
            return;
        }
        let isFocused = false;
        if (this.preventFocus && Browser.isDevice) {
            this.inputWrapper.container.tabIndex = 1;
            this.inputWrapper.container.focus();
            this.preventFocus = false;
            isFocused = true;
        }
        if (!isFocused) {
            this.targetElement().focus();
        }
        addClass([this.inputWrapper.container], [dropDownListClasses.inputFocus]);
        this.onFocus(e);
        if (this.floatLabelType === 'Auto') {
            Input.calculateWidth(this.inputElement, this.inputWrapper.container);
        }
    }
    /**
     * Moves the focus from the component if the component is already focused.
     *
     * @returns {void}
     */
    focusOut(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        if (!this.enabled) {
            return;
        }
        this.isTyped = true;
        this.hidePopup(e);
        if (this.targetElement()) {
            this.targetElement().blur();
        }
        removeClass([this.inputWrapper.container], [dropDownListClasses.inputFocus]);
        if (this.floatLabelType === 'Auto' && this.inputElement.value === '') {
            Input.calculateWidth(this.inputElement, this.inputWrapper.container);
        }
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers. Also it removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        this.isActive = false;
        resetIncrementalSearchValues(this.element.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate();
        }
        this.hidePopup();
        this.unWireEvent();
        if (this.list) {
            this.unWireListEvents();
        }
        if (this.element && !this.element.classList.contains('e-' + this.getModuleName())) {
            return;
        }
        if (this.inputElement) {
            const attrArray = ['readonly', 'aria-disabled', 'placeholder', 'aria-labelledby',
                'aria-expanded', 'autocomplete', 'aria-readonly', 'autocapitalize',
                'spellcheck', 'aria-autocomplete', 'aria-live', 'aria-describedby', 'aria-label'];
            for (let i = 0; i < attrArray.length; i++) {
                this.inputElement.removeAttribute(attrArray[i]);
            }
            this.inputElement.setAttribute('tabindex', this.tabIndex);
            this.inputElement.classList.remove('e-input');
            Input.setValue('', this.inputElement, this.floatLabelType, this.showClearButton);
        }
        this.element.style.display = 'block';
        if (this.inputWrapper.container.parentElement.tagName === this.getNgDirective()) {
            detach(this.inputWrapper.container);
        }
        else {
            this.inputWrapper.container.parentElement.insertBefore(this.element, this.inputWrapper.container);
            detach(this.inputWrapper.container);
        }
        this.hiddenElement = null;
        this.inputWrapper = null;
        this.keyboardModule = null;
        this.ulElement = null;
        this.list = null;
        this.popupObj = null;
        this.rippleFun = null;
        this.selectedLI = null;
        this.liCollections = null;
        this.item = null;
        this.inputWrapper = null;
        this.footer = null;
        this.header = null;
        this.previousSelectedLI = null;
        this.valueTempElement = null;
        this.actionData.ulElement = null;
        super.destroy();
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets all the list items bound on this component.
     *
     * @returns {Element[]}
     */
    getItems() {
        if (!this.list) {
            if (this.dataSource instanceof DataManager) {
                this.initRemoteRender = true;
            }
            this.renderList();
        }
        return this.ulElement ? super.getItems() : [];
    }
    /**
     * Gets the data Object that matches the given value.
     *
     * @param { string | number } value - Specifies the value of the list item.
     * @returns {Object}
     */
    getDataByValue(value) {
        return super.getDataByValue(value);
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Allows you to clear the selected values from the component.
     *
     * @returns {void}
     */
    clear() {
        this.value = null;
    }
};
__decorate$1([
    Property(null)
], DropDownList.prototype, "cssClass", void 0);
__decorate$1([
    Property('100%')
], DropDownList.prototype, "width", void 0);
__decorate$1([
    Property(true)
], DropDownList.prototype, "enabled", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "enablePersistence", void 0);
__decorate$1([
    Property('300px')
], DropDownList.prototype, "popupHeight", void 0);
__decorate$1([
    Property('100%')
], DropDownList.prototype, "popupWidth", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "placeholder", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "filterBarPlaceholder", void 0);
__decorate$1([
    Property({})
], DropDownList.prototype, "htmlAttributes", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "query", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "valueTemplate", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "headerTemplate", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "footerTemplate", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "allowFiltering", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "readonly", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "text", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "value", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "index", void 0);
__decorate$1([
    Property('Never')
], DropDownList.prototype, "floatLabelType", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "showClearButton", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "filtering", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "change", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "beforeOpen", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "open", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "close", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "blur", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "focus", void 0);
DropDownList = __decorate$1([
    NotifyPropertyChanges
], DropDownList);

/**
 * export all modules from current location
 */

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const RTL = 'e-rtl';
const DROPDOWNTREE = 'e-ddt';
const HIDDENELEMENT = 'e-ddt-hidden';
const DROPDOWNICON = 'e-input-group-icon e-ddt-icon e-icons';
const SHOW_CHIP = 'e-show-chip';
const SHOW_CLEAR = 'e-show-clear';
const SHOW_DD_ICON = 'e-show-dd-icon';
const CHIP_INPUT = 'e-chip-input';
const INPUTFOCUS = 'e-input-focus';
const INPUTGROUP = 'e-input-group';
const ICONANIMATION = 'e-icon-anim';
const CLOSEICON_CLASS = 'e-clear-icon e-icons';
const CHIP_WRAPPER = 'e-chips-wrapper';
const CHIP_COLLECTION = 'e-chips-collection';
const CHIP = 'e-chips';
const CHIP_CONTENT = 'e-chipcontent';
const CHIP_CLOSE = 'e-chips-close';
const HIDEICON = 'e-icon-hide';
const DDTHIDEICON = 'e-ddt-icon-hide';
const POPUP_CLASS = 'e-ddt e-popup';
const PARENTITEM = 'e-list-parent';
const CONTENT = 'e-popup-content';
const DROPDOWN = 'e-dropdown';
const DISABLED = 'e-disabled';
const ICONS = 'e-icons';
const CHECKALLPARENT = 'e-selectall-parent';
const CHECKALLHIDE = 'e-hide-selectall';
const BIGGER = 'e-bigger';
const SMALL = 'e-small';
const ALLTEXT = 'e-all-text';
const CHECKBOXFRAME = 'e-frame';
const CHECK = 'e-check';
const CHECKBOXWRAP = 'e-checkbox-wrapper';
const FILTERWRAP = 'e-filter-wrap';
const DDTICON = 'e-ddt-icon';
const FOOTER = 'e-ddt-footer';
const HEADER = 'e-ddt-header';
const NODATACONTAINER = 'e-ddt-nodata';
const NODATA = 'e-no-data';
const HEADERTEMPLATE = 'HeaderTemplate';
const FOOTERTEMPLATE = 'FooterTemplate';
const NORECORDSTEMPLATE = 'NoRecordsTemplate';
const ACTIONFAILURETEMPLATE = 'ActionFailureTemplate';
const CUSTOMTEMPLATE = 'CustomTemplate';
const REMAIN_WRAPPER = 'e-remain';
const OVERFLOW_VIEW = 'e-overflow';
const SHOW_TEXT = 'e-show-text';
const TOTAL_COUNT_WRAPPER = 'e-total-count';
const REMAIN_COUNT = 'e-wrap-count';
class Fields extends ChildProperty {
}
__decorate$2([
    Property('child')
], Fields.prototype, "child", void 0);
__decorate$2([
    Property([])
], Fields.prototype, "dataSource", void 0);
__decorate$2([
    Property('expanded')
], Fields.prototype, "expanded", void 0);
__decorate$2([
    Property('hasChildren')
], Fields.prototype, "hasChildren", void 0);
__decorate$2([
    Property('htmlAttributes')
], Fields.prototype, "htmlAttributes", void 0);
__decorate$2([
    Property('iconCss')
], Fields.prototype, "iconCss", void 0);
__decorate$2([
    Property('imageUrl')
], Fields.prototype, "imageUrl", void 0);
__decorate$2([
    Property('parentValue')
], Fields.prototype, "parentValue", void 0);
__decorate$2([
    Property(null)
], Fields.prototype, "query", void 0);
__decorate$2([
    Property('selectable')
], Fields.prototype, "selectable", void 0);
__decorate$2([
    Property('selected')
], Fields.prototype, "selected", void 0);
__decorate$2([
    Property(null)
], Fields.prototype, "tableName", void 0);
__decorate$2([
    Property('text')
], Fields.prototype, "text", void 0);
__decorate$2([
    Property('tooltip')
], Fields.prototype, "tooltip", void 0);
__decorate$2([
    Property('value')
], Fields.prototype, "value", void 0);
class TreeSettings extends ChildProperty {
}
__decorate$2([
    Property(false)
], TreeSettings.prototype, "autoCheck", void 0);
__decorate$2([
    Property('Auto')
], TreeSettings.prototype, "expandOn", void 0);
__decorate$2([
    Property(false)
], TreeSettings.prototype, "loadOnDemand", void 0);
/**
 * The Dropdown Tree control allows you to select single or multiple values from hierarchical data in a tree-like structure.
 * It has several out-of-the-box features, such as data binding, check boxes, templates, filter,
 * UI customization, accessibility, and preselected values.
 * ```html
 *  <input type="text" id="tree"></input>
 * ```
 * ```typescript
 *  let ddtObj: DropDownTree = new DropDownTree();
 *  ddtObj.appendTo("#tree");
 * ```
 */
let DropDownTree = class DropDownTree extends Component {
    constructor(options, element) {
        super(options, element);
        this.filterTimer = null;
        this.isFilteredData = false;
        this.isFilterRestore = false;
        // eslint-disable-next-line
        this.selectedData = [];
        this.filterDelayTime = 300;
        this.isClicked = false;
        // Specifies if the checkAll method has been called
        this.isCheckAllCalled = false;
        this.isFromFilterChange = false;
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string}
     * @hidden
     */
    getPersistData() {
        const keyEntity = ['value'];
        return this.addOnPersist(keyEntity);
    }
    getLocaleName() {
        return 'drop-down-tree';
    }
    /**
     * Initialize the event handler.
     *
     * @returns {void}
     * @private
     */
    preRender() {
        this.inputFocus = false;
        this.isPopupOpen = false;
        this.isFirstRender = true;
        this.isInitialized = false;
        this.currentText = null;
        this.currentValue = null;
        this.oldValue = null;
        this.removeValue = false;
        this.selectedText = [];
        this.treeItems = [];
        this.dataValue = null;
        this.isNodeSelected = false;
        this.isDynamicChange = false;
        this.clearIconWidth = 0;
        this.headerTemplateId = `${this.element.id}${HEADERTEMPLATE}`;
        this.footerTemplateId = `${this.element.id}${FOOTERTEMPLATE}`;
        this.actionFailureTemplateId = `${this.element.id}${ACTIONFAILURETEMPLATE}`;
        this.noRecordsTemplateId = `${this.element.id}${NORECORDSTEMPLATE}`;
        this.customTemplateId = `${this.element.id}${CUSTOMTEMPLATE}`;
        this.keyConfigs = {
            escape: 'escape',
            altUp: 'alt+uparrow',
            altDown: 'alt+downarrow',
            tab: 'tab',
            shiftTab: 'shift+tab',
            end: 'end',
            enter: 'enter',
            home: 'home',
            moveDown: 'downarrow',
            moveLeft: 'leftarrow',
            moveRight: 'rightarrow',
            moveUp: 'uparrow',
            ctrlDown: 'ctrl+downarrow',
            ctrlUp: 'ctrl+uparrow',
            ctrlEnter: 'ctrl+enter',
            ctrlHome: 'ctrl+home',
            ctrlEnd: 'ctrl+end',
            shiftDown: 'shift+downarrow',
            shiftUp: 'shift+uparrow',
            shiftEnter: 'shift+enter',
            shiftHome: 'shift+home',
            shiftEnd: 'shift+end',
            csDown: 'ctrl+shift+downarrow',
            csUp: 'ctrl+shift+uparrow',
            csEnter: 'ctrl+shift+enter',
            csHome: 'ctrl+shift+home',
            csEnd: 'ctrl+shift+end',
            space: 'space',
            ctrlA: 'ctrl+A'
        };
    }
    /**
     * To Initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    render() {
        const isTree = select('#' + this.element.id + '_tree', document);
        if (isTree) {
            const popupDiv = select('#' + this.element.id + '_popup', document);
            detach(popupDiv ? popupDiv : isTree.parentElement);
        }
        this.ensureAutoCheck();
        if (this.element.tagName === 'INPUT') {
            this.inputEle = this.element;
            if (isNullOrUndefined(this.inputEle.getAttribute('role'))) {
                this.inputEle.setAttribute('role', 'textbox');
            }
            if (isNullOrUndefined(this.inputEle.getAttribute('type'))) {
                this.inputEle.setAttribute('type', 'text');
            }
        }
        else {
            this.inputEle = this.createElement('input', { attrs: { role: 'textbox', type: 'text' } });
            this.element.parentElement.insertBefore(this.inputEle, this.element);
        }
        this.inputObj = Input.createInput({
            element: this.inputEle,
            floatLabelType: this.floatLabelType,
            buttons: this.showDropDownIcon ? [DROPDOWNICON] : null,
            properties: {
                readonly: true,
                placeholder: this.placeholder,
                enabled: this.enabled,
                cssClass: this.cssClass,
                enableRtl: this.enableRtl
            }
        }, this.createElement);
        this.inputWrapper = this.inputObj.container;
        if (!this.inputWrapper.classList.contains(INPUTGROUP)) {
            this.inputWrapper.classList.add(INPUTGROUP);
        }
        if (this.showDropDownIcon) {
            this.inputWrapper.classList.add(SHOW_DD_ICON);
        }
        if (this.element.tagName === this.getDirective()) {
            this.element.appendChild(this.inputWrapper);
        }
        this.createHiddenElement();
        this.createClearIcon();
        this.inputWrapper.classList.add(DROPDOWNTREE);
        this.setElementWidth(this.width);
        this.updateDataAttribute();
        this.setHTMLAttributes();
        this.setAttributes();
        this.popupDiv = this.createElement('div', { className: CONTENT });
        this.popupDiv.classList.add(DROPDOWN);
        this.tree = this.createElement('div', { id: this.element.id + '_tree' });
        this.popupDiv.appendChild(this.tree);
        document.body.appendChild(this.popupDiv);
        this.wireTreeEvents();
        addClass([this.popupDiv], DDTHIDEICON);
        this.renderTree();
        this.isRemoteData = this.fields.dataSource instanceof DataManager;
        if (this.allowMultiSelection || this.showCheckBox) {
            if (this.mode !== 'Delimiter') {
                this.createChip();
            }
            if (!this.wrapText && this.mode !== 'Custom') {
                this.overFlowWrapper = this.createElement('span', { className: OVERFLOW_VIEW + ' ' + HIDEICON });
                this.inputWrapper.insertBefore(this.overFlowWrapper, this.hiddenElement);
                if (this.mode !== 'Box') {
                    addClass([this.overFlowWrapper], SHOW_TEXT);
                }
            }
        }
        if (!this.isRemoteData) {
            this.setTreeValue();
            this.setTreeText();
            this.updateHiddenValue();
            this.setSelectedValue();
            if (!this.wrapText) {
                this.updateView();
            }
        }
        this.wireEvents();
        const firstUl = select('.' + PARENTITEM, this.treeObj.element);
        if (firstUl && firstUl.getAttribute('aria-multiselectable')) {
            firstUl.removeAttribute('aria-multiselectable');
        }
        this.oldValue = this.value;
        this.isInitialized = true;
        this.hasTemplate = this.itemTemplate || this.headerTemplate || this.footerTemplate || this.actionFailureTemplate
            || this.noRecordsTemplate || this.customTemplate;
        this.renderComplete();
    }
    ensureAutoCheck() {
        if (this.allowFiltering && this.treeSettings.autoCheck) {
            this.setProperties({ treeSettings: { autoCheck: false } }, true);
        }
    }
    hideCheckAll(flag) {
        const checkAllEle = !isNullOrUndefined(this.popupEle) ? this.popupEle.querySelector('.' + CHECKALLPARENT) : null;
        if (!isNullOrUndefined(checkAllEle)) {
            if (flag && !checkAllEle.classList.contains(CHECKALLHIDE)) {
                addClass([checkAllEle], CHECKALLHIDE);
            }
            else if (!flag && checkAllEle.classList.contains(CHECKALLHIDE)) {
                removeClass([checkAllEle], CHECKALLHIDE);
            }
        }
    }
    renderFilter() {
        this.filterContainer = this.createElement('div', {
            id: this.element.id + '_filter_wrap',
            className: FILTERWRAP
        });
        const filterInput = this.createElement('input', {
            id: this.element.id + '_filter',
            attrs: { autocomplete: 'off', 'aria-label': this.filterBarPlaceholder }
        });
        this.filterContainer.appendChild(filterInput);
        prepend([this.filterContainer], this.popupEle);
        this.filterObj = new TextBox({
            value: '',
            showClearButton: true,
            placeholder: this.filterBarPlaceholder,
            input: this.filterChangeHandler.bind(this)
        });
        this.filterObj.appendTo('#' + this.element.id + '_filter');
    }
    filterChangeHandler(args) {
        if (!isNullOrUndefined(args.value)) {
            window.clearTimeout(this.filterTimer);
            this.filterTimer = window.setTimeout(() => { this.filterHandler(args.value, args.event); }, this.filterDelayTime);
        }
    }
    filterHandler(value, event) {
        this.isFromFilterChange = true;
        if (!this.isFilteredData) {
            this.treeData = this.treeObj.getTreeData();
        }
        const filterFields = this.cloneFields(this.fields);
        const args = {
            cancel: false,
            preventDefaultAction: false,
            event: event,
            text: value,
            fields: filterFields
        };
        this.trigger('filtering', args, (args) => {
            if (!args.cancel) {
                let flag = false;
                let fields;
                this.isFilteredData = true;
                if (value === '') {
                    this.isFilteredData = false;
                    this.isFilterRestore = true;
                    fields = this.cloneFields(this.fields);
                }
                else if (args.preventDefaultAction) {
                    fields = args.fields;
                }
                else {
                    if (this.treeDataType === 1) {
                        fields = this.selfReferencefilter(value, args.fields);
                    }
                    else {
                        if (this.fields.dataSource instanceof DataManager) {
                            flag = true;
                        }
                        else {
                            fields = this.nestedFilter(value, args.fields);
                        }
                    }
                }
                this.hideCheckAll(this.isFilteredData);
                if (flag) {
                    return;
                }
                this.treeObj.fields = this.getTreeFields(fields);
                this.treeObj.dataBind();
            }
        });
    }
    nestedFilter(value, filteredFields) {
        // eslint-disable-next-line
        const matchedDataSource = [];
        for (let i = 0; i < this.treeData.length; i++) {
            // eslint-disable-next-line
            const filteredChild = this.nestedChildFilter(value, this.treeData[i]);
            if (!isNullOrUndefined(filteredChild)) {
                matchedDataSource.push(filteredChild);
            }
        }
        filteredFields.dataSource = matchedDataSource;
        return filteredFields;
    }
    // eslint-disable-next-line
    nestedChildFilter(value, node) {
        // eslint-disable-next-line
        const children = node[this.fields.child];
        if (isNullOrUndefined(children)) {
            return (this.isMatchedNode(value, node)) ? node : null;
        }
        else {
            // eslint-disable-next-line
            const matchedChildren = [];
            for (let i = 0; i < children.length; i++) {
                // eslint-disable-next-line
                const filteredChild = this.nestedChildFilter(value, children[i]);
                if (!isNullOrUndefined(filteredChild)) {
                    matchedChildren.push(filteredChild);
                }
            }
            let filteredItems = Object.assign({}, node);
            if (matchedChildren.length !== 0) {
                filteredItems[this.fields.child] = matchedChildren;
                return filteredItems;
            }
            else {
                filteredItems[this.fields.child] = null;
                return (this.isMatchedNode(value, filteredItems)) ? filteredItems : null;
            }
        }
    }
    selfReferencefilter(value, filteredFields) {
        // eslint-disable-next-line
        const matchedData = [];
        // eslint-disable-next-line
        const matchedDataSource = [];
        for (let i = 0; i < this.treeData.length; i++) {
            if (this.isMatchedNode(value, this.treeData[i])) {
                matchedData.push(this.treeData[i]);
            }
        }
        for (let i = 0; i < matchedData.length; i++) {
            if (matchedDataSource.indexOf(matchedData[i]) === -1) {
                matchedDataSource.push(matchedData[i]);
                // eslint-disable-next-line
                let parentId = matchedData[i][this.fields.parentValue];
                while (!isNullOrUndefined(parentId)) {
                    // eslint-disable-next-line
                    let parent = null;
                    for (let j = 0; j < this.treeData.length; j++) {
                        // eslint-disable-next-line
                        const value = this.treeData[j][this.fields.value];
                        if (!isNullOrUndefined(value) && (value === parentId)) {
                            parent = this.treeData[j];
                            break;
                        }
                    }
                    if (!isNullOrUndefined(parent) && (matchedDataSource.indexOf(parent) === -1)) {
                        matchedDataSource.push(parent);
                        parentId = parent[this.fields.parentValue];
                    }
                    else {
                        break;
                    }
                }
            }
        }
        filteredFields.dataSource = matchedDataSource;
        return filteredFields;
    }
    // eslint-disable-next-line
    isMatchedNode(value, node) {
        let checkValue = node[this.fields.text];
        if (this.ignoreCase) {
            checkValue = checkValue.toLowerCase();
            value = value.toLowerCase();
        }
        if (this.ignoreAccent) {
            checkValue = DataUtil.ignoreDiacritics(checkValue);
            value = DataUtil.ignoreDiacritics(value);
        }
        if (this.filterType === 'StartsWith') {
            return checkValue.slice(0, value.length) === value;
        }
        else if (this.filterType === 'EndsWith') {
            return checkValue.slice(-value.length) === value;
        }
        else {
            return checkValue.indexOf(value) !== -1;
        }
    }
    /* To wire events for the dropdown tree */
    wireEvents() {
        EventHandler.add(this.inputWrapper, 'mouseup', this.dropDownClick, this);
        EventHandler.add(this.inputWrapper, 'focus', this.focusIn, this);
        EventHandler.add(this.inputWrapper, 'blur', this.focusOut, this);
        EventHandler.add(this.inputWrapper, 'mousemove', this.mouseIn, this);
        EventHandler.add(this.inputWrapper, 'mouseout', this.onMouseLeave, this);
        EventHandler.add(this.overAllClear, 'mousedown', this.clearAll, this);
        EventHandler.add(window, 'resize', this.windowResize, this);
        const formElement = closest(this.inputWrapper, 'form');
        if (formElement) {
            EventHandler.add(formElement, 'reset', this.resetValueHandler, this);
        }
        this.keyboardModule = new KeyboardEvents(this.inputWrapper, {
            keyAction: this.keyActionHandler.bind(this),
            keyConfigs: this.keyConfigs,
            eventName: 'keydown'
        });
    }
    wireTreeEvents() {
        this.keyboardModule = new KeyboardEvents(this.tree, {
            keyAction: this.treeAction.bind(this),
            keyConfigs: this.keyConfigs,
            eventName: 'keydown'
        });
    }
    wireCheckAllWrapperEvents() {
        this.keyboardModule = new KeyboardEvents(this.checkAllParent, {
            keyAction: this.checkAllAction.bind(this),
            keyConfigs: this.keyConfigs,
            eventName: 'keydown'
        });
    }
    /* To unwire events for the dropdown tree */
    unWireEvents() {
        EventHandler.remove(this.inputWrapper, 'mouseup', this.dropDownClick);
        EventHandler.remove(this.inputWrapper, 'focus', this.focusIn);
        EventHandler.remove(this.inputWrapper, 'blur', this.focusOut);
        EventHandler.remove(this.inputWrapper, 'mousemove', this.mouseIn);
        EventHandler.remove(this.inputWrapper, 'mouseout', this.onMouseLeave);
        EventHandler.remove(this.overAllClear, 'mousedown', this.clearAll);
        EventHandler.remove(window, 'resize', this.windowResize);
        const formElement = closest(this.inputWrapper, 'form');
        if (formElement) {
            EventHandler.remove(formElement, 'reset', this.resetValueHandler);
        }
    }
    /* Trigger when the dropdown is clicked */
    dropDownClick(e) {
        if (!this.enabled || this.readonly) {
            return;
        }
        if (this.isClearButtonClick) {
            this.isClearButtonClick = false;
            return;
        }
        if (this.isPopupOpen) {
            this.hidePopup();
        }
        else {
            this.focusIn(e);
            this.renderPopup();
        }
        this.showOverAllClear();
    }
    mouseIn() {
        if (this.enabled || !this.readonly) {
            this.showOverAllClear();
        }
    }
    onMouseLeave() {
        if (!this.inputFocus) {
            addClass([this.overAllClear], HIDEICON);
            removeClass([this.inputWrapper], SHOW_CLEAR);
        }
    }
    getDirective() {
        return 'EJS-DROPDOWNTREE';
    }
    focusOut(e) {
        if (!this.enabled || this.readonly || !this.inputFocus) {
            return;
        }
        if ((Browser.isIE || Browser.info.name === 'edge') && (e.target === this.inputWrapper)) {
            return;
        }
        const target = e.relatedTarget;
        if ((target !== this.inputEle) && (isNullOrUndefined(target)) && (e.target !== this.inputWrapper || !this.isPopupOpen)) {
            this.onFocusOut(e);
        }
    }
    onFocusOut(event) {
        this.inputFocus = false;
        if (this.isPopupOpen) {
            this.hidePopup();
        }
        if (this.isClearButtonClick) {
            this.isClearButtonClick = false;
        }
        if (this.showClearButton) {
            this.clearIconWidth = select('.e-clear-icon', this.inputWrapper).offsetWidth;
            addClass([this.overAllClear], HIDEICON);
            removeClass([this.inputWrapper], SHOW_CLEAR);
        }
        removeClass([this.inputWrapper], [INPUTFOCUS]);
        if ((this.allowMultiSelection || this.showCheckBox)) {
            const isValue = this.value ? (this.value.length ? true : false) : false;
            if (this.mode !== 'Delimiter' && this.mode !== 'Custom') {
                if (this.chipWrapper && (this.mode === 'Default')) {
                    addClass([this.chipWrapper], HIDEICON);
                    removeClass([this.inputWrapper], SHOW_CHIP);
                    removeClass([this.inputEle], CHIP_INPUT);
                }
            }
            if (!this.wrapText && isValue) {
                this.updateView();
            }
        }
        if (this.changeOnBlur) {
            this.triggerChangeEvent(event);
        }
        this.removeValue = false;
        this.oldValue = this.value;
        this.trigger('blur');
    }
    updateView() {
        if ((!this.showCheckBox && !this.allowMultiSelection) || this.mode === 'Custom' || this.inputFocus) {
            return;
        }
        if (this.mode !== 'Box') {
            addClass([this.inputWrapper, this.overFlowWrapper], SHOW_TEXT);
        }
        else {
            addClass([this.inputWrapper], SHOW_CHIP);
        }
        if (this.value && this.value.length !== 0) {
            if (this.inputWrapper.contains(this.chipWrapper)) {
                addClass([this.chipWrapper], HIDEICON);
            }
            addClass([this.inputEle], CHIP_INPUT);
            this.updateOverFlowView();
            this.ensurePlaceHolder();
        }
    }
    triggerChangeEvent(event) {
        const isEqual = this.ddtCompareValues(this.oldValue, this.value);
        if ((!isEqual || this.isChipDelete) && !this.removeValue) {
            const eventArgs = {
                e: event,
                oldValue: this.oldValue,
                value: this.value,
                isInteracted: event ? true : false,
                element: this.element
            };
            this.trigger('change', eventArgs);
            this.oldValue = this.value;
        }
    }
    ddtCompareValues(oldValue, newValue) {
        if (oldValue === null || newValue === null) {
            const isValid = oldValue === null ? ((newValue === oldValue) ? true : false) :
                (oldValue.length === 0 ? (newValue === oldValue) : false);
            return isValid;
        }
        else if (oldValue.length !== newValue.length) {
            return false;
        }
        for (let i = 0; i < oldValue.length; i++) {
            if (oldValue[i] !== newValue[i]) {
                return false;
            }
        }
        return true;
    }
    focusIn(e) {
        if (!this.enabled || this.readonly || this.inputFocus) {
            return;
        }
        this.showOverAllClear();
        this.inputFocus = true;
        addClass([this.inputWrapper], [INPUTFOCUS]);
        if (this.allowMultiSelection || this.showCheckBox) {
            if (this.mode !== 'Delimiter' && this.inputFocus) {
                if (this.chipWrapper && (this.value && this.value.length !== 0)) {
                    removeClass([this.chipWrapper], HIDEICON);
                    addClass([this.inputEle], CHIP_INPUT);
                }
                addClass([this.inputWrapper], SHOW_CHIP);
                if (this.popupObj) {
                    this.popupObj.refreshPosition();
                }
            }
            if (!this.wrapText && this.mode !== 'Custom') {
                if (this.inputWrapper.contains(this.overFlowWrapper)) {
                    addClass([this.overFlowWrapper], HIDEICON);
                }
                if (this.mode === 'Delimiter') {
                    removeClass([this.inputWrapper], SHOW_CHIP);
                    removeClass([this.inputEle], CHIP_INPUT);
                }
                else {
                    addClass([this.inputWrapper], SHOW_CHIP);
                }
                removeClass([this.inputWrapper], SHOW_TEXT);
                this.ensurePlaceHolder();
            }
        }
        const args = { isInteracted: e ? true : false, event: e };
        this.trigger('focus', args);
    }
    treeAction(e) {
        const eventArgs = {
            cancel: false,
            event: e
        };
        this.trigger('keyPress', eventArgs, (observedArgs) => {
            if (!observedArgs.cancel) {
                switch (e.action) {
                    case 'escape':
                    case 'altUp':
                        this.inputWrapper.focus();
                        e.preventDefault();
                        if (this.isPopupOpen) {
                            this.hidePopup();
                        }
                        break;
                    case 'tab':
                    case 'shiftTab':
                        if (this.isPopupOpen) {
                            this.hidePopup();
                        }
                        break;
                    case 'enter':
                    case 'ctrlEnter':
                    case 'shiftEnter':
                    case 'csEnter':
                        if (!this.showCheckBox) {
                            this.isValueChange = true;
                            this.keyEventArgs = e;
                        }
                        break;
                    case 'space':
                        this.isValueChange = true;
                        this.keyEventArgs = e;
                        break;
                    case 'ctrlA':
                        if (this.allowMultiSelection) {
                            this.selectAll(true);
                        }
                        break;
                    case 'moveRight':
                    case 'moveLeft':
                    case 'shiftDown':
                    case 'moveDown':
                    case 'ctrlDown':
                    case 'csDown':
                    case 'shiftUp':
                    case 'moveUp':
                    case 'ctrlUp':
                    case 'csUp':
                    case 'home':
                    case 'shiftHome':
                    case 'ctrlHome':
                    case 'csHome':
                    case 'end':
                    case 'shiftEnd':
                    case 'ctrlEnd':
                    case 'csEnd':
                }
            }
            else {
                e.stopImmediatePropagation();
            }
        });
    }
    keyActionHandler(e) {
        const eventArgs = {
            cancel: false,
            event: e
        };
        this.trigger('keyPress', eventArgs, (observedArgs) => {
            if (!observedArgs.cancel) {
                switch (e.action) {
                    case 'escape':
                    case 'altUp':
                        if (this.isPopupOpen) {
                            this.hidePopup();
                        }
                        break;
                    case 'shiftTab':
                    case 'tab':
                        if (this.isPopupOpen) {
                            this.hidePopup();
                        }
                        if (this.inputFocus) {
                            this.onFocusOut();
                        }
                        break;
                    case 'altDown':
                        if (!this.isPopupOpen) {
                            this.showPopup();
                            e.preventDefault();
                        }
                        break;
                    case 'moveDown':
                        if (this.showSelectAll && this.showCheckBox) {
                            this.checkAllParent.focus();
                        }
                        break;
                }
            }
        });
    }
    checkAllAction(e) {
        const eventArgs = {
            cancel: false,
            event: e
        };
        this.trigger('keyPress', eventArgs, (observedArgs) => {
            if (!observedArgs.cancel) {
                switch (e.action) {
                    case 'space':
                        this.clickHandler(e);
                        break;
                    case 'moveDown':
                        let focusedElement = this.treeObj.element.querySelector('li');
                        focusedElement.focus();
                        addClass([focusedElement], ['e-node-focus']);
                }
            }
        });
    }
    windowResize() {
        if (this.popupObj) {
            this.popupObj.setProperties({ width: this.setWidth() });
            this.popupObj.refreshPosition();
        }
    }
    resetValueHandler(e) {
        const formElement = closest(this.inputWrapper, 'form');
        if (formElement && e.target === formElement) {
            this.isDynamicChange = true;
            this.setProperties({ value: null }, true);
            this.resetValue(true);
            this.isDynamicChange = false;
        }
    }
    getAriaAttributes() {
        const disable = this.enabled ? 'false' : 'true';
        return {
            'aria-disabled': disable,
            'aria-owns': this.element.id + '_options',
            'role': 'listbox',
            'aria-haspopup': 'true',
            'aria-expanded': 'false',
            'aria-activedescendant': 'null',
            'aria-labelledby': this.hiddenElement.id
        };
    }
    updateOverFlowView() {
        this.overFlowWrapper.classList.remove(TOTAL_COUNT_WRAPPER);
        removeClass([this.overFlowWrapper], HIDEICON);
        if (this.value && this.value.length) {
            let data = '';
            let overAllContainer;
            let temp;
            let tempData;
            let tempIndex = 1;
            let wrapperleng;
            let remaining;
            let downIconWidth = 0;
            this.overFlowWrapper.innerHTML = '';
            // eslint-disable-next-line
            const l10nLocale = { overflowCountTemplate: '+${count} more..', totalCountTemplate: '${count} selected' };
            this.l10n = new L10n(this.getLocaleName(), l10nLocale, this.locale);
            const remainContent = this.l10n.getConstant('overflowCountTemplate');
            const totalContent = this.l10n.getConstant('totalCountTemplate');
            const remainElement = this.createElement('span', { className: REMAIN_WRAPPER });
            this.overFlowWrapper.appendChild(remainElement);
            remainElement.innerText = remainContent.replace('${count}', this.value.length.toString());
            const remainSize = remainElement.offsetWidth;
            remove(remainElement);
            if (this.showDropDownIcon) {
                downIconWidth = select('.' + DDTICON, this.inputWrapper).offsetWidth;
            }
            if (!isNullOrUndefined(this.value)) {
                if (this.mode !== 'Box') {
                    for (let index = 0; !isNullOrUndefined(this.value[index]); index++) {
                        data += (index === 0) ? '' : this.delimiterChar + ' ';
                        temp = this.getOverflowVal(index);
                        data += temp;
                        temp = this.overFlowWrapper.innerHTML;
                        if (this.enableHtmlSanitizer) {
                            this.overFlowWrapper.innerText = data;
                        }
                        else {
                            this.overFlowWrapper.innerHTML = data;
                        }
                        wrapperleng = this.overFlowWrapper.offsetWidth;
                        overAllContainer = this.inputWrapper.offsetWidth;
                        if ((wrapperleng + downIconWidth + this.clearIconWidth) > overAllContainer) {
                            if (tempData !== undefined && tempData !== '') {
                                temp = tempData;
                                index = tempIndex + 1;
                            }
                            this.overFlowWrapper.innerHTML = temp;
                            remaining = this.value.length - index;
                            wrapperleng = this.overFlowWrapper.offsetWidth;
                            while (((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) >= overAllContainer)
                                && wrapperleng !== 0 && this.overFlowWrapper.innerHTML !== '') {
                                const textArr = this.overFlowWrapper.innerHTML.split(this.delimiterChar);
                                textArr.pop();
                                this.overFlowWrapper.innerHTML = textArr.join(this.delimiterChar);
                                remaining++;
                                wrapperleng = this.overFlowWrapper.offsetWidth;
                            }
                            break;
                        }
                        else if ((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) <= overAllContainer) {
                            tempData = data;
                            tempIndex = index;
                        }
                        else if (index === 0) {
                            tempData = '';
                            tempIndex = -1;
                        }
                    }
                }
                else {
                    addClass([this.chipWrapper], HIDEICON);
                    const ele = this.chipWrapper.cloneNode(true);
                    const chips = selectAll('.' + CHIP, ele);
                    for (let i = 0; i < chips.length; i++) {
                        temp = this.overFlowWrapper.innerHTML;
                        this.overFlowWrapper.appendChild(chips[i]);
                        data = this.overFlowWrapper.innerHTML;
                        wrapperleng = this.overFlowWrapper.offsetWidth;
                        overAllContainer = this.inputWrapper.offsetWidth;
                        if ((wrapperleng + downIconWidth + this.clearIconWidth) > overAllContainer) {
                            if (tempData !== undefined && tempData !== '') {
                                temp = tempData;
                                i = tempIndex + 1;
                            }
                            this.overFlowWrapper.innerHTML = temp;
                            remaining = this.value.length - i;
                            wrapperleng = this.overFlowWrapper.offsetWidth;
                            while (((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) >= overAllContainer)
                                && wrapperleng !== 0 && this.overFlowWrapper.innerHTML !== '') {
                                this.overFlowWrapper.removeChild(this.overFlowWrapper.lastChild);
                                remaining++;
                                wrapperleng = this.overFlowWrapper.offsetWidth;
                            }
                            break;
                        }
                        else if ((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) <= overAllContainer) {
                            tempData = data;
                            tempIndex = i;
                        }
                        else if (i === 0) {
                            tempData = '';
                            tempIndex = -1;
                        }
                    }
                }
            }
            if (remaining > 0) {
                this.overFlowWrapper.appendChild(this.updateRemainTemplate(remainElement, remaining, remainContent, totalContent));
            }
            if (this.mode === 'Box' && !this.overFlowWrapper.classList.contains(TOTAL_COUNT_WRAPPER)) {
                addClass([remainElement], REMAIN_COUNT);
            }
        }
        else {
            this.overFlowWrapper.innerHTML = '';
            addClass([this.overFlowWrapper], HIDEICON);
        }
        this.updateDelimMode();
    }
    updateRemainTemplate(remainElement, remaining, remainContent, totalContent) {
        if (this.overFlowWrapper.firstChild && this.overFlowWrapper.firstChild.nodeType === 3 &&
            this.overFlowWrapper.firstChild.nodeValue === '') {
            this.overFlowWrapper.removeChild(this.overFlowWrapper.firstChild);
        }
        remainElement.innerHTML = '';
        remainElement.innerText = (this.overFlowWrapper.firstChild && (this.overFlowWrapper.firstChild.nodeType === 3 || this.mode === 'Box')) ?
            remainContent.replace('${count}', remaining.toString()) : totalContent.replace('${count}', remaining.toString());
        if (this.overFlowWrapper.firstChild && (this.overFlowWrapper.firstChild.nodeType === 3 || this.mode === 'Box')) {
            removeClass([this.overFlowWrapper], TOTAL_COUNT_WRAPPER);
        }
        else {
            addClass([this.overFlowWrapper], TOTAL_COUNT_WRAPPER);
            removeClass([this.overFlowWrapper], REMAIN_COUNT);
        }
        return remainElement;
    }
    getOverflowVal(index) {
        // eslint-disable-next-line
        const selectedData = this.getSelectedData(this.value[index]);
        return getValue(this.treeSettings.loadOnDemand ? this.fields.text : 'text', selectedData);
    }
    updateDelimMode() {
        if (this.mode !== 'Box') {
            if (select('.' + REMAIN_WRAPPER, this.overFlowWrapper) && !this.overFlowWrapper.classList.contains(TOTAL_COUNT_WRAPPER)) {
                addClass([this.overFlowWrapper], REMAIN_COUNT);
                addClass([this.overFlowWrapper], SHOW_TEXT);
            }
            else {
                this.overFlowWrapper.classList.remove(REMAIN_COUNT);
                removeClass([this.overFlowWrapper], REMAIN_COUNT);
            }
        }
        else if (select('.' + REMAIN_WRAPPER, this.overFlowWrapper)) {
            this.overFlowWrapper.classList.remove(REMAIN_COUNT);
        }
    }
    createHiddenElement() {
        if (this.allowMultiSelection || this.showCheckBox) {
            this.hiddenElement = this.createElement('select', {
                attrs: { 'aria-hidden': 'true', 'class': HIDDENELEMENT, 'tabindex': '-1', 'multiple': '' }
            });
        }
        else {
            this.hiddenElement = this.createElement('select', {
                attrs: { 'aria-hidden': 'true', 'tabindex': '-1', 'class': HIDDENELEMENT }
            });
        }
        prepend([this.hiddenElement], this.inputWrapper);
        this.validationAttribute();
    }
    createClearIcon() {
        this.overAllClear = this.createElement('span', {
            className: CLOSEICON_CLASS
        });
        addClass([this.overAllClear], HIDEICON);
        removeClass([this.inputWrapper], SHOW_CLEAR);
        if (this.showClearButton) {
            this.inputWrapper.insertBefore(this.overAllClear, this.inputObj.buttons[0]);
        }
    }
    validationAttribute() {
        const name = this.inputEle.getAttribute('name') ? this.inputEle.getAttribute('name') : this.inputEle.getAttribute('id');
        this.hiddenElement.setAttribute('name', name);
        this.inputEle.removeAttribute('name');
        const attributes$$1 = ['required', 'aria-required', 'form'];
        for (let i = 0; i < attributes$$1.length; i++) {
            const attr = this.inputEle.getAttribute(attributes$$1[i]);
            if (attr) {
                this.hiddenElement.setAttribute(attributes$$1[i], attr);
                this.inputEle.removeAttribute(attributes$$1[i]);
            }
        }
    }
    createChip() {
        if (!this.inputWrapper.contains(this.chipWrapper)) {
            this.chipWrapper = this.createElement('span', {
                className: CHIP_WRAPPER
            });
            this.chipCollection = this.createElement('span', {
                className: CHIP_COLLECTION
            });
            this.chipWrapper.appendChild(this.chipCollection);
            this.inputWrapper.insertBefore(this.chipWrapper, this.hiddenElement);
            addClass([this.inputWrapper], SHOW_CHIP);
            const isValid = this.getValidMode();
            if (isValid && this.value !== null && (this.value && this.value.length !== 0)) {
                addClass([this.inputEle], CHIP_INPUT);
            }
            else if (this.value === null || (this.value && this.value.length === 0) || this.checkWrapper) {
                addClass([this.chipWrapper], HIDEICON);
            }
        }
    }
    getValidMode() {
        if (this.allowMultiSelection || this.showCheckBox) {
            return this.mode === 'Box' ? true : (this.mode === 'Default' && this.inputFocus) ? true : false;
        }
        else {
            return false;
        }
    }
    createSelectAllWrapper() {
        this.checkAllParent = this.createElement('div', {
            className: CHECKALLPARENT, attrs: { 'tabindex': '0' }
        });
        this.selectAllSpan = this.createElement('span', {
            className: ALLTEXT
        });
        this.selectAllSpan.textContent = '';
        const ele = closest(this.element, '.' + BIGGER);
        const touchClass = isNullOrUndefined(ele) ? '' : SMALL;
        this.checkBoxElement = createCheckBox(this.createElement, true, { cssClass: touchClass });
        this.checkBoxElement.setAttribute('role', 'checkbox');
        this.checkAllParent.appendChild(this.checkBoxElement);
        this.checkAllParent.appendChild(this.selectAllSpan);
        this.setLocale();
        EventHandler.add(this.checkAllParent, 'mouseup', this.clickHandler, this);
        this.wireCheckAllWrapperEvents();
    }
    clickHandler(e) {
        let target;
        if ((e.currentTarget && e.currentTarget.classList.contains(CHECKALLPARENT))) {
            target = e.currentTarget.firstElementChild.lastElementChild;
        }
        else {
            target = e.target;
        }
        this.checkWrapper = closest(target, '.' + CHECKBOXWRAP);
        if (!isNullOrUndefined(this.checkWrapper)) {
            this.isClicked = true;
            const checkElement = select('.' + CHECKBOXFRAME, this.checkWrapper);
            this.changeState(this.checkWrapper, checkElement.classList.contains(CHECK) ? 'uncheck' : 'check', e);
            this.isClicked = false;
        }
        e.preventDefault();
    }
    changeState(wrapper, state, e) {
        let ariaState;
        const frameSpan = wrapper.getElementsByClassName(CHECKBOXFRAME)[0];
        if (state === 'check' && !frameSpan.classList.contains(CHECK)) {
            frameSpan.classList.add(CHECK);
            ariaState = 'true';
            if (!this.isReverseUpdate) {
                this.isCheckAllCalled = true;
                this.treeObj.checkAll();
                if (!this.changeOnBlur) {
                    this.triggerChangeEvent(e);
                }
            }
            this.setLocale(true);
        }
        else if (state === 'uncheck' && (frameSpan.classList.contains(CHECK))) {
            frameSpan.classList.remove(CHECK);
            ariaState = 'false';
            if (!this.isReverseUpdate) {
                this.treeObj.uncheckAll();
                if (!this.changeOnBlur) {
                    this.triggerChangeEvent(e);
                }
            }
            this.setLocale(false);
        }
        this.setMultiSelect();
        this.ensurePlaceHolder();
        ariaState = state === 'check' ? 'true' : 'false';
        if (!isNullOrUndefined(ariaState)) {
            wrapper.setAttribute('aria-checked', ariaState);
        }
    }
    setLocale(unSelect) {
        if (!this.selectAllSpan) {
            return;
        }
        if (this.selectAllText !== 'Select All' || this.unSelectAllText !== 'Unselect All') {
            const template = unSelect ? this.unSelectAllText : this.selectAllText;
            this.selectAllSpan.textContent = '';
            // eslint-disable-next-line
            const compiledString = compile(template);
            const templateName = unSelect ? 'unSelectAllText' : 'selectAllText';
            for (const item of compiledString({}, this, templateName, null, !this.isStringTemplate)) {
                this.selectAllSpan.textContent = item.textContent;
            }
        }
        else {
            this.selectAllSpan.textContent = unSelect ? this.unSelectAllText : this.selectAllText;
        }
    }
    setAttributes() {
        this.inputEle.setAttribute('tabindex', '-1');
        const id = this.element.getAttribute('id');
        this.hiddenElement.id = id + '_hidden';
        this.inputWrapper.setAttribute('tabindex', '0');
        attributes(this.inputWrapper, this.getAriaAttributes());
    }
    setHTMLAttributes() {
        if (Object.keys(this.htmlAttributes).length) {
            for (const htmlAttr of Object.keys(this.htmlAttributes)) {
                if (htmlAttr === 'class') {
                    this.inputWrapper.classList.add(this.htmlAttributes[`${htmlAttr}`]);
                }
                else if (htmlAttr === 'disabled' && this.htmlAttributes[`${htmlAttr}`] === 'disabled') {
                    this.setProperties({ enabled: false }, true);
                    this.setEnable();
                }
                else if (htmlAttr === 'readonly' && !isNullOrUndefined(this.htmlAttributes[`${htmlAttr}`])) {
                    this.setProperties({ readonly: true }, true);
                    this.dataBind();
                }
                else if (htmlAttr === 'style') {
                    this.inputWrapper.setAttribute('style', this.htmlAttributes[`${htmlAttr}`]);
                }
                else {
                    const defaultAttr = ['title', 'id', 'placeholder', 'aria-placeholder',
                        'role', 'autocorrect', 'autocomplete', 'autocapitalize', 'spellcheck', 'minlength', 'maxlength'];
                    const validateAttr = ['name', 'required'];
                    if (htmlAttr.indexOf('data') === 0 || validateAttr.indexOf(htmlAttr) > -1) {
                        this.hiddenElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                    else if (defaultAttr.indexOf(htmlAttr) > -1) {
                        if (htmlAttr === 'placeholder') {
                            Input.setPlaceholder(this.htmlAttributes[`${htmlAttr}`], this.inputEle);
                        }
                        else {
                            this.inputEle.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                    }
                    else {
                        this.inputWrapper.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                }
            }
        }
    }
    updateDataAttribute() {
        const value = this.htmlAttributes;
        const invalidAttr = ['class', 'style', 'id', 'type'];
        const attr = {};
        for (let a = 0; a < this.element.attributes.length; a++) {
            if (invalidAttr.indexOf(this.element.attributes[a].name) === -1 &&
                !(this.element.attributes[a].name === 'readonly')) {
                attr[this.element.attributes[a].name] = this.element.getAttribute(this.element.attributes[a].name);
            }
        }
        extend(attr, value, attr);
        this.setProperties({ htmlAttributes: attr }, true);
    }
    showOverAllClear() {
        if (!this.enabled || this.readonly) {
            return;
        }
        if (this.overAllClear) {
            const isValue = this.value ? (this.value.length ? true : false) : false;
            if (isValue && this.showClearButton) {
                removeClass([this.overAllClear], HIDEICON);
                addClass([this.inputWrapper], SHOW_CLEAR);
            }
            else {
                addClass([this.overAllClear], HIDEICON);
                removeClass([this.inputWrapper], SHOW_CLEAR);
            }
        }
    }
    setTreeValue() {
        if (this.value !== null && this.value.length !== 0) {
            // eslint-disable-next-line
            let data;
            if (this.showCheckBox || this.allowMultiSelection) {
                for (let i = 0; i < this.value.length; i++) {
                    data = this.treeObj.getTreeData(this.value[i])[0];
                    if (isNullOrUndefined(data)) {
                        this.value.splice(this.value.indexOf(this.value[i]), 1);
                    }
                }
                if (this.value.length !== 0) {
                    this.setValidValue();
                }
            }
            else {
                data = this.treeObj.getTreeData(this.value[0])[0];
                if (!isNullOrUndefined(data)) {
                    this.setProperties({ text: data[this.fields.text] }, true);
                    this.setValidValue();
                }
                else {
                    this.setProperties({ value: this.currentValue }, true);
                }
            }
        }
    }
    setTreeText() {
        if (this.value !== null && !this.isInitialized) {
            return;
        }
        if (this.text !== null) {
            // eslint-disable-next-line
            let data;
            const valArr = [];
            if (this.showCheckBox || this.allowMultiSelection) {
                const textArr = this.text.split(this.delimiterChar);
                for (let i = 0; i < textArr.length; i++) {
                    data = this.getItems(textArr[i]);
                    if (!isNullOrUndefined(data)) {
                        valArr.push(data[this.fields.value].toString());
                    }
                }
                if (valArr.length !== 0) {
                    this.oldValue = this.value;
                    this.setProperties({ value: valArr }, true);
                    this.setValidValue();
                }
                else {
                    this.setProperties({ text: this.currentText }, true);
                }
            }
            else {
                data = this.getItems(this.text);
                if (!isNullOrUndefined(data)) {
                    this.oldValue = this.value;
                    this.setProperties({ value: [data[this.fields.value].toString()] }, true);
                    this.setValidValue();
                }
                else {
                    this.setProperties({ text: this.currentText }, true);
                }
            }
        }
    }
    setSelectedValue() {
        if (this.value != null) {
            return;
        }
        if (!this.isInitialized) {
            this.oldValue = this.value;
            if (this.treeObj.selectedNodes.length > 0 && !this.showCheckBox) {
                this.setProperties({ value: this.treeObj.selectedNodes }, true);
                if (this.allowMultiSelection) {
                    this.updateMode();
                }
            }
            else if (this.showCheckBox && this.treeObj.checkedNodes) {
                if (this.treeObj.checkedNodes.length > 0) {
                    this.setProperties({ value: this.treeObj.checkedNodes }, true);
                    setValue('selectedNodes', [], this.treeObj);
                    this.treeObj.dataBind();
                    this.updateMode();
                }
            }
            this.updateSelectedValues();
            this.currentText = this.text;
            this.currentValue = this.value;
        }
    }
    setValidValue() {
        if (!this.showCheckBox && !this.allowMultiSelection) {
            Input.setValue(this.text, this.inputEle, this.floatLabelType);
            const id = this.value[0].toString();
            if (this.treeObj.selectedNodes[0] !== id) {
                setValue('selectedNodes', [id], this.treeObj);
            }
        }
        else {
            if (this.showCheckBox) {
                let difference = this.value.filter((e) => {
                    return this.treeObj.checkedNodes.indexOf(e) === -1;
                });
                if (difference.length > 0 || this.treeSettings.autoCheck) {
                    this.treeObj.checkedNodes = this.value.slice();
                    this.treeObj.dataBind();
                    this.setMultiSelect();
                }
            }
            else {
                this.treeObj.selectedNodes = this.value.slice();
                this.selectedText = [];
                this.updateSelectedValues();
            }
            this.treeObj.dataBind();
        }
        this.currentText = this.text;
        this.currentValue = this.value;
        if (this.isInitialized) {
            this.triggerChangeEvent();
        }
    }
    // eslint-disable-next-line
    getItems(givenText) {
        // eslint-disable-next-line
        let data;
        if (this.treeDataType === 1) {
            for (let i = 0; i < this.treeItems.length; i++) {
                // eslint-disable-next-line
                const text = getValue(this.fields.text, this.treeItems[i]);
                if (!isNullOrUndefined(this.treeItems[i]) && !isNullOrUndefined(text) && text === givenText) {
                    data = this.treeItems[i];
                    break;
                }
            }
        }
        else {
            data = this.getNestedItems(this.treeItems, this.fields, givenText);
        }
        return data;
    }
    // eslint-disable-next-line
    getNestedItems(data, field, givenText) {
        // eslint-disable-next-line
        let newData;
        for (let i = 0, objlen = data.length; i < objlen; i++) {
            // eslint-disable-next-line
            const dataId = getValue(this.fields.text, data[i]);
            if (data[i] && dataId && dataId.toString() === givenText) {
                return data[i];
            }
            else if (typeof field.child === 'string' && !isNullOrUndefined(getValue(field.child, data[i]))) {
                // eslint-disable-next-line
                const childData = getValue(field.child, data[i]);
                // eslint-disable-next-line
                newData = this.getNestedItems(childData, this.getChildType(field), givenText);
                if (newData !== undefined) {
                    break;
                }
            }
            else if (this.fields.dataSource instanceof DataManager && !isNullOrUndefined(getValue('child', data[i]))) {
                const child = 'child';
                // eslint-disable-next-line
                newData = this.getNestedItems(getValue(child, data[i]), this.getChildType(field), givenText);
                if (newData !== undefined) {
                    break;
                }
            }
        }
        return newData;
    }
    getChildType(mapper) {
        return (typeof mapper.child === 'string' || isNullOrUndefined(mapper.child)) ? mapper : mapper.child;
    }
    /* To render the treeview */
    renderTree() {
        this.treeObj = new TreeView({
            fields: this.getTreeFields(this.fields),
            enableRtl: this.enableRtl,
            nodeSelected: this.onNodeSelected.bind(this),
            nodeChecked: this.onNodeChecked.bind(this),
            nodeChecking: this.beforeCheck.bind(this),
            nodeExpanded: this.onNodeExpanded.bind(this),
            actionFailure: this.onActionFailure.bind(this),
            nodeClicked: this.onNodeClicked.bind(this),
            dataBound: this.OnDataBound.bind(this),
            allowMultiSelection: this.allowMultiSelection,
            enableHtmlSanitizer: this.enableHtmlSanitizer,
            showCheckBox: this.showCheckBox,
            autoCheck: this.treeSettings.autoCheck,
            sortOrder: this.sortOrder,
            expandOn: this.treeSettings.expandOn,
            loadOnDemand: this.treeSettings.loadOnDemand,
            nodeSelecting: this.onBeforeSelect.bind(this),
            nodeTemplate: this.itemTemplate
        });
        this.treeObj.root = this.root ? this.root : this;
        this.treeObj.appendTo('#' + this.tree.id);
    }
    /* To render the popup element */
    renderPopup() {
        if (this.isFilteredData) {
            this.filterObj.value = '';
            this.treeObj.fields = this.getTreeFields(this.fields);
            this.isFilterRestore = true;
            this.isFilteredData = false;
            this.hideCheckAll(false);
        }
        let isCancelled = false;
        const args = { cancel: false };
        this.trigger('beforeOpen', args, (args) => {
            if (!args.cancel) {
                addClass([this.inputWrapper], [ICONANIMATION]);
                if (this.isFirstRender) {
                    this.popupEle = this.createElement('div', {
                        id: this.element.id + '_popup', className: POPUP_CLASS + ' ' + (this.cssClass != null ? this.cssClass : '')
                    });
                    document.body.appendChild(this.popupEle);
                    this.createPopup(this.popupEle);
                }
                else {
                    this.popupEle = this.popupObj.element;
                }
            }
            else {
                isCancelled = true;
            }
            if (this.isFirstRender && !isCancelled) {
                prepend([this.popupDiv], this.popupEle);
                removeClass([this.popupDiv], DDTHIDEICON);
                if (this.allowFiltering) {
                    this.renderFilter();
                }
                if (this.showCheckBox && this.showSelectAll && (!this.popupDiv.classList.contains(NODATA))) {
                    this.createSelectAllWrapper();
                    this.popupEle.insertBefore(this.checkAllParent, this.popupDiv);
                }
                if (this.headerTemplate) {
                    this.setHeaderTemplate();
                }
                if (this.footerTemplate) {
                    this.setFooterTemplate();
                }
                this.isFirstRender = false;
                /* eslint-disable */
                if (this.hasTemplate && this.portals) {
                    this.portals = this.portals.concat(this.treeObj.portals);
                    /* eslint-enable */
                    this.renderReactTemplates();
                }
            }
            if (!isCancelled) {
                attributes(this.inputWrapper, { 'aria-expanded': 'true' });
                this.popupObj.show(null, (this.zIndex === 1000) ? this.inputEle : null);
                removeClass([this.popupEle], DDTHIDEICON);
                this.updatePopupHeight();
                this.popupObj.refreshPosition();
                if (!(this.showCheckBox && this.showSelectAll) && (!this.popupDiv.classList.contains(NODATA)
                    && this.treeItems.length > 0)) {
                    let focusedElement = this.treeObj.element.querySelector('li');
                    focusedElement.focus();
                    addClass([focusedElement], ['e-node-focus']);
                }
                if (this.checkSelectAll && this.checkBoxElement) {
                    const wrap = closest(this.checkBoxElement, '.' + CHECKBOXWRAP);
                    this.changeState(wrap, 'check');
                    this.checkSelectAll = false;
                }
                if (this.allowFiltering) {
                    removeClass([this.inputWrapper], [INPUTFOCUS]);
                    this.filterObj.element.focus();
                }
                const eventArgs = { popup: this.popupObj };
                this.trigger('open', eventArgs);
            }
        });
    }
    updatePopupHeight() {
        if (this.isFirstRender) {
            return;
        }
        let popupHeight = this.getHeight();
        this.popupEle.style.maxHeight = popupHeight;
        if (this.allowFiltering) {
            const height = Math.round(this.filterContainer.getBoundingClientRect().height);
            popupHeight = formatUnit(parseInt(popupHeight, 10) - height + 'px');
        }
        if (this.headerTemplate) {
            const height = Math.round(this.header.getBoundingClientRect().height);
            popupHeight = formatUnit(parseInt(popupHeight, 10) - height + 'px');
        }
        if (this.showCheckBox && this.showSelectAll && (!this.popupDiv.classList.contains(NODATA))) {
            const height = Math.round(this.checkAllParent.getBoundingClientRect().height);
            popupHeight = formatUnit(parseInt(popupHeight, 10) - height + 'px');
        }
        if (this.footerTemplate) {
            const height = Math.round(this.footer.getBoundingClientRect().height);
            popupHeight = formatUnit(parseInt(popupHeight, 10) - height + 'px');
        }
        let border = parseInt(window.getComputedStyle(this.popupEle).borderTopWidth, 10);
        border = border + parseInt(window.getComputedStyle(this.popupEle).borderBottomWidth, 10);
        popupHeight = formatUnit(parseInt(popupHeight, 10) - border + 'px');
        this.popupDiv.style.maxHeight = popupHeight;
    }
    createPopup(element) {
        if (this.isFirstRender) {
            this.popupObj = new Popup(element, {
                width: this.setWidth(),
                targetType: 'relative',
                collision: { X: 'flip', Y: 'flip' },
                relateTo: this.inputWrapper,
                zIndex: this.zIndex,
                enableRtl: this.enableRtl,
                position: { X: 'left', Y: 'bottom' },
                close: () => {
                    this.isPopupOpen = false;
                },
                open: () => {
                    EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
                    this.isPopupOpen = true;
                },
                targetExitViewport: () => {
                    if (!Browser.isDevice) {
                        this.hidePopup();
                    }
                }
            });
        }
    }
    /* To calculate the width when change via set model */
    setElementWidth(inputWidth) {
        const ddElement = this.inputWrapper;
        if (!isNullOrUndefined(inputWidth)) {
            if (typeof inputWidth === 'number') {
                ddElement.style.width = formatUnit(inputWidth);
            }
            else if (typeof inputWidth === 'string') {
                ddElement.style.width = (inputWidth.match(/px|%|em/)) ? (inputWidth) :
                    (formatUnit(inputWidth));
            }
        }
    }
    /* To calculate the width of the popup */
    setWidth() {
        let width = formatUnit(this.popupWidth);
        if (width.indexOf('%') > -1) {
            width = (this.inputWrapper.offsetWidth * parseFloat(width) / 100).toString() + 'px';
        }
        else if (typeof this.popupWidth === 'string') {
            width = (this.popupWidth.match(/px|em/)) ? (this.popupWidth) : width;
        }
        return width;
    }
    /* To calculate the height of the popup */
    getHeight() {
        let height = formatUnit(this.popupHeight);
        if (height.indexOf('%') > -1) {
            // Will set the height of the popup according to the view port height
            height = (document.documentElement.clientHeight * parseFloat(height) / 100).toString() + 'px';
        }
        else if (typeof this.popupHeight === 'string') {
            height = (this.popupHeight.match(/px|em/)) ? (this.popupHeight) : height;
        }
        return height;
    }
    onDocumentClick(e) {
        const target = e.target;
        const isTree = closest(target, '.' + PARENTITEM);
        const isFilter = closest(target, '.' + FILTERWRAP);
        const isHeader = closest(target, '.' + HEADER);
        const isFooter = closest(target, '.' + FOOTER);
        const isScroller = target.classList.contains(DROPDOWN) ? true :
            (matches(target, '.e-ddt .e-popup') || matches(target, '.e-ddt .e-treeview'));
        if ((this.isPopupOpen && (this.inputWrapper.contains(target) || isTree || isScroller || isHeader || isFooter)) ||
            ((this.allowMultiSelection || this.showCheckBox) && (this.isPopupOpen && target.classList.contains(CHIP_CLOSE) ||
                (this.isPopupOpen && (target.classList.contains(CHECKALLPARENT) || target.classList.contains(ALLTEXT)
                    || target.classList.contains(CHECKBOXFRAME)))))) {
            this.isDocumentClick = false;
            e.preventDefault();
        }
        else if (!isNullOrUndefined(this.inputWrapper) && !this.inputWrapper.contains(target) && this.inputFocus && !isFilter) {
            this.focusOut(e);
        }
    }
    onActionFailure(e) {
        this.trigger('actionFailure', e);
        this.l10nUpdate(true);
        addClass([this.popupDiv], NODATA);
    }
    OnDataBound(args) {
        this.treeItems = args.data;
        if (this.treeItems.length <= 0) {
            this.l10nUpdate();
            addClass([this.popupDiv], NODATA);
            this.hideCheckAll(true);
        }
        else if (this.popupDiv.classList.contains(NODATA) && this.treeItems.length >= 1) {
            removeClass([this.popupDiv], NODATA);
            this.hideCheckAll(false);
        }
        this.treeDataType = this.getTreeDataType(this.treeItems, this.fields);
        if (this.isFirstRender && this.isRemoteData) {
            this.setTreeValue();
            this.setTreeText();
            this.updateHiddenValue();
            this.setSelectedValue();
            if (!this.wrapText) {
                this.updateView();
            }
            this.treeObj.element.focus();
        }
        const eventArgs = { data: args.data };
        this.trigger('dataBound', eventArgs);
        if (this.filterObj === null) {
            this.isFilteredData = false;
        }
        if (this.isFilteredData) {
            this.treeObj.expandAll();
        }
        if (this.isFilterRestore) {
            this.restoreFilterSelection();
            this.isFilterRestore = false;
        }
    }
    restoreFilterSelection() {
        if (this.showCheckBox) {
            this.treeObj.checkedNodes = this.value ? this.value : [];
        }
        else {
            this.treeObj.selectedNodes = this.value ? this.value : [];
        }
    }
    /* To set cssclass for the dropdowntree */
    setCssClass(newClass, oldClass) {
        const elements = this.popupObj ? [this.inputWrapper, this.popupObj.element] : [this.inputWrapper];
        if (!isNullOrUndefined(oldClass) && oldClass !== '') {
            removeClass(elements, oldClass.split(' '));
        }
        if (!isNullOrUndefined(newClass) && newClass !== '') {
            addClass(elements, newClass.split(' '));
        }
    }
    setEnableRTL(state) {
        if (state) {
            this.inputWrapper.classList.add(RTL);
        }
        else {
            this.inputWrapper.classList.remove(RTL);
        }
        if (this.popupObj) {
            this.popupObj.enableRtl = state;
            this.popupObj.dataBind();
        }
        if (this.treeObj) {
            this.treeObj.enableRtl = state;
            this.treeObj.dataBind();
        }
    }
    /* To set enable property */
    setEnable() {
        Input.setEnabled(this.enabled, this.inputEle);
        if (this.enabled) {
            removeClass([this.inputWrapper], DISABLED);
            this.inputEle.setAttribute('aria-disabled', 'false');
            this.inputWrapper.setAttribute('aria-disabled', 'false');
        }
        else {
            if (this.isPopupOpen) {
                this.hidePopup();
            }
            addClass([this.inputWrapper], DISABLED);
            if (this.inputWrapper && this.inputWrapper.classList.contains(INPUTFOCUS)) {
                removeClass([this.inputWrapper], [INPUTFOCUS]);
            }
            this.inputEle.setAttribute('aria-disabled', 'true');
            this.inputWrapper.setAttribute('aria-disabled', 'true');
        }
    }
    cloneFields(fields) {
        const clonedField = {
            dataSource: fields.dataSource, value: fields.value, text: fields.text, parentValue: fields.parentValue,
            child: this.cloneChildField(fields.child), hasChildren: fields.hasChildren, expanded: fields.expanded,
            iconCss: fields.iconCss, imageUrl: fields.imageUrl, htmlAttributes: fields.htmlAttributes, query: fields.query,
            selected: fields.selected, selectable: fields.selectable, tableName: fields.tableName, tooltip: fields.tooltip
        };
        return clonedField;
    }
    cloneChildField(fields) {
        if (typeof fields === 'string') {
            return fields;
        }
        else {
            const clonedField = {
                dataSource: fields.dataSource, value: fields.value, text: fields.text, parentValue: fields.parentValue,
                child: (fields.child ? this.cloneChildField(fields.child) : null), hasChildren: fields.hasChildren,
                expanded: fields.expanded, iconCss: fields.iconCss, imageUrl: fields.imageUrl, htmlAttributes: fields.htmlAttributes,
                query: fields.query, selected: fields.selected, selectable: fields.selectable, tableName: fields.tableName, tooltip: fields.tooltip
            };
            return clonedField;
        }
    }
    getTreeFields(fields) {
        const treeFields = {
            dataSource: fields.dataSource, id: fields.value, text: fields.text, parentID: fields.parentValue,
            child: this.getTreeChildren(fields.child), hasChildren: fields.hasChildren, expanded: fields.expanded,
            iconCss: fields.iconCss, imageUrl: fields.imageUrl, isChecked: fields.selected,
            htmlAttributes: fields.htmlAttributes, query: fields.query, selectable: fields.selectable, selected: fields.selected,
            tableName: fields.tableName, tooltip: fields.tooltip
        };
        return treeFields;
    }
    getTreeChildren(mapper) {
        if (typeof mapper === 'string') {
            return mapper;
        }
        else if (!isNullOrUndefined(mapper)) {
            mapper = this.getActualProperties(mapper);
            const childFields = mapper;
            if (mapper.value) {
                childFields.id = mapper.value;
            }
            if (mapper.parentValue) {
                childFields.parentID = mapper.parentValue;
            }
            if (mapper.child) {
                childFields.child = this.getTreeChildren(mapper.child);
            }
            if (mapper.selected && this.showCheckBox) {
                childFields.isChecked = mapper.selected;
            }
            return childFields;
        }
        return null;
    }
    // eslint-disable-next-line
    getTreeDataType(ds, field) {
        if (this.fields.dataSource instanceof DataManager) {
            for (let i = 0; i < ds.length; i++) {
                if ((typeof field.child === 'string') && isNullOrUndefined(getValue(field.child, ds[i]))) {
                    return 1;
                }
            }
            return 2;
        }
        if (isNullOrUndefined(this.fields.dataSource))
            this.fields.dataSource = [];
        for (let i = 0, len = this.fields.dataSource.length; i < len; i++) {
            if ((typeof field.child === 'string') && !isNullOrUndefined(getValue(field.child, this.fields.dataSource[i]))) {
                return 2;
            }
            if (!isNullOrUndefined(getValue(field.parentValue, this.fields.dataSource[i])) || !isNullOrUndefined(getValue(field.hasChildren, this.fields.dataSource[i]))) {
                return 1;
            }
        }
        return 1;
    }
    /* Triggers when the tree fields is changed dynamically */
    setFields() {
        this.resetValue();
        if (this.hasTemplate) {
            this.updateTemplate();
        }
        this.treeObj.fields = this.getTreeFields(this.fields);
        this.treeObj.dataBind();
    }
    getEventArgs(args) {
        // eslint-disable-next-line
        const checkData = args.data;
        // eslint-disable-next-line
        const selectData = args.nodeData;
        let state;
        if (this.showCheckBox) {
            if (args.action === 'check') {
                state = 'select';
            }
            else if (args.action === 'uncheck') {
                state = 'un-select';
            }
        }
        const eventArgs = {
            action: this.showCheckBox ? state : args.action,
            isInteracted: this.isClicked ? true : args.isInteracted,
            item: args.node,
            itemData: this.showCheckBox ? checkData[0] : selectData
        };
        return eventArgs;
    }
    onBeforeSelect(args) {
        if (args.isInteracted) {
            this.oldValue = this.value ? this.value.slice() : this.value;
            if (this.value === null) {
                this.setProperties({ value: [] }, true);
            }
        }
    }
    updateHiddenValue() {
        if (this.allowMultiSelection || this.showCheckBox) {
            return;
        }
        if (this.value && this.value.length) {
            this.hiddenElement.innerHTML = '<option selected value ="' + this.value[0] + '">' + this.text + '</option>';
        }
        else {
            this.hiddenElement.innerHTML = '';
        }
    }
    /* Triggers when the tree node is selected */
    onNodeSelected(args) {
        if (this.showCheckBox) {
            return;
        }
        let selectedText;
        if (args.isInteracted) {
            const id = getValue('id', args.nodeData).toString();
            if (!this.allowMultiSelection) {
                this.hiddenElement.innerHTML = '';
                this.setProperties({ value: [id] }, true);
                if (this.itemTemplate) {
                    selectedText = getValue('text', this.treeObj.getNode(id));
                }
                else {
                    selectedText = getValue('text', args.nodeData).toString();
                }
                Input.setValue(selectedText, this.inputEle, this.floatLabelType);
                this.setProperties({ text: selectedText }, true);
                this.currentText = this.text;
                this.currentValue = this.value;
                attributes(this.inputWrapper, { 'aria-describedby': this.element.id });
                attributes(this.inputWrapper, { 'aria-activedescendant': id.toString() });
                this.updateHiddenValue();
                this.showOverAllClear();
                this.hidePopup();
                this.isNodeSelected = true;
            }
            else if (this.allowMultiSelection) {
                this.setMultiSelect();
            }
        }
        const eventArgs = this.getEventArgs(args);
        this.trigger('select', eventArgs);
        if (this.isValueChange && !this.changeOnBlur) {
            this.triggerChangeEvent(this.keyEventArgs);
            this.isValueChange = false;
        }
    }
    onNodeClicked(args) {
        if (!this.changeOnBlur && this.isNodeSelected) {
            this.triggerChangeEvent(args.event);
            this.isNodeSelected = false;
        }
        const target = args.event.target;
        if ((target.classList.contains('e-fullrow') || target.classList.contains('e-list-text')) && this.showCheckBox) {
            this.isClicked = true;
            // eslint-disable-next-line
            const getNodeDetails = this.treeObj.getNode(args.node);
            if (getNodeDetails.isChecked === 'true') {
                this.treeObj.uncheckAll([args.node]);
            }
            else {
                this.treeObj.checkAll([args.node]);
            }
            this.isClicked = false;
            this.setMultiSelect();
            this.ensurePlaceHolder();
        }
        if (!this.changeOnBlur && (this.allowMultiSelection || this.showCheckBox)) {
            this.triggerChangeEvent(args.event);
        }
    }
    onNodeChecked(args) {
        const eventArgs = this.getEventArgs(args);
        this.trigger('select', eventArgs);
        if (this.isFilteredData && args.action === 'uncheck') {
            const id = getValue('id', args.data[0]).toString();
            this.removeSelectedData(id, true);
        }
        if (!this.isChipDelete && args.isInteracted) {
            this.setMultiSelect();
            this.ensurePlaceHolder();
        }
        if (this.showSelectAll && this.checkBoxElement) {
            const nodes = this.treeObj.element.querySelectorAll('li');
            const checkedNodes = this.treeObj.element.querySelectorAll('li .e-checkbox-wrapper[aria-checked=true]');
            const wrap = closest(this.checkBoxElement, '.' + CHECKBOXWRAP);
            if (wrap && args.action === 'uncheck' && (args.isInteracted || checkedNodes.length === 0)) {
                this.isReverseUpdate = true;
                this.changeState(wrap, 'uncheck');
                this.isReverseUpdate = false;
            }
            else if (wrap && args.action === 'check' && checkedNodes.length === nodes.length && (args.isInteracted || this.isCheckAllCalled)) {
                this.isReverseUpdate = true;
                this.isCheckAllCalled = false;
                this.changeState(wrap, 'check');
                this.isReverseUpdate = false;
            }
        }
    }
    beforeCheck(args) {
        if (args.isInteracted) {
            this.oldValue = this.value ? this.value.slice() : this.value;
        }
    }
    onNodeExpanded(args) {
        if (this.hasTemplate && this.portals) {
            this.portals = [].concat(this.treeObj.portals);
            /* eslint-enable */
            this.renderReactTemplates();
        }
    }
    updateClearButton(state) {
        if (state) {
            if (!this.inputWrapper.contains(this.overAllClear)) {
                this.inputEle.parentElement.insertBefore(this.overAllClear, this.inputEle.nextSibling);
            }
            else {
                removeClass([this.overAllClear], HIDEICON);
                addClass([this.inputWrapper], SHOW_CLEAR);
            }
        }
        else {
            addClass([this.overAllClear], HIDEICON);
            removeClass([this.inputWrapper], SHOW_CLEAR);
        }
        if ((this.allowMultiSelection || this.showCheckBox) && this.chipWrapper) {
            const chipClose = selectAll('.' + CHIP_CLOSE, this.chipWrapper);
            for (let i = 0; i < chipClose.length; i++) {
                if (!state) {
                    addClass([chipClose[i]], HIDEICON);
                }
                else {
                    removeClass([chipClose[i]], HIDEICON);
                }
            }
        }
    }
    updateDropDownIconState(state) {
        const spinIcon = select('.' + DDTICON, this.inputWrapper);
        if (state) {
            if (!spinIcon) {
                Input.appendSpan(DROPDOWNICON, this.inputWrapper, this.createElement);
            }
            else {
                removeClass([spinIcon], HIDEICON);
            }
            addClass([this.inputWrapper], SHOW_DD_ICON);
        }
        else {
            addClass([spinIcon], HIDEICON);
            removeClass([this.inputWrapper], SHOW_DD_ICON);
        }
    }
    updateMode() {
        if (this.mode === 'Custom') {
            return;
        }
        if (this.mode !== 'Delimiter') {
            if (!this.inputWrapper.contains(this.chipWrapper)) {
                this.createChip();
            }
            const isValid = this.getValidMode();
            if (this.chipWrapper.classList.contains(HIDEICON) && isValid) {
                removeClass([this.chipWrapper], HIDEICON);
                addClass([this.inputWrapper], SHOW_CHIP);
            }
            else if (!isValid) {
                addClass([this.chipWrapper], HIDEICON);
                removeClass([this.inputWrapper], SHOW_CHIP);
            }
            const isValue = this.value !== null ? (this.value.length !== 0 ? true : false) : false;
            if (isValid && isValue) {
                addClass([this.inputEle], CHIP_INPUT);
            }
            else {
                removeClass([this.inputEle], CHIP_INPUT);
            }
        }
        else if (this.inputEle.classList.contains(CHIP_INPUT)) {
            removeClass([this.inputEle], CHIP_INPUT);
            if (this.chipWrapper) {
                addClass([this.chipWrapper], HIDEICON);
                removeClass([this.inputWrapper], SHOW_CHIP);
            }
        }
    }
    ensurePlaceHolder() {
        if (isNullOrUndefined(this.value) || (this.value && this.value.length === 0)) {
            removeClass([this.inputEle], CHIP_INPUT);
            if (this.chipWrapper) {
                addClass([this.chipWrapper], HIDEICON);
            }
        }
    }
    ensureClearIconPosition(floatLabelType) {
        if (floatLabelType !== 'Never') {
            this.inputWrapper.insertBefore(this.overAllClear, this.inputObj.buttons[0]);
        }
    }
    setMultiSelectValue(newValues) {
        if (!this.isFilteredData) {
            this.setProperties({ value: this.isFromFilterChange && newValues && newValues.length == 0 ? this.value : newValues }, true);
            this.isFromFilterChange = false;
            if (newValues && newValues.length !== 0 && !this.showCheckBox) {
                this.treeObj.selectedNodes = this.value.slice();
                this.treeObj.dataBind();
            }
        }
        else {
            const selectedValues = isNullOrUndefined(this.value) ? [] : this.value;
            for (let i = 0; i < newValues.length; i++) {
                if (isNullOrUndefined(this.value) || this.value.indexOf(newValues[i]) === -1) {
                    selectedValues.push(newValues[i]);
                }
            }
            this.setProperties({ value: selectedValues }, true);
        }
    }
    setMultiSelect() {
        if (this.showCheckBox && !this.isDynamicChange) {
            this.setMultiSelectValue(this.treeObj.checkedNodes.slice());
        }
        else {
            const ddtValue = this.allowMultiSelection ? (this.showCheckBox ? this.treeObj.checkedNodes
                : this.treeObj.selectedNodes) : (this.value ? (this.showCheckBox ? this.value : [this.value[0]]) : null);
            this.setMultiSelectValue(ddtValue);
            if (this.showCheckBox && this.value !== null) {
                this.treeObj.checkedNodes = this.value;
                this.treeObj.dataBind();
            }
        }
        this.selectedText = [];
        const checkSelection = this.allowMultiSelection ? true : (this.showCheckBox ? true : false);
        if (this.inputWrapper.contains(this.chipWrapper) && !checkSelection) {
            removeClass([this.inputEle], CHIP_INPUT);
            detach(this.chipWrapper);
        }
        const isValid = this.getValidMode();
        if (isValid && this.value !== null) {
            addClass([this.inputEle], CHIP_INPUT);
            if (this.chipWrapper) {
                removeClass([this.chipWrapper], HIDEICON);
            }
        }
        const isValue = this.value ? (this.value.length ? true : false) : false;
        if (this.chipWrapper && (this.mode === 'Box' && !isValue)) {
            addClass([this.chipWrapper], HIDEICON);
            removeClass([this.inputEle], CHIP_INPUT);
        }
        this.updateSelectedValues();
    }
    // eslint-disable-next-line
    getSelectedData(value) {
        // eslint-disable-next-line
        let data = null;
        if (this.isFilteredData) {
            for (let i = 0; i < this.selectedData.length; i++) {
                if (getValue(this.treeSettings.loadOnDemand ? this.fields.value : 'id', this.selectedData[i]).toString() === value) {
                    data = this.selectedData[i];
                    break;
                }
            }
        }
        if (isNullOrUndefined(data)) {
            if (this.treeSettings.loadOnDemand) {
                data = this.getNodeData(value);
            }
            else {
                data = this.treeObj.getNode(value);
            }
            if (!isNullOrUndefined(data)) {
                this.selectedData.push(data);
            }
        }
        return data;
    }
    getNodeData(id) {
        let childItems;
        if (isNullOrUndefined(id)) {
            return childItems;
        }
        else if (this.treeDataType === 1) {
            for (let i = 0, objlen = this.treeItems.length; i < objlen; i++) {
                let dataId = getValue(this.fields.value, this.treeItems[i]);
                if (!isNullOrUndefined(this.treeItems[i]) && !isNullOrUndefined(dataId) && dataId.toString() === id) {
                    return this.treeItems[i];
                }
            }
        }
        else {
            return this.getChildNodeData(this.treeItems, this.fields, id);
        }
        return childItems;
    }
    getChildNodeData(obj, mapper, id) {
        let newChildItems;
        if (isNullOrUndefined(obj)) {
            return newChildItems;
        }
        for (let i = 0, objlen = obj.length; i < objlen; i++) {
            let dataValue = getValue(mapper.value, obj[i]);
            if (obj[i] && dataValue && dataValue.toString() === id) {
                return obj[i];
            }
            else if (typeof mapper.child === 'string' && !isNullOrUndefined(getValue(mapper.child, obj[i]))) {
                let childNodeData = getValue(mapper.child, obj[i]);
                newChildItems = this.getChildNodeData(childNodeData, this.getChildMapperFields(mapper), id);
                if (newChildItems !== undefined) {
                    break;
                }
            }
            else if (this.fields.dataSource instanceof DataManager && !isNullOrUndefined(getValue('child', obj[i]))) {
                let child = 'child';
                newChildItems = this.getChildNodeData(getValue(child, obj[i]), this.getChildMapperFields(mapper), id);
                if (newChildItems !== undefined) {
                    break;
                }
            }
        }
        return newChildItems;
    }
    getChildMapperFields(mapper) {
        return (typeof mapper.child === 'string' || isNullOrUndefined(mapper.child)) ? mapper : mapper.child;
    }
    removeSelectedData(value, muteOnChange) {
        const selectedValues = isNullOrUndefined(this.value) ? [] : this.value.slice();
        selectedValues.splice(selectedValues.indexOf(value), 1);
        this.setProperties({ value: selectedValues }, muteOnChange);
        for (let i = 0; i < this.selectedData.length; i++) {
            if (getValue(this.treeSettings.loadOnDemand ? this.fields.value : 'id', this.selectedData[i]).toString() === value) {
                this.selectedData.splice(i, 1);
                break;
            }
        }
    }
    updateSelectedValues() {
        this.dataValue = '';
        let temp;
        let text;
        let textValue = '';
        // eslint-disable-next-line
        let selectedData;
        this.hiddenElement.innerHTML = '';
        let hiddenInputValue = '';
        if ((!this.isChipDelete || this.treeSettings.autoCheck) && (this.inputWrapper.contains(this.chipWrapper))) {
            this.chipCollection.innerHTML = '';
        }
        if (!this.isFilteredData) {
            this.selectedData = [];
        }
        if (!isNullOrUndefined(this.value)) {
            for (let i = 0, len = this.value.length; i < len; i++) {
                selectedData = this.getSelectedData(this.value[i]);
                text = getValue(this.treeSettings.loadOnDemand ? this.fields.text : 'text', selectedData);
                this.selectedText.push(text);
                temp = this.selectedText[this.selectedText.length - 1];
                if (this.selectedText.length > 1) {
                    this.dataValue += (this.delimiterChar + ' ' + temp);
                    textValue += (',' + temp);
                }
                else {
                    this.dataValue += temp;
                    textValue += temp;
                }
                if (this.mode !== 'Custom' && this.mode !== 'Delimiter' && (!this.isChipDelete || this.treeSettings.autoCheck) &&
                    (this.allowMultiSelection || this.showCheckBox)) {
                    this.setChipValues(temp, this.value[i]);
                }
                hiddenInputValue += '<option selected value ="' + this.value[i] + '">' +
                    this.selectedText[this.selectedText.length - 1] + '</option>';
            }
            if (this.selectedText.length >= 1) {
                this.setProperties({ text: textValue }, true);
            }
            this.hiddenElement.innerHTML = hiddenInputValue;
            if (this.mode === 'Custom' && (this.allowMultiSelection || this.showCheckBox)) {
                this.setTagValues();
            }
        }
        const isValid = this.getValidMode();
        if (this.mode !== 'Custom' && this.mode !== 'Box' && (this.allowMultiSelection || this.showCheckBox) && !isValid) {
            if (this.chipWrapper) {
                addClass([this.chipWrapper], HIDEICON);
                removeClass([this.inputWrapper], SHOW_CHIP);
            }
        }
        Input.setValue(this.dataValue, this.inputEle, this.floatLabelType);
        if (textValue === '') {
            this.setProperties({ text: null }, true);
        }
        else {
            this.setProperties({ text: textValue }, true);
        }
        if (this.showClearButton && this.inputFocus) {
            this.showOverAllClear();
        }
        if ((this.allowMultiSelection || this.showCheckBox) && this.popupObj) {
            this.popupObj.refreshPosition();
        }
        this.currentText = this.text;
        this.currentValue = this.value;
    }
    setChipValues(text, value) {
        if (!this.inputWrapper.contains(this.chipWrapper)) {
            this.createChip();
        }
        const chip = this.createElement('span', {
            className: CHIP,
            attrs: { 'data-value': value }
        });
        const chipContent = this.createElement('span', { className: CHIP_CONTENT });
        const chipClose = this.createElement('span', { className: CHIP_CLOSE + ' ' + ICONS });
        if (this.enableHtmlSanitizer) {
            chipContent.innerText = text;
        }
        else {
            chipContent.innerHTML = text;
        }
        chip.appendChild(chipContent);
        this.chipCollection.appendChild(chip);
        if (this.showClearButton) {
            chip.appendChild(chipClose);
            EventHandler.add(chipClose, 'mousedown', this.removeChip, this);
        }
    }
    setTagValues() {
        if (this.value === null || this.text == null) {
            return;
        }
        if (!this.inputWrapper.contains(this.chipWrapper)) {
            this.createChip();
        }
        if (!this.inputWrapper.classList.contains(SHOW_CHIP)) {
            addClass([this.inputWrapper], SHOW_CHIP);
        }
        const chip = this.createElement('span', {
            className: CHIP,
        });
        if (!this.inputEle.classList.contains(CHIP_INPUT)) {
            addClass([this.inputEle], CHIP_INPUT);
        }
        if (this.chipWrapper.classList.contains(HIDEICON)) {
            removeClass([this.chipWrapper], HIDEICON);
        }
        const chipContent = this.createElement('span', { className: CHIP_CONTENT });
        const template = this.customTemplate;
        const templateId = this.customTemplateId;
        const templatestring = 'customTemplate';
        const compiledString = this.templateComplier(template);
        let tempArr = compiledString({ 'value': this.value, 'text': this.text }, this, templatestring, templateId, this.isStringTemplate, undefined, chipContent);
        if (tempArr) {
            tempArr = Array.prototype.slice.call(tempArr);
            append(tempArr, chipContent);
        }
        chip.appendChild(chipContent);
        this.chipCollection.appendChild(chip);
    }
    setSelectAllWrapper(state) {
        if (this.isFirstRender) {
            return;
        }
        if (state && !this.popupEle.contains(this.checkAllParent) && this.showCheckBox) {
            this.createSelectAllWrapper();
            this.popupEle.insertBefore(this.checkAllParent, this.popupDiv);
        }
        else if (this.popupEle.contains(this.checkAllParent)) {
            detach(this.checkAllParent);
            this.checkAllParent = null;
        }
    }
    setHeaderTemplate() {
        if (this.header) {
            this.header.innerHTML = '';
        }
        else {
            this.header = this.createElement('div');
            addClass([this.header], HEADER);
        }
        // eslint-disable-next-line
        const compiledString = this.templateComplier(this.headerTemplate);
        let tempArr = compiledString({}, this, 'headerTemplate', this.headerTemplateId, this.isStringTemplate, undefined, this.header);
        if (tempArr) {
            tempArr = Array.prototype.slice.call(tempArr);
            append(tempArr, this.header);
        }
        this.popupEle.insertBefore(this.header, this.checkAllParent ? this.checkAllParent : this.popupDiv);
    }
    // eslint-disable-next-line
    templateComplier(template) {
        if (template) {
            // eslint-disable-next-line
            try {
                if (typeof template !== 'function' && document.querySelectorAll(template).length) {
                    return compile(document.querySelector(template).innerHTML.trim());
                }
                else {
                    return compile(template);
                }
            }
            catch (e) {
                return compile(template);
            }
        }
        return compile(template);
    }
    setFooterTemplate() {
        if (this.footer) {
            this.footer.innerHTML = '';
        }
        else {
            this.footer = this.createElement('div');
            addClass([this.footer], FOOTER);
        }
        // eslint-disable-next-line
        const compiledString = this.templateComplier(this.footerTemplate);
        let tempArr = compiledString({}, this, 'footerTemplate', this.footerTemplateId, this.isStringTemplate, undefined, this.footer);
        if (tempArr) {
            tempArr = Array.prototype.slice.call(tempArr);
            append(tempArr, this.footer);
        }
        append([this.footer], this.popupEle);
    }
    clearAll(e) {
        if (!this.enabled || this.readonly) {
            return;
        }
        this.resetValue();
        this.showOverAllClear();
        if ((this.allowMultiSelection || this.showCheckBox)) {
            if (this.popupObj) {
                this.popupObj.refreshPosition();
            }
            if (!this.wrapText) {
                this.updateOverflowWrapper(true);
            }
        }
        if (e) {
            this.isClearButtonClick = true;
        }
        if (!this.changeOnBlur) {
            this.triggerChangeEvent(e);
        }
    }
    removeChip(e) {
        if (!this.enabled || this.readonly) {
            return;
        }
        const element = e.target.parentElement;
        const value = element.getAttribute('data-value');
        if (this.chipCollection) {
            if (element) {
                remove(element);
            }
        }
        this.isChipDelete = true;
        this.isClearButtonClick = true;
        this.removeSelectedData(value, true);
        this.selectedText = [];
        if (this.allowMultiSelection) {
            this.treeObj.selectedNodes = this.value.slice();
            this.updateSelectedValues();
        }
        if (this.showCheckBox) {
            this.treeObj.uncheckAll([value]);
            this.clearCheckAll();
            this.setMultiSelect();
        }
        this.triggerChangeEvent(e);
        this.isChipDelete = false;
        this.ensurePlaceHolder();
    }
    resetValue(isDynamicChange) {
        if (this.value == [] && this.text == null) {
            return;
        }
        Input.setValue(null, this.inputEle, this.floatLabelType);
        if (!isDynamicChange) {
            this.oldValue = this.value;
            this.setProperties({ value: [] }, true);
        }
        this.dataValue = null;
        this.setProperties({ text: null }, true);
        this.selectedData = [];
        setValue('selectedNodes', [], this.treeObj);
        this.hiddenElement.innerHTML = '';
        if (this.showCheckBox) {
            this.treeObj.uncheckAll();
            this.setMultiSelect();
            this.clearCheckAll();
        }
        if (this.oldValue === null && !isDynamicChange) {
            this.removeValue = true;
        }
        else if (isDynamicChange) {
            this.triggerChangeEvent();
        }
        if ((this.allowMultiSelection || this.showCheckBox) && this.chipWrapper) {
            this.chipCollection.innerHTML = '';
            if (!this.wrapText) {
                this.updateOverflowWrapper(true);
            }
            this.ensurePlaceHolder();
        }
    }
    clearCheckAll() {
        if (this.showSelectAll && this.value && this.value.length === 0) {
            this.setLocale(false);
        }
    }
    selectAllItems(state) {
        if (this.showCheckBox) {
            if (state) {
                this.isCheckAllCalled = true;
                this.treeObj.checkAll();
            }
            else {
                this.treeObj.uncheckAll();
            }
            this.checkSelectAll = true;
        }
        else if (this.allowMultiSelection) {
            if (!state) {
                this.treeObj.selectedNodes = [];
            }
            else {
                const li = selectAll('li', this.treeObj.element);
                let id;
                const arr = [];
                for (let i = 0; i < li.length; i++) {
                    id = li[i].getAttribute('data-uid').toString();
                    arr.push(id);
                }
                this.treeObj.selectedNodes = arr;
            }
        }
        this.updateMode();
        this.setMultiSelect();
        if (!this.wrapText) {
            if (state) {
                this.updateView();
            }
            else {
                this.updateOverflowWrapper(true);
            }
        }
    }
    updateTreeSettings(prop) {
        const value = Object.keys(prop.treeSettings)[0];
        if (value === 'autoCheck') {
            this.ensureAutoCheck();
            this.treeObj.autoCheck = this.treeSettings.autoCheck;
        }
        else if (value === 'loadOnDemand') {
            this.treeObj.loadOnDemand = this.treeSettings.loadOnDemand;
        }
        else if (value === 'expandOn') {
            this.treeObj.expandOn = this.treeSettings.expandOn;
            this.treeObj.dataBind();
            return;
        }
        this.treeObj.dataBind();
        this.setMultiSelect();
        this.updateValue(this.value);
    }
    updateCheckBoxState(checkBox) {
        if (this.hasTemplate) {
            this.updateTemplate();
        }
        if (!this.wrapText) {
            this.updateOverflowWrapper(false);
        }
        this.treeObj.showCheckBox = checkBox;
        this.treeObj.dataBind();
        this.isDynamicChange = true;
        this.setSelectAllWrapper(this.showSelectAll);
        if (this.showSelectAll) {
            this.setLocale();
        }
        if (this.showCheckBox) {
            this.updateMode();
        }
        this.setMultiSelect();
        this.isDynamicChange = false;
    }
    updateTemplate() {
        if (this.popupObj) {
            this.clearTemplate();
            /* eslint-disable */
            this.portals = [];
            /* eslint-enable */
            this.popupObj.destroy();
            if (this.isPopupOpen) {
                this.hidePopup();
                this.isFirstRender = true;
                this.renderPopup();
            }
            else {
                this.isFirstRender = true;
            }
        }
    }
    l10nUpdate(actionFailure) {
        if (this.noRecord) {
            this.noRecord.innerHTML = '';
        }
        else {
            this.noRecord = this.createElement('div');
        }
        if (this.noRecordsTemplate !== 'No Records Found' || this.actionFailureTemplate !== 'The Request Failed') {
            const template = actionFailure ? this.actionFailureTemplate : this.noRecordsTemplate;
            const templateId = actionFailure ? this.actionFailureTemplateId : this.noRecordsTemplateId;
            const templatestring = actionFailure ? 'actionFailureTemplate' : 'noRecordsTemplate';
            // eslint-disable-next-line
            const compiledString = this.templateComplier(template);
            let tempArr = compiledString({}, this, templatestring, templateId, this.isStringTemplate, undefined, this.noRecord);
            if (tempArr) {
                tempArr = Array.prototype.slice.call(tempArr);
                append(tempArr, this.noRecord);
                addClass([this.noRecord], NODATACONTAINER);
                prepend([this.noRecord], this.popupDiv);
            }
        }
        else {
            // eslint-disable-next-line
            const l10nLocale = { noRecordsTemplate: 'No Records Found', actionFailureTemplate: 'The Request Failed' };
            this.l10n = new L10n(this.getLocaleName(), l10nLocale, this.locale);
            this.noRecord.innerHTML = actionFailure ?
                this.l10n.getConstant('actionFailureTemplate') : this.l10n.getConstant('noRecordsTemplate');
            addClass([this.noRecord], NODATACONTAINER);
            prepend([this.noRecord], this.popupDiv);
        }
    }
    updateRecordTemplate(action) {
        if (this.treeItems && this.treeItems.length <= 0) {
            this.l10nUpdate(action);
            if (this.hasTemplate) {
                this.updateTemplate();
            }
        }
    }
    updateOverflowWrapper(state) {
        if (!state) {
            if (!this.inputWrapper.contains(this.overFlowWrapper)) {
                this.overFlowWrapper = this.createElement('span', { className: OVERFLOW_VIEW + ' ' + HIDEICON });
                this.inputWrapper.insertBefore(this.overFlowWrapper, this.hiddenElement);
            }
        }
        else if (this.inputWrapper.contains(this.overFlowWrapper) && state) {
            this.overFlowWrapper.innerHTML = '';
        }
    }
    updateMultiSelection(state) {
        if (!this.wrapText) {
            this.updateOverflowWrapper(false);
        }
        this.treeObj.allowMultiSelection = state;
        this.treeObj.dataBind();
        this.updateOption();
        if (this.allowMultiSelection) {
            this.updateMode();
        }
        this.setMultiSelect();
    }
    updateAllowFiltering(state) {
        if (!this.isFirstRender) {
            if (state) {
                this.renderFilter();
            }
            else {
                this.destroyFilter();
            }
        }
        this.ensureAutoCheck();
    }
    updateFilterPlaceHolder() {
        if (this.filterObj) {
            this.filterObj.placeholder = this.filterBarPlaceholder;
            this.filterObj.element.setAttribute('aria-label', this.filterBarPlaceholder);
        }
    }
    updateValue(value) {
        this.isDynamicChange = true;
        if (isNullOrUndefined(value) || value.length === 0) {
            this.resetValue(true);
        }
        else {
            this.setTreeValue();
            if ((this.allowMultiSelection || this.showCheckBox) && !this.wrapText) {
                this.updateOverflowWrapper(false);
                this.updateView();
            }
        }
        this.updateHiddenValue();
        this.isDynamicChange = false;
    }
    updateText(text) {
        if (isNullOrUndefined(text)) {
            this.resetValue();
        }
        else {
            this.setTreeText();
            if ((this.allowMultiSelection || this.showCheckBox) && !this.wrapText) {
                this.updateOverflowWrapper(false);
                this.updateView();
            }
        }
        this.updateHiddenValue();
    }
    updateModelMode() {
        const validMode = this.allowMultiSelection ? true : (this.showCheckBox ? true : false);
        if (!validMode) {
            return;
        }
        if (!this.wrapText) {
            const overFlow = select('.' + OVERFLOW_VIEW, this.inputWrapper);
            if (overFlow) {
                overFlow.innerHTML = '';
            }
        }
        this.updateMode();
        this.setMultiSelect();
        if (!this.wrapText && (this.value && this.value.length !== 0)) {
            this.updateOverFlowView();
            addClass([this.inputEle], CHIP_INPUT);
            if (this.mode === 'Box') {
                removeClass([this.overFlowWrapper, this.inputWrapper], SHOW_TEXT);
            }
            else {
                addClass([this.overFlowWrapper, this.inputWrapper], SHOW_TEXT);
            }
        }
    }
    updateOption() {
        if (!this.hiddenElement.hasAttribute('multiple') && (this.allowMultiSelection || this.showCheckBox)) {
            this.hiddenElement.setAttribute('multiple', '');
        }
        else if (this.hiddenElement.hasAttribute('multiple') && (!this.allowMultiSelection && !this.showCheckBox)) {
            this.hiddenElement.removeAttribute('multiple');
        }
    }
    /**
     * Dynamically change the value of properties.
     *
     * @param {DropDownTreeModel} newProp - specifies the newProp value.
     * @param {DropDownTreeModel} oldProp - specifies the newProp value.
     * @returns {void}
     * @private
     */
    onPropertyChanged(newProp, oldProp) {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'width':
                    this.setElementWidth(newProp.width);
                    if (this.popupObj) {
                        this.popupObj.element.style.width = this.setWidth();
                    }
                    break;
                case 'placeholder':
                    Input.setPlaceholder(newProp.placeholder, this.inputEle);
                    break;
                case 'cssClass':
                    this.setCssClass(newProp.cssClass, oldProp.cssClass);
                    break;
                case 'enableRtl':
                    this.setEnableRTL(this.enableRtl);
                    break;
                case 'fields':
                    this.setFields();
                    break;
                case 'readonly':
                    Input.setReadonly(newProp.readonly, this.inputEle);
                    break;
                case 'enabled':
                    this.setEnable();
                    break;
                case 'floatLabelType':
                    Input.removeFloating(this.inputObj);
                    Input.addFloating(this.inputEle, newProp.floatLabelType, this.placeholder, this.createElement);
                    this.ensureClearIconPosition(newProp.floatLabelType);
                    break;
                case 'showClearButton':
                    this.updateClearButton(newProp.showClearButton);
                    break;
                case 'allowFiltering':
                    this.updateAllowFiltering(newProp.allowFiltering);
                    break;
                case 'filterBarPlaceholder':
                    this.updateFilterPlaceHolder();
                    break;
                case 'value':
                    this.oldValue = oldProp.value;
                    this.updateValue(newProp.value);
                    break;
                case 'text':
                    this.updateText(newProp.text);
                    break;
                case 'allowMultiSelection':
                    this.updateMultiSelection(newProp.allowMultiSelection);
                    break;
                case 'mode':
                    if (!this.showCheckBox && !this.allowMultiSelection) {
                        return;
                    }
                    if (this.mode === 'Custom') {
                        if (this.overFlowWrapper) {
                            detach(this.overFlowWrapper);
                        }
                        if (this.chipWrapper) {
                            detach(this.chipWrapper);
                        }
                        this.setTagValues();
                    }
                    else {
                        if (oldProp.mode === 'Custom') {
                            this.updateOverflowWrapper(this.wrapText);
                        }
                        this.updateModelMode();
                    }
                    break;
                case 'delimiterChar':
                    if (this.mode === 'Box') {
                        return;
                    }
                    if (this.showCheckBox || this.allowMultiSelection) {
                        this.setMultiSelect();
                    }
                    break;
                case 'selectAllText':
                    if (this.showCheckBox && this.showSelectAll) {
                        this.setLocale();
                    }
                    break;
                case 'unSelectAllText':
                    if (this.showCheckBox && this.showSelectAll) {
                        this.setLocale(false);
                    }
                    break;
                case 'showSelectAll':
                    if (this.showCheckBox) {
                        this.setSelectAllWrapper(newProp.showSelectAll);
                        this.updatePopupHeight();
                    }
                    break;
                case 'showCheckBox':
                    this.updateCheckBoxState(newProp.showCheckBox);
                    if (!this.wrapText) {
                        this.updateOverflowWrapper(true);
                    }
                    this.updatePopupHeight();
                    this.updateOption();
                    break;
                case 'treeSettings':
                    this.updateTreeSettings(newProp);
                    break;
                case 'customTemplate':
                    if (this.mode !== "Custom") {
                        return;
                    }
                    this.chipCollection.innerHTML = "";
                    this.setTagValues();
                    break;
                case 'sortOrder':
                    if (this.hasTemplate) {
                        this.updateTemplate();
                    }
                    this.treeObj.sortOrder = newProp.sortOrder;
                    this.treeObj.dataBind();
                    this.updateValue(this.value);
                    break;
                case 'showDropDownIcon':
                    this.updateDropDownIconState(newProp.showDropDownIcon);
                    break;
                case 'popupWidth':
                    if (this.popupObj) {
                        this.popupObj.element.style.width = this.setWidth();
                    }
                    break;
                case 'popupHeight':
                    if (this.popupObj) {
                        this.updatePopupHeight();
                    }
                    break;
                case 'zIndex':
                    if (this.popupObj) {
                        this.popupObj.zIndex = newProp.zIndex;
                        this.popupObj.dataBind();
                    }
                    break;
                case 'headerTemplate':
                    this.updateTemplate();
                    break;
                case 'footerTemplate':
                    this.updateTemplate();
                    break;
                case 'itemTemplate':
                    this.updateTemplate();
                    this.treeObj.nodeTemplate = newProp.itemTemplate;
                    this.treeObj.dataBind();
                    break;
                case 'noRecordsTemplate':
                    this.updateRecordTemplate();
                    break;
                case 'actionFailureTemplate':
                    this.updateRecordTemplate(true);
                    break;
                case 'htmlAttributes':
                    this.setHTMLAttributes();
                    break;
                case 'wrapText':
                    this.updateOverflowWrapper(this.wrapText);
                    if ((this.allowMultiSelection || this.showCheckBox) && !this.wrapText) {
                        this.updateView();
                    }
                    else {
                        addClass([this.overFlowWrapper], HIDEICON);
                        if (this.chipWrapper && this.mode === 'Box') {
                            removeClass([this.chipWrapper], HIDEICON);
                        }
                        else {
                            removeClass([this.inputWrapper], SHOW_CHIP);
                            removeClass([this.inputEle], CHIP_INPUT);
                        }
                        this.ensurePlaceHolder();
                    }
                    break;
            }
        }
    }
    /**
     * Allows you to clear the selected values from the Dropdown Tree component.
     *
     * @method clear
     * @returns {void}
     */
    clear() {
        this.clearAll();
        if (this.inputFocus) {
            this.onFocusOut();
        }
        else {
            if (this.changeOnBlur) {
                this.triggerChangeEvent();
            }
            this.removeValue = false;
        }
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers. Also, it removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        this.clearTemplate();
        this.unWireEvents();
        this.setCssClass(null, this.cssClass);
        this.setProperties({ value: [] }, true);
        this.setProperties({ text: null }, true);
        this.treeObj.destroy();
        this.destroyFilter();
        if (this.popupObj) {
            this.popupObj.destroy();
            detach(this.popupObj.element);
        }
        if (this.element.tagName !== this.getDirective()) {
            this.inputWrapper.parentElement.insertBefore(this.element, this.inputWrapper);
        }
        Input.setValue(null, this.inputEle, this.floatLabelType);
        detach(this.inputWrapper);
        detach(this.popupDiv);
        this.element.classList.remove('e-input');
        if (this.showCheckBox || this.allowMultiSelection) {
            this.element.classList.remove(CHIP_INPUT);
        }
        super.destroy();
    }
    destroyFilter() {
        if (this.filterObj) {
            this.filterObj.destroy();
            detach(this.filterObj.element);
            detach(this.filterContainer);
            this.filterObj = null;
        }
    }
    /**
     * Ensures visibility of the Dropdown Tree item by using item value or item element.
     * If many Dropdown Tree items are present, and we are in need to find a particular item, then the `ensureVisible` property
     * helps you to bring the item to visibility by expanding the Dropdown Tree and scrolling to the specific item.
     *
     * @param  {string | Element} item - Specifies the value of Dropdown Tree item/ Dropdown Tree item element.
     * @returns {void}
     */
    ensureVisible(item) {
        this.treeObj.ensureVisible(item);
    }
    /**
     * To get the updated data source of the Dropdown Tree.
     *
     * @param  {string | Element} item - Specifies the value of Dropdown Tree item/ Dropdown Tree item element
     * @returns {'{[key: string]: Object }[]'} - returns the updated data source of the Dropdown Tree.
     */
    // eslint-disable-next-line
    getData(item) {
        return this.treeObj.getTreeData(item);
    }
    /**
     * Close the Dropdown tree pop-up.
     *
     * @returns {void}
     */
    hidePopup() {
        const eventArgs = { popup: this.popupObj };
        this.inputWrapper.classList.remove(ICONANIMATION);
        if (this.popupEle) {
            addClass([this.popupEle], DDTHIDEICON);
        }
        attributes(this.inputWrapper, { 'aria-expanded': 'false' });
        if (this.popupObj && this.isPopupOpen) {
            this.popupObj.hide();
            if (this.inputFocus) {
                this.inputWrapper.focus();
                if (this.allowFiltering) {
                    addClass([this.inputWrapper], [INPUTFOCUS]);
                }
            }
            this.trigger('close', eventArgs);
        }
    }
    /**
     * Based on the state parameter, entire list item will be selected or deselected.
     *
     * @param {boolean} state - Unselects/Selects entire Dropdown Tree items.
     * @returns {void}
     *
     */
    selectAll(state) {
        this.selectAllItems(state);
    }
    /**
     * Opens the popup that displays the Dropdown Tree items.
     *
     * @returns {void}
     */
    showPopup() {
        if (!this.enabled || this.readonly || this.isPopupOpen) {
            return;
        }
        this.renderPopup();
        this.focusIn();
    }
    /**
     * Return the module name.
     *
     * @private
     * @returns {string} - returns the module name.
     */
    getModuleName() {
        return 'dropdowntree';
    }
};
__decorate$2([
    Property('The Request Failed')
], DropDownTree.prototype, "actionFailureTemplate", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "allowFiltering", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "allowMultiSelection", void 0);
__decorate$2([
    Property(true)
], DropDownTree.prototype, "changeOnBlur", void 0);
__decorate$2([
    Property('')
], DropDownTree.prototype, "cssClass", void 0);
__decorate$2([
    Property("${value.length} item(s) selected")
], DropDownTree.prototype, "customTemplate", void 0);
__decorate$2([
    Property(',')
], DropDownTree.prototype, "delimiterChar", void 0);
__decorate$2([
    Property(true)
], DropDownTree.prototype, "enabled", void 0);
__decorate$2([
    Complex({}, Fields)
], DropDownTree.prototype, "fields", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "filterBarPlaceholder", void 0);
__decorate$2([
    Property('StartsWith')
], DropDownTree.prototype, "filterType", void 0);
__decorate$2([
    Property('Never')
], DropDownTree.prototype, "floatLabelType", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "footerTemplate", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "ignoreAccent", void 0);
__decorate$2([
    Property(true)
], DropDownTree.prototype, "ignoreCase", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "headerTemplate", void 0);
__decorate$2([
    Property({})
], DropDownTree.prototype, "htmlAttributes", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "itemTemplate", void 0);
__decorate$2([
    Property('Default')
], DropDownTree.prototype, "mode", void 0);
__decorate$2([
    Property('No Records Found')
], DropDownTree.prototype, "noRecordsTemplate", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "placeholder", void 0);
__decorate$2([
    Property('300px')
], DropDownTree.prototype, "popupHeight", void 0);
__decorate$2([
    Property('100%')
], DropDownTree.prototype, "popupWidth", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "readonly", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "showSelectAll", void 0);
__decorate$2([
    Property('Select All')
], DropDownTree.prototype, "selectAllText", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "showCheckBox", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "enableHtmlSanitizer", void 0);
__decorate$2([
    Property(true)
], DropDownTree.prototype, "showClearButton", void 0);
__decorate$2([
    Property(true)
], DropDownTree.prototype, "showDropDownIcon", void 0);
__decorate$2([
    Property('None')
], DropDownTree.prototype, "sortOrder", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "text", void 0);
__decorate$2([
    Complex({}, TreeSettings)
], DropDownTree.prototype, "treeSettings", void 0);
__decorate$2([
    Property('Unselect All')
], DropDownTree.prototype, "unSelectAllText", void 0);
__decorate$2([
    Property(null)
], DropDownTree.prototype, "value", void 0);
__decorate$2([
    Property('100%')
], DropDownTree.prototype, "width", void 0);
__decorate$2([
    Property(1000)
], DropDownTree.prototype, "zIndex", void 0);
__decorate$2([
    Property(false)
], DropDownTree.prototype, "wrapText", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "actionFailure", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "beforeOpen", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "change", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "close", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "blur", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "created", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "dataBound", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "destroyed", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "filtering", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "focus", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "keyPress", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "open", void 0);
__decorate$2([
    Event()
], DropDownTree.prototype, "select", void 0);
DropDownTree = __decorate$2([
    NotifyPropertyChanges
], DropDownTree);

/**
 * export all modules from current location
 */

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../drop-down-list/drop-down-list-model.d.ts'/>
const SPINNER_CLASS = 'e-atc-spinner-icon';
dropDownListClasses.root = 'e-combobox';
const inputObject$1 = {
    container: null,
    buttons: []
};
/**
 * The ComboBox component allows the user to type a value or choose an option from the list of predefined options.
 * ```html
 * <select id="list">
 *      <option value='1'>Badminton</option>
 *      <option value='2'>Basketball</option>
 *      <option value='3'>Cricket</option>
 *      <option value='4'>Football</option>
 *      <option value='5'>Tennis</option>
 * </select>
 * ```
 * ```typescript
 *   let games:ComboBox = new ComboBox();
 *   games.appendTo("#list");
 * ```
 */
let ComboBox = class ComboBox extends DropDownList {
    /**
     * *Constructor for creating the component
     *
     * @param {ComboBoxModel} options - Specifies the ComboBox model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
    }
    /**
     * Initialize the event handler
     *
     * @private
     * @returns {void}
     */
    preRender() {
        super.preRender();
    }
    getLocaleName() {
        return 'combo-box';
    }
    wireEvent() {
        if (this.getModuleName() === 'combobox') {
            EventHandler.add(this.inputWrapper.buttons[0], 'mousedown', this.preventBlur, this);
            EventHandler.add(this.inputWrapper.container, 'blur', this.onBlurHandler, this);
        }
        if (!isNullOrUndefined(this.inputWrapper.buttons[0])) {
            EventHandler.add(this.inputWrapper.buttons[0], 'mousedown', this.dropDownClick, this);
        }
        EventHandler.add(this.inputElement, 'focus', this.targetFocus, this);
        if (!this.readonly) {
            EventHandler.add(this.inputElement, 'input', this.onInput, this);
            EventHandler.add(this.inputElement, 'keyup', this.onFilterUp, this);
            EventHandler.add(this.inputElement, 'keydown', this.onFilterDown, this);
            EventHandler.add(this.inputElement, 'paste', this.pasteHandler, this);
        }
        this.bindCommonEvent();
    }
    preventBlur(e) {
        if ((!this.allowFiltering && document.activeElement !== this.inputElement &&
            !document.activeElement.classList.contains(dropDownListClasses.input) && Browser.isDevice || !Browser.isDevice)) {
            e.preventDefault();
        }
    }
    onBlurHandler(e) {
        const inputValue = this.inputElement && this.inputElement.value === '' ?
            null : this.inputElement && this.inputElement.value;
        if (!isNullOrUndefined(this.listData) && !isNullOrUndefined(inputValue) && inputValue !== this.text) {
            this.customValue(e);
        }
        super.onBlurHandler(e);
    }
    targetElement() {
        return this.inputElement;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setOldText(text) {
        Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
        this.customValue();
        this.removeSelection();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setOldValue(value) {
        if (this.allowCustom) {
            this.valueMuteChange(this.value);
        }
        else {
            this.valueMuteChange(null);
        }
        this.removeSelection();
        this.setHiddenValue();
    }
    valueMuteChange(value) {
        const inputValue = isNullOrUndefined(value) ? null : value.toString();
        Input.setValue(inputValue, this.inputElement, this.floatLabelType, this.showClearButton);
        this.setProperties({ value: value, text: value, index: null }, true);
        this.activeIndex = this.index;
        const fields = this.fields;
        const dataItem = {};
        dataItem[fields.text] = isNullOrUndefined(value) ? null : value.toString();
        dataItem[fields.value] = isNullOrUndefined(value) ? null : value.toString();
        this.itemData = dataItem;
        this.item = null;
        if (this.previousValue !== this.value) {
            this.detachChangeEvent(null);
        }
    }
    updateValues() {
        if (!isNullOrUndefined(this.value)) {
            const li = this.getElementByValue(this.value);
            if (li) {
                this.setSelection(li, null);
            }
            else if (this.allowCustom) {
                this.valueMuteChange(this.value);
            }
            else {
                this.valueMuteChange(null);
            }
        }
        else if (this.text && isNullOrUndefined(this.value)) {
            const li = this.getElementByText(this.text);
            if (li) {
                this.setSelection(li, null);
            }
            else {
                Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
                this.customValue();
            }
        }
        else {
            this.setSelection(this.liCollections[this.activeIndex], null);
        }
        this.setHiddenValue();
        Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
    }
    updateIconState() {
        if (this.showClearButton) {
            if (this.inputElement && this.inputElement.value !== '' && !this.readonly) {
                removeClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
            }
            else {
                addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
            }
        }
    }
    getAriaAttributes() {
        const ariaAttributes = {
            'role': 'combobox',
            'aria-autocomplete': 'both',
            'aria-labelledby': this.hiddenElement.id,
            'aria-expanded': 'false',
            'aria-readonly': this.readonly.toString(),
            'autocomplete': 'off',
            'autocapitalize': 'off',
            'spellcheck': 'false'
        };
        return ariaAttributes;
    }
    searchLists(e) {
        this.isTyped = true;
        if (this.isFiltering()) {
            super.searchLists(e);
            if (this.ulElement && this.filterInput.value.trim() === '') {
                this.setHoverList(this.ulElement.querySelector('.' + dropDownListClasses.li));
            }
        }
        else {
            if (this.ulElement && this.inputElement.value === '' && this.preventAutoFill) {
                this.setHoverList(this.ulElement.querySelector('.' + dropDownListClasses.li));
            }
            this.incrementalSearch(e);
        }
    }
    getNgDirective() {
        return 'EJS-COMBOBOX';
    }
    setSearchBox() {
        this.filterInput = this.inputElement;
        return (this.isFiltering() ? this.inputWrapper : inputObject$1);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onActionComplete(ulElement, list, e, isUpdated) {
        super.onActionComplete(ulElement, list, e);
        if (this.isSelectCustom) {
            this.removeSelection();
        }
        if (!this.preventAutoFill && this.getModuleName() === 'combobox' && this.isTyped) {
            setTimeout(() => {
                this.inlineSearch();
            });
        }
    }
    getFocusElement() {
        const dataItem = this.isSelectCustom ? { text: '' } : this.getItemData();
        const selected = !isNullOrUndefined(this.list) ? this.list.querySelector('.' + dropDownListClasses.selected) : this.list;
        const isSelected = dataItem.text === this.inputElement.value && !isNullOrUndefined(selected);
        if (isSelected) {
            return selected;
        }
        if ((Browser.isDevice && !this.isDropDownClick || !Browser.isDevice) &&
            !isNullOrUndefined(this.liCollections) && this.liCollections.length > 0) {
            const inputValue = this.inputElement.value;
            const dataSource = this.sortedData;
            const type = this.typeOfData(dataSource).typeof;
            const activeItem = Search(inputValue, this.liCollections, this.filterType, true, dataSource, this.fields, type);
            const activeElement = activeItem.item;
            if (!isNullOrUndefined(activeElement)) {
                const count = this.getIndexByValue(activeElement.getAttribute('data-value')) - 1;
                const height = parseInt(getComputedStyle(this.liCollections[0], null).getPropertyValue('height'), 10);
                if (!isNaN(height) && this.getModuleName() !== 'autocomplete') {
                    this.removeFocus();
                    const fixedHead = this.fields.groupBy ? this.liCollections[0].offsetHeight : 0;
                    this.list.scrollTop = count * height + fixedHead;
                    addClass([activeElement], dropDownListClasses.focus);
                }
            }
            else {
                if (this.isSelectCustom && this.inputElement.value.trim() !== '') {
                    this.removeFocus();
                    this.list.scrollTop = 0;
                }
            }
            return activeElement;
        }
        else {
            return null;
        }
    }
    setValue(e) {
        if (e && e.type === 'keydown' && e.action === 'enter') {
            this.removeFillSelection();
        }
        if (this.autofill && this.getModuleName() === 'combobox' && e && e.type === 'keydown' && e.action !== 'enter') {
            this.preventAutoFill = false;
            this.inlineSearch(e);
            return false;
        }
        else {
            return super.setValue(e);
        }
    }
    checkCustomValue() {
        this.itemData = this.getDataByValue(this.value);
        const dataItem = this.getItemData();
        if (!(this.allowCustom && isNullOrUndefined(dataItem.value) && isNullOrUndefined(dataItem.text))) {
            this.setProperties({ 'value': dataItem.value }, !this.allowCustom);
        }
    }
    /**
     * Shows the spinner loader.
     *
     * @returns {void}
     * @deprecated
     */
    showSpinner() {
        if (isNullOrUndefined(this.spinnerElement)) {
            this.spinnerElement = (this.getModuleName() === 'autocomplete') ? (this.inputWrapper.buttons[0] ||
                this.inputWrapper.clearButton ||
                Input.appendSpan('e-input-group-icon ' + SPINNER_CLASS, this.inputWrapper.container, this.createElement)) :
                (this.inputWrapper.buttons[0] || this.inputWrapper.clearButton);
            addClass([this.spinnerElement], dropDownListClasses.disableIcon);
            createSpinner({
                target: this.spinnerElement,
                width: Browser.isDevice ? '16px' : '14px'
            }, this.createElement);
            showSpinner(this.spinnerElement);
        }
    }
    /**
     * Hides the spinner loader.
     *
     * @returns {void}
     * @deprecated
     */
    hideSpinner() {
        if (!isNullOrUndefined(this.spinnerElement)) {
            hideSpinner(this.spinnerElement);
            removeClass([this.spinnerElement], dropDownListClasses.disableIcon);
            if (this.spinnerElement.classList.contains(SPINNER_CLASS)) {
                detach(this.spinnerElement);
            }
            else {
                this.spinnerElement.innerHTML = '';
            }
            this.spinnerElement = null;
        }
    }
    setAutoFill(activeElement, isHover) {
        if (!isHover) {
            this.setHoverList(activeElement);
        }
        if (this.autofill && !this.preventAutoFill) {
            const currentValue = this.getTextByValue(activeElement.getAttribute('data-value')).toString();
            const currentFillValue = this.getFormattedValue(activeElement.getAttribute('data-value'));
            if (this.getModuleName() === 'combobox') {
                if (!this.isSelected && this.previousValue !== currentFillValue) {
                    this.updateSelectedItem(activeElement, null);
                    this.isSelected = true;
                    this.previousValue = this.getFormattedValue(activeElement.getAttribute('data-value'));
                }
                else {
                    this.updateSelectedItem(activeElement, null, true);
                }
            }
            if (!this.isAndroidAutoFill(currentValue)) {
                this.setAutoFillSelection(currentValue, isHover);
            }
        }
    }
    isAndroidAutoFill(value) {
        if (Browser.isAndroid) {
            const currentPoints = this.getSelectionPoints();
            const prevEnd = this.prevSelectPoints.end;
            const curEnd = currentPoints.end;
            const prevStart = this.prevSelectPoints.start;
            const curStart = currentPoints.start;
            if (prevEnd !== 0 && ((prevEnd === value.length && prevStart === value.length) ||
                (prevStart > curStart && prevEnd > curEnd) || (prevEnd === curEnd && prevStart === curStart))) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    clearAll(e, property) {
        if (isNullOrUndefined(property) || (!isNullOrUndefined(property) && isNullOrUndefined(property.dataSource))) {
            super.clearAll(e);
        }
        if (this.isFiltering() && !isNullOrUndefined(e) && e.target === this.inputWrapper.clearButton) {
            this.searchLists(e);
        }
    }
    isSelectFocusItem(element) {
        return !isNullOrUndefined(element);
    }
    inlineSearch(e) {
        const isKeyNavigate = (e && (e.action === 'down' || e.action === 'up' ||
            e.action === 'home' || e.action === 'end' || e.action === 'pageUp' || e.action === 'pageDown'));
        const activeElement = isKeyNavigate ? this.liCollections[this.activeIndex] : this.getFocusElement();
        if (!isNullOrUndefined(activeElement)) {
            if (!isKeyNavigate) {
                const value = this.getFormattedValue(activeElement.getAttribute('data-value'));
                this.activeIndex = this.getIndexByValue(value);
                this.activeIndex = !isNullOrUndefined(this.activeIndex) ? this.activeIndex : null;
            }
            this.preventAutoFill = this.inputElement.value === '' ? false : this.preventAutoFill;
            this.setAutoFill(activeElement, isKeyNavigate);
        }
        else if (this.inputElement.value === '') {
            this.activeIndex = null;
            if (!isNullOrUndefined(this.list)) {
                this.list.scrollTop = 0;
                const focusItem = this.list.querySelector('.' + dropDownListClasses.li);
                this.setHoverList(focusItem);
            }
        }
        else {
            this.activeIndex = null;
            this.removeSelection();
            if (this.liCollections && this.liCollections.length > 0 && !this.isCustomFilter) {
                this.removeFocus();
            }
        }
    }
    incrementalSearch(e) {
        this.showPopup(e);
        if (!isNullOrUndefined(this.listData)) {
            this.inlineSearch(e);
            e.preventDefault();
        }
    }
    setAutoFillSelection(currentValue, isKeyNavigate = false) {
        const selection = this.getSelectionPoints();
        const value = this.inputElement.value.substr(0, selection.start);
        if (value && (value.toLowerCase() === currentValue.substr(0, selection.start).toLowerCase())) {
            const inputValue = value + currentValue.substr(value.length, currentValue.length);
            Input.setValue(inputValue, this.inputElement, this.floatLabelType, this.showClearButton);
            this.inputElement.setSelectionRange(selection.start, this.inputElement.value.length);
        }
        else if (isKeyNavigate) {
            Input.setValue(currentValue, this.inputElement, this.floatLabelType, this.showClearButton);
            this.inputElement.setSelectionRange(0, this.inputElement.value.length);
        }
    }
    getValueByText(text) {
        return super.getValueByText(text, true, this.ignoreAccent);
    }
    unWireEvent() {
        if (this.getModuleName() === 'combobox') {
            EventHandler.remove(this.inputWrapper.buttons[0], 'mousedown', this.preventBlur);
            EventHandler.remove(this.inputWrapper.container, 'blur', this.onBlurHandler);
        }
        if (!isNullOrUndefined(this.inputWrapper.buttons[0])) {
            EventHandler.remove(this.inputWrapper.buttons[0], 'mousedown', this.dropDownClick);
        }
        if (this.inputElement) {
            EventHandler.remove(this.inputElement, 'focus', this.targetFocus);
            if (!this.readonly) {
                EventHandler.remove(this.inputElement, 'input', this.onInput);
                EventHandler.remove(this.inputElement, 'keyup', this.onFilterUp);
                EventHandler.remove(this.inputElement, 'keydown', this.onFilterDown);
                EventHandler.remove(this.inputElement, 'paste', this.pasteHandler);
            }
        }
        this.unBindCommonEvent();
    }
    setSelection(li, e) {
        super.setSelection(li, e);
        if (!isNullOrUndefined(li) && !this.autofill && !this.isDropDownClick) {
            this.removeFocus();
        }
    }
    selectCurrentItem(e) {
        let li;
        if (this.isPopupOpen) {
            if (this.isSelected) {
                li = this.list.querySelector('.' + dropDownListClasses.selected);
            }
            else {
                li = this.list.querySelector('.' + dropDownListClasses.focus);
            }
            if (li) {
                this.setSelection(li, e);
                this.isTyped = false;
            }
            if (this.isSelected) {
                this.isSelectCustom = false;
                this.onChangeEvent(e);
            }
        }
        if (e.action === 'enter' && this.inputElement.value.trim() === '') {
            this.clearAll(e);
        }
        else if (this.isTyped && !this.isSelected && isNullOrUndefined(li)) {
            this.customValue(e);
        }
        this.hidePopup(e);
    }
    setHoverList(li) {
        this.removeSelection();
        if (this.isValidLI(li) && !li.classList.contains(dropDownListClasses.selected)) {
            this.removeFocus();
            li.classList.add(dropDownListClasses.focus);
        }
    }
    targetFocus(e) {
        if (Browser.isDevice && !this.allowFiltering) {
            this.preventFocus = false;
        }
        this.onFocus(e);
        Input.calculateWidth(this.inputElement, this.inputWrapper.container);
    }
    dropDownClick(e) {
        e.preventDefault();
        if (Browser.isDevice && !this.isFiltering()) {
            this.preventFocus = true;
        }
        super.dropDownClick(e);
    }
    customValue(e) {
        const value = this.getValueByText(this.inputElement.value);
        if (!this.allowCustom && this.inputElement.value !== '') {
            const previousValue = this.previousValue;
            const currentValue = this.value;
            this.setProperties({ value: value });
            if (isNullOrUndefined(this.value)) {
                Input.setValue('', this.inputElement, this.floatLabelType, this.showClearButton);
            }
            if (this.autofill && previousValue === this.value && currentValue !== this.value) {
                this.onChangeEvent(null);
            }
        }
        else if (this.inputElement.value.trim() !== '') {
            const previousValue = this.value;
            if (isNullOrUndefined(value)) {
                const value = this.inputElement.value === '' ? null : this.inputElement.value;
                // eslint-disable-next-line max-len
                const eventArgs = { text: value, item: {} };
                if (!this.initial) {
                    this.trigger('customValueSpecifier', eventArgs, (eventArgs) => {
                        this.updateCustomValueCallback(value, eventArgs, previousValue, e);
                    });
                }
                else {
                    this.updateCustomValueCallback(value, eventArgs, previousValue);
                }
            }
            else {
                this.isSelectCustom = false;
                this.setProperties({ value: value });
                if (previousValue !== this.value) {
                    this.onChangeEvent(e);
                }
            }
        }
        else if (this.allowCustom) {
            this.isSelectCustom = true;
        }
    }
    updateCustomValueCallback(value, eventArgs, previousValue, e) {
        const fields = this.fields;
        const item = eventArgs.item;
        let dataItem = {};
        if (item && getValue(fields.text, item) && getValue(fields.value, item)) {
            dataItem = item;
        }
        else {
            setValue(fields.text, value, dataItem);
            setValue(fields.value, value, dataItem);
        }
        this.itemData = dataItem;
        const changeData = {
            text: getValue(fields.text, this.itemData),
            value: getValue(fields.value, this.itemData),
            index: null
        };
        this.setProperties(changeData, true);
        this.setSelection(null, null);
        this.isSelectCustom = true;
        if (previousValue !== this.value) {
            this.onChangeEvent(e);
        }
    }
    /**
     * Dynamically change the value of properties.
     *
     * @param {ComboBoxModel} newProp - Returns the dynamic property value of the component.
     * @param {ComboBoxModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    onPropertyChanged(newProp, oldProp) {
        if (this.getModuleName() === 'combobox') {
            this.checkData(newProp);
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'readonly':
                    Input.setReadonly(this.readonly, this.inputElement);
                    if (this.readonly) {
                        EventHandler.remove(this.inputElement, 'input', this.onInput);
                        EventHandler.remove(this.inputElement, 'keyup', this.onFilterUp);
                        EventHandler.remove(this.inputElement, 'keydown', this.onFilterDown);
                    }
                    else {
                        EventHandler.add(this.inputElement, 'input', this.onInput, this);
                        EventHandler.add(this.inputElement, 'keyup', this.onFilterUp, this);
                        EventHandler.add(this.inputElement, 'keydown', this.onFilterDown, this);
                    }
                    this.setReadOnly();
                    break;
                case 'allowFiltering':
                    this.setSearchBox();
                    if (this.isFiltering() && this.getModuleName() === 'combobox' && isNullOrUndefined(this.list)) {
                        super.renderList();
                    }
                    break;
                case 'allowCustom':
                    break;
                default: {
                    // eslint-disable-next-line max-len
                    const comboProps = this.getPropObject(prop, newProp, oldProp);
                    super.onPropertyChanged(comboProps.newProperty, comboProps.oldProperty);
                    if (this.isFiltering() && prop === 'dataSource' && isNullOrUndefined(this.list) && this.itemTemplate &&
                        this.getModuleName() === 'combobox') {
                        super.renderList();
                    }
                    break;
                }
            }
        }
    }
    /**
     * To initialize the control rendering.
     *
     * @private
     * @returns {void}
     */
    render() {
        super.render();
        this.setSearchBox();
        if (this.isFiltering() && this.getModuleName() === 'combobox' && isNullOrUndefined(this.list)) {
            super.renderList();
        }
        this.renderComplete();
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'combobox';
    }
    /**
     * Adds a new item to the combobox popup list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the popup list.
     * @returns {void}
     * @deprecated
     */
    addItem(items, itemIndex) {
        super.addItem(items, itemIndex);
    }
    /**
     * To filter the data from given data source by using query
     *
     * @param {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param {Query} query - Specify the query to filter the data.
     * @param {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}
     * @deprecated
     */
    filter(dataSource, query, fields) {
        super.filter(dataSource, query, fields);
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Opens the popup that displays the list of items.
     *
     * @returns {void}
     * @deprecated
     */
    showPopup(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        super.showPopup(e);
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Hides the popup if it is in open state.
     *
     * @returns {void}
     * @deprecated
     */
    hidePopup(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        const inputValue = this.inputElement && this.inputElement.value === '' ? null
            : this.inputElement && this.inputElement.value;
        if (!isNullOrUndefined(this.listData)) {
            const isEscape = this.isEscapeKey;
            if (this.isEscapeKey) {
                Input.setValue(this.typedString, this.inputElement, this.floatLabelType, this.showClearButton);
                this.isEscapeKey = false;
            }
            if (this.autofill) {
                this.removeFillSelection();
            }
            const dataItem = this.isSelectCustom ? { text: '' } : this.getItemData();
            const selected = !isNullOrUndefined(this.list) ? this.list.querySelector('.' + dropDownListClasses.selected) : null;
            if (this.inputElement && dataItem.text === this.inputElement.value && !isNullOrUndefined(selected)) {
                if (this.isSelected) {
                    this.onChangeEvent(e);
                    this.isSelectCustom = false;
                }
                super.hidePopup(e);
                return;
            }
            if (this.getModuleName() === 'combobox' && this.inputElement.value.trim() !== '') {
                const dataSource = this.sortedData;
                const type = this.typeOfData(dataSource).typeof;
                const searchItem = Search(this.inputElement.value, this.liCollections, 'Equal', true, dataSource, this.fields, type);
                this.selectedLI = searchItem.item;
                if (isNullOrUndefined(searchItem.index)) {
                    searchItem.index = Search(this.inputElement.value, this.liCollections, 'StartsWith', true, dataSource, this.fields, type).index;
                }
                this.activeIndex = searchItem.index;
                if (!isNullOrUndefined(this.selectedLI)) {
                    this.updateSelectedItem(this.selectedLI, null, true);
                }
                else if (isEscape) {
                    this.isSelectCustom = true;
                    this.removeSelection();
                }
            }
            if (!this.isEscapeKey && this.isTyped && !this.isInteracted) {
                this.customValue(e);
            }
        }
        if (isNullOrUndefined(this.listData) && this.allowCustom && !isNullOrUndefined(inputValue) && inputValue !== this.value) {
            this.customValue();
        }
        super.hidePopup(e);
    }
    /**
     * Sets the focus to the component for interaction.
     *
     * @returns {void}
     */
    focusIn() {
        if (!this.enabled) {
            return;
        }
        if (Browser.isDevice && !this.isFiltering()) {
            this.preventFocus = true;
        }
        super.focusIn();
    }
    /**
     * Allows you to clear the selected values from the component.
     *
     * @returns {void}
     * @deprecated
     */
    clear() {
        this.value = null;
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Moves the focus from the component if the component is already focused.
     *
     * @returns {void}
     * @deprecated
     */
    focusOut(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        super.focusOut(e);
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets all the list items bound on this component.
     *
     * @returns {Element[]}
     * @deprecated
     */
    getItems() {
        return super.getItems();
    }
    /**
     * Gets the data Object that matches the given value.
     *
     * @param { string | number } value - Specifies the value of the list item.
     * @returns {Object}
     * @deprecated
     */
    getDataByValue(value) {
        return super.getDataByValue(value);
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    renderHightSearch() {
        // update high light search
    }
};
__decorate$3([
    Property(false)
], ComboBox.prototype, "autofill", void 0);
__decorate$3([
    Property(true)
], ComboBox.prototype, "allowCustom", void 0);
__decorate$3([
    Property({})
], ComboBox.prototype, "htmlAttributes", void 0);
__decorate$3([
    Property(false)
], ComboBox.prototype, "allowFiltering", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "query", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "index", void 0);
__decorate$3([
    Property(true)
], ComboBox.prototype, "showClearButton", void 0);
__decorate$3([
    Property(false)
], ComboBox.prototype, "enableRtl", void 0);
__decorate$3([
    Event()
], ComboBox.prototype, "customValueSpecifier", void 0);
__decorate$3([
    Event()
], ComboBox.prototype, "filtering", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "valueTemplate", void 0);
__decorate$3([
    Property('Never')
], ComboBox.prototype, "floatLabelType", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "filterBarPlaceholder", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "cssClass", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "headerTemplate", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "footerTemplate", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "placeholder", void 0);
__decorate$3([
    Property('100%')
], ComboBox.prototype, "width", void 0);
__decorate$3([
    Property('300px')
], ComboBox.prototype, "popupHeight", void 0);
__decorate$3([
    Property('100%')
], ComboBox.prototype, "popupWidth", void 0);
__decorate$3([
    Property(false)
], ComboBox.prototype, "readonly", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "text", void 0);
__decorate$3([
    Property(null)
], ComboBox.prototype, "value", void 0);
ComboBox = __decorate$3([
    NotifyPropertyChanges
], ComboBox);

/**
 * export all modules from current location
 */

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../combo-box/combo-box-model.d.ts'/>
dropDownListClasses.root = 'e-autocomplete';
dropDownListClasses.icon = 'e-input-group-icon e-ddl-icon e-search-icon';
/**
 * The AutoComplete component provides the matched suggestion list when type into the input,
 * from which the user can select one.
 * ```html
 * <input id="list" type="text"/>
 * ```
 * ```typescript
 *   let atcObj:AutoComplete = new AutoComplete();
 *   atcObj.appendTo("#list");
 * ```
 */
let AutoComplete = class AutoComplete extends ComboBox {
    /**
     * * Constructor for creating the widget
     *
     * @param {AutoCompleteModel} options - Specifies the AutoComplete model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.isFiltered = false;
        this.searchList = false;
    }
    /**
     * Initialize the event handler
     *
     * @private
     * @returns {void}
     */
    preRender() {
        super.preRender();
    }
    getLocaleName() {
        return 'auto-complete';
    }
    getNgDirective() {
        return 'EJS-AUTOCOMPLETE';
    }
    getQuery(query) {
        const filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
        const filterType = (this.queryString === '' && !isNullOrUndefined(this.value)) ? 'equal' : this.filterType;
        const queryString = (this.queryString === '' && !isNullOrUndefined(this.value)) ? this.value : this.queryString;
        if (this.isFiltered) {
            return filterQuery;
        }
        if (this.queryString !== null && this.queryString !== '') {
            const dataType = this.typeOfData(this.dataSource).typeof;
            if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                filterQuery.where('', filterType, queryString, this.ignoreCase, this.ignoreAccent);
            }
            else {
                const mapping = !isNullOrUndefined(this.fields.value) ? this.fields.value : '';
                filterQuery.where(mapping, filterType, queryString, this.ignoreCase, this.ignoreAccent);
            }
        }
        if (!isNullOrUndefined(this.suggestionCount)) {
            // Since defualt value of suggestioncount is 20, checked the condition
            if (this.suggestionCount !== 20) {
                for (let queryElements = 0; queryElements < filterQuery.queries.length; queryElements++) {
                    if (filterQuery.queries[queryElements].fn === 'onTake') {
                        filterQuery.queries.splice(queryElements, 1);
                    }
                }
            }
            filterQuery.take(this.suggestionCount);
        }
        return filterQuery;
    }
    searchLists(e) {
        this.isTyped = true;
        this.isDataFetched = this.isSelectCustom = false;
        if (isNullOrUndefined(this.list)) {
            super.renderList(e, true);
        }
        this.queryString = this.filterInput.value;
        if (e.type !== 'mousedown' && (e.keyCode === 40 || e.keyCode === 38)) {
            this.queryString = this.queryString === '' ? null : this.queryString;
            this.beforePopupOpen = true;
            this.resetList(this.dataSource, this.fields, null, e);
            return;
        }
        this.isSelected = false;
        this.activeIndex = null;
        const eventArgs = {
            preventDefaultAction: false,
            text: this.filterInput.value,
            updateData: (dataSource, query, fields) => {
                if (eventArgs.cancel) {
                    return;
                }
                this.isFiltered = true;
                this.filterAction(dataSource, query, fields);
            },
            cancel: false
        };
        this.trigger('filtering', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel && !this.isFiltered && !eventArgs.preventDefaultAction) {
                this.searchList = true;
                this.filterAction(this.dataSource, null, this.fields, e);
            }
        });
    }
    /**
     * To filter the data from given data source by using query
     *
     * @param {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param {Query} query - Specify the query to filter the data.
     * @param {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}
     * @deprecated
     */
    filter(dataSource, query, fields) {
        this.isFiltered = true;
        this.filterAction(dataSource, query, fields);
    }
    filterAction(dataSource, query, fields, e) {
        this.beforePopupOpen = true;
        if (this.queryString !== '' && (this.queryString.length >= this.minLength)) {
            this.resetList(dataSource, fields, query, e);
        }
        else {
            this.hidePopup(e);
            this.beforePopupOpen = false;
        }
        this.renderReactTemplates();
    }
    clearAll(e, property) {
        if (isNullOrUndefined(property) || (!isNullOrUndefined(property) && isNullOrUndefined(property.dataSource))) {
            super.clearAll(e);
        }
        if (this.beforePopupOpen) {
            this.hidePopup();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onActionComplete(ulElement, list, e, isUpdated) {
        this.fixedHeaderElement = null;
        super.onActionComplete(ulElement, list, e);
        const item = this.list.querySelector('.' + dropDownListClasses.li);
        if (!isNullOrUndefined(item)) {
            removeClass([item], dropDownListClasses.focus);
        }
        this.postBackAction();
    }
    postBackAction() {
        if (this.autofill && !isNullOrUndefined(this.liCollections[0]) && this.searchList) {
            const items = [this.liCollections[0]];
            const dataSource = this.listData;
            const type = this.typeOfData(dataSource).typeof;
            const searchItem = Search(this.inputElement.value, items, 'StartsWith', this.ignoreCase, dataSource, this.fields, type);
            this.searchList = false;
            if (!isNullOrUndefined(searchItem.item)) {
                super.setAutoFill(this.liCollections[0], true);
            }
        }
    }
    setSelection(li, e) {
        if (!this.isValidLI(li)) {
            this.selectedLI = li;
            return;
        }
        if (!isNullOrUndefined(e) && e.type === 'keydown' && e.action !== 'enter'
            && e.action !== 'tab' && this.isValidLI(li)) {
            const value = this.getFormattedValue(li.getAttribute('data-value'));
            this.activeIndex = this.getIndexByValue(value);
            this.setHoverList(li);
            this.selectedLI = li;
            this.setScrollPosition(e);
            if (this.autofill && this.isPopupOpen) {
                this.preventAutoFill = false;
                const isKeyNavigate = (e && e.action === 'down' || e.action === 'up' ||
                    e.action === 'home' || e.action === 'end' || e.action === 'pageUp' || e.action === 'pageDown');
                super.setAutoFill(li, isKeyNavigate);
            }
        }
        else {
            super.setSelection(li, e);
        }
    }
    listOption(dataSource, fieldsSettings) {
        const fields = super.listOption(dataSource, fieldsSettings);
        if (isNullOrUndefined(fields.itemCreated)) {
            fields.itemCreated = (e) => {
                if (this.highlight) {
                    if (this.element.tagName === this.getNgDirective() && this.itemTemplate) {
                        setTimeout(() => {
                            highlightSearch(e.item, this.queryString, this.ignoreCase, this.filterType);
                        }, 0);
                    }
                    else {
                        highlightSearch(e.item, this.queryString, this.ignoreCase, this.filterType);
                    }
                }
            };
        }
        else {
            const itemCreated = fields.itemCreated;
            fields.itemCreated = (e) => {
                if (this.highlight) {
                    highlightSearch(e.item, this.queryString, this.ignoreCase, this.filterType);
                }
                itemCreated.apply(this, [e]);
            };
        }
        return fields;
    }
    isFiltering() {
        return true;
    }
    renderPopup(e) {
        this.list.scrollTop = 0;
        super.renderPopup(e);
    }
    isEditTextBox() {
        return true && this.inputElement.value.trim() !== '';
    }
    isPopupButton() {
        return this.showPopupButton;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSelectFocusItem(element) {
        return false;
    }
    setInputValue(newProp, oldProp) {
        let oldValue = oldProp && oldProp.text ? oldProp.text : oldProp ? oldProp.value : oldProp;
        let value = newProp && newProp.text ? newProp.text : newProp && newProp.value ? newProp.value : this.value;
        if (value && this.typedString === '' && !this.allowCustom && !(this.dataSource instanceof DataManager)) {
            let checkFields_1 = this.typeOfData(this.dataSource).typeof === 'string' ? '' : this.fields.value;
            const listLength = this.getItems().length;
            let query = new Query();
            let _this = this;
            new DataManager(this.dataSource).executeQuery(query.where(new Predicate(checkFields_1, 'equal', value)))
                .then(function (e) {
                if (e.result.length > 0) {
                    _this.value = checkFields_1 !== '' ? e.result[0][_this.fields.value].toString() : e.result[0].toString();
                    _this.addItem(e.result, listLength);
                    _this.updateValues();
                }
                else {
                    newProp && newProp.text ? _this.setOldText(oldValue) : newProp && newProp.value ? _this.setOldValue(oldValue) : _this.updateValues();
                }
            });
        }
        else if (newProp) {
            newProp.text ? this.setOldText(oldValue) : this.setOldValue(oldValue);
        }
    }
    /**
     * Search the entered text and show it in the suggestion list if available.
     *
     * @returns {void}
     * @deprecated
     */
    showPopup(e) {
        if (!this.enabled) {
            return;
        }
        if (this.beforePopupOpen) {
            this.refreshPopup();
            return;
        }
        this.beforePopupOpen = true;
        this.preventAutoFill = true;
        if (isNullOrUndefined(this.list)) {
            this.renderList(e);
        }
        else {
            this.resetList(this.dataSource, this.fields, null, e);
        }
    }
    /**
     * Hides the popup if it is in open state.
     *
     * @returns {void}
     */
    hidePopup(e) {
        super.hidePopup(e);
        this.activeIndex = null;
    }
    /**
     * Dynamically change the value of properties.
     *
     * @param {AutoCompleteModel} newProp - Returns the dynamic property value of the component.
     * @param {AutoCompleteModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    onPropertyChanged(newProp, oldProp) {
        if (this.getModuleName() === 'autocomplete') {
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'showPopupButton':
                    if (this.showPopupButton) {
                        const button = Input.appendSpan(dropDownListClasses.icon, this.inputWrapper.container, this.createElement);
                        this.inputWrapper.buttons[0] = button;
                        Input.calculateWidth(this.inputElement, this.inputWrapper.container);
                        if (!isNullOrUndefined(this.inputWrapper.buttons[0]) && !isNullOrUndefined(this.inputWrapper.container.getElementsByClassName('e-float-text-overflow')[0]) && this.floatLabelType !== 'Never') {
                            this.inputWrapper.container.getElementsByClassName('e-float-text-overflow')[0].classList.add('e-icon');
                        }
                        if (this.inputWrapper && this.inputWrapper.buttons && this.inputWrapper.buttons[0]) {
                            EventHandler.add(this.inputWrapper.buttons[0], 'click', this.dropDownClick, this);
                        }
                    }
                    else {
                        detach(this.inputWrapper.buttons[0]);
                        this.inputWrapper.buttons[0] = null;
                    }
                    break;
                default: {
                    // eslint-disable-next-line max-len
                    const atcProps = this.getPropObject(prop, newProp, oldProp);
                    super.onPropertyChanged(atcProps.newProperty, atcProps.oldProperty);
                    break;
                }
            }
        }
    }
    renderHightSearch() {
        if (this.highlight) {
            for (let i = 0; i < this.liCollections.length; i++) {
                const isHighlight = this.ulElement.querySelector('.e-active');
                if (!isHighlight) {
                    revertHighlightSearch(this.liCollections[i]);
                    highlightSearch(this.liCollections[i], this.queryString, this.ignoreCase, this.filterType);
                }
            }
        }
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'autocomplete';
    }
    /**
     * To initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    render() {
        super.render();
    }
};
__decorate$4([
    Complex({ value: null, iconCss: null, groupBy: null }, FieldSettings)
], AutoComplete.prototype, "fields", void 0);
__decorate$4([
    Property(true)
], AutoComplete.prototype, "ignoreCase", void 0);
__decorate$4([
    Property(false)
], AutoComplete.prototype, "showPopupButton", void 0);
__decorate$4([
    Property(false)
], AutoComplete.prototype, "highlight", void 0);
__decorate$4([
    Property(20)
], AutoComplete.prototype, "suggestionCount", void 0);
__decorate$4([
    Property({})
], AutoComplete.prototype, "htmlAttributes", void 0);
__decorate$4([
    Property(null)
], AutoComplete.prototype, "query", void 0);
__decorate$4([
    Property(1)
], AutoComplete.prototype, "minLength", void 0);
__decorate$4([
    Property('Contains')
], AutoComplete.prototype, "filterType", void 0);
__decorate$4([
    Event()
], AutoComplete.prototype, "filtering", void 0);
__decorate$4([
    Property(null)
], AutoComplete.prototype, "index", void 0);
__decorate$4([
    Property('Never')
], AutoComplete.prototype, "floatLabelType", void 0);
__decorate$4([
    Property(null)
], AutoComplete.prototype, "valueTemplate", void 0);
__decorate$4([
    Property(null)
], AutoComplete.prototype, "filterBarPlaceholder", void 0);
__decorate$4([
    Property(false)
], AutoComplete.prototype, "allowFiltering", void 0);
__decorate$4([
    Property(null)
], AutoComplete.prototype, "text", void 0);
AutoComplete = __decorate$4([
    NotifyPropertyChanges
], AutoComplete);

/**
 * export all modules from current location
 */

/**
 * FloatLable Moduel
 * Specifies whether to display the floating label above the input element.
 */
const FLOATLINE = 'e-float-line';
const FLOATTEXT = 'e-float-text';
const LABELTOP = 'e-label-top';
const LABELBOTTOM = 'e-label-bottom';
/* eslint-disable valid-jsdoc */
/**
 * Function to create Float Label element.
 *
 * @param {HTMLDivElement} overAllWrapper - Overall wrapper of multiselect.
 * @param {HTMLElement} searchWrapper - Search wrapper of multiselect.
 * @param {HTMLElement} element - The given html element.
 * @param {HTMLInputElement} inputElement - Specify the input wrapper.
 * @param {number[] | string[] | boolean[]} value - Value of the MultiSelect.
 * @param {FloatLabelType} floatLabelType - Specify the FloatLabel Type.
 * @param {string} placeholder - Specify the PlaceHolder text.
 */
function createFloatLabel(overAllWrapper, searchWrapper, element, inputElement, value, floatLabelType, placeholder) {
    const floatLinelement = createElement('span', { className: FLOATLINE });
    const floatLabelElement = createElement('label', { className: FLOATTEXT });
    const id = element.getAttribute('id') ? element.getAttribute('id') : getUniqueID('ej2_multiselect');
    element.id = id;
    if (!isNullOrUndefined(element.id) && element.id !== '') {
        floatLabelElement.id = 'label_' + element.id.replace(/ /g, '_');
        attributes(inputElement, { 'aria-labelledby': floatLabelElement.id });
    }
    if (!isNullOrUndefined(inputElement.placeholder) && inputElement.placeholder !== '') {
        floatLabelElement.innerText = encodePlaceholder(inputElement.placeholder);
        inputElement.removeAttribute('placeholder');
    }
    floatLabelElement.innerText = encodePlaceholder(placeholder);
    searchWrapper.appendChild(floatLinelement);
    searchWrapper.appendChild(floatLabelElement);
    overAllWrapper.classList.add('e-float-input');
    updateFloatLabelState(value, floatLabelElement);
    if (floatLabelType === 'Always') {
        if (floatLabelElement.classList.contains(LABELBOTTOM)) {
            removeClass([floatLabelElement], LABELBOTTOM);
        }
        addClass([floatLabelElement], LABELTOP);
    }
}
/**
 * Function to update status of the Float Label element.
 *
 * @param {string[] | number[] | boolean[]} value - Value of the MultiSelect.
 * @param {HTMLElement} label - Float label element.
 */
function updateFloatLabelState(value, label) {
    if (value && value.length > 0) {
        addClass([label], LABELTOP);
        removeClass([label], LABELBOTTOM);
    }
    else {
        removeClass([label], LABELTOP);
        addClass([label], LABELBOTTOM);
    }
}
/**
 * Function to remove Float Label element.
 *
 * @param {HTMLDivElement} overAllWrapper - Overall wrapper of multiselect.
 * @param {HTMLDivElement} componentWrapper - Wrapper element of multiselect.
 * @param {HTMLElement} searchWrapper - Search wrapper of multiselect.
 * @param {HTMLInputElement} inputElement - Specify the input wrapper.
 * @param {number[] | string[] | boolean[]} value - Value of the MultiSelect.
 * @param {FloatLabelType} floatLabelType - Specify the FloatLabel Type.
 * @param {string} placeholder - Specify the PlaceHolder text.
 */
function removeFloating(overAllWrapper, componentWrapper, searchWrapper, inputElement, value, floatLabelType, placeholder) {
    const placeholderElement = componentWrapper.querySelector('.' + FLOATTEXT);
    const floatLine = componentWrapper.querySelector('.' + FLOATLINE);
    let placeholderText;
    if (!isNullOrUndefined(placeholderElement)) {
        placeholderText = placeholderElement.innerText;
        detach(searchWrapper.querySelector('.' + FLOATTEXT));
        setPlaceHolder(value, inputElement, placeholderText);
        if (!isNullOrUndefined(floatLine)) {
            detach(searchWrapper.querySelector('.' + FLOATLINE));
        }
    }
    else {
        placeholderText = (placeholder !== null) ? placeholder : '';
        setPlaceHolder(value, inputElement, placeholderText);
    }
    overAllWrapper.classList.remove('e-float-input');
}
/**
 * Function to set the placeholder to the element.
 *
 * @param {number[] | string[] | boolean[]} value - Value of the MultiSelect.
 * @param {HTMLInputElement} inputElement - Specify the input wrapper.
 * @param {string} placeholder - Specify the PlaceHolder text.
 */
function setPlaceHolder(value, inputElement, placeholder) {
    if (value && value.length) {
        inputElement.placeholder = '';
    }
    else {
        inputElement.placeholder = placeholder;
    }
}
/**
 * Function for focusing the Float Element.
 *
 * @param {HTMLDivElement} overAllWrapper - Overall wrapper of multiselect.
 * @param {HTMLDivElement} componentWrapper - Wrapper element of multiselect.
 */
function floatLabelFocus(overAllWrapper, componentWrapper) {
    overAllWrapper.classList.add('e-input-focus');
    const label = componentWrapper.querySelector('.' + FLOATTEXT);
    if (!isNullOrUndefined(label)) {
        addClass([label], LABELTOP);
        if (label.classList.contains(LABELBOTTOM)) {
            removeClass([label], LABELBOTTOM);
        }
    }
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Function to focus the Float Label element.
 *
 * @param {HTMLDivElement} overAllWrapper - Overall wrapper of multiselect.
 * @param {HTMLDivElement} componentWrapper - Wrapper element of multiselect.
 * @param {number[] | string[] | boolean[]} value - Value of the MultiSelect.
 * @param {FloatLabelType} floatLabelType - Specify the FloatLabel Type.
 * @param {string} placeholder - Specify the PlaceHolder text.
 */
function floatLabelBlur(overAllWrapper, componentWrapper, value, floatLabelType, placeholder) {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    overAllWrapper.classList.remove('e-input-focus');
    const label = componentWrapper.querySelector('.' + FLOATTEXT);
    if (value && value.length <= 0 && floatLabelType === 'Auto' && !isNullOrUndefined(label)) {
        if (label.classList.contains(LABELTOP)) {
            removeClass([label], LABELTOP);
        }
        addClass([label], LABELBOTTOM);
    }
}
function encodePlaceholder(placeholder) {
    let result = '';
    if (!isNullOrUndefined(placeholder) && placeholder !== '') {
        const spanElement = document.createElement('span');
        spanElement.innerHTML = '<input  placeholder="' + placeholder + '"/>';
        const hiddenInput = (spanElement.children[0]);
        result = hiddenInput.placeholder;
    }
    return result;
}
/* eslint-enable valid-jsdoc */

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../drop-down-base/drop-down-base-model.d.ts'/>
const FOCUS = 'e-input-focus';
const DISABLED$1 = 'e-disabled';
const OVER_ALL_WRAPPER = 'e-multiselect e-input-group e-control-wrapper';
const ELEMENT_WRAPPER = 'e-multi-select-wrapper';
const ELEMENT_MOBILE_WRAPPER = 'e-mob-wrapper';
const HIDE_LIST = 'e-hide-listitem';
const DELIMITER_VIEW = 'e-delim-view';
const CHIP_WRAPPER$1 = 'e-chips-collection';
const CHIP$1 = 'e-chips';
const CHIP_CONTENT$1 = 'e-chipcontent';
const CHIP_CLOSE$1 = 'e-chips-close';
const CHIP_SELECTED = 'e-chip-selected';
const SEARCHBOX_WRAPPER = 'e-searcher';
const DELIMITER_VIEW_WRAPPER = 'e-delimiter';
const ZERO_SIZE = 'e-zero-size';
const REMAIN_WRAPPER$1 = 'e-remain';
const CLOSEICON_CLASS$1 = 'e-chips-close e-close-hooker';
const DELIMITER_WRAPPER = 'e-delim-values';
const POPUP_WRAPPER = 'e-ddl e-popup e-multi-select-list-wrapper';
const INPUT_ELEMENT = 'e-dropdownbase';
const RTL_CLASS = 'e-rtl';
const CLOSE_ICON_HIDE = 'e-close-icon-hide';
const MOBILE_CHIP = 'e-mob-chip';
const FOOTER$1 = 'e-ddl-footer';
const HEADER$1 = 'e-ddl-header';
const DISABLE_ICON = 'e-ddl-disable-icon';
const SPINNER_CLASS$1 = 'e-ms-spinner-icon';
const HIDDEN_ELEMENT = 'e-multi-hidden';
const destroy = 'destroy';
const dropdownIcon = 'e-input-group-icon e-ddl-icon';
const iconAnimation = 'e-icon-anim';
const TOTAL_COUNT_WRAPPER$1 = 'e-delim-total';
const BOX_ELEMENT = 'e-multiselect-box';
const FILTERPARENT = 'e-filter-parent';
const CUSTOM_WIDTH = 'e-search-custom-width';
const FILTERINPUT = 'e-input-filter';
/**
 * The Multiselect allows the user to pick a more than one value from list of predefined values.
 * ```html
 * <select id="list">
 *      <option value='1'>Badminton</option>
 *      <option value='2'>Basketball</option>
 *      <option value='3'>Cricket</option>
 *      <option value='4'>Football</option>
 *      <option value='5'>Tennis</option>
 * </select>
 * ```
 * ```typescript
 * <script>
 *   var multiselectObj = new Multiselect();
 *   multiselectObj.appendTo("#list");
 * </script>
 * ```
 */
let MultiSelect = class MultiSelect extends DropDownBase {
    /**
     * Constructor for creating the DropDownList widget.
     *
     * @param {MultiSelectModel} option - Specifies the MultiSelect model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(option, element) {
        super(option, element);
        this.clearIconWidth = 0;
        this.previousFilterText = '';
        this.isValidKey = false;
        this.selectAllEventData = [];
        this.selectAllEventEle = [];
        this.resetMainList = null;
        this.resetFilteredData = false;
        this.scrollFocusStatus = false;
        this.keyDownStatus = false;
    }
    enableRTL(state) {
        if (state) {
            this.overAllWrapper.classList.add(RTL_CLASS);
        }
        else {
            this.overAllWrapper.classList.remove(RTL_CLASS);
        }
        if (this.popupObj) {
            this.popupObj.enableRtl = state;
            this.popupObj.dataBind();
        }
    }
    requiredModules() {
        const modules = [];
        if (this.mode === 'CheckBox') {
            this.isGroupChecking = this.enableGroupCheckBox;
            if (this.enableGroupCheckBox) {
                const prevOnChange = this.isProtectedOnChange;
                this.isProtectedOnChange = true;
                this.enableSelectionOrder = false;
                this.isProtectedOnChange = prevOnChange;
            }
            this.allowCustomValue = false;
            this.hideSelectedItem = false;
            this.closePopupOnSelect = false;
            modules.push({
                member: 'CheckBoxSelection',
                args: [this]
            });
        }
        return modules;
    }
    updateHTMLAttribute() {
        if (Object.keys(this.htmlAttributes).length) {
            for (const htmlAttr of Object.keys(this.htmlAttributes)) {
                switch (htmlAttr) {
                    case 'class': {
                        const updatedClassValue = (this.htmlAttributes[`${htmlAttr}`].replace(/\s+/g, ' ')).trim();
                        if (updatedClassValue !== '') {
                            addClass([this.overAllWrapper], updatedClassValue.split(' '));
                            addClass([this.popupWrapper], updatedClassValue.split(' '));
                        }
                        break;
                    }
                    case 'disabled':
                        this.enable(false);
                        break;
                    case 'placeholder':
                        if (!this.placeholder) {
                            this.inputElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                            this.setProperties({ placeholder: this.inputElement.placeholder }, true);
                            this.refreshPlaceHolder();
                        }
                        break;
                    default: {
                        const defaultAttr = ['id'];
                        const validateAttr = ['name', 'required', 'aria-required', 'form'];
                        const containerAttr = ['title', 'role', 'style', 'class'];
                        if (defaultAttr.indexOf(htmlAttr) > -1) {
                            this.element.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                        else if (htmlAttr.indexOf('data') === 0 || validateAttr.indexOf(htmlAttr) > -1) {
                            this.hiddenElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                        else if (containerAttr.indexOf(htmlAttr) > -1) {
                            this.overAllWrapper.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                        else if (htmlAttr !== 'size' && !isNullOrUndefined(this.inputElement)) {
                            this.inputElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                        break;
                    }
                }
            }
        }
    }
    updateReadonly(state) {
        if (!isNullOrUndefined(this.inputElement)) {
            if (state || this.mode === 'CheckBox') {
                this.inputElement.setAttribute('readonly', 'true');
            }
            else {
                this.inputElement.removeAttribute('readonly');
            }
        }
    }
    updateClearButton(state) {
        if (state) {
            if (this.overAllClear.parentNode) {
                this.overAllClear.style.display = '';
            }
            else {
                this.componentWrapper.appendChild(this.overAllClear);
            }
            this.componentWrapper.classList.remove(CLOSE_ICON_HIDE);
        }
        else {
            this.overAllClear.style.display = 'none';
            this.componentWrapper.classList.add(CLOSE_ICON_HIDE);
        }
    }
    updateCssClass() {
        if (!isNullOrUndefined(this.cssClass) && this.cssClass !== '') {
            let updatedCssClassValues = this.cssClass;
            updatedCssClassValues = (this.cssClass.replace(/\s+/g, ' ')).trim();
            if (updatedCssClassValues !== '') {
                addClass([this.overAllWrapper], updatedCssClassValues.split(' '));
                addClass([this.popupWrapper], updatedCssClassValues.split(' '));
            }
        }
    }
    updateOldPropCssClass(oldClass) {
        if (!isNullOrUndefined(oldClass) && oldClass !== '') {
            oldClass = (oldClass.replace(/\s+/g, ' ')).trim();
            if (oldClass !== '') {
                removeClass([this.overAllWrapper], oldClass.split(' '));
                removeClass([this.popupWrapper], oldClass.split(' '));
            }
        }
    }
    onPopupShown(e) {
        if (Browser.isDevice && (this.mode === 'CheckBox' && this.allowFiltering)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const proxy = this;
            window.onpopstate = () => {
                proxy.hidePopup();
                proxy.inputElement.focus();
            };
            history.pushState({}, '');
        }
        const animModel = { name: 'FadeIn', duration: 100 };
        const eventArgs = { popup: this.popupObj, event: e, cancel: false, animation: animModel };
        this.trigger('open', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel) {
                this.focusAtFirstListItem();
                if (this.popupObj) {
                    document.body.appendChild(this.popupObj.element);
                }
                if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                    this.updateListItems(this.list.querySelectorAll('li.e-list-item'), this.mainList.querySelectorAll('li.e-list-item'));
                }
                if (this.mode === 'CheckBox' || this.showDropDownIcon) {
                    addClass([this.overAllWrapper], [iconAnimation]);
                }
                this.refreshPopup();
                this.renderReactTemplates();
                if (this.popupObj) {
                    this.popupObj.show(eventArgs.animation, (this.zIndex === 1000) ? this.element : null);
                }
                attributes(this.inputElement, { 'aria-expanded': 'true', 'aria-owns': this.inputElement.id + '_options' });
                this.updateAriaActiveDescendant();
                if (this.isFirstClick) {
                    this.loadTemplate();
                }
            }
        });
    }
    updateListItems(listItems, mainListItems) {
        for (let i = 0; i < listItems.length; i++) {
            this.findGroupStart(listItems[i]);
            this.findGroupStart(mainListItems[i]);
        }
        this.deselectHeader();
    }
    loadTemplate() {
        this.refreshListItems(null);
        if (this.mode === 'CheckBox') {
            this.removeFocus();
        }
        this.notify('reOrder', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', e: this });
    }
    setScrollPosition() {
        if (((!this.hideSelectedItem && this.mode !== 'CheckBox') || (this.mode === 'CheckBox' && !this.enableSelectionOrder)) &&
            (!isNullOrUndefined(this.value) && (this.value.length > 0))) {
            const valueEle = this.findListElement((this.hideSelectedItem ? this.ulElement : this.list), 'li', 'data-value', this.value[this.value.length - 1]);
            if (!isNullOrUndefined(valueEle)) {
                this.scrollBottom(valueEle);
            }
        }
    }
    focusAtFirstListItem() {
        if (this.ulElement && this.ulElement.querySelector('li.'
            + dropDownBaseClasses.li)) {
            let element;
            if (this.mode === 'CheckBox') {
                this.removeFocus();
                return;
            }
            else {
                element = this.ulElement.querySelector('li.'
                    + dropDownBaseClasses.li + ':not(.'
                    + HIDE_LIST + ')');
            }
            if (element !== null) {
                this.removeFocus();
                this.addListFocus(element);
            }
        }
    }
    focusAtLastListItem(data) {
        let activeElement;
        if (data) {
            activeElement = Search(data, this.liCollections, 'StartsWith', this.ignoreCase);
        }
        else {
            if (this.value && this.value.length) {
                Search(this.value[this.value.length - 1], this.liCollections, 'StartsWith', this.ignoreCase);
            }
            else {
                activeElement = null;
            }
        }
        if (activeElement && activeElement.item !== null) {
            this.addListFocus(activeElement.item);
            this.scrollBottom(activeElement.item, activeElement.index);
        }
    }
    getAriaAttributes() {
        const ariaAttributes = {
            'aria-disabled': 'false',
            'role': 'combobox',
            'aria-expanded': 'false'
        };
        return ariaAttributes;
    }
    updateListARIA() {
        if (!isNullOrUndefined(this.ulElement)) {
            attributes(this.ulElement, { 'id': this.element.id + '_options', 'role': 'listbox', 'aria-hidden': 'false' });
        }
        const disableStatus = !isNullOrUndefined(this.inputElement) && (this.inputElement.disabled) ? true : false;
        if (!this.isPopupOpen() && !isNullOrUndefined(this.inputElement)) {
            attributes(this.inputElement, this.getAriaAttributes());
        }
        if (disableStatus) {
            attributes(this.inputElement, { 'aria-disabled': 'true' });
        }
        this.ensureAriaDisabled((disableStatus) ? 'true' : 'false');
    }
    ensureAriaDisabled(status) {
        if (this.htmlAttributes && this.htmlAttributes['aria-disabled']) {
            const attr = this.htmlAttributes;
            extend(attr, { 'aria-disabled': status }, attr);
            this.setProperties({ htmlAttributes: attr }, true);
        }
    }
    removelastSelection(e) {
        const elements = this.chipCollectionWrapper.querySelectorAll('span.' + CHIP$1);
        const value = elements[elements.length - 1].getAttribute('data-value');
        if (!isNullOrUndefined(this.value)) {
            this.tempValues = this.value.slice();
        }
        let customValue = this.getFormattedValue(value);
        if (this.allowCustomValue && (value !== 'false' && customValue === false || (!isNullOrUndefined(customValue) &&
            customValue.toString() === 'NaN'))) {
            customValue = value;
        }
        this.removeValue(customValue, e);
        this.removeChipSelection();
        this.updateDelimeter(this.delimiterChar, e);
        this.makeTextBoxEmpty();
        if (this.mainList && this.listData) {
            this.refreshSelection();
        }
        this.checkPlaceholderSize();
    }
    onActionFailure(e) {
        super.onActionFailure(e);
        this.renderPopup();
        this.onPopupShown();
    }
    targetElement() {
        this.targetInputElement = this.inputElement;
        if (this.mode === 'CheckBox' && this.allowFiltering) {
            this.notify('targetElement', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
        }
        return this.targetInputElement.value;
    }
    getForQuery(valuecheck) {
        let predicate;
        const field = isNullOrUndefined(this.fields.value) ? this.fields.text : this.fields.value;
        for (let i = 0; i < valuecheck.length; i++) {
            if (i === 0) {
                predicate = new Predicate(field, 'equal', valuecheck[i]);
            }
            else {
                predicate = predicate.or(field, 'equal', valuecheck[i]);
            }
        }
        if (this.dataSource instanceof DataManager && this.dataSource.adaptor instanceof JsonAdaptor) {
            return new Query().where(predicate);
        }
        else {
            return this.getQuery(this.query).clone().where(predicate);
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    onActionComplete(ulElement, list, e, isUpdated) {
        /* eslint-enable @typescript-eslint/no-unused-vars */
        super.onActionComplete(ulElement, list, e);
        this.updateSelectElementData(this.allowFiltering);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const proxy = this;
        if (!isNullOrUndefined(this.value) && !this.allowCustomValue) {
            for (let i = 0; i < this.value.length; i++) {
                const checkEle = this.findListElement(((this.allowFiltering && !isNullOrUndefined(this.mainList)) ? this.mainList : ulElement), 'li', 'data-value', proxy.value[i]);
                if (!checkEle && !(this.dataSource instanceof DataManager)) {
                    this.value.splice(i, 1);
                    i -= 1;
                }
            }
        }
        let valuecheck = [];
        if (!isNullOrUndefined(this.value)) {
            valuecheck = this.presentItemValue(this.ulElement);
        }
        if (valuecheck.length > 0 && this.dataSource instanceof DataManager && !isNullOrUndefined(this.value)
            && this.listData != null) {
            this.addNonPresentItems(valuecheck, this.ulElement, this.listData);
        }
        else {
            this.updateActionList(ulElement, list, e);
        }
        if (this.dataSource instanceof DataManager && this.mode === 'CheckBox' && this.allowFiltering) {
            this.removeFocus();
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    updateActionList(ulElement, list, e, isUpdated) {
        /* eslint-enable @typescript-eslint/no-unused-vars */
        if (this.mode === 'CheckBox' && this.showSelectAll) {
            this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
        }
        if (!this.mainList && !this.mainData) {
            this.mainList = ulElement.cloneNode ? ulElement.cloneNode(true) : ulElement;
            this.mainData = list;
            this.mainListCollection = this.liCollections;
        }
        else if (isNullOrUndefined(this.mainData) || this.mainData.length === 0) {
            this.mainData = list;
        }
        if ((this.remoteCustomValue || list.length <= 0) && this.allowCustomValue && this.inputFocus && this.allowFiltering &&
            this.inputElement.value && this.inputElement.value !== '') {
            this.checkForCustomValue(this.tempQuery, this.fields);
            return;
        }
        if (this.value && this.value.length && ((this.mode !== 'CheckBox' && !isNullOrUndefined(this.inputElement) && this.inputElement.value.trim() !== '') ||
            this.mode === 'CheckBox' || ((this.keyCode === 8 || this.keyCode === 46) && this.allowFiltering &&
            this.allowCustomValue && this.dataSource instanceof DataManager && this.inputElement.value === ''))) {
            this.refreshSelection();
        }
        this.updateListARIA();
        this.unwireListEvents();
        this.wireListEvents();
        if (!isNullOrUndefined(this.setInitialValue)) {
            this.setInitialValue();
        }
        if (!isNullOrUndefined(this.selectAllAction)) {
            this.selectAllAction();
        }
        if (this.setDynValue) {
            if (!isNullOrUndefined(this.text) && (isNullOrUndefined(this.value) || this.value.length === 0)) {
                this.initialTextUpdate();
            }
            this.initialValueUpdate();
            this.initialUpdate();
            this.refreshPlaceHolder();
            if (this.mode !== 'CheckBox' && this.changeOnBlur) {
                this.updateValueState(null, this.value, null);
            }
        }
        this.renderPopup();
        if (this.beforePopupOpen) {
            this.beforePopupOpen = false;
            this.onPopupShown(e);
        }
    }
    refreshSelection() {
        let value;
        let element;
        const className = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        if (!isNullOrUndefined(this.value)) {
            for (let index = 0; !isNullOrUndefined(this.value[index]); index++) {
                value = this.value[index];
                element = this.findListElement(this.list, 'li', 'data-value', value);
                if (element) {
                    addClass([element], className);
                    if (this.hideSelectedItem && element.previousSibling
                        && element.previousElementSibling.classList.contains(dropDownBaseClasses.group)
                        && (!element.nextElementSibling ||
                            element.nextElementSibling.classList.contains(dropDownBaseClasses.group))) {
                        addClass([element.previousElementSibling], className);
                    }
                    if (this.hideSelectedItem && this.fields.groupBy && !element.previousElementSibling.classList.contains(HIDE_LIST)) {
                        this.hideGroupItem(value);
                    }
                    if (this.hideSelectedItem && element.classList.contains(dropDownBaseClasses.focus)) {
                        removeClass([element], dropDownBaseClasses.focus);
                        const listEle = element.parentElement.querySelectorAll('.' +
                            dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')');
                        if (listEle.length > 0) {
                            addClass([listEle[0]], dropDownBaseClasses.focus);
                            this.updateAriaActiveDescendant();
                        }
                        else {
                            //EJ2-57588 - for this task, we prevent the ul element cloning ( this.ulElement = this.ulElement.cloneNode ? <HTMLElement>this.ulElement.cloneNode(true) : this.ulElement;)
                            if (!(this.list && this.list.querySelectorAll('.' + dropDownBaseClasses.li).length > 0)) {
                                this.l10nUpdate();
                                addClass([this.list], dropDownBaseClasses.noData);
                            }
                        }
                    }
                    element.setAttribute('aria-selected', 'true');
                    if (this.mode === 'CheckBox' && element.classList.contains('e-active')) {
                        const ariaValue = element.getElementsByClassName('e-check').length;
                        if (ariaValue === 0) {
                            const args = {
                                module: 'CheckBoxSelection',
                                enable: this.mode === 'CheckBox',
                                li: element,
                                e: null
                            };
                            this.notify('updatelist', args);
                        }
                    }
                }
            }
        }
        this.checkSelectAll();
        this.checkMaxSelection();
    }
    hideGroupItem(value) {
        let element;
        let element1;
        const className = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        element1 = element = this.findListElement(this.ulElement, 'li', 'data-value', value);
        let i = 0;
        let j = 0;
        let temp = true;
        let temp1 = true;
        do {
            if (element && element.previousElementSibling
                && (!element.previousElementSibling.classList.contains(HIDE_LIST) &&
                    element.previousElementSibling.classList.contains(dropDownBaseClasses.li))) {
                temp = false;
            }
            if (!temp || !element || (element.previousElementSibling
                && element.previousElementSibling.classList.contains(dropDownBaseClasses.group))) {
                i = 10;
            }
            else {
                element = element.previousElementSibling;
            }
            if (element1 && element1.nextElementSibling
                && (!element1.nextElementSibling.classList.contains(HIDE_LIST) &&
                    element1.nextElementSibling.classList.contains(dropDownBaseClasses.li))) {
                temp1 = false;
            }
            if (!temp1 || !element1 || (element1.nextElementSibling
                && element1.nextElementSibling.classList.contains(dropDownBaseClasses.group))) {
                j = 10;
            }
            else {
                element1 = element1.nextElementSibling;
            }
        } while (i < 10 || j < 10);
        if (temp && temp1 && !element.previousElementSibling.classList.contains(HIDE_LIST)) {
            addClass([element.previousElementSibling], className);
        }
        else if (temp && temp1 && element.previousElementSibling.classList.contains(HIDE_LIST)) {
            removeClass([element.previousElementSibling], className);
        }
    }
    getValidLi() {
        let liElement = this.ulElement.querySelector('li.' + dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')');
        return (!isNullOrUndefined(liElement) ? liElement : this.liCollections[0]);
    }
    checkSelectAll() {
        const groupItemLength = this.list.querySelectorAll('li.e-list-group-item.e-active').length;
        const listItem = this.list.querySelectorAll('li.e-list-item');
        const searchCount = this.list.querySelectorAll('li.' + dropDownBaseClasses.li).length;
        let searchActiveCount = this.list.querySelectorAll('li.' + dropDownBaseClasses.selected).length;
        if (this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
            searchActiveCount = searchActiveCount - groupItemLength;
        }
        if ((searchCount === searchActiveCount || searchActiveCount === this.maximumSelectionLength)
            && (this.mode === 'CheckBox' && this.showSelectAll)) {
            this.notify('checkSelectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'check' });
        }
        else if ((searchCount !== searchActiveCount) && (this.mode === 'CheckBox' && this.showSelectAll)) {
            this.notify('checkSelectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'uncheck' });
        }
        if (this.enableGroupCheckBox && this.fields.groupBy && !this.enableSelectionOrder) {
            for (let i = 0; i < listItem.length; i++) {
                this.findGroupStart(listItem[i]);
            }
            this.deselectHeader();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    openClick(e) {
        if (!this.openOnClick && this.mode !== 'CheckBox') {
            if (this.targetElement() !== '') {
                this.showPopup();
            }
            else {
                this.hidePopup(e);
            }
        }
        else if (!this.openOnClick && this.mode === 'CheckBox' && !this.isPopupOpen()) {
            this.showPopup();
        }
    }
    keyUp(e) {
        if (this.mode === 'CheckBox' && !this.openOnClick) {
            const char = String.fromCharCode(e.keyCode);
            const isWordCharacter = char.match(/\w/);
            if (!isNullOrUndefined(isWordCharacter)) {
                this.isValidKey = true;
            }
        }
        this.isValidKey = (this.isPopupOpen() && e.keyCode === 8) || this.isValidKey;
        this.isValidKey = e.ctrlKey && e.keyCode === 86 ? false : this.isValidKey;
        if (this.isValidKey) {
            this.isValidKey = false;
            this.expandTextbox();
            this.showOverAllClear();
            switch (e.keyCode) {
                default:
                    // For filtering works in mobile firefox
                    this.search(e);
            }
        }
    }
    /**
     * To filter the multiselect data from given data source by using query
     *
     * @param {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param {Query} query - Specify the query to filter the data.
     * @param {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}
     */
    filter(dataSource, query, fields) {
        this.isFiltered = true;
        this.remoteFilterAction = true;
        this.dataUpdater(dataSource, query, fields);
    }
    getQuery(query) {
        const filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
        if (this.isFiltered) {
            return filterQuery;
        }
        if (this.filterAction) {
            if (this.targetElement() !== null) {
                const dataType = this.typeOfData(this.dataSource).typeof;
                if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                    filterQuery.where('', this.filterType, this.targetElement(), this.ignoreCase, this.ignoreAccent);
                }
                else {
                    const fields = this.fields;
                    filterQuery.where(!isNullOrUndefined(fields.text) ? fields.text : '', this.filterType, this.targetElement(), this.ignoreCase, this.ignoreAccent);
                }
            }
            return filterQuery;
        }
        else {
            return query ? query : this.query ? this.query : new Query();
        }
    }
    dataUpdater(dataSource, query, fields) {
        this.isDataFetched = false;
        if (this.targetElement().trim() === '') {
            const list = this.mainList.cloneNode ? this.mainList.cloneNode(true) : this.mainList;
            if (this.backCommand) {
                this.remoteCustomValue = false;
                if (this.allowCustomValue && list.querySelectorAll('li').length == 0 && this.mainData.length > 0) {
                    this.mainData = [];
                }
                this.onActionComplete(list, this.mainData);
                if (this.value && this.value.length) {
                    this.refreshSelection();
                }
                if (this.keyCode !== 8) {
                    this.focusAtFirstListItem();
                }
                this.notify('reOrder', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', e: this });
            }
        }
        else {
            this.resetList(dataSource, fields, query);
            if (this.allowCustomValue) {
                if (!(dataSource instanceof DataManager)) {
                    this.checkForCustomValue(query, fields);
                }
                else {
                    this.remoteCustomValue = true;
                    this.tempQuery = query;
                }
            }
        }
        this.refreshPopup();
        if (this.mode === 'CheckBox') {
            this.removeFocus();
        }
    }
    checkForCustomValue(query, fields) {
        const dataChecks = !this.getValueByText(this.inputElement.value, this.ignoreCase);
        if (this.allowCustomValue && dataChecks) {
            const value = this.inputElement.value;
            const field = fields ? fields : this.fields;
            const customData = (!isNullOrUndefined(this.mainData) && this.mainData.length > 0) ?
                this.mainData[0] : this.mainData;
            if (typeof (customData) !== 'string' && typeof (customData) !== 'number' && typeof (customData) !== 'boolean') {
                const dataItem = {};
                setValue(field.text, value, dataItem);
                if (typeof getValue((this.fields.value ? this.fields.value : 'value'), customData)
                    === 'number') {
                    setValue(field.value, Math.random(), dataItem);
                }
                else {
                    setValue(field.value, value, dataItem);
                }
                const tempData = JSON.parse(JSON.stringify(this.listData));
                tempData.splice(0, 0, dataItem);
                this.resetList(tempData, field, query);
            }
            else {
                const tempData = JSON.parse(JSON.stringify(this.listData));
                tempData.splice(0, 0, this.inputElement.value);
                tempData[0] = (typeof customData === 'number' && !isNaN(parseFloat(tempData[0]))) ?
                    parseFloat(tempData[0]) : tempData[0];
                tempData[0] = (typeof customData === 'boolean') ?
                    (tempData[0] === 'true' ? true : (tempData[0] === 'false' ? false : tempData[0])) : tempData[0];
                this.resetList(tempData, field);
            }
        }
        if (this.value && this.value.length) {
            this.refreshSelection();
        }
    }
    getNgDirective() {
        return 'EJS-MULTISELECT';
    }
    wrapperClick(e) {
        this.setDynValue = false;
        if (!this.enabled) {
            return;
        }
        if (e.target === this.overAllClear) {
            e.preventDefault();
            return;
        }
        if (!this.inputFocus) {
            this.inputElement.focus();
        }
        if (!this.readonly) {
            if (e.target && e.target.classList.toString().indexOf(CHIP_CLOSE$1) !== -1) {
                if (this.isPopupOpen()) {
                    this.refreshPopup();
                }
                return;
            }
            if (!this.isPopupOpen() &&
                (this.openOnClick || (this.showDropDownIcon && e.target && e.target.className === dropdownIcon))) {
                this.showPopup(e);
            }
            else {
                this.hidePopup(e);
                if (this.mode === 'CheckBox') {
                    this.showOverAllClear();
                    this.inputFocus = true;
                    if (!this.overAllWrapper.classList.contains(FOCUS)) {
                        this.overAllWrapper.classList.add(FOCUS);
                    }
                }
            }
        }
        if (!(this.targetElement() && this.targetElement() !== '')) {
            e.preventDefault();
        }
    }
    enable(state) {
        if (state) {
            this.overAllWrapper.classList.remove(DISABLED$1);
            this.inputElement.removeAttribute('disabled');
            attributes(this.inputElement, { 'aria-disabled': 'false' });
            this.ensureAriaDisabled('false');
        }
        else {
            this.overAllWrapper.classList.add(DISABLED$1);
            this.inputElement.setAttribute('disabled', 'true');
            attributes(this.inputElement, { 'aria-disabled': 'true' });
            this.ensureAriaDisabled('true');
        }
        if (this.enabled !== state) {
            this.enabled = state;
        }
        this.hidePopup();
    }
    onBlurHandler(eve, isDocClickFromCheck) {
        let target;
        if (!isNullOrUndefined(eve)) {
            target = eve.relatedTarget;
        }
        if (this.popupObj && document.body.contains(this.popupObj.element) && this.popupObj.element.contains(target)) {
            if (this.mode !== 'CheckBox') {
                this.inputElement.focus();
            }
            else if ((this.floatLabelType === 'Auto' &&
                ((this.overAllWrapper.classList.contains('e-outline')) || (this.overAllWrapper.classList.contains('e-filled'))))) {
                addClass([this.overAllWrapper], 'e-valid-input');
            }
            return;
        }
        if (this.floatLabelType === 'Auto' && (this.overAllWrapper.classList.contains('e-outline')) && this.mode === 'CheckBox' &&
            ((isNullOrUndefined(this.value)) || this.value.length === 0)) {
            removeClass([this.overAllWrapper], 'e-valid-input');
        }
        if (this.mode === 'CheckBox' && Browser.isIE && !isNullOrUndefined(eve) && !isDocClickFromCheck) {
            this.inputFocus = false;
            this.overAllWrapper.classList.remove(FOCUS);
            return;
        }
        if (this.scrollFocusStatus) {
            if (!isNullOrUndefined(eve)) {
                eve.preventDefault();
            }
            this.inputElement.focus();
            this.scrollFocusStatus = false;
            return;
        }
        this.inputFocus = false;
        this.overAllWrapper.classList.remove(FOCUS);
        if (this.addTagOnBlur) {
            const dataChecks = this.getValueByText(this.inputElement.value, this.ignoreCase, this.ignoreAccent);
            const listLiElement = this.findListElement(this.list, 'li', 'data-value', dataChecks);
            const className = this.hideSelectedItem ? HIDE_LIST : dropDownBaseClasses.selected;
            const allowChipAddition = (listLiElement && !listLiElement.classList.contains(className)) ? true : false;
            if (allowChipAddition) {
                this.updateListSelection(listLiElement, eve);
                if (this.mode === 'Delimiter') {
                    this.updateDelimeter(this.delimiterChar);
                }
            }
        }
        this.updateDataList();
        if (this.resetMainList) {
            this.mainList = this.resetMainList;
            this.resetMainList = null;
        }
        this.refreshListItems(null);
        if (this.mode !== 'Box' && this.mode !== 'CheckBox') {
            this.updateDelimView();
        }
        if (this.changeOnBlur) {
            this.updateValueState(eve, this.value, this.tempValues);
            this.dispatchEvent(this.hiddenElement, 'change');
        }
        this.overAllClear.style.display = 'none';
        if (this.isPopupOpen()) {
            this.hidePopup(eve);
        }
        this.makeTextBoxEmpty();
        this.trigger('blur');
        this.focused = true;
        if (Browser.isDevice && this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
            this.removeChipFocus();
        }
        this.removeChipSelection();
        this.refreshInputHight();
        floatLabelBlur(this.overAllWrapper, this.componentWrapper, this.value, this.floatLabelType, this.placeholder);
        this.refreshPlaceHolder();
        if ((this.allowFiltering || (this.enableSelectionOrder === true && this.mode === 'CheckBox'))
            && !isNullOrUndefined(this.mainList)) {
            this.ulElement = this.mainList;
        }
        this.checkPlaceholderSize();
        Input.createSpanElement(this.overAllWrapper, this.createElement);
        this.calculateWidth();
        if (!isNullOrUndefined(this.overAllWrapper) && !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] && this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
            this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
        }
    }
    calculateWidth() {
        let elementWidth;
        if (this.overAllWrapper) {
            if (!this.showDropDownIcon || this.overAllWrapper.querySelector('.' + 'e-label-top')) {
                elementWidth = this.overAllWrapper.clientWidth - 2 * (parseInt(getComputedStyle(this.inputElement).paddingRight));
            }
            else {
                var downIconWidth = this.dropIcon.offsetWidth +
                    parseInt(getComputedStyle(this.dropIcon).marginRight);
                elementWidth = this.overAllWrapper.clientWidth - (downIconWidth + 2 * (parseInt(getComputedStyle(this.inputElement).paddingRight)));
            }
            if (this.floatLabelType === 'Auto') {
                Input.calculateWidth(elementWidth, this.overAllWrapper, this.getModuleName());
            }
        }
    }
    checkPlaceholderSize() {
        if (this.showDropDownIcon) {
            const downIconWidth = this.dropIcon.offsetWidth +
                parseInt(window.getComputedStyle(this.dropIcon).marginRight, 10);
            this.setPlaceholderSize(downIconWidth);
        }
        else {
            if (!isNullOrUndefined(this.dropIcon)) {
                this.setPlaceholderSize(this.showDropDownIcon ? this.dropIcon.offsetWidth : 0);
            }
        }
    }
    setPlaceholderSize(downIconWidth) {
        if (isNullOrUndefined(this.value) || this.value.length === 0) {
            if (this.dropIcon.offsetWidth !== 0) {
                this.searchWrapper.style.width = ('calc(100% - ' + (downIconWidth + 10)) + 'px';
            }
            else {
                addClass([this.searchWrapper], CUSTOM_WIDTH);
            }
        }
        else if (!isNullOrUndefined(this.value)) {
            this.searchWrapper.removeAttribute('style');
            removeClass([this.searchWrapper], CUSTOM_WIDTH);
        }
    }
    refreshInputHight() {
        if (!isNullOrUndefined(this.searchWrapper)) {
            if ((!this.value || !this.value.length) && (isNullOrUndefined(this.text) || this.text === '')) {
                this.searchWrapper.classList.remove(ZERO_SIZE);
            }
            else {
                this.searchWrapper.classList.add(ZERO_SIZE);
            }
        }
    }
    validateValues(newValue, oldValue) {
        return JSON.stringify(newValue.slice().sort()) !== JSON.stringify(oldValue.slice().sort());
    }
    updateValueState(event, newVal, oldVal) {
        const newValue = newVal ? newVal : [];
        const oldValue = oldVal ? oldVal : [];
        if (this.initStatus && this.validateValues(newValue, oldValue)) {
            const eventArgs = {
                e: event,
                oldValue: oldVal,
                value: newVal,
                isInteracted: event ? true : false,
                element: this.element,
                event: event
            };
            if (this.isAngular && this.preventChange) {
                this.preventChange = false;
            }
            else {
                this.trigger('change', eventArgs);
            }
            this.updateTempValue();
            if (!this.changeOnBlur) {
                this.dispatchEvent(this.hiddenElement, 'change');
            }
        }
    }
    updateTempValue() {
        if (!this.value) {
            this.tempValues = this.value;
        }
        else {
            this.tempValues = this.value.slice();
        }
    }
    updateAriaActiveDescendant() {
        if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
            attributes(this.inputElement, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
        }
    }
    getPagingCount() {
        const height = this.list.classList.contains(dropDownBaseClasses.noData) ? null :
            getComputedStyle(this.getItems()[0], null).getPropertyValue('height');
        return Math.round(this.list.offsetHeight / parseInt(height, 10));
    }
    pageUpSelection(steps) {
        const collection = this.list.querySelectorAll('li.'
            + dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        const previousItem = steps >= 0 ? collection[steps + 1] : collection[0];
        this.addListFocus(previousItem);
        this.scrollBottom(previousItem, this.getIndexByValue(previousItem.getAttribute('data-value')));
    }
    pageDownSelection(steps) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const list = this.getItems();
        const collection = this.list.querySelectorAll('li.'
            + dropDownBaseClasses.li + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        const previousItem = steps <= collection.length ? collection[steps - 1] : collection[collection.length - 1];
        this.addListFocus(previousItem);
        this.scrollBottom(previousItem, this.getIndexByValue(previousItem.getAttribute('data-value')));
    }
    getItems() {
        if (!this.list) {
            super.render();
        }
        return this.ulElement && this.ulElement.querySelectorAll('.' + dropDownBaseClasses.li).length > 0 ?
            this.ulElement.querySelectorAll('.' + dropDownBaseClasses.li
                + ':not(.' + HIDE_LIST + ')') : [];
    }
    focusInHandler(e) {
        if (this.enabled) {
            this.showOverAllClear();
            this.inputFocus = true;
            if (this.value && this.value.length) {
                if (this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
                    this.chipCollectionWrapper.style.display = '';
                }
                else {
                    this.showDelimWrapper();
                }
                if (this.mode !== 'CheckBox') {
                    this.viewWrapper.style.display = 'none';
                }
            }
            if (this.mode !== 'CheckBox') {
                this.searchWrapper.classList.remove(ZERO_SIZE);
            }
            this.checkPlaceholderSize();
            if (this.focused) {
                const args = { isInteracted: e ? true : false, event: e };
                this.trigger('focus', args);
                this.focused = false;
            }
            if (!this.overAllWrapper.classList.contains(FOCUS)) {
                this.overAllWrapper.classList.add(FOCUS);
            }
            floatLabelFocus(this.overAllWrapper, this.componentWrapper);
            if (this.isPopupOpen()) {
                this.refreshPopup();
            }
            setTimeout(() => {
                this.calculateWidth();
            }, 150);
            return true;
        }
        else {
            return false;
        }
    }
    showDelimWrapper() {
        if (this.mode === 'CheckBox') {
            this.viewWrapper.style.display = '';
        }
        else {
            this.delimiterWrapper.style.display = '';
        }
        this.componentWrapper.classList.add(DELIMITER_VIEW_WRAPPER);
    }
    hideDelimWrapper() {
        this.delimiterWrapper.style.display = 'none';
        this.componentWrapper.classList.remove(DELIMITER_VIEW_WRAPPER);
    }
    expandTextbox() {
        let size = 5;
        if (this.placeholder) {
            size = size > this.inputElement.placeholder.length ? size : this.inputElement.placeholder.length;
        }
        if (this.inputElement.value.length > size) {
            this.inputElement.size = this.inputElement.value.length;
        }
        else {
            this.inputElement.size = size;
        }
    }
    isPopupOpen() {
        return ((this.popupWrapper !== null) && (this.popupWrapper.parentElement !== null));
    }
    refreshPopup() {
        if (this.popupObj && this.mobFilter) {
            this.popupObj.setProperties({ width: this.calcPopupWidth() });
            this.popupObj.refreshPosition(this.overAllWrapper);
            this.popupObj.resolveCollision();
        }
    }
    checkTextLength() {
        return this.targetElement().length < 1;
    }
    popupKeyActions(e) {
        switch (e.keyCode) {
            case 38:
                this.hidePopup(e);
                if (this.mode === 'CheckBox') {
                    this.inputElement.focus();
                }
                e.preventDefault();
                break;
            case 40:
                if (!this.isPopupOpen()) {
                    this.showPopup(e);
                    e.preventDefault();
                }
                break;
        }
    }
    updateAriaAttribute() {
        const focusedItem = this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (!isNullOrUndefined(focusedItem)) {
            this.inputElement.setAttribute('aria-activedescendant', focusedItem.id);
            if (this.allowFiltering) {
                var filterInput = this.popupWrapper.querySelector('.' + FILTERINPUT);
                filterInput && filterInput.setAttribute('aria-activedescendant', focusedItem.id);
            }
            else if (this.mode == "CheckBox") {
                this.overAllWrapper.setAttribute('aria-activedescendant', focusedItem.id);
            }
        }
    }
    homeNavigation(isHome) {
        this.removeFocus();
        const scrollEle = this.ulElement.querySelectorAll('li.' + dropDownBaseClasses.li
            + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        if (scrollEle.length > 0) {
            const element = scrollEle[(isHome) ? 0 : (scrollEle.length - 1)];
            element.classList.add(dropDownBaseClasses.focus);
            this.scrollBottom(element);
            this.updateAriaActiveDescendant();
        }
    }
    onKeyDown(e) {
        if (this.readonly || !this.enabled && this.mode !== 'CheckBox') {
            return;
        }
        this.keyCode = e.keyCode;
        this.keyDownStatus = true;
        if (e.keyCode > 111 && e.keyCode < 124) {
            return;
        }
        if (e.altKey) {
            this.popupKeyActions(e);
            return;
        }
        else if (this.isPopupOpen()) {
            const focusedItem = this.list.querySelector('.' + dropDownBaseClasses.focus);
            let activeIndex;
            switch (e.keyCode) {
                case 36:
                case 35:
                    this.homeNavigation((e.keyCode === 36) ? true : false);
                    break;
                case 33:
                    e.preventDefault();
                    if (focusedItem) {
                        this.getIndexByValue(focusedItem.getAttribute('data-value'));
                        this.pageUpSelection(activeIndex - this.getPagingCount());
                        this.updateAriaAttribute();
                    }
                    return;
                case 34:
                    e.preventDefault();
                    if (focusedItem) {
                        this.getIndexByValue(focusedItem.getAttribute('data-value'));
                        this.pageDownSelection(activeIndex + this.getPagingCount());
                        this.updateAriaAttribute();
                    }
                    return;
                case 38:
                    this.arrowUp(e);
                    break;
                case 40:
                    this.arrowDown(e);
                    break;
                case 27:
                    e.preventDefault();
                    this.hidePopup(e);
                    if (this.mode === 'CheckBox') {
                        this.inputElement.focus();
                    }
                    return;
                case 13:
                    e.preventDefault();
                    if (this.mode !== 'CheckBox') {
                        this.selectByKey(e);
                    }
                    this.checkPlaceholderSize();
                    return;
                case 32:
                    this.spaceKeySelection(e);
                    return;
                case 9:
                    e.preventDefault();
                    this.hidePopup(e);
                    this.inputElement.focus();
                    this.overAllWrapper.classList.add(FOCUS);
            }
        }
        else {
            switch (e.keyCode) {
                case 13:
                case 9:
                case 16:
                case 17:
                case 20:
                    return;
                case 40:
                    if (this.openOnClick) {
                        this.showPopup();
                    }
                    break;
                case 27:
                    e.preventDefault();
                    this.escapeAction();
                    return;
            }
        }
        if (this.checkTextLength()) {
            this.keyNavigation(e);
        }
        if (this.mode === 'CheckBox' && this.enableSelectionOrder) {
            if (this.allowFiltering) {
                this.previousFilterText = this.targetElement();
            }
            this.checkBackCommand(e);
        }
        this.expandTextbox();
        if (!(this.mode === 'CheckBox' && this.showSelectAll)) {
            this.refreshPopup();
        }
    }
    arrowDown(e) {
        e.preventDefault();
        this.moveByList(1);
        this.keyAction = true;
        if (document.activeElement.classList.contains(FILTERINPUT)
            || (this.mode === 'CheckBox' && !this.allowFiltering && document.activeElement !== this.list)) {
            EventHandler.add(this.list, 'keydown', this.onKeyDown, this);
        }
        this.updateAriaAttribute();
    }
    arrowUp(e) {
        e.preventDefault();
        this.keyAction = true;
        let list = this.list.querySelectorAll('li.'
            + dropDownBaseClasses.li
            + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
            list = this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li + ',li.' + dropDownBaseClasses.group
                + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
        }
        const focuseElem = this.list.querySelector('li.' + dropDownBaseClasses.focus);
        this.focusFirstListItem = !isNullOrUndefined(this.liCollections[0]) ? this.liCollections[0].classList.contains('e-item-focus') : false;
        const index = Array.prototype.slice.call(list).indexOf(focuseElem);
        if (index <= 0 && (this.mode === 'CheckBox' && this.allowFiltering)) {
            this.keyAction = false;
            this.notify('inputFocus', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'focus' });
        }
        this.moveByList(-1);
        this.updateAriaAttribute();
    }
    spaceKeySelection(e) {
        if (this.mode === 'CheckBox') {
            if (!document.activeElement.classList.contains(FILTERINPUT)) {
                e.preventDefault();
                this.keyAction = true;
            }
            this.selectByKey(e);
        }
        this.checkPlaceholderSize();
    }
    checkBackCommand(e) {
        if (e.keyCode === 8 && this.allowFiltering ? this.targetElement() !== this.previousFilterText : this.targetElement() === '') {
            this.backCommand = false;
        }
        else {
            this.backCommand = true;
        }
    }
    keyNavigation(e) {
        if ((this.mode !== 'Delimiter' && this.mode !== 'CheckBox') && this.value && this.value.length) {
            switch (e.keyCode) {
                case 37: //left arrow
                    e.preventDefault();
                    this.moveBy(-1, e);
                    break;
                case 39: //right arrow
                    e.preventDefault();
                    this.moveBy(1, e);
                    break;
                case 8:
                    this.removelastSelection(e);
                    break;
                case 46: //del
                    this.removeSelectedChip(e);
                    break;
            }
        }
        else if (e.keyCode === 8 && this.mode === 'Delimiter') {
            if (this.value && this.value.length) {
                e.preventDefault();
                const temp = this.value[this.value.length - 1];
                this.removeValue(temp, e);
                this.updateDelimeter(this.delimiterChar, e);
                this.focusAtLastListItem(temp);
            }
        }
    }
    selectByKey(e) {
        this.removeChipSelection();
        this.selectListByKey(e);
        if (this.hideSelectedItem) {
            this.focusAtFirstListItem();
        }
    }
    escapeAction() {
        const temp = this.tempValues ? this.tempValues.slice() : [];
        if (this.value && this.validateValues(this.value, temp)) {
            if (this.mode !== 'CheckBox') {
                this.value = temp;
                this.initialValueUpdate();
            }
            if (this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
                this.chipCollectionWrapper.style.display = '';
            }
            else {
                this.showDelimWrapper();
            }
            this.refreshPlaceHolder();
            if (this.value.length) {
                this.showOverAllClear();
            }
            else {
                this.hideOverAllClear();
            }
        }
        this.makeTextBoxEmpty();
    }
    scrollBottom(selectedLI, activeIndex) {
        const currentOffset = this.list.offsetHeight;
        const nextBottom = selectedLI.offsetTop + selectedLI.offsetHeight - this.list.scrollTop;
        const nextOffset = this.list.scrollTop + nextBottom - currentOffset;
        let boxRange = (selectedLI.offsetTop + selectedLI.offsetHeight - this.list.scrollTop);
        boxRange = this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
            boxRange - this.fixedHeaderElement.offsetHeight : boxRange;
        if (activeIndex === 0) {
            this.list.scrollTop = 0;
        }
        else if (nextBottom > currentOffset) {
            this.list.scrollTop = nextOffset;
        }
        else if (!(boxRange > 0 && this.list.offsetHeight > boxRange)) {
            this.list.scrollTop = nextOffset;
        }
    }
    scrollTop(selectedLI, activeIndex) {
        let nextOffset = selectedLI.offsetTop - this.list.scrollTop;
        nextOffset = this.fields.groupBy && !isUndefined(this.fixedHeaderElement) ?
            nextOffset - this.fixedHeaderElement.offsetHeight : nextOffset;
        const boxRange = (selectedLI.offsetTop + selectedLI.offsetHeight - this.list.scrollTop);
        if (activeIndex === 0) {
            this.list.scrollTop = 0;
        }
        else if (nextOffset < 0) {
            this.list.scrollTop = this.list.scrollTop + nextOffset;
        }
        else if (!(boxRange > 0 && this.list.offsetHeight > boxRange)) {
            this.list.scrollTop = selectedLI.offsetTop - (this.fields.groupBy && !isUndefined(this.fixedHeaderElement) ?
                this.fixedHeaderElement.offsetHeight : 0);
        }
    }
    selectListByKey(e) {
        const li = this.list.querySelector('li.' + dropDownBaseClasses.focus);
        let limit = this.value && this.value.length ? this.value.length : 0;
        let target;
        if (li !== null) {
            e.preventDefault();
            if (li.classList.contains('e-active')) {
                limit = limit - 1;
            }
            if (this.isValidLI(li) && limit < this.maximumSelectionLength) {
                this.updateListSelection(li, e);
                this.addListFocus(li);
                if (this.mode === 'CheckBox') {
                    this.updateDelimView();
                    this.updateDelimeter(this.delimiterChar, e);
                    this.refreshInputHight();
                    this.checkPlaceholderSize();
                    if (this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                        target = li.firstElementChild.lastElementChild;
                        this.findGroupStart(target);
                        this.deselectHeader();
                    }
                }
                else {
                    this.updateDelimeter(this.delimiterChar, e);
                }
                this.makeTextBoxEmpty();
                if (this.mode !== 'CheckBox') {
                    this.refreshListItems(li.textContent);
                }
                if (!this.changeOnBlur) {
                    this.updateValueState(e, this.value, this.tempValues);
                }
                this.refreshPopup();
            }
            else {
                if (!this.isValidLI(li) && limit < this.maximumSelectionLength) {
                    target = li.firstElementChild.lastElementChild;
                    if (target.classList.contains('e-check')) {
                        this.selectAllItem(false, e, li);
                    }
                    else {
                        this.selectAllItem(true, e, li);
                    }
                }
            }
            this.refreshSelection();
            if (this.closePopupOnSelect) {
                this.hidePopup(e);
            }
        }
        const selectAllParent = document.getElementsByClassName('e-selectall-parent')[0];
        if (selectAllParent && !selectAllParent.classList.contains('e-item-focus')) {
            e.preventDefault();
        }
        if (selectAllParent && selectAllParent.classList.contains('e-item-focus')) {
            const selectAllCheckBox = selectAllParent.childNodes[0];
            if (!selectAllCheckBox.classList.contains('e-check')) {
                selectAllCheckBox.classList.add('e-check');
                const args = {
                    module: 'CheckBoxSelection',
                    enable: this.mode === 'CheckBox',
                    value: 'check',
                    name: 'checkSelectAll'
                };
                this.notify('checkSelectAll', args);
                this.selectAllItem(true, e, li);
            }
            else {
                selectAllCheckBox.classList.remove('e-check');
                const args = {
                    module: 'CheckBoxSelection',
                    enable: this.mode === 'CheckBox',
                    value: 'check',
                    name: 'checkSelectAll'
                };
                this.notify('checkSelectAll', args);
                this.selectAllItem(false, e, li);
            }
        }
        this.refreshPlaceHolder();
    }
    refreshListItems(data) {
        if ((this.allowFiltering || (this.mode === 'CheckBox' && this.enableSelectionOrder === true)
            || this.allowCustomValue) && this.mainList && this.listData) {
            const list = this.mainList.cloneNode ? this.mainList.cloneNode(true) : this.mainList;
            this.onActionComplete(list, this.mainData);
            this.focusAtLastListItem(data);
            if (this.value && this.value.length) {
                this.refreshSelection();
            }
        }
        else if (!isNullOrUndefined(this.fields.groupBy) && this.value && this.value.length) {
            this.refreshSelection();
        }
    }
    removeSelectedChip(e) {
        const selectedElem = this.chipCollectionWrapper.querySelector('span.' + CHIP_SELECTED);
        let temp;
        if (selectedElem !== null) {
            if (!isNullOrUndefined(this.value)) {
                this.tempValues = this.value.slice();
            }
            temp = selectedElem.nextElementSibling;
            if (temp !== null) {
                this.removeChipSelection();
                this.addChipSelection(temp, e);
            }
            this.removeValue(selectedElem.getAttribute('data-value'), e);
            this.makeTextBoxEmpty();
        }
        if (this.closePopupOnSelect) {
            this.hidePopup(e);
        }
        this.checkPlaceholderSize();
    }
    moveByTop(state) {
        const elements = this.list.querySelectorAll('li.' + dropDownBaseClasses.li);
        let index;
        if (elements.length > 1) {
            this.removeFocus();
            index = state ? 0 : (elements.length - 1);
            this.addListFocus(elements[index]);
            this.scrollBottom(elements[index], index);
        }
        this.updateAriaAttribute();
    }
    moveByList(position) {
        if (this.list) {
            let elements = this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li
                + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
            if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
                elements = this.list.querySelectorAll('li.'
                    + dropDownBaseClasses.li + ',li.' + dropDownBaseClasses.group
                    + ':not(.' + HIDE_LIST + ')' + ':not(.e-reorder-hide)');
            }
            const selectedElem = this.list.querySelector('li.' + dropDownBaseClasses.focus);
            let temp = -1;
            const selectAllParent = document.getElementsByClassName('e-selectall-parent')[0];
            if (this.mode === 'CheckBox' && this.showSelectAll && position == 1 && !isNullOrUndefined(selectAllParent) && !selectAllParent.classList.contains('e-item-focus') && this.list.getElementsByClassName('e-item-focus').length == 0 && this.liCollections.length > 1) {
                selectAllParent.classList.add('e-item-focus');
            }
            else if (elements.length) {
                if (this.mode === 'CheckBox' && this.showSelectAll && !isNullOrUndefined(selectAllParent)) {
                    selectAllParent.classList.remove('e-item-focus');
                    if (this.showSelectAll && position == -1 && !isNullOrUndefined(selectAllParent) && this.liCollections.length > 1 && (this.focusFirstListItem || this.list.getElementsByClassName('e-item-focus').length == 0)) {
                        selectAllParent.classList.add('e-item-focus');
                    }
                }
                for (let index = 0; index < elements.length; index++) {
                    if (elements[index] === selectedElem) {
                        temp = index;
                        break;
                    }
                }
                if (position > 0) {
                    if (temp < (elements.length - 1)) {
                        this.removeFocus();
                        this.addListFocus(elements[++temp]);
                        this.updateCheck(elements[temp]);
                        this.scrollBottom(elements[temp], temp);
                    }
                }
                else {
                    if (temp > 0) {
                        this.removeFocus();
                        this.addListFocus(elements[--temp]);
                        this.updateCheck(elements[temp]);
                        this.scrollTop(elements[temp], temp);
                    }
                }
            }
        }
    }
    updateCheck(element) {
        if (this.mode === 'CheckBox' && this.enableGroupCheckBox &&
            !isNullOrUndefined(this.fields.groupBy)) {
            const checkElement = element.firstElementChild.lastElementChild;
            if (checkElement.classList.contains('e-check')) {
                element.classList.add('e-active');
            }
            else {
                element.classList.remove('e-active');
            }
        }
    }
    moveBy(position, e) {
        let temp;
        const elements = this.chipCollectionWrapper.querySelectorAll('span.' + CHIP$1);
        const selectedElem = this.chipCollectionWrapper.querySelector('span.' + CHIP_SELECTED);
        if (selectedElem === null) {
            if (position < 0) {
                this.addChipSelection(elements[elements.length - 1], e);
            }
        }
        else {
            if (position < 0) {
                temp = selectedElem.previousElementSibling;
                if (temp !== null) {
                    this.removeChipSelection();
                    this.addChipSelection(temp, e);
                }
            }
            else {
                temp = selectedElem.nextElementSibling;
                this.removeChipSelection();
                if (temp !== null) {
                    this.addChipSelection(temp, e);
                }
            }
        }
    }
    chipClick(e) {
        if (this.enabled) {
            const elem = closest(e.target, '.' + CHIP$1);
            this.removeChipSelection();
            this.addChipSelection(elem, e);
        }
    }
    removeChipSelection() {
        if (this.chipCollectionWrapper) {
            this.removeChipFocus();
        }
    }
    addChipSelection(element, e) {
        addClass([element], CHIP_SELECTED);
        this.trigger('chipSelection', e);
    }
    onChipRemove(e) {
        if (e.which === 3 || e.button === 2) {
            return;
        }
        if (this.enabled && !this.readonly) {
            const element = e.target.parentElement;
            const customVal = element.getAttribute('data-value');
            let value = this.getFormattedValue(customVal);
            if (this.allowCustomValue && ((customVal !== 'false' && value === false) ||
                (!isNullOrUndefined(value) && value.toString() === 'NaN'))) {
                value = customVal;
            }
            if (this.isPopupOpen() && this.mode !== 'CheckBox') {
                this.hidePopup(e);
            }
            if (!this.inputFocus) {
                this.inputElement.focus();
            }
            this.removeValue(value, e);
            if (isNullOrUndefined(this.findListElement(this.list, 'li', 'data-value', value)) && this.mainList && this.listData) {
                const list = this.mainList.cloneNode ? this.mainList.cloneNode(true) : this.mainList;
                this.onActionComplete(list, this.mainData);
            }
            this.updateDelimeter(this.delimiterChar, e);
            if (this.placeholder && this.floatLabelType === 'Never') {
                this.makeTextBoxEmpty();
                this.checkPlaceholderSize();
            }
            else {
                this.inputElement.value = '';
            }
            e.preventDefault();
        }
    }
    makeTextBoxEmpty() {
        this.inputElement.value = '';
        this.refreshPlaceHolder();
    }
    refreshPlaceHolder() {
        if (this.placeholder && this.floatLabelType === 'Never') {
            if ((this.value && this.value.length) || (!isNullOrUndefined(this.text) && this.text !== '')) {
                this.inputElement.placeholder = '';
            }
            else {
                this.inputElement.placeholder = encodePlaceholder(this.placeholder);
            }
        }
        else {
            this.setFloatLabelType();
        }
        this.expandTextbox();
    }
    removeAllItems(value, eve, isClearAll, element, mainElement) {
        let index = this.value.indexOf(value);
        const removeVal = this.value.slice(0);
        removeVal.splice(index, 1);
        this.setProperties({ value: [].concat([], removeVal) }, true);
        element.setAttribute('aria-selected', 'false');
        const className = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        removeClass([element], className);
        this.notify('activeList', {
            module: 'CheckBoxSelection',
            enable: this.mode === 'CheckBox', li: element,
            e: this, index: index
        });
        this.invokeCheckboxSelection(element, eve, isClearAll);
        this.updateMainList(true, value, mainElement);
        this.updateChipStatus();
    }
    invokeCheckboxSelection(element, eve, isClearAll) {
        this.notify('updatelist', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', li: element, e: eve });
        this.updateAriaActiveDescendant();
        if ((this.value && this.value.length !== this.mainData.length)
            && (this.mode === 'CheckBox' && this.showSelectAll && !(this.isSelectAll || isClearAll))) {
            this.notify('checkSelectAll', {
                module: 'CheckBoxSelection',
                enable: this.mode === 'CheckBox',
                value: 'uncheck'
            });
        }
    }
    removeValue(value, eve, length, isClearAll) {
        let index = this.value.indexOf(this.getFormattedValue(value));
        if (index === -1 && this.allowCustomValue && !isNullOrUndefined(value)) {
            index = this.value.indexOf(value.toString());
        }
        const targetEle = eve && eve.target;
        isClearAll = (isClearAll || targetEle && targetEle.classList.contains('e-close-hooker')) ? true : null;
        const className = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        if (index !== -1) {
            const element = this.findListElement(this.list, 'li', 'data-value', value);
            const val = this.getDataByValue(value);
            const eventArgs = {
                e: eve,
                item: element,
                itemData: val,
                isInteracted: eve ? true : false,
                cancel: false
            };
            this.trigger('removing', eventArgs, (eventArgs) => {
                if (eventArgs.cancel) {
                    this.removeIndex++;
                }
                else {
                    const removeVal = this.value.slice(0);
                    removeVal.splice(index, 1);
                    this.setProperties({ value: [].concat([], removeVal) }, true);
                    if (element !== null) {
                        const hideElement = this.findListElement(this.mainList, 'li', 'data-value', value);
                        element.setAttribute('aria-selected', 'false');
                        removeClass([element], className);
                        if (hideElement) {
                            hideElement.setAttribute('aria-selected', 'false');
                            removeClass([element, hideElement], className);
                        }
                        this.notify('activeList', {
                            module: 'CheckBoxSelection',
                            enable: this.mode === 'CheckBox', li: element,
                            e: this, index: index
                        });
                        this.invokeCheckboxSelection(element, eve, isClearAll);
                    }
                    if (this.hideSelectedItem && this.fields.groupBy && element) {
                        this.hideGroupItem(value);
                    }
                    if (this.hideSelectedItem && this.fixedHeaderElement && this.fields.groupBy && this.mode !== 'CheckBox' &&
                        this.isPopupOpen()) {
                        super.scrollStop();
                    }
                    this.updateMainList(true, value);
                    this.removeChip(value);
                    this.updateChipStatus();
                    const limit = this.value && this.value.length ? this.value.length : 0;
                    if (limit < this.maximumSelectionLength) {
                        const collection = this.list.querySelectorAll('li.'
                            + dropDownBaseClasses.li + ':not(.e-active)');
                        removeClass(collection, 'e-disable');
                    }
                    this.trigger('removed', eventArgs);
                    const targetEle = eve && eve.currentTarget;
                    const isSelectAll = (targetEle && targetEle.classList.contains('e-selectall-parent')) ? true : null;
                    if (!this.changeOnBlur && !isClearAll && (eve && length && !isSelectAll)) {
                        this.updateValueState(eve, this.value, this.tempValues);
                    }
                    if (length) {
                        this.selectAllEventData.push(val);
                        this.selectAllEventEle.push(element);
                    }
                    if (length === 1) {
                        if (!this.changeOnBlur) {
                            this.updateValueState(eve, this.value, this.tempValues);
                        }
                        const args = {
                            event: eve,
                            items: this.selectAllEventEle,
                            itemData: this.selectAllEventData,
                            isInteracted: eve ? true : false,
                            isChecked: false
                        };
                        this.trigger('selectedAll', args);
                        this.selectAllEventData = [];
                        this.selectAllEventEle = [];
                    }
                    if (isClearAll && (length === 1 || length === null)) {
                        this.clearAllCallback(eve, isClearAll);
                    }
                }
            });
        }
    }
    updateMainList(state, value, mainElement) {
        if (this.allowFiltering || this.mode === 'CheckBox') {
            const element2 = mainElement ? mainElement :
                this.findListElement(this.mainList, 'li', 'data-value', value);
            if (element2) {
                if (state) {
                    element2.setAttribute('aria-selected', 'false');
                    removeClass([element2], this.hideSelectedItem ?
                        HIDE_LIST :
                        dropDownBaseClasses.selected);
                    if (this.mode === 'CheckBox') {
                        removeClass([element2.firstElementChild.lastElementChild], 'e-check');
                    }
                }
                else {
                    element2.setAttribute('aria-selected', 'true');
                    addClass([element2], this.hideSelectedItem ?
                        HIDE_LIST :
                        dropDownBaseClasses.selected);
                    if (this.mode === 'CheckBox') {
                        addClass([element2.firstElementChild.lastElementChild], 'e-check');
                    }
                }
            }
        }
    }
    removeChip(value) {
        if (this.chipCollectionWrapper) {
            const element = this.findListElement(this.chipCollectionWrapper, 'span', 'data-value', value);
            if (element) {
                remove(element);
            }
        }
    }
    setWidth(width) {
        if (!isNullOrUndefined(width)) {
            if (typeof width === 'number') {
                this.overAllWrapper.style.width = formatUnit(width);
            }
            else if (typeof width === 'string') {
                this.overAllWrapper.style.width = (width.match(/px|%|em/)) ? (width) : (formatUnit(width));
            }
        }
    }
    updateChipStatus() {
        if (this.value && this.value.length) {
            if (!isNullOrUndefined(this.chipCollectionWrapper)) {
                (this.chipCollectionWrapper.style.display = '');
            }
            if (this.mode === 'Delimiter' || this.mode === 'CheckBox') {
                this.showDelimWrapper();
            }
            this.showOverAllClear();
        }
        else {
            if (!isNullOrUndefined(this.chipCollectionWrapper)) {
                this.chipCollectionWrapper.style.display = 'none';
            }
            if (!isNullOrUndefined(this.delimiterWrapper)) {
                (this.delimiterWrapper.style.display = 'none');
            }
            this.hideOverAllClear();
        }
    }
    addValue(value, text, eve) {
        if (!this.value) {
            this.value = [];
        }
        if (this.value.indexOf(value) < 0) {
            this.setProperties({ value: [].concat([], this.value, [value]) }, true);
        }
        const element = this.findListElement(this.list, 'li', 'data-value', value);
        this.removeFocus();
        if (element) {
            this.addListFocus(element);
            this.addListSelection(element);
        }
        if (this.mode !== 'Delimiter' && this.mode !== 'CheckBox') {
            this.addChip(text, value, eve);
        }
        if (this.hideSelectedItem && this.fields.groupBy) {
            this.hideGroupItem(value);
        }
        this.updateChipStatus();
        this.checkMaxSelection();
    }
    checkMaxSelection() {
        const limit = this.value && this.value.length ? this.value.length : 0;
        if (limit === this.maximumSelectionLength) {
            const collection = this.list.querySelectorAll('li.'
                + dropDownBaseClasses.li + ':not(.e-active)');
            addClass(collection, 'e-disable');
        }
    }
    dispatchSelect(value, eve, element, isNotTrigger, length) {
        const list = this.listData;
        if (this.initStatus && !isNotTrigger) {
            const val = this.getDataByValue(value);
            const eventArgs = {
                e: eve,
                item: element,
                itemData: val,
                isInteracted: eve ? true : false,
                cancel: false
            };
            this.trigger('select', eventArgs, (eventArgs) => {
                if (!eventArgs.cancel) {
                    if (length) {
                        this.selectAllEventData.push(val);
                        this.selectAllEventEle.push(element);
                    }
                    if (length === 1) {
                        const args = {
                            event: eve,
                            items: this.selectAllEventEle,
                            itemData: this.selectAllEventData,
                            isInteracted: eve ? true : false,
                            isChecked: true
                        };
                        this.trigger('selectedAll', args);
                        this.selectAllEventData = [];
                    }
                    if (this.allowCustomValue && this.isServerRendered && this.listData !== list) {
                        this.listData = list;
                    }
                    this.updateListSelectEventCallback(value, element, eve);
                    if (this.hideSelectedItem && this.fixedHeaderElement && this.fields.groupBy && this.mode !== 'CheckBox') {
                        super.scrollStop();
                    }
                }
            });
        }
    }
    addChip(text, value, e) {
        if (this.chipCollectionWrapper) {
            this.getChip(text, value, e);
        }
    }
    removeChipFocus() {
        const elements = this.chipCollectionWrapper.querySelectorAll('span.' + CHIP$1 + '.' + CHIP_SELECTED);
        removeClass(elements, CHIP_SELECTED);
        if (Browser.isDevice) {
            const closeElements = this.chipCollectionWrapper.querySelectorAll('span.' + CHIP_CLOSE$1.split(' ')[0]);
            for (let index = 0; index < closeElements.length; index++) {
                closeElements[index].style.display = 'none';
            }
        }
    }
    onMobileChipInteraction(e) {
        const chipElem = closest(e.target, '.' + CHIP$1);
        const chipClose = chipElem.querySelector('span.' + CHIP_CLOSE$1.split(' ')[0]);
        if (this.enabled && !this.readonly) {
            if (!chipElem.classList.contains(CHIP_SELECTED)) {
                this.removeChipFocus();
                chipClose.style.display = '';
                chipElem.classList.add(CHIP_SELECTED);
            }
            this.refreshPopup();
            e.preventDefault();
        }
    }
    multiCompiler(multiselectTemplate) {
        let checkTemplate = false;
        if (typeof multiselectTemplate !== 'function' && multiselectTemplate) {
            try {
                checkTemplate = (selectAll(multiselectTemplate, document).length) ? true : false;
            }
            catch (exception) {
                checkTemplate = false;
            }
        }
        return checkTemplate;
    }
    getChip(data, value, e) {
        let itemData = { text: value, value: value };
        const chip = this.createElement('span', {
            className: CHIP$1,
            attrs: { 'data-value': value, 'title': data }
        });
        let compiledString;
        const chipContent = this.createElement('span', { className: CHIP_CONTENT$1 });
        const chipClose = this.createElement('span', { className: CHIP_CLOSE$1 });
        if (this.mainData) {
            itemData = this.getDataByValue(value);
        }
        if (this.valueTemplate && !isNullOrUndefined(itemData)) {
            const valuecheck = this.multiCompiler(this.valueTemplate);
            if (typeof this.valueTemplate !== 'function' && valuecheck) {
                compiledString = compile(select(this.valueTemplate, document).innerHTML.trim());
            }
            else {
                compiledString = compile(this.valueTemplate);
            }
            // eslint-disable-next-line
            let valueCompTemp = compiledString(itemData, this, 'valueTemplate', this.valueTemplateId, this.isStringTemplate, null, chipContent);
            if (valueCompTemp && valueCompTemp.length > 0) {
                append(valueCompTemp, chipContent);
            }
            this.renderReactTemplates();
        }
        else if (this.enableHtmlSanitizer) {
            chipContent.innerText = data;
        }
        else {
            chipContent.innerHTML = data;
        }
        chip.appendChild(chipContent);
        const eventArgs = {
            isInteracted: e ? true : false,
            itemData: itemData,
            e: e,
            setClass: (classes) => {
                addClass([chip], classes);
            },
            cancel: false
        };
        this.isPreventChange = this.isAngular && this.preventChange;
        this.trigger('tagging', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel) {
                if (Browser.isDevice) {
                    chip.classList.add(MOBILE_CHIP);
                    append([chipClose], chip);
                    chipClose.style.display = 'none';
                    EventHandler.add(chip, 'click', this.onMobileChipInteraction, this);
                }
                else {
                    EventHandler.add(chip, 'mousedown', this.chipClick, this);
                    if (this.showClearButton) {
                        chip.appendChild(chipClose);
                    }
                }
                EventHandler.add(chipClose, 'mousedown', this.onChipRemove, this);
                this.chipCollectionWrapper.appendChild(chip);
                if (!this.changeOnBlur && e) {
                    this.updateValueState(e, this.value, this.tempValues);
                }
            }
        });
    }
    calcPopupWidth() {
        let width = formatUnit(this.popupWidth);
        if (width.indexOf('%') > -1) {
            const inputWidth = (this.componentWrapper.offsetWidth) * parseFloat(width) / 100;
            width = inputWidth.toString() + 'px';
        }
        return width;
    }
    mouseIn() {
        if (this.enabled && !this.readonly) {
            this.showOverAllClear();
        }
    }
    mouseOut() {
        if (!this.inputFocus) {
            this.overAllClear.style.display = 'none';
        }
    }
    listOption(dataSource, fields) {
        const iconCss = isNullOrUndefined(fields.iconCss) ? false : true;
        const fieldProperty = isNullOrUndefined(fields.properties) ? fields :
            fields.properties;
        this.listCurrentOptions = (fields.text !== null || fields.value !== null) ? {
            fields: fieldProperty, showIcon: iconCss, ariaAttributes: { groupItemRole: 'presentation' }
        } : { fields: { value: 'text' } };
        extend(this.listCurrentOptions, this.listCurrentOptions, fields, true);
        if (this.mode === 'CheckBox') {
            this.notify('listoption', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', dataSource, fieldProperty });
        }
        return this.listCurrentOptions;
    }
    renderPopup() {
        if (!this.list) {
            super.render();
        }
        if (!this.popupObj) {
            if (!isNullOrUndefined(this.popupWrapper)) {
                document.body.appendChild(this.popupWrapper);
                const checkboxFilter = this.popupWrapper.querySelector('.' + FILTERPARENT);
                if (this.mode === 'CheckBox' && !this.allowFiltering && checkboxFilter && this.filterParent) {
                    checkboxFilter.remove();
                    this.filterParent = null;
                }
                let overAllHeight = parseInt(this.popupHeight, 10);
                this.popupWrapper.style.visibility = 'hidden';
                if (this.headerTemplate) {
                    this.setHeaderTemplate();
                    overAllHeight -= this.header.offsetHeight;
                }
                append([this.list], this.popupWrapper);
                if (this.footerTemplate) {
                    this.setFooterTemplate();
                    overAllHeight -= this.footer.offsetHeight;
                }
                if (this.mode === 'CheckBox' && this.showSelectAll) {
                    this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    overAllHeight -= this.selectAllHeight;
                }
                else if (this.mode === 'CheckBox' && !this.showSelectAll && (!this.headerTemplate && !this.footerTemplate)) {
                    this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    overAllHeight = parseInt(this.popupHeight, 10);
                }
                else if (this.mode === 'CheckBox' && !this.showSelectAll) {
                    this.notify('selectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    overAllHeight = parseInt(this.popupHeight, 10);
                    if (this.headerTemplate && this.header) {
                        overAllHeight -= this.header.offsetHeight;
                    }
                    if (this.footerTemplate && this.footer) {
                        overAllHeight -= this.footer.offsetHeight;
                    }
                }
                if (this.mode === 'CheckBox') {
                    const args = {
                        module: 'CheckBoxSelection',
                        enable: this.mode === 'CheckBox',
                        popupElement: this.popupWrapper
                    };
                    if (this.allowFiltering) {
                        this.notify('searchBox', args);
                        overAllHeight -= this.searchBoxHeight;
                    }
                    addClass([this.popupWrapper], 'e-checkbox');
                }
                if (this.popupHeight !== 'auto') {
                    this.list.style.maxHeight = formatUnit(overAllHeight);
                    this.popupWrapper.style.maxHeight = formatUnit(this.popupHeight);
                }
                else {
                    this.list.style.maxHeight = formatUnit(this.popupHeight);
                }
                this.popupObj = new Popup(this.popupWrapper, {
                    width: this.calcPopupWidth(), targetType: 'relative', position: { X: 'left', Y: 'bottom' },
                    relateTo: this.overAllWrapper, collision: { X: 'flip', Y: 'flip' }, offsetY: 1,
                    enableRtl: this.enableRtl, zIndex: this.zIndex,
                    close: () => {
                        if (this.popupObj.element.parentElement) {
                            this.popupObj.unwireScrollEvents();
                            // For restrict the page scrolling in safari browser
                            const checkboxFilterInput = this.popupWrapper.querySelector('.' + FILTERINPUT);
                            if (this.mode === 'CheckBox' && checkboxFilterInput && document.activeElement === checkboxFilterInput) {
                                checkboxFilterInput.blur();
                            }
                            detach(this.popupObj.element);
                        }
                    },
                    open: () => {
                        this.popupObj.resolveCollision();
                        if (!this.isFirstClick) {
                            const ulElement = this.list.querySelector('ul');
                            if (ulElement) {
                                if (!(this.mode !== 'CheckBox' && (this.allowFiltering || this.allowCustomValue) &&
                                    this.targetElement().trim() !== '')) {
                                    this.mainList = ulElement.cloneNode ? ulElement.cloneNode(true) : ulElement;
                                }
                            }
                            this.isFirstClick = true;
                        }
                        this.popupObj.wireScrollEvents();
                        if (!(this.mode !== 'CheckBox' && (this.allowFiltering || this.allowCustomValue) &&
                            this.targetElement().trim() !== '')) {
                            this.loadTemplate();
                        }
                        this.setScrollPosition();
                        if (this.allowFiltering) {
                            this.notify('inputFocus', {
                                module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'focus'
                            });
                        }
                    }, targetExitViewport: () => {
                        if (!Browser.isDevice) {
                            this.hidePopup();
                        }
                    }
                });
                if (this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering) {
                    this.notify('deviceSearchBox', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                }
                this.popupObj.close();
                this.popupWrapper.style.visibility = '';
            }
        }
    }
    setHeaderTemplate() {
        let compiledString;
        if (this.header) {
            this.header.remove();
        }
        this.header = this.createElement('div');
        addClass([this.header], HEADER$1);
        const headercheck = this.multiCompiler(this.headerTemplate);
        if (typeof this.headerTemplate !== 'function' && headercheck) {
            compiledString = compile(select(this.headerTemplate, document).innerHTML.trim());
        }
        else {
            compiledString = compile(this.headerTemplate);
        }
        // eslint-disable-next-line
        let elements = compiledString({}, this, 'headerTemplate', this.headerTemplateId, this.isStringTemplate, null, this.header);
        if (elements && elements.length > 0) {
            append(elements, this.header);
        }
        if (this.mode === 'CheckBox' && this.showSelectAll) {
            prepend([this.header], this.popupWrapper);
        }
        else {
            append([this.header], this.popupWrapper);
        }
        EventHandler.add(this.header, 'mousedown', this.onListMouseDown, this);
    }
    setFooterTemplate() {
        let compiledString;
        if (this.footer) {
            this.footer.remove();
        }
        this.footer = this.createElement('div');
        addClass([this.footer], FOOTER$1);
        const footercheck = this.multiCompiler(this.footerTemplate);
        if (typeof this.footerTemplate !== 'function' && footercheck) {
            compiledString = compile(select(this.footerTemplate, document).innerHTML.trim());
        }
        else {
            compiledString = compile(this.footerTemplate);
        }
        // eslint-disable-next-line
        let elements = compiledString({}, this, 'footerTemplate', this.footerTemplateId, this.isStringTemplate, null, this.footer);
        if (elements && elements.length > 0) {
            append(elements, this.footer);
        }
        append([this.footer], this.popupWrapper);
        EventHandler.add(this.footer, 'mousedown', this.onListMouseDown, this);
    }
    clearAll(e) {
        if (this.enabled && !this.readonly) {
            let temp;
            if (this.value && this.value.length > 0) {
                const liElement = this.list && this.list.querySelectorAll('li.e-list-item');
                if (liElement && liElement.length > 0) {
                    this.selectAllItems(false, e);
                }
                else {
                    this.removeIndex = 0;
                    for (temp = this.value[this.removeIndex]; this.removeIndex < this.value.length; temp = this.value[this.removeIndex]) {
                        this.removeValue(temp, e, null, true);
                    }
                }
                this.selectedElementID = null;
                this.inputElement.removeAttribute('aria-activedescendant');
            }
            else {
                this.clearAllCallback(e);
            }
        }
    }
    clearAllCallback(e, isClearAll) {
        const tempValues = this.value ? this.value.slice() : [];
        if (this.mainList && this.listData && ((this.allowFiltering && this.mode !== 'CheckBox') || this.allowCustomValue)) {
            const list = this.mainList.cloneNode ? this.mainList.cloneNode(true) : this.mainList;
            this.onActionComplete(list, this.mainData);
        }
        this.focusAtFirstListItem();
        this.updateDelimeter(this.delimiterChar, e);
        if (this.mode !== 'Box' && (!this.inputFocus || this.mode === 'CheckBox')) {
            this.updateDelimView();
        }
        if (this.inputElement.value !== '') {
            this.makeTextBoxEmpty();
            this.search(null);
        }
        this.checkPlaceholderSize();
        if (this.isPopupOpen()) {
            this.refreshPopup();
        }
        if (!this.inputFocus) {
            if (this.changeOnBlur) {
                this.updateValueState(e, this.value, tempValues);
            }
            if (this.mode !== 'CheckBox') {
                this.inputElement.focus();
            }
        }
        if (this.mode === 'CheckBox') {
            this.refreshPlaceHolder();
            this.refreshInputHight();
            if (this.changeOnBlur && isClearAll && (isNullOrUndefined(this.value) || this.value.length === 0)) {
                this.updateValueState(e, this.value, this.tempValues);
            }
        }
        if (!this.changeOnBlur && isClearAll && (isNullOrUndefined(this.value) || this.value.length === 0)) {
            this.updateValueState(e, this.value, this.tempValues);
        }
        if (this.mode === 'CheckBox' && this.enableGroupCheckBox && !isNullOrUndefined(this.fields.groupBy)) {
            this.updateListItems(this.list.querySelectorAll('li.e-list-item'), this.mainList.querySelectorAll('li.e-list-item'));
        }
        e.preventDefault();
    }
    windowResize() {
        this.refreshPopup();
        if ((!this.inputFocus || this.mode === 'CheckBox') && this.viewWrapper && this.viewWrapper.parentElement) {
            this.updateDelimView();
        }
    }
    resetValueHandler(e) {
        const formElement = closest(this.inputElement, 'form');
        if (formElement && e.target === formElement) {
            const textVal = (this.element.tagName === this.getNgDirective()) ?
                null : this.element.getAttribute('data-initial-value');
            this.text = textVal;
        }
    }
    wireEvent() {
        EventHandler.add(this.componentWrapper, 'mousedown', this.wrapperClick, this);
        EventHandler.add(window, 'resize', this.windowResize, this);
        EventHandler.add(this.inputElement, 'focus', this.focusInHandler, this);
        EventHandler.add(this.inputElement, 'keydown', this.onKeyDown, this);
        EventHandler.add(this.inputElement, 'keyup', this.keyUp, this);
        if (this.mode !== 'CheckBox') {
            EventHandler.add(this.inputElement, 'input', this.onInput, this);
        }
        EventHandler.add(this.inputElement, 'blur', this.onBlurHandler, this);
        EventHandler.add(this.componentWrapper, 'mouseover', this.mouseIn, this);
        const formElement = closest(this.inputElement, 'form');
        if (formElement) {
            EventHandler.add(formElement, 'reset', this.resetValueHandler, this);
        }
        EventHandler.add(this.componentWrapper, 'mouseout', this.mouseOut, this);
        EventHandler.add(this.overAllClear, 'mouseup', this.clearAll, this);
        EventHandler.add(this.inputElement, 'paste', this.pasteHandler, this);
    }
    onInput(e) {
        if (this.keyDownStatus) {
            this.isValidKey = true;
        }
        else {
            this.isValidKey = false;
        }
        this.keyDownStatus = false;
        // For Filtering works in mobile firefox
        if (Browser.isDevice && Browser.info.name === 'mozilla') {
            this.search(e);
        }
    }
    pasteHandler(event) {
        setTimeout(() => {
            this.expandTextbox();
            this.search(event);
        });
    }
    search(e) {
        this.resetFilteredData = true;
        if (!isNullOrUndefined(e)) {
            this.keyCode = e.keyCode;
        }
        if (!this.isPopupOpen() && this.openOnClick) {
            this.showPopup(e);
        }
        this.openClick(e);
        if (this.checkTextLength() && !this.allowFiltering && !isNullOrUndefined(e) && (e.keyCode !== 8)) {
            this.focusAtFirstListItem();
        }
        else {
            const text = this.targetElement();
            if (this.allowFiltering) {
                const eventArgs = {
                    preventDefaultAction: false,
                    text: this.targetElement(),
                    updateData: (dataSource, query, fields) => {
                        if (eventArgs.cancel) {
                            return;
                        }
                        this.isFiltered = true;
                        this.remoteFilterAction = true;
                        this.dataUpdater(dataSource, query, fields);
                    },
                    event: e,
                    cancel: false
                };
                this.trigger('filtering', eventArgs, (eventArgs) => {
                    if (!eventArgs.cancel) {
                        if (!this.isFiltered && !eventArgs.preventDefaultAction) {
                            this.filterAction = true;
                            this.dataUpdater(this.dataSource, null, this.fields);
                        }
                    }
                });
            }
            else if (this.allowCustomValue) {
                let query = new Query();
                query = (text !== '') ? query.where(this.fields.text, 'startswith', text, this.ignoreCase, this.ignoreAccent) : query;
                this.dataUpdater(this.mainData, query, this.fields);
            }
            else {
                const liCollections = this.list.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-hide-listitem)');
                const activeElement = Search(this.targetElement(), liCollections, 'StartsWith', this.ignoreCase);
                if (activeElement && activeElement.item !== null) {
                    this.addListFocus(activeElement.item);
                    this.list.scrollTop =
                        activeElement.item.offsetHeight * activeElement.index;
                }
                else if (this.targetElement() !== '') {
                    this.removeFocus();
                }
                else {
                    this.focusAtFirstListItem();
                }
            }
        }
    }
    preRender() {
        if (this.allowFiltering === null) {
            this.allowFiltering = (this.mode === 'CheckBox') ? true : false;
        }
        this.initializeData();
        this.updateDataAttribute(this.htmlAttributes);
        super.preRender();
    }
    getLocaleName() {
        return 'multi-select';
    }
    initializeData() {
        this.mainListCollection = [];
        this.beforePopupOpen = false;
        this.filterAction = false;
        this.remoteFilterAction = false;
        this.isFirstClick = false;
        this.mobFilter = true;
        this.isFiltered = false;
        this.focused = true;
        this.initial = true;
        this.backCommand = true;
    }
    updateData(delimiterChar, e) {
        let data = '';
        const delim = this.mode === 'Delimiter' || this.mode === 'CheckBox';
        const text = [];
        let temp;
        const tempData = this.listData;
        this.listData = this.mainData;
        if (!isNullOrUndefined(this.hiddenElement)) {
            this.hiddenElement.innerHTML = '';
        }
        if (!isNullOrUndefined(this.value)) {
            let valueLength = this.value.length;
            let hiddenElementContent = '';
            for (let index = 0; index < valueLength; index++) {
                const valueItem = this.value[index];
                const listValue = this.findListElement((!isNullOrUndefined(this.mainList) ? this.mainList : this.ulElement), 'li', 'data-value', valueItem);
                if (isNullOrUndefined(listValue) && !this.allowCustomValue) {
                    this.value.splice(index, 1);
                    index -= 1;
                    valueLength -= 1;
                }
                else {
                    if (this.listData) {
                        temp = this.getTextByValue(valueItem);
                    }
                    else {
                        temp = valueItem;
                    }
                    data += temp + delimiterChar + ' ';
                    text.push(temp);
                }
                hiddenElementContent += `<option selected value="${valueItem}">${index}</option>`;
            }
            if (!isNullOrUndefined(this.hiddenElement)) {
                this.hiddenElement.innerHTML = hiddenElementContent;
            }
        }
        this.setProperties({ text: text.toString() }, true);
        if (delim) {
            this.updateWrapperText(this.delimiterWrapper, data);
            this.delimiterWrapper.setAttribute('id', getUniqueID('delim_val'));
            this.inputElement.setAttribute('aria-labelledby', this.delimiterWrapper.id);
        }
        const targetEle = e && e.target;
        const isClearAll = (targetEle && targetEle.classList.contains('e-close-hooker')) ? true : null;
        if (!this.changeOnBlur && ((e && !isClearAll)) || this.isSelectAll) {
            this.isSelectAll = false;
            this.updateValueState(e, this.value, this.tempValues);
        }
        this.listData = tempData;
        this.addValidInputClass();
    }
    initialTextUpdate() {
        if (!isNullOrUndefined(this.text)) {
            const textArr = this.text.split(this.delimiterChar);
            const textVal = [];
            for (let index = 0; textArr.length > index; index++) {
                const val = this.getValueByText(textArr[index]);
                if (!isNullOrUndefined(val)) {
                    textVal.push(val);
                }
                else if (this.allowCustomValue) {
                    textVal.push(textArr[index]);
                }
            }
            if (textVal && textVal.length) {
                this.setProperties({ value: textVal }, true);
            }
        }
        else {
            this.setProperties({ value: null }, true);
        }
    }
    renderList(isEmptyData) {
        if (!isEmptyData && this.allowCustomValue && this.list && (this.list.textContent === this.noRecordsTemplate
            || this.list.querySelector('.e-ul') && this.list.querySelector('.e-ul').childElementCount === 0)) {
            isEmptyData = true;
        }
        super.render(null, isEmptyData);
        this.unwireListEvents();
        this.wireListEvents();
    }
    initialValueUpdate() {
        if (this.list) {
            let text;
            let element;
            let value;
            if (this.chipCollectionWrapper) {
                this.chipCollectionWrapper.innerHTML = '';
            }
            this.removeListSelection();
            if (!isNullOrUndefined(this.value)) {
                for (let index = 0; !isNullOrUndefined(this.value[index]); index++) {
                    value = this.value[index];
                    element = this.findListElement(this.hideSelectedItem ? this.ulElement : this.list, 'li', 'data-value', value);
                    text = this.getTextByValue(value);
                    if ((element && (element.getAttribute('aria-selected') !== 'true')) ||
                        (element && (element.getAttribute('aria-selected') === 'true' && this.hideSelectedItem) &&
                            (this.mode === 'Box' || this.mode === 'Default'))) {
                        this.addChip(text, value);
                        this.addListSelection(element);
                    }
                    else if (value && this.allowCustomValue) {
                        const indexItem = this.listData.length;
                        const newValue = {};
                        setValue(this.fields.text, value, newValue);
                        setValue(this.fields.value, value, newValue);
                        const noDataEle = this.popupWrapper.querySelector('.' + dropDownBaseClasses.noData);
                        this.addItem(newValue, indexItem);
                        element = element ? element : this.findListElement(this.hideSelectedItem ? this.ulElement : this.list, 'li', 'data-value', value);
                        if (this.popupWrapper.contains(noDataEle)) {
                            this.list.setAttribute('style', noDataEle.getAttribute('style'));
                            this.popupWrapper.replaceChild(this.list, noDataEle);
                            this.wireListEvents();
                        }
                        this.addChip(text, value);
                        this.addListSelection(element);
                    }
                }
            }
            if (this.mode === 'CheckBox') {
                this.updateDelimView();
                if (this.changeOnBlur) {
                    this.updateValueState(null, this.value, this.tempValues);
                }
                this.updateDelimeter(this.delimiterChar);
                this.refreshInputHight();
            }
            else {
                this.updateDelimeter(this.delimiterChar);
            }
            if (this.mode === 'CheckBox' && this.showSelectAll && (isNullOrUndefined(this.value) || !this.value.length)) {
                this.notify('checkSelectAll', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'uncheck' });
            }
            if (this.mode === 'Box' || (this.mode === 'Default' && this.inputFocus)) {
                this.chipCollectionWrapper.style.display = '';
            }
            else if (this.mode === 'Delimiter' || this.mode === 'CheckBox') {
                this.showDelimWrapper();
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateActionCompleteData(li, item) {
        if (this.value && this.value.indexOf(li.getAttribute('data-value')) > -1) {
            this.mainList = this.ulElement;
            if (this.hideSelectedItem) {
                addClass([li], HIDE_LIST);
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAddItemList(list, itemCount) {
        if (this.popupObj && this.popupObj.element && this.popupObj.element.querySelector('.' + dropDownBaseClasses.noData) && list) {
            this.list = list;
            this.mainList = this.ulElement = list.querySelector('ul');
            remove(this.popupWrapper.querySelector('.e-content'));
            this.popupObj = null;
            this.renderPopup();
        }
        else if (this.allowCustomValue) {
            this.list = list;
            this.mainList = this.ulElement = list.querySelector('ul');
        }
    }
    updateDataList() {
        if (this.mainList && this.ulElement && !(this.isFiltered || this.filterAction || this.targetElement().trim())) {
            let isDynamicGroupItemUpdate = this.mainList.childElementCount < this.ulElement.childElementCount;
            let isReactTemplateUpdate = ((this.ulElement.childElementCount > 0 && this.ulElement.children[0].childElementCount > 0) && (this.mainList.children[0].childElementCount < this.ulElement.children[0].childElementCount));
            let isAngularTemplateUpdate = this.itemTemplate && this.ulElement.childElementCount > 0 && !(this.ulElement.childElementCount < this.mainList.childElementCount) && (this.ulElement.children[0].childElementCount > 0 || (this.fields.groupBy && this.ulElement.children[1] && this.ulElement.children[1].childElementCount > 0));
            if (isDynamicGroupItemUpdate || isReactTemplateUpdate || isAngularTemplateUpdate) {
                //EJ2-57748 - for this task, we prevent the ul element cloning ( this.mainList = this.ulElement.cloneNode ? <HTMLElement>this.ulElement.cloneNode(true) : this.ulElement;)
                this.mainList = this.ulElement;
            }
        }
    }
    isValidLI(li) {
        return (li && !li.classList.contains(dropDownBaseClasses.disabled) && !li.classList.contains(dropDownBaseClasses.group) &&
            li.classList.contains(dropDownBaseClasses.li));
    }
    updateListSelection(li, e, length) {
        const customVal = li.getAttribute('data-value');
        let value = this.getFormattedValue(customVal);
        if (this.allowCustomValue && ((customVal !== 'false' && value === false) ||
            (!isNullOrUndefined(value) && value.toString() === 'NaN'))) {
            value = customVal;
        }
        this.removeHover();
        if (!this.value || this.value.indexOf(value) === -1) {
            this.dispatchSelect(value, e, li, (li.getAttribute('aria-selected') === 'true'), length);
        }
        else {
            this.removeValue(value, e, length);
        }
    }
    updateListSelectEventCallback(value, li, e) {
        const text = this.getTextByValue(value);
        if ((this.allowCustomValue || this.allowFiltering) && !this.findListElement(this.mainList, 'li', 'data-value', value)) {
            const temp = li.cloneNode(true);
            const fieldValue = this.fields.value ? this.fields.value : 'value';
            if (this.allowCustomValue && this.mainData.length && typeof getValue(fieldValue, this.mainData[0]) === 'number') {
                value = !isNaN(parseFloat(value.toString())) ? parseFloat(value.toString()) : value;
            }
            const data = this.getDataByValue(value);
            const eventArgs = {
                newData: data,
                cancel: false
            };
            this.trigger('customValueSelection', eventArgs, (eventArgs) => {
                if (!eventArgs.cancel) {
                    append([temp], this.mainList);
                    this.mainData.push(data);
                    this.remoteCustomValue = false;
                    this.addValue(value, text, e);
                }
            });
        }
        else {
            this.remoteCustomValue = false;
            this.addValue(value, text, e);
        }
    }
    removeListSelection() {
        const className = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        const selectedItems = this.list.querySelectorAll('.' + className);
        let temp = selectedItems.length;
        if (selectedItems && selectedItems.length) {
            removeClass(selectedItems, className);
            while (temp > 0) {
                selectedItems[temp - 1].setAttribute('aria-selected', 'false');
                temp--;
            }
        }
        if (!isNullOrUndefined(this.mainList)) {
            const selectItems = this.mainList.querySelectorAll('.' + className);
            let temp1 = selectItems.length;
            if (selectItems && selectItems.length) {
                removeClass(selectItems, className);
                while (temp1 > 0) {
                    selectItems[temp1 - 1].setAttribute('aria-selected', 'false');
                    if (this.mode === 'CheckBox') {
                        if (selectedItems && (selectedItems.length > (temp1 - 1))) {
                            removeClass([selectedItems[temp1 - 1].firstElementChild.lastElementChild], 'e-check');
                        }
                        removeClass([selectItems[temp1 - 1].firstElementChild.lastElementChild], 'e-check');
                    }
                    temp1--;
                }
            }
        }
    }
    removeHover() {
        const hoveredItem = this.list.querySelectorAll('.' + dropDownBaseClasses.hover);
        if (hoveredItem && hoveredItem.length) {
            removeClass(hoveredItem, dropDownBaseClasses.hover);
        }
    }
    removeFocus() {
        if (this.list && this.mainList) {
            const hoveredItem = this.list.querySelectorAll('.' + dropDownBaseClasses.focus);
            const mainlist = this.mainList.querySelectorAll('.' + dropDownBaseClasses.focus);
            if (hoveredItem && hoveredItem.length) {
                removeClass(hoveredItem, dropDownBaseClasses.focus);
                removeClass(mainlist, dropDownBaseClasses.focus);
            }
        }
    }
    addListHover(li) {
        if (this.enabled && this.isValidLI(li)) {
            this.removeHover();
            addClass([li], dropDownBaseClasses.hover);
        }
        else {
            if ((li !== null && li.classList.contains('e-list-group-item')) && this.enableGroupCheckBox && this.mode === 'CheckBox'
                && !isNullOrUndefined(this.fields.groupBy)) {
                this.removeHover();
                addClass([li], dropDownBaseClasses.hover);
            }
        }
    }
    addListFocus(element) {
        if (this.enabled && this.isValidLI(element)) {
            this.removeFocus();
            addClass([element], dropDownBaseClasses.focus);
            this.updateAriaActiveDescendant();
        }
        else {
            if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
                addClass([element], dropDownBaseClasses.focus);
                this.updateAriaActiveDescendant();
            }
        }
    }
    addListSelection(element, mainElement) {
        const className = this.hideSelectedItem ?
            HIDE_LIST :
            dropDownBaseClasses.selected;
        if (this.isValidLI(element) && !element.classList.contains(dropDownBaseClasses.hover)) {
            addClass([element], className);
            this.updateMainList(false, element.getAttribute('data-value'), mainElement);
            element.setAttribute('aria-selected', 'true');
            if (this.mode === 'CheckBox' && element.classList.contains('e-active')) {
                const ariaCheck = element.getElementsByClassName('e-check').length;
                if (ariaCheck === 0) {
                    this.notify('updatelist', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', li: element, e: this });
                }
            }
            this.notify('activeList', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', li: element, e: this });
            if (this.chipCollectionWrapper) {
                this.removeChipSelection();
            }
            this.selectedElementID = element.id;
        }
    }
    updateDelimeter(delimChar, e) {
        this.updateData(delimChar, e);
    }
    onMouseClick(e) {
        this.keyCode = null;
        this.scrollFocusStatus = false;
        let target = e.target;
        const li = closest(target, '.' + dropDownBaseClasses.li);
        const headerLi = closest(target, '.' + dropDownBaseClasses.group);
        if (headerLi && this.enableGroupCheckBox && this.mode === 'CheckBox' && this.fields.groupBy) {
            target = target.classList.contains('e-list-group-item') ? target.firstElementChild.lastElementChild
                : e.target;
            if (target.classList.contains('e-check')) {
                this.selectAllItem(false, e);
                target.classList.remove('e-check');
                target.classList.remove('e-stop');
                closest(target, '.' + 'e-list-group-item').classList.remove('e-active');
                target.setAttribute('aria-selected', 'false');
            }
            else {
                this.selectAllItem(true, e);
                target.classList.remove('e-stop');
                target.classList.add('e-check');
                closest(target, '.' + 'e-list-group-item').classList.add('e-active');
                target.setAttribute('aria-selected', 'true');
            }
            this.refreshSelection();
            this.checkSelectAll();
        }
        else {
            if (this.isValidLI(li)) {
                let limit = this.value && this.value.length ? this.value.length : 0;
                if (li.classList.contains('e-active')) {
                    limit = limit - 1;
                }
                if (limit < this.maximumSelectionLength) {
                    this.updateListSelection(li, e);
                    this.checkPlaceholderSize();
                    this.addListFocus(li);
                    if ((this.allowCustomValue || this.allowFiltering) && this.mainList && this.listData) {
                        if (this.mode !== 'CheckBox') {
                            this.focusAtLastListItem(li.getAttribute('data-value'));
                            this.refreshSelection();
                        }
                    }
                    else {
                        this.makeTextBoxEmpty();
                    }
                }
                if (this.mode === 'CheckBox') {
                    this.updateDelimView();
                    if (this.value && this.value.length > 50) {
                        setTimeout(() => {
                            this.updateDelimeter(this.delimiterChar, e);
                        }, 0);
                    }
                    else {
                        this.updateDelimeter(this.delimiterChar, e);
                    }
                    this.refreshInputHight();
                }
                else {
                    this.updateDelimeter(this.delimiterChar, e);
                }
                this.checkSelectAll();
                this.refreshPopup();
                if (this.hideSelectedItem) {
                    this.focusAtFirstListItem();
                }
                if (this.closePopupOnSelect) {
                    this.hidePopup(e);
                }
                else {
                    e.preventDefault();
                }
                this.makeTextBoxEmpty();
                this.findGroupStart(target);
                if (this.mode !== 'CheckBox') {
                    this.refreshListItems(isNullOrUndefined(li) ? null : li.textContent);
                }
            }
            else {
                e.preventDefault();
            }
            this.refreshPlaceHolder();
            this.deselectHeader();
        }
    }
    findGroupStart(target) {
        if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
            const count = 0;
            const liChecked = 0;
            const liUnchecked = 0;
            let groupValues;
            if (this.itemTemplate && !target.getElementsByClassName('e-frame').length) {
                while (!target.getElementsByClassName('e-frame').length) {
                    target = target.parentElement;
                }
            }
            if (target.classList.contains('e-frame')) {
                target = target.parentElement.parentElement;
            }
            groupValues = this.findGroupAttrtibutes(target, liChecked, liUnchecked, count, 0);
            groupValues = this.findGroupAttrtibutes(target, groupValues[0], groupValues[1], groupValues[2], 1);
            while (!target.classList.contains('e-list-group-item')) {
                if (target.classList.contains('e-list-icon')) {
                    target = target.parentElement;
                }
                target = target.previousElementSibling;
                if (target == null) {
                    break;
                }
            }
            this.updateCheckBox(target, groupValues[0], groupValues[1], groupValues[2]);
        }
    }
    findGroupAttrtibutes(listElement, checked, unChecked, count, position) {
        while (!listElement.classList.contains('e-list-group-item')) {
            if (listElement.classList.contains('e-list-icon')) {
                listElement = listElement.parentElement;
            }
            if (listElement.getElementsByClassName('e-frame')[0].classList.contains('e-check') &&
                listElement.classList.contains('e-list-item')) {
                checked++;
            }
            else if (listElement.classList.contains('e-list-item')) {
                unChecked++;
            }
            count++;
            listElement = position ? listElement.nextElementSibling : listElement.previousElementSibling;
            if (listElement == null) {
                break;
            }
        }
        return [checked, unChecked, count];
    }
    updateCheckBox(groupHeader, checked, unChecked, count) {
        if (groupHeader === null) {
            return;
        }
        const checkBoxElement = groupHeader.getElementsByClassName('e-frame')[0];
        if (count === checked) {
            checkBoxElement.classList.remove('e-stop');
            checkBoxElement.classList.add('e-check');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.add('e-active');
            groupHeader.setAttribute('aria-selected', 'true');
        }
        else if (count === unChecked) {
            checkBoxElement.classList.remove('e-check');
            checkBoxElement.classList.remove('e-stop');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.remove('e-active');
            groupHeader.setAttribute('aria-selected', 'false');
        }
        else if (this.maximumSelectionLength === checked - 1) {
            checkBoxElement.classList.remove('e-stop');
            groupHeader.setAttribute('aria-selected', 'true');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.add('e-active');
            checkBoxElement.classList.add('e-check');
        }
        else {
            checkBoxElement.classList.remove('e-check');
            checkBoxElement.classList.add('e-stop');
            closest(checkBoxElement, '.' + 'e-list-group-item').classList.add('e-active');
            groupHeader.setAttribute('aria-selected', 'false');
        }
    }
    deselectHeader() {
        const limit = this.value && this.value.length ? this.value.length : 0;
        const collection = this.list.querySelectorAll('li.e-list-group-item:not(.e-active)');
        if (limit < this.maximumSelectionLength) {
            removeClass(collection, 'e-disable');
        }
        if (limit === this.maximumSelectionLength) {
            addClass(collection, 'e-disable');
        }
    }
    onMouseOver(e) {
        let currentLi = closest(e.target, '.' + dropDownBaseClasses.li);
        if (currentLi === null && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)
            && this.enableGroupCheckBox) {
            currentLi = closest(e.target, '.' + dropDownBaseClasses.group);
        }
        this.addListHover(currentLi);
    }
    onMouseLeave() {
        this.removeHover();
    }
    onListMouseDown(e) {
        e.preventDefault();
        this.scrollFocusStatus = true;
    }
    onDocumentClick(e) {
        if (this.mode !== 'CheckBox') {
            const target = e.target;
            if (!(!isNullOrUndefined(this.popupObj) && closest(target, '[id="' + this.popupObj.element.id + '"]')) &&
                !this.overAllWrapper.contains(e.target)) {
                this.scrollFocusStatus = false;
            }
            else {
                this.scrollFocusStatus = (Browser.isIE || Browser.info.name === 'edge') && (document.activeElement === this.inputElement);
            }
        }
    }
    wireListEvents() {
        if (!isNullOrUndefined(this.list)) {
            EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
            EventHandler.add(this.list, 'mousedown', this.onListMouseDown, this);
            EventHandler.add(this.list, 'mouseup', this.onMouseClick, this);
            EventHandler.add(this.list, 'mouseover', this.onMouseOver, this);
            EventHandler.add(this.list, 'mouseout', this.onMouseLeave, this);
        }
    }
    unwireListEvents() {
        EventHandler.remove(document, 'mousedown', this.onDocumentClick);
        if (this.list) {
            EventHandler.remove(this.list, 'mousedown', this.onListMouseDown);
            EventHandler.remove(this.list, 'mouseup', this.onMouseClick);
            EventHandler.remove(this.list, 'mouseover', this.onMouseOver);
            EventHandler.remove(this.list, 'mouseout', this.onMouseLeave);
        }
    }
    hideOverAllClear() {
        if (!this.value || !this.value.length || this.inputElement.value === '') {
            this.overAllClear.style.display = 'none';
        }
    }
    showOverAllClear() {
        if (((this.value && this.value.length) || this.inputElement.value !== '') && this.showClearButton && this.readonly !== true) {
            this.overAllClear.style.display = '';
        }
        else {
            this.overAllClear.style.display = 'none';
        }
    }
    /**
     * Sets the focus to widget for interaction.
     *
     * @returns {void}
     */
    focusIn() {
        if (document.activeElement !== this.inputElement && this.enabled) {
            this.inputElement.focus();
        }
    }
    /**
     * Remove the focus from widget, if the widget is in focus state.
     *
     * @returns {void}
     */
    focusOut() {
        if (document.activeElement === this.inputElement && this.enabled) {
            this.inputElement.blur();
        }
    }
    /**
     * Shows the spinner loader.
     *
     * @returns {void}
     */
    showSpinner() {
        if (isNullOrUndefined(this.spinnerElement)) {
            let filterClear = this.filterParent && this.filterParent.querySelector('.e-clear-icon.e-icons');
            if (this.overAllClear.style.display !== 'none' || filterClear) {
                this.spinnerElement = filterClear ? filterClear : this.overAllClear;
            }
            else {
                this.spinnerElement = this.createElement('span', { className: CLOSEICON_CLASS$1 + ' ' + SPINNER_CLASS$1 });
                this.componentWrapper.appendChild(this.spinnerElement);
            }
            createSpinner({ target: this.spinnerElement, width: Browser.isDevice ? '16px' : '14px' }, this.createElement);
            addClass([this.spinnerElement], DISABLE_ICON);
            showSpinner(this.spinnerElement);
        }
    }
    /**
     * Hides the spinner loader.
     *
     * @returns {void}
     */
    hideSpinner() {
        if (!isNullOrUndefined(this.spinnerElement)) {
            hideSpinner(this.spinnerElement);
            removeClass([this.spinnerElement], DISABLE_ICON);
            if (this.spinnerElement.classList.contains(SPINNER_CLASS$1)) {
                detach(this.spinnerElement);
            }
            else {
                this.spinnerElement.innerHTML = '';
            }
            this.spinnerElement = null;
        }
    }
    updateWrapperText(wrapperType, wrapperData) {
        if (this.valueTemplate || !this.enableHtmlSanitizer) {
            wrapperType.innerHTML = wrapperData;
        }
        else {
            wrapperType.innerText = SanitizeHtmlHelper.sanitize(wrapperData);
        }
    }
    updateDelimView() {
        if (this.delimiterWrapper) {
            this.hideDelimWrapper();
        }
        if (this.chipCollectionWrapper) {
            this.chipCollectionWrapper.style.display = 'none';
        }
        if (!isNullOrUndefined(this.viewWrapper)) {
            this.viewWrapper.style.display = '';
            this.viewWrapper.style.width = '';
            this.viewWrapper.classList.remove(TOTAL_COUNT_WRAPPER$1);
        }
        if (this.value && this.value.length) {
            let data = '';
            let temp;
            let tempData;
            let tempIndex = 1;
            let wrapperleng;
            let remaining;
            let downIconWidth = 0;
            let overAllContainer;
            this.updateWrapperText(this.viewWrapper, data);
            const l10nLocale = {
                noRecordsTemplate: 'No records found',
                actionFailureTemplate: 'Request failed',
                overflowCountTemplate: '+${count} more..',
                totalCountTemplate: '${count} selected'
            };
            let l10n = new L10n(this.getLocaleName(), l10nLocale, this.locale);
            if (l10n.getConstant('actionFailureTemplate') === '') {
                l10n = new L10n('dropdowns', l10nLocale, this.locale);
            }
            if (l10n.getConstant('noRecordsTemplate') === '') {
                l10n = new L10n('dropdowns', l10nLocale, this.locale);
            }
            const remainContent = l10n.getConstant('overflowCountTemplate');
            const totalContent = l10n.getConstant('totalCountTemplate');
            const raminElement = this.createElement('span', {
                className: REMAIN_WRAPPER$1
            });
            let remainCompildTemp = remainContent.replace('${count}', this.value.length.toString());
            raminElement.innerText = remainCompildTemp;
            this.viewWrapper.appendChild(raminElement);
            this.renderReactTemplates();
            const remainSize = raminElement.offsetWidth;
            remove(raminElement);
            if (this.showDropDownIcon) {
                downIconWidth = this.dropIcon.offsetWidth + parseInt(window.getComputedStyle(this.dropIcon).marginRight, 10);
            }
            this.checkClearIconWidth();
            if (!isNullOrUndefined(this.value)) {
                for (let index = 0; !isNullOrUndefined(this.value[index]); index++) {
                    data += (index === 0) ? '' : this.delimiterChar + ' ';
                    temp = this.getOverflowVal(index);
                    data += temp;
                    temp = this.viewWrapper.innerHTML;
                    this.updateWrapperText(this.viewWrapper, data);
                    wrapperleng = this.viewWrapper.offsetWidth +
                        parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10);
                    overAllContainer = this.componentWrapper.offsetWidth -
                        parseInt(window.getComputedStyle(this.componentWrapper).paddingLeft, 10) -
                        parseInt(window.getComputedStyle(this.componentWrapper).paddingRight, 10);
                    if ((wrapperleng + downIconWidth + this.clearIconWidth) > overAllContainer) {
                        if (tempData !== undefined && tempData !== '') {
                            temp = tempData;
                            index = tempIndex + 1;
                        }
                        this.updateWrapperText(this.viewWrapper, temp);
                        remaining = this.value.length - index;
                        wrapperleng = this.viewWrapper.offsetWidth +
                            parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10);
                        while (((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) > overAllContainer) && wrapperleng !== 0
                            && this.viewWrapper.innerHTML !== '') {
                            const textArr = [];
                            this.viewWrapper.innerHTML = textArr.join(this.delimiterChar);
                            remaining = this.value.length;
                            wrapperleng = this.viewWrapper.offsetWidth +
                                parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10);
                        }
                        break;
                    }
                    else if ((wrapperleng + remainSize + downIconWidth + this.clearIconWidth) <= overAllContainer) {
                        tempData = data;
                        tempIndex = index;
                    }
                    else if (index === 0) {
                        tempData = '';
                        tempIndex = -1;
                    }
                }
            }
            if (remaining > 0) {
                const totalWidth = overAllContainer - downIconWidth - this.clearIconWidth;
                this.viewWrapper.appendChild(this.updateRemainTemplate(raminElement, this.viewWrapper, remaining, remainContent, totalContent, totalWidth));
                this.updateRemainWidth(this.viewWrapper, totalWidth);
                this.updateRemainingText(raminElement, downIconWidth, remaining, remainContent, totalContent);
            }
        }
        else {
            if (!isNullOrUndefined(this.viewWrapper)) {
                this.viewWrapper.innerHTML = '';
                this.viewWrapper.style.display = 'none';
            }
        }
    }
    checkClearIconWidth() {
        if (this.showClearButton) {
            this.clearIconWidth = this.overAllClear.offsetWidth;
        }
    }
    updateRemainWidth(viewWrapper, totalWidth) {
        if (viewWrapper.classList.contains(TOTAL_COUNT_WRAPPER$1) && totalWidth < (viewWrapper.offsetWidth +
            parseInt(window.getComputedStyle(viewWrapper).paddingLeft, 10)
            + parseInt(window.getComputedStyle(viewWrapper).paddingLeft, 10))) {
            viewWrapper.style.width = totalWidth + 'px';
        }
    }
    updateRemainTemplate(raminElement, viewWrapper, remaining, remainContent, totalContent, totalWidth) {
        if (viewWrapper.firstChild && viewWrapper.firstChild.nodeType === 3 && viewWrapper.firstChild.nodeValue === '') {
            viewWrapper.removeChild(viewWrapper.firstChild);
        }
        raminElement.innerHTML = '';
        let remainTemp = remainContent.replace('${count}', remaining.toString());
        let totalTemp = totalContent.replace('${count}', remaining.toString());
        raminElement.innerText = (viewWrapper.firstChild && viewWrapper.firstChild.nodeType === 3) ? remainTemp : totalTemp;
        if (viewWrapper.firstChild && viewWrapper.firstChild.nodeType === 3) {
            viewWrapper.classList.remove(TOTAL_COUNT_WRAPPER$1);
        }
        else {
            viewWrapper.classList.add(TOTAL_COUNT_WRAPPER$1);
            this.updateRemainWidth(viewWrapper, totalWidth);
        }
        return raminElement;
    }
    updateRemainingText(raminElement, downIconWidth, remaining, remainContent, totalContent) {
        const overAllContainer = this.componentWrapper.offsetWidth -
            parseInt(window.getComputedStyle(this.componentWrapper).paddingLeft, 10) -
            parseInt(window.getComputedStyle(this.componentWrapper).paddingRight, 10);
        let wrapperleng = this.viewWrapper.offsetWidth + parseInt(window.getComputedStyle(this.viewWrapper).paddingRight, 10);
        if (((wrapperleng + downIconWidth) >= overAllContainer) && wrapperleng !== 0 && this.viewWrapper.firstChild &&
            this.viewWrapper.firstChild.nodeType === 3) {
            while (((wrapperleng + downIconWidth) > overAllContainer) && wrapperleng !== 0 && this.viewWrapper.firstChild &&
                this.viewWrapper.firstChild.nodeType === 3) {
                const textArr = this.viewWrapper.firstChild.nodeValue.split(this.delimiterChar);
                textArr.pop();
                this.viewWrapper.firstChild.nodeValue = textArr.join(this.delimiterChar);
                if (this.viewWrapper.firstChild.nodeValue === '') {
                    this.viewWrapper.removeChild(this.viewWrapper.firstChild);
                }
                remaining++;
                wrapperleng = this.viewWrapper.offsetWidth;
            }
            const totalWidth = overAllContainer - downIconWidth;
            this.updateRemainTemplate(raminElement, this.viewWrapper, remaining, remainContent, totalContent, totalWidth);
        }
    }
    getOverflowVal(index) {
        let temp;
        if (this.mainData && this.mainData.length) {
            if (this.mode === 'CheckBox') {
                const newTemp = this.listData;
                this.listData = this.mainData;
                temp = this.getTextByValue(this.value[index]);
                this.listData = newTemp;
            }
            else {
                temp = this.getTextByValue(this.value[index]);
            }
        }
        else {
            temp = this.value[index];
        }
        return temp;
    }
    unWireEvent() {
        if (!isNullOrUndefined(this.componentWrapper)) {
            EventHandler.remove(this.componentWrapper, 'mousedown', this.wrapperClick);
        }
        EventHandler.remove(window, 'resize', this.windowResize);
        if (!isNullOrUndefined(this.inputElement)) {
            EventHandler.remove(this.inputElement, 'focus', this.focusInHandler);
            EventHandler.remove(this.inputElement, 'keydown', this.onKeyDown);
            if (this.mode !== 'CheckBox') {
                EventHandler.remove(this.inputElement, 'input', this.onInput);
            }
            EventHandler.remove(this.inputElement, 'keyup', this.keyUp);
            const formElement = closest(this.inputElement, 'form');
            if (formElement) {
                EventHandler.remove(formElement, 'reset', this.resetValueHandler);
            }
            EventHandler.remove(this.inputElement, 'blur', this.onBlurHandler);
        }
        if (!isNullOrUndefined(this.componentWrapper)) {
            EventHandler.remove(this.componentWrapper, 'mouseover', this.mouseIn);
            EventHandler.remove(this.componentWrapper, 'mouseout', this.mouseOut);
        }
        if (!isNullOrUndefined(this.overAllClear)) {
            EventHandler.remove(this.overAllClear, 'mousedown', this.clearAll);
        }
        if (!isNullOrUndefined(this.inputElement)) {
            EventHandler.remove(this.inputElement, 'paste', this.pasteHandler);
        }
    }
    selectAllItem(state, event, list) {
        let li;
        if (!isNullOrUndefined(this.list)) {
            li = this.list.querySelectorAll(state ?
                'li.e-list-item:not([aria-selected="true"]):not(.e-reorder-hide)' :
                'li.e-list-item[aria-selected="true"]:not(.e-reorder-hide)');
        }
        if (this.value && this.value.length && event && event.target
            && closest(event.target, '.e-close-hooker') && this.allowFiltering) {
            li = this.mainList.querySelectorAll(state ?
                'li.e-list-item:not([aria-selected="true"]):not(.e-reorder-hide)' :
                'li.e-list-item[aria-selected="true"]:not(.e-reorder-hide)');
        }
        if (this.enableGroupCheckBox && this.mode === 'CheckBox' && !isNullOrUndefined(this.fields.groupBy)) {
            let target = (event ? (this.groupTemplate ? closest(event.target, '.e-list-group-item') : event.target) : null);
            target = (event && event.keyCode === 32) ? list : target;
            target = (target && target.classList.contains('e-frame')) ? target.parentElement.parentElement : target;
            if (target && target.classList.contains('e-list-group-item')) {
                let listElement = target.nextElementSibling;
                if (isNullOrUndefined(listElement)) {
                    return;
                }
                while (listElement.classList.contains('e-list-item')) {
                    if (state) {
                        if (!listElement.firstElementChild.lastElementChild.classList.contains('e-check')) {
                            let selectionLimit = this.value && this.value.length ? this.value.length : 0;
                            if (listElement.classList.contains('e-active')) {
                                selectionLimit -= 1;
                            }
                            if (selectionLimit < this.maximumSelectionLength) {
                                this.updateListSelection(listElement, event);
                            }
                        }
                    }
                    else {
                        if (listElement.firstElementChild.lastElementChild.classList.contains('e-check')) {
                            this.updateListSelection(listElement, event);
                        }
                    }
                    listElement = listElement.nextElementSibling;
                    if (listElement == null) {
                        break;
                    }
                }
                if (target.classList.contains('e-list-group-item')) {
                    const focusedElement = this.list.getElementsByClassName('e-item-focus')[0];
                    if (focusedElement) {
                        focusedElement.classList.remove('e-item-focus');
                    }
                    if (state) {
                        target.classList.add('e-active');
                    }
                    else {
                        target.classList.remove('e-active');
                    }
                    target.classList.add('e-item-focus');
                    this.updateAriaActiveDescendant();
                }
                this.textboxValueUpdate();
                this.checkPlaceholderSize();
                if (!this.changeOnBlur && event) {
                    this.updateValueState(event, this.value, this.tempValues);
                }
            }
            else {
                this.updateValue(event, li, state);
            }
        }
        else {
            this.updateValue(event, li, state);
        }
        this.addValidInputClass();
    }
    updateValue(event, li, state) {
        const length = li.length;
        const beforeSelectArgs = {
            event: event,
            items: state ? li : [],
            itemData: state ? this.listData : [],
            isInteracted: event ? true : false,
            isChecked: state,
            preventSelectEvent: false
        };
        this.trigger('beforeSelectAll', beforeSelectArgs);
        if (li && li.length) {
            let index = 0;
            let count = 0;
            if (this.enableGroupCheckBox) {
                count = state ? this.maximumSelectionLength - (this.value ? this.value.length : 0) : li.length;
            }
            else {
                count = state ? this.maximumSelectionLength - (this.value ? this.value.length : 0) : this.maximumSelectionLength;
            }
            if (!beforeSelectArgs.preventSelectEvent) {
                while (index < length && index <= 50 && index < count) {
                    this.updateListSelection(li[index], event, length - index);
                    if (this.enableGroupCheckBox) {
                        this.findGroupStart(li[index]);
                    }
                    index++;
                }
                if (length > 50) {
                    setTimeout(() => {
                        while (index < length && index < count) {
                            this.updateListSelection(li[index], event, length - index);
                            if (this.enableGroupCheckBox) {
                                this.findGroupStart(li[index]);
                            }
                            index++;
                        }
                        this.updatedataValueItems(event);
                        if (!this.changeOnBlur) {
                            this.updateValueState(event, this.value, this.tempValues);
                            this.isSelectAll = this.isSelectAll ? !this.isSelectAll : this.isSelectAll;
                        }
                        this.updateHiddenElement();
                    }, 0);
                }
            }
            else {
                for (let i = 0; i < li.length && i < count; i++) {
                    this.removeHover();
                    let customVal = li[i].getAttribute('data-value');
                    let value = this.getFormattedValue(customVal);
                    let mainElement = this.mainList ? this.mainList.querySelectorAll(state ?
                        'li.e-list-item:not([aria-selected="true"]):not(.e-reorder-hide)' :
                        'li.e-list-item[aria-selected="true"]:not(.e-reorder-hide)')[i] : null;
                    if (state) {
                        this.value = !this.value ? [] : this.value;
                        if (this.value.indexOf(value) < 0) {
                            this.setProperties({ value: [].concat([], this.value, [value]) }, true);
                        }
                        this.removeFocus();
                        this.addListSelection(li[i], mainElement);
                        this.updateChipStatus();
                        this.checkMaxSelection();
                    }
                    else {
                        this.removeAllItems(value, event, false, li[i], mainElement);
                    }
                    if (this.enableGroupCheckBox) {
                        this.findGroupStart(li[i]);
                    }
                }
                if (!state) {
                    const limit = this.value && this.value.length ? this.value.length : 0;
                    if (limit < this.maximumSelectionLength) {
                        const collection = this.list.querySelectorAll('li.'
                            + dropDownBaseClasses.li + ':not(.e-active)');
                        removeClass(collection, 'e-disable');
                    }
                }
                const args = {
                    event: event,
                    items: state ? li : [],
                    itemData: state ? this.listData : [],
                    isInteracted: event ? true : false,
                    isChecked: state
                };
                this.trigger('selectedAll', args);
            }
        }
        this.updatedataValueItems(event);
        this.checkPlaceholderSize();
        if (length <= 50 && !beforeSelectArgs.preventSelectEvent) {
            if (!this.changeOnBlur) {
                this.updateValueState(event, this.value, this.tempValues);
                this.isSelectAll = this.isSelectAll ? !this.isSelectAll : this.isSelectAll;
            }
            this.updateHiddenElement();
        }
    }
    updateHiddenElement() {
        let hiddenValue = '';
        let wrapperText = '';
        let data = '';
        const text = [];
        if (this.mode === 'CheckBox') {
            this.value.map((value, index) => {
                hiddenValue += '<option selected value ="' + value + '">' + index + '</option>';
                if (this.listData) {
                    data = this.getTextByValue(value);
                }
                else {
                    data = value;
                }
                wrapperText += data + this.delimiterChar + ' ';
                text.push(data);
            });
            this.hiddenElement.innerHTML = hiddenValue;
            this.updateWrapperText(this.delimiterWrapper, wrapperText);
            this.delimiterWrapper.setAttribute('id', getUniqueID('delim_val'));
            this.inputElement.setAttribute('aria-labelledby', this.delimiterWrapper.id);
            this.setProperties({ text: text.toString() }, true);
            this.refreshInputHight();
            this.refreshPlaceHolder();
        }
    }
    updatedataValueItems(event) {
        this.deselectHeader();
        this.textboxValueUpdate(event);
    }
    textboxValueUpdate(event) {
        const isRemoveAll = event && event.target && (closest(event.target, '.e-selectall-parent')
            || closest(event.target, '.e-close-hooker'));
        if (this.mode !== 'Box' && !this.isPopupOpen() && !(this.mode === 'CheckBox' && (this.isSelectAll || isRemoveAll))) {
            this.updateDelimView();
        }
        else {
            this.searchWrapper.classList.remove(ZERO_SIZE);
        }
        if (this.mode === 'CheckBox') {
            this.updateDelimView();
            if (!(isRemoveAll || this.isSelectAll)) {
                this.updateDelimeter(this.delimiterChar, event);
            }
            this.refreshInputHight();
        }
        else {
            this.updateDelimeter(this.delimiterChar, event);
        }
        this.refreshPlaceHolder();
    }
    setZIndex() {
        if (this.popupObj) {
            this.popupObj.setProperties({ 'zIndex': this.zIndex });
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateDataSource(prop) {
        if (isNullOrUndefined(this.list)) {
            this.renderPopup();
        }
        else {
            this.resetList(this.dataSource);
        }
        if (this.value && this.value.length) {
            this.setProperties({ 'value': this.value });
            this.refreshSelection();
        }
    }
    onLoadSelect() {
        this.setDynValue = true;
        this.renderPopup();
    }
    selectAllItems(state, event) {
        if (isNullOrUndefined(this.list)) {
            this.selectAllAction = () => {
                if (this.mode === 'CheckBox' && this.showSelectAll) {
                    const args = {
                        module: 'CheckBoxSelection',
                        enable: this.mode === 'CheckBox',
                        value: state ? 'check' : 'uncheck'
                    };
                    this.notify('checkSelectAll', args);
                }
                this.selectAllItem(state, event);
                this.selectAllAction = null;
            };
            super.render();
        }
        else {
            this.selectAllAction = null;
            if (this.mode === 'CheckBox' && this.showSelectAll) {
                const args = {
                    value: state ? 'check' : 'uncheck',
                    enable: this.mode === 'CheckBox',
                    module: 'CheckBoxSelection'
                };
                this.notify('checkSelectAll', args);
            }
            this.selectAllItem(state, event);
        }
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Returns the persisted data of the component.
     */
    getPersistData() {
        return this.addOnPersist(['value']);
    }
    /**
     * Dynamically change the value of properties.
     *
     * @param {MultiSelectModel} newProp - Returns the dynamic property value of the component.
     * @param {MultiSelectModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    onPropertyChanged(newProp, oldProp) {
        if (newProp.dataSource && !isNullOrUndefined(Object.keys(newProp.dataSource))
            || newProp.query && !isNullOrUndefined(Object.keys(newProp.query))) {
            if (this.resetFilteredData) {
                // The filtered data is not being reset in the component after the user focuses out.
                this.resetMainList = !this.resetMainList ? this.mainList : this.resetMainList;
                this.resetFilteredData = false;
            }
            this.mainList = null;
            this.mainData = null;
            this.isFirstClick = false;
            this.isDynamicDataChange = true;
        }
        if (this.getModuleName() === 'multiselect') {
            this.filterAction = false;
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'query':
                case 'dataSource':
                    if (this.mode === 'CheckBox' && this.showSelectAll) {
                        if (!isNullOrUndefined(this.popupObj)) {
                            this.popupObj.destroy();
                            this.popupObj = null;
                        }
                        this.renderPopup();
                    }
                    break;
                case 'htmlAttributes':
                    this.updateHTMLAttribute();
                    break;
                case 'showClearButton':
                    this.updateClearButton(newProp.showClearButton);
                    break;
                case 'text':
                    this.updateVal(this.value, this.value, 'text');
                    break;
                case 'value':
                    this.updateVal(this.value, oldProp.value, 'value');
                    this.addValidInputClass();
                    if (!this.closePopupOnSelect && this.isPopupOpen()) {
                        this.refreshPopup();
                    }
                    this.preventChange = this.isAngular && this.preventChange ? !this.preventChange : this.preventChange;
                    break;
                case 'width':
                    this.setWidth(newProp.width);
                    this.popupObj.setProperties({ width: this.calcPopupWidth() });
                    break;
                case 'placeholder':
                    this.refreshPlaceHolder();
                    break;
                case 'filterBarPlaceholder':
                    if (this.allowFiltering) {
                        this.notify('filterBarPlaceholder', { filterBarPlaceholder: newProp.filterBarPlaceholder });
                    }
                    break;
                case 'delimiterChar':
                    if (this.mode !== 'Box') {
                        this.updateDelimView();
                    }
                    this.updateData(newProp.delimiterChar);
                    break;
                case 'cssClass':
                    this.updateOldPropCssClass(oldProp.cssClass);
                    this.updateCssClass();
                    this.calculateWidth();
                    break;
                case 'enableRtl':
                    this.enableRTL(newProp.enableRtl);
                    super.onPropertyChanged(newProp, oldProp);
                    break;
                case 'readonly':
                    this.updateReadonly(newProp.readonly);
                    this.hidePopup();
                    break;
                case 'enabled':
                    this.hidePopup();
                    this.enable(newProp.enabled);
                    break;
                case 'showSelectAll':
                    if (this.popupObj) {
                        this.popupObj.destroy();
                        this.popupObj = null;
                    }
                    this.renderPopup();
                    break;
                case 'showDropDownIcon':
                    this.dropDownIcon();
                    break;
                case 'floatLabelType':
                    this.setFloatLabelType();
                    this.addValidInputClass();
                    Input.createSpanElement(this.overAllWrapper, this.createElement);
                    this.calculateWidth();
                    if (!isNullOrUndefined(this.overAllWrapper) && !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] && this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
                        this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
                    }
                    break;
                case 'enableSelectionOrder':
                    break;
                case 'selectAllText':
                    this.notify('selectAllText', false);
                    break;
                case 'popupHeight':
                    if (this.popupObj) {
                        let overAllHeight = parseInt(this.popupHeight, 10);
                        if (this.popupHeight !== 'auto') {
                            this.list.style.maxHeight = formatUnit(overAllHeight);
                            this.popupWrapper.style.maxHeight = formatUnit(this.popupHeight);
                        }
                        else {
                            this.list.style.maxHeight = formatUnit(this.popupHeight);
                        }
                    }
                    break;
                case 'headerTemplate':
                case 'footerTemplate':
                    this.reInitializePoup();
                    break;
                case 'allowFiltering':
                    if (this.mode === 'CheckBox' && this.popupObj) {
                        this.reInitializePoup();
                    }
                    this.updateSelectElementData(this.allowFiltering);
                    break;
                default:
                    {
                        // eslint-disable-next-line max-len
                        const msProps = this.getPropObject(prop, newProp, oldProp);
                        super.onPropertyChanged(msProps.newProperty, msProps.oldProperty);
                    }
                    break;
            }
        }
    }
    reInitializePoup() {
        if (this.popupObj) {
            this.popupObj.destroy();
            this.popupObj = null;
        }
        this.renderPopup();
    }
    presentItemValue(ulElement) {
        let valuecheck = [];
        for (let i = 0; i < this.value.length; i++) {
            let checkEle = this.findListElement(((this.allowFiltering && !isNullOrUndefined(this.mainList)) ? this.mainList : ulElement), 'li', 'data-value', this.value[i]);
            if (!checkEle) {
                valuecheck.push(this.value[i]);
            }
        }
        return valuecheck;
    }
    ;
    addNonPresentItems(valuecheck, ulElement, list, event) {
        this.dataSource.executeQuery(this.getForQuery(valuecheck)).then((e) => {
            if (e.result.length > 0) {
                this.addItem(e.result, list.length);
            }
            this.updateActionList(ulElement, list, event);
        });
    }
    ;
    updateVal(newProp, oldProp, prop) {
        if (!this.list) {
            this.onLoadSelect();
        }
        else if ((this.dataSource instanceof DataManager) && (!this.listData || !(this.mainList && this.mainData))) {
            this.onLoadSelect();
        }
        else {
            let valuecheck = [];
            if (!isNullOrUndefined(this.value) && !this.allowCustomValue) {
                valuecheck = this.presentItemValue(this.ulElement);
            }
            if (prop == 'value' && valuecheck.length > 0 && this.dataSource instanceof DataManager && !isNullOrUndefined(this.value)
                && this.listData != null) {
                this.mainData = null;
                this.setDynValue = true;
                this.addNonPresentItems(valuecheck, this.ulElement, this.listData);
            }
            else {
                if (prop === 'text') {
                    this.initialTextUpdate();
                    newProp = this.value;
                }
                if (isNullOrUndefined(this.value) || this.value.length === 0) {
                    this.tempValues = oldProp;
                }
                // eslint-disable-next-line
                if (this.allowCustomValue && (this.mode === 'Default' || this.mode === 'Box') && this.isReact && this.inputFocus
                    && this.isPopupOpen() && this.mainData !== this.listData) {
                    const list = this.mainList.cloneNode ? this.mainList.cloneNode(true) : this.mainList;
                    this.onActionComplete(list, this.mainData);
                }
                this.initialValueUpdate();
                if (this.mode !== 'Box' && !this.inputFocus) {
                    this.updateDelimView();
                }
                if (!this.inputFocus) {
                    this.refreshInputHight();
                }
                this.refreshPlaceHolder();
                if (this.mode !== 'CheckBox' && this.changeOnBlur) {
                    this.updateValueState(null, newProp, oldProp);
                }
                this.checkPlaceholderSize();
            }
        }
        if (!this.changeOnBlur) {
            this.updateValueState(null, newProp, oldProp);
        }
    }
    /**
     * Adds a new item to the multiselect popup list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the popup list.
     * @returns {void}
     */
    addItem(items, itemIndex) {
        super.addItem(items, itemIndex);
    }
    /**
     * Hides the popup, if the popup in a open state.
     *
     * @returns {void}
     */
    hidePopup(e) {
        const delay = 100;
        if (this.isPopupOpen()) {
            const animModel = {
                name: 'FadeOut',
                duration: 100,
                delay: delay ? delay : 0
            };
            const eventArgs = { popup: this.popupObj, cancel: false, animation: animModel, event: e || null };
            this.trigger('close', eventArgs, (eventArgs) => {
                if (!eventArgs.cancel) {
                    if (this.fields.groupBy && this.mode !== 'CheckBox' && this.fixedHeaderElement) {
                        remove(this.fixedHeaderElement);
                        this.fixedHeaderElement = null;
                    }
                    this.beforePopupOpen = false;
                    this.overAllWrapper.classList.remove(iconAnimation);
                    this.popupObj.hide(new Animation(eventArgs.animation));
                    attributes(this.inputElement, { 'aria-expanded': 'false' });
                    this.inputElement.removeAttribute('aria-owns');
                    this.inputElement.removeAttribute('aria-activedescendant');
                    if (this.allowFiltering) {
                        this.notify('inputFocus', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox', value: 'clear' });
                    }
                    this.popupObj.hide();
                    removeClass([document.body, this.popupObj.element], 'e-popup-full-page');
                    EventHandler.remove(this.list, 'keydown', this.onKeyDown);
                }
            });
        }
    }
    /**
     * Shows the popup, if the popup in a closed state.
     *
     * @returns {void}
     */
    showPopup(e) {
        if (!this.enabled) {
            return;
        }
        const args = { cancel: false };
        this.trigger('beforeOpen', args, (args) => {
            if (!args.cancel) {
                if (!this.ulElement) {
                    this.beforePopupOpen = true;
                    super.render(e);
                    if (this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering) {
                        this.notify('popupFullScreen', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                    }
                    return;
                }
                if (this.mode === 'CheckBox' && Browser.isDevice && this.allowFiltering) {
                    this.notify('popupFullScreen', { module: 'CheckBoxSelection', enable: this.mode === 'CheckBox' });
                }
                const mainLiLength = this.ulElement.querySelectorAll('li.' + 'e-list-item').length;
                const liLength = this.ulElement.querySelectorAll('li.'
                    + dropDownBaseClasses.li + '.' + HIDE_LIST).length;
                if (mainLiLength > 0 && (mainLiLength === liLength) && (liLength === this.mainData.length) && !(this.targetElement() !== '' && this.allowCustomValue)) {
                    this.beforePopupOpen = false;
                    return;
                }
                this.onPopupShown(e);
            }
        });
    }
    /**
     * Based on the state parameter, entire list item will be selected/deselected.
     * parameter
     * `true`   - Selects entire list items.
     * `false`  - Un Selects entire list items.
     *
     * @param {boolean} state - if it’s true then Selects the entire list items. If it’s false the Unselects entire list items.
     * @returns {void}
     */
    selectAll(state) {
        this.isSelectAll = true;
        this.selectAllItems(state);
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'multiselect';
    }
    /**
     * Allows you to clear the selected values from the Multiselect component.
     *
     * @returns {void}
     */
    clear() {
        this.selectAll(false);
        if (this.value && this.value.length) {
            setTimeout(() => {
                this.setProperties({ value: null }, true);
            }, 0);
        }
        else {
            this.setProperties({ value: null }, true);
        }
    }
    /**
     * To Initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    render() {
        this.setDynValue = this.initStatus = false;
        this.isSelectAll = false;
        this.selectAllEventEle = [];
        this.searchWrapper = this.createElement('span', { className: SEARCHBOX_WRAPPER + ' ' + ((this.mode === 'Box') ? BOX_ELEMENT : '') });
        this.viewWrapper = this.createElement('span', { className: DELIMITER_VIEW + ' ' + DELIMITER_WRAPPER, styles: 'display:none;' });
        this.overAllClear = this.createElement('span', {
            className: CLOSEICON_CLASS$1, styles: 'display:none;'
        });
        this.componentWrapper = this.createElement('div', { className: ELEMENT_WRAPPER });
        this.overAllWrapper = this.createElement('div', { className: OVER_ALL_WRAPPER });
        if (this.mode === 'CheckBox') {
            addClass([this.overAllWrapper], 'e-checkbox');
        }
        if (Browser.isDevice) {
            this.componentWrapper.classList.add(ELEMENT_MOBILE_WRAPPER);
        }
        this.setWidth(this.width);
        this.overAllWrapper.appendChild(this.componentWrapper);
        this.popupWrapper = this.createElement('div', { id: this.element.id + '_popup', className: POPUP_WRAPPER });
        if (this.mode === 'Delimiter' || this.mode === 'CheckBox') {
            this.delimiterWrapper = this.createElement('span', { className: DELIMITER_WRAPPER, styles: 'display:none' });
            this.componentWrapper.appendChild(this.delimiterWrapper);
        }
        else {
            this.chipCollectionWrapper = this.createElement('span', {
                className: CHIP_WRAPPER$1,
                styles: 'display:none'
            });
            if (this.mode === 'Default') {
                this.chipCollectionWrapper.setAttribute('id', getUniqueID('chip_default'));
            }
            else if (this.mode === 'Box') {
                this.chipCollectionWrapper.setAttribute('id', getUniqueID('chip_box'));
            }
            this.componentWrapper.appendChild(this.chipCollectionWrapper);
        }
        if (this.mode !== 'Box') {
            this.componentWrapper.appendChild(this.viewWrapper);
        }
        this.componentWrapper.appendChild(this.searchWrapper);
        if (this.showClearButton && !Browser.isDevice) {
            this.componentWrapper.appendChild(this.overAllClear);
        }
        else {
            this.componentWrapper.classList.add(CLOSE_ICON_HIDE);
        }
        this.dropDownIcon();
        this.inputElement = this.createElement('input', {
            className: INPUT_ELEMENT,
            attrs: {
                spellcheck: 'false',
                type: 'text',
                autocomplete: 'off',
                tabindex: '0',
                role: 'combobox'
            }
        });
        if (this.mode === 'Default' || this.mode === 'Box') {
            this.inputElement.setAttribute('aria-labelledby', this.chipCollectionWrapper.id);
        }
        if (this.element.tagName !== this.getNgDirective()) {
            this.element.style.display = 'none';
        }
        if (this.element.tagName === this.getNgDirective()) {
            this.element.appendChild(this.overAllWrapper);
            this.searchWrapper.appendChild(this.inputElement);
        }
        else {
            this.element.parentElement.insertBefore(this.overAllWrapper, this.element);
            this.searchWrapper.appendChild(this.inputElement);
            this.searchWrapper.appendChild(this.element);
            this.element.removeAttribute('tabindex');
        }
        if (this.floatLabelType !== 'Never') {
            createFloatLabel(this.overAllWrapper, this.searchWrapper, this.element, this.inputElement, this.value, this.floatLabelType, this.placeholder);
        }
        else if (this.floatLabelType === 'Never') {
            this.refreshPlaceHolder();
        }
        this.addValidInputClass();
        this.element.style.opacity = '';
        const id = this.element.getAttribute('id') ? this.element.getAttribute('id') : getUniqueID('ej2_dropdownlist');
        this.element.id = id;
        this.hiddenElement = this.createElement('select', {
            attrs: { 'aria-hidden': 'true', 'class': HIDDEN_ELEMENT, 'tabindex': '-1', 'multiple': '' }
        });
        this.componentWrapper.appendChild(this.hiddenElement);
        this.validationAttribute(this.element, this.hiddenElement);
        if (this.mode !== 'CheckBox') {
            this.hideOverAllClear();
        }
        if (!isNullOrUndefined(closest(this.element, "fieldset")) && closest(this.element, "fieldset").disabled) {
            this.enabled = false;
        }
        this.wireEvent();
        this.enable(this.enabled);
        this.enableRTL(this.enableRtl);
        this.checkInitialValue();
        if (this.element.hasAttribute('data-val')) {
            this.element.setAttribute('data-val', 'false');
        }
        Input.createSpanElement(this.overAllWrapper, this.createElement);
        this.calculateWidth();
        if (!isNullOrUndefined(this.overAllWrapper) && !isNullOrUndefined(this.overAllWrapper.getElementsByClassName('e-ddl-icon')[0] && this.overAllWrapper.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never')) {
            this.overAllWrapper.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
        }
        this.renderComplete();
    }
    checkInitialValue() {
        const isData = this.dataSource instanceof Array ? (this.dataSource.length > 0)
            : !isNullOrUndefined(this.dataSource);
        if (!(this.value && this.value.length) &&
            isNullOrUndefined(this.text) &&
            !isData &&
            this.element.tagName === 'SELECT' &&
            this.element.options.length > 0) {
            const optionsElement = this.element.options;
            const valueCol = [];
            let textCol = '';
            for (let index = 0, optionsLen = optionsElement.length; index < optionsLen; index++) {
                const opt = optionsElement[index];
                if (!isNullOrUndefined(opt.getAttribute('selected'))) {
                    if (opt.getAttribute('value')) {
                        valueCol.push(opt.getAttribute('value'));
                    }
                    else {
                        textCol += (opt.text + this.delimiterChar);
                    }
                }
            }
            if (valueCol.length > 0) {
                this.setProperties({ value: valueCol }, true);
            }
            else if (textCol !== '') {
                this.setProperties({ text: textCol }, true);
            }
            if (valueCol.length > 0 || textCol !== '') {
                this.refreshInputHight();
                this.refreshPlaceHolder();
            }
        }
        if ((this.value && this.value.length) || !isNullOrUndefined(this.text)) {
            if (!this.list) {
                super.render();
            }
        }
        if (!isNullOrUndefined(this.text) && (isNullOrUndefined(this.value) || this.value.length === 0)) {
            this.initialTextUpdate();
        }
        if (this.value && this.value.length) {
            if (!(this.dataSource instanceof DataManager)) {
                this.initialValueUpdate();
                this.initialUpdate();
            }
            else {
                this.setInitialValue = () => {
                    this.initStatus = false;
                    this.initialValueUpdate();
                    this.initialUpdate();
                    this.setInitialValue = null;
                    this.initStatus = true;
                };
            }
            this.updateTempValue();
        }
        else {
            this.initialUpdate();
        }
        this.initStatus = true;
        this.checkAutoFocus();
        if (!isNullOrUndefined(this.text)) {
            this.element.setAttribute('data-initial-value', this.text);
        }
    }
    checkAutoFocus() {
        if (this.element.hasAttribute('autofocus')) {
            this.inputElement.focus();
        }
    }
    setFloatLabelType() {
        removeFloating(this.overAllWrapper, this.componentWrapper, this.searchWrapper, this.inputElement, this.value, this.floatLabelType, this.placeholder);
        if (this.floatLabelType !== 'Never') {
            createFloatLabel(this.overAllWrapper, this.searchWrapper, this.element, this.inputElement, this.value, this.floatLabelType, this.placeholder);
        }
    }
    addValidInputClass() {
        if (!isNullOrUndefined(this.overAllWrapper)) {
            if ((!isNullOrUndefined(this.value) && this.value.length) || this.floatLabelType === 'Always') {
                addClass([this.overAllWrapper], 'e-valid-input');
            }
            else {
                removeClass([this.overAllWrapper], 'e-valid-input');
            }
        }
    }
    dropDownIcon() {
        if (this.showDropDownIcon) {
            this.dropIcon = this.createElement('span', { className: dropdownIcon });
            this.componentWrapper.appendChild(this.dropIcon);
            addClass([this.componentWrapper], ['e-down-icon']);
        }
        else {
            if (!isNullOrUndefined(this.dropIcon)) {
                this.dropIcon.parentElement.removeChild(this.dropIcon);
                removeClass([this.componentWrapper], ['e-down-icon']);
            }
        }
    }
    initialUpdate() {
        if (this.mode !== 'Box' && !(this.setDynValue && this.mode === 'Default' && this.inputFocus)) {
            this.updateDelimView();
        }
        this.updateCssClass();
        this.updateHTMLAttribute();
        this.updateReadonly(this.readonly);
        this.refreshInputHight();
        this.checkPlaceholderSize();
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers. Also it removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        // eslint-disable-next-line
        if (this.isReact) {
            this.clearTemplate();
        }
        if (this.popupObj) {
            this.popupObj.hide();
        }
        this.notify(destroy, {});
        this.unwireListEvents();
        this.unWireEvent();
        this.list = null;
        this.popupObj = null;
        this.mainList = null;
        this.mainData = null;
        this.filterParent = null;
        this.ulElement = null;
        this.mainListCollection = null;
        super.destroy();
        const temp = ['readonly', 'aria-disabled', 'placeholder'];
        let length = temp.length;
        if (!isNullOrUndefined(this.inputElement)) {
            while (length > 0) {
                this.inputElement.removeAttribute(temp[length - 1]);
                length--;
            }
        }
        if (!isNullOrUndefined(this.element)) {
            this.element.removeAttribute('data-initial-value');
            this.element.style.display = 'block';
        }
        if (this.overAllWrapper && this.overAllWrapper.parentElement) {
            if (this.overAllWrapper.parentElement.tagName === this.getNgDirective()) {
                remove(this.overAllWrapper);
            }
            else {
                this.overAllWrapper.parentElement.insertBefore(this.element, this.overAllWrapper);
                remove(this.overAllWrapper);
            }
        }
        this.componentWrapper = null;
        this.overAllClear = null;
        this.overAllWrapper = null;
        this.hiddenElement = null;
        this.searchWrapper = null;
        this.viewWrapper = null;
        this.chipCollectionWrapper = null;
        this.targetInputElement = null;
        this.popupWrapper = null;
        this.inputElement = null;
        this.delimiterWrapper = null;
        this.popupObj = null;
        this.popupWrapper = null;
        this.liCollections = null;
        this.header = null;
        this.mainList = null;
        this.mainListCollection = null;
        this.footer = null;
        this.selectAllEventEle = null;
    }
};
__decorate$5([
    Complex({ text: null, value: null, iconCss: null, groupBy: null }, FieldSettings)
], MultiSelect.prototype, "fields", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "enablePersistence", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "groupTemplate", void 0);
__decorate$5([
    Property('No records found')
], MultiSelect.prototype, "noRecordsTemplate", void 0);
__decorate$5([
    Property('Request failed')
], MultiSelect.prototype, "actionFailureTemplate", void 0);
__decorate$5([
    Property('None')
], MultiSelect.prototype, "sortOrder", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "enabled", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "enableHtmlSanitizer", void 0);
__decorate$5([
    Property([])
], MultiSelect.prototype, "dataSource", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "query", void 0);
__decorate$5([
    Property('StartsWith')
], MultiSelect.prototype, "filterType", void 0);
__decorate$5([
    Property(1000)
], MultiSelect.prototype, "zIndex", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "ignoreAccent", void 0);
__decorate$5([
    Property()
], MultiSelect.prototype, "locale", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "enableGroupCheckBox", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "cssClass", void 0);
__decorate$5([
    Property('100%')
], MultiSelect.prototype, "width", void 0);
__decorate$5([
    Property('300px')
], MultiSelect.prototype, "popupHeight", void 0);
__decorate$5([
    Property('100%')
], MultiSelect.prototype, "popupWidth", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "placeholder", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "filterBarPlaceholder", void 0);
__decorate$5([
    Property({})
], MultiSelect.prototype, "htmlAttributes", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "valueTemplate", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "headerTemplate", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "footerTemplate", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "itemTemplate", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "allowFiltering", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "changeOnBlur", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "allowCustomValue", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "showClearButton", void 0);
__decorate$5([
    Property(1000)
], MultiSelect.prototype, "maximumSelectionLength", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "readonly", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "text", void 0);
__decorate$5([
    Property(null)
], MultiSelect.prototype, "value", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "hideSelectedItem", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "closePopupOnSelect", void 0);
__decorate$5([
    Property('Default')
], MultiSelect.prototype, "mode", void 0);
__decorate$5([
    Property(',')
], MultiSelect.prototype, "delimiterChar", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "ignoreCase", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "showDropDownIcon", void 0);
__decorate$5([
    Property('Never')
], MultiSelect.prototype, "floatLabelType", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "showSelectAll", void 0);
__decorate$5([
    Property('Select All')
], MultiSelect.prototype, "selectAllText", void 0);
__decorate$5([
    Property('Unselect All')
], MultiSelect.prototype, "unSelectAllText", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "enableSelectionOrder", void 0);
__decorate$5([
    Property(true)
], MultiSelect.prototype, "openOnClick", void 0);
__decorate$5([
    Property(false)
], MultiSelect.prototype, "addTagOnBlur", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "change", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "removing", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "removed", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "beforeSelectAll", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "selectedAll", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "beforeOpen", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "open", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "close", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "blur", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "focus", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "chipSelection", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "filtering", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "tagging", void 0);
__decorate$5([
    Event()
], MultiSelect.prototype, "customValueSelection", void 0);
MultiSelect = __decorate$5([
    NotifyPropertyChanges
], MultiSelect);

const ICON = 'e-icons';
const CHECKBOXFRAME$1 = 'e-frame';
const CHECK$1 = 'e-check';
const CHECKBOXWRAP$1 = 'e-checkbox-wrapper';
const INDETERMINATE = 'e-stop';
const checkAllParent = 'e-selectall-parent';
const searchBackIcon = 'e-input-group-icon e-back-icon e-icons';
const filterBarClearIcon = 'e-input-group-icon e-clear-icon e-icons';
const filterInput = 'e-input-filter';
const filterParent = 'e-filter-parent';
const mobileFilter = 'e-ddl-device-filter';
const clearIcon = 'e-clear-icon';
const popupFullScreen = 'e-popup-full-page';
const device = 'e-ddl-device';
const FOCUS$1 = 'e-input-focus';
/**
 * The Multiselect enable CheckBoxSelection call this inject module.
 */
class CheckBoxSelection {
    constructor(parent) {
        this.activeLi = [];
        this.activeEle = [];
        this.parent = parent;
        this.removeEventListener();
        this.addEventListener();
    }
    getModuleName() {
        return 'CheckBoxSelection';
    }
    addEventListener() {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on('updatelist', this.listSelection, this);
        this.parent.on('listoption', this.listOption, this);
        this.parent.on('selectAll', this.setSelectAll, this);
        this.parent.on('checkSelectAll', this.checkSelectAll, this);
        this.parent.on('searchBox', this.setSearchBox, this);
        this.parent.on('blur', this.onBlurHandler, this);
        this.parent.on('targetElement', this.targetElement, this);
        this.parent.on('deviceSearchBox', this.setDeviceSearchBox, this);
        this.parent.on('inputFocus', this.getFocus, this);
        this.parent.on('reOrder', this.setReorder, this);
        this.parent.on('activeList', this.getActiveList, this);
        this.parent.on('selectAllText', this.setLocale, this);
        this.parent.on('filterBarPlaceholder', this.setPlaceholder, this);
        EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
        this.parent.on('addItem', this.checboxCreate, this);
        this.parent.on('popupFullScreen', this.setPopupFullScreen, this);
    }
    removeEventListener() {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('updatelist', this.listSelection);
        this.parent.off('listoption', this.listOption);
        this.parent.off('selectAll', this.setSelectAll);
        this.parent.off('checkSelectAll', this.checkSelectAll);
        this.parent.off('searchBox', this.setSearchBox);
        this.parent.off('blur', this.onBlurHandler);
        this.parent.off('targetElement', this.targetElement);
        this.parent.off('deviceSearchBox', this.setDeviceSearchBox);
        this.parent.off('inputFocus', this.getFocus);
        this.parent.off('reOrder', this.setReorder);
        this.parent.off('activeList', this.getActiveList);
        this.parent.off('selectAllText', this.setLocale);
        this.parent.off('filterBarPlaceholder', this.setPlaceholder);
        this.parent.off('addItem', this.checboxCreate);
        this.parent.off('popupFullScreen', this.setPopupFullScreen);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    listOption(args) {
        if (isNullOrUndefined(this.parent.listCurrentOptions.itemCreated)) {
            this.parent.listCurrentOptions.itemCreated = (e) => {
                this.checboxCreate(e);
            };
        }
        else {
            const itemCreated = this.parent.listCurrentOptions.itemCreated;
            this.parent.listCurrentOptions.itemCreated = (e) => {
                this.checboxCreate(e);
                itemCreated.apply(this, [e]);
            };
        }
    }
    setPlaceholder(props) {
        Input.setPlaceholder(props.filterBarPlaceholder, this.filterInput);
    }
    checboxCreate(e) {
        let item;
        if (!isNullOrUndefined(e.item)) {
            item = e.item;
        }
        else {
            item = e;
        }
        if (this.parent.enableGroupCheckBox || (item.className !== 'e-list-group-item '
            && item.className !== 'e-list-group-item')) {
            const checkboxEle = createCheckBox(this.parent.createElement, true);
            const icon = select('div.' + ICON, item);
            item.insertBefore(checkboxEle, item.childNodes[isNullOrUndefined(icon) ? 0 : 1]);
            select('.' + CHECKBOXFRAME$1, checkboxEle);
            if (this.parent.enableGroupCheckBox) {
                this.parent.popupWrapper.classList.add('e-multiselect-group');
            }
            return item;
        }
        else {
            return item;
        }
    }
    setSelectAll() {
        if (this.parent.showSelectAll) {
            if (isNullOrUndefined(this.checkAllParent)) {
                this.checkAllParent = this.parent.createElement('div', {
                    className: checkAllParent
                });
                this.selectAllSpan = this.parent.createElement('span', {
                    className: 'e-all-text'
                });
                this.selectAllSpan.textContent = '';
                this.checkAllParent.appendChild(this.selectAllSpan);
                this.setLocale();
                this.checboxCreate(this.checkAllParent);
                if (this.parent.headerTemplate) {
                    if (!isNullOrUndefined(this.parent.filterParent)) {
                        append([this.checkAllParent], this.parent.filterParent);
                    }
                    else {
                        append([this.checkAllParent], this.parent.popupWrapper);
                    }
                }
                if (!this.parent.headerTemplate) {
                    if (!isNullOrUndefined(this.parent.filterParent)) {
                        this.parent.filterParent.parentNode.insertBefore(this.checkAllParent, this.parent.filterParent.nextSibling);
                    }
                    else {
                        prepend([this.checkAllParent], this.parent.popupWrapper);
                    }
                }
                EventHandler.add(this.checkAllParent, 'mousedown', this.clickHandler, this);
            }
            if (this.parent.list.classList.contains('e-nodata') || (this.parent.listData && this.parent.listData.length <= 1 &&
                !(this.parent.isDynamicDataChange)) || (this.parent.isDynamicDataChange &&
                this.parent.listData && this.parent.listData.length <= 1)) {
                this.checkAllParent.style.display = 'none';
            }
            else {
                this.checkAllParent.style.display = 'block';
            }
            this.parent.selectAllHeight = this.checkAllParent.getBoundingClientRect().height;
        }
        else if (!isNullOrUndefined(this.checkAllParent)) {
            this.checkAllParent.parentElement.removeChild(this.checkAllParent);
            this.checkAllParent = null;
        }
    }
    destroy() {
        this.removeEventListener();
        EventHandler.remove(document, 'mousedown', this.onDocumentClick);
        this.checkAllParent = null;
        this.clearIconElement = null;
        this.filterInput = null;
        this.filterInputObj = null;
        this.checkWrapper = null;
        this.selectAllSpan = null;
    }
    listSelection(args) {
        let target;
        if (!isNullOrUndefined(args.e)) {
            const frameElm = args.li.querySelector('.e-checkbox-wrapper .e-frame');
            target = !isNullOrUndefined(args.e.target) ?
                (args.e.target.classList.contains('e-frame')
                    && (!this.parent.showSelectAll
                        || (this.checkAllParent && !this.checkAllParent.contains(args.e.target)))) ?
                    args.e.target : args.li.querySelector('.e-checkbox-wrapper').childNodes[1]
                : args.li.querySelector('.e-checkbox-wrapper').childNodes[1];
        }
        else {
            const checkboxWrapper = args.li.querySelector('.e-checkbox-wrapper');
            target = checkboxWrapper ? checkboxWrapper.childNodes[1] : args.li.lastElementChild.childNodes[1];
        }
        if (this.parent.itemTemplate || this.parent.enableGroupCheckBox) {
            target = args.li.firstElementChild.childNodes[1];
        }
        if (!isNullOrUndefined(target)) {
            this.checkWrapper = closest(target, '.' + CHECKBOXWRAP$1);
        }
        if (!isNullOrUndefined(this.checkWrapper)) {
            const checkElement = select('.' + CHECKBOXFRAME$1, this.checkWrapper);
            const selectAll$$1 = false;
            this.validateCheckNode(this.checkWrapper, checkElement.classList.contains(CHECK$1), args.li, args.e, selectAll$$1);
        }
    }
    validateCheckNode(checkWrap, isCheck, li, e, selectAll$$1) {
        this.changeState(checkWrap, isCheck ? 'uncheck' : 'check', e, true, selectAll$$1);
    }
    clickHandler(e) {
        let target;
        if (e.currentTarget.classList.contains(this.checkAllParent.className)) {
            target = e.currentTarget.firstElementChild.lastElementChild;
        }
        else {
            target = e.currentTarget;
        }
        this.checkWrapper = closest(target, '.' + CHECKBOXWRAP$1);
        const selectAll$$1 = true;
        if (!isNullOrUndefined(this.checkWrapper)) {
            const checkElement = select('.' + CHECKBOXFRAME$1, this.checkWrapper);
            this.validateCheckNode(this.checkWrapper, checkElement.classList.contains(CHECK$1), null, e, selectAll$$1);
        }
        e.preventDefault();
    }
    changeState(wrapper, state, e, isPrevent, selectAll$$1) {
        const frameSpan = wrapper.getElementsByClassName(CHECKBOXFRAME$1)[0];
        if (state === 'check' && !frameSpan.classList.contains(CHECK$1)) {
            frameSpan.classList.remove(INDETERMINATE);
            frameSpan.classList.add(CHECK$1);
            if (selectAll$$1) {
                this.parent.selectAllItems(true, e);
                this.setLocale(true);
            }
        }
        else if (state === 'uncheck' && (frameSpan.classList.contains(CHECK$1) || frameSpan.classList.contains(INDETERMINATE))) {
            removeClass([frameSpan], [CHECK$1, INDETERMINATE]);
            if (selectAll$$1) {
                this.parent.selectAllItems(false, e);
                this.setLocale();
            }
        }
        else if (state === 'indeterminate' && !(frameSpan.classList.contains(INDETERMINATE))) {
            removeClass([frameSpan], [CHECK$1]);
            frameSpan.classList.add(INDETERMINATE);
            if (selectAll$$1) {
                this.parent.selectAllItems(false, e);
                this.setLocale();
            }
        }
    }
    setSearchBox(args) {
        if (isNullOrUndefined(this.parent.filterParent)) {
            this.parent.filterParent = this.parent.createElement('span', {
                className: filterParent
            });
            this.filterInput = this.parent.createElement('input', {
                attrs: { type: 'text' },
                className: filterInput
            });
            this.parent.element.parentNode.insertBefore(this.filterInput, this.parent.element);
            let backIcon = false;
            if (Browser.isDevice) {
                backIcon = true;
                this.parent.mobFilter = false;
            }
            this.filterInputObj = Input.createInput({
                element: this.filterInput,
                buttons: backIcon ? [searchBackIcon, filterBarClearIcon] : [filterBarClearIcon],
                properties: { placeholder: this.parent.filterBarPlaceholder }
            }, this.parent.createElement);
            if (!isNullOrUndefined(this.parent.cssClass)) {
                if (this.parent.cssClass.split(' ').indexOf('e-outline') !== -1) {
                    addClass([this.filterInputObj.container], 'e-outline');
                }
                else if (this.parent.cssClass.split(' ').indexOf('e-filled') !== -1) {
                    addClass([this.filterInputObj.container], 'e-filled');
                }
            }
            append([this.filterInputObj.container], this.parent.filterParent);
            prepend([this.parent.filterParent], args.popupElement);
            attributes(this.filterInput, {
                'aria-disabled': 'false',
                'role': 'combobox',
                'autocomplete': 'off',
                'autocapitalize': 'off',
                'spellcheck': 'false'
            });
            this.clearIconElement = this.filterInput.parentElement.querySelector('.' + clearIcon);
            if (!Browser.isDevice && this.clearIconElement) {
                EventHandler.add(this.clearIconElement, 'mousedown', this.clearText, this);
                this.clearIconElement.style.visibility = 'hidden';
            }
            EventHandler.add(this.filterInput, 'input', this.parent.onInput, this.parent);
            EventHandler.add(this.filterInput, 'keyup', this.parent.keyUp, this.parent);
            EventHandler.add(this.filterInput, 'keydown', this.parent.onKeyDown, this.parent);
            EventHandler.add(this.filterInput, 'blur', this.onBlurHandler, this);
            EventHandler.add(this.filterInput, 'paste', this.parent.pasteHandler, this.parent);
            this.parent.searchBoxHeight = (this.filterInputObj.container.parentElement).getBoundingClientRect().height;
            return this.filterInputObj;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clickOnBackIcon(e) {
        this.parent.hidePopup();
        removeClass([document.body, this.parent.popupObj.element], popupFullScreen);
        this.parent.inputElement.focus();
    }
    clearText(e) {
        this.parent.targetInputElement.value = '';
        if (this.parent.allowFiltering && this.parent.targetInputElement.value === '') {
            this.parent.search(null);
        }
        this.parent.refreshPopup();
        this.parent.refreshListItems(null);
        this.clearIconElement.style.visibility = 'hidden';
        this.filterInput.focus();
        this.setReorder(e);
        e.preventDefault();
    }
    setDeviceSearchBox() {
        this.parent.popupObj.element.classList.add(device);
        this.parent.popupObj.element.classList.add(mobileFilter);
        this.parent.popupObj.position = { X: 0, Y: 0 };
        this.parent.popupObj.dataBind();
        this.setSearchBoxPosition();
        this.backIconElement = this.filterInputObj.container.querySelector('.e-back-icon');
        this.clearIconElement = this.filterInputObj.container.querySelector('.' + clearIcon);
        this.clearIconElement.style.visibility = 'hidden';
        EventHandler.add(this.backIconElement, 'click', this.clickOnBackIcon, this);
        EventHandler.add(this.clearIconElement, 'click', this.clearText, this);
    }
    setSearchBoxPosition() {
        const searchBoxHeight = this.filterInput.parentElement.getBoundingClientRect().height;
        let selectAllHeight = 0;
        if (this.checkAllParent) {
            selectAllHeight = this.checkAllParent.getBoundingClientRect().height;
        }
        this.parent.popupObj.element.style.maxHeight = '100%';
        this.parent.popupObj.element.style.width = '100%';
        this.parent.list.style.maxHeight = (window.innerHeight - searchBoxHeight - selectAllHeight) + 'px';
        this.parent.list.style.height = (window.innerHeight - searchBoxHeight - selectAllHeight) + 'px';
        const clearElement = this.filterInput.parentElement.querySelector('.' + clearIcon);
        detach(this.filterInput);
        clearElement.parentElement.insertBefore(this.filterInput, clearElement);
    }
    setPopupFullScreen() {
        attributes(this.parent.popupObj.element, { style: 'left:0px;right:0px;top:0px;bottom:0px;' });
        addClass([document.body, this.parent.popupObj.element], popupFullScreen);
        this.parent.popupObj.element.style.maxHeight = '100%';
        this.parent.popupObj.element.style.width = '100%';
    }
    targetElement() {
        if (!isNullOrUndefined(this.clearIconElement)) {
            this.parent.targetInputElement = this.filterInput;
            this.clearIconElement.style.visibility = this.parent.targetInputElement.value === '' ? 'hidden' : 'visible';
        }
        return this.parent.targetInputElement.value;
    }
    onBlurHandler(e) {
        if (!this.parent.element.classList.contains('e-listbox')) {
            let target;
            if (this.parent.keyAction) {
                return;
            }
            if (Browser.isIE) {
                target = !isNullOrUndefined(e) && e.target;
            }
            if (!Browser.isIE) {
                target = !isNullOrUndefined(e) && e.relatedTarget;
            }
            // eslint-disable-next-line max-len
            if (this.parent.popupObj && document.body.contains(this.parent.popupObj.element) && this.parent.popupObj.element.contains(target)
                && !Browser.isIE && this.filterInput) {
                this.filterInput.focus();
                return;
            }
            if (this.parent.scrollFocusStatus && this.filterInput) {
                e.preventDefault();
                this.filterInput.focus();
                this.parent.scrollFocusStatus = false;
                return;
            }
            if (this.parent.popupObj && document.body.contains(this.parent.popupObj.element)
                && !this.parent.popupObj.element.classList.contains('e-popup-close')) {
                this.parent.inputFocus = false;
                this.parent.updateValueState(e, this.parent.value, this.parent.tempValues);
                this.parent.dispatchEvent(this.parent.hiddenElement, 'change');
            }
            if (this.parent.popupObj && document.body.contains(this.parent.popupObj.element) &&
                !this.parent.popupObj.element.classList.contains('e-popup-close')) {
                this.parent.inputFocus = false;
                this.parent.overAllWrapper.classList.remove(FOCUS$1);
                this.parent.trigger('blur');
                this.parent.focused = true;
            }
            if (this.parent.popupObj && document.body.contains(this.parent.popupObj.element) &&
                !this.parent.popupObj.element.classList.contains('e-popup-close') && !Browser.isDevice) {
                this.parent.hidePopup();
            }
        }
    }
    onDocumentClick(e) {
        if (this.parent.getLocaleName() !== 'listbox') {
            const target = e.target;
            if (!isNullOrUndefined(this.parent.popupObj) && closest(target, '[id="' + this.parent.popupObj.element.id + '"]')) {
                if (!(this.filterInput && this.filterInput.value !== '')) {
                    e.preventDefault();
                }
            }
            if (!(!isNullOrUndefined(this.parent.popupObj) && closest(target, '[id="' + this.parent.popupObj.element.id + '"]'))
                && !isNullOrUndefined(this.parent.overAllWrapper) && !this.parent.overAllWrapper.contains(e.target)) {
                if (this.parent.overAllWrapper.classList.contains(dropDownBaseClasses.focus) || this.parent.isPopupOpen()) {
                    this.parent.inputFocus = false;
                    this.parent.scrollFocusStatus = false;
                    this.parent.hidePopup();
                    this.parent.onBlurHandler(e, true);
                    this.parent.focused = true;
                }
            }
            else {
                this.parent.scrollFocusStatus = (Browser.isIE || Browser.info.name === 'edge') &&
                    (document.activeElement === this.filterInput);
            }
            if (!isNullOrUndefined(this.parent.overAllWrapper) && !this.parent.overAllWrapper.contains(e.target) && this.parent.overAllWrapper.classList.contains('e-input-focus') &&
                !this.parent.isPopupOpen()) {
                if (Browser.isIE) {
                    this.parent.onBlurHandler();
                }
                else {
                    this.parent.onBlurHandler(e);
                }
            }
            if (this.filterInput === target) {
                this.filterInput.focus();
            }
        }
    }
    getFocus(e) {
        this.parent.overAllWrapper.classList.remove(FOCUS$1);
        if (this.parent.keyAction && e.value !== 'clear' && e.value !== 'focus') {
            this.parent.keyAction = false;
            return;
        }
        if (e.value === 'focus') {
            this.filterInput.focus();
            this.parent.removeFocus();
            EventHandler.remove(this.parent.list, 'keydown', this.parent.onKeyDown);
        }
        if (e.value === 'clear') {
            this.filterInput.value = '';
            this.clearIconElement.style.visibility = 'hidden';
        }
    }
    checkSelectAll(e) {
        if (e.value === 'check') {
            this.changeState(this.checkAllParent, e.value, null, null, false);
            this.setLocale(true);
        }
        if (e.value === 'uncheck') {
            this.changeState(this.checkAllParent, e.value, null, null, false);
            this.setLocale();
        }
        if (e.value === 'indeterminate') {
            this.changeState(this.checkAllParent, e.value, null, null, false);
            this.setLocale();
        }
    }
    setLocale(unSelect) {
        if (this.parent.selectAllText !== 'Select All' || this.parent.unSelectAllText !== 'Unselect All') {
            const template = unSelect ? this.parent.unSelectAllText : this.parent.selectAllText;
            this.selectAllSpan.textContent = '';
            const compiledString = compile(template);
            const templateName = unSelect ? 'unSelectAllText' : 'selectAllText';
            for (const item of compiledString({}, this.parent, templateName, null, !this.parent.isStringTemplate)) {
                this.selectAllSpan.textContent = item.textContent;
            }
        }
        else {
            const l10nLocale = { selectAllText: 'Select All', unSelectAllText: 'Unselect All' };
            let l10n = new L10n(this.parent.getLocaleName(), {}, this.parent.locale);
            if (l10n.getConstant('selectAllText') === '') {
                l10n = new L10n('dropdowns', l10nLocale, this.parent.locale);
            }
            this.selectAllSpan.textContent = unSelect ? l10n.getConstant('unSelectAllText') : l10n.getConstant('selectAllText');
        }
    }
    getActiveList(args) {
        if (args.li.classList.contains('e-active')) {
            this.activeLi.push(args.li.cloneNode(true));
        }
        else {
            this.activeLi.splice(args.index, 1);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setReorder(args) {
        if (this.parent.enableSelectionOrder && !isNullOrUndefined(this.parent.value)) {
            const activeLiCount = this.parent.ulElement.querySelectorAll('li.e-active').length;
            let remLi;
            const ulEle = this.parent.createElement('ul', {
                className: 'e-list-parent e-ul e-reorder'
            });
            if (activeLiCount > 0) {
                const activeListItems = this.parent.ulElement.querySelectorAll('li.e-active');
                activeListItems.forEach(item => {
                    ulEle.appendChild(item);
                });
                remLi = this.parent.ulElement.querySelectorAll('li.e-active');
                addClass(remLi, 'e-reorder-hide');
                prepend([ulEle], this.parent.list);
            }
            this.parent.focusAtFirstListItem();
        }
    }
}

/**
 * export all modules from current location
 */

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ListBox_1;
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../drop-down-base/drop-down-base-model.d.ts'/>
/**
 * Defines the Selection settings of List Box.
 */
class SelectionSettings extends ChildProperty {
}
__decorate$6([
    Property('Multiple')
], SelectionSettings.prototype, "mode", void 0);
__decorate$6([
    Property(false)
], SelectionSettings.prototype, "showCheckbox", void 0);
__decorate$6([
    Property(false)
], SelectionSettings.prototype, "showSelectAll", void 0);
__decorate$6([
    Property('Left')
], SelectionSettings.prototype, "checkboxPosition", void 0);
/**
 * Defines the toolbar settings of List Box.
 */
class ToolbarSettings extends ChildProperty {
}
__decorate$6([
    Property([])
], ToolbarSettings.prototype, "items", void 0);
__decorate$6([
    Property('Right')
], ToolbarSettings.prototype, "position", void 0);
/**
 * The ListBox is a graphical user interface component used to display a list of items.
 * Users can select one or more items in the list using a checkbox or by keyboard selection.
 * It supports sorting, grouping, reordering and drag and drop of items.
 * ```html
 * <select id="listbox">
 *      <option value='1'>Badminton</option>
 *      <option value='2'>Basketball</option>
 *      <option value='3'>Cricket</option>
 *      <option value='4'>Football</option>
 *      <option value='5'>Tennis</option>
 * </select>
 * ```
 * ```typescript
 * <script>
 *   var listObj = new ListBox();
 *   listObj.appendTo("#listbox");
 * </script>
 * ```
 */
let ListBox = ListBox_1 = class ListBox extends DropDownBase {
    /**
     * Constructor for creating the ListBox component.
     *
     * @param {ListBoxModel} options - Specifies ListBox model
     * @param {string | HTMLElement} element - Specifies the element.
     */
    constructor(options, element) {
        super(options, element);
        this.isValidKey = false;
        this.isDataSourceUpdate = false;
        this.keyDownStatus = false;
    }
    /**
     * Adds a new item to the popup list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param  { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the popup list.
     * @returns {void}.
     * @private
     */
    addItem(items, itemIndex) {
        super.addItem(items, itemIndex);
    }
    /**
     * Build and render the component.
     *
     * @private
     * @returns {void}
     */
    render() {
        this.inputString = '';
        this.initLoad = true;
        this.isCustomFiltering = false;
        this.initialSelectedOptions = this.value;
        super.render();
        this.setEnabled();
        this.renderComplete();
    }
    initWrapper() {
        const hiddenSelect = this.createElement('select', { className: 'e-hidden-select', attrs: { 'multiple': '' } });
        hiddenSelect.style.visibility = 'hidden';
        this.list.classList.add('e-listbox-wrapper');
        if (this.itemTemplate) {
            this.list.classList.add('e-list-template');
        }
        this.list.classList.add('e-wrapper');
        this.list.classList.add('e-lib');
        if (this.element.tagName === 'EJS-LISTBOX') {
            this.element.setAttribute('tabindex', '0');
            if (this.initLoad) {
                this.element.appendChild(this.list);
            }
        }
        else {
            if (this.initLoad) {
                this.element.parentElement.insertBefore(this.list, this.element);
            }
            this.list.insertBefore(this.element, this.list.firstChild);
            this.element.style.display = 'none';
        }
        this.list.insertBefore(hiddenSelect, this.list.firstChild);
        if (this.list.getElementsByClassName('e-list-item')[0]) {
            this.list.getElementsByClassName('e-list-item')[0].classList.remove(dropDownBaseClasses.focus);
        }
        if (this.itemTemplate) {
            this.renderReactTemplates();
        }
        removeClass([this.list], [dropDownBaseClasses.content, dropDownBaseClasses.root]);
        this.validationAttribute(this.element, hiddenSelect);
        this.list.setAttribute('role', 'listbox');
        attributes(this.list, { 'role': 'listbox', 'aria-label': 'listbox', 'aria-multiselectable': this.selectionSettings.mode === 'Multiple' ? 'true' : 'false' });
        this.updateSelectionSettings();
    }
    updateSelectionSettings() {
        if (this.selectionSettings.showCheckbox && this.selectionSettings.showSelectAll && this.liCollections.length) {
            const l10nSelect = new L10n(this.getModuleName(), { selectAllText: 'Select All', unSelectAllText: 'Unselect All' }, this.locale);
            this.showSelectAll = true;
            this.selectAllText = l10nSelect.getConstant('selectAllText');
            this.unSelectAllText = l10nSelect.getConstant('unSelectAllText');
            this.popupWrapper = this.list;
            this.checkBoxSelectionModule.checkAllParent = null;
            this.notify('selectAll', {});
        }
    }
    initDraggable() {
        if (this.ulElement) {
            this.ulElement.id = this.element.id + '_parent';
        }
        if (this.allowDragAndDrop) {
            new Sortable(this.ulElement, {
                scope: this.scope,
                itemClass: 'e-list-item',
                dragStart: this.triggerDragStart.bind(this),
                drag: this.triggerDrag.bind(this),
                beforeDrop: this.beforeDragEnd.bind(this),
                drop: this.dragEnd.bind(this),
                placeHolder: () => { return this.createElement('span', { className: 'e-placeholder' }); },
                helper: (e) => {
                    const wrapper = this.list.cloneNode();
                    const ele = e.sender.cloneNode(true);
                    wrapper.appendChild(ele);
                    const refEle = this.getItems()[0];
                    wrapper.style.width = refEle.offsetWidth + 'px';
                    wrapper.style.height = refEle.offsetHeight + 'px';
                    if ((this.value && this.value.length) > 1 && this.isSelected(ele)) {
                        ele.appendChild(this.createElement('span', {
                            className: 'e-list-badge', innerHTML: this.value.length + ''
                        }));
                    }
                    wrapper.style.zIndex = getZindexPartial(this.element) + '';
                    return wrapper;
                }
            });
        }
    }
    updateActionCompleteData(li, item, index) {
        this.jsonData.splice(index, 0, item);
    }
    initToolbar() {
        const pos = this.toolbarSettings.position;
        const prevScope = this.element.getAttribute('data-value');
        if (this.toolbarSettings.items.length) {
            const toolElem = this.createElement('div', { className: 'e-listbox-tool', attrs: { 'role': 'toolbar' } });
            const wrapper = this.createElement('div', {
                className: 'e-listboxtool-wrapper e-lib e-' + pos.toLowerCase()
            });
            this.list.parentElement.insertBefore(wrapper, this.list);
            wrapper.appendChild(pos === 'Right' ? this.list : toolElem);
            wrapper.appendChild(pos === 'Right' ? toolElem : this.list);
            this.createButtons(toolElem);
            if (!this.element.id) {
                this.element.id = getUniqueID('e-' + this.getModuleName());
            }
            if (this.scope) {
                document.querySelector(this.scope).setAttribute('data-value', this.element.id);
            }
            else {
                this.updateToolBarState();
            }
        }
        const scope = this.element.getAttribute('data-value');
        if (prevScope && scope && (prevScope !== scope)) {
            this.tBListBox = getComponent(document.getElementById(prevScope), this.getModuleName());
            this.tBListBox.updateToolBarState();
        }
        else if (scope) {
            this.tBListBox = getComponent(document.getElementById(scope), this.getModuleName());
            this.tBListBox.updateToolBarState();
        }
    }
    createButtons(toolElem) {
        let btn;
        let ele;
        let title;
        const l10n = new L10n(this.getModuleName(), {
            moveUp: 'Move Up', moveDown: 'Move Down', moveTo: 'Move To',
            moveFrom: 'Move From', moveAllTo: 'Move All To', moveAllFrom: 'Move All From'
        }, this.locale);
        this.toolbarSettings.items.forEach((value) => {
            title = l10n.getConstant(value);
            ele = this.createElement('button', {
                attrs: {
                    'type': 'button',
                    'data-value': value,
                    'title': title,
                    'aria-label': title
                }
            });
            toolElem.appendChild(ele);
            btn = new Button({ iconCss: 'e-icons e-' + value.toLowerCase() }, ele);
            btn.createElement = this.createElement;
        });
    }
    validationAttribute(input, hiddenSelect) {
        super.validationAttribute(input, hiddenSelect);
        hiddenSelect.required = input.required;
        input.required = false;
    }
    setHeight() {
        const ele = this.toolbarSettings.items.length ? this.list.parentElement : this.list;
        ele.style.height = formatUnit(this.height);
        if (this.allowFiltering && this.height.toString().indexOf('%') < 0) {
            addClass([this.list], 'e-filter-list');
        }
        else {
            removeClass([this.list], 'e-filter-list');
        }
    }
    setCssClass() {
        const wrap = this.toolbarSettings.items.length ? this.list.parentElement : this.list;
        if (this.cssClass) {
            addClass([wrap], this.cssClass.replace(/\s+/g, ' ').trim().split(' '));
        }
        if (this.enableRtl) {
            addClass([this.list], 'e-rtl');
        }
    }
    setEnable() {
        const ele = this.toolbarSettings.items.length ? this.list.parentElement : this.list;
        if (this.enabled) {
            removeClass([ele], cssClass.disabled);
        }
        else {
            addClass([ele], cssClass.disabled);
        }
    }
    showSpinner() {
        if (!this.spinner) {
            this.spinner = this.createElement('div', { className: 'e-listbox-wrapper' });
        }
        this.spinner.style.height = formatUnit(this.height);
        this.element.parentElement.insertBefore(this.spinner, this.element.nextSibling);
        createSpinner({ target: this.spinner }, this.createElement);
        showSpinner(this.spinner);
    }
    hideSpinner() {
        if (this.spinner.querySelector('.e-spinner-pane')) {
            hideSpinner(this.spinner);
        }
        if (this.spinner.parentElement) {
            detach(this.spinner);
        }
    }
    onInput() {
        this.isDataSourceUpdate = false;
        if (this.keyDownStatus) {
            this.isValidKey = true;
        }
        else {
            this.isValidKey = false;
        }
        this.keyDownStatus = false;
        this.refreshClearIcon();
    }
    clearText() {
        this.filterInput.value = '';
        this.refreshClearIcon();
        const event = document.createEvent('KeyboardEvent');
        this.isValidKey = true;
        this.KeyUp(event);
    }
    refreshClearIcon() {
        if (this.filterInput.parentElement.querySelector('.' + listBoxClasses.clearIcon)) {
            const clearElement = this.filterInput.parentElement.querySelector('.' + listBoxClasses.clearIcon);
            clearElement.style.visibility = this.filterInput.value === '' ? 'hidden' : 'visible';
        }
    }
    onActionComplete(ulElement, list, e) {
        let searchEle;
        if (this.allowFiltering && this.list.getElementsByClassName('e-filter-parent')[0]) {
            searchEle = this.list.getElementsByClassName('e-filter-parent')[0].cloneNode(true);
        }
        if (list.length === 0) {
            const noRecElem = ulElement.childNodes[0];
            if (noRecElem) {
                ulElement.removeChild(noRecElem);
            }
        }
        super.onActionComplete(ulElement, list, e);
        if (this.allowFiltering && !isNullOrUndefined(searchEle)) {
            this.list.insertBefore(searchEle, this.list.firstElementChild);
            this.filterParent = this.list.getElementsByClassName('e-filter-parent')[0];
            this.filterWireEvents(searchEle);
        }
        this.initWrapper();
        this.setSelection();
        this.initDraggable();
        this.mainList = this.ulElement;
        if (this.initLoad) {
            this.jsonData = [];
            extend(this.jsonData, list, []);
            this.initToolbarAndStyles();
            this.wireEvents();
            if (this.showCheckbox) {
                this.setCheckboxPosition();
            }
            if (this.allowFiltering) {
                this.setFiltering();
            }
        }
        else {
            if (this.isDataSourceUpdate) {
                this.jsonData = [];
                extend(this.jsonData, list, []);
                this.isDataSourceUpdate = false;
            }
            if (this.allowFiltering) {
                const filterElem = this.list.getElementsByClassName('e-input-filter')[0];
                const txtLength = this.filterInput.value.length;
                filterElem.selectionStart = txtLength;
                filterElem.selectionEnd = txtLength;
                filterElem.focus();
            }
        }
        if (this.toolbarSettings.items.length && this.scope && this.scope.indexOf('#') > -1 && !isNullOrUndefined(e)) {
            const scope = this.scope.replace('#', '');
            const scopedLB = getComponent(document.getElementById(scope), this.getModuleName());
            scopedLB.initToolbar();
        }
        this.initLoad = false;
    }
    initToolbarAndStyles() {
        this.initToolbar();
        this.setCssClass();
        this.setEnable();
        this.setHeight();
    }
    triggerDragStart(args) {
        let badge;
        args = extend(this.getDragArgs(args), { dragSelected: true });
        if (Browser.isIos) {
            this.list.style.overflow = 'hidden';
        }
        this.trigger('dragStart', args, (dragEventArgs) => {
            this.allowDragAll = dragEventArgs.dragSelected;
            if (!this.allowDragAll) {
                badge = this.ulElement.getElementsByClassName('e-list-badge')[0];
                if (badge) {
                    detach(badge);
                }
            }
        });
    }
    triggerDrag(args) {
        let scrollParent;
        let boundRect;
        const scrollMoved = 36;
        let scrollHeight = 10;
        if (this.itemTemplate && args.target) {
            if (args.target && args.target.closest('.e-list-item')) {
                scrollHeight = args.target.closest('.e-list-item').scrollHeight;
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const listItem = args.element.querySelector('.e-list-item');
                if (listItem) {
                    scrollHeight = listItem.scrollHeight;
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event = args.event;
        let wrapper;
        if (args.target && (args.target.classList.contains('e-listbox-wrapper') || args.target.classList.contains('e-list-item')
            || args.target.classList.contains('e-filter-parent') || args.target.classList.contains('e-input-group')
            || args.target.closest('.e-list-item'))) {
            if (args.target.classList.contains('e-list-item') || args.target.classList.contains('e-filter-parent')
                || args.target.classList.contains('e-input-group')
                || args.target.closest('.e-list-item')) {
                wrapper = args.target.closest('.e-listbox-wrapper');
            }
            else {
                wrapper = args.target;
            }
            if (this.allowFiltering) {
                scrollParent = wrapper.querySelector('.e-list-parent');
            }
            else {
                scrollParent = wrapper;
            }
            boundRect = scrollParent.getBoundingClientRect();
            if ((boundRect.y + scrollParent.offsetHeight) - (event.clientY + scrollMoved) < 1) {
                scrollParent.scrollTop = scrollParent.scrollTop + scrollHeight;
            }
            else if ((event.pageY - scrollMoved) - boundRect.y < 1) {
                scrollParent.scrollTop = scrollParent.scrollTop - scrollHeight;
            }
        }
        if (args.target === null) {
            return;
        }
        this.trigger('drag', this.getDragArgs(args));
    }
    beforeDragEnd(args) {
        let items = [];
        this.dragValue = this.getFormattedValue(args.droppedElement.getAttribute('data-value'));
        if (this.value.indexOf(this.dragValue) > -1) {
            args.items = this.getDataByValues(this.value);
        }
        else {
            args.items = this.getDataByValues([this.dragValue]);
        }
        extend(items, args.items);
        this.trigger('beforeDrop', args);
        if (args.items !== items) {
            this.customDraggedItem = args.items;
        }
    }
    dragEnd(args) {
        let listData;
        let liColl;
        let jsonData;
        let droppedData;
        let selectedOptions;
        let sortedData;
        const dropValue = this.getFormattedValue(args.droppedElement.getAttribute('data-value'));
        const listObj = this.getComponent(args.droppedElement);
        const getArgs = this.getDragArgs({ target: args.droppedElement }, true);
        const sourceArgs = { previousData: this.dataSource };
        const destArgs = { previousData: listObj.dataSource };
        let dragArgs = extend({}, getArgs, { target: args.target, source: { previousData: this.dataSource },
            previousIndex: args.previousIndex, currentIndex: args.currentIndex });
        if (listObj !== this) {
            const sourceArgs1 = extend(sourceArgs, { currentData: this.listData });
            dragArgs = extend(dragArgs, { source: sourceArgs1, destination: destArgs });
        }
        if (Browser.isIos) {
            this.list.style.overflow = '';
        }
        const targetListObj = this.getComponent(args.target);
        if (targetListObj && targetListObj.listData.length === 0) {
            const noRecElem = targetListObj.ulElement.childNodes[0];
            if (noRecElem) {
                targetListObj.ulElement.removeChild(noRecElem);
            }
        }
        if (listObj === this) {
            const ul = this.ulElement;
            listData = [].slice.call(this.listData);
            liColl = [].slice.call(this.liCollections);
            jsonData = [].slice.call(this.jsonData);
            sortedData = [].slice.call(this.sortedData);
            const toSortIdx = args.currentIndex;
            let toIdx = args.currentIndex = this.getCurIdx(this, args.currentIndex);
            const rIdx = listData.indexOf(this.getDataByValue(dropValue));
            const jsonIdx = jsonData.indexOf(this.getDataByValue(dropValue));
            const sIdx = sortedData.indexOf(this.getDataByValue(dropValue));
            listData.splice(toIdx, 0, listData.splice(rIdx, 1)[0]);
            sortedData.splice(toSortIdx, 0, sortedData.splice(sIdx, 1)[0]);
            jsonData.splice(toIdx, 0, jsonData.splice(jsonIdx, 1)[0]);
            liColl.splice(toIdx, 0, liColl.splice(rIdx, 1)[0]);
            if (this.allowDragAll) {
                selectedOptions = this.value && Array.prototype.indexOf.call(this.value, dropValue) > -1 ? this.value : [dropValue];
                if (!isNullOrUndefined(this.customDraggedItem)) {
                    selectedOptions = [];
                    this.customDraggedItem.forEach((item) => {
                        selectedOptions.push(getValue(this.fields.value, item));
                    });
                }
                selectedOptions.forEach((value) => {
                    if (value !== dropValue) {
                        const idx = listData.indexOf(this.getDataByValue(value));
                        const jsonIdx = jsonData.indexOf(this.getDataByValue(value));
                        const sIdx = sortedData.indexOf(this.getDataByValue(value));
                        if (idx > toIdx) {
                            toIdx++;
                        }
                        jsonData.splice(toIdx, 0, jsonData.splice(jsonIdx, 1)[0]);
                        listData.splice(toIdx, 0, listData.splice(idx, 1)[0]);
                        sortedData.splice(toSortIdx, 0, sortedData.splice(sIdx, 1)[0]);
                        liColl.splice(toIdx, 0, liColl.splice(idx, 1)[0]);
                        ul.insertBefore(this.getItems()[this.getIndexByValue(value)], ul.getElementsByClassName('e-placeholder')[0]);
                    }
                });
            }
            this.listData = listData;
            this.jsonData = jsonData;
            this.sortedData = sortedData;
            this.liCollections = liColl;
        }
        else {
            let li;
            const fLiColl = [].slice.call(this.liCollections);
            let currIdx = args.currentIndex = this.getCurIdx(listObj, args.currentIndex);
            const ul = listObj.ulElement;
            listData = [].slice.call(listObj.listData);
            liColl = [].slice.call(listObj.liCollections);
            jsonData = [].slice.call(listObj.jsonData);
            sortedData = [].slice.call(listObj.sortedData);
            selectedOptions = (this.value && Array.prototype.indexOf.call(this.value, dropValue) > -1 && this.allowDragAll)
                ? this.value : [dropValue];
            if (!isNullOrUndefined(this.customDraggedItem)) {
                selectedOptions = [];
                this.customDraggedItem.forEach((item) => {
                    selectedOptions.push(getValue(this.fields.value, item));
                });
            }
            const fListData = [].slice.call(this.listData);
            const fSortData = [].slice.call(this.sortedData);
            selectedOptions.forEach((value, index) => {
                droppedData = this.getDataByValue(value);
                const srcIdx = this.listData.indexOf(droppedData);
                const jsonSrcIdx = this.jsonData.indexOf(droppedData);
                const sortIdx = this.sortedData.indexOf(droppedData);
                fListData.splice(srcIdx, 1);
                this.jsonData.splice(jsonSrcIdx, 1);
                fSortData.splice(sortIdx, 1);
                this.listData = fListData;
                this.sortedData = fSortData;
                const destIdx = value === dropValue ? args.currentIndex : currIdx;
                listData.splice(destIdx, 0, droppedData);
                jsonData.splice(destIdx, 0, droppedData);
                sortedData.splice(destIdx, 0, droppedData);
                liColl.splice(destIdx, 0, fLiColl.splice(srcIdx, 1)[0]);
                if (!value) {
                    const liCollElem = this.getItems();
                    for (let i = 0; i < liCollElem.length; i++) {
                        if (liCollElem[i].getAttribute('data-value') === null && liCollElem[i].classList.contains('e-list-item')) {
                            li = liCollElem[i];
                            break;
                        }
                    }
                }
                else {
                    li = this.getItems()[this.getIndexByValue(value)];
                }
                if (!li) {
                    li = args.helper;
                }
                this.removeSelected(this, value === dropValue ? [args.droppedElement] : [li]);
                ul.insertBefore(li, ul.getElementsByClassName('e-placeholder')[0]);
                currIdx++;
            });
            if (this.fields.groupBy) {
                const sourceElem = this.renderItems(this.listData, this.fields);
                this.updateListItems(sourceElem, this.ulElement);
                this.setSelection();
            }
            if (listObj.sortOrder !== 'None' || this.selectionSettings.showCheckbox
                !== listObj.selectionSettings.showCheckbox || listObj.fields.groupBy || listObj.itemTemplate || this.itemTemplate) {
                const sortable = getComponent(ul, 'sortable');
                const sourceElem = listObj.renderItems(listData, listObj.fields);
                listObj.updateListItems(sourceElem, ul);
                this.setSelection();
                if (sortable.placeHolderElement) {
                    ul.appendChild(sortable.placeHolderElement);
                }
                ul.appendChild(args.helper);
                listObj.setSelection();
            }
            this.liCollections = fLiColl;
            listObj.liCollections = liColl;
            listObj.jsonData = extend([], [], jsonData, false);
            listObj.listData = extend([], [], listData, false);
            listObj.sortedData = extend([], [], sortedData, false);
            if (this.listData.length === 0) {
                this.l10nUpdate();
            }
        }
        if (this === listObj) {
            const sourceArgs1 = extend(sourceArgs, { currentData: listData });
            dragArgs = extend(dragArgs, { source: sourceArgs1 });
        }
        else {
            const dragArgs1 = extend(destArgs, { currentData: listData });
            dragArgs = extend(dragArgs, { destination: dragArgs1 });
        }
        if (!isNullOrUndefined(this.customDraggedItem)) {
            dragArgs.items = this.customDraggedItem;
        }
        this.trigger('drop', dragArgs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liCollElem = dragArgs.elements;
        if (liCollElem.length) {
            for (let i = 0; i < liCollElem.length; i++) {
                liCollElem[i].classList.remove('e-grabbed');
            }
        }
    }
    updateListItems(sourceElem, destElem) {
        const i = 0;
        destElem.innerHTML = '';
        while (i < sourceElem.childNodes.length) {
            destElem.appendChild(sourceElem.childNodes[i]);
        }
    }
    removeSelected(listObj, elems) {
        if (listObj.selectionSettings.showCheckbox) {
            elems.forEach((ele) => { ele.getElementsByClassName('e-frame')[0].classList.remove('e-check'); });
        }
        else {
            removeClass(elems, cssClass.selected);
        }
    }
    getCurIdx(listObj, idx) {
        if (listObj.fields.groupBy) {
            idx -= [].slice.call(listObj.ulElement.children).slice(0, idx)
                .filter((ele) => ele.classList.contains(cssClass.group)).length;
        }
        return idx;
    }
    getComponent(li) {
        let listObj;
        const ele = (this.element.tagName === 'EJS-LISTBOX' ? closest(li, '.e-listbox')
            : closest(li, '.e-listbox-wrapper') && closest(li, '.e-listbox-wrapper').querySelector('.e-listbox'));
        if (ele) {
            listObj = getComponent(ele, this.getModuleName());
        }
        return listObj;
    }
    /**
     * Sets the enabled state to DropDownBase.
     *
     * @returns {void}
     */
    setEnabled() {
        this.element.setAttribute('aria-disabled', (this.enabled) ? 'false' : 'true');
    }
    listOption(dataSource, fields) {
        this.listCurrentOptions = super.listOption(dataSource, fields);
        this.listCurrentOptions = extend({}, this.listCurrentOptions, { itemCreated: this.triggerBeforeItemRender.bind(this) }, true);
        this.notify('listoption', { module: 'CheckBoxSelection' });
        return this.listCurrentOptions;
    }
    triggerBeforeItemRender(e) {
        e.item.setAttribute('tabindex', '-1');
        this.trigger('beforeItemRender', { element: e.item, item: e.curData });
    }
    requiredModules() {
        const modules = [];
        if (this.selectionSettings.showCheckbox) {
            modules.push({
                member: 'CheckBoxSelection',
                args: [this]
            });
        }
        return modules;
    }
    /**
     * This method is used to enable or disable the items in the ListBox based on the items and enable argument.
     *
     * @param {string[]} items - Text items that needs to be enabled/disabled.
     * @param {boolean} enable - Set `true`/`false` to enable/disable the list items.
     * @param {boolean} isValue - Set `true` if `items` parameter is a array of unique values.
     * @returns {void}
     */
    enableItems(items, enable = true, isValue) {
        let li;
        items.forEach((item) => {
            const text = item;
            li = this.findListElement(this.list, 'li', 'data-value', isValue ? text : this.getValueByText(text));
            if (!li) {
                return;
            }
            if (enable) {
                removeClass([li], cssClass.disabled);
                li.removeAttribute('aria-disabled');
            }
            else {
                addClass([li], cssClass.disabled);
                li.setAttribute('aria-disabled', 'true');
            }
        });
    }
    /**
     * Based on the state parameter, specified list item will be selected/deselected.
     *
     * @param {string[]} items - Array of text value of the item.
     * @param {boolean} state - Set `true`/`false` to select/un select the list items.
     * @param {boolean} isValue - Set `true` if `items` parameter is a array of unique values.
     * @returns {void}
     */
    selectItems(items, state = true, isValue) {
        if (state && !this.selectionSettings.showCheckbox && this.selectionSettings.mode === 'Single') {
            this.getSelectedItems().forEach((li) => {
                li.classList.remove('e-active');
                li.removeAttribute('aria-selected');
                removeClass([li], cssClass.selected);
            });
        }
        this.setSelection(items, state, !isValue);
        this.updateSelectedOptions();
        let selElems = [];
        for (let i = 0; i < items.length; i++) {
            const liColl = this.list.querySelectorAll('[aria-selected="true"]');
            for (let j = 0; j < liColl.length; j++) {
                if (items[i] === this.getFormattedValue(liColl[j].getAttribute('data-value'))) {
                    selElems.push(liColl[j]);
                }
            }
        }
        this.triggerChange(selElems, null);
    }
    /**
     * Based on the state parameter, entire list item will be selected/deselected.
     *
     * @param {boolean} state - Set `true`/`false` to select/un select the entire list items.
     * @returns {void}
     */
    selectAll(state = true) {
        this.selectAllItems(state);
    }
    /**
     * Adds a new item to the list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param  { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the list.
     * @returns {void}.
     */
    addItems(items, itemIndex) {
        super.addItem(items, itemIndex);
    }
    /**
     * Removes a item from the list. By default, removed the last item in the list,
     * but you can remove based on the index parameter.
     *
     * @param  { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to remove the item from the list.
     * @returns {void}.
     */
    removeItems(items, itemIndex) {
        this.removeItem(items, itemIndex);
    }
    /**
     * Removes a item from the list. By default, removed the last item in the list,
     * but you can remove based on the index parameter.
     *
     * @param  { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to remove the item from the list.
     * @returns {void}.
     */
    removeItem(items, itemIndex) {
        const liCollections = [];
        const liElement = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
        if (items) {
            items = (items instanceof Array ? items : [items]);
            const fields = this.fields;
            let dataValue;
            let objValue;
            const dupData = [];
            let itemIdx;
            extend(dupData, [], this.jsonData);
            const removeIdxes = [];
            const removeLiIdxes = [];
            for (let j = 0; j < items.length; j++) {
                if (items[j] instanceof Object) {
                    dataValue = getValue(fields.value, items[j]);
                }
                else {
                    dataValue = items[j].toString();
                }
                for (let i = 0, len = dupData.length; i < len; i++) {
                    if (dupData[i] instanceof Object) {
                        objValue = getValue(fields.value, dupData[i]);
                    }
                    else {
                        objValue = dupData[i].toString();
                    }
                    if (objValue === dataValue) {
                        itemIdx = this.getIndexByValue(dataValue);
                        const idx = itemIdx === i ? itemIdx : i;
                        liCollections.push(liElement[idx]);
                        removeIdxes.push(idx);
                        removeLiIdxes.push(idx);
                    }
                }
            }
            for (let k = removeIdxes.length - 1; k >= 0; k--) {
                this.listData.splice(removeIdxes[k], 1);
            }
            for (let k = removeIdxes.length - 1; k >= 0; k--) {
                this.jsonData.splice(removeIdxes[k], 1);
            }
            for (let k = removeLiIdxes.length - 1; k >= 0; k--) {
                this.updateLiCollection(removeLiIdxes[k]);
            }
        }
        else {
            itemIndex = itemIndex ? itemIndex : 0;
            liCollections.push(liElement[itemIndex]);
            this.listData.splice(itemIndex, 1);
            this.jsonData.splice(itemIndex, 1);
            this.updateLiCollection(itemIndex);
        }
        for (let i = 0; i < liCollections.length; i++) {
            this.ulElement.removeChild(liCollections[i]);
        }
        if (this.listData.length === 0) {
            this.l10nUpdate();
        }
        this.value = [];
        this.updateToolBarState();
    }
    /**
     * Gets the array of data Object that matches the given array of values.
     *
     * @param  { string[] | number[] | boolean[] } value - Specifies the array value of the list item.
     * @returns {object[]}.
     */
    getDataByValues(value) {
        const data = [];
        for (let i = 0; i < value.length; i++) {
            data.push(this.getDataByValue(value[i]));
        }
        return data;
    }
    /**
     * Moves the given value(s) / selected value(s) upwards.
     *
     * @param  { string[] | number[] | boolean[] } value - Specifies the value(s).
     * @returns {void}
     */
    moveUp(value) {
        const elem = (value) ? this.getElemByValue(value) : this.getSelectedItems();
        this.moveUpDown(true, false, elem);
    }
    /**
     * Moves the given value(s) / selected value(s) downwards.
     *
     * @param  { string[] | number[] | boolean[] } value - Specifies the value(s).
     * @returns {void}
     */
    moveDown(value) {
        const elem = (value) ? this.getElemByValue(value) : this.getSelectedItems();
        this.moveUpDown(false, false, elem);
    }
    /**
     * Moves the given value(s) / selected value(s) in Top of the list.
     *
     * @param  { string[] | number[] | boolean[] } value - Specifies the value(s).
     * @returns {void}
     */
    moveTop(value) {
        const elem = (value) ? this.getElemByValue(value) : this.getSelectedItems();
        this.moveUpDown(null, false, elem, true);
    }
    /**
     * Moves the given value(s) / selected value(s) in bottom of the list.
     *
     * @param  { string[] | number[] | boolean[] } value - Specifies the value(s).
     * @returns {void}
     */
    moveBottom(value) {
        const elem = (value) ? this.getElemByValue(value) : this.getSelectedItems();
        this.moveUpDown(true, false, elem, false, true);
    }
    /**
     * Moves the given value(s) / selected value(s) to the given / default scoped ListBox.
     *
     * @param  { string[] | number[] | boolean[] } value - Specifies the value or array value of the list item.
     * @param {number} index - Specifies the index.
     * @param {string} targetId - Specifies the target id.
     * @returns {void}
     */
    moveTo(value, index, targetId) {
        const elem = (value) ? this.getElemByValue(value) : this.getSelectedItems();
        const tlistbox = (targetId) ? getComponent(targetId, ListBox_1) : this.getScopedListBox();
        this.moveData(this, tlistbox, false, elem, index);
    }
    /**
     * Moves all the values from one ListBox to the scoped ListBox.
     *
     * @param  { string } targetId - Specifies the scoped ListBox ID.
     * @param  { string } index - Specifies the index to where the items moved.
     * @returns {void}
     */
    moveAllTo(targetId, index) {
        if (this.listData.length > 0) {
            const tlistbox = (targetId) ? getComponent(targetId, ListBox_1) : this.getScopedListBox();
            this.moveAllData(this, tlistbox, false, index);
        }
    }
    /* eslint-disable */
    /**
     * Gets the updated dataSource in ListBox.
     *
     * @returns {{ [key: string]: Object }[] | string[] | boolean[] | number[]} - Updated DataSource.
     */
    /* eslint-enable */
    getDataList() {
        return this.jsonData;
    }
    /* eslint-disable */
    /**
     * Returns the sorted Data in ListBox.
     *
     * @returns {{ [key: string]: Object }[] | string[] | boolean[] | number[]} - Sorted data
     */
    /* eslint-enable */
    getSortedList() {
        let sortData;
        let tempData;
        sortData = tempData = this.sortedData;
        if (this.fields.groupBy) {
            sortData = [];
            for (let i = 0; i < tempData.length; i++) {
                if (tempData[i].isHeader) {
                    continue;
                }
                sortData.push(tempData[i]);
            }
        }
        return sortData;
    }
    getElemByValue(value) {
        const elem = [];
        for (let i = 0; i < value.length; i++) {
            elem.push(this.ulElement.querySelector('[data-value ="' + value[i] + '"]'));
        }
        return elem;
    }
    updateLiCollection(index) {
        const tempLi = [].slice.call(this.liCollections);
        tempLi.splice(index, 1);
        this.liCollections = tempLi;
    }
    selectAllItems(state, event) {
        [].slice.call(this.getItems()).forEach((li) => {
            if (!li.classList.contains(cssClass.disabled)) {
                if (this.selectionSettings.showCheckbox) {
                    const ele = li.getElementsByClassName('e-check')[0];
                    if ((!ele && state) || (ele && !state)) {
                        this.notify('updatelist', { li: li, module: 'listbox' });
                        if (this.maximumSelectionLength >= this.list.querySelectorAll('.e-list-item span.e-check').length) {
                            this.checkMaxSelection();
                        }
                    }
                }
                else {
                    if (state) {
                        li.classList.add(cssClass.selected);
                    }
                    else {
                        li.classList.remove(cssClass.selected);
                    }
                }
            }
        });
        this.updateSelectedOptions();
        if (this.allowFiltering && this.selectionSettings.showCheckbox) {
            const liEle = this.list.getElementsByTagName('li');
            let index = 0;
            if (state) {
                for (index = 0; index < liEle.length; index++) {
                    const dataValue1 = this.getFormattedValue(liEle[index].getAttribute('data-value'));
                    if (!this.value.some((e) => e === dataValue1)) {
                        this.value.push(this.getFormattedValue(liEle[index].getAttribute('data-value')));
                    }
                }
            }
            else {
                for (index = 0; index < liEle.length; index++) {
                    const dataValue2 = this.getFormattedValue(liEle[index].getAttribute('data-value'));
                    this.value = this.value.filter((e) => e !== dataValue2);
                }
            }
            if (document.querySelectorAll('ul').length < 2) {
                this.updateMainList();
            }
        }
        this.triggerChange(this.getSelectedItems(), event);
    }
    updateMainList() {
        const mainList = this.mainList.querySelectorAll('.e-list-item');
        const ulList = this.ulElement.querySelectorAll('.e-list-item');
        const mainCount = mainList.length;
        const ulEleCount = ulList.length;
        if (this.selectionSettings.showCheckbox || (document.querySelectorAll('ul').length > 1 || mainCount !== ulEleCount)) {
            let listindex = 0;
            let valueindex = 0;
            let count = 0;
            for (listindex; listindex < mainCount;) {
                if (this.value) {
                    for (valueindex; valueindex < this.value.length; valueindex++) {
                        if (mainList[listindex].getAttribute('data-value') === this.value[valueindex]) {
                            count++;
                        }
                    }
                }
                if (!count && this.selectionSettings.showCheckbox) {
                    mainList[listindex].getElementsByClassName('e-frame')[0].classList.remove('e-check');
                }
                if (document.querySelectorAll('ul').length > 1 && count && mainCount !== ulEleCount) {
                    this.mainList.removeChild(this.mainList.getElementsByTagName('li')[listindex]);
                    listindex = 0;
                }
                else {
                    listindex++;
                }
                count = 0;
                valueindex = 0;
            }
        }
    }
    wireEvents() {
        const form = closest(this.element, 'form');
        const wrapper = this.element.tagName === 'EJS-LISTBOX' ? this.element : this.list;
        EventHandler.add(this.list, 'click', this.clickHandler, this);
        EventHandler.add(wrapper, 'keydown', this.keyDownHandler, this);
        EventHandler.add(wrapper, 'focusout', this.focusOutHandler, this);
        this.wireToolbarEvent();
        if (this.selectionSettings.showCheckbox) {
            EventHandler.remove(document, 'mousedown', this.checkBoxSelectionModule.onDocumentClick);
        }
        if (this.fields.groupBy || this.element.querySelector('select>optgroup')) {
            EventHandler.remove(this.list, 'scroll', this.setFloatingHeader);
        }
        if (form) {
            EventHandler.add(form, 'reset', this.formResetHandler, this);
        }
    }
    wireToolbarEvent() {
        if (this.toolbarSettings.items.length) {
            EventHandler.add(this.getToolElem(), 'click', this.toolbarClickHandler, this);
        }
    }
    unwireEvents() {
        const form = closest(this.element, 'form');
        const wrapper = this.element.tagName === 'EJS-LISTBOX' ? this.element : this.list;
        EventHandler.remove(this.list, 'click', this.clickHandler);
        EventHandler.remove(wrapper, 'keydown', this.keyDownHandler);
        EventHandler.remove(wrapper, 'focusout', this.focusOutHandler);
        if (this.allowFiltering && this.clearFilterIconElem) {
            EventHandler.remove(this.clearFilterIconElem, 'click', this.clearText);
        }
        if (this.toolbarSettings.items.length) {
            EventHandler.remove(this.getToolElem(), 'click', this.toolbarClickHandler);
        }
        if (form) {
            EventHandler.remove(form, 'reset', this.formResetHandler);
        }
    }
    clickHandler(e) {
        this.selectHandler(e);
    }
    checkSelectAll() {
        let searchCount = 0;
        const liItems = this.list.querySelectorAll('li.' + dropDownBaseClasses.li);
        for (let i = 0; i < liItems.length; i++) {
            if (!liItems[i].classList.contains('e-disabled')) {
                searchCount++;
            }
        }
        const len = this.getSelectedItems().length;
        if (this.showSelectAll && searchCount) {
            this.notify('checkSelectAll', { module: 'CheckBoxSelection',
                value: (searchCount === len) ? 'check' : (len === 0) ? 'uncheck' : 'indeterminate' });
        }
    }
    getQuery(query) {
        let filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
        if (this.allowFiltering) {
            const filterType = this.inputString === '' ? 'contains' : this.filterType;
            let dataType = this.typeOfData(this.dataSource).typeof;
            if (dataType === null) {
                dataType = this.typeOfData(this.jsonData).typeof;
            }
            if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                filterQuery.where('', filterType, this.inputString, this.ignoreCase, this.ignoreAccent);
            }
            else {
                const fields = (this.fields.text) ? this.fields.text : '';
                filterQuery.where(fields, filterType, this.inputString, this.ignoreCase, this.ignoreAccent);
            }
        }
        else {
            filterQuery = query ? query : this.query ? this.query : new Query();
        }
        return filterQuery;
    }
    setFiltering() {
        let filterInputObj;
        if (this.initLoad || isNullOrUndefined(this.filterParent)) {
            this.filterParent = this.createElement('span', {
                className: listBoxClasses.filterParent
            });
            this.filterInput = this.createElement('input', {
                attrs: { type: 'text' },
                className: listBoxClasses.filterInput
            });
            this.element.parentNode.insertBefore(this.filterInput, this.element);
            filterInputObj = Input.createInput({
                element: this.filterInput,
                buttons: [listBoxClasses.filterBarClearIcon],
                properties: { placeholder: this.filterBarPlaceholder }
            }, this.createElement);
            append([filterInputObj.container], this.filterParent);
            prepend([this.filterParent], this.list);
            attributes(this.filterInput, {
                'aria-disabled': 'false',
                'aria-label': 'search list item',
                'autocomplete': 'off',
                'autocorrect': 'off',
                'autocapitalize': 'off',
                'spellcheck': 'false'
            });
            if (this.height.toString().indexOf('%') < 0) {
                addClass([this.list], 'e-filter-list');
            }
            this.inputString = this.filterInput.value;
            this.filterWireEvents();
            return filterInputObj;
        }
    }
    filterWireEvents(filterElem) {
        if (filterElem) {
            this.filterInput = filterElem.querySelector('.e-input-filter');
        }
        this.clearFilterIconElem = this.filterInput.parentElement.querySelector('.' + listBoxClasses.clearIcon);
        if (this.clearFilterIconElem) {
            EventHandler.add(this.clearFilterIconElem, 'click', this.clearText, this);
            if (!filterElem) {
                this.clearFilterIconElem.style.visibility = 'hidden';
            }
        }
        EventHandler.add(this.filterInput, 'input', this.onInput, this);
        EventHandler.add(this.filterInput, 'keyup', this.KeyUp, this);
        EventHandler.add(this.filterInput, 'keydown', this.onKeyDown, this);
    }
    selectHandler(e, isKey) {
        let isSelect = true;
        let currSelIdx;
        const li = closest(e.target, '.' + 'e-list-item');
        let selectedLi = [li];
        if (li && li.parentElement) {
            currSelIdx = [].slice.call(li.parentElement.children).indexOf(li);
            if (!this.selectionSettings.showCheckbox) {
                if ((e.ctrlKey || e.metaKey || Browser.isDevice) && this.isSelected(li)) {
                    li.classList.remove(cssClass.selected);
                    li.removeAttribute('aria-selected');
                    isSelect = false;
                }
                else if (!(this.selectionSettings.mode === 'Multiple' && (e.ctrlKey || e.metaKey || Browser.isDevice))) {
                    this.getSelectedItems().forEach((ele) => {
                        ele.removeAttribute('aria-selected');
                    });
                    removeClass(this.getSelectedItems(), cssClass.selected);
                }
            }
            else {
                isSelect = !li.getElementsByClassName('e-frame')[0].classList.contains('e-check');
            }
            if (e.shiftKey && !this.selectionSettings.showCheckbox && this.selectionSettings.mode !== 'Single') {
                selectedLi = [].slice.call(li.parentElement.children)
                    .slice(Math.min(currSelIdx, this.prevSelIdx), Math.max(currSelIdx, this.prevSelIdx) + 1)
                    .filter((ele) => { return ele.classList.contains('e-list-item'); });
            }
            else {
                this.prevSelIdx = [].slice.call(li.parentElement.children).indexOf(li);
            }
            if (isSelect) {
                if (!this.selectionSettings.showCheckbox) {
                    addClass(selectedLi, cssClass.selected);
                }
                selectedLi.forEach((ele) => {
                    ele.setAttribute('aria-selected', 'true');
                });
                this.list.setAttribute('aria-activedescendant', li.id);
            }
            else {
                selectedLi.forEach((ele) => {
                    ele.setAttribute('aria-selected', 'false');
                });
            }
            if (!isKey && (this.maximumSelectionLength > (this.value && this.value.length) || !isSelect) &&
                (this.maximumSelectionLength >= (this.value && this.value.length) || !isSelect) &&
                !(this.maximumSelectionLength < (this.value && this.value.length))) {
                this.notify('updatelist', { li: li, e: e, module: 'listbox' });
            }
            if (this.allowFiltering && !isKey) {
                const liDataValue = this.getFormattedValue(li.getAttribute('data-value'));
                if (!isSelect) {
                    this.value = this.value.filter((value1) => value1 !== liDataValue);
                }
                else {
                    const values = [];
                    extend(values, this.value);
                    values.push(liDataValue);
                    this.value = values;
                }
                if (document.querySelectorAll('ul').length < 2) {
                    this.updateMainList();
                }
            }
            this.updateSelectedOptions();
            this.triggerChange(this.getSelectedItems(), e);
            if (this.list) {
                this.checkMaxSelection();
            }
        }
    }
    triggerChange(selectedLis, event) {
        this.trigger('change', { elements: selectedLis, items: this.getDataByElements(selectedLis), value: this.value, event: event });
    }
    getDataByElems(elems) {
        const data = [];
        for (let i = 0, len = elems.length; i < len; i++) {
            data.push(this.getDataByValue(this.getFormattedValue(elems[i].getAttribute('data-value'))));
        }
        return data;
    }
    getDataByElements(elems) {
        const data = [];
        let value;
        let sIdx = 0;
        if (!isNullOrUndefined(this.listData)) {
            const type = this.typeOfData(this.listData).typeof;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                for (const item of this.listData) {
                    for (let i = sIdx, len = elems.length; i < len; i++) {
                        value = this.getFormattedValue(elems[i].getAttribute('data-value'));
                        if (!isNullOrUndefined(item) && item === value) {
                            sIdx = i;
                            data.push(item);
                            break;
                        }
                    }
                    if (elems.length === data.length) {
                        break;
                    }
                }
            }
            else {
                for (const item of this.listData) {
                    for (let i = sIdx, len = elems.length; i < len; i++) {
                        value = this.getFormattedValue(elems[i].getAttribute('data-value'));
                        if (!isNullOrUndefined(item) && getValue((this.fields.value ? this.fields.value : 'value'), item) === value) {
                            sIdx = i;
                            data.push(item);
                            break;
                        }
                    }
                    if (elems.length === data.length) {
                        break;
                    }
                }
            }
            return data;
        }
        return null;
    }
    checkMaxSelection() {
        const limit = this.list.querySelectorAll('.e-list-item span.e-check').length;
        if (this.selectionSettings.showCheckbox) {
            let index = 0;
            const liCollElem = this.list.getElementsByClassName('e-list-item');
            for (index; index < liCollElem.length; index++) {
                if (!liCollElem[index].querySelector('.e-frame.e-check')) {
                    if (limit === this.maximumSelectionLength) {
                        liCollElem[index].classList.add('e-disable');
                    }
                    else if (liCollElem[index].classList.contains('e-disable')) {
                        liCollElem[index].classList.remove('e-disable');
                    }
                }
            }
        }
    }
    toolbarClickHandler(e) {
        const btn = closest(e.target, 'button');
        if (btn) {
            this.toolbarAction = btn.getAttribute('data-value');
            if (btn.disabled) {
                return;
            }
            switch (this.toolbarAction) {
                case 'moveUp':
                    this.moveUpDown(true);
                    break;
                case 'moveDown':
                    this.moveUpDown();
                    break;
                case 'moveTo':
                    this.moveItemTo();
                    break;
                case 'moveFrom':
                    this.moveItemFrom();
                    break;
                case 'moveAllTo':
                    this.moveAllItemTo();
                    break;
                case 'moveAllFrom':
                    this.moveAllItemFrom();
                    break;
                default:
                    this.trigger('actionBegin', { cancel: false, items: this.getDataByElems(this.getSelectedItems()),
                        eventName: this.toolbarAction });
                    break;
            }
        }
    }
    moveUpDown(isUp, isKey, value, isTop, isBottom) {
        let elems = this.getSelectedItems();
        if (value) {
            elems = value;
        }
        if (((isUp && this.isSelected(this.ulElement.firstElementChild))
            || (!isUp && this.isSelected(this.ulElement.lastElementChild))) && !value) {
            return;
        }
        const tempItems = this.getDataByElems(elems);
        const localDataArgs = { cancel: false, items: tempItems, eventName: this.toolbarAction };
        this.trigger('actionBegin', localDataArgs);
        if (localDataArgs.cancel) {
            return;
        }
        (isUp ? elems : elems.reverse()).forEach((ele) => {
            const jsonToIdx = Array.prototype.indexOf.call(this.ulElement.querySelectorAll('.e-list-item'), ele);
            const idx = Array.prototype.indexOf.call(this.ulElement.children, ele);
            if (isTop) {
                moveTo(this.ulElement, this.ulElement, [idx], 0);
                this.changeData(idx, 0, jsonToIdx, ele);
            }
            else if (isBottom) {
                moveTo(this.ulElement, this.ulElement, [idx], this.ulElement.querySelectorAll('.e-list-item').length);
                this.changeData(idx, this.ulElement.querySelectorAll('.e-list-item').length, jsonToIdx, ele);
            }
            else {
                moveTo(this.ulElement, this.ulElement, [idx], isUp ? idx - 1 : idx + 2);
                this.changeData(idx, isUp ? idx - 1 : idx + 1, isUp ? jsonToIdx - 1 : jsonToIdx + 1, ele);
            }
        });
        this.trigger('actionComplete', { items: tempItems, eventName: this.toolbarAction });
        elems[0].focus();
        if (!isKey && this.toolbarSettings.items.length) {
            this.getToolElem().querySelector('[data-value=' + (isUp ? 'moveUp' : 'moveDown') + ']').focus();
        }
        this.updateToolBarState();
    }
    moveItemTo() {
        this.moveData(this, this.getScopedListBox());
    }
    moveItemFrom() {
        this.moveData(this.getScopedListBox(), this);
    }
    /**
     * Called internally if any of the property value changed.
     *
     * @param {ListBox} fListBox - Specifies the from listbox.
     * @param {ListBox} tListBox - Specifies the to listbox.
     * @param {boolean} isKey - Specifies the key.
     * @param {Element[]} value - Specifies the value.
     * @param {number} index - Specifies the index.
     * @returns {void}
     * @private
     */
    moveData(fListBox, tListBox, isKey, value, index) {
        const idx = [];
        const dataIdx = [];
        const jsonIdx = [];
        const sortIdx = [];
        const listData = [].slice.call(fListBox.listData);
        const tListData = [].slice.call(tListBox.listData);
        const sortData = [].slice.call(fListBox.sortedData);
        let tSortData = [].slice.call(tListBox.sortedData);
        const fliCollections = [].slice.call(fListBox.liCollections);
        const dataLiIdx = [];
        const tliCollections = [].slice.call(tListBox.liCollections);
        const tempItems = [];
        const data = [];
        let elems = fListBox.getSelectedItems();
        if (value) {
            elems = value;
        }
        const isRefresh = tListBox.sortOrder !== 'None' || (tListBox.selectionSettings.showCheckbox !==
            fListBox.selectionSettings.showCheckbox) || tListBox.fields.groupBy || tListBox.itemTemplate || fListBox.itemTemplate;
        fListBox.value = [];
        if (elems.length) {
            this.removeSelected(fListBox, elems);
            elems.forEach((ele) => {
                idx.push(Array.prototype.indexOf.call(fListBox.ulElement.children, ele)); // update sortable elem
                // To update lb view data
                dataLiIdx.push(Array.prototype.indexOf.call(fListBox.ulElement.querySelectorAll('.e-list-item'), ele));
                // To update lb listdata data
                dataIdx.push(Array.prototype.indexOf.call(fListBox.listData, fListBox.getDataByElems([ele])[0]));
                // To update lb sorted data
                sortIdx.push(Array.prototype.indexOf.call(fListBox.sortedData, fListBox.getDataByElems([ele])[0]));
                // To update lb original data
                jsonIdx.push(Array.prototype.indexOf.call(fListBox.jsonData, fListBox.getDataByElems([ele])[0]));
            });
            if (this.sortOrder !== 'None') {
                sortIdx.forEach((i) => {
                    tempItems.push(fListBox.sortedData[i]);
                });
            }
            else {
                jsonIdx.forEach((i) => {
                    tempItems.push(fListBox.jsonData[i]);
                });
            }
            const localDataArgs = { cancel: false, items: tempItems, eventName: this.toolbarAction };
            fListBox.trigger('actionBegin', localDataArgs);
            if (localDataArgs.cancel) {
                return;
            }
            const rLiCollection = [];
            dataLiIdx.sort((n1, n2) => n1 - n2).reverse().forEach((i) => {
                rLiCollection.push(fliCollections.splice(i, 1)[0]);
            });
            fListBox.liCollections = fliCollections;
            if (index) {
                const toColl = tliCollections.splice(0, index);
                tListBox.liCollections = toColl.concat(rLiCollection.reverse()).concat(tliCollections);
            }
            else {
                tListBox.liCollections = tliCollections.concat(rLiCollection.reverse());
            }
            if (tListBox.listData.length === 0) {
                const noRecElem = tListBox.ulElement.childNodes[0];
                if (noRecElem) {
                    tListBox.ulElement.removeChild(noRecElem);
                }
            }
            dataIdx.sort((n1, n2) => n2 - n1).forEach((i) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                listData.splice(i, 1)[0];
            });
            sortIdx.sort((n1, n2) => n2 - n1).forEach((i) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                sortData.splice(i, 1)[0];
            });
            jsonIdx.slice().reverse().forEach((i) => {
                data.push(fListBox.jsonData.splice(i, 1)[0]);
            });
            if (isRefresh) {
                if (fListBox.fields.groupBy) {
                    const sourceElem = fListBox.renderItems(listData, fListBox.fields);
                    fListBox.updateListItems(sourceElem, fListBox.ulElement);
                }
                else {
                    elems.forEach((ele) => { detach(ele); });
                }
            }
            else {
                moveTo(fListBox.ulElement, tListBox.ulElement, idx, index);
                fListBox.trigger('actionComplete', { items: tempItems, eventName: this.toolbarAction });
            }
            if (tListBox.mainList.childElementCount !== tListBox.jsonData.length) {
                tListBox.mainList = tListBox.ulElement;
            }
            fListBox.updateMainList();
            const tJsonData = [].slice.call(tListBox.jsonData);
            tSortData = [].slice.call(tListBox.sortedData);
            this.selectNextList(elems, dataLiIdx, dataIdx, fListBox);
            if (isKey) {
                this.list.focus();
            }
            fListBox.listData = listData;
            fListBox.sortedData = sortData;
            index = (index) ? index : tListData.length;
            for (let i = tempItems.length - 1; i >= 0; i--) {
                tListData.splice(index, 0, tempItems[i]);
                tJsonData.splice(index, 0, tempItems[i]);
                tSortData.splice(index, 0, tempItems[i]);
            }
            tListBox.listData = tListData;
            tListBox.jsonData = tJsonData;
            tListBox.sortedData = tSortData;
            if (isRefresh) {
                const sourceElem = tListBox.renderItems(tListData, tListBox.fields);
                tListBox.updateListItems(sourceElem, tListBox.ulElement);
                tListBox.setSelection();
                fListBox.trigger('actionComplete', { items: tempItems, eventName: this.toolbarAction });
            }
            fListBox.updateSelectedOptions();
            if (fListBox.listData.length === 0) {
                fListBox.l10nUpdate();
            }
        }
        if (fListBox.value.length === 1 && fListBox.getSelectedItems().length) {
            fListBox.value[0] = fListBox.getFormattedValue(fListBox.getSelectedItems()[0].getAttribute('data-value'));
        }
    }
    selectNextList(elems, dataLiIdx, dataIdx, inst) {
        const childCnt = inst.ulElement.querySelectorAll('.e-list-item').length;
        let ele;
        let liIdx;
        let validIdx = -1;
        if (elems.length === 1 && childCnt && !inst.selectionSettings.showCheckbox) {
            liIdx = childCnt <= dataLiIdx[0] ? childCnt - 1 : dataLiIdx[0];
            ele = inst.ulElement.querySelectorAll('.e-list-item')[liIdx];
            validIdx = inst.getValidIndex(ele, liIdx, childCnt === dataIdx[0] ? 38 : 40);
            if (validIdx > -1) {
                (inst.ulElement.querySelectorAll('.e-list-item')[validIdx].classList.add(cssClass.selected));
            }
        }
    }
    moveAllItemTo() {
        this.moveAllData(this, this.getScopedListBox());
    }
    moveAllItemFrom() {
        this.moveAllData(this.getScopedListBox(), this);
    }
    moveAllData(fListBox, tListBox, isKey, index) {
        let listData = [].slice.call(tListBox.listData);
        const jsonData = [].slice.call(tListBox.jsonData);
        const isRefresh = tListBox.sortOrder !== 'None' || (tListBox.selectionSettings.showCheckbox !==
            fListBox.selectionSettings.showCheckbox) || tListBox.fields.groupBy || tListBox.itemTemplate || fListBox.itemTemplate;
        this.removeSelected(fListBox, fListBox.getSelectedItems());
        const tempItems = [].slice.call(fListBox.listData);
        const localDataArgs = { cancel: false, items: tempItems, eventName: this.toolbarAction };
        fListBox.trigger('actionBegin', localDataArgs);
        if (localDataArgs.cancel) {
            return;
        }
        if (tListBox.listData.length === 0) {
            const noRecElem = tListBox.ulElement.childNodes[0];
            if (noRecElem) {
                tListBox.ulElement.removeChild(noRecElem);
            }
        }
        if (isRefresh) {
            const noRecElem = fListBox.ulElement.childNodes[0];
            if (noRecElem) {
                fListBox.ulElement.removeChild(noRecElem);
            }
        }
        moveTo(fListBox.ulElement, tListBox.ulElement, 
        // eslint-disable-next-line prefer-spread
        Array.apply(null, { length: fListBox.ulElement.childElementCount }).map(Number.call, Number), index);
        this.trigger('actionComplete', { items: tempItems, eventName: this.toolbarAction });
        if (isKey) {
            this.list.focus();
        }
        index = (index) ? index : listData.length;
        for (let i = 0; i < fListBox.listData.length; i++) {
            listData.splice(index + i, 0, fListBox.listData[i]);
        }
        for (let i = 0; i < fListBox.jsonData.length; i++) {
            jsonData.splice(index + i, 0, fListBox.jsonData[i]);
        }
        const fliCollections = [].slice.call(fListBox.liCollections);
        const tliCollections = [].slice.call(tListBox.liCollections);
        fListBox.liCollections = [];
        if (index) {
            const toColl = tliCollections.splice(0, index);
            tListBox.liCollections = toColl.concat(fliCollections).concat(tliCollections);
        }
        else {
            tListBox.liCollections = tliCollections.concat(fliCollections);
        }
        fListBox.value = [];
        listData = listData
            .filter((data) => data.isHeader !== true);
        const sortedData = listData.filter(function (val) {
            return tListBox.jsonData.indexOf(val) === -1;
        });
        for (let i = 0; i < sortedData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tListBox.jsonData.splice(index + i, 0, sortedData[i]);
        }
        tListBox.listData = listData;
        if (fListBox.listData.length === fListBox.jsonData.length) {
            fListBox.listData = fListBox.sortedData = fListBox.jsonData = [];
        }
        else if (fListBox.allowFiltering) {
            for (let i = 0; i < fListBox.listData.length; i++) {
                for (let j = 0; j < fListBox.jsonData.length; j++) {
                    if (fListBox.listData[i] === fListBox.jsonData[j]) {
                        fListBox.jsonData.splice(j, 1);
                    }
                }
            }
            fListBox.listData = fListBox.sortedData = [];
        }
        if (isRefresh) {
            const sourceElem = tListBox.renderItems(listData, tListBox.fields);
            tListBox.updateListItems(sourceElem, tListBox.ulElement);
            this.trigger('actionComplete', { items: tempItems, eventName: this.toolbarAction });
        }
        else {
            tListBox.sortedData = listData;
        }
        fListBox.updateSelectedOptions();
        if (fListBox.listData.length === 0) {
            fListBox.l10nUpdate();
        }
    }
    changeData(fromIdx, toIdx, jsonToIdx, ele) {
        const listData = [].slice.call(this.listData);
        const jsonData = [].slice.call(this.jsonData);
        const sortData = [].slice.call(this.sortedData);
        const jsonIdx = Array.prototype.indexOf.call(this.jsonData, this.getDataByElems([ele])[0]);
        const sortIdx = Array.prototype.indexOf.call(this.sortedData, this.getDataByElems([ele])[0]);
        const liColl = [].slice.call(this.liCollections);
        listData.splice(toIdx, 0, listData.splice(fromIdx, 1)[0]);
        jsonData.splice(jsonToIdx, 0, jsonData.splice(jsonIdx, 1)[0]);
        sortData.splice(toIdx, 0, sortData.splice(sortIdx, 1)[0]);
        liColl.splice(toIdx, 0, liColl.splice(fromIdx, 1)[0]);
        this.listData = listData;
        this.jsonData = jsonData;
        this.liCollections = liColl;
        this.sortedData = sortData;
    }
    getSelectedItems() {
        let ele = [];
        if (this.selectionSettings.showCheckbox) {
            [].slice.call(this.ulElement.getElementsByClassName('e-check')).forEach((cbox) => {
                ele.push(closest(cbox, '.' + 'e-list-item'));
            });
        }
        else {
            ele = [].slice.call(this.ulElement.getElementsByClassName(cssClass.selected));
        }
        return ele;
    }
    getScopedListBox() {
        let listObj;
        if (this.scope) {
            [].slice.call(document.querySelectorAll(this.scope)).forEach((ele) => {
                if (getComponent(ele, this.getModuleName())) {
                    listObj = getComponent(ele, this.getModuleName());
                }
            });
        }
        return listObj;
    }
    getGrabbedItems(args) {
        let grabbItems = false;
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i] === this.getFormattedValue(args.target.getAttribute('data-value'))) {
                grabbItems = true;
                break;
            }
        }
        if (grabbItems) {
            for (let i = 0; i < this.value.length; i++) {
                const liColl = this.list.querySelectorAll('[aria-selected="true"]');
                for (let j = 0; j < liColl.length; j++) {
                    if (this.value[i] === this.getFormattedValue(liColl[j].getAttribute('data-value'))) {
                        liColl[j].classList.add('e-grabbed');
                    }
                }
            }
        }
        let elems;
        if (this.isAngular) {
            elems = Array.prototype.slice.call(this.element.getElementsByClassName('e-list-parent')[0].querySelectorAll('.e-grabbed'));
        }
        else {
            elems = Array.prototype.slice.call(this.element.nextElementSibling.querySelectorAll('.e-grabbed'));
        }
        return elems;
    }
    getDragArgs(args, isDragEnd) {
        let elems = this.getGrabbedItems(args);
        if (elems.length) {
            if (isDragEnd) {
                elems.push(args.target);
            }
        }
        else {
            elems = [args.target];
        }
        return { elements: elems, items: this.getDataByElems(elems) };
    }
    onKeyDown(e) {
        this.keyDownHandler(e);
        e.stopPropagation();
    }
    keyDownHandler(e) {
        if ([32, 35, 36, 37, 38, 39, 40, 65].indexOf(e.keyCode) > -1 && !this.allowFiltering) {
            if (e.target && e.target.className.indexOf('e-edit-template') > -1) {
                return;
            }
            e.preventDefault();
            if (e.keyCode === 32 && this.ulElement.children.length) {
                this.selectHandler({
                    target: this.ulElement.getElementsByClassName('e-focused')[0],
                    ctrlKey: e.ctrlKey, shiftKey: e.shiftKey
                });
            }
            else if (e.keyCode === 65 && e.ctrlKey) {
                this.selectAll();
            }
            else if ((e.keyCode === 38 || e.keyCode === 40) && e.ctrlKey && e.shiftKey) {
                this.moveUpDown(e.keyCode === 38 ? true : false, true);
            }
            else if ((this.toolbarSettings.items.length || this.tBListBox) && (e.keyCode === 39 || e.keyCode === 37) && e.ctrlKey) {
                const listObj = this.tBListBox || this.getScopedListBox();
                if (e.keyCode === 39) {
                    if (e.shiftKey) {
                        this.moveAllData(this, listObj, true);
                    }
                    else {
                        this.moveData(this, listObj, true);
                    }
                }
                else {
                    if (e.shiftKey) {
                        this.moveAllData(listObj, this, true);
                    }
                    else {
                        this.moveData(listObj, this, true);
                    }
                }
            }
            else if (e.keyCode !== 37 && e.keyCode !== 39 && e.code !== 'KeyA') {
                this.upDownKeyHandler(e);
            }
        }
        else if (this.allowFiltering) {
            if (e.keyCode === 40 || e.keyCode === 38) {
                this.upDownKeyHandler(e);
            }
        }
    }
    upDownKeyHandler(e) {
        const ul = this.ulElement;
        const defaultIdx = (e.keyCode === 40 || e.keyCode === 36) ? 0 : ul.childElementCount - 1;
        let fliIdx = defaultIdx;
        const fli = ul.getElementsByClassName('e-focused')[0] || ul.getElementsByClassName(cssClass.selected)[0];
        if (fli) {
            if (e.keyCode !== 35 && e.keyCode !== 36) {
                fliIdx = Array.prototype.indexOf.call(ul.children, fli);
                if (e.keyCode === 40) {
                    fliIdx++;
                }
                else {
                    fliIdx--;
                }
                if (fliIdx < 0 || fliIdx > ul.childElementCount - 1) {
                    return;
                }
            }
            removeClass([fli], 'e-focused');
        }
        const cli = ul.children[fliIdx];
        if (cli) {
            fliIdx = this.getValidIndex(cli, fliIdx, e.keyCode);
            if (fliIdx === -1) {
                addClass([fli], 'e-focused');
                return;
            }
            ul.children[fliIdx].focus();
            ul.children[fliIdx].classList.add('e-focused');
            if (!e.ctrlKey || !this.selectionSettings.showCheckbox && e.shiftKey && (e.keyCode === 36 || e.keyCode === 35)) {
                this.selectHandler({ target: ul.children[fliIdx], ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }, true);
            }
            if (this.selectionSettings.showCheckbox && e.ctrlKey && e.shiftKey && (e.keyCode === 36 || e.keyCode === 35)) {
                const selectedidx = Array.prototype.indexOf.call(ul.children, fli);
                const sidx = e.code === 'Home' ? 0 : selectedidx;
                const eidx = e.code === 'Home' ? selectedidx : ul.children.length - 1;
                for (let i = sidx; i <= eidx; i++) {
                    const item = ul.children[i];
                    this.notify('updatelist', { li: item, e: {
                            target: this.ulElement.getElementsByClassName('e-focused')[0],
                            ctrlKey: e.ctrlKey, shiftKey: e.shiftKey
                        }, module: 'listbox' });
                }
            }
        }
    }
    KeyUp(e) {
        const char = String.fromCharCode(e.keyCode);
        const isWordCharacter = char.match(/\w/);
        if (!isNullOrUndefined(isWordCharacter)) {
            this.isValidKey = true;
        }
        this.isValidKey = (e.keyCode === 8) || (e.keyCode === 46) || this.isValidKey;
        if (this.isValidKey) {
            this.isValidKey = false;
            switch (e.keyCode) {
                default:
                    if (this.allowFiltering) {
                        const eventArgsData = {
                            preventDefaultAction: false,
                            text: this.targetElement(),
                            updateData: (dataSource, query, fields) => {
                                if (eventArgsData.cancel) {
                                    return;
                                }
                                this.isFiltered = true;
                                this.remoteFilterAction = true;
                                this.dataUpdater(dataSource, query, fields);
                            },
                            event: e,
                            cancel: false
                        };
                        this.trigger('filtering', eventArgsData, (args) => {
                            this.isDataFetched = false;
                            if (args.cancel || (this.filterInput.value !== '' && this.isFiltered)) {
                                return;
                            }
                            if (!args.cancel && !this.isCustomFiltering && !args.preventDefaultAction) {
                                this.inputString = this.filterInput.value;
                                this.filteringAction(this.jsonData, new Query(), this.fields);
                            }
                            if (!this.isFiltered && !this.isCustomFiltering && !args.preventDefaultAction) {
                                this.dataUpdater(this.jsonData, new Query(), this.fields);
                            }
                        });
                    }
            }
        }
    }
    /**
     * To filter the data from given data source by using query.
     *
     * @param  {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param  {Query} query - Specify the query to filter the data.
     * @param  {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}.
     */
    filter(dataSource, query, fields) {
        this.isCustomFiltering = true;
        this.filteringAction(dataSource, query, fields);
    }
    filteringAction(dataSource, query, fields) {
        this.resetList(dataSource, fields, query);
    }
    targetElement() {
        this.targetInputElement = this.list.getElementsByClassName('e-input-filter')[0];
        return this.targetInputElement.value;
    }
    dataUpdater(dataSource, query, fields) {
        this.isDataFetched = false;
        const backCommand = true;
        if (this.targetElement().trim() === '') {
            const list = this.mainList.cloneNode ? this.mainList.cloneNode(true) : this.mainList;
            if (backCommand) {
                this.remoteCustomValue = false;
                this.onActionComplete(list, this.jsonData);
                this.notify('reOrder', { module: 'CheckBoxSelection', enable: this.selectionSettings.showCheckbox, e: this });
            }
        }
        else {
            this.resetList(dataSource, fields, query);
        }
    }
    focusOutHandler() {
        const ele = this.list.getElementsByClassName('e-focused')[0];
        if (ele) {
            ele.classList.remove('e-focused');
        }
        if (this.allowFiltering) {
            this.refreshClearIcon();
        }
    }
    getValidIndex(cli, index, keyCode) {
        const cul = this.ulElement;
        if (cli.classList.contains('e-disabled') || cli.classList.contains(cssClass.group)) {
            if (keyCode === 40 || keyCode === 36) {
                index++;
            }
            else {
                index--;
            }
        }
        if (index < 0 || index === cul.childElementCount) {
            return -1;
        }
        cli = cul.childNodes[index];
        if (cli.classList.contains('e-disabled') || cli.classList.contains(cssClass.group)) {
            index = this.getValidIndex(cli, index, keyCode);
        }
        return index;
    }
    updateSelectedOptions() {
        const selectedOptions = [];
        const values = [];
        extend(values, this.value);
        this.getSelectedItems().forEach((ele) => {
            if (!ele.classList.contains('e-grabbed')) {
                selectedOptions.push(this.getFormattedValue(ele.getAttribute('data-value')));
            }
        });
        if (this.mainList.childElementCount === this.ulElement.childElementCount) {
            if (this.allowFiltering && this.selectionSettings.showCheckbox) {
                for (let i = 0; i < selectedOptions.length; i++) {
                    if (values.indexOf(selectedOptions[i]) > -1) {
                        continue;
                    }
                    else {
                        values.push(selectedOptions[i]);
                    }
                }
                this.setProperties({ value: values }, true);
            }
            else {
                this.setProperties({ value: selectedOptions }, true);
            }
        }
        this.updateSelectTag();
        this.updateToolBarState();
        if (this.tBListBox) {
            this.tBListBox.updateToolBarState();
        }
    }
    clearSelection(values = this.value) {
        if (this.selectionSettings.showCheckbox) {
            let dvalue;
            this.getSelectedItems().forEach((li) => {
                dvalue = this.getFormattedValue(li.getAttribute('data-value'));
                if (values.indexOf(dvalue) < 0) {
                    li.getElementsByClassName('e-check')[0].classList.remove('e-check');
                    li.removeAttribute('aria-selected');
                }
            });
        }
    }
    setSelection(values = this.value, isSelect = true, isText = false) {
        let li;
        let liselect;
        if (values) {
            values.forEach((value) => {
                let text;
                if (isText) {
                    text = this.getValueByText(value);
                }
                else {
                    text = value;
                }
                if (typeof (text) === 'string') {
                    text = text.split('\\').join('\\\\');
                    li = this.list.querySelector('[data-value="' + text.replace(/"/g, '\\"') + '"]');
                }
                else {
                    li = this.list.querySelector('[data-value="' + text + '"]');
                }
                if (li) {
                    if (this.selectionSettings.showCheckbox) {
                        liselect = li.getElementsByClassName('e-frame')[0].classList.contains('e-check');
                    }
                    else {
                        liselect = li.classList.contains('e-selected');
                    }
                    if (!isSelect && liselect || isSelect && !liselect && li) {
                        if (this.selectionSettings.showCheckbox) {
                            this.notify('updatelist', { li: li, module: 'listbox' });
                            li.focus();
                        }
                        else {
                            if (isSelect) {
                                li.classList.add(cssClass.selected);
                                li.setAttribute('aria-selected', 'true');
                                li.focus();
                            }
                            else {
                                li.classList.remove(cssClass.selected);
                                li.removeAttribute('aria-selected');
                            }
                        }
                    }
                }
            });
        }
        this.updateSelectTag();
    }
    updateSelectTag() {
        const ele = this.getSelectTag();
        let innerHTML = '';
        ele.innerHTML = '';
        if (this.value) {
            for (let i = 0, len = this.value.length; i < len; i++) {
                innerHTML += '<option selected>' + this.value[i] + '</option>';
            }
            ele.innerHTML += innerHTML;
            for (let i = 0, len = ele.childNodes.length; i < len; i++) {
                ele.childNodes[i].setAttribute('value', this.value[i].toString());
            }
        }
        this.checkSelectAll();
    }
    checkDisabledState(inst) {
        return inst.ulElement.querySelectorAll('.' + cssClass.li).length === 0;
    }
    updateToolBarState() {
        if (this.toolbarSettings.items.length) {
            const listObj = this.getScopedListBox();
            const wrap = this.list.parentElement.getElementsByClassName('e-listbox-tool')[0];
            this.toolbarSettings.items.forEach((value) => {
                const btn = wrap.querySelector('[data-value="' + value + '"]');
                switch (value) {
                    case 'moveAllTo':
                        btn.disabled = this.checkDisabledState(this);
                        break;
                    case 'moveAllFrom':
                        btn.disabled = this.checkDisabledState(listObj);
                        break;
                    case 'moveFrom':
                        btn.disabled = listObj.value && listObj.value.length ? false : true;
                        break;
                    case 'moveUp':
                        btn.disabled = this.value && this.value.length
                            && !this.isSelected(this.ulElement.children[0]) ? false : true;
                        break;
                    case 'moveDown':
                        btn.disabled = this.value && this.value.length
                            && !this.isSelected(this.ulElement.children[this.ulElement.childElementCount - 1]) ? false : true;
                        break;
                    default:
                        btn.disabled = this.value && this.value.length ? false : true;
                        break;
                }
            });
        }
    }
    setCheckboxPosition() {
        const listWrap = this.list;
        if (!this.initLoad && this.selectionSettings.checkboxPosition === 'Left') {
            listWrap.classList.remove('e-right');
        }
        if (this.selectionSettings.checkboxPosition === 'Right') {
            listWrap.classList.add('e-right');
        }
    }
    showCheckbox(showCheckbox) {
        let index = 0;
        const liColl = this.list.lastElementChild.querySelectorAll('li');
        const liCollLen = this.list.lastElementChild.getElementsByClassName('e-list-item').length;
        if (showCheckbox) {
            this.ulElement = this.renderItems(this.listData, this.fields);
            this.mainList = this.ulElement;
            this.list.removeChild(this.list.getElementsByTagName('ul')[0]);
            this.list.appendChild(this.ulElement);
            if (this.selectionSettings.showSelectAll && !this.list.getElementsByClassName('e-selectall-parent')[0]) {
                const l10nShow = new L10n(this.getModuleName(), { selectAllText: 'Select All', unSelectAllText: 'Unselect All' }, this.locale);
                this.showSelectAll = true;
                this.selectAllText = l10nShow.getConstant('selectAllText');
                this.unSelectAllText = l10nShow.getConstant('unSelectAllText');
                this.popupWrapper = this.list;
                this.checkBoxSelectionModule.checkAllParent = null;
                this.notify('selectAll', {});
                this.checkSelectAll();
            }
        }
        else {
            if (this.list.getElementsByClassName('e-selectall-parent')[0]) {
                this.list.removeChild(this.list.getElementsByClassName('e-selectall-parent')[0]);
            }
            for (index; index < liCollLen; index++) {
                if (liColl[index].classList.contains('e-list-item')) {
                    liColl[index].removeChild(liColl[index].getElementsByClassName('e-checkbox-wrapper')[0]);
                }
                if (liColl[index].hasAttribute('aria-selected')) {
                    liColl[index].removeAttribute('aria-selected');
                }
            }
            this.mainList = this.ulElement;
        }
        this.value = [];
    }
    isSelected(ele) {
        if (!isNullOrUndefined(ele)) {
            return ele.classList.contains(cssClass.selected) || ele.querySelector('.e-check') !== null;
        }
        else {
            return false;
        }
    }
    getSelectTag() {
        return this.list.getElementsByClassName('e-hidden-select')[0];
    }
    getToolElem() {
        return this.list.parentElement.getElementsByClassName('e-listbox-tool')[0];
    }
    formResetHandler() {
        this.value = this.initialSelectedOptions;
    }
    /**
     * Return the module name.
     *
     * @private
     * @returns {string} - Module name
     */
    getModuleName() {
        return 'listbox';
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} - Persist data
     */
    getPersistData() {
        return this.addOnPersist(['value']);
    }
    getLocaleName() {
        return 'listbox';
    }
    destroy() {
        this.unwireEvents();
        if (this.element.tagName === 'EJS-LISTBOX') {
            this.element.innerHTML = '';
        }
        else {
            this.element.style.display = 'inline-block';
            if (this.toolbarSettings.items.length) {
                this.list.parentElement.parentElement.insertBefore(this.list, this.list.parentElement);
                detach(this.list.nextElementSibling);
            }
            this.list.parentElement.insertBefore(this.element, this.list);
        }
        super.destroy();
        this.enableRtlElements = [];
        this.liCollections = null;
        this.list = null;
        this.ulElement = null;
        this.mainList = null;
        this.spinner = null;
        this.rippleFun = null;
        if (this.itemTemplate) {
            this.clearTemplate();
        }
    }
    /**
     * Called internally if any of the property value changed.
     *
     * @param {ListBoxModel} newProp - Specifies the new properties.
     * @param {ListBoxModel} oldProp - Specifies the old properties.
     * @returns {void}
     * @private
     */
    onPropertyChanged(newProp, oldProp) {
        const wrap = this.toolbarSettings.items.length ? this.list.parentElement : this.list;
        super.onPropertyChanged(newProp, oldProp);
        this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'cssClass':
                    if (oldProp.cssClass) {
                        removeClass([wrap], oldProp.cssClass.split(' '));
                    }
                    if (newProp.cssClass) {
                        addClass([wrap], newProp.cssClass.replace(/\s+/g, ' ').trim().split(' '));
                    }
                    break;
                case 'enableRtl':
                    if (newProp.enableRtl) {
                        this.list.classList.add('e-rtl');
                    }
                    else {
                        this.list.classList.remove('e-rtl');
                    }
                    break;
                case 'value':
                    removeClass(this.list.querySelectorAll('.' + cssClass.selected), cssClass.selected);
                    this.clearSelection(this.value);
                    this.setSelection();
                    break;
                case 'height':
                    this.setHeight();
                    break;
                case 'enabled':
                    this.setEnable();
                    break;
                case 'allowDragAndDrop':
                    if (newProp.allowDragAndDrop) {
                        this.initDraggable();
                    }
                    else {
                        getComponent(this.ulElement, 'sortable').destroy();
                    }
                    break;
                case 'allowFiltering':
                    if (this.allowFiltering) {
                        this.setFiltering();
                    }
                    else {
                        this.list.removeChild(this.list.getElementsByClassName('e-filter-parent')[0]);
                        this.filterParent = null;
                        removeClass([this.list], 'e-filter-list');
                    }
                    break;
                case 'filterBarPlaceholder':
                    if (this.allowFiltering) {
                        if (this.filterInput) {
                            Input.setPlaceholder(newProp.filterBarPlaceholder, this.filterInput);
                        }
                    }
                    break;
                case 'scope':
                    if (this.allowDragAndDrop) {
                        getComponent(this.ulElement, 'sortable').scope = newProp.scope;
                    }
                    if (this.toolbarSettings.items.length) {
                        if (oldProp.scope) {
                            getComponent(document.querySelector(oldProp.scope), this.getModuleName())
                                .tBListBox = null;
                        }
                        if (newProp.scope) {
                            getComponent(document.querySelector(newProp.scope), this.getModuleName())
                                .tBListBox = this;
                        }
                    }
                    break;
                case 'toolbarSettings': {
                    let ele;
                    const pos = newProp.toolbarSettings.position;
                    const toolElem = this.getToolElem();
                    if (pos) {
                        removeClass([wrap], ['e-right', 'e-left']);
                        wrap.classList.add('e-' + pos.toLowerCase());
                        if (pos === 'Left') {
                            wrap.insertBefore(toolElem, this.list);
                        }
                        else {
                            wrap.appendChild(toolElem);
                        }
                    }
                    if (newProp.toolbarSettings.items) {
                        if (oldProp.toolbarSettings && oldProp.toolbarSettings.items.length) {
                            ele = this.list.parentElement;
                            ele.parentElement.insertBefore(this.list, ele);
                            detach(ele);
                        }
                        this.initToolbarAndStyles();
                        this.wireToolbarEvent();
                    }
                    break;
                }
                case 'selectionSettings': {
                    const showSelectAll = newProp.selectionSettings.showSelectAll;
                    const showCheckbox = newProp.selectionSettings.showCheckbox;
                    if (!isNullOrUndefined(showSelectAll)) {
                        this.showSelectAll = showSelectAll;
                        if (this.showSelectAll) {
                            const l10nSel = new L10n(this.getModuleName(), { selectAllText: 'Select All', unSelectAllText: 'Unselect All' }, this.locale);
                            this.checkBoxSelectionModule.checkAllParent = null;
                            this.showSelectAll = true;
                            this.selectAllText = l10nSel.getConstant('selectAllText');
                            this.unSelectAllText = l10nSel.getConstant('selectAllText');
                            this.popupWrapper = this.list;
                        }
                        this.notify('selectAll', {});
                        this.checkSelectAll();
                    }
                    if (!isNullOrUndefined(showCheckbox)) {
                        this.showCheckbox(showCheckbox);
                    }
                    if (this.selectionSettings.showCheckbox) {
                        this.setCheckboxPosition();
                    }
                    break;
                }
                case 'dataSource':
                    this.isDataSourceUpdate = true;
                    this.jsonData = [].slice.call(this.dataSource);
                    break;
            }
        }
    }
};
__decorate$6([
    Property('')
], ListBox.prototype, "cssClass", void 0);
__decorate$6([
    Property([])
], ListBox.prototype, "value", void 0);
__decorate$6([
    Property('')
], ListBox.prototype, "height", void 0);
__decorate$6([
    Property(true)
], ListBox.prototype, "enabled", void 0);
__decorate$6([
    Property(false)
], ListBox.prototype, "enablePersistence", void 0);
__decorate$6([
    Property(false)
], ListBox.prototype, "allowDragAndDrop", void 0);
__decorate$6([
    Property(1000)
], ListBox.prototype, "maximumSelectionLength", void 0);
__decorate$6([
    Property(false)
], ListBox.prototype, "allowFiltering", void 0);
__decorate$6([
    Property('')
], ListBox.prototype, "scope", void 0);
__decorate$6([
    Property(true)
], ListBox.prototype, "ignoreCase", void 0);
__decorate$6([
    Property(null)
], ListBox.prototype, "filterBarPlaceholder", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "beforeItemRender", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "filtering", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "select", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "change", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "beforeDrop", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "dragStart", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "drag", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "drop", void 0);
__decorate$6([
    Event()
], ListBox.prototype, "dataBound", void 0);
__decorate$6([
    Property(null)
], ListBox.prototype, "groupTemplate", void 0);
__decorate$6([
    Property('Request failed')
], ListBox.prototype, "actionFailureTemplate", void 0);
__decorate$6([
    Property(1000)
], ListBox.prototype, "zIndex", void 0);
__decorate$6([
    Property(false)
], ListBox.prototype, "ignoreAccent", void 0);
__decorate$6([
    Complex({}, ToolbarSettings)
], ListBox.prototype, "toolbarSettings", void 0);
__decorate$6([
    Complex({}, SelectionSettings)
], ListBox.prototype, "selectionSettings", void 0);
ListBox = ListBox_1 = __decorate$6([
    NotifyPropertyChanges
], ListBox);
const listBoxClasses = {
    backIcon: 'e-input-group-icon e-back-icon e-icons',
    filterBarClearIcon: 'e-input-group-icon e-clear-icon e-icons',
    filterInput: 'e-input-filter',
    filterParent: 'e-filter-parent',
    clearIcon: 'e-clear-icon'
};

/**
 * export all modules from current location
 */

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * The Mention component is used to list someone or something based on user input in textarea, input,
 * or any other editable element from which the user can select.
 */
let Mention = class Mention extends DropDownBase {
    /**
     * * Constructor for creating the widget
     *
     * @param {MentionModel} options - Specifies the MentionComponent model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
    }
    /**
     * When property value changes happened, then onPropertyChanged method will execute the respective changes in this component.
     *
     * @param {MentionModel} newProp - Returns the dynamic property value of the component.
     * @param {MentionModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPropertyChanged(newProp, oldProp) {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'minLength':
                    this.minLength = newProp.minLength;
                    break;
                case 'suffixText':
                    this.suffixText = newProp.suffixText;
                    break;
                case 'allowSpaces':
                    this.allowSpaces = newProp.allowSpaces;
                    break;
                case 'mentionChar':
                    this.mentionChar = newProp.mentionChar;
                    break;
                case 'showMentionChar':
                    this.showMentionChar = newProp.showMentionChar;
                    break;
                case 'cssClass':
                    this.updateCssClass(newProp.cssClass, oldProp.cssClass);
                    break;
            }
        }
    }
    updateCssClass(newClass, oldClass) {
        if (!isNullOrUndefined(oldClass)) {
            oldClass = (oldClass.replace(/\s+/g, ' ')).trim();
        }
        if (!isNullOrUndefined(newClass)) {
            newClass = (newClass.replace(/\s+/g, ' ')).trim();
        }
        this.setCssClass(newClass, [this.inputElement], oldClass);
        if (this.popupObj) {
            this.setCssClass(newClass, [this.popupObj.element], oldClass);
        }
    }
    setCssClass(cssClass$$1, elements, oldClass) {
        if (!isNullOrUndefined(oldClass) && oldClass !== '') {
            removeClass(elements, oldClass.split(' '));
        }
        if (!isNullOrUndefined(cssClass$$1) && cssClass$$1 !== '') {
            addClass(elements, cssClass$$1.split(' '));
        }
    }
    initializeData() {
        this.isSelected = false;
        this.isFiltered = false;
        this.beforePopupOpen = false;
        this.initRemoteRender = false;
        this.isListResetted = false;
        this.isPopupOpen = false;
        this.isCollided = false;
        this.lineBreak = false;
        this.keyConfigure = {
            tab: 'tab',
            enter: '13',
            escape: '27',
            end: '35',
            home: '36',
            down: '40',
            up: '38',
            pageUp: '33',
            pageDown: '34',
            open: 'alt+40',
            close: 'shift+tab',
            hide: 'alt+38',
            space: '32'
        };
    }
    /**
     * Execute before render the list items
     *
     * @private
     * @returns {void}
     */
    preRender() {
        this.initializeData();
        super.preRender();
    }
    /**
     * To Initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    render() {
        const isSelector = typeof this.target === 'string';
        this.inputElement = !isNullOrUndefined(this.target) ?
            this.checkAndUpdateInternalComponent(isSelector
                ? document.querySelector(this.target)
                : this.target) : this.element;
        if (this.isContentEditable(this.inputElement)) {
            this.inputElement.setAttribute('contenteditable', 'true');
            addClass([this.inputElement], ['e-mention']);
            if (isNullOrUndefined(this.target)) {
                addClass([this.inputElement], ['e-editable-element']);
            }
        }
        this.inputElement.setAttribute('role', 'textbox');
        this.queryString = this.elementValue();
        this.wireEvent();
    }
    wireEvent() {
        EventHandler.add(this.inputElement, 'keyup', this.onKeyUp, this);
        this.bindCommonEvent();
    }
    unWireEvent() {
        EventHandler.remove(this.inputElement, 'keyup', this.onKeyUp);
        this.unBindCommonEvent();
    }
    bindCommonEvent() {
        if (!Browser.isDevice) {
            this.keyboardModule = new KeyboardEvents(this.inputElement, {
                keyAction: this.keyActionHandler.bind(this), keyConfigs: this.keyConfigure, eventName: 'keydown'
            });
        }
    }
    /**
     * Hides the spinner loader.
     *
     * @private
     * @returns {void}
     */
    hideSpinner() {
        this.hideWaitingSpinner();
    }
    hideWaitingSpinner() {
        if (!isNullOrUndefined(this.spinnerElement)) {
            hideSpinner(this.spinnerElement);
        }
        if (!isNullOrUndefined(this.spinnerTemplate) && !isNullOrUndefined(this.spinnerTemplateElement)) {
            detach(this.spinnerTemplateElement);
        }
    }
    checkAndUpdateInternalComponent(targetElement) {
        if (!this.isVue && targetElement.classList.contains('e-richtexteditor')) {
            return targetElement.querySelector('.e-content');
        }
        if (this.isVue && targetElement.nodeName === 'TEXTAREA' && targetElement.classList.contains('e-rte-hidden')) {
            const parentElement = targetElement.parentElement;
            if (parentElement && parentElement.classList.contains('e-richtexteditor')) {
                return parentElement.querySelector('.e-content');
            }
        }
        return targetElement;
    }
    /**
     * Shows the spinner loader.
     *
     * @returns {void}
     */
    showWaitingSpinner() {
        if (!isNullOrUndefined(this.popupObj)) {
            if (isNullOrUndefined(this.spinnerTemplate) && isNullOrUndefined(this.spinnerElement)) {
                this.spinnerElement = this.popupObj.element;
                createSpinner({
                    target: this.spinnerElement,
                    width: Browser.isDevice ? '16px' : '14px'
                }, this.createElement);
                showSpinner(this.spinnerElement);
            }
            if (!isNullOrUndefined(this.spinnerTemplate)) {
                this.setSpinnerTemplate();
            }
        }
    }
    keyActionHandler(e) {
        const isNavigation = (e.action === 'down' || e.action === 'up' || e.action === 'pageUp' || e.action === 'pageDown'
            || e.action === 'home' || e.action === 'end');
        const isTabAction = e.action === 'tab' || e.action === 'close';
        if (this.list === undefined && !this.isRequested && !isTabAction && e.action !== 'escape' && e.action !== 'space') {
            this.renderList();
        }
        if (isNullOrUndefined(this.list) || (!isNullOrUndefined(this.liCollections) &&
            isNavigation && this.liCollections.length === 0) || this.isRequested) {
            return;
        }
        if (e.action === 'escape') {
            e.preventDefault();
        }
        this.isSelected = e.action === 'escape' ? false : this.isSelected;
        switch (e.action) {
            case 'down':
            case 'up':
                this.isUpDownKey = true;
                this.updateUpDownAction(e);
                break;
            case 'tab':
                if (this.isPopupOpen) {
                    e.preventDefault();
                    const li = this.list.querySelector('.' + dropDownBaseClasses.selected);
                    if (li) {
                        this.setSelection(li, e);
                    }
                    if (this.isPopupOpen) {
                        this.hidePopup(e);
                    }
                }
                break;
            case 'enter':
                if (this.isPopupOpen) {
                    e.preventDefault();
                    if (this.popupObj && this.popupObj.element.contains(this.selectedLI)) {
                        this.updateSelectedItem(this.selectedLI, e, false, true);
                    }
                }
                break;
            case 'escape':
                if (this.isPopupOpen) {
                    this.hidePopup(e);
                }
                break;
        }
    }
    updateUpDownAction(e) {
        const focusEle = this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (this.isSelectFocusItem(focusEle)) {
            this.setSelection(focusEle, e);
        }
        else if (!isNullOrUndefined(this.liCollections)) {
            const li = this.list.querySelector('.' + dropDownBaseClasses.selected);
            if (!isNullOrUndefined(li)) {
                const value = this.getFormattedValue(li.getAttribute('data-value'));
                this.activeIndex = this.getIndexByValue(value);
            }
            let index = e.action === 'down' ? this.activeIndex + 1 : this.activeIndex - 1;
            let startIndex = 0;
            startIndex = e.action === 'down' && isNullOrUndefined(this.activeIndex) ? 0 : this.liCollections.length - 1;
            index = index < 0 ? this.liCollections.length - 1 : index === this.liCollections.length ? 0 : index;
            const nextItem = isNullOrUndefined(this.activeIndex) ?
                this.liCollections[startIndex] : this.liCollections[index];
            if (!isNullOrUndefined(nextItem)) {
                this.setSelection(nextItem, e);
            }
        }
        if (this.isPopupOpen) {
            e.preventDefault();
        }
    }
    isSelectFocusItem(element) {
        return !isNullOrUndefined(element);
    }
    unBindCommonEvent() {
        if (!Browser.isDevice) {
            this.keyboardModule.destroy();
        }
    }
    onKeyUp(e) {
        let rangetextContent;
        if (this.isUpDownKey && this.isPopupOpen && e.keyCode === 229) {
            this.isUpDownKey = false;
            return;
        }
        this.isTyped = e.code !== 'Enter' && e.code !== 'Space' && e.code !== 'ArrowDown' && e.code !== 'ArrowUp' ? true : false;
        if (document.activeElement != this.inputElement) {
            this.inputElement.focus();
        }
        if (this.isContentEditable(this.inputElement)) {
            this.range = this.getCurrentRange();
            rangetextContent = this.range.startContainer.textContent.split('');
        }
        let currentRange = this.getTextRange();
        const lastWordRange = this.getLastLetter(currentRange);
        // eslint-disable-next-line security/detect-non-literal-regexp
        const Regex = new RegExp(this.mentionChar, 'g');
        const charRegex = new RegExp('[a-zA-Z]', 'g');
        if (e.key === 'Shift' || e.keyCode === 37 || e.keyCode === 39) {
            return;
        }
        if ((!currentRange || !lastWordRange) || e.code === 'Enter' || e.keyCode === 27 ||
            (lastWordRange.match(Regex) && lastWordRange.match(Regex).length > 1) ||
            (this.isContentEditable(this.inputElement) && this.range.startContainer &&
                this.range.startContainer.previousElementSibling && this.range.startContainer.textContent.split('').length > 0 &&
                (rangetextContent.length === 1 || rangetextContent[rangetextContent.length - 2].indexOf('') === -1 ||
                    this.range.startContainer.nodeType === 1))) {
            if (this.allowSpaces && currentRange && currentRange.trim() !== '' && charRegex.test(currentRange) && currentRange.indexOf(this.mentionChar) !== -1
                && !this.isMatchedText() && (currentRange.length > 1 && currentRange.replace(/\u00A0/g, ' ').charAt(currentRange.length - 2) !== ' ') &&
                (this.list && this.list.querySelectorAll('ul').length > 0)) {
                this.queryString = currentRange.substring(currentRange.lastIndexOf(this.mentionChar) + 1).replace('\u00a0', ' ');
                this.searchLists(e);
            }
            else if (this.isPopupOpen && (!this.allowSpaces || !lastWordRange) && (e.code !== 'ArrowDown' && e.code !== 'ArrowUp')) {
                this.hidePopup();
                this.lineBreak = true;
            }
            return;
        }
        this.queryString = lastWordRange.replace(this.mentionChar, '');
        if (this.mentionChar.charCodeAt(0) === lastWordRange.charCodeAt(0) &&
            this.queryString !== '' && e.keyCode !== 38 && e.keyCode !== 40 && !this.lineBreak) {
            this.searchLists(e);
            if (!this.isPopupOpen && this.queryString.length >= this.minLength) {
                if (!this.isContentEditable(this.inputElement)) {
                    this.showPopup();
                }
                else if (this.isContentEditable(this.inputElement) && this.range && this.range.startContainer !== this.inputElement && e.keyCode !== 9) {
                    this.showPopup();
                }
            }
        }
        else if (lastWordRange.indexOf(this.mentionChar) === 0 && !this.isPopupOpen && e.keyCode !== 8 && (!this.popupObj ||
            (isNullOrUndefined(this.target) && !document.body.contains(this.popupObj.element) ||
                !isNullOrUndefined(this.target) && document.body.contains(this.popupObj.element)))) {
            if (this.initRemoteRender && this.list && this.list.classList.contains('e-nodata')) {
                this.searchLists(e);
            }
            this.resetList(this.dataSource, this.fields);
            if (isNullOrUndefined(this.list)) {
                this.initValue();
            }
            if (!this.isPopupOpen && e.keyCode !== 38 && e.keyCode !== 40) {
                this.didPopupOpenByTypingInitialChar = true;
                this.showPopup();
                if (this.initRemoteRender && this.list.querySelectorAll('li').length === 0) {
                    this.showWaitingSpinner();
                }
                this.lineBreak = false;
            }
        }
        else if (this.allowSpaces && this.queryString !== '' && currentRange && currentRange.trim() !== '' && currentRange.replace('\u00a0', ' ').lastIndexOf(' ') < currentRange.length - 1 &&
            e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 8 && this.mentionChar.charCodeAt(0) === lastWordRange.charCodeAt(0)) {
            this.queryString = currentRange.substring(currentRange.lastIndexOf(this.mentionChar) + 1).replace('\u00a0', ' ');
            this.searchLists(e);
        }
        else if (this.queryString === '' && this.isPopupOpen && e.keyCode !== 38 && e.keyCode !== 40 && this.mentionChar.charCodeAt(0) === lastWordRange.charCodeAt(0)) {
            this.searchLists(e);
            if (!this.isListResetted) {
                this.resetList(this.dataSource, this.fields);
            }
        }
        this.isListResetted = false;
    }
    isMatchedText() {
        let isMatched = false;
        for (let i = 0; i < (this.liCollections && this.liCollections.length); i++) {
            if (this.getTextRange() &&
                this.getTextRange().substring(this.getTextRange().lastIndexOf(this.mentionChar) + 1).replace('\u00a0', ' ').trim() === this.liCollections[i].getAttribute('data-value').toLowerCase()) {
                isMatched = true;
            }
        }
        return isMatched;
    }
    getCurrentRange() {
        this.range = this.inputElement.ownerDocument.getSelection().getRangeAt(0);
        return this.range;
    }
    searchLists(e) {
        this.isDataFetched = false;
        if (isNullOrUndefined(this.list)) {
            super.render();
            this.unWireListEvents();
            this.wireListEvents();
        }
        if (e.type !== 'mousedown' && (e.keyCode === 40 || e.keyCode === 38)) {
            this.queryString = this.queryString === '' ? null : this.queryString;
            this.beforePopupOpen = true;
            this.resetList(this.dataSource, this.fields);
            return;
        }
        this.isSelected = false;
        this.activeIndex = null;
        const eventArgs = {
            preventDefaultAction: false,
            text: this.queryString,
            updateData: (dataSource, query, fields) => {
                if (eventArgs.cancel) {
                    return;
                }
                this.isFiltered = true;
                this.filterAction(dataSource, query, fields);
            },
            cancel: false
        };
        this.trigger('filtering', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel && !this.isFiltered && !eventArgs.preventDefaultAction) {
                this.filterAction(this.dataSource, null, this.fields);
            }
        });
    }
    filterAction(dataSource, query, fields) {
        this.beforePopupOpen = true;
        if (this.queryString.length >= this.minLength) {
            this.resetList(dataSource, fields, query);
            this.isListResetted = true;
        }
        else {
            if (this.isPopupOpen) {
                this.hidePopup();
            }
            this.beforePopupOpen = false;
        }
        this.setDataIndex();
        this.renderReactTemplates();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onActionComplete(ulElement, list, e, isUpdated) {
        super.onActionComplete(ulElement, list, e);
        if (this.isActive) {
            if (!isNullOrUndefined(ulElement)) {
                attributes(ulElement, { 'id': this.inputElement.id + '_options', 'role': 'listbox', 'aria-hidden': 'false' });
            }
            let focusItem = ulElement.querySelector('.' + dropDownBaseClasses.li);
            if (focusItem) {
                focusItem.classList.add(dropDownBaseClasses.selected);
                this.selectedLI = focusItem;
                const value = this.getFormattedValue(focusItem.getAttribute('data-value'));
                this.selectEventCallback(focusItem, this.getDataByValue(value), value, true);
            }
        }
    }
    setDataIndex() {
        for (let i = 0; this.liCollections && i < this.liCollections.length; i++) {
            this.liCollections[i].setAttribute('data-index', i.toString());
        }
    }
    listOption(dataSource, fieldsSettings) {
        const fields = super.listOption(dataSource, fieldsSettings);
        if (isNullOrUndefined(fields.itemCreated)) {
            fields.itemCreated = (e) => {
                if (this.highlight) {
                    if (this.inputElement.tagName === this.getNgDirective() && this.itemTemplate) {
                        setTimeout(() => {
                            highlightSearch(e.item, this.queryString, this.ignoreCase, this.filterType);
                        }, 0);
                    }
                    else {
                        highlightSearch(e.item, this.queryString, this.ignoreCase, this.filterType);
                    }
                }
            };
        }
        else {
            const itemCreated = fields.itemCreated;
            fields.itemCreated = (e) => {
                if (this.highlight) {
                    highlightSearch(e.item, this.queryString, this.ignoreCase, this.filterType);
                }
                itemCreated.apply(this, [e]);
            };
        }
        return fields;
    }
    elementValue() {
        if (!this.isContentEditable(this.inputElement)) {
            return this.inputElement.value.replace(this.mentionChar, '');
        }
        else {
            return this.inputElement.textContent.replace(this.mentionChar, '');
        }
    }
    getQuery(query) {
        const filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
        const filterType = (this.queryString === '' && !isNullOrUndefined(this.elementValue())) ? 'equal' : this.filterType;
        const queryString = (this.queryString === '' && !isNullOrUndefined(this.elementValue())) ?
            this.elementValue() : this.queryString;
        if (this.isFiltered) {
            return filterQuery;
        }
        if (this.queryString !== null && this.queryString !== '') {
            const dataType = this.typeOfData(this.dataSource).typeof;
            if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                filterQuery.where('', filterType, queryString, this.ignoreCase, this.ignoreAccent);
            }
            else {
                const mapping = !isNullOrUndefined(this.fields.text) ? this.fields.text : '';
                filterQuery.where(mapping, filterType, queryString, this.ignoreCase, this.ignoreAccent);
            }
        }
        if (!isNullOrUndefined(this.suggestionCount)) {
            // Since defualt value of suggestioncount is 25, checked the condition
            if (this.suggestionCount !== 25) {
                for (let queryElements = 0; queryElements < filterQuery.queries.length; queryElements++) {
                    if (filterQuery.queries[queryElements].fn === 'onTake') {
                        filterQuery.queries.splice(queryElements, 1);
                    }
                }
            }
            filterQuery.take(this.suggestionCount);
        }
        return filterQuery;
    }
    renderHightSearch() {
        if (this.highlight) {
            for (let i = 0; i < this.liCollections.length; i++) {
                const isHighlight = this.ulElement.querySelector('.e-active');
                if (!isHighlight) {
                    revertHighlightSearch(this.liCollections[i]);
                    highlightSearch(this.liCollections[i], this.queryString, this.ignoreCase, this.filterType);
                }
            }
        }
    }
    getTextRange() {
        let text;
        if (!this.isContentEditable(this.inputElement)) {
            const component = this.inputElement;
            if (!isNullOrUndefined(component)) {
                const startPos = component.selectionStart;
                if (component.value && startPos >= 0) {
                    text = component.value.substring(0, startPos);
                }
            }
        }
        else {
            if (this.range) {
                const selectedElem = this.range.startContainer;
                if (!isNullOrUndefined(selectedElem)) {
                    const workingNodeContent = selectedElem.textContent;
                    const selectStartOffset = this.range.startOffset;
                    if (workingNodeContent && selectStartOffset >= 0) {
                        text = workingNodeContent.substring(0, selectStartOffset);
                    }
                }
            }
        }
        return text;
    }
    getLastLetter(text) {
        if (isNullOrUndefined(text)) {
            return '';
        }
        const textValue = text.replace(/\u00A0/g, ' ');
        const words = textValue.split(/\s+/);
        const wordCnt = words.length - 1;
        return words[wordCnt].trim();
    }
    isContentEditable(element) {
        return element && element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA';
    }
    /**
     * Opens the popup that displays the list of items.
     *
     * @returns {void}
     */
    showPopup() {
        this.beforePopupOpen = true;
        if (document.activeElement != this.inputElement) {
            this.inputElement.focus();
        }
        this.queryString = this.didPopupOpenByTypingInitialChar ? this.queryString : '';
        this.didPopupOpenByTypingInitialChar = false;
        if (this.isContentEditable(this.inputElement)) {
            this.range = this.getCurrentRange();
        }
        if (!this.isTyped) {
            this.resetList(this.dataSource, this.fields);
        }
        if (isNullOrUndefined(this.list)) {
            this.initValue();
        }
        this.renderPopup();
        attributes(this.inputElement, { 'aria-activedescendant': this.selectedElementID });
        if (this.selectedElementID == null) {
            this.inputElement.removeAttribute('aria-activedescendant');
        }
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Hides the popup if it is in an open state.
     *
     * @returns {void}
     */
    hidePopup(e) {
        this.removeSelection();
        this.closePopup(0, e);
    }
    closePopup(delay, e) {
        if (!(this.popupObj && document.body.contains(this.popupObj.element) && this.beforePopupOpen)) {
            return;
        }
        EventHandler.remove(document, 'mousedown', this.onDocumentClick);
        this.inputElement.removeAttribute('aria-owns');
        this.inputElement.removeAttribute('aria-activedescendant');
        this.beforePopupOpen = false;
        const animModel = {
            name: 'FadeOut',
            duration: 100,
            delay: delay ? delay : 0
        };
        const popupInstance = this.popupObj;
        const eventArgs = { popup: popupInstance, cancel: false, animation: animModel, event: e || null };
        this.trigger('closed', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel && this.popupObj) {
                if (this.isPopupOpen) {
                    this.popupObj.hide(new Animation(eventArgs.animation));
                }
                else {
                    this.destroyPopup();
                }
            }
        });
    }
    renderPopup() {
        const args = { cancel: false };
        this.trigger('beforeOpen', args, (args) => {
            if (!args.cancel) {
                let popupEle;
                if (isNullOrUndefined(this.target)) {
                    popupEle = this.createElement('div', {
                        id: this.inputElement.id + '_popup', className: 'e-mention e-popup ' + (this.cssClass != null ? this.cssClass : '')
                    });
                }
                else {
                    popupEle = this.element;
                    if (this.cssClass != null) {
                        addClass([popupEle], this.cssClass.split(' '));
                    }
                }
                if (!isNullOrUndefined(this.target)) {
                    popupEle.id = this.inputElement.id + '_popup';
                }
                this.listHeight = formatUnit(this.popupHeight);
                if (!isNullOrUndefined(this.list.querySelector('li')) && !this.initRemoteRender) {
                    const li = this.list.querySelector('.' + dropDownBaseClasses.focus);
                    if (!isNullOrUndefined(li)) {
                        this.selectedLI = li;
                        const value = this.getFormattedValue(li.getAttribute('data-value'));
                        this.selectEventCallback(li, this.getDataByValue(value), value, true);
                    }
                }
                append([this.list], popupEle);
                if (this.inputElement.parentElement && this.inputElement.parentElement.parentElement &&
                    this.inputElement.parentElement.parentElement.classList.contains('e-richtexteditor')) {
                    if (popupEle.firstElementChild && popupEle.firstElementChild.childElementCount > 0) {
                        popupEle.firstElementChild.setAttribute('aria-owns', this.inputElement.parentElement.parentElement.id);
                    }
                }
                if ((!this.popupObj || !document.body.contains(this.popupObj.element)) ||
                    !document.contains(popupEle) && isNullOrUndefined(this.target)) {
                    document.body.appendChild(popupEle);
                }
                let coordinates;
                popupEle.style.visibility = 'hidden';
                this.setHeight(popupEle);
                const offsetValue = 0;
                const left = 0;
                this.initializePopup(popupEle, offsetValue, left);
                this.checkCollision(popupEle);
                popupEle.style.visibility = 'visible';
                addClass([popupEle], ['e-mention', 'e-popup', 'e-popup-close']);
                if (!isNullOrUndefined(this.list)) {
                    this.unWireListEvents();
                    this.wireListEvents();
                }
                this.selectedElementID = this.selectedLI ? this.selectedLI.id : null;
                attributes(this.inputElement, { 'aria-owns': this.inputElement.id + '_options', 'aria-activedescendant': this.selectedElementID });
                if (this.selectedElementID == null) {
                    this.inputElement.removeAttribute('aria-activedescendant');
                }
                const animModel = { name: 'FadeIn', duration: 100 };
                this.beforePopupOpen = true;
                const popupInstance = this.popupObj;
                const eventArgs = { popup: popupInstance, cancel: false, animation: animModel };
                this.trigger('opened', eventArgs, (eventArgs) => {
                    if (!eventArgs.cancel) {
                        this.renderReactTemplates();
                        this.popupObj.show(new Animation(eventArgs.animation), (this.zIndex === 1000) ? this.inputElement : null);
                        if (isNullOrUndefined(this.getTriggerCharPosition())) {
                            return;
                        }
                        coordinates = this.getCoordinates(this.inputElement, this.getTriggerCharPosition());
                        if (!this.isCollided) {
                            popupEle.style.cssText = 'top: '.concat(coordinates.top.toString(), 'px;\n left: ').concat(coordinates.left.toString(), 'px;\nposition: absolute;\n display: block;');
                        }
                        else {
                            popupEle.style.left = formatUnit(coordinates.left);
                            popupEle.style.top = formatUnit(coordinates.top - parseInt(this.popupHeight.toString()));
                            this.isCollided = false;
                        }
                        popupEle.style.width = this.popupWidth !== '100%' && !isNullOrUndefined(this.popupWidth) ? formatUnit(this.popupWidth) : 'auto';
                        this.setHeight(popupEle);
                        popupEle.style.zIndex = this.zIndex === 1000 ? getZindexPartial(popupEle).toString() : this.zIndex.toString();
                    }
                    else {
                        this.beforePopupOpen = false;
                        this.destroyPopup();
                    }
                });
            }
            else {
                this.beforePopupOpen = false;
            }
        });
    }
    setHeight(popupEle) {
        if (this.popupHeight !== 'auto' && this.list) {
            this.list.style.maxHeight = (parseInt(this.listHeight, 10) - 2).toString() + 'px'; // due to box-sizing property
            popupEle.style.maxHeight = formatUnit(this.popupHeight);
        }
        else {
            popupEle.style.height = 'auto';
        }
    }
    checkCollision(popupEle) {
        if (!Browser.isDevice || (Browser.isDevice && !(this.getModuleName() === 'mention'))) {
            let coordinates = this.getCoordinates(this.inputElement, this.getTriggerCharPosition());
            const collision = isCollide(popupEle, null, coordinates.left, coordinates.top);
            if (collision.length > 0) {
                popupEle.style.marginTop = -parseInt(getComputedStyle(popupEle).marginTop, 10) + 'px';
                this.isCollided = true;
            }
            this.popupObj.resolveCollision();
        }
    }
    getTriggerCharPosition() {
        let mostRecentTriggerCharPos;
        const currentRange = this.getTextRange();
        if (currentRange !== undefined && currentRange !== null) {
            mostRecentTriggerCharPos = 0;
            const idx = currentRange.lastIndexOf(this.mentionChar);
            if (idx >= mostRecentTriggerCharPos) {
                mostRecentTriggerCharPos = idx;
            }
        }
        return mostRecentTriggerCharPos ? mostRecentTriggerCharPos : 0;
    }
    initializePopup(element, offsetValue, left) {
        this.popupObj = new Popup(element, {
            width: this.setWidth(), targetType: 'relative',
            relateTo: this.inputElement, collision: { X: 'flip', Y: 'flip' }, offsetY: offsetValue,
            enableRtl: this.enableRtl, offsetX: left, position: { X: 'left', Y: 'bottom' }, actionOnScroll: 'hide',
            zIndex: this.zIndex,
            close: () => {
                this.destroyPopup();
            },
            open: () => {
                EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
                this.isPopupOpen = true;
                this.setDataIndex();
            }
        });
    }
    setWidth() {
        let width = formatUnit(this.popupWidth);
        if (width.indexOf('%') > -1) {
            const inputWidth = this.inputElement.offsetWidth * parseFloat(width) / 100;
            width = inputWidth.toString() + 'px';
        }
        return width;
    }
    destroyPopup() {
        this.isPopupOpen = false;
        this.popupObj.destroy();
        if (isNullOrUndefined(this.target)) {
            detach(this.popupObj.element);
        }
        else {
            this.popupObj.element.innerHTML = '';
            this.popupObj.element.removeAttribute('style');
            this.popupObj.element.removeAttribute('aria-disabled');
        }
    }
    onDocumentClick(e) {
        const target = e.target;
        if (!(!isNullOrUndefined(this.popupObj) && closest(target, '#' + this.popupObj.element.id))) {
            this.hidePopup(e);
        }
    }
    getCoordinates(element, position) {
        const properties = ['direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'];
        let div;
        let span;
        let range;
        let globalRange;
        let coordinates;
        let computed;
        let rect;
        if (!this.isContentEditable(this.inputElement)) {
            div = this.createElement('div', { className: 'e-form-mirror-div' });
            document.body.appendChild(div);
            computed = getComputedStyle(element);
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            properties.forEach((prop) => {
                // eslint-disable-next-line security/detect-object-injection
                div.style[prop] = computed[prop];
            });
            div.textContent = element.value.substring(0, position);
            if (this.inputElement.nodeName === 'INPUT') {
                div.textContent = div.textContent.replace(/\s/g, '\u00a0');
            }
            span = this.createElement('span');
            span.textContent = element.value.substring(position) || '.';
            div.appendChild(span);
            rect = element.getBoundingClientRect();
        }
        else {
            const selectedNodePosition = this.getTriggerCharPosition();
            globalRange = this.range;
            range = document.createRange();
            if (this.getTextRange() && this.getTextRange().lastIndexOf(this.mentionChar) !== -1) {
                range.setStart(globalRange.startContainer, selectedNodePosition);
                range.setEnd(globalRange.startContainer, selectedNodePosition);
            }
            else {
                range.setStart(globalRange.startContainer, globalRange.startOffset);
                range.setEnd(globalRange.startContainer, globalRange.endOffset);
            }
            this.isTyped = false;
            range.collapse(false);
            rect = range.getBoundingClientRect().top === 0 ? range.startContainer.getClientRects()[0] : range.getBoundingClientRect();
        }
        const doc = document.documentElement;
        const windowLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        const windowTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        let width = 0;
        if (!isNullOrUndefined(range) && range.getBoundingClientRect().top === 0) {
            for (let i = 0; i < this.range.startContainer.childNodes.length; i++) {
                if (this.range.startContainer.childNodes[i].nodeType !== Node.TEXT_NODE && this.range.startContainer.childNodes[i].textContent.trim() !== '') {
                    width += this.range.startContainer.childNodes[i].getClientRects()[0].width;
                }
                else if (this.range.startContainer.childNodes[i].textContent !== '') {
                    let span = document.createElement("span");
                    span.innerHTML = this.range.startContainer.childNodes[i].nodeValue;
                    document.body.appendChild(span);
                    let textNodeWidth = span.offsetWidth;
                    document.body.removeChild(span);
                    width += textNodeWidth;
                }
            }
        }
        if (!this.isContentEditable(this.inputElement)) {
            coordinates = {
                top: rect.top + windowTop + span.offsetTop + parseInt(computed.borderTopWidth, 10) +
                    parseInt(computed.fontSize, 10) + 3 - element.scrollTop - (this.isCollided ? 10 : 0),
                left: rect.left + windowLeft + span.offsetLeft + parseInt(computed.borderLeftWidth, 10)
            };
            document.body.removeChild(div);
        }
        else {
            coordinates = {
                top: rect.top + windowTop + parseInt(getComputedStyle(this.inputElement).fontSize, 10) - (this.isCollided ? 10 : 0),
                left: rect.left + windowLeft + width
            };
        }
        return coordinates;
    }
    initValue() {
        this.renderList();
        if (this.dataSource instanceof DataManager) {
            this.initRemoteRender = true;
        }
        else {
            this.updateValues();
        }
    }
    updateValues() {
        const li = this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (!isNullOrUndefined(li)) {
            this.setSelection(li, null);
        }
    }
    renderList() {
        super.render();
        this.unWireListEvents();
        this.wireListEvents();
    }
    /**
     * Event binding for list
     *
     * @returns {void}
     */
    wireListEvents() {
        EventHandler.add(this.list, 'click', this.onMouseClick, this);
        EventHandler.add(this.list, 'mouseover', this.onMouseOver, this);
        EventHandler.add(this.list, 'mouseout', this.onMouseLeave, this);
    }
    /**
     * Event un binding for list items.
     *
     * @returns {void}
     */
    unWireListEvents() {
        EventHandler.remove(this.list, 'click', this.onMouseClick);
        EventHandler.remove(this.list, 'mouseover', this.onMouseOver);
        EventHandler.remove(this.list, 'mouseout', this.onMouseLeave);
    }
    onMouseClick(e) {
        const target = e.target;
        const li = closest(target, '.' + dropDownBaseClasses.li);
        if (!this.isValidLI(li)) {
            return;
        }
        this.isSelected = true;
        this.setSelection(li, e);
        const delay = 100;
        this.closePopup(delay, e);
        this.inputElement.focus();
    }
    updateSelectedItem(li, e, preventSelect, isSelection) {
        this.removeSelection();
        li.classList.add(dropDownBaseClasses.selected);
        this.removeHover();
        const value = this.getFormattedValue(li.getAttribute('data-value'));
        const selectedData = this.getDataByValue(value);
        if (!preventSelect && !isNullOrUndefined(e) && !(e.action === "down" || e.action === "up")) {
            const items = this.detachChanges(selectedData);
            this.isSelected = true;
            const eventArgs = {
                e: e,
                item: li,
                itemData: items,
                isInteracted: e ? true : false,
                cancel: false
            };
            this.trigger('select', eventArgs, (eventArgs) => {
                if (eventArgs.cancel) {
                    li.classList.remove(dropDownBaseClasses.selected);
                    this.isSelected = false;
                    this.isSelectCancel = true;
                }
                else {
                    this.selectEventCallback(li, selectedData, value);
                    if (isSelection) {
                        this.setSelectOptions(li, e);
                    }
                }
            });
        }
        else {
            this.selectEventCallback(li, selectedData, value);
            if (isSelection) {
                this.setSelectOptions(li, e);
            }
        }
    }
    setSelection(li, e) {
        if (this.isValidLI(li) && (!li.classList.contains(dropDownBaseClasses.selected) || (this.isPopupOpen && this.isSelected
            && li.classList.contains(dropDownBaseClasses.selected)))) {
            this.updateSelectedItem(li, e, false, true);
        }
        else {
            this.setSelectOptions(li, e);
        }
    }
    setSelectOptions(li, e) {
        if (this.list) {
            this.removeHover();
        }
        this.previousSelectedLI = (!isNullOrUndefined(this.selectedLI)) ? this.selectedLI : null;
        this.selectedLI = li;
        if (this.isPopupOpen && !isNullOrUndefined(this.selectedLI)) {
            this.setScrollPosition(e);
        }
        if (e && (e.keyCode === 38 || e.keyCode === 40)) {
            return;
        }
        if (isNullOrUndefined(e) || this.setValue(e)) {
            return;
        }
    }
    setScrollPosition(e) {
        if (!isNullOrUndefined(e)) {
            switch (e.action) {
                case 'pageDown':
                case 'down':
                case 'end':
                    this.scrollBottom();
                    break;
                default:
                    this.scrollTop();
                    break;
            }
        }
        else {
            this.scrollBottom(true);
        }
    }
    scrollBottom(isInitial) {
        if (!isNullOrUndefined(this.selectedLI)) {
            const currentOffset = this.list.offsetHeight;
            const nextBottom = this.selectedLI.offsetTop + this.selectedLI.offsetHeight - this.list.scrollTop;
            let nextOffset = this.list.scrollTop + nextBottom - currentOffset;
            nextOffset = isInitial ? nextOffset + parseInt(getComputedStyle(this.list).paddingTop, 10) * 2 : nextOffset;
            const boxRange = this.selectedLI.offsetTop + this.selectedLI.offsetHeight - this.list.scrollTop;
            if (this.activeIndex === 0) {
                this.list.scrollTop = 0;
            }
            else if (nextBottom > currentOffset || !(boxRange > 0 && this.list.offsetHeight > boxRange)) {
                this.list.scrollTop = nextOffset;
            }
        }
    }
    scrollTop() {
        if (!isNullOrUndefined(this.selectedLI)) {
            let nextOffset = this.selectedLI.offsetTop - this.list.scrollTop;
            nextOffset = this.fields.groupBy && nextOffset;
            const boxRange = (this.selectedLI.offsetTop + this.selectedLI.offsetHeight - this.list.scrollTop);
            if (this.activeIndex === 0) {
                this.list.scrollTop = 0;
            }
            else if (nextOffset < 0) {
                this.list.scrollTop = this.list.scrollTop + nextOffset;
            }
            else if (!(boxRange > 0 && this.list.offsetHeight > boxRange)) {
                this.list.scrollTop = this.selectedLI.offsetTop;
            }
        }
    }
    selectEventCallback(li, selectedData, value, selectLi) {
        this.previousItemData = (!isNullOrUndefined(this.itemData)) ? this.itemData : null;
        this.item = li;
        this.itemData = selectedData;
        const focusedItem = this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (focusedItem) {
            removeClass([focusedItem], dropDownBaseClasses.focus);
        }
        if (selectLi) {
            addClass([li], dropDownBaseClasses.selected);
        }
        li.setAttribute('aria-selected', 'true');
        this.activeIndex = this.getIndexByValue(value);
    }
    detachChanges(value) {
        let items;
        if (typeof value === 'string' ||
            typeof value === 'boolean' ||
            typeof value === 'number') {
            items = Object.defineProperties({}, {
                value: {
                    value: value,
                    enumerable: true
                },
                text: {
                    value: value,
                    enumerable: true
                }
            });
        }
        else {
            items = value;
        }
        return items;
    }
    setValue(e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            if (!isNullOrUndefined(this.displayTemplate)) {
                this.setDisplayTemplate();
            }
            this.updateMentionValue(e);
            return true;
        }
        else {
            if (!isNullOrUndefined(this.displayTemplate)) {
                this.setDisplayTemplate(e);
            }
            else {
                this.updateMentionValue(e);
            }
            return true;
        }
    }
    updateMentionValue(e) {
        const dataItem = this.getItemData();
        let textSuffix;
        let value;
        let endPos;
        let range;
        let globalRange;
        const selection = this.inputElement.ownerDocument.getSelection();
        const startPos = this.getTriggerCharPosition();
        textSuffix = typeof this.suffixText === 'string' ? this.suffixText : '';
        if (this.isSelectCancel) {
            this.isSelectCancel = false;
            return;
        }
        if (dataItem.text !== null) {
            value = this.mentionVal(dataItem.text);
        }
        if (!this.isContentEditable(this.inputElement)) {
            const myField = this.inputElement;
            const currentTriggerSnippet = this.getTextRange().substring(startPos + this.mentionChar.length, this.getTextRange().length);
            value += textSuffix;
            endPos = startPos + this.mentionChar.length;
            endPos += currentTriggerSnippet.length;
            myField.value = myField.value.substring(0, startPos) + value + myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + value.length;
            myField.selectionEnd = startPos + value.length;
            if (this.isPopupOpen) {
                this.hidePopup();
            }
            this.onChangeEvent(e);
        }
        else {
            endPos = this.getTriggerCharPosition() + this.mentionChar.length;
            if (this.range && (this.range.startContainer.textContent.trim() !== this.mentionChar)) {
                endPos = this.range.endOffset;
            }
            globalRange = this.range;
            range = document.createRange();
            if (((this.getTextRange() && this.getTextRange().lastIndexOf(this.mentionChar) !== -1) || this.getTextRange() && this.getTextRange().trim() === this.mentionChar)) {
                range.setStart(globalRange.startContainer, startPos);
                range.setEnd(globalRange.startContainer, endPos);
            }
            else {
                if (globalRange.commonAncestorContainer.textContent.trim() !== '' && !isNullOrUndefined(globalRange.commonAncestorContainer.textContent.trim()) && this.getTextRange() && this.getTextRange().lastIndexOf(this.mentionChar) !== -1) {
                    range.setStart(globalRange.startContainer, globalRange.startOffset - 1);
                    range.setEnd(globalRange.startContainer, globalRange.endOffset - 1);
                }
                else {
                    range.setStart(globalRange.startContainer, globalRange.startOffset);
                    range.setEnd(globalRange.startContainer, globalRange.endOffset);
                }
            }
            this.isTyped = false;
            range.deleteContents();
            const element = this.createElement('div');
            element.innerHTML = value;
            const frag = document.createDocumentFragment();
            let node;
            let lastNode;
            // eslint-disable-next-line no-cond-assign
            while (node = element.firstChild) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            if (this.isPopupOpen) {
                this.hidePopup();
            }
            this.onChangeEvent(e);
        }
    }
    mentionVal(value) {
        const showChar = this.showMentionChar ? this.mentionChar : '';
        if (!isNullOrUndefined(this.displayTemplate) && !isNullOrUndefined(this.displayTempElement)) {
            value = this.displayTempElement.innerHTML;
        }
        if (this.isContentEditable(this.inputElement)) {
            return '<span contenteditable="false" class="e-mention-chip">' + showChar + value + '</span>'.concat(typeof this.suffixText === 'string' ? this.suffixText : ' ');
        }
        else {
            return showChar + value;
        }
    }
    setDisplayTemplate(e) {
        let compiledString;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate(['displayTemplate']);
            if (this.displayTempElement) {
                detach(this.displayTempElement);
                this.displayTempElement = null;
            }
        }
        if (!this.displayTempElement) {
            this.displayTempElement = this.createElement('div');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            this.displayTempElement.innerHTML = '';
        }
        compiledString = compile(this.displayTemplate);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const displayCompTemp = compiledString(this.itemData, this, 'displayTemplate', this.displayTemplateId, this.isStringTemplate, null, this.displayTempElement);
        if (displayCompTemp && displayCompTemp.length > 0) {
            append(displayCompTemp, this.displayTempElement);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            this.renderTemplates();
        }
        else {
            this.renderTemplates(() => {
                this.updateMentionValue(e);
            });
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderTemplates(callBack) {
        this.renderReactTemplates(callBack);
    }
    setSpinnerTemplate() {
        let compiledString;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate(['spinnerTemplate']);
            if (this.spinnerTemplateElement) {
                detach(this.spinnerTemplateElement);
                this.spinnerTemplateElement = null;
            }
        }
        if (!this.spinnerTemplateElement) {
            this.spinnerTemplateElement = this.createElement('div');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            this.spinnerTemplateElement.innerHTML = '';
        }
        compiledString = compile(this.spinnerTemplate);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spinnerCompTemp = compiledString(null, this, 'spinnerTemplate', this.spinnerTemplateId, this.isStringTemplate, null, this.spinnerTemplateElement);
        if (spinnerCompTemp && spinnerCompTemp.length > 0) {
            for (let i = 0; i < spinnerCompTemp.length; i++) {
                this.spinnerTemplateElement.appendChild(spinnerCompTemp[i]);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            this.renderTemplates();
            this.popupObj.element.appendChild(this.spinnerTemplateElement);
        }
        else {
            this.renderTemplates(() => {
                this.popupObj.element.appendChild(this.spinnerTemplateElement);
            });
        }
    }
    onChangeEvent(eve) {
        this.isSelected = false;
        const items = this.detachMentionChanges(this.itemData);
        let preItems;
        if (typeof this.previousItemData === 'string' ||
            typeof this.previousItemData === 'boolean' ||
            typeof this.previousItemData === 'number') {
            preItems = Object.defineProperties({}, {
                value: {
                    value: this.previousItemData,
                    enumerable: true
                },
                text: {
                    value: this.previousItemData,
                    enumerable: true
                }
            });
        }
        else {
            preItems = this.previousItemData;
        }
        const eventArgs = {
            e: eve,
            item: this.item,
            itemData: items,
            previousItem: this.previousSelectedLI,
            previousItemData: preItems,
            isInteracted: eve ? true : false,
            value: this.item.innerHTML,
            element: this.inputElement
        };
        this.trigger('change', eventArgs);
    }
    detachMentionChanges(value) {
        let items;
        if (typeof value === 'string' ||
            typeof value === 'boolean' ||
            typeof value === 'number') {
            items = Object.defineProperties({}, {
                value: {
                    value: value,
                    enumerable: true
                },
                text: {
                    value: value,
                    enumerable: true
                }
            });
        }
        else {
            items = value;
        }
        return items;
    }
    getItemData() {
        const fields = this.fields;
        let dataItem = null;
        dataItem = this.itemData;
        let dataValue;
        let dataText;
        if (!isNullOrUndefined(dataItem)) {
            dataValue = getValue(fields.value, dataItem);
            dataText = getValue(fields.text, dataItem);
        }
        const value = (!isNullOrUndefined(dataItem) &&
            !isUndefined(dataValue) ? dataValue : dataItem);
        const text = (!isNullOrUndefined(dataItem) &&
            !isUndefined(dataValue) ? dataText : dataItem);
        return { value: value, text: text };
    }
    removeSelection() {
        if (this.list) {
            const selectedItems = this.list.querySelectorAll('.' + dropDownBaseClasses.selected);
            if (selectedItems.length) {
                removeClass(selectedItems, dropDownBaseClasses.selected);
                selectedItems[0].removeAttribute('aria-selected');
            }
        }
    }
    onMouseOver(e) {
        const currentLi = closest(e.target, '.' + dropDownBaseClasses.li);
        this.setHover(currentLi);
    }
    setHover(li) {
        if (this.isValidLI(li) && !li.classList.contains(dropDownBaseClasses.hover)) {
            this.removeHover();
            addClass([li], dropDownBaseClasses.hover);
        }
    }
    removeHover() {
        if (this.list) {
            const hoveredItem = this.list.querySelectorAll('.' + dropDownBaseClasses.hover);
            if (hoveredItem && hoveredItem.length) {
                removeClass(hoveredItem, dropDownBaseClasses.hover);
            }
        }
    }
    isValidLI(li) {
        return (li && li.hasAttribute('role') && li.getAttribute('role') === 'option');
    }
    onMouseLeave() {
        this.removeHover();
    }
    /**
     * Search the entered text and show it in the suggestion list if available.
     *
     * @returns {void}
     */
    search(text, positionX, positionY) {
        if (this.isContentEditable(this.inputElement)) {
            this.range = this.getCurrentRange();
        }
        const currentRange = this.getTextRange();
        const lastWordRange = this.getLastLetter(currentRange);
        if ((this.ignoreCase && (text === lastWordRange || text === lastWordRange.toLowerCase()))
            || !this.ignoreCase && text === lastWordRange) {
            this.resetList(this.dataSource, this.fields);
        }
        else {
            if (this.isPopupOpen) {
                this.hidePopup();
            }
            return;
        }
        if (isNullOrUndefined(this.list)) {
            this.renderList();
            this.renderPopup();
        }
        else {
            this.showPopup();
        }
        this.popupObj.element.style.left = formatUnit(positionX);
        this.popupObj.element.style.top = formatUnit(positionY);
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers. Also it removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        this.hidePopup();
        this.unWireEvent();
        if (this.list) {
            this.unWireListEvents();
        }
        if (this.inputElement && !this.inputElement.classList.contains('e-' + this.getModuleName())) {
            return;
        }
        super.destroy();
    }
    getLocaleName() {
        return 'mention';
    }
    getNgDirective() {
        return 'EJS-MENTION';
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'mention';
    }
};
__decorate$7([
    Property(null)
], Mention.prototype, "cssClass", void 0);
__decorate$7([
    Property('@')
], Mention.prototype, "mentionChar", void 0);
__decorate$7([
    Property(false)
], Mention.prototype, "showMentionChar", void 0);
__decorate$7([
    Property(false)
], Mention.prototype, "allowSpaces", void 0);
__decorate$7([
    Property(null)
], Mention.prototype, "suffixText", void 0);
__decorate$7([
    Property(25)
], Mention.prototype, "suggestionCount", void 0);
__decorate$7([
    Property(0)
], Mention.prototype, "minLength", void 0);
__decorate$7([
    Property('None')
], Mention.prototype, "sortOrder", void 0);
__decorate$7([
    Property(true)
], Mention.prototype, "ignoreCase", void 0);
__decorate$7([
    Property(false)
], Mention.prototype, "highlight", void 0);
__decorate$7([
    Property()
], Mention.prototype, "locale", void 0);
__decorate$7([
    Property('auto')
], Mention.prototype, "popupWidth", void 0);
__decorate$7([
    Property('300px')
], Mention.prototype, "popupHeight", void 0);
__decorate$7([
    Property(null)
], Mention.prototype, "displayTemplate", void 0);
__decorate$7([
    Property(null)
], Mention.prototype, "itemTemplate", void 0);
__decorate$7([
    Property('No records found')
], Mention.prototype, "noRecordsTemplate", void 0);
__decorate$7([
    Property(null)
], Mention.prototype, "spinnerTemplate", void 0);
__decorate$7([
    Property()
], Mention.prototype, "target", void 0);
__decorate$7([
    Property([])
], Mention.prototype, "dataSource", void 0);
__decorate$7([
    Property(null)
], Mention.prototype, "query", void 0);
__decorate$7([
    Property('Contains')
], Mention.prototype, "filterType", void 0);
__decorate$7([
    Complex({ text: null, value: null, iconCss: null, groupBy: null }, FieldSettings)
], Mention.prototype, "fields", void 0);
__decorate$7([
    Event()
], Mention.prototype, "actionBegin", void 0);
__decorate$7([
    Event()
], Mention.prototype, "actionComplete", void 0);
__decorate$7([
    Event()
], Mention.prototype, "actionFailure", void 0);
__decorate$7([
    Event()
], Mention.prototype, "change", void 0);
__decorate$7([
    Event()
], Mention.prototype, "beforeOpen", void 0);
__decorate$7([
    Event()
], Mention.prototype, "opened", void 0);
__decorate$7([
    Event()
], Mention.prototype, "closed", void 0);
__decorate$7([
    Event()
], Mention.prototype, "select", void 0);
__decorate$7([
    Event()
], Mention.prototype, "filtering", void 0);
__decorate$7([
    Event()
], Mention.prototype, "created", void 0);
__decorate$7([
    Event()
], Mention.prototype, "destroyed", void 0);
Mention = __decorate$7([
    NotifyPropertyChanges
], Mention);

/**
 * export all modules from current location
 */

/**
 * export all modules from current location
 */

export { incrementalSearch, Search, escapeCharRegExp, resetIncrementalSearchValues, highlightSearch, revertHighlightSearch, FieldSettings, dropDownBaseClasses, DropDownBase, dropDownListClasses, DropDownList, Fields, TreeSettings, DropDownTree, ComboBox, AutoComplete, MultiSelect, CheckBoxSelection, createFloatLabel, updateFloatLabelState, removeFloating, setPlaceHolder, floatLabelFocus, floatLabelBlur, encodePlaceholder, SelectionSettings, ToolbarSettings, ListBox, Mention };
//# sourceMappingURL=ej2-dropdowns.es2015.js.map
