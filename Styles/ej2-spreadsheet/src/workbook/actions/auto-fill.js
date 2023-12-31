import { isNullOrUndefined, isUndefined, Internationalization } from '@syncfusion/ej2-base';
import { getCell, isHiddenRow, isHiddenCol, getSheet, isFilterHidden } from '../base/index';
import { getSwapRange, getRangeIndexes, setAutoFill, getFillInfo, getSheetIndexFromAddress, workbookLocale } from './../common/index';
import { checkIsFormula, getColumnHeaderText, isNumber, updateCFModel, isCustomDateTime } from './../index';
import { updateCell, intToDate, dateToInt, applyCF } from './../common/index';
/**
 * WorkbookAutoFill module allows to perform auto fill functionalities.
 */
var WorkbookAutoFill = /** @class */ (function () {
    /**
     * Constructor for the workbook AutoFill module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     * @private
     */
    function WorkbookAutoFill(parent) {
        this.uniqueOBracket = String.fromCharCode(129);
        this.uniqueCBracket = String.fromCharCode(130);
        this.uniqueDOperator = String.fromCharCode(136);
        this.uniqueModOperator = String.fromCharCode(137);
        this.uniqueCSeparator = String.fromCharCode(131);
        this.uniqueCOperator = String.fromCharCode(132);
        this.uniqueExpOperator = String.fromCharCode(140);
        this.uniqueGTOperator = String.fromCharCode(141);
        this.uniqueConcateOperator = String.fromCharCode(138);
        this.uniqueEqualOperator = String.fromCharCode(139);
        this.uniqueLTOperator = String.fromCharCode(142);
        this.uniqueMOperator = String.fromCharCode(135);
        this.uniquePOperator = String.fromCharCode(133);
        this.uniqueSOperator = String.fromCharCode(134);
        this.parent = parent;
        this.addEventListener();
    }
    WorkbookAutoFill.prototype.getFillInfo = function (options) {
        var l10n = this.parent.serviceLocator.getService(workbookLocale);
        var val = '';
        var isStringType = true;
        var fillType = 'CopyCells';
        var disableItems = [];
        var isVFill = ['Down', 'Up'].indexOf(options.direction) > -1;
        var data = this.getRangeData({ range: options.dataRange, sheetIdx: this.parent.activeSheetIndex });
        var len = data.join().replace(/,/g, '').length;
        var i = this.isRange(options.dataRange) && len ? data.length : 1;
        while (i--) {
            val = data[i] && !isNullOrUndefined(data[i].value) ? data[i].value : '';
            if (isNumber(val) || checkIsFormula(val) || isNumber(val[val.length - 1])) {
                isStringType = false;
                fillType = this.parent.autoFillSettings.fillType;
                break;
            }
        }
        if (!len || isStringType) {
            disableItems.push(l10n.getConstant('FillSeries'));
            fillType = (options.fillType === 'FillSeries') ? fillType : options.fillType;
        }
        if (!isVFill || (isVFill && options.dataRange[1] !== options.dataRange[3])) {
            disableItems.push('Flash Fill'); // for flash fill option
        }
        return { fillType: fillType, disableItems: disableItems };
    };
    WorkbookAutoFill.prototype.isRange = function (range) {
        return range && (range[0] !== range[2] || range[1] !== range[3]);
    };
    WorkbookAutoFill.prototype.autoFill = function (options) {
        if (!options.dataRange || !options.fillRange || !options.direction || !this.parent.allowEditing ||
            (this.parent.getActiveSheet().isProtected && options.isLockedCell)) {
            return;
        }
        var autoFillOptions = {
            dataRange: null, fillRange: null, fillType: null, direction: null, sheetIndex: getSheetIndexFromAddress(this.parent, options.dataRange)
        };
        var dataRangeIndices = getSwapRange(getRangeIndexes(options.dataRange));
        var fillRangeIndices = getSwapRange(getRangeIndexes(options.fillRange));
        this.fillInfo = this.getFillInfo({ dataRange: dataRangeIndices, fillRange: fillRangeIndices, fillType: options.fillType,
            direction: options.direction });
        autoFillOptions.dataRange = dataRangeIndices;
        autoFillOptions.fillRange = fillRangeIndices;
        autoFillOptions.direction = options.direction;
        autoFillOptions.fillType = options.fillType || this.fillInfo.fillType;
        this.fillInfo.fillType = options.isFillOptClick ? options.fillType : this.fillInfo.fillType;
        switch (options.fillType) {
            case 'FillSeries':
            case 'FillWithoutFormatting':
                this.fillSeries(autoFillOptions);
                break;
            case 'CopyCells':
            case 'FillFormattingOnly':
                this.copyCells(autoFillOptions);
                break;
        }
    };
    WorkbookAutoFill.prototype.fillSeries = function (options) {
        var val;
        var plen;
        var patterns;
        var patrn;
        var pRanges;
        var patrnRange;
        var fillRange;
        var data;
        var nextStringValue;
        var match;
        var temp;
        var dlen;
        var j;
        var k;
        var l;
        var tlen;
        var tot;
        var hasRef;
        var cells;
        var clen;
        var cellIdx;
        var cellProps = {};
        var i = 0;
        var prevCellData;
        var dateVal;
        var dateObj;
        var sheetIndex = isUndefined(options.sheetIndex) ? this.parent.activeSheetIndex : options.sheetIndex;
        var sheet = getSheet(this.parent, sheetIndex);
        var dminr = options.dataRange[0];
        var dminc = options.dataRange[1];
        var dmaxr = options.dataRange[2];
        var dmaxc = options.dataRange[3];
        var fminr = options.fillRange[0];
        var fminc = options.fillRange[1];
        var fmaxr = options.fillRange[2];
        var fmaxc = options.fillRange[3];
        var isVFill = ['Down', 'Up'].indexOf(options.direction) > -1;
        var isReverseFill = ['Up', 'Left'].indexOf(options.direction) > -1;
        var len = isVFill ? dmaxc - dminc : dmaxr - dminr;
        var withFrmt = options.fillType === 'FillSeries';
        var prop;
        var cfRefreshAll;
        var cf = sheet.conditionalFormats && sheet.conditionalFormats.length &&
            [].slice.call(sheet.conditionalFormats);
        var cfRule = [];
        while (i <= len) {
            pRanges = this.updateFillValues(isVFill, dminr, dminc, dmaxr, dmaxc, fminr, fminc, fmaxr, fmaxc, i);
            patrnRange = pRanges.patternRange;
            fillRange = pRanges.fillRange;
            patterns = this.getPattern(patrnRange, { isReverseFill: isReverseFill, isVFill: isVFill });
            data = this.getRangeData({ range: patrnRange, sheetIdx: sheetIndex });
            dlen = data.length;
            if (!patterns || !patterns.length) {
                return;
            }
            plen = patterns.length;
            cells = this.getSelectedRange(sheet, { rowIndex: fillRange[0], colIndex: fillRange[1] }, { rowIndex: fillRange[2],
                colIndex: fillRange[3] });
            clen = cells.length;
            if (isReverseFill) {
                cells = cells.reverse();
                patterns = patterns.reverse();
                patterns = this.ensurePattern(patterns);
                data = data.reverse();
            }
            j = 0;
            while (j < clen) {
                cellIdx = cells[j];
                patrn = patterns[j % plen];
                if (isNumber(patrn)) {
                    patrn = patterns[patrn];
                }
                l = j % dlen;
                switch (patrn['type']) {
                    case 'number':
                    case 'date':
                        patrn = patrn;
                        if (patrn.isStartWithMonth && dlen === 1) {
                            dateVal = intToDate(patrn.regVal.a);
                            dateObj = new Date(dateVal);
                            dateVal.setMonth(dateVal.getMonth() + (patrn.regVal.b * patrn.i));
                            if (dateObj.getDate() > 28 && dateObj.getDate() !== dateVal.getDate()) {
                                dateObj.setDate(1);
                                dateObj.setMonth(dateObj.getMonth() + (patrn.regVal.b * patrn.i));
                                dateObj.setDate(new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate());
                                dateVal = dateObj;
                            }
                            val = dateToInt(dateVal).toString();
                        }
                        else {
                            val = (this.round(patrn['regVal'].a + (patrn['regVal'].b * patrn['i']), 5)).toString();
                            if (patrn.val) {
                                match = (typeof (patrn.val[0]) === 'string') && patrn.val[0].match(/^0+/);
                                if (match) {
                                    nextStringValue = this.getNextFormattedValue(patrn.val[0], Number(val));
                                }
                            }
                        }
                        if (patrn.dataVal) {
                            if (patrn.copy === undefined && !match) {
                                patrn.copy = patrn.val.length > 2;
                                if (patrn.copy) {
                                    for (var m = 2; m < patrn.val.length; m++) {
                                        patrn.copy = Math.abs(this.round(patrn['regVal'].a + (patrn['regVal'].b * m), 5)) !==
                                            patrn.val[m];
                                        if (patrn.copy) {
                                            break;
                                        }
                                    }
                                }
                            }
                            val = patrn.copy ? (data[l] && !isNullOrUndefined(data[l].value) ? data[l].value : '') :
                                (patrn.start ? Math.abs(Number(val)) + patrn.dataVal : (match ? patrn.dataVal + nextStringValue : patrn.dataVal + Math.abs(Number(val))));
                        }
                        if (isReverseFill) {
                            patrn['i']--;
                        }
                        else {
                            patrn['i']++;
                        }
                        break;
                    case 'string':
                        // eslint-disable-next-line no-case-declarations
                        var newVal = patrn['i'] % patrn['val'].length;
                        val = patrn['val'][newVal];
                        patrn['i']++;
                        break;
                    case 'formula':
                        hasRef = false;
                        val = '=';
                        k = 0;
                        tlen = patrn['val'].length;
                        while (k < tlen) {
                            temp = patrn['val'][k];
                            if (typeof temp === 'object') {
                                hasRef = true;
                                tot = this.round(temp['a'] + (temp['b'] * patrn['i']), 5);
                                if (tot < 1) {
                                    val += '#REF!';
                                }
                                else {
                                    val += isVFill ? temp['c'] + (temp['b'] ? tot : '$' + tot) : (temp['b'] ? getColumnHeaderText(tot) : temp['c'].substring(0, temp['c'].search(/\d/)) + '$' + getColumnHeaderText(tot)) + temp['c'].trim();
                                }
                            }
                            else {
                                val += temp;
                            }
                            k++;
                        }
                        if (hasRef && isReverseFill) {
                            patrn['i']--;
                        }
                        else {
                            patrn['i']++;
                        }
                        break;
                    case 'time':
                        val = (patrn['regVal'].a + (patrn['regVal'].b * patrn['i'])).toString();
                        if (isReverseFill) {
                            patrn['i']--;
                        }
                        else {
                            patrn['i']++;
                        }
                        break;
                }
                prevCellData = getCell(cellIdx.rowIndex, cellIdx.colIndex, sheet, false, true);
                if (withFrmt) {
                    Object.assign(cellProps, data[l], null, true);
                }
                else {
                    cellProps.style = prevCellData.style;
                    cellProps.format = prevCellData.format;
                    cellProps.wrap = prevCellData.wrap;
                    cellProps.rowSpan = prevCellData.rowSpan;
                    cellProps.colSpan = prevCellData.colSpan;
                }
                cellProps.value = val;
                if (checkIsFormula(val)) {
                    cellProps.formula = val;
                }
                prop = { cell: cellProps, rowIdx: cellIdx.rowIndex, colIdx: cellIdx.colIndex, valChange: true,
                    uiRefresh: true, pvtExtend: true, skipFormatCheck: true };
                updateCell(this.parent, sheet, prop);
                if (cf && !cfRefreshAll) {
                    cfRefreshAll = prop.isFormulaDependent;
                    if (!cfRefreshAll) {
                        updateCFModel(cf, cfRule, cellIdx.rowIndex, cellIdx.colIndex);
                    }
                }
                cellProps = {};
                j++;
            }
            i++;
        }
        if (cfRule.length || cfRefreshAll) {
            this.parent.notify(applyCF, { cfModel: !cfRefreshAll && cfRule, refreshAll: cfRefreshAll, isAction: true, isEdit: true });
        }
    };
    WorkbookAutoFill.prototype.copyCells = function (options) {
        var i = 0;
        var j;
        var k;
        var patrnRange;
        var fillRange;
        var pRanges;
        var data;
        var dlen;
        var cells;
        var clen;
        var cellProperty = {};
        var cellIdx;
        var dMinR = options.dataRange[0];
        var dMinC = options.dataRange[1];
        var dMaxR = options.dataRange[2];
        var dMaxC = options.dataRange[3];
        var fMinR = options.fillRange[0];
        var fMinC = options.fillRange[1];
        var fMaxR = options.fillRange[2];
        var fMaxC = options.fillRange[3];
        var isVFill = ['Down', 'Up'].indexOf(options.direction) > -1;
        var isReverseFill = ['Up', 'Left'].indexOf(options.direction) > -1;
        var len = isVFill ? dMaxC - dMinC : dMaxR - dMinR;
        var sheetIndex = isUndefined(options.sheetIndex) ? this.parent.activeSheetIndex : options.sheetIndex;
        var sheet = getSheet(this.parent, sheetIndex);
        var formatOnly = options.fillType === 'FillFormattingOnly';
        var prevCellData;
        var cfRefreshAll;
        var prop;
        var cf = sheet.conditionalFormats && sheet.conditionalFormats.length &&
            [].slice.call(sheet.conditionalFormats);
        var cfRule = [];
        while (i <= len) {
            pRanges = this.updateFillValues(isVFill, dMinR, dMinC, dMaxR, dMaxC, fMinR, fMinC, fMaxR, fMaxC, i);
            patrnRange = pRanges.patternRange;
            fillRange = pRanges.fillRange;
            data = this.getRangeData({ range: patrnRange, sheetIdx: sheetIndex });
            dlen = data.length;
            cells = this.getSelectedRange(sheet, { rowIndex: fillRange[0], colIndex: fillRange[1] }, { rowIndex: fillRange[2], colIndex: fillRange[3] });
            clen = cells.length;
            j = 0;
            if (isReverseFill) {
                cells = cells.reverse();
            }
            while (j < clen) {
                k = j % dlen;
                cellIdx = cells[j];
                if (formatOnly) {
                    prevCellData = getCell(cellIdx.rowIndex, cellIdx.colIndex, sheet);
                }
                Object.assign(cellProperty, data[k], null, true);
                if (formatOnly) {
                    cellProperty.value = prevCellData.value;
                    cellProperty.formula = prevCellData.formula;
                }
                prop = { cell: cellProperty, rowIdx: cellIdx.rowIndex, colIdx: cellIdx.colIndex, valChange: true, uiRefresh: true,
                    pvtExtend: true };
                updateCell(this.parent, sheet, prop);
                if (cf && !cfRefreshAll) {
                    cfRefreshAll = prop.isFormulaDependent;
                    if (!cfRefreshAll) {
                        updateCFModel(cf, cfRule, cellIdx.rowIndex, cellIdx.colIndex);
                    }
                }
                cellProperty = {};
                j++;
            }
            i++;
        }
        if (cfRule.length || cfRefreshAll) {
            this.parent.notify(applyCF, { cfModel: !cfRefreshAll && cfRule, refreshAll: cfRefreshAll, isAction: true, isEdit: true });
        }
    };
    WorkbookAutoFill.prototype.updateFillValues = function (isVFill, dminr, dminc, dmaxr, dmaxc, fminr, fminc, fmaxr, fmaxc, i) {
        var pStart;
        var pEnd;
        var fStart;
        var fEnd;
        if (isVFill) {
            pStart = { rowIndex: dminr, colIndex: dminc + i };
            pEnd = { rowIndex: dmaxr, colIndex: dminc + i };
            fStart = { rowIndex: fminr, colIndex: fminc + i };
            fEnd = { rowIndex: fmaxr, colIndex: fminc + i };
        }
        else {
            pStart = { rowIndex: dminr + i, colIndex: dminc };
            pEnd = { rowIndex: dminr + i, colIndex: dmaxc };
            fStart = { rowIndex: fminr + i, colIndex: fminc };
            fEnd = { rowIndex: fminr + i, colIndex: fmaxc };
        }
        var patternRange = [pStart.rowIndex, pStart.colIndex, pEnd.rowIndex, pEnd.colIndex];
        var fillRange = [fStart.rowIndex, fStart.colIndex, fEnd.rowIndex, fEnd.colIndex];
        return { patternRange: patternRange, fillRange: fillRange };
    };
    WorkbookAutoFill.prototype.getDataPattern = function (range) {
        var val;
        var numValue;
        var type;
        var i = 0;
        var obj = { val: null,
            type: null };
        var patrn = [];
        var data = this.getRangeData({ range: range, sheetIdx: this.parent.activeSheetIndex });
        var dlen = data.length;
        var isStartNum;
        var isDateStartsWithMonth;
        if (dlen) {
            var count = void 0;
            var dataVal = void 0;
            var format = void 0;
            var minusOperator = function (data) {
                return !isStartNum && data && data[data.length - 1] === '-' ? data.slice(0, data.length - 1) : data;
            };
            while (i < dlen) {
                isDateStartsWithMonth = false;
                if (data[i]) {
                    if (data[i].formula && checkIsFormula(data[i].formula)) {
                        val = data[i].formula;
                        type = 'formula';
                    }
                    else {
                        val = isNullOrUndefined(data[i].value) ? '' : data[i].value;
                        var option = {};
                        format = data[i].format;
                        if (format && isCustomDateTime(format, true, option)) {
                            type = option.type;
                            isDateStartsWithMonth = type === 'date' && format.toLowerCase().startsWith('mmm');
                        }
                        else {
                            type = isNumber(val) ? 'number' : 'string';
                        }
                    }
                }
                else {
                    val = '';
                    type = 'string';
                }
                dataVal = '';
                if (type === 'string') {
                    isStartNum = false;
                    if (isNumber(val[0])) {
                        count = 0;
                        do {
                            count++;
                        } while (isNumber(val[count]));
                        if (val[count] === ' ') {
                            isStartNum = true;
                            type = 'number';
                            dataVal = val.slice(count, val.length);
                            val = Number(val.slice(0, count));
                        }
                    }
                    val = val;
                    if (!isStartNum && isNumber(val[val.length - 1])) {
                        count = 1;
                        do {
                            count++;
                        } while (isNumber(val[val.length - count]));
                        type = 'number';
                        count -= 1;
                        dataVal = val.slice(0, val.length - count);
                        numValue = val.slice(val.length - count, val.length);
                        val = numValue.match(/^0+/) ? numValue : Number(numValue);
                        if (obj.dataVal && obj.dataVal !== dataVal && obj.dataVal === minusOperator(dataVal)) {
                            dataVal = obj.dataVal;
                        }
                    }
                }
                if (i === 0) {
                    obj = { val: [val], type: type, isStartWithMonth: isDateStartsWithMonth };
                    if (dataVal) {
                        obj.dataVal = dataVal;
                        obj.start = isStartNum;
                    }
                }
                else if (type === obj.type && (!obj.dataVal || minusOperator(obj.dataVal) === minusOperator(dataVal))) {
                    obj.val.push(val);
                }
                else {
                    patrn.push(obj);
                    obj = { val: [val], type: type };
                    if (dataVal) {
                        obj.dataVal = dataVal;
                        obj.start = isStartNum;
                    }
                }
                i++;
            }
            patrn.push(obj);
            return patrn;
        }
        else {
            return [{ val: null, type: null }];
        }
    };
    WorkbookAutoFill.prototype.getPredictionValue = function (args, isTime) {
        var i = 0;
        var sumx = 0;
        var sumy = 0;
        var sumxy = 0;
        var sumxx = 0;
        var a = 0;
        var b = 0;
        var n = args.length;
        while (i < n) {
            sumx = sumx + i;
            sumy = sumy + Number(args[i]);
            sumxy = sumxy + (i * Number(args[i]));
            sumxx = sumxx + (i * i);
            i++;
        }
        if (!isTime) {
            a = this.round(((sumy * sumxx) - (sumx * sumxy)) / ((n * sumxx) - (sumx * sumx)), 5);
            b = this.round(((n * sumxy) - (sumx * sumy)) / ((n * sumxx) - (sumx * sumx)), 5);
        }
        else {
            a = ((sumy * sumxx) - (sumx * sumxy)) / ((n * sumxx) - (sumx * sumx));
            b = ((n * sumxy) - (sumx * sumy)) / ((n * sumxx) - (sumx * sumx));
        }
        return { a: a, b: b };
    };
    WorkbookAutoFill.prototype.getPattern = function (range, options) {
        var j;
        var idx;
        var temp;
        var regVal;
        var diff;
        var len;
        var i = 0;
        var pattern = [];
        var patrns = this.getDataPattern(range);
        var plen = patrns.length;
        var patrn;
        if (patrns) {
            while (i < plen) {
                patrn = patrns[i];
                switch (patrn.type) {
                    case 'number':
                    case 'date':
                        idx = pattern.length;
                        len = patrn.val.length;
                        diff = options.isReverseFill ? -1 : len;
                        if (len === 1) {
                            var newVal = parseFloat(patrn.val[0]) + 1;
                            if (typeof (patrn.val[0]) === 'string' && patrn.val[0].match(/^0+/)) {
                                patrn.val.push(this.getNextFormattedValue(patrn.val[0], newVal));
                            }
                            else {
                                patrn.val.push(newVal);
                            }
                        }
                        regVal = this.getPredictionValue(patrn.dataVal ? patrn.val.slice(0, 2) : patrn.val);
                        temp = { regVal: regVal, type: patrn.type, i: diff, isStartWithMonth: patrn.isStartWithMonth };
                        if (patrn.dataVal) {
                            temp.dataVal = patrn.dataVal;
                            temp.val = patrn.val;
                            temp.start = patrn.start;
                        }
                        pattern.push(temp);
                        j = 1;
                        while (j < len) {
                            pattern.push(idx);
                            j++;
                        }
                        break;
                    case 'string':
                        idx = pattern.length;
                        temp = { val: patrn.val, type: patrn.type, i: 0 };
                        pattern.push(temp);
                        j = 1;
                        len = patrn.val.length;
                        while (j < len) {
                            pattern.push(idx);
                            j++;
                        }
                        break;
                    case 'formula':
                        len = patrn.val.length;
                        patrn = this.getFormulaPattern(patrn.val, options);
                        diff = options.isReverseFill ? -1 : len;
                        if (patrn.isInPattern) {
                            idx = pattern.length;
                            temp = { val: patrn.val, type: 'formula', i: diff };
                            pattern.push(temp);
                            j = 1;
                            while (j < len) {
                                pattern.push(idx);
                                j++;
                            }
                        }
                        else {
                            j = 0;
                            diff = options.isReverseFill ? -1 : 1;
                            while (j < len) {
                                pattern.push({ val: patrn.val[j], type: 'formula', i: diff });
                                j++;
                            }
                        }
                        break;
                    case 'time':
                        idx = pattern.length;
                        len = patrn.val.length;
                        diff = options.isReverseFill ? -1 : 1;
                        if (len === 1) {
                            var oldTimeVal = intToDate(patrn.val[0]);
                            var patrnVal = Number(patrn.val[0]);
                            var isTimeOnly = patrnVal > 0 && patrnVal < 1;
                            var newTimeVal = dateToInt(new Date(oldTimeVal.getTime() + 60 * 60000), true, isTimeOnly);
                            patrn.val.push(newTimeVal);
                        }
                        regVal = this.getPredictionValue(patrn.val, true);
                        temp = { regVal: regVal, type: patrn.type, i: diff };
                        pattern.push(temp);
                        j = 1;
                        while (j < len) {
                            pattern.push(idx);
                            j++;
                        }
                        break;
                    default:
                        break;
                }
                i++;
            }
            return pattern;
        }
        else {
            return [{ regVal: null }];
        }
    };
    WorkbookAutoFill.prototype.getNextFormattedValue = function (value, numValue) {
        return new Internationalization().formatNumber(Math.abs(numValue), { minimumIntegerDigits: value.length, useGrouping: false });
    };
    WorkbookAutoFill.prototype.isCellReference = function (text) {
        return /^[a-z]{1,3}\d{1,7}$/gi.test(text) ? 'relative' : (/^\$[a-z]{1,3}\$\d{1,7}$/gi.test(text) ? 'absolute' : (/^((\$[a-z]{1,3})\d{1,7}|[a-z]{1,3}(\$\d{1,7}))$/gi.test(text) ? 'mixed' : false));
    };
    WorkbookAutoFill.prototype.round = function (value, round) {
        return Number(Math.round(parseFloat(value + 'e' + round)) + 'e-' + round) || Number(value);
    };
    WorkbookAutoFill.prototype.getRangeData = function (options) {
        var arr = [];
        var sheet = this.parent.getActiveSheet();
        var minR = options.range[0];
        var minC = options.range[1];
        var maxR = options.range[2];
        var maxC = options.range[3];
        var minCol = minC;
        var cell;
        while (minR <= maxR) {
            if (isHiddenRow(sheet, minR)) {
                minR++;
                continue;
            }
            minC = minCol;
            while (minC <= maxC) {
                if (isHiddenCol(sheet, minC)) {
                    minC++;
                    continue;
                }
                cell = getCell(minR, minC, sheet);
                arr.push(cell);
                minC++;
            }
            minR++;
        }
        return arr;
    };
    WorkbookAutoFill.prototype.getFormulaPattern = function (data, options) {
        var j;
        var temp;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var patrn;
        var patrns = [];
        var i = 0;
        var len = data.length;
        var cRfrType;
        while (i < len) {
            patrns.push(this.parseFormula(data[i]));
            i++;
        }
        var isInPatrn = this.isInPattern(patrns, options.isVFill);
        if (isInPatrn) {
            patrn = patrns[0];
            i = patrn.length;
            while (i--) {
                temp = patrn[i];
                cRfrType = this.isCellReference(temp);
                if (cRfrType && (cRfrType !== 'absolute')) {
                    patrn[i] = this.getCellRefPrediction(temp, options, null, cRfrType);
                }
            }
            return { isInPattern: isInPatrn, val: patrn };
        }
        else {
            i = 0;
            while (i < len) {
                patrn = patrns[i];
                j = patrn.length;
                while (j--) {
                    temp = patrn[j];
                    cRfrType = this.isCellReference(temp.trim());
                    if (cRfrType && (cRfrType !== 'absolute')) {
                        patrns[i][j] = this.getCellRefPrediction(temp, options, len, cRfrType);
                    }
                }
                i++;
            }
            return { isInPattern: isInPatrn, val: patrns };
        }
    };
    WorkbookAutoFill.prototype.generateColCount = function (text) {
        var colCount = 0;
        var newText = text.split('').reverse().join('');
        for (var i = newText.length - 1; i >= 0; i--) {
            colCount += (text[i].charCodeAt(parseInt(newText[i], 10)) - 64) * (Math.pow(26, i));
        }
        return colCount;
    };
    WorkbookAutoFill.prototype.getCellRefPrediction = function (text, options, length, rfrType) {
        text = text.toUpperCase();
        var eStr = '';
        var aRegx = new RegExp('[a-z$]', 'gi');
        var nRegx = new RegExp('[0-9$]', 'g');
        var str = options.isVFill ? text.replace(nRegx, eStr) : text.replace(aRegx, eStr);
        var temp = options.isVFill ? Number(text.replace(aRegx, eStr)) :
            this.generateColCount(text.replace(nRegx, eStr).trim());
        var dollarPosition = null;
        var arr = [temp];
        var isColAbslt = text[0] === '$';
        if (!isColAbslt && text.includes('$') && text.trim()[0] === '$') {
            for (var idx = 1; idx < text.length; idx++) {
                if (text[idx] === '$') {
                    dollarPosition = idx;
                    isColAbslt = true;
                    break;
                }
            }
        }
        if (length && length !== 1) {
            arr.push(temp + length);
        }
        else {
            arr.push(temp + 1);
        }
        temp = this.getPredictionValue(arr);
        if (rfrType && (rfrType === 'mixed')) {
            if (isColAbslt === options.isVFill) {
                if (dollarPosition) {
                    str = str.substring(0, dollarPosition) + '$' + str.substring(dollarPosition);
                }
                else {
                    str = '$' + str;
                }
            }
            else {
                temp['b'] = 0;
            }
        }
        temp['c'] = str;
        return temp;
    };
    WorkbookAutoFill.prototype.isInPattern = function (patrn, isVFill) {
        var oldPatrn;
        var olen;
        var newPatrn;
        var nlen;
        var oldStr;
        var newStr;
        var oldInt;
        var newInt;
        var eStr = '';
        var i = 0;
        var j = 1;
        var plen = patrn.length;
        var nregx = new RegExp('[0-9$]', 'g');
        var aregx = new RegExp('[a-z$]', 'gi');
        if (plen === 1) {
            return false;
        }
        while (j < plen) {
            oldPatrn = patrn[i];
            newPatrn = patrn[j];
            olen = oldPatrn.length;
            nlen = newPatrn.length;
            if (olen !== nlen) {
                return false;
            }
            else {
                while (olen--) {
                    oldStr = oldPatrn[olen];
                    newStr = newPatrn[olen];
                    if (this.isCellReference(oldStr) === this.isCellReference(newStr)) {
                        if (isVFill) {
                            oldInt = Number(oldStr.replace(aregx, eStr));
                            newInt = Number(newStr.replace(aregx, eStr));
                        }
                        else {
                            oldInt = this.generateColCount(oldStr.replace(nregx, eStr));
                            newInt = this.generateColCount(newStr.replace(nregx, eStr));
                        }
                        if (oldInt !== newInt - 1) {
                            return false;
                        }
                    }
                    else if (oldStr !== newStr) {
                        return false;
                    }
                }
            }
            i++;
            j++;
        }
        return true;
    };
    WorkbookAutoFill.prototype.parseFormula = function (formula) {
        // eslint-disable-next-line @typescript-eslint/tslint/config
        var temp;
        var str;
        var i = 0;
        var arrValues = [];
        formula = this.markSpecialChar(formula.replace('=', ''));
        formula = formula.split(/\(|\)|=|\^|>|<|,|:|\+|-|\*|\/|%|&/g);
        var len = formula.length;
        while (i < len) {
            temp = formula[i];
            if (!temp) {
                i++;
                continue;
            }
            if (temp.length === 1) {
                arrValues.push(this.isUniqueChar(temp) ? this.getUniqueCharVal(temp) : temp);
            }
            else {
                str = temp[0];
                if (temp.indexOf('!') > 0) {
                    if (this.isUniqueChar(str)) {
                        arrValues.push(this.getUniqueCharVal(str));
                        temp = temp.substr(1);
                    }
                    str = temp.indexOf('!') + 1;
                    arrValues.push(temp.substr(0, str));
                    arrValues.push(temp.substr(str));
                }
                else if (this.isUniqueChar(str)) {
                    arrValues.push(this.getUniqueCharVal(str));
                    arrValues.push(temp.substr(1));
                }
                else {
                    arrValues.push(temp);
                }
            }
            i++;
        }
        return arrValues;
    };
    WorkbookAutoFill.prototype.getUniqueCharVal = function (str) {
        switch (str) {
            case this.uniqueSOperator:
                return '-';
            case this.uniqueOBracket:
                return '(';
            case this.uniqueCOperator:
                return ':';
            case this.uniqueCBracket:
                return ')';
            case this.uniqueCSeparator:
                return ',';
            case this.uniqueGTOperator:
                return '>';
            case this.uniqueLTOperator:
                return '<';
            case this.uniqueMOperator:
                return '*';
            case this.uniqueDOperator:
                return '/';
            case this.uniqueConcateOperator:
                return '&';
            case this.uniqueEqualOperator:
                return '=';
            case this.uniqueExpOperator:
                return '^';
            case this.uniqueModOperator:
                return '%';
            case this.uniquePOperator:
                return '+';
        }
        return '';
    };
    WorkbookAutoFill.prototype.isUniqueChar = function (str) {
        var code = str.charCodeAt(parseInt(str, 10));
        return code >= 129 && code <= 142;
    };
    WorkbookAutoFill.prototype.markSpecialChar = function (formulaValue) {
        formulaValue = formulaValue.replace(/\(/g, '(' + this.uniqueOBracket).replace(/\)/g, ')' + this.uniqueCBracket);
        formulaValue = formulaValue.replace(/,/g, ',' + this.uniqueCSeparator).replace(/:/g, ':' + this.uniqueCOperator);
        formulaValue = formulaValue.replace(/\+/g, '+' + this.uniquePOperator).replace(/-/g, '-' + this.uniqueSOperator);
        formulaValue = formulaValue.replace(/\*/g, '*' + this.uniqueMOperator).replace(/\//g, '/' + this.uniqueDOperator);
        formulaValue = formulaValue.replace(/&/g, '&' + this.uniqueConcateOperator);
        formulaValue = formulaValue.replace(/=/g, '=' + this.uniqueEqualOperator);
        formulaValue = formulaValue.replace(/\^/g, '^' + this.uniqueExpOperator);
        formulaValue = formulaValue.replace(/>/g, '>' + this.uniqueGTOperator).replace(/</g, '<' + this.uniqueLTOperator);
        return formulaValue.replace(/%/g, '%' + this.uniqueModOperator);
    };
    WorkbookAutoFill.prototype.ensurePattern = function (patterns) {
        var patrn;
        var idx = -1;
        var i = patterns.length;
        while (i--) {
            patrn = patterns[i];
            if (typeof (patrn) === 'object') {
                idx = i;
                if (patrn.type === 'string') {
                    patrn.val = patrn.val.reverse();
                }
            }
            else {
                patterns[i] = idx;
            }
        }
        return patterns;
    };
    WorkbookAutoFill.prototype.getSelectedRange = function (sheet, startcell, endcell) {
        var i;
        var k;
        var l;
        var arr = [];
        var range = getSwapRange([startcell.rowIndex, startcell.colIndex, endcell.rowIndex, endcell.colIndex]);
        i = range[0];
        var j = range[2];
        while (i <= j) {
            if (isFilterHidden(sheet, i)) {
                i++;
                continue;
            }
            k = range[1];
            l = range[3];
            while (k <= l) {
                arr.push({ rowIndex: i, colIndex: k });
                k++;
            }
            i++;
        }
        return arr;
    };
    WorkbookAutoFill.prototype.getFillType = function (args) {
        args.fillType = this.fillInfo.fillType;
        args.disableItems = this.fillInfo.disableItems;
        return args;
    };
    WorkbookAutoFill.prototype.addEventListener = function () {
        this.parent.on(setAutoFill, this.autoFill, this);
        this.parent.on(getFillInfo, this.getFillType, this);
    };
    /**
     * Destroy workbook AutoFill module.
     *
     * @returns {void} - destroy the workbook AutoFill module.
     */
    WorkbookAutoFill.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookAutoFill.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(setAutoFill, this.autoFill);
            this.parent.off(getFillInfo, this.getFillType);
        }
    };
    /**
     * Get the workbook AutoFill module name.
     *
     * @returns {string} - Return the string.
     */
    WorkbookAutoFill.prototype.getModuleName = function () {
        return 'workbookautofill';
    };
    return WorkbookAutoFill;
}());
export { WorkbookAutoFill };
