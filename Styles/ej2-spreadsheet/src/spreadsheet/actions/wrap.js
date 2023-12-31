import { closest, Browser } from '@syncfusion/ej2-base';
import { ribbonClick, inView, setMaxHgt, getMaxHgt, WRAPTEXT, setRowEleHeight, rowHeightChanged } from '../common/index';
import { completeAction, getLines, getExcludedColumnWidth, getTextHeightWithBorder } from '../common/index';
import { positionAutoFillElement, colWidthChanged, getLineHeight } from '../common/index';
import { getCell, wrap as wrapText, wrapEvent, getRow, getRowsHeight } from '../../workbook/index';
import { getRowHeight, getAddressFromSelectedRange, beginAction } from '../../workbook/index';
/**
 * Represents Wrap Text support for Spreadsheet.
 */
var WrapText = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet Wrap Text module.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet.
     * @private
     */
    function WrapText(parent) {
        this.parent = parent;
        this.wrapCell = this.parent.createElement('span', { className: 'e-wrap-content' });
        this.addEventListener();
    }
    WrapText.prototype.addEventListener = function () {
        this.parent.on(ribbonClick, this.ribbonClickHandler, this);
        this.parent.on(wrapEvent, this.wrapTextHandler, this);
        this.parent.on(rowHeightChanged, this.rowHeightChangedHandler, this);
        this.parent.on(colWidthChanged, this.colWidthChanged, this);
    };
    WrapText.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(ribbonClick, this.ribbonClickHandler);
            this.parent.off(wrapEvent, this.wrapTextHandler);
            this.parent.off(rowHeightChanged, this.rowHeightChangedHandler);
            this.parent.off(colWidthChanged, this.colWidthChanged);
        }
    };
    WrapText.prototype.wrapTextHandler = function (args) {
        if (args.initial || inView(this.parent, args.range, true)) {
            var ele = void 0;
            var cell = void 0;
            var colwidth = void 0;
            var maxHgt = void 0;
            var hgt = void 0;
            var isCustomHgt = void 0;
            var rowCustomHeight = void 0;
            var lineHgt = void 0;
            for (var i = args.range[0]; i <= args.range[2]; i++) {
                maxHgt = 0;
                rowCustomHeight = getRow(args.sheet, i).customHeight;
                isCustomHgt = rowCustomHeight || args.isCustomHgt;
                for (var j = args.range[1]; j <= args.range[3]; j++) {
                    cell = getCell(i, j, args.sheet, null, true);
                    if (cell.rowSpan < 0 || cell.colSpan < 0) {
                        continue;
                    }
                    var isMerge = (cell.rowSpan > 1 || cell.colSpan > 1);
                    ele = (args.initial ? args.td : this.parent.getCell(i, j));
                    if (ele) {
                        if (args.wrap) {
                            lineHgt = getLineHeight(cell.style && cell.style.fontFamily ? cell.style : this.parent.cellStyle);
                            ele.classList.add(WRAPTEXT);
                        }
                        else {
                            ele.classList.remove(WRAPTEXT);
                            lineHgt = null;
                        }
                        if (isCustomHgt || isMerge) {
                            this.updateWrapCell(i, j, args.sheet, ele);
                        }
                    }
                    else {
                        lineHgt = null;
                    }
                    if (Browser.isIE) {
                        ele.classList.add('e-ie-wrap');
                    }
                    if (!(isCustomHgt || isMerge)) {
                        colwidth = getExcludedColumnWidth(args.sheet, i, j, cell.colSpan > 1 ? j + cell.colSpan - 1 : j);
                        var displayText = this.parent.getDisplayText(cell).toString();
                        if (displayText.indexOf('\n') < 0) {
                            var editElem = this.parent.element.querySelector('.e-spreadsheet-edit');
                            if (editElem) {
                                if (editElem.textContent.indexOf('\n') > -1) {
                                    displayText = editElem.textContent;
                                }
                            }
                        }
                        if (displayText) {
                            if (args.wrap) {
                                if (ele && ele.classList.contains('e-alt-unwrap')) {
                                    ele.classList.remove('e-alt-unwrap');
                                }
                                var lines = void 0;
                                var n = 0;
                                var p = void 0;
                                if (displayText.indexOf('\n') > -1) {
                                    var splitVal = displayText.split('\n');
                                    var valLength = splitVal.length;
                                    for (p = 0; p < valLength; p++) {
                                        lines = getLines(splitVal[p], colwidth, cell.style, this.parent.cellStyle);
                                        if (lines === 0) {
                                            lines = 1; // for empty new line
                                        }
                                        n = n + lines;
                                    }
                                    lines = n;
                                }
                                else {
                                    lines = getLines(displayText, colwidth, cell.style, this.parent.cellStyle);
                                }
                                hgt = getTextHeightWithBorder(this.parent, i, j, args.sheet, cell.style || this.parent.cellStyle, lines, lineHgt);
                                maxHgt = Math.max(maxHgt, hgt);
                                if (cell.rowSpan > 1) {
                                    var prevHeight = getRowsHeight(args.sheet, i, i + (cell.rowSpan - 1));
                                    if (prevHeight >= maxHgt) {
                                        return;
                                    }
                                    hgt = maxHgt = getRowHeight(args.sheet, i) + (maxHgt - prevHeight);
                                }
                                setMaxHgt(args.sheet, i, j, hgt);
                            }
                            else {
                                if (displayText.indexOf('\n') > -1) {
                                    ele.classList.add('e-alt-unwrap');
                                }
                                hgt = getTextHeightWithBorder(this.parent, i, j, args.sheet, cell.style || this.parent.cellStyle, 1, lineHgt);
                                setMaxHgt(args.sheet, i, j, hgt);
                                maxHgt = Math.max(getMaxHgt(args.sheet, i), 20);
                            }
                        }
                        else if (!args.wrap || !displayText) {
                            setMaxHgt(args.sheet, i, j, 20);
                            maxHgt = Math.max(getMaxHgt(args.sheet, i), 20);
                        }
                        if (j === args.range[3] && ((args.wrap && maxHgt > 20 && getMaxHgt(args.sheet, i) <= maxHgt) || ((!args.wrap ||
                            !displayText) && getMaxHgt(args.sheet, i) < getRowHeight(args.sheet, i) && getRowHeight(args.sheet, i) > 20))) {
                            setRowEleHeight(this.parent, args.sheet, maxHgt, i, args.row, args.hRow);
                        }
                    }
                    if (isCustomHgt && !isMerge) {
                        var displayText = this.parent.getDisplayText(cell);
                        if (args.wrap) {
                            if (ele && ele.classList.contains('e-alt-unwrap')) {
                                ele.classList.remove('e-alt-unwrap');
                            }
                        }
                        else {
                            if (displayText.indexOf('\n') > -1) {
                                ele.classList.add('e-alt-unwrap');
                            }
                        }
                    }
                    if (args.wrap && ele) {
                        if (!rowCustomHeight) {
                            ele.style.lineHeight = (parseFloat((cell.style && cell.style.fontSize) || this.parent.cellStyle.fontSize) *
                                lineHgt) + 'pt';
                        }
                        else if (ele.style.lineHeight) {
                            ele.style.lineHeight = '';
                        }
                    }
                    else if (ele) {
                        ele.style.lineHeight = '';
                    }
                }
            }
            if (!args.initial) {
                this.parent.notify(positionAutoFillElement, null);
            }
        }
    };
    WrapText.prototype.ribbonClickHandler = function (args) {
        var target = closest(args.originalEvent.target, '.e-btn');
        if (target && target.id === this.parent.element.id + '_wrap') {
            var wrap = target.classList.contains('e-active');
            var address = getAddressFromSelectedRange(this.parent.getActiveSheet());
            var eventArgs = { address: address, wrap: wrap, cancel: false };
            this.parent.notify(beginAction, { action: 'beforeWrap', eventArgs: eventArgs });
            if (!eventArgs.cancel) {
                wrapText(this.parent.getActiveSheet().selectedRange, wrap, this.parent);
                this.parent.notify(completeAction, { action: 'wrap', eventArgs: { address: address, wrap: wrap } });
            }
        }
    };
    WrapText.prototype.rowHeightChangedHandler = function (args) {
        if (args.isCustomHgt) {
            var sheet = this.parent.getActiveSheet();
            var ele = void 0;
            for (var i = this.parent.viewport.leftIndex, len = this.parent.viewport.rightIndex; i <= len; i++) {
                if (getCell(args.rowIdx, i, sheet, false, true).wrap) {
                    ele = this.parent.getCell(args.rowIdx, i);
                    this.updateWrapCell(args.rowIdx, i, sheet, ele);
                    if (ele.style.lineHeight) {
                        ele.style.lineHeight = '';
                    }
                }
            }
        }
    };
    WrapText.prototype.colWidthChanged = function (args) {
        if (args.checkWrapCell) {
            var sheet = this.parent.getActiveSheet();
            for (var i = this.parent.viewport.topIndex, len = this.parent.viewport.bottomIndex; i <= len; i++) {
                if (getCell(i, args.colIdx, sheet, false, true).wrap) {
                    this.updateWrapCell(i, args.colIdx, sheet, this.parent.getCell(i, args.colIdx));
                }
            }
        }
    };
    WrapText.prototype.updateWrapCell = function (rowIdx, colIdx, sheet, ele) {
        if (ele && !ele.querySelector('.e-wrap-content')) {
            var wrapSpan = this.wrapCell.cloneNode();
            var filterBtn = ele.querySelector('.e-filter-btn');
            while (ele.childElementCount) {
                wrapSpan.appendChild(ele.firstElementChild);
            }
            if (filterBtn) {
                if (ele.firstChild) {
                    ele.insertBefore(filterBtn, ele.firstChild);
                }
                else {
                    ele.appendChild(filterBtn);
                }
            }
            if (!getCell(rowIdx, colIdx, sheet, false, true).hyperlink) {
                var node = ele.lastChild;
                if (node && node.nodeType === 3) {
                    wrapSpan.appendChild(document.createTextNode(node.textContent));
                    node.textContent = '';
                }
                else {
                    wrapSpan.appendChild(document.createTextNode(ele.textContent));
                    ele.textContent = '';
                }
            }
            ele.appendChild(wrapSpan);
        }
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    WrapText.prototype.getModuleName = function () {
        return 'wrapText';
    };
    /**
     * Removes the added event handlers and clears the internal properties of WrapText module.
     *
     * @returns {void}
     */
    WrapText.prototype.destroy = function () {
        this.removeEventListener();
        this.wrapCell = null;
        this.parent = null;
    };
    return WrapText;
}());
export { WrapText };
