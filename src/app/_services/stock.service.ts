import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class StockService {

    constructor(private http: HttpClient) {
    }

    addStock(name) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return this.http.post<any>('https://live-trade.herokuapp.com/v1/trade/add-stock', { name }, {
            headers: {
                'x-access-token': user.data
            }
        })
            .pipe(map(stock => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return stock;
            }));
    }

    addSubRecords(
        data
    ) {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        return this.http.post<any>('https://live-trade.herokuapp.com/v1/trade/add-stockRecord', data, {
            headers: {
                'x-access-token': user.data
            }
        })
            .pipe(map(stock => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return stock;
            })); 
    }

    fetchAllStocks() {
        return this.http.get<any>('https://live-trade.herokuapp.com/v1/trade/all-stock/sub-records', {
        })
            .pipe(map(stock => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return stock;
            }));
    }

    deleteStock(stockId) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return this.http.delete<any>('https://live-trade.herokuapp.com/v1/trade/delete-stock/' + stockId, {
            headers: {
                'x-access-token': user.data
            }
        })
            .pipe(map(stock => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return stock;
            }));
    }

    updateStockRecord(recordId, data) {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        return this.http.put<any>('https://live-trade.herokuapp.com/v1/trade/edit-stockRecord/' + recordId, data, {
            headers: {
                'x-access-token': user.data
            }
        })
            .pipe(map(stock => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return stock;
            })); 
    }
}
