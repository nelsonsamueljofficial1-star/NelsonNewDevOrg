/* Purpose: This JS file is used to edit Opportunity details from Account record page
 * Created By: Nelson Samuel J
 * Created On: 04-06-2026
 */
import { api, LightningElement, track } from 'lwc';
import getAllRelatedOpportunity from '@salesforce/apex/OpportunityHandler.getAllRelatedOpportunity';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ManageOpportunityFromAccount extends LightningElement {
    @api recordId; // Account Id from which we want to manage Opportunities

    @track isShowModal = false; // To control the visibility of the modal for editing Opportunity

    strCurrentOppName = ''; // To hold the name of the currently selected Opportunity for editing
    idOppId;
    @track isLoading = false; // To show spinner during loading or processing



    // Columns for Opportunity Data Table
    lstOpportunityColumns = [
        {
            label: 'Opportunity Name',
            fieldName: 'Name',
            type: 'text'
        },
        {
            label: 'Amount',
            fieldName: 'Amount',
            type: 'currency'
        },
        {
            label: 'Close Date',
            fieldName: 'CloseDate',
            type: 'date',
        },
        {
            label: 'Owner',
            fieldName: 'OwnerId',
            type: 'Id'
        },
        {
            label: 'Stage Name',
            fieldName: 'StageName',
            type: 'text'
        },
        {
            label: 'Edit Action',
            type: 'button',
            typeAttributes: {
                label: 'Edit',
                name: 'edit',
                variant: 'brand'
            }
        }
    ];

    lstOpportunities = []; // List to hold Opportunities related to the Account

    // Getter to check if there are any Opportunities to display
    get bolHasOpportunities() {
        return this.lstOpportunities && this.lstOpportunities.length > 0;
    }

    connectedCallback() {
        console.log('Connected Callback called with Record Id : ', this.recordId);
        this.handleCallApextoGetOpptty(); // Fetch Opportunities related to the Account using Apex method
        // Fetch Opportunities related to the Account using Apex method

    }


    handleCallApextoGetOpptty() {
        if (this.recordId) {
            getAllRelatedOpportunity({ idAccId: this.recordId })
                .then(result => {
                    console.log('Raw Opportunities fetched: ', result);
                    if (result && result.length > 0) {
                        this.lstOpportunities = result;
                        console.log('Opportunities fetched successfully: ', this.lstOpportunities);

                        // Success Toast
                        // showToast("Success", "Opportunities fetched successfully.", "success");
                    } else {
                        this.lstOpportunities = [];
                        console.log('No Opportunities found for the given Account Id.');

                        // Info Toast
                        // showToast("Info", "No Opportunities found for the given Account Id.", "info");
                    }
                })
                .catch(error => {
                    console.error('Error fetching opportunities:', error);

                    // Error Toast
                    // showToast("Error", "An error occurred while fetching opportunities." + error.body.message, "error");
                });
        }
    }

    // Handler for row actions in the data table (e.g., Edit button click)
    handleLoad() {
        this.isLoading = false;
    }

    handleRowAction(event) {
        this.isLoading = true; // Show spinner when action is initiated
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'edit') {
            this.idOppId = row.Id; // Store the Id of the selected Opportunity for editing
            this.strCurrentOppName = row.Name; // Set the current Opportunity name to display in the modal header
            console.log('Edit action clicked for Opportunity: ', row);

            // Show the modal for editing the Opportunity
            this.isShowModal = true;
        }
    }

    hideModalBox() {
        this.isShowModal = false;
    }

    // Handle success after updating the Opportunity
    handleSuccess(event) {
        console.log('Opportunity updated successfully: ', event.detail.id);

        // Refresh the list of Opportunities after successful update
        this.handleCallApextoGetOpptty();

        // Hide the modal after successful update
        this.hideModalBox();
    }

    handleSubmit() {
        this.isLoading = true; // Show spinner during submission
    }

    // Handle error during Opportunity update
    handleError(event) {
        console.error('Error updating Opportunity: ', event.detail);

        this.isLoading = false; // Hide spinner after processing is complete
        
        // Show Error Toast
        this.showToast("Error", "An error occurred while updating the Opportunity." + event.detail.message, "error");
    }

    // ShowToast method to display success or error messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}