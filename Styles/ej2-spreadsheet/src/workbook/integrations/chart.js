import { getRangeIndexes, inRange, checkRange, getSwapRange, getRangeAddress } from '../common/index';
import { setCell, getSheetIndex, getCell, getSheetIndexFromId } from '../base/index';
import { setChart, initiateChart, refreshChart, updateChart, deleteChartColl, refreshChartSize, focusChartBorder } from '../common/event';
import { closest, isNullOrUndefined, getComponent, isUndefined, getUniqueID } from '@syncfusion/ej2-base';
/**
 * The `WorkbookChart` module is used to handle chart action in Spreadsheet.
 */
var WorkbookChart = /** @class */ (function () {
    /**
     * Constructor for WorkbookChart module.
     *
     * @param {Workbook} parent - Constructor for WorkbookChart module.
     */
    function WorkbookChart(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    WorkbookChart.prototype.addEventListener = function () {
        this.parent.on(setChart, this.setChartHandler, this);
        this.parent.on(refreshChart, this.refreshChartData, this);
        this.parent.on(deleteChartColl, this.deleteChartColl, this);
        this.parent.on(refreshChartSize, this.refreshChartSize, this);
        this.parent.on(focusChartBorder, this.focusChartBorder, this);
    };
    WorkbookChart.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(setChart, this.setChartHandler);
            this.parent.off(refreshChart, this.refreshChartData);
            this.parent.off(deleteChartColl, this.deleteChartColl);
            this.parent.off(refreshChartSize, this.refreshChartSize);
            this.parent.off(focusChartBorder, this.focusChartBorder);
        }
    };
    WorkbookChart.prototype.setChartHandler = function (args) {
        var i = 0;
        args.isInitCell = isNullOrUndefined(args.isInitCell) ? false : args.isInitCell;
        args.isUndoRedo = isNullOrUndefined(args.isUndoRedo) ? true : args.isUndoRedo;
        args.isPaste = isNullOrUndefined(args.isPaste) ? false : args.isPaste;
        var chart = args.chart;
        var chartModel;
        if (chart.length > 0) {
            while (i < chart.length) {
                if (args.isCut === false) {
                    if (document.getElementById(args.chart[i].id)) {
                        chart[i] = {
                            range: chart[i].range, id: getUniqueID('e_spreadsheet_chart'), theme: chart[i].theme,
                            isSeriesInRows: chart[i].isSeriesInRows, type: chart[i].type,
                            markerSettings: chart[i].markerSettings
                        };
                    }
                }
                if (document.getElementById(args.chart[i].id)) {
                    return;
                }
                chartModel = chart[i];
                chartModel.theme = chartModel.theme || 'Material';
                chartModel.type = chartModel.type || 'Line';
                chartModel.isSeriesInRows = chartModel.isSeriesInRows || false;
                chartModel.range = chartModel.range || this.parent.getActiveSheet().selectedRange;
                var rangeIdx = getSwapRange(getRangeIndexes(chartModel.range));
                var rangeAddress = getRangeAddress(rangeIdx);
                if (chartModel.range.indexOf('!') > 0) {
                    chartModel.range = chartModel.range.split('!')[0] + '!' + rangeAddress;
                }
                else {
                    chartModel.range = this.parent.getActiveSheet().name + '!' + rangeAddress;
                }
                if (isNullOrUndefined(chartModel.id)) {
                    chartModel.id = getUniqueID('e_spreadsheet_chart');
                }
                if (chartModel.markerSettings && chartModel.markerSettings.visible) {
                    if (chartModel.markerSettings.isFilled === undefined) {
                        chartModel.markerSettings.isFilled = true;
                    }
                    if (chartModel.markerSettings.shape === undefined) {
                        chartModel.markerSettings.shape = 'Circle';
                    }
                }
                chartModel.height = chartModel.height || 290;
                chartModel.width = chartModel.width || 480;
                this.parent.notify(initiateChart, {
                    option: chartModel, isInitCell: args.isInitCell, triggerEvent: args.isUndoRedo,
                    dataSheetIdx: args.dataSheetIdx, range: args.range, isPaste: args.isPaste
                });
                this.parent.chartColl.push(chartModel);
                if (!args.isInitCell || args.isPaste) {
                    var sheetIdx = args.sheetId === undefined ? ((chartModel.range && chartModel.range.indexOf('!') > 0) ?
                        getSheetIndex(this.parent, chartModel.range.split('!')[0]) : this.parent.activeSheetIndex) :
                        getSheetIndexFromId(this.parent, args.sheetId);
                    var indexes = args.isPaste ? getRangeIndexes(args.range) : getRangeIndexes(chartModel.range);
                    var sheet = isUndefined(sheetIdx) ? this.parent.getActiveSheet() : this.parent.sheets[sheetIdx];
                    var cell = getCell(indexes[0], indexes[1], sheet);
                    if (cell && cell.chart) {
                        cell.chart.push(chartModel);
                    }
                    else {
                        setCell(indexes[0], indexes[1], sheet, { chart: [chartModel] }, true);
                    }
                }
                i++;
            }
        }
    };
    WorkbookChart.prototype.refreshChartData = function (args) {
        if (!this.parent.chartColl || !this.parent.chartColl.length) {
            return;
        }
        var chart;
        var rangeArr;
        var range;
        var insideRange;
        for (var i = 0, len = this.parent.chartColl.length; i < len; i++) {
            chart = this.parent.chartColl[i];
            if (chart.range.includes('!')) {
                rangeArr = chart.range.split('!');
                if (this.parent.activeSheetIndex !== getSheetIndex(this.parent, rangeArr[0])) {
                    continue;
                }
                range = rangeArr[1];
            }
            else {
                range = chart.range;
            }
            if (args.viewportIndexes) {
                for (var idx = 0; idx < args.viewportIndexes.length; idx++) {
                    if (checkRange([args.viewportIndexes[idx]], range)) {
                        insideRange = true;
                        break;
                    }
                }
            }
            else {
                insideRange = args.range ? checkRange([args.range], range) : (args.showHide ? this.inRowColumnRange(getRangeIndexes(range), args.rIdx, args.showHide) : inRange(getRangeIndexes(range), args.rIdx, args.cIdx));
            }
            if (insideRange) {
                this.parent.notify(updateChart, { chart: chart });
            }
        }
    };
    WorkbookChart.prototype.inRowColumnRange = function (range, index, showHide) {
        return showHide === 'rows' ? index >= range[0] && index <= range[2] : index >= range[1] && index <= range[3];
    };
    WorkbookChart.prototype.refreshChartSize = function (args) {
        var chartCnt;
        var j = 1;
        var sheetCnt = this.parent.sheets.length + 1;
        while (j < sheetCnt) {
            var charts = this.parent.chartColl;
            chartCnt = charts ? charts.length : 0;
            if (chartCnt) {
                while (chartCnt--) {
                    var chart = this.parent.chartColl[chartCnt];
                    if (!isNullOrUndefined(args.overlayEle.querySelector('#' + chart.id))) {
                        var chartObj = this.parent.element.querySelector('.' + chart.id);
                        var excelFilter = getComponent(chartObj, 'chart');
                        if (excelFilter) {
                            excelFilter.height = args.height;
                            excelFilter.width = args.width;
                        }
                    }
                }
            }
            j++;
        }
    };
    WorkbookChart.prototype.focusChartBorder = function (args) {
        for (var idx = 0; idx < this.parent.chartColl.length; idx++) {
            var overlayEle = document.getElementById(args.id);
            var chartEle = document.getElementById(this.parent.chartColl[idx].id);
            if (overlayEle && chartEle && closest(chartEle, '.' + overlayEle.classList[1]) === overlayEle) {
                this.parent.notify(initiateChart, {
                    option: this.parent.chartColl[idx], isRefresh: true
                });
            }
        }
    };
    WorkbookChart.prototype.deleteChartColl = function (args) {
        for (var idx = 0; idx < this.parent.chartColl.length; idx++) {
            if (this.parent.chartColl[idx].id + '_overlay' === args.id) {
                this.parent.chartColl.splice(idx, 1);
            }
        }
    };
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    WorkbookChart.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the workbook chart module name.
     *
     * @returns {string} - Get the workbook chart module name.
     */
    WorkbookChart.prototype.getModuleName = function () {
        return 'workbookChart';
    };
    return WorkbookChart;
}());
export { WorkbookChart };
