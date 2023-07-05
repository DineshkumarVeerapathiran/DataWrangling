import { isNumber } from '../common/math';
/**
 * Check the value of the cell is number with thousand separator and currency symbol and returns the parsed value.
 * @hidden
 */
export function checkIsNumberAndGetNumber(cell, locale, groupSep, decimalSep, currencySymbol) {
    var cellValue = cell.value;
    if (isNumber(cellValue)) {
        return { isNumber: true, value: cellValue };
    }
    if (cellValue) {
        if (currencySymbol && cellValue.includes(currencySymbol) && (cell.format.includes(currencySymbol) || cell.format.includes('$'))) {
            cellValue = cellValue.replace(currencySymbol, '');
        }
        if (cellValue.includes(groupSep) && parseThousandSeparator(cellValue, locale, groupSep, decimalSep)) {
            cellValue = cellValue.split(groupSep).join('');
        }
        if (decimalSep !== '.' && cellValue.includes(decimalSep)) {
            cellValue = cellValue.replace(decimalSep, '.');
        }
    }
    return { isNumber: isNumber(cellValue), value: cellValue };
}
/**
 * @hidden
 */
export function parseThousandSeparator(value, locale, groupSep, decimalSep) {
    var isParsed = false;
    var number = 123456;
    var parsedNum = number.toLocaleString(locale);
    var splitedNum = parsedNum.split(groupSep).reverse();
    var splitedValue = value.split(decimalSep)[0].split(groupSep);
    for (var i = 0; i < splitedValue.length; i++) {
        if (i === splitedValue.length - 1) {
            isParsed = splitedValue[i].length === splitedNum[0].length;
        }
        else {
            isParsed = i === 0 ? splitedValue[i].length <= splitedNum[1].length :
                splitedValue[i].length === splitedNum[1].length;
        }
        if (!isParsed) {
            break;
        }
    }
    return isParsed;
}
