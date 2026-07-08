/* Purpose: This JS file is used to show the Account and related contact details in the Home page of the user.
 * Created By: Nelson Samuel J
 * Created On: 05-06-2026
 */
import { LightningElement, track } from 'lwc';
import getAccountAndRelatedContactDetails from '@salesforce/apex/AccountAndRelatedContact.getAccountAndRelatedContactDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountAndRelatedContact extends NavigationMixin(LightningElement) {
    @track lstAccountAndRelatedContactDetails = [];

    // Getter to check if there are account details to display
    get isAccountList() {
        return this.lstAccountAndRelatedContactDetails.length > 0;
    }

    // Fetch account and related contact details when the component is initialized
    connectedCallback() {
        getAccountAndRelatedContactDetails()
            .then(result => {
                this.lstAccountAndRelatedContactDetails = result;
            })
            .catch(error => {
                this.showToast('Error', 'Error fetching account and related contact details', 'error');
            });
    }

    // Handle contact click event
    handleContactClick(event) {
        
        // event.preventDefault();
        const idContactId = event.target.dataset.id;

        console.log("Contact Nav Id", idContactId);

        // Navigate to the contact record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: idContactId,
                objectApiName: 'Contact',
                actionName: 'view'
            }
        });
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
}