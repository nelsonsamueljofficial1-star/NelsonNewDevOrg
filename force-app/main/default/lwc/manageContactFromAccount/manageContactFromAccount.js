/* Purpose: This JS file is used to delete Contact from Account record page
 * Created By: Nelson Samuel J
 * Created On: 04-06-2026
 */
import { api, LightningElement, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getContactsByAccountId from '@salesforce/apex/ContactHandler.getContactsByAccountId';
import LightningConfirm from 'lightning/confirm';
import deleteContact from '@salesforce/apex/ContactHandler.deleteContact';

export default class ManageContactFromAccount extends LightningElement {

    @api recordId;
    lstContacts = [];

    renderedCallback() {
        console.log(' Rendered recordId = ', this.recordId);
    }

    // // Get Current Page Reference Data
    // @wire(CurrentPageReference)
    // getStateParameters(currentPageReference) {
    //     this.RecordId = currentPageReference.state.recordId;

    //     console.log("Current Page Datas : ", JSON.stringify(currentPageReference.state));
    //     console.log("Record Id : ", this.RecordId);
    //     console.log("Current Page Datas wire ");
    // }

    // Get Contacts based on Account Id
    connectedCallback() {
        console.log("Connected Callback called with Record Id : ", this.recordId);

        if (this.recordId) {
            getContactsByAccountId({ accountId: this.recordId })
                .then(result => {
                    this.lstContacts = result;
                    console.log('Contacts loaded successfully: ', this.lstContacts);
                })
                .catch(error => {
                    console.error('Error loading contacts: ', error);
                    this.lstContacts = [];
                    this.showToast("Error Toast", "Failed to load contacts", "error");
                });
        } else {
            console.warn('No Record Id found in the page reference.');
            this.showToast("Warning Toast", "No Account Id found", "warning");
        }
    }

    get bolHasContacts() {
        return this.lstContacts && this.lstContacts.length > 0;
    }

    // Method to hide the modal box
    hideModalBox() {
        this.isShowModal = false;
    }

    // Handle Edit and Delete button actions
    async actionHandler(event) {
        const idRecordId = event.target.dataset.id;

        let objDeletedRecord = this.lstContacts.find(data => data.Id === idRecordId);

        // Show Confirmation Box before delete
        const result = await LightningConfirm.open({
            message: 'Are you sure you want to delete this contact?',
            label: 'Confirm deletion?',
            theme: 'warning',
        });
        console.log('confirm result', result);

        console.log('Record to delete : ', objDeletedRecord);

        if (result) {
            deleteContact({ objContact: objDeletedRecord })
                .then(() => {

                    // Show Success Toast
                    this.showToast("Success", "Contact deleted successfully", "success");
                    console.log('Contact deleted successfully');

                    // Remove the record from UI
                    this.lstContacts = this.lstContacts.filter(data => data.Id !== idRecordId);
                })
                .catch(error => {

                    console.error('Error deleting contact: ', error.body ? error.body.message : error);
                    this.showToast("Error", "Failed to delete contact", "error");
                });
        } else {
            // Show Info Toast
            this.showToast("Info", "Contact deletion cancelled", "info");
        }
    }

    handleSuccess(event) {
        console.log('Contact updated successfully: ', event.detail.id);
        
        // Hide the modal after successful update
        this.isShowModal = false; 
        
        // Show Success Toast
        this.showToast("Success", "Contact updated successfully.", "success");
    }

    // Show Toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

}