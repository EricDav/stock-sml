
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StockService } from '../_services/stock.service';
import { first } from 'rxjs/operators';
import seedrandom from 'seedrandom';

@Component({
    selector: 'app-stock-list',
    templateUrl: './stock-list.component.html',
    styleUrls: ['./stock-list.component.css']
})
export class StockListComponent implements OnInit {

    /**
     * <code>stocks</code> is a matrix containing the stock values.
     * Rows represent stocks, while columns represent field values.
     * For example <code>stocks[0][1]</code> is the last_price of item1.
     */
    stocks: any = [];
    allResultData: any = [];
    resultData: any = [];
    ltp: number = 0;
    ltq = 0;
    random = 1;
    previousRandom = 1;
    search: string = '';
    color = '';
    counter = 0;

    // ref is needed to refresh the service's clients when the stock matrix changes
    constructor(private stockService: StockService) {
    }

    setData() {
        this.stockService.fetchAllStocks()
        .pipe(first())
        .subscribe(
            data =>  {
                this.random = this.getRandom();
                const result = [];
                const allResult = [];
                this.stocks = data.data;
                for (let i = 0; i < this.stocks.length - 1; i++) {
                    const firstRecord = this.getFirstRecord(this.stocks[i]);

                    if (this.stocks[i].StockRecords.length > 0) {
                        const oldData = this.getOldDataResult(this.stocks[i].id);

                        if (oldData && this.counter%firstRecord.updateFreq != 0){
                            oldData.color = '';

                            // Not changing 
                            result.push(oldData);
                            allResult.push(oldData);
                        } else {
                            const color = '';
                            // Changing
                            const ltp = this.getRandom(this.stocks[i].id.toString()) * Number.parseFloat(firstRecord.priceDiff) + Number.parseFloat(firstRecord.price);
                            this.stocks[i].StockRecords = this.sortRecords(this.stocks[i].StockRecords);
                            const call = this.setResultData(this.stocks[i].StockRecords, ltp, firstRecord);
                            result.push({color, stockName: this.stocks[i].name, id: this.stocks[i].id, ltp: ltp.toFixed(5),  subRecords: call.result, ltq: call.ltq.toFixed(5)});
                            allResult.push({color, stockName: this.stocks[i].name, id: this.stocks[i].id, ltp: Number(ltp.toFixed(5)),  subRecords: call.result, ltq: Number(call.ltq.toFixed(5))});
                        }
                    }
                }
                this.resultData = result;
                this.allResultData = allResult;
                this.filterResult(this.search);
                this.counter +=1;
                this.previousRandom = this.random;
            },
            error => {
                // alert('An error occured stock not added');
            });
    }

    getOldDataResult(stockId) {
        for (let i = 0; i < this.resultData.length; i++) {
            if (this.resultData[i].id == stockId) {
                return this.resultData[i];
            }
        }

        return null;
    }

    isNewData(stockId) {
        for (let i = 0; i < this.resultData.length; i++) {
            if (this.resultData[i].id == stockId) return false;
        }
        return true;
    }

    ngOnInit() {
        this.random = this.getRandom();
        this.setData();
        this.cron();
        this.randomColor();
    }
    getRandom(param='') {
        let value = new Date().getTime();
        value = Math.round(value/5000);
        seedrandom(param+value.toString(), { global: true });
        return Math.random();
    }

    randomColor() {
        setInterval(() => {
            if (this.resultData.length > 0) {
                const randomNumForStock = Math.floor(0 + (Math.random() * ((this.resultData.length - 1) - 0 + 1)));
                for (let i = 0; i < this.resultData.length; i++) {
                    const stock = this.resultData[i];
                    const randomNumForRecords = Math.floor(0 + (Math.random() * ((stock.subRecords.length - 1) - 0 + 1)));
    
                    const record = stock.subRecords[randomNumForRecords];
                    record.color = 'orange';
                }
            }
        }, 2000);
    }

    cron() {
        setInterval(() => {
           this.setData();
        }, 3000);
    }

    setResultData(records, ltp, firstRecord) {
        const result = []
        let bid, totalQuantity, totalQuantity2, totalSum, totalSum2, ask;
        for (let i = 0; i < records.length; i++) {
            records[i].name = firstRecord.name
            if (i == 0) {
                bid = ltp * (Number.parseFloat(records[0].rangeB)/100);
            } else {
                bid = result[0].bid * (Number.parseFloat(records[i - 1].rangeB)/100);
            }

            totalQuantity = this.getRandom(firstRecord.id + 'Q1' + i.toString()) * firstRecord.quantity + 1;
            totalQuantity2 = this.getRandom(firstRecord.id + 'Q2' + i.toString()) * firstRecord.quantity + 1;

            totalSum = totalQuantity * ltp;
            totalSum2 = totalQuantity2 * ltp;
            ask = ltp * records[i].rangeS/100;

            result.push({name: records[i].name, totalQuantity: Number(totalQuantity.toFixed(8)), totalQuantity2: Number(totalQuantity2.toFixed(8)), totalSum: Number(totalSum.toFixed(5)), totalSum2: Number(totalSum2.toFixed(5)), ask: Number(ask.toFixed(5)), bid: Number(bid.toFixed(5))});
        }
        let ltq = firstRecord.ltr1  + (this.getRandom(firstRecord.id)  * ((firstRecord.ltr2 - 1) - 0 + 1));

        ltq = ltq > firstRecord.ltr2 ? ltq - 1 : ltq;

        // const ltq = this.getRandom(firstRecord.id) * firstRecord.ltr1 + firstRecord.ltr2 * result[0].totalQuantity2/100;

        return {result, ltq};
    }
    getId(id) {
        return '#' + id;
    }

    filterResult(search) {
        const result = [];
        for (let i = 0; i < this.allResultData.length; i++) {
            if (this.allResultData[i].stockName.toLowerCase().includes(search.toLowerCase())) {
                result.push(this.allResultData[i]);
            }
        }
        this.resultData = result;
    }
    modelChanged(event) {
        this.search = event.target.value;
        this.filterResult(this.search);
    }

    getFirstRecord(stock) {
        for (let i = 0; i < stock.StockRecords.length; i++) {
           if (stock.StockRecords[i].price != 0 && stock.StockRecords[i].quantity != 0) {
             return stock.StockRecords[i];
           }
        }
   
        return null;
     }

     getRecordName(stock) {
         return this.getFirstRecord(stock).name
     }

    sortRecords(records) {
        const sortedStocks = [];
        let keepGoing = true;

        while (records.length > 0) {
            let min = records[0];
            let index = 0;
            const newR = [];
            for (let i = 0; i < records.length; i++) {
                if (records[i].id < min.id) {
                  min = records[i]
                  index = i;
                }
            }
            records.splice(index, 1);
            sortedStocks.push(min);
        }

        return sortedStocks;
    }
}
