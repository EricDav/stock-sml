import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StockService } from '../_services/stock.service';
import { AuthenticationService } from '../_services/authentication.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  values = '';
  currentStockToDelete = '';
  currentStockId = '';
  stocks: any = [];
  disable = false;
  action = 'Add';
  currentRecordId = '';
  subRecord = {
    id: null,
    name: '',
    rangeB: '',
    rangeS: '',
    price: null,
    priceDiff: null,
    quantity: null,
    ltr1: null,
    ltr2: null,
    updateFreq: null,
  }
  @Input() stockId: string;
  constructor(
    private router: Router,
    private stockService: StockService,
    private authenticationService: AuthenticationService ,
  ) { }

  ngOnInit() {
    this.stockService.fetchAllStocks()
    .pipe(first())
    .subscribe(
        data =>  {
            data.data.pop();
            this.stocks = data.data;
            this.arrangeSubrecords();
        },
        error => {
            alert('An error occured stock not added');
        });
  }

  onClick() {
    this.router.navigate(['/dashboard/create-stock']);
  }

  addStock(value: string) {
    this.stockService.addStock(value)
    .pipe(first())
    .subscribe(
        data =>  {
            const result = data.data;
            result.StockRecords = [];

            this.stocks.push(result);
            alert('Stock created successfully');
        },
        error => {
            alert('An error occured stock not added');
        });
  }

  addSubRecord() {
    if (this.action == 'Edit') {
      this.editRecord(this.currentStockId, this.currentRecordId);
      return;
    }

    let stock;

    for (let i = 0; i < this.stocks.length; i++) {
      if (this.stocks[i].id == this.currentStockId) {
        stock = this.stocks[i];
        break;
      }
    }

    if (stock.StockRecords.length > 0) {
      this.subRecord.ltr1 = 0;
      this.subRecord.ltr2 = 0;
      this.subRecord.quantity = 0;
      this.subRecord.updateFreq = 0;
      this.subRecord.price = 0;
      this.subRecord.priceDiff = 0;
    }

    const payload = {name: this.subRecord.name, rangeB: this.subRecord.rangeB, rangeS: this.subRecord.rangeS, price: this.subRecord.price, priceDiff: this.subRecord.priceDiff, quantity: this.subRecord.quantity, ltr1: this.subRecord.ltr1, ltr2: this.subRecord.ltr2, updateFreq: this.subRecord.updateFreq, stockId: this.currentStockId}

    if (stock.StockRecords.length == 9) {
      alert("You can't add more sub-record already reached the threshold");
    } else {
      this.stockService.addSubRecords(payload)
      .pipe(first())
      .subscribe(
          data =>  {
              stock.StockRecords.push(data.data);
              alert('Sub-record created successfully');
          },
          error => {
              alert('An error occured sub-record not added');
          });
      }
  }

  openUpdateModal(record, stockId) {
    console.log(record, stockId);
    this.currentRecordId = record.id;
    this.currentStockId = stockId;

    if (record.price != 0) {
      this.disable = false;
      this.subRecord.id = record.id;
      this.subRecord.name = record.name;
      this.subRecord.rangeB = record.rangeB;
      this.subRecord.rangeS = record.rangeS;
      this.subRecord.ltr1 = record.ltr1;
      this.subRecord.ltr2 = record.ltr2;
      this.subRecord.quantity = record.quantity;
      this.subRecord.updateFreq = record.updateFreq;
      this.subRecord.price = record.price;
      this.subRecord.priceDiff = record.priceDiff;
    } else {
      this.disable = true;
      const firstRecord = this.getFirstRecord(stockId);
      
      this.subRecord.name = firstRecord.name;
      this.subRecord.rangeB = record.rangeB;
      this.subRecord.rangeS = record.rangeS;
      this.subRecord.ltr1 = firstRecord.ltr1;
      this.subRecord.ltr2 = firstRecord.ltr2;
      this.subRecord.quantity = firstRecord.quantity;
      this.subRecord.updateFreq = firstRecord.updateFreq;
      this.subRecord.price = firstRecord.price;
      this.subRecord.priceDiff = firstRecord.priceDiff;
    }
    this.action = 'Edit';
  }



  getId(id) {
    return '#' + id;
  }

  updateCurrentStockId(stockId) {
    this.action = 'Add';
    this.currentStockId = stockId;

    const stock = this.getStock(stockId);

    if (stock.StockRecords.length > 0) {
      this.disable = true;
      const record = this.getFirstRecord(stockId);
      this.resetInput(record);
    } else {
      this.disable = false;
      this.resetInput();
    }
  }

  static(record, stockId, type) {
    if (record.price != 0) return record[type];

    const firstRecord = this.getFirstRecord(stockId);
    return firstRecord[type];
  }

  resetInput(record=null) {
    this.subRecord.name = (record == null) ? '' : record.name;
    this.subRecord.rangeB = '';
    this.subRecord.rangeS = '';
    this.subRecord.ltr1 = (record == null) ? '' : record.ltr1;
    this.subRecord.ltr2 = (record == null) ? '' : record.ltr2;
    this.subRecord.quantity = (record == null) ? '' : record.quantity;
    this.subRecord.updateFreq = (record == null) ? '' : record.updateFreq;
    this.subRecord.price = (record == null) ? '' : record.price;
    this.subRecord.priceDiff = (record == null) ? '' : record.priceDiff;
  }

  editRecord(stockId, recordId) {
    let stock;
    console.log(recordId);
    for (let i = 0; i < this.stocks.length; i++) {
      if (this.stocks[i].id == stockId) {
        stock = this.stocks[i];
        break;
      }
    }

    const payload = {id: this.subRecord.id, name: this.subRecord.name, rangeB: this.subRecord.rangeB, rangeS: this.subRecord.rangeS, price: this.subRecord.price, priceDiff: this.subRecord.priceDiff, quantity: this.subRecord.quantity, ltr1: this.subRecord.ltr1, ltr2: this.subRecord.ltr2, updateFreq: this.subRecord.updateFreq, stockId: stockId}

    this.stockService.updateStockRecord(recordId, payload)
      .pipe(first())
      .subscribe(
          data =>  {
            for (let j = 0; j < stock.StockRecords.length; j++) {
              if (stock.StockRecords[j].id == recordId) {
                stock.StockRecords[j] = payload;
                break;
              }
            }
              alert('Sub-record updated successfully');
          },
          error => {
              alert('An error occured while updating record');
          });
  }

  deleteStock() {
    this.stockService.deleteStock(this.currentStockId)
    .pipe(first())
    .subscribe(
        data =>  {
            const result = [];
            for (let counter = 0; counter < this.stocks.length; counter++) {
              if (this.stocks[counter].id != this.currentStockId) {
                result.push(this.stocks[counter]);
              }
            }
            
            this.stocks = result;
            alert('Stock deleted successfully successfully');
        },
        error => {
            alert('An error occured deleting stock');
        });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  setCurrentStockToDelete(stock) {
    this.currentStockId = stock.id;
    this.currentStockToDelete = 'Delete ' + stock.name + ' Stock';
  }

  getStock(stockId) {
    let stock;

    for (let i = 0; i < this.stocks.length; i++) {
      if (this.stocks[i].id == stockId) {
        stock = this.stocks[i];
        break;
      }
    }
    return stock;
  }

  getFirstRecord(stockId) {
     const stock = this.getStock(stockId);
     for (let i = 0; i < stock.StockRecords.length; i++) {
        if (stock.StockRecords[i].price != 0 && stock.StockRecords[i].quantity != 0) {
          return stock.StockRecords[i];
        }
     }

     return null;
  }

  arrangeSubrecords() {
    for (let i = 0; i < this.stocks.length; i++) {
      const subRecords = this.stocks[i].StockRecords
      const firstRecord = this.getFirstRecord(this.stocks[i].id);
      const newSubRecords = [];

      if (firstRecord) newSubRecords.push(firstRecord);
      for (let j = 0; j < subRecords.length; j++) {
        if (subRecords[j].id != firstRecord.id) newSubRecords.push(subRecords[j]);
      }

      this.stocks[i].StockRecords = newSubRecords;
    }
  }
}
