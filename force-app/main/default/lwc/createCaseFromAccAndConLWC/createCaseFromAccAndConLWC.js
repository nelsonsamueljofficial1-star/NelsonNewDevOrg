/* Purpose: This JS file is used to handle logic to create Case from Contact and Account
 * Created By: Nelson Samuel J
 * Created On: 13-06-2026
 */
import { api, LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import getAccRelContacts from '@salesforce/apex/CreateCaseFromAccAndConLWCController.getAccRelContacts';
import getContactDetails from '@salesforce/apex/CreateCaseFromAccAndConLWCController.getContactDetails';

export default class CreateCaseFromAccAndConLWC extends NavigationMixin(LightningElement) {
    idCurrent;
    objCurrent;

    @track idAccRecord;
    @track bolisAccount = false;
    @track lstContactOption = [];
    @track strSelectedCon = "";
    @track boldisableContact = false;
    @track isLoading = true;

    @api
    get recordId() {
        return this.idCurrent;
    }
    set recordId(value) {
        this.idCurrent = value;
        this.initializeComponent();
    }

    @api
    get objectApiName() {
        return this.objCurrent;
    }
    set objectApiName(value) {
        this.objCurrent = value;
        this.initializeComponent();
    }

    // When the two api data has value it calls and store the value
    initializeComponent() {
        if (!this.idCurrent || !this.objCurrent) {
            console.log("Waiting for both recordId and objectApiName to load...");
            return;
        }

        console.log("Both properties loaded! Current Object: ", this.objCurrent);

        if (this.objCurrent === "Account") {
            this.idAccRecord = this.idCurrent;
            this.bolisAccount = true;
            getAccRelContacts({ idAcc: this.idAccRecord })
                .then((result) => {
                    if (result) {
                        this.lstContactOption = result
                    } else {
                        this.showToast('Error', 'No Contacts found', 'error');
                    }
                }).catch((error) => {
                    this.showToast('Error', error.body.message, 'error');
                });
        } else {
            this.bolisAccount = false;
            this.boldisableContact = true;

            // Get contact Details and assign to respetive values
            getContactDetails({ idCon: this.idCurrent })
                .then((result) => {
                    this.strSelectedCon = result.Id;

                    // Setup the option dropdown containing only this contact option row item
                    this.lstContactOption = [{ label: result.Name, value: result.Id }];

                    if (result.AccountId) {
                        this.idAccRecord = result.AccountId
                    } else {
                        this.showToast('Error', "No Account for this Contact", 'error');
                    }
                }).catch((error) => {
                    this.showToast('Error', error.body.message, 'error');
                });
        }
    }

    // Handle contact data
    handleChange(event) {
        this.strSelectedCon = event.detail.value;
    }

    // Submit handling
    toSubmit() {
        this.isLoading = true;
        const allInputs = this.template.querySelectorAll('lightning-input-field');

        const fields = {};
        allInputs.forEach(field => {
            fields[field.fieldName] = field.value;
        });

        // Submit manually
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        this.showToast('Success', 'Case "' + fields.Subject + '" was created.', 'success');
        this.isLoading = false;
    }

    // Handle all click action here
    handleClick(event) {
        const strFieldName = event.currentTarget.name;

        if (strFieldName === "Cancel") {
            this.navigateToRecordPage();
            return;
        }

        let isValid = true;

        // Validate all lightning-input-field
        const lstFields = this.template.querySelectorAll('lightning-input-field');

        lstFields.forEach(field => {
            if (!field.reportValidity()) {
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        if (strFieldName === "Save") {
            this.toSubmit();
            this.navigateToRecordPage();
        } else {
            this.isLoading = true;
            
            this.toSubmit();

            // Reset the Data
            this.template.querySelectorAll('lightning-input-field').forEach(field => {
                if (field.fieldName !== 'AccountId') {
                    field.reset();
                }
            });

            // Reset contact dropdown choice if we came from an Account context
            if (this.objCurrent === 'Account') {
                this.strSelectedCon = "";
            }
        }

    }

    // Handle On Load
    handleOnLoad() {
        this.isLoading = false;
    }

    // Handle Close
    handleClose(){
        this.navigateToRecordPage();
    }

    // Navigate to record Page
    navigateToRecordPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.objectApiName,
                actionName: 'view'
            }
        });
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