/* Purpose: This JS file is used to handle the Customer Support Dashboard functionality
 * Created By: Nelson Samuel J
 * Created On: 15-06-2026
 */
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getComplaints from '@salesforce/apex/CustomerSupportDashboardLWCController.getComplaints';
import checkRelatedContacts from '@salesforce/apex/CustomerSupportDashboardLWCController.checkRelatedContacts';
import closeSelectedComplaints from '@salesforce/apex/CustomerSupportDashboardLWCController.closeSelectedComplaints';

export default class CustomerSupportDashboardLWC extends LightningElement {
    @track intOpenCount = 0;
    @track intInProgressCount = 0;
    @track intEscalatedCount = 0;
    @track intClosedCount = 0;
    @track intTotalCount = 0;
    @track lstComplaints = [];
    @track isLoading = true;
    @track isShowModal = false;
    @track idSelectedAcc = "";
    @track idSelectedContact = "";
    @track isContactDisabled = true;
    @track isSaveDisabled = true;
    @track lstSelectedCaseIds = [];

    @track contactFilter = null;
    @track lstComplaintColumns = [
        {
            label: 'Case Number',
            fieldName: 'CaseLink', // Points to the URL string property
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'CaseNumber' }, // Shows the Case Number as the clickable text
                target: '_blank' // Opens the record in a new tab
            }
        },
        { label: 'Customer Name', fieldName: 'AccountName' },
        { label: 'Subject', fieldName: 'Subject' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'Priority', fieldName: 'Priority' },
        { label: 'Assigned To', fieldName: 'OwnerName' },
        { label: 'Owner', fieldName: 'CreatedName' },
        { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' }
    ];

    // Account Filter
    get accountFilter() {
        return {
            criteria: [
                {
                    fieldPath: 'Active__c',
                    operator: 'eq',
                    value: 'Yes'
                }
            ]
        };
    }

    // This method is used to call Apex and get the all Complaints and set into respective vaiables.
    getAllComplaints() {
        this.isLoading = true;
        this.idSelectedContact = "";
        getComplaints()
            .then(result => {

                // Map the result to column in respective fields.
                this.lstComplaints = result.map(row => {
                    return {
                        ...row,
                        CaseLink: `/lightning/r/Case/${row.Id}/view`,
                        AccountName: row.Account ? row.Account.Name : '',
                        OwnerName: row.Owner ? row.Owner.Name : '',
                        CreatedName: row.CreatedBy ? row.CreatedBy.Name : ''
                    };
                });

                this.intOpenCount = this.lstComplaints.filter(objData => objData.Status === 'New').length;
                this.intInProgressCount = this.lstComplaints.filter(objData => objData.Status === 'In Progress').length;
                this.intEscalatedCount = this.lstComplaints.filter(objData => objData.Status === 'Escalated').length;
                this.intClosedCount = this.lstComplaints.filter(objData => objData.Status === 'Closed').length;
                this.intTotalCount = this.lstComplaints.length;
            })
            .catch(error => {
                console.error('Error fetching complaints:', error);
            }).finally(() => {
                this.isLoading = false;
            });
    }

    connectedCallback() {
        this.getAllComplaints();
    }

    // Handle Click functions
    handleClick(event) {
        let strFieldName = event.target.name;

        if (strFieldName === 'Create') {
            this.isShowModal = true;
        }
    }

    // Handle Account Change
    handleAccountChange(event) {
        this.idSelectedAcc = event.detail.recordId;
        this.idSelectedContact = "";

        if (this.idSelectedAcc) {
            this.isLoading = true;

            // Contact Filter
            this.contactFilter = {
                criteria: [
                    {
                        fieldPath: 'AccountId',
                        operator: 'eq',
                        value: this.idSelectedAcc
                    }
                ]
            };

            checkRelatedContacts({ accountId: this.idSelectedAcc })
                .then(contactCount => {
                    if (contactCount === 0) {
                        this.showToast('Error', 'No Contacts are available for the selected Account', 'error');
                        this.isContactDisabled = true;
                        this.isSaveDisabled = true;
                    } else {
                        this.isContactDisabled = false;
                        this.isSaveDisabled = false;
                    }
                })
                .catch(error => {
                    this.showToast('Error', 'Error validating related Account contact details.', 'error');
                    console.error(error);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        } else {
            this.isContactDisabled = true;
            this.isSaveDisabled = true;
        }
    }

    // Handle Contact Change
    handleContactChange(event) {
        this.idSelectedContact = event.detail.recordId;
    }

    // Handle Submit
    handleSubmit(event) {
        event.preventDefault();

        if (this.isSaveDisabled || !this.idSelectedAcc || !this.idSelectedContact) {
            this.showToast('Validation Error', 'Please select a valid Account and related Contact.', 'error');
            return;
        }

        this.isLoading = true;
        const fields = event.detail.fields;

        // Manually Enter Account and Contact
        fields.AccountId = this.idSelectedAcc;
        fields.ContactId = this.idSelectedContact;

        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    // Resets structural states back to defaults
    hideModalBox() {
        this.isShowModal = false;
        this.idSelectedAcc = "";
        this.idSelectedContact = "";
        this.isContactDisabled = true;
        this.isSaveDisabled = true;
        this.contactFilter = null;
    }

    // Handle Success
    handleSuccess() {
        this.isLoading = false;
        this.showToast('Success', 'Complaint created successfully', 'success');
        this.hideModalBox();
        this.getAllComplaints(); // Refresh
    }

    // Handle Error
    handleError(event) {
        this.isLoading = false;
        this.showToast('Error', event.detail.detail, 'error');
    }

    // Handle Row Selection in Datatable
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.lstSelectedCaseIds = selectedRows.map(row => row.Id);
    }

    //  Handle the button click to close all selected cases
    handleCloseSelected() {
        if (this.lstSelectedCaseIds.length === 0) {
            this.showToast('Error', 'Please select at least one complaint to close.', 'error');
            return;
        }

        this.isLoading = true;

        // Call Apex Method
        closeSelectedComplaints({ caseIds: this.lstSelectedCaseIds })
            .then(() => {
                this.showToast('Success', 'Selected complaints closed successfully', 'success');
                this.lstSelectedCaseIds = []; // Clear array tracking

                this.getAllComplaints(); // Refresh data table list metrics
            })
            .catch(error => {
                this.showToast('Error', 'Failed to close selected complaints.', 'error');
                console.error(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }


    // Show Toast Message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}