/* Purpose: This JS file is used to handle create multiple Contacts
 * Created By: Nelson Samuel J
 * Created On: 12-06-2026
 */
import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import createLstContact from '@salesforce/apex/createMultipleContactsLWCController.createLstContact';
import getRelatedContactEmail from '@salesforce/apex/createMultipleContactsLWCController.getRelatedContactEmail';

export default class CreateMultipleContactsLWC extends NavigationMixin(LightningElement) {
    @api recordId;

    @track objEmailCount = {};
    @track isLoading = false;

    // Initially give one Row with empty value
    @track lstRowData = [
        { key: 0, FirstName: '', LastName: '', Email: '', Gender__c: '' }
    ];

    intIndex = 0;

    // Show Table or not according to table list length
    get hasRow() {
        return this.lstRowData && this.lstRowData.length > 0;
    }

    // Get Gender Option
    get genderOptions() {
        return [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // Get related contact email
    @wire(getRelatedContactEmail, { idAcc: '$recordId' })
    wiredEmailData({ error, data }) {
        if (data) {
            data.forEach((item) => {
                if (item.Email) {
                    const strEmailValue = item.Email.trim().toLowerCase();
                    this.objEmailCount[strEmailValue] = (this.objEmailCount[strEmailValue] || 0) + 1;
                }
            });
            console.log("Processed Email Counts: ", JSON.stringify(this.objEmailCount));
        } else if (error) {
            console.error("Error fetch Email : " + (error.body?.message || error.message));
        }
    }

    // Handle input Change
    handleInputChange(event) {
        const strIndex = event.target.dataset.id;
        const strFieldName = event.target.dataset.field;
        this.lstRowData[strIndex][strFieldName] = event.target.value;

        // To check email ends with .com
        if (strFieldName == "Email" && event.target.value && !event.target.value.endsWith('.com')) {
            event.target.setCustomValidity('Enter valid email such as name@email.com.');
        } else {
            event.target.setCustomValidity('');
        }
    }

    // Handle Delete Row
    handleDeleteRow(event) {
        const strIndex = event.target.dataset.id;

        if (this.lstRowData.length !== 1) {
            this.lstRowData = this.lstRowData.filter((data) => data.key != strIndex);
        } else {
            this.showToast('Error', 'You must keep at least one row.', 'error');
        }
    }

    // Add Row data 
    handleAddRow() {
        if (this.lstRowData.length !== 5) {
            this.intIndex++;
            this.lstRowData.push({
                key: this.intIndex,
                FirstName: '',
                LastName: '',
                Email: '',
                Gender__c: ''
            });
        } else {
            this.showToast('Error', 'You can\'t add more than 5 row.', 'error');
        }
    }

    // Navigate to record Page
    navigateToRecordPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    // Handle Click Cancel and Save
    handleClick(event) {
        const strFieldName = event.currentTarget.name;

        // For Cancel Button
        if (strFieldName === "Cancel") {
            this.navigateToRecordPage();
        } else { // For Save Button
            let bolIsValid = true
            let hasDuplicates = false;
            let hasInvalidDomain = false;
            const lstAllData = this.template.querySelectorAll('lightning-input,lightning-combobox');

            // Reset and Assign the value
            let objEmailCountMap = { ...this.objEmailCount };
            console.log("Email Count in org ", JSON.stringify(objEmailCountMap));

            // To find Email Duplicate
            lstAllData.forEach((data) => {
                if (data.dataset.field === "Email" && data.value) {
                    const strEmailValue = data.value.trim().toLowerCase();
                    objEmailCountMap[strEmailValue] = (objEmailCountMap[strEmailValue] || 0) + 1;
                }
            });

            // Two Time Check to Give Email Error for respective error field and required fields
            lstAllData.forEach((data) => {
                if (data.dataset.field === "Email") {
                    if (data.value) {
                        const strEmailValue = data.value.trim().toLowerCase();

                        // If the email appears more than once, flag BOTH rows as duplicates
                        if (objEmailCountMap[strEmailValue] > 1) {
                            data.setCustomValidity('Duplicate Email: This email address has already been entered in the Account');
                            hasDuplicates = true;
                            bolIsValid = false;
                        } else if (!strEmailValue.endsWith('.com')) { // Check email ends with .com
                            data.setCustomValidity('Invalid Domain: Enter a valid email address ending with .com (e.g., name@email.com).');
                            hasInvalidDomain = true;
                            bolIsValid = false;
                        } else {
                            data.setCustomValidity(''); // Clear old error if unique
                        }
                    } else {
                        data.setCustomValidity(''); // Clear if blank (let native 'required' handle it)
                    }
                }

                // Check Data should be filled
                if (!data.reportValidity()) {
                    bolIsValid = false;
                }
            });


            if (!bolIsValid) {
                if (hasDuplicates) {
                    this.showToast('Error', 'Duplicate email addresses detected in the form or existing records.', 'error');
                } else if (hasInvalidDomain) {
                    this.showToast('Error', 'Email addresses must end with .com', 'error');
                } else {
                    this.showToast('Error', 'Kindly fill out all required fields correctly.', 'error');
                }
                return;
            }

            console.log("Create Multiple Contacts LWC - All Contact Details ", JSON.stringify(this.lstRowData));

            // Cleaned the Contacts according to Create List of contacts
            const lstCleanedContacts = this.lstRowData.map(row => {

                // Destructure the row to separate 'key' from the rest of the fields
                const { key, ...restOfFields } = row;

                // Return a new object containing the rest of the fields plus the AccountId
                return {
                    ...restOfFields,
                    AccountId: this.recordId
                };
            });

            this.isLoading = true;

            // Call Apex to Create list of contacts
            createLstContact({ lstContacts: lstCleanedContacts })
                .then(() => {
                    this.showToast('Success', 'Contact Created Successfully', 'success');
                    this.navigateToRecordPage();
                })
                .catch((Error) => {
                    this.showToast('Error', Error.body.message, 'error');
                }).finally(() => {
                    this.isLoading = false;
                })
        }

    }

    // Handle Close 
    handleClose() {
        this.navigateToRecordPage();
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