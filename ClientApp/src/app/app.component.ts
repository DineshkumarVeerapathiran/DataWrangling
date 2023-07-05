import { Component, ViewChild } from '@angular/core';
import { SpreadsheetComponent } from '@syncfusion/ej2-angular-spreadsheet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  //template: "<ejs-spreadsheet (beforeOpen)='beforeOpen($event)' openUrl='https://services.syncfusion.com/angular/production/api/spreadsheet/open' allowOpen='true'> </ejs-spreadsheet>",
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  @ViewChild('spreadsheet')
  public spreadsheetObj: SpreadsheetComponent | undefined;

  public onCreate() {
    //this.spreadsheetObj?.beforeCellFormat
  }
}
