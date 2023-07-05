import { getRangeIndexes, updateCell, applyCellFormat } from '../common/index';
import { getCell, getSheet, setCell, getSheetIndex, getColorCode, getCustomColors } from '../base/index';
import { Internationalization, getNumberDependable, getNumericObject, isNullOrUndefined, IntlBase } from '@syncfusion/ej2-base';
import { cldrData } from '@syncfusion/ej2-base';
import { isNumber, toFraction, intToDate, toDate, dateToInt, rowFillHandler } from '../common/index';
import { applyNumberFormatting, getFormattedCellObject, refreshCellElement, checkDateFormat, getFormattedBarText } from '../common/index';
import { getTextSpace, isCustomDateTime, setVisibleMergeIndex } from './../index';
import { checkIsNumberAndGetNumber, parseThousandSeparator } from '../common/internalization';
/**
 * Specifies number format.
 */
var WorkbookNumberFormat = /** @class */ (function () {
    function WorkbookNumberFormat(parent) {
        this.parent = parent;
        this.localeObj = getNumericObject(this.parent.locale);
        this.decimalSep = this.localeObj.decimal;
        this.groupSep = this.localeObj.group;
        var formats = IntlBase.getDependables(cldrData, this.parent.locale, null).dateObject;
        if (formats.dayPeriods && formats.dayPeriods && formats.dayPeriods.format && formats.dayPeriods.format.wide) {
            this.localeObj.am = formats.dayPeriods.format.wide.am || 'AM';
            this.localeObj.pm = formats.dayPeriods.format.wide.pm || 'PM';
        }
        else {
            this.localeObj.am = 'AM';
            this.localeObj.pm = 'PM';
        }
        this.addEventListener();
    }
    WorkbookNumberFormat.prototype.numberFormatting = function (args) {
        var sheetIdx = this.parent.activeSheetIndex;
        var activeSheet = true;
        if (args.range && args.range.indexOf('!') > -1) {
            sheetIdx = getSheetIndex(this.parent, args.range.split('!')[0]);
            activeSheet = sheetIdx === this.parent.activeSheetIndex;
        }
        var sheet = getSheet(this.parent, sheetIdx);
        var formatRange = args.range ? ((args.range.indexOf('!') > -1) ?
            args.range.split('!')[1] : args.range) : sheet.selectedRange;
        var selectedRange = getRangeIndexes(formatRange);
        var fArgs;
        var cell;
        var prevFormat;
        for (var rowIdx = selectedRange[0]; rowIdx <= selectedRange[2]; rowIdx++) {
            for (var colIdx = selectedRange[1]; colIdx <= selectedRange[3]; colIdx++) {
                prevFormat = getCell(rowIdx, colIdx, sheet, false, true).format;
                if (!updateCell(this.parent, sheet, { cell: { format: args.format }, rowIdx: rowIdx, colIdx: colIdx })) {
                    cell = getCell(rowIdx, colIdx, sheet);
                    if (!(cell.rowSpan < 0 || cell.colSpan < 0)) {
                        fArgs = { value: cell.value, format: cell.format, rowIndex: rowIdx, colIndex: colIdx, sheetIndex: sheetIdx,
                            cell: cell, refresh: activeSheet };
                        this.getFormattedCell(fArgs);
                        if (activeSheet) {
                            this.setCell(fArgs);
                            this.parent.notify(refreshCellElement, { isRightAlign: fArgs.isRightAlign, result: fArgs.formattedText, rowIndex: rowIdx,
                                colIndex: colIdx, sheetIndex: fArgs.sheetIndex, type: fArgs.type, curSymbol: fArgs.curSymbol,
                                value: fArgs.value || fArgs.value === 0 ? fArgs.value : '', isRowFill: fArgs.isRowFill,
                                cellEle: fArgs.td });
                            if (prevFormat && prevFormat !== args.format && prevFormat.includes('[') &&
                                getCustomColors().indexOf(getColorCode(args.format)) === -1) {
                                this.removeFormatColor(fArgs, { format: prevFormat, style: cell.style });
                            }
                        }
                    }
                    this.parent.setUsedRange(rowIdx, colIdx);
                }
            }
        }
    };
    /**
     * @hidden
     *
     * @param {Object} args - Specifies the args.
     * @returns {string} - to get formatted cell.
     */
    WorkbookNumberFormat.prototype.getFormattedCell = function (args) {
        var fResult = args.value === undefined || args.value === null ? '' : args.value;
        args.sheetIndex = args.sheetIndex === undefined ? this.parent.activeSheetIndex : args.sheetIndex;
        var sheet = getSheet(this.parent, args.sheetIndex);
        var cell = args.cell || getCell(args.rowIndex, args.colIndex, sheet, false, true);
        var rightAlign = false;
        var option = {};
        var intl = new Internationalization();
        intl.getNumberFormat(option);
        var currencySymbol = getNumberDependable(this.parent.locale, option.currency);
        if ((!args.format || args.format === 'General') && !args.skipFormatCheck && (!cell.formula ||
            !cell.formula.toLowerCase().startsWith('=text('))) {
            args.type = args.format = 'General';
            var dateEventArgs = { value: fResult, updatedVal: fResult, cell: cell, isEdit: args.isEdit, intl: intl };
            this.checkDateFormat(dateEventArgs);
            if (dateEventArgs.isDate || dateEventArgs.isTime) {
                rightAlign = true;
                cell.value = args.value = dateEventArgs.updatedVal;
                if (cell.format && cell.format !== 'General') {
                    args.format = cell.format;
                }
                else {
                    cell.format = args.format = getFormatFromType(dateEventArgs.isDate ? 'ShortDate' : 'Time');
                }
            }
        }
        else {
            args.type = getTypeFromFormat(args.format);
            if (args.skipFormatCheck && !args.format && args.type === 'General') {
                args.format = 'General';
            }
        }
        if (cell.format && this.isCustomType(cell)) {
            args.type = 'Custom';
            var isCustomText = void 0;
            var orgFormat = cell.format;
            cell.format = cell.format.split('\\').join('');
            if (cell.format.indexOf(';') > -1) {
                if (cell.format.indexOf('<') > -1 || cell.format.indexOf('>') > -1) {
                    args.result = this.processCustomConditions(cell, args);
                }
                else {
                    args.result = this.processCustomAccounting(cell, args, currencySymbol);
                    isCustomText = !isNumber(cell.value) || cell.format === '@';
                }
                cell.format = orgFormat;
            }
            else if (isCustomDateTime(cell.format, true)) {
                if (fResult !== '') {
                    args.result = this.processCustomDateTime(args, cell);
                    isCustomText = !args.formatApplied;
                }
                args.result = args.result || cell.value;
            }
            else if (cell.format.indexOf('@') > -1) {
                isCustomText = true;
                args.result = this.processCustomText(cell.format, fResult, args);
            }
            else {
                var numObj = checkIsNumberAndGetNumber({ value: fResult }, this.parent.locale, this.groupSep, this.decimalSep);
                if (numObj.isNumber) {
                    cell.value = args.value = numObj.value;
                    if (cell.format.includes('E+0')) {
                        if (args.format !== cell.format) {
                            args.format = cell.format;
                        }
                        this.checkAndSetColor(args);
                        var numberFormat = args.format.split('E')[0];
                        var formatArr = numberFormat.split('.');
                        if (this.decimalSep !== '.' && formatArr.length === 1) {
                            formatArr = numberFormat.split(this.decimalSep);
                        }
                        args.result = formatArr[0].length > 1 ? this.scientificHashFormat(args, formatArr) : this.scientificFormat(args);
                    }
                    else {
                        args.result = this.processCustomNumberFormat(cell, args);
                        isCustomText = !isNumber(cell.value);
                    }
                }
                else {
                    if (cell.format && cell.format.includes('[')) {
                        this.removeFormatColor(args, { format: cell.format, style: cell.style });
                    }
                    isCustomText = args.dataUpdate = true;
                }
            }
            if (args.dataUpdate) {
                args.formattedText = args.result || (isNullOrUndefined(args.value) ? '' : args.value.toString());
            }
            else {
                args.value = args.result;
                args.formattedText = isNullOrUndefined(args.value) ? '' : args.value.toString();
            }
            if (isCustomText) {
                args.isRightAlign = false;
            }
            else {
                args.isRightAlign = !isNullOrUndefined(args.value);
            }
        }
        else {
            var result = this.processFormats(args, fResult, rightAlign, cell, intl, currencySymbol, option.currency, sheet);
            args.formattedText = result.fResult || (args.value === undefined || args.value === null ? '' : args.value.toString());
            args.isRightAlign = result.rightAlign;
        }
        args.curSymbol = currencySymbol;
        return args.formattedText;
    };
    WorkbookNumberFormat.prototype.isCustomType = function (cell) {
        var format = getTypeFromFormat(cell.format);
        return (format === 'General' && cell.format !== 'General') || (format === 'Time' && this.parent.isEdit);
    };
    WorkbookNumberFormat.prototype.processCustomFill = function (format, cell, args, formatText) {
        var repeatChar = format[format.indexOf('*') + 1];
        var codes = format.split('*' + repeatChar);
        if (args.rowIndex === undefined) {
            formatText = formatText || this.processCustomNumberFormat({ format: codes.join(''), value: cell.value }, args);
        }
        else {
            var secText = void 0;
            if (codes[1]) {
                var cellVal = parseFloat(cell.value);
                if (cellVal < 0) {
                    secText = this.processCustomNumberFormat({ format: codes[1], value: Math.abs(cellVal).toString() }, args);
                    formatText = "-" + codes[0];
                }
                else {
                    secText = this.processCustomNumberFormat({ format: codes[1], value: cell.value }, args);
                    formatText = codes[0];
                }
                if (cellVal === 0) {
                    secText = secText.split('0').join('');
                }
            }
            else {
                formatText = formatText || this.processCustomNumberFormat({ format: codes[0], value: cell.value }, args);
            }
            args.isRowFill = true;
            this.setCell(args);
            this.parent.notify(rowFillHandler, { cell: cell, cellEle: args.td, rowIdx: args.rowIndex, colIdx: args.colIndex, beforeFillText: formatText,
                repeatChar: repeatChar, afterFillText: secText });
        }
        return formatText;
    };
    WorkbookNumberFormat.prototype.processCustomDateTime = function (args, cell) {
        var _this = this;
        var isCustomDate;
        var checkCustomDate = function () {
            var cellVal = cell.value.toString();
            if (cellVal.includes(_this.localeObj.dateSeparator) || cellVal.indexOf('-') > 0 || cellVal.includes(_this.localeObj.timeSeparator)) {
                return true;
            }
            var formats = IntlBase.getDependables(cldrData, _this.parent.locale, null).dateObject;
            var months = formats.months['stand-alone'] && formats.months['stand-alone'].abbreviated;
            return months && !!Object.keys(months).find(function (key) { return cellVal.includes(months["" + key]); });
        };
        if (!isNumber(cell.value)) {
            isCustomDate = checkCustomDate();
            if (!isCustomDate) {
                return cell.value || '';
            }
        }
        var type;
        var custFormat = cell.format;
        var intl = new Internationalization();
        var formatDateTime = function (checkDate) {
            var isValidDate;
            var dateArgs;
            if (isCustomDate) {
                dateArgs = toDate(cell.value, new Internationalization(), _this.parent.locale, custFormat, cell);
                isValidDate = dateArgs.dateObj && dateArgs.dateObj.toString() !== 'Invalid Date';
                if (isValidDate) {
                    if (dateArgs.dateObj.getFullYear() < 1900) {
                        return '';
                    }
                    else {
                        cell.value = dateToInt(dateArgs.dateObj, cell.value.toString().includes(':'), dateArgs.type === 'time').toString();
                    }
                }
            }
            else {
                if (_this.checkAndProcessNegativeValue(args, cell.value)) {
                    args.formatApplied = true;
                    return args.formattedText;
                }
                dateArgs = { dateObj: intToDate(parseFloat(cell.value)) };
                isValidDate = dateArgs.dateObj && dateArgs.dateObj.toString() !== 'Invalid Date';
            }
            if (isValidDate) {
                if (checkDate) {
                    args.dateObj = dateArgs.dateObj;
                }
                args.formatApplied = true;
                var result = void 0;
                if (custFormat.startsWith('MM-dd-yyyy ')) { // While auto detect date time value, we will set this format only.
                    custFormat = custFormat.split(' ').splice(1).join(' ');
                    result = intl.formatDate(dateArgs.dateObj, { type: 'date', skeleton: 'yMd' }) + (custFormat ? ' ' +
                        intl.formatDate(dateArgs.dateObj, { type: type, format: custFormat }) : '');
                }
                else {
                    result = intl.formatDate(dateArgs.dateObj, { type: type, format: custFormat });
                    custFormat = custFormat.toLowerCase();
                    if (custFormat.startsWith('[h]')) {
                        var totalHours = (Number(cell.value.toString().split('.')[0]) * 24) + dateArgs.dateObj.getHours();
                        result = totalHours.toString() + result.slice(result.indexOf(']') + 1);
                    }
                    else if (custFormat.startsWith('[m')) {
                        var totalMins = (Number(cell.value.toString().split('.')[0]) * 1440) + (dateArgs.dateObj.getHours() * 60)
                            + dateArgs.dateObj.getMinutes();
                        result = totalMins.toString() + result.slice(result.indexOf(']') + 1);
                    }
                    else if (custFormat.startsWith('[s')) {
                        result = ((Number(cell.value.toString().split('.')[0]) * 86400) + (((dateArgs.dateObj.getHours() * 60) +
                            dateArgs.dateObj.getMinutes()) * 60) + dateArgs.dateObj.getSeconds()).toString();
                    }
                }
                if (isShortMeridian) {
                    return result.replace(_this.localeObj.am, 'A').replace(_this.localeObj.pm, 'P');
                }
                return result;
            }
            return '';
        };
        if (cell.format.indexOf('h') > -1) {
            custFormat = custFormat.split('h').join('H');
            type = 'time';
        }
        if (cell.format.indexOf('s') > -1) {
            type = 'time';
        }
        var isShortMeridian = cell.format.indexOf('A/P') > -1;
        if (cell.format.indexOf('AM/PM') > -1 || isShortMeridian) {
            custFormat = custFormat.split('H').join('h');
            custFormat = custFormat.split('A/P').join('AM/PM').split('AM/PM').join('a');
            type = 'time';
        }
        if (cell.format.indexOf('d') > -1) {
            type = 'date';
            // Split the format with ' ' for replacing d with E only for a day of the week in the MMM d, yyyy ddd format
            var formatArr = custFormat.split(' ');
            var dayMatchStr = void 0;
            for (var formatIdx = 0; formatIdx < formatArr.length; formatIdx++) {
                dayMatchStr = formatArr[formatIdx].match(/d/g);
                if (dayMatchStr && dayMatchStr.length > 2) {
                    formatArr[formatIdx] = formatArr[formatIdx].split('d').join('E');
                }
            }
            custFormat = formatArr.join(' ');
        }
        if (cell.format.indexOf('m') > -1) {
            if (cell.format.indexOf('s') > -1 || cell.format.indexOf('h') > -1) {
                type = 'time';
                if (cell.format.includes(' ')) {
                    var formatArr = custFormat.split(' ');
                    if (formatArr[0].includes('d') || formatArr[0].includes('y')) {
                        formatArr[0] = formatArr[0].split('m').join('M');
                        custFormat = formatArr.join(' ');
                    }
                }
            }
            else {
                type = 'date';
                custFormat = custFormat.split('m').join('M');
                if (cell.format.indexOf('mmmmm') > -1) {
                    custFormat = 'MMMM';
                    var monthName = formatDateTime()[0];
                    custFormat = cell.format.split('mmmmm').join('p');
                    return formatDateTime(args.checkDate).split('p').join(monthName);
                }
            }
        }
        return formatDateTime(args.checkDate);
    };
    WorkbookNumberFormat.prototype.processCustomConditions = function (cell, args) {
        if (isNumber(cell.value)) {
            var formatArr = cell.format.split(';');
            var val = Number(cell.value);
            var compareVal = void 0;
            var values = void 0;
            var conditionNotMatch = void 0;
            var colorCode = void 0;
            for (var i = 0; i < formatArr.length; i++) {
                cell.format = formatArr[i];
                colorCode = getColorCode(cell.format);
                if (colorCode) {
                    cell.format = cell.format.split("[" + colorCode + "]").join('');
                }
                if (cell.format.includes('[')) {
                    compareVal = cell.format.split('[')[1].split(']')[0];
                    if (((values = compareVal.split('<=')).length === 2 && val <= Number(values[1])) ||
                        (values.length === 1 && (values = compareVal.split('>=')).length === 2 && val >= Number(values[1])) ||
                        (values.length === 1 && (values = compareVal.split('<')).length === 2 && val < Number(values[1])) ||
                        (values.length === 1 && (values = compareVal.split('>')).length === 2 && val > Number(values[1]))) {
                        cell.format = formatArr[i].split("[" + compareVal + "]").join('');
                        conditionNotMatch = false;
                        break;
                    }
                    conditionNotMatch = values.length === 2;
                }
                else {
                    cell.format = formatArr[i];
                    conditionNotMatch = false;
                    break;
                }
            }
            if (conditionNotMatch) {
                this.removeFormatColor(args, { format: formatArr.join(''), style: cell.style });
                return this.processCustomFill('*#', cell, args, '#####');
            }
            return this.processCustomNumberFormat(cell, args);
        }
        else {
            return cell.value;
        }
    };
    WorkbookNumberFormat.prototype.processCustomAccounting = function (cell, args, curSymbol) {
        var formats = cell.format.split(';');
        var numObj = checkIsNumberAndGetNumber(cell, this.parent.locale, this.groupSep, this.decimalSep, curSymbol);
        var cellValue;
        if (numObj.isNumber) {
            cell.value = numObj.value;
            cellValue = parseFloat(numObj.value);
        }
        var format;
        if (cellValue > 0) {
            format = formats[0];
        }
        else if (cellValue === 0) {
            if (formats[2]) {
                format = formats[2].includes(curSymbol + "0") ? formats[2].split('0').join('#') : formats[2];
            }
            else {
                format = formats[0];
            }
        }
        else if (isNumber(cellValue)) {
            format = formats[1];
        }
        else {
            var cellVal = cell.value || cell.value === 0 ? cell.value : '';
            cell.format = '@';
            return formats[3] ? this.processCustomText(formats[3], cellVal, args) : cellVal.toString();
        }
        return this.processCustomNumberFormat({ format: cell.format, value: cellValue < 0 ? Math.abs(cellValue).toString() : cell.value, style: cell.style }, args, format);
    };
    WorkbookNumberFormat.prototype.processCustomText = function (format, cellVal, args) {
        cellVal = cellVal.toString();
        var result = this.processCustomNumberFormat({ format: format.split('@').join('#'), value: cellVal.split(cellVal).join('1') }, args);
        return result && result.split('1').join(cellVal);
    };
    WorkbookNumberFormat.prototype.thousandSeparator = function (count, value) {
        while (count) {
            value = value / 1000;
            count--;
        }
        return value;
    };
    WorkbookNumberFormat.prototype.getSeparatorCount = function (cell) {
        var count = 0;
        var codes = ['#', '0'];
        for (var i = 0; i < cell.format.length; i++) {
            if (cell.format[i] === ',' && !(codes.indexOf(cell.format[i + 1]) > -1)) {
                count++;
            }
        }
        return count;
    };
    WorkbookNumberFormat.prototype.processDigits = function (cell, customFormat) {
        customFormat = customFormat.split('?').join('0');
        var cellValue = cell.value.toString();
        cellValue = this.getFormattedNumber(customFormat, parseFloat(cellValue));
        if (cellValue && cellValue.includes(this.decimalSep)) {
            var valArr = cellValue.split(this.decimalSep);
            cellValue = valArr[0] + this.decimalSep + valArr[1].split('0').join('  ');
        }
        return cellValue || cell.value;
    };
    WorkbookNumberFormat.prototype.processFormatWithSpace = function (format, cell, cellValue) {
        var space = ' ';
        var args = { cell: cell, char: space, width: 0 };
        this.parent.notify(getTextSpace, args);
        var spaceWidth = args.width;
        var count;
        var result = { format: format, formattedText: '' };
        for (var i = 0; i < format.length; i++) {
            if (format[i] === '_') {
                args.char = format[i + 1];
                this.parent.notify(getTextSpace, args);
                var textWidth = args.width;
                count = Math.round(textWidth / spaceWidth);
                format = format.replace(format[i] + format[i + 1], space.repeat(count));
            }
        }
        var lastSpaceCount = format.length - format.trim().length;
        if (lastSpaceCount > 0) {
            result.formattedText = this.getFormattedNumber(format.trim(), cellValue);
            if (format[0] === ' ') {
                var frontSpaceCount = 1;
                var idx = 1;
                while (format[idx] === ' ') {
                    frontSpaceCount++;
                    idx++;
                }
                lastSpaceCount -= frontSpaceCount;
                result.formattedText = space.repeat(frontSpaceCount) + result.formattedText;
            }
            result.formattedText += space.repeat(lastSpaceCount);
        }
        else {
            result.formattedText = this.getFormattedNumber(format, cellValue);
        }
        result.format = format;
        return result;
    };
    WorkbookNumberFormat.prototype.removeFormatColor = function (args, cell) {
        if (getCustomColors().indexOf(getColorCode(cell.format)) > -1) {
            args.color = cell.style && cell.style.color ? cell.style.color : '';
            this.applyColor(args);
        }
    };
    WorkbookNumberFormat.prototype.processCustomNumberFormat = function (cell, args, format) {
        if (!cell.format) {
            return '';
        }
        var isFormatted;
        var isZeroFormat;
        var formattedText = cell.value;
        var cellValue = cell && checkIsNumberAndGetNumber(cell, this.parent.locale, this.groupSep, this.decimalSep).value;
        if (isNumber(cellValue)) {
            cell.value = cellValue;
            cellValue = parseFloat(cellValue.toString());
            var customFormat = format || cell.format;
            if (cell.format.indexOf('[') > -1) {
                var colorCode = getColorCode(customFormat);
                if (colorCode) {
                    customFormat = customFormat.split("[" + colorCode + "]").join('');
                    args.color = colorCode.toLowerCase();
                    this.applyColor(args);
                }
                else {
                    this.removeFormatColor(args, cell);
                }
            }
            if (customFormat.indexOf('"') > -1 || customFormat.indexOf('\\') > -1) {
                customFormat = this.processText(customFormat);
                isZeroFormat = cellValue === 0 && !customFormat.includes('#') && !customFormat.includes('0') && !customFormat.includes('?');
                if (isZeroFormat) {
                    customFormat += '#';
                }
            }
            var separatorCount = this.getSeparatorCount(cell);
            if (separatorCount) {
                isFormatted = true;
                var result = this.thousandSeparator(separatorCount, cellValue);
                if (customFormat.indexOf('.') === -1) {
                    result = Math.round(result);
                }
                formattedText = this.getFormattedNumber(customFormat.split(',').join(''), result);
                if (result === 0) {
                    formattedText = formattedText.replace('0', '');
                }
            }
            if (customFormat.indexOf('?') > -1) {
                isFormatted = true;
                formattedText = this.processDigits(cell, customFormat);
                customFormat = customFormat.split('?').join('');
            }
            if (customFormat.indexOf('_') > -1) {
                isFormatted = true;
                var result = this.processFormatWithSpace(customFormat, cell, cellValue);
                customFormat = result.format;
                formattedText = result.formattedText;
            }
            if (formattedText && customFormat.indexOf('?') > -1) {
                formattedText = formattedText.replace('?', ' ');
            }
            if (customFormat.indexOf('*') > -1) {
                isFormatted = true;
                formattedText = this.processCustomFill(customFormat, cell, args);
            }
            if (customFormat === 'General') {
                isFormatted = true;
                formattedText = cellValue.toString();
            }
            if (!isFormatted) {
                formattedText = this.getFormattedNumber(customFormat, cellValue);
            }
            if (isZeroFormat && formattedText) {
                formattedText = formattedText.replace('0', '');
            }
            // Need to remove this line once this case is handled by core team.
            if (customFormat[0] === '#' && cellValue >= 0 && cellValue < 1) {
                var formatArr = customFormat.split('#').join('').split('.');
                if (!formatArr[0].includes('0')) {
                    if (cellValue === 0 && customFormat.includes('.') && (!formatArr[1] || !formatArr[1].includes('0'))) {
                        formattedText = this.getFormattedNumber(customFormat, 0.1);
                        formattedText = formattedText.replace('1', '');
                    }
                    var textArr = formattedText.split(this.decimalSep);
                    textArr[0] = textArr[0].toString().replace(/^0+/, '');
                    formattedText = textArr.join(this.decimalSep);
                }
            }
            if (formattedText === '-0') { // Need to remove this line once this case is handled by core team.
                formattedText = '0';
            }
        }
        return formattedText;
    };
    WorkbookNumberFormat.prototype.processText = function (format) {
        var custFormat = format;
        if (custFormat.indexOf('"') > -1) {
            custFormat = custFormat.split('"').join('');
        }
        else if (custFormat.indexOf('\\') > -1) {
            custFormat = custFormat.split('\\').join('');
        }
        return custFormat;
    };
    WorkbookNumberFormat.prototype.processFormats = function (args, fResult, isRightAlign, cell, intl, currencySymbol, currencyCode, sheet) {
        var options;
        if (fResult !== '') {
            var numArgs = void 0;
            switch (args.type) {
                case 'General':
                    options = { args: args, currencySymbol: currencySymbol, fResult: fResult, intl: intl, isRightAlign: isRightAlign,
                        curCode: currencyCode, cell: cell, rowIdx: Number(args.rowIndex), colIdx: Number(args.colIndex), sheet: sheet };
                    this.autoDetectGeneralFormat(options);
                    fResult = options.fResult;
                    isRightAlign = options.isRightAlign;
                    break;
                case 'Number':
                    numArgs = checkIsNumberAndGetNumber({ value: fResult }, this.parent.locale, this.groupSep, this.decimalSep);
                    if (numArgs.isNumber) {
                        cell.value = args.value = numArgs.value;
                        fResult = this.applyNumberFormat(args, intl);
                        isRightAlign = true;
                    }
                    break;
                case 'Currency':
                    numArgs = checkIsNumberAndGetNumber({ value: fResult, format: args.format }, this.parent.locale, this.groupSep, this.decimalSep, currencySymbol);
                    if (numArgs.isNumber) {
                        cell.value = args.value = numArgs.value;
                        fResult = this.currencyFormat(args, intl, currencyCode, cell);
                        isRightAlign = true;
                    }
                    break;
                case 'Percentage':
                    numArgs = checkIsNumberAndGetNumber({ value: fResult }, this.parent.locale, this.groupSep, this.decimalSep);
                    if (numArgs.isNumber || (fResult && this.isPercentageValue(fResult.toString(), args, cell))) {
                        if (numArgs.isNumber) {
                            cell.value = args.value = numArgs.value;
                        }
                        fResult = this.percentageFormat(args, intl);
                        isRightAlign = true;
                    }
                    break;
                case 'Accounting':
                    fResult = this.accountingFormat(args, fResult, intl, currencySymbol, currencyCode, cell);
                    isRightAlign = args.formatApplied;
                    break;
                case 'ShortDate':
                    fResult = this.checkAndProcessNegativeValue(args, args.value) ? args.formattedText : this.shortDateFormat(args, intl);
                    isRightAlign = !!fResult;
                    break;
                case 'LongDate':
                    fResult = this.checkAndProcessNegativeValue(args, args.value) ? args.formattedText : this.longDateFormat(args, intl);
                    isRightAlign = !!fResult;
                    break;
                case 'Time':
                    fResult = this.checkAndProcessNegativeValue(args, args.value) ? args.formattedText : this.timeFormat(args, intl);
                    isRightAlign = !!fResult;
                    break;
                case 'Fraction':
                    numArgs = checkIsNumberAndGetNumber({ value: fResult }, this.parent.locale, this.groupSep, this.decimalSep);
                    if (numArgs.isNumber) {
                        cell.value = args.value = numArgs.value;
                        fResult = this.fractionFormat(args);
                        isRightAlign = true;
                    }
                    break;
                case 'Scientific':
                    numArgs = checkIsNumberAndGetNumber({ value: fResult }, this.parent.locale, this.groupSep, this.decimalSep);
                    if (numArgs.isNumber) {
                        cell.value = args.value = numArgs.value;
                        fResult = this.scientificFormat(args);
                        isRightAlign = true;
                    }
                    break;
                case 'Text':
                    if (this.decimalSep !== '.' && isNumber(fResult) && fResult.toString().includes('.')) {
                        fResult = fResult.toString().replace('.', this.decimalSep);
                    }
                    isRightAlign = false;
                    break;
            }
        }
        return { fResult: fResult, rightAlign: isRightAlign };
    };
    WorkbookNumberFormat.prototype.autoDetectGeneralFormat = function (options) {
        var val = options.fResult;
        var prevVal;
        var addressFormula = options.args.cell && options.args.cell.formula && options.args.cell.formula.indexOf('ADDRESS(') > 0;
        var isDollarFormula = options.args.cell && options.args.cell.formula && options.args.cell.formula.indexOf('DOLLAR(') > 0;
        if (isDollarFormula && options.fResult && options.fResult.toString().includes(options.currencySymbol)) {
            return;
        }
        if (options.fResult && this.decimalSep !== '.') {
            var cellVal = options.fResult.toString();
            prevVal = cellVal;
            if (cellVal.includes(this.decimalSep)) {
                cellVal = cellVal.replace(this.decimalSep, '.');
                if (isNumber(cellVal)) {
                    options.fResult = options.args.value = cellVal = Number(cellVal).toString();
                    setCell(options.rowIdx, options.colIdx, options.sheet, { value: cellVal }, true);
                }
            }
        }
        if (isNumber(options.fResult)) {
            var cellVal = Number(options.fResult).toString();
            if (options.args.format) {
                if (options.args.format.indexOf('%') > -1) {
                    options.fResult = this.percentageFormat(options.args, options.intl);
                }
                else if (options.args.format.indexOf(options.currencySymbol) > -1) {
                    options.fResult = this.currencyFormat(options.args, options.intl, options.curCode, options.args.cell);
                }
                else {
                    options.fResult = this.applyNumberFormat(options.args, options.intl);
                }
            }
            if (options.args.format === 'General') {
                if (options.args.cell && options.args.cell.formula && cellVal.includes('.') && cellVal.length > 11) {
                    var decIndex = cellVal.indexOf('.') + 1;
                    if (options.args.cell.formula.includes('RANDBETWEEN')) {
                        options.fResult = cellVal = decIndex < 7 ? cellVal : (parseFloat(cellVal)).toFixed(0);
                    }
                    else {
                        options.fResult = cellVal = decIndex < 11 ? Number(parseFloat(cellVal).toFixed(11 - decIndex)).toString() :
                            parseFloat(cellVal).toFixed(0);
                    }
                }
                var cellValArr = cellVal.split('.');
                if (cellValArr[0].length > 11) {
                    cellVal = (Math.abs(Number(cellValArr[0])).toString()).substring(0, 6).replace(/0+$/, '');
                    var digitLen = cellVal.length - 1;
                    if (digitLen > -1) {
                        options.fResult = this.scientificFormat(options.args, digitLen > 5 ? 5 : digitLen);
                    }
                }
                else if (cellValArr[1]) {
                    if (cellValArr[1].length > 9) {
                        options.fResult = options.intl.formatNumber(Number(cellVal), { format: '0.000000000' });
                        if (options.fResult) {
                            options.fResult = Number(options.fResult).toString();
                        }
                    }
                    else if (cellVal.includes('e-')) {
                        var expVal = cellVal.split('e-');
                        var digitLen = Number(expVal[1]) + (expVal[0].includes('.') ? expVal[0].split('.')[1].length : 0);
                        expVal[0] = expVal[0].replace('.', this.decimalSep);
                        if (expVal[1].length === 1) {
                            expVal[1] = '0' + expVal[1];
                        }
                        setCell(options.rowIdx, options.colIdx, options.sheet, { value: Number(cellVal).toFixed(digitLen) }, true);
                        options.fResult = expVal.join('E-');
                    }
                    else if (prevVal) {
                        options.fResult = prevVal;
                    }
                }
            }
            options.isRightAlign = true;
        }
        if (options.fResult) {
            var res = options.fResult.toString();
            if (this.isPercentageValue(res, options.args, options.cell)) {
                options.cell.format = options.args.format = res.includes(this.decimalSep) ? getFormatFromType('Percentage') : '0%';
                options.fResult = this.percentageFormat(options.args, options.intl);
                options.isRightAlign = true;
            }
            else {
                var format = '';
                if (res.includes(options.currencySymbol)) { // Auto detect 1000 separator format with currency symbol
                    format = res.includes(this.decimalSep) ? '$#,##0.00' : '$#,##0';
                    res = res.replace(options.currencySymbol, '');
                }
                var isEdit = this.decimalSep === '.' || options.args.isEdit;
                if (isEdit && res.includes(this.groupSep) && parseThousandSeparator(res, this.parent.locale, this.groupSep, this.decimalSep)) {
                    res = res.split(this.groupSep).join('');
                    if (!format) { // Auto detect 1000 separator format
                        format = (res.includes(this.decimalSep) ? '#,##0.00' : '#,##0');
                    }
                }
                if (format) {
                    res = res.replace(this.decimalSep, '.');
                    if (isNumber(res)) {
                        options.args.value = Number(res).toString();
                        setCell(options.rowIdx, options.colIdx, options.sheet, { value: options.args.value, format: format }, true);
                        options.fResult = this.getFormattedNumber(format, Number(options.args.value));
                        options.isRightAlign = true;
                    }
                }
                else if (this.decimalSep !== '.' && options.args.format === 'General' && isNumber(res) && res.includes('.')) {
                    options.fResult = res.replace('.', this.decimalSep);
                }
            }
        }
        if (addressFormula) {
            options.isRightAlign = false;
            options.fResult = val;
        }
    };
    WorkbookNumberFormat.prototype.isPercentageValue = function (value, args, cell) {
        if (value.includes('%')) {
            var valArr = value.split('%');
            if (valArr[0] !== '' && valArr[1].trim() === '' && Number(valArr[0].split(this.groupSep).join('')).toString() !== 'NaN') {
                args.value = Number(valArr[0].split(this.groupSep).join('')) / 100;
                cell.value = args.value.toString();
                return true;
            }
        }
        return false;
    };
    WorkbookNumberFormat.prototype.findSuffix = function (zeros, resultSuffix) {
        var len = zeros.length;
        var suffixLen = len - resultSuffix.length;
        return zeros.substr(0, suffixLen < 0 ? 0 : suffixLen) + resultSuffix;
    };
    WorkbookNumberFormat.prototype.applyNumberFormat = function (args, intl) {
        args.format = this.isCustomFormat(args.format);
        var formatArr = args.format.split(';');
        if (Number(args.value) > 0) {
            args.format = formatArr[0];
        }
        else if (Number(args.value) === 0) {
            args.format = formatArr[2] ? formatArr[2] : formatArr[0];
            if (args.format.indexOf('"') > -1 && args.format.indexOf('#') === -1) {
                args.format = args.format.split('_').join(' ').split('*').join(' ').split('?').join(' ').split('"').join('');
                return args.format;
            }
        }
        else if (Number(args.value) < 0) {
            args.format = !isNullOrUndefined(formatArr[1]) ? formatArr[1].split('*').join(' ') : formatArr[0];
            if (args.format.indexOf('-') > -1) {
                args.value = args.value.toString().split('-').join('');
            }
        }
        else {
            args.format = formatArr[3] ? formatArr[3] : formatArr[0];
            args.format = args.format.split('_').join(' ').split('*').join(' ').split('?').join(' ');
            if (args.format.indexOf('@') > -1) {
                return args.format.split('@').join(args.value.toString());
            }
        }
        args.format = args.format.split('_').join(' ').split('*').join(' ').split('"').join('');
        if (args.format.indexOf('?') > -1 && args.format.indexOf(this.decimalSep) > -1) {
            var formatDecimalLen = args.format.split(this.decimalSep)[1].length;
            var replaceString = '';
            if (Number(args.value) % 1) {
                var valueDecimalLen = args.value.toString().split('.')[1].length;
                if (formatDecimalLen > valueDecimalLen) {
                    replaceString = ' ';
                }
                else {
                    replaceString = '0';
                }
            }
            args.format = args.format.split('?').join(replaceString);
        }
        else {
            args.format = args.format.split('?').join(' ');
        }
        if (Number(args.value) < 0 && args.cell && args.cell.format) {
            args.format = args.cell.format;
        }
        return intl.formatNumber(Number(args.value), { format: args.format });
    };
    WorkbookNumberFormat.prototype.isCustomFormat = function (format) {
        if (format === '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"_-;_-@_-' || format === '_-* #,##0_-;-* #,##0_-;_-* "-"_-;_-@_-') {
            format = '';
        }
        format = format === '' ? getFormatFromType('Number') : format;
        format = format.toString().split('_)').join(' ').split('_(').join(' ').split('[Red]').join('');
        return format;
    };
    WorkbookNumberFormat.prototype.currencyFormat = function (args, intl, currencyCode, cell) {
        args.format = args.format || getFormatFromType('Currency');
        args.format = args.format.split('_(').join(' ').split('_)').join(' ');
        var formatArr = args.format.split(';');
        var colorCode = getColorCode(args.format);
        var cellVal = Number(args.value);
        if (cellVal >= 0 || isNullOrUndefined(formatArr[1])) {
            if (colorCode) {
                args.color = cell.style && cell.style.color ? cell.style.color : '';
                this.applyColor(args);
            }
            args.format = formatArr[0];
        }
        else {
            cellVal = Math.abs(cellVal);
            args.format = formatArr[1].split("[" + colorCode + "]").join('').split('*').join(' ');
            if (colorCode) {
                args.color = colorCode.toLowerCase();
                this.applyColor(args);
            }
        }
        args.format = this.getFormatForOtherCurrency(args.format);
        return intl.formatNumber(cellVal, { format: args.format, currency: currencyCode });
    };
    WorkbookNumberFormat.prototype.applyColor = function (args) {
        if (args.refresh) {
            this.setCell(args);
            if (args.td && args.td.style.color !== args.color) {
                this.parent.notify(applyCellFormat, { style: { color: args.color }, rowIdx: args.rowIndex, colIdx: args.colIndex,
                    cell: args.td });
            }
        }
    };
    WorkbookNumberFormat.prototype.setCell = function (args) {
        if (!args.td) {
            var mergeArgs = { sheet: getSheet(this.parent, args.sheetIndex), cell: args.cell, rowIdx: args.rowIndex,
                colIdx: args.colIndex };
            if (args.cell.rowSpan > 1 || args.cell.colSpan > 1) {
                setVisibleMergeIndex(mergeArgs);
            }
            args.td = this.parent.getCell(mergeArgs.rowIdx, mergeArgs.colIdx);
        }
    };
    WorkbookNumberFormat.prototype.percentageFormat = function (args, intl) {
        args.format = args.format === '' ? getFormatFromType('Percentage') : args.format;
        return intl.formatNumber(Number(args.value), {
            format: args.format
        });
    };
    WorkbookNumberFormat.prototype.accountingFormat = function (args, fResult, intl, currencySymbol, currencyCode, cell) {
        args.format = args.format || getFormatFromType('Accounting');
        args.format = args.format.split('_(').join(' ').split('_)').join(' ').split('[Red]').join('').split('_').join('');
        var formatArr = args.format.split(';');
        var numArgs = checkIsNumberAndGetNumber({ value: fResult }, this.parent.locale, this.groupSep, this.decimalSep);
        if (numArgs.isNumber) {
            cell.value = args.value = numArgs.value;
            var cellVal = Number(args.value);
            if (cellVal >= 0) {
                args.format = cellVal === 0 && formatArr[2] ? formatArr[2] : formatArr[0];
            }
            else {
                args.format = formatArr[1].split('*').join(' ');
                cellVal = Math.abs(cellVal);
            }
            if (!args.format.includes(currencySymbol) && !args.format.includes('$')) {
                currencyCode = currencySymbol = '';
            }
            args.format = this.getFormatForOtherCurrency(args.format);
            args.formatApplied = true;
            if (cellVal === 0) {
                return (args.format.includes(" " + currencySymbol) ? ' ' : '') + currencySymbol + '- ';
            }
            else {
                return intl.formatNumber(cellVal, { format: args.format, currency: currencyCode });
            }
        }
        else if (formatArr[3]) {
            return this.processCustomText(formatArr[3], fResult, args);
        }
        return fResult;
    };
    WorkbookNumberFormat.prototype.getFormatForOtherCurrency = function (format) {
        if (format.indexOf('[$') > -1) {
            var symbol = format.split(']')[0].split('[$')[1].split('-')[0];
            if (format.indexOf('0') > format.indexOf('[$')) {
                format = symbol + format.slice(format.indexOf(']') + 1, format.length);
            }
            else {
                format = format.slice(0, format.indexOf('[$')) + symbol;
            }
        }
        return format;
    };
    WorkbookNumberFormat.prototype.checkAndProcessNegativeValue = function (args, cellValue) {
        if (cellValue && isNumber(cellValue) && Number(cellValue) < 0) {
            if (args.rowIndex === undefined || args.dataUpdate) {
                args.formattedText = '#'.repeat(args.dataUpdate ? 7 : 10);
                return true;
            }
            args.isRowFill = true;
            this.setCell(args);
            var eventArgs = { cell: args.cell, cellEle: args.td, rowIdx: args.rowIndex, colIdx: args.colIndex,
                repeatChar: '#' };
            this.parent.notify(rowFillHandler, eventArgs);
            args.formattedText = eventArgs.formattedText;
            return true;
        }
        return false;
    };
    WorkbookNumberFormat.prototype.shortDateFormat = function (args, intl) {
        var format = (args.format === '' || args.format === 'General') ? getFormatFromType('ShortDate') : args.format;
        var dateObj;
        if (format === getFormatFromType('ShortDate')) {
            format = 'MM-dd-yyyy';
            dateObj = { type: 'date', skeleton: 'yMd' };
        }
        else {
            dateObj = { type: 'date', format: format };
        }
        if (args.value) {
            args.value = args.value.toString();
            if ((args.value.includes(this.localeObj.dateSeparator) || args.value.indexOf('-') > 0) && !isNumber(args.value)) {
                if (format === 'dd-MM-yyyy' || format === 'dd/MM/yyyy') {
                    format = '';
                }
                var obj = toDate(args.value, intl, this.parent.locale, format, args.cell).dateObj;
                if (obj && obj.toString() !== 'Invalid Date') {
                    if (obj.getFullYear() < 1900) {
                        return isNumber(args.value) ? args.value : '';
                    }
                    args.value = dateToInt(obj).toString();
                    if (args.cell) {
                        args.cell.value = args.value;
                    }
                    if (args.checkDate) {
                        args.dateObj = obj;
                    }
                    return intl.formatDate(obj, dateObj);
                }
            }
        }
        var shortDate = intToDate(args.value);
        if (shortDate && shortDate.toString() !== 'Invalid Date' && shortDate.getFullYear() < 1900) {
            return isNumber(args.value) ? args.value.toString() : '';
        }
        if (args.checkDate) {
            args.dateObj = shortDate;
        }
        return intl.formatDate(shortDate, dateObj);
    };
    WorkbookNumberFormat.prototype.longDateFormat = function (args, intl) {
        args.value = args.value.toString();
        var longDate;
        if ((args.value.includes(this.localeObj.dateSeparator) || args.value.indexOf('-') > 0) && !isNumber(args.value)) {
            longDate = toDate(args.value, intl, this.parent.locale, '', args.cell).dateObj;
            if (longDate && longDate.toString() !== 'Invalid Date' && longDate.getFullYear() >= 1900) {
                args.value = dateToInt(longDate).toString();
                if (args.cell) {
                    args.cell.value = args.value;
                }
            }
            else {
                return isNumber(args.value) ? args.value : '';
            }
        }
        else {
            longDate = intToDate(args.value);
            if (longDate && longDate.toString() !== 'Invalid Date' && longDate.getFullYear() < 1900) {
                return isNumber(args.value) ? args.value : '';
            }
        }
        var code = (args.format === '' || args.format === 'General') ? getFormatFromType('LongDate')
            : args.format.toString();
        if (code === getFormatFromType('LongDate')) {
            code = 'EEEE, MMMM d, y';
        }
        if (args.checkDate) {
            args.dateObj = longDate;
        }
        return intl.formatDate(longDate, { type: 'date', format: code });
    };
    WorkbookNumberFormat.prototype.timeFormat = function (args, intl) {
        if (isNullOrUndefined(args.value)) {
            return '';
        }
        var code = (args.format === '' || args.format === 'General') || args.format === getFormatFromType('Time') ? 'h:mm:ss a' :
            args.format;
        var cellVal = args.value.toString();
        if (!isNumber(cellVal) && cellVal.includes(this.localeObj.timeSeparator)) {
            var obj = toDate(cellVal, intl, this.parent.locale, code, args.cell);
            if (obj.dateObj && obj.dateObj.toString() !== 'Invalid Date') {
                cellVal = args.value = dateToInt(obj.dateObj, true, obj.type && obj.type === 'time').toString();
                if (args.cell) {
                    args.cell.value = args.value;
                }
            }
            else {
                return '';
            }
        }
        var value = cellVal.split('.');
        if (!isNullOrUndefined(value[1])) {
            args.value = parseFloat((value[0] + 1) + '.' + value[1]) || args.value;
        }
        return intl.formatDate(intToDate(args.value), { type: 'time', skeleton: 'medium', format: code });
    };
    WorkbookNumberFormat.prototype.scientificHashFormat = function (args, fArr) {
        var fractionCount = this.findDecimalPlaces(args.format);
        var wholeCount = (fArr[0].split('0').length - 1) + (fArr[0].split('#').length - 1);
        var formattedVal = Number(args.value).toExponential(fractionCount + wholeCount);
        var expoSeparator;
        if (formattedVal.includes('e+')) {
            expoSeparator = 'e+';
        }
        else if (formattedVal.includes('e-')) {
            expoSeparator = 'e-';
        }
        else {
            return formattedVal;
        }
        var exponentArr = formattedVal.split(expoSeparator);
        var decimalArr = exponentArr[0].split('.');
        var exponent = Number(exponentArr[1]);
        var fractionDiff;
        if (expoSeparator === 'e-') {
            var expoVal = exponent + Math.abs(exponent - (wholeCount * (exponent > wholeCount ? 2 : 1)));
            fractionDiff = expoVal - exponent;
            exponentArr[1] = expoVal.toString();
        }
        else {
            fractionDiff = exponent % wholeCount;
            exponentArr[1] = (exponent - fractionDiff).toString();
        }
        if (fractionDiff > 0) {
            decimalArr[0] += decimalArr[1].substring(0, fractionDiff);
            decimalArr[1] = decimalArr[1].slice(fractionDiff);
            exponentArr[0] = decimalArr.join('.');
        }
        var base = Number('1' + '0'.repeat(fractionCount));
        return this.getFormattedNumber(fArr.join('.'), Number((Math.round(Number(exponentArr[0]) * base) / base).toFixed(fractionCount))) +
            expoSeparator.toUpperCase() + this.findSuffix(args.format.split('+')[1], exponentArr[1]);
    };
    WorkbookNumberFormat.prototype.scientificFormat = function (args, prefix) {
        args.format = args.format === '' ? getFormatFromType('Scientific') : args.format;
        var zeros = args.format.split('+')[1] || '00';
        if (prefix === undefined) {
            prefix = this.findDecimalPlaces(args.format);
        }
        var fResult = Number(args.value).toExponential(prefix);
        if (fResult.indexOf('e+') > -1) {
            fResult = fResult.split('e+')[0] + 'E+' + this.findSuffix(zeros, fResult.split('e+')[1]);
        }
        else if (fResult.indexOf('e-') > -1) {
            fResult = fResult.split('e-')[0] + 'E-' + this.findSuffix(zeros, fResult.split('e-')[1]);
        }
        return fResult.replace('.', this.decimalSep);
    };
    WorkbookNumberFormat.prototype.fractionFormat = function (args) {
        args.format = args.format || getFormatFromType('Fraction');
        this.checkAndSetColor(args);
        var valArr = args.value.toString().split('.');
        var suffixVal = this.getFormattedNumber(args.format.split(' ')[0], Number(valArr[0]));
        var fractionDigit = args.format.split('?').length / 2;
        if (valArr.length === 2 && !valArr[1].startsWith('0'.repeat(fractionDigit))) {
            var fractionResult = toFraction(Number(args.value));
            if (fractionResult) {
                return suffixVal + " " + fractionResult;
            }
        }
        return suffixVal + ' ' + '  '.repeat(fractionDigit * 2);
    };
    WorkbookNumberFormat.prototype.checkAndSetColor = function (args) {
        var colorCode = getColorCode(args.format);
        if (colorCode) {
            args.format = args.format.split("[" + colorCode + "]").join('');
            args.color = colorCode.toLowerCase();
            this.applyColor(args);
        }
    };
    WorkbookNumberFormat.prototype.findDecimalPlaces = function (code) {
        var eIndex = code.toUpperCase().indexOf('E');
        if (eIndex > -1) {
            var decIndex = code.indexOf(this.decimalSep);
            if (decIndex === -1 && this.decimalSep !== '.') {
                decIndex = code.indexOf('.');
            }
            return decIndex > 0 ? code.substring(decIndex + 1, eIndex).length : 0;
        }
        return 2;
    };
    WorkbookNumberFormat.prototype.checkDateFormat = function (args) {
        if (isNullOrUndefined(args.value)) {
            return;
        }
        var cell = args.cell || getCell(args.rowIndex, args.colIndex, getSheet(this.parent, isNullOrUndefined(args.sheetIndex) ? this.parent.activeSheetIndex : args.sheetIndex), false, true);
        var props = this.checkCustomDateFormat(args.value.toString(), cell, args.isEdit);
        if (props.val !== 'Invalid') {
            var dateObj = toDate(props.val, args.intl || new Internationalization(), this.parent.locale, props.format, cell);
            if (!isNullOrUndefined(dateObj.dateObj) && dateObj.dateObj.toString() !== 'Invalid Date' &&
                dateObj.dateObj.getFullYear() >= 1900) {
                props.val = dateToInt(dateObj.dateObj, props.val.indexOf(':') > -1, dateObj.type && dateObj.type === 'time').toString();
                if (!cell.format || cell.format === 'General') {
                    if (dateObj.type === 'time') {
                        cell.format = getFormatFromType('Time');
                    }
                    else {
                        cell.format = getFormatFromType('ShortDate');
                    }
                }
                args.isDate = dateObj.type === 'date' || dateObj.type === 'datetime';
                args.isTime = dateObj.type === 'time';
                args.dateObj = dateObj.dateObj;
            }
            args.updatedVal = props.val;
        }
    };
    WorkbookNumberFormat.prototype.checkCustomTimeFormat = function (val, cell) {
        var _this = this;
        var format = [];
        var am = " " + this.localeObj.am;
        var pm = " " + this.localeObj.pm;
        var isTewlveHr = val.includes(am) || val.includes(pm);
        if (!isTewlveHr) {
            if (val.includes(am.toLowerCase()) || val.includes(pm.toLowerCase())) {
                val = val.replace(am.toLowerCase(), am).replace(pm.toLowerCase(), pm);
                isTewlveHr = true;
            }
        }
        var timeArr = val.split(this.localeObj.timeSeparator);
        var isDefaultTime = timeArr.length === 3 && isTewlveHr;
        var twelveHrRep;
        if (timeArr.length <= 3) {
            var timeProp_1;
            var valArr_1;
            var maxHour_1 = isTewlveHr ? 12 : 24;
            timeArr.forEach(function (timeVal, index) {
                if (timeVal.includes(am) || timeVal.includes(pm)) {
                    twelveHrRep = ' AM/PM';
                    timeVal = timeVal.replace(am, '').replace(pm, '');
                }
                else {
                    twelveHrRep = '';
                }
                timeProp_1 = Number(timeVal);
                if (isNumber(timeProp_1) && timeProp_1 >= 0) {
                    if (timeProp_1 <= maxHour_1 && index === 0) {
                        format.push('h' + twelveHrRep);
                        if (timeArr.length === 1) {
                            if (twelveHrRep) {
                                valArr_1 = val.split(' ');
                                valArr_1[0] += _this.localeObj.timeSeparator + "00";
                                timeArr[0] = valArr_1.join(' ');
                            }
                            else {
                                format = [];
                                val = 'Invalid';
                            }
                        }
                    }
                    else if (timeProp_1 <= 60 && (format.length === 1 || format.length === 2)) {
                        if (format.length === 1) {
                            format.push('mm' + twelveHrRep);
                        }
                        else {
                            format.push('ss');
                        }
                        if (timeVal.length === 1) {
                            timeArr[index] = "0" + timeArr[index];
                        }
                    }
                    else {
                        format = [];
                        val = 'Invalid';
                    }
                }
                else {
                    format = [];
                    val = 'Invalid';
                }
            });
        }
        if (format.length) {
            val = timeArr.join(this.localeObj.timeSeparator);
            if ((!cell.format || cell.format === 'General') && !isDefaultTime) {
                cell.format = format.join(':');
                return { val: val, format: cell.format };
            }
        }
        return { val: val, format: '' };
    };
    WorkbookNumberFormat.prototype.checkCustomDateFormat = function (val, cell, isEdit) {
        var _this = this;
        var separator;
        var cellFormat = cell.format;
        var timeArgs;
        if (val.includes(this.localeObj.dateSeparator) && ((!val.includes(" " + this.localeObj.am) &&
            !val.includes(" " + this.localeObj.pm)) ||
            val.replace(" " + this.localeObj.am, '').replace(" " + this.localeObj.pm, '').includes(this.localeObj.dateSeparator))) {
            separator = this.localeObj.dateSeparator;
            if (val.includes(this.localeObj.timeSeparator) && val.includes(' ')) {
                var valArr = val.split(' ');
                val = valArr.shift();
                timeArgs = this.checkCustomTimeFormat(valArr.join(' '), cell);
                if (timeArgs.val === 'Invalid') {
                    return { val: 'Invalid', format: '' };
                }
            }
        }
        else if (val.indexOf('-') > 0) {
            separator = '-';
        }
        else {
            if (val.includes(this.localeObj.timeSeparator) || val.includes(" " + this.localeObj.am) ||
                val.includes(" " + this.localeObj.pm)) {
                return this.checkCustomTimeFormat(val, cell);
            }
            return { val: 'Invalid', format: '' };
        }
        var dateArr = val.split(separator);
        var format = '';
        var formatArr = [];
        var updateFormat = function () {
            format = formatArr.join(separator);
            if (!cellFormat || cellFormat === 'General') {
                cell.format = format + (cell.format && cell.format !== 'General' ? " " + cell.format : '');
            }
        };
        var firstVal;
        var formats = IntlBase.getDependables(cldrData, this.parent.locale, null).dateObject;
        var months = formats.months['stand-alone'] ? formats.months['stand-alone'].wide : {};
        var abbreviatedMonth = formats.months['stand-alone'] ? formats.months['stand-alone'].abbreviated : { '1': '' };
        var enUSMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var isMonth = function (monthValue, monthKey, dateVal, dateLength) {
            if (abbreviatedMonth["" + monthKey] && abbreviatedMonth["" + monthKey].toLowerCase() === dateVal) {
                firstVal = abbreviatedMonth["" + monthKey];
                return;
            }
            var shortMonthValue = monthValue.substring(0, dateLength);
            if (shortMonthValue === dateVal) {
                firstVal = abbreviatedMonth["" + monthKey] || enUSMonth[Number(monthKey) - 1];
            }
        };
        if (dateArr.length === 2) {
            var updateSecValue = function (secVal) {
                val = firstVal;
                formatArr[0] = 'MMM';
                if (Number(secVal) <= 31) {
                    val = secVal + separator + val;
                    if (_this.localeObj.dateSeparator !== '/' && separator !== '-') {
                        val += separator + new Date().getFullYear();
                    }
                    formatArr.splice(0, 0, 'dd');
                    updateFormat();
                }
                else if (Number(secVal) >= 1900 && Number(secVal) <= 9999) {
                    val = '1' + separator + val + separator + secVal;
                    formatArr[1] = 'yy';
                    updateFormat();
                    // Changed year format alone when given year value with 4 digits like May-2022
                    formatArr[1] = 'yyyy';
                    format = formatArr.join(separator);
                }
                else {
                    val = 'Invalid'; //Set as Invalid for invalid data like May-June.
                }
            };
            dateArr[0] = dateArr[0].toLowerCase().trim();
            dateArr[1] = dateArr[1].toLowerCase().trim();
            if (!Number(dateArr[0]) && dateArr[0].length >= abbreviatedMonth['1'].length) {
                Object.keys(months).find(function (key) { return isMonth(months["" + key].toLowerCase(), key, dateArr[0], dateArr[0].length); });
                if (!isNullOrUndefined(firstVal) && !dateArr[0].includes(',')) { // Added ',' checking to skip updating for the MMM d, yyyy ddd format.
                    updateSecValue(dateArr[1]);
                }
            }
            else if (!Number(dateArr[1]) && dateArr[1].length >= abbreviatedMonth['1'].length) {
                Object.keys(months).find(function (key) { return isMonth(months["" + key].toLowerCase(), key, dateArr[1], dateArr[1].length); });
                if (!isNullOrUndefined(firstVal)) {
                    updateSecValue(dateArr[0]);
                }
            }
            else if (Number(dateArr[0]) && Number(dateArr[0]) <= 12 && Number(dateArr[1]) && (this.localeObj.dateSeparator === '/' ||
                separator === '-' || isEdit)) {
                firstVal = enUSMonth[Number(dateArr[0]) - 1];
                updateSecValue(dateArr[1]);
            }
            if (!formatArr.length) {
                val = 'Invalid';
            }
        }
        else if (dateArr.length > 2) {
            var _loop_1 = function (i) {
                if (!(Number(dateArr[i]) > -1)) {
                    dateArr[i] = dateArr[i].trim();
                    Object.keys(months).find(function (key) {
                        return isMonth(months["" + key].toLowerCase(), key, dateArr[i].trim().toLowerCase(), dateArr[i].length);
                    });
                    if (!isNullOrUndefined(firstVal)) {
                        if (i === 1) {
                            formatArr[1] = 'MMM';
                            dateArr[2] = dateArr[2].trim();
                            if (Number(dateArr[0]) < 31 && Number(dateArr[2]) >= 1900 && Number(dateArr[2]) <= 9999) {
                                val = dateArr[0] + separator + firstVal;
                                val += (separator + dateArr[2]);
                                formatArr[0] = 'd';
                                formatArr[2] = 'yy';
                                updateFormat();
                                // Changed year format alone when given year value with 4 digits like 20-May-2022
                                formatArr[2] = 'yyyy';
                                format = formatArr.join(separator);
                            }
                        }
                    }
                    else {
                        val = 'Invalid';
                    }
                }
            };
            for (var i = 0; i < dateArr.length; i++) {
                _loop_1(i);
            }
        }
        if (timeArgs && val !== 'Invalid') {
            if (!format && (!cellFormat || cellFormat === 'General')) {
                cell.format = getFormatFromType('ShortDate') + " " + (timeArgs.format || getFormatFromType('Time'));
            }
            else if (timeArgs.format) {
                format += " " + timeArgs.format;
            }
            val += " " + timeArgs.val;
        }
        return { val: val, format: format };
    };
    WorkbookNumberFormat.prototype.formattedBarText = function (args) {
        var _this = this;
        if (args.value === '' || isNullOrUndefined(args.value)) {
            return;
        }
        var option = {};
        var format = (args.cell && args.cell.format) || '';
        var type = format && isCustomDateTime(format, true, option, true) ? option.type : '';
        var intl = new Internationalization();
        var beforeText = args.value;
        var date = getFormatFromType('ShortDate');
        var time = getFormatFromType('Time');
        var timeFormat = format.toLowerCase();
        var parseOtherCultureNumber = function () {
            if (_this.decimalSep !== '.' && args.value) {
                args.value = args.value.toString();
                if (isNumber(args.value) && args.value.includes('.')) {
                    args.value = args.value.replace('.', _this.decimalSep);
                }
            }
        };
        if (type === 'time' && timeFormat.includes('m') && !timeFormat.includes(':m') && !timeFormat.includes('m:') &&
            !timeFormat.includes('[m') && !timeFormat.includes('am')) {
            type = 'date';
        }
        if (type === 'date') {
            var val = args.value.toString();
            args.value = this.shortDateFormat({ type: type, value: args.value, format: date, cell: args.cell }, intl);
            if (args.value && val.includes('.')) {
                args.value += " " + this.timeFormat({ type: type, value: val, format: time }, intl);
            }
        }
        else if (type.includes('time')) {
            if (beforeText && Number(beforeText) >= 1 || type === 'datetime') {
                args.value = this.shortDateFormat({ type: type, value: args.value, format: date }, intl) + ' ' +
                    this.timeFormat({ type: type, value: args.value, format: time }, intl);
            }
            else {
                args.value = this.timeFormat({ type: type, value: args.value, format: time }, intl);
            }
        }
        else if (args.cell.format && args.cell.format.includes('%') && isNumber(args.cell.value)) {
            args.value = this.parent.getDisplayText(args.cell);
            if (!args.value.includes('%')) {
                args.value = beforeText;
                parseOtherCultureNumber();
            }
        }
        else {
            parseOtherCultureNumber();
        }
        if (!args.value || (args.value && args.value.toString().indexOf('null') > -1)) {
            args.value = beforeText;
        }
    };
    WorkbookNumberFormat.prototype.getFormattedNumber = function (format, value) {
        return new Internationalization().formatNumber(Number(value), { format: format }) || '';
    };
    /**
     * Adding event listener for number format.
     *
     * @returns {void} - Adding event listener for number format.
     */
    WorkbookNumberFormat.prototype.addEventListener = function () {
        this.parent.on(applyNumberFormatting, this.numberFormatting, this);
        this.parent.on(getFormattedCellObject, this.getFormattedCell, this);
        this.parent.on(checkDateFormat, this.checkDateFormat, this);
        this.parent.on(getFormattedBarText, this.formattedBarText, this);
    };
    /**
     * Removing event listener for number format.
     *
     * @returns {void} -  Removing event listener for number format.
     */
    WorkbookNumberFormat.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(applyNumberFormatting, this.numberFormatting);
            this.parent.off(getFormattedCellObject, this.getFormattedCell);
            this.parent.off(checkDateFormat, this.checkDateFormat);
            this.parent.off(getFormattedBarText, this.formattedBarText);
        }
    };
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    WorkbookNumberFormat.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the workbook number format module name.
     *
     * @returns {string} - Get the module name.
     */
    WorkbookNumberFormat.prototype.getModuleName = function () {
        return 'workbookNumberFormat';
    };
    return WorkbookNumberFormat;
}());
export { WorkbookNumberFormat };
/**
 * To Get the number built-in format code from the number format type.
 *
 * @param {string} type - Specifies the type of the number formatting.
 * @returns {string} - To Get the number built-in format code from the number format type.
 */
