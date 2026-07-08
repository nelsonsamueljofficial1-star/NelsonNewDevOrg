import { getRecord } from 'lightning/uiRecordApi';
import { api, LightningElement, wire } from 'lwc';

const FIELDS = ['Account.Id', 'Account.Name', 'Account.AccountNumber', 'Account.Phone', 'Account.Industry', 'Account.Website'];
export default class ParentAccountLWC extends LightningElement {

    @api recordId;
    bolIsDataAvailable = false;
    tempData = {};
    objAccount = {};

    // Get Record using Wire 
    @wire(getRecord, {
        recordId: "$recordId",
        fields: FIELDS
    })
    recordAccount({ data, error }) {
        if (data) {
            this.tempData = data.fields;
            console.log('Success data : ', data.fields);
        } else if (error) {
            console.log('Error : ', error);
        }
    }

    actionHandler() {

        // Assign the data to a new object to pass to child component
        this.objAccount = this.tempData;

        // Make button as a toggle button
        if (this.bolIsDataAvailable) {
            this.bolIsDataAvailable = false;
        } else {
            this.bolIsDataAvailable = true;
        }

        console.log('Account Data : ', this.objAccount);
    }


}