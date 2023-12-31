import { Workbook } from '../base/index';
import { Calculate } from '../../calculate/index';
/**
 * @hidden
 * The `WorkbookFormula` module is used to handle the formula operation in Workbook.
 */
export declare class WorkbookFormula {
    private parent;
    private calcID;
    uniqueOBracket: string;
    uniqueCBracket: string;
    uniqueCSeparator: string;
    uniqueCOperator: string;
    uniquePOperator: string;
    uniqueSOperator: string;
    uniqueMOperator: string;
    uniqueDOperator: string;
    uniqueModOperator: string;
    uniqueConcateOperator: string;
    uniqueEqualOperator: string;
    uniqueExpOperator: string;
    uniqueGTOperator: string;
    uniqueLTOperator: string;
    calculateInstance: Calculate;
    private sheetInfo;
    /**
     * Constructor for formula module in Workbook.
     *
     * @param {Workbook} workbook - Specifies the workbook.
     * @private
     */
    constructor(workbook: Workbook);
    private init;
    /**
     * To destroy the formula module.
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
    /**
     * Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    getModuleName(): string;
    private initCalculate;
    private clearFormulaDependentCells;
    private formulaInValidation;
    private performFormulaOperation;
    private referenceError;
    private getSheetInfo;
    private addCustomFunction;
    private updateSheetInfo;
    private sheetDeletion;
    private renameUpdation;
    private updateDataContainer;
    private parseSheetRef;
    private registerSheet;
    private unRegisterSheet;
    private getUniqueRange;
    private removeUniquecol;
    private refreshCalculate;
    private refreshRandomFormula;
    private autoCorrectFormula;
    private correctCellReference;
    private autoCorrectCellRef;
    private getUpdatedCellRef;
    private initiateDefinedNames;
    /**
     * @hidden
     * Used to add defined name to workbook.
     *
     * @param {DefineNameModel} definedName - Define named range.
     * @param {boolean} isValidate - Specify the boolean value.
     * @param {number} index - Define named index.
     * @param {boolean} isEventTrigger - Specify the boolean value.
     * @returns {boolean} - Used to add defined name to workbook.
     */
    private addDefinedName;
    /**
     * @hidden
     * Used to remove defined name from workbook.
     *
     * @param {string} name - Specifies the defined name.
     * @param {string} scope - Specifies the scope of the define name.
     * @param {boolean} isEventTrigger - Specify the boolean value.
     * @returns {boolean} - To Return the bool value.
     */
    private removeDefinedName;
    private checkIsNameExist;
    private getIndexFromNameColl;
    private toFixed;
    private aggregateComputation;
    private refreshInsertDelete;
    private getUpdatedFormulaOnInsertDelete;
    private updateFormula;
    private clearUniqueRange;
    private clearAllUniqueFormulaValue;
    private parseFormula;
    private getUniqueCharVal;
    private isUniqueChar;
    private markSpecialChar;
    private refreshNamedRange;
    private updateDefinedNames;
}