export function getFormatFromType(type) {
    var code = 'General';
    switch (type.split(' ').join('')) {
        case 'Number':
            code = '0.00';
            break;
        case 'Currency':
            code = '$#,##0.00';
            break;
        case 'Accounting':
            code = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)';
            break;
        case 'ShortDate':
            code = 'mm-dd-yyyy';
            break;
        case 'LongDate':
            code = 'dddd, mmmm dd, yyyy';
            break;
        case 'Time':
            code = 'h:mm:ss AM/PM';
            break;
        case 'Percentage':
            code = '0.00%';
            break;
        case 'Fraction':
            code = '# ?/?';
            break;
        case 'Scientific':
            code = '0.00E+00';
            break;
        case 'Text':
            code = '@';
            break;
    }
    return code;
}
/**
 * @hidden
 * @param {string} format -  Specidfies the format.
 * @returns {string} - To get type from format.
 */
export function getTypeFromFormat(format) {
    var code = 'General';
    switch (format) {
        // case '0.00':
        case '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"_-;_-@_-':
        case '_-* #,##0_-;-* #,##0_-;_-* "-"_-;_-@_-':
            code = 'Number';
            break;
        case '$#,##0.00':
        case '$#,##0':
        case '$#,##0_);[Red]($#,##0)':
        case '$#,##0.00_);($#,##0.00)':
        case '$#,##0_);($#,##0)':
        case '$#,##0.00_);[Red]($#,##0.00)':
            code = 'Currency';
            break;
        case '_($*#,##0.00_);_($*(#,##0.00);_($*"-"??_);_(@_)':
        case '_($*#,##0.00_);_($* (#,##0.00);_($*"-"??_);_(@_)':
        case '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)':
        case '_ $ * #,##0.00_ ;_ $ * -#,##0.00_ ;_ $ * "-"??_ ;_ @_ ':
        case '_($* #,##0_);_($* (#,##0);_($* "-"_);_(@_)':
        case '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)':
        case '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)':
            code = 'Accounting';
            break;
        case 'mm-dd-yyyy':
        case 'dd/MM/yyyy':
            // case 'yyyy-MM-dd':
            // case 'dd-mm-yyyy':
            // case 'dd-mm-yy':
            // case 'mm-dd-yy':
            code = 'ShortDate';
            break;
        case 'dddd, mmmm dd, yyyy':
            code = 'LongDate';
            break;
        case 'h:mm:ss AM/PM':
            code = 'Time';
            break;
        case '0.00%':
        case '0%':
            code = 'Percentage';
            break;
        case '0.00E+00':
            code = 'Scientific';
            break;
        case '@':
            code = 'Text';
            break;
        default:
            if (format) {
                if (format.includes('?/?')) {
                    code = 'Fraction';
                }
                else if (format.indexOf('[$') > -1) {
                    if (format.indexOf('* ') > -1) {
                        code = 'Accounting';
                    }
                    else {
                        code = 'Currency';
                    }
                }
            }
            break;
    }
    return code;
}
