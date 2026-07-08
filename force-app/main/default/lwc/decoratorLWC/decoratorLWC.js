import { getRecord } from 'lightning/uiRecordApi';
import { api, LightningElement, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { CurrentPageReference } from 'lightning/navigation';

const FIELDS = ['Account.Id', 'Account.Name', 'Account.Phone', 'Account.Industry'];

export default class DecoratorLWC extends NavigationMixin(LightningElement) {
    @api recordId;

    RecordID;

    bolIsDataAvailable = false;
    accountRecord = [];

    // Get Current Page Reference Data
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        this.RecordID = currentPageReference.state.recordId;
        console.log("Current Page Datas : ", currentPageReference);
    }

    // Get Record using Wire 
    @wire(getRecord, {
        recordId: "$recordId",
        fields: FIELDS
    })
    recordAccount({ data, error }) {
        if (data) {
            this.accountRecord = [...this.accountRecord, data];
            console.log('Success data : ', data);
            this.bolIsDataAvailable = true;
            this.showToast("Sucesss Toast", "Account details loaded successfully", "success")

        } else if (error) {
            console.log('Error : ', error);
            this.bolIsDataAvailable = false;
            this.showToast("Error Toast", "Record Load Fail", "error")
        }
    }

    // Show Toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message:
                message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Navigate to Record Page
    handleButtonClick() {

        // Generate a URL to a User record page
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.recordId,
                actionName: "view",
            },
        });

    }

    // Navigate to List of Contact
    handleButtonClick2() {

        // Generate a URL to a User record page
        this[NavigationMixin.Navigate]({
            type: "standard__recordRelationshipPage",
            attributes: {
                recordId: this.recordId,
                objectApiName: "Account",
                relationshipApiName: "Contacts",
                actionName: "view",
            },
        });

    }
}