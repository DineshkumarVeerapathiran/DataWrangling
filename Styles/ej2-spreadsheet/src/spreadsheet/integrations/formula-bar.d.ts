import { Spreadsheet } from '../base/index';
/**
 * Represents Formula bar for Spreadsheet.
 */
export declare class FormulaBar {
    private parent;
    private comboBoxInstance;
    private insertFnRipple;
    private categoryCollection;
    private formulaCollection;
    private categoryList;
    private formulaList;
    private dialog;
    private isGoto;
    constructor(parent: Spreadsheet);
    getModuleName(): string;
    private createFormulaBar;
    private textAreaFocusIn;
    private textAreaFocusOut;
    private keyDownHandler;
    private keyUpHandler;
    private nameBoxBeforeOpen;
    private nameBoxBlur;
    private nameBoxSelect;
    private formulaBarUpdateHandler;
    private UpdateValueAfterMouseUp;
    private updateComboBoxValue;
    private disabletextarea;
    private formulaBarScrollEdit;
    private formulaBarClickHandler;
    private renderInsertDlg;
    private toggleFormulaBar;
    private dialogOpen;
    private dialogClose;
    private dialogBeforeClose;
    private selectFormula;
    private listSelected;
    private updateFormulaList;
    private dropDownSelect;
    private activeListFormula;
    private updateFormulaDescription;
    private formulaClickHandler;
    private addEventListener;
    destroy(): void;
    private removeEventListener;
    private editOperationHandler;
    private isFormulaBarEdit;
    private getFormulaBar;
}
