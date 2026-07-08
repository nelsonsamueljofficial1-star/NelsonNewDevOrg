import Rating from '@salesforce/schema/Account.Rating';
import { LightningElement } from 'lwc';

export default class ListMovieLWC extends LightningElement {

    // columns1 = [
    //     {
    //         Label: 'Movie Name',
    //         fieldName: 'Name',
    //         type: 'text'
    //     },
    //     {
    //         Label: 'Rating',
    //         fieldName: 'Rating',
    //         type: 'number'
    //     }
    // ];

    arrMovieData = [
        {
            Id: 1,
            Name: 'Twilight',
            Rating: 5
        },
        {
            Id: 2,
            Name: 'Evil Death 5',
            Rating: 1
        },
        {
            Id: 3,
            Name: 'Harry Potter',
            Rating: 4
        },
        {
            Id: 4,
            Name: 'Love Today',
            Rating: 0
        },
        {
            Id: 5,
            Name: 'KGF',
            Rating: 5
        }
    ];

    connectedCallback() {
        this.generateActualData();
    }

    generateActualData() {
        for ( let objdata of this.arrMovieData) {
            objdata.showMsg = objdata.Rating >= 4 ? "Recommended" : "Not Recommended";
        }
        this.arrMovieData = [...this.arrMovieData];
    }

    get isDataAvailable() {
        return this.arrMovieData && this.arrMovieData.length > 0;
    }
}