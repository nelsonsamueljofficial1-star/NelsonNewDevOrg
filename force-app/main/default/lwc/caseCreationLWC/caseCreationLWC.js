import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from 'lightning/navigation';
import checkSameCaseSubject from '@salesforce/apex/CaseHandler.checkSameCaseSubject';
import createCase from '@salesforce/apex/CaseHandler.createCase';

export default class CaseCreationLWC extends NavigationMixin(LightningElement) {
    @api recordId;
    objCase = {};

    handleSubmit(event) {
        event.preventDefault();

        let bolisValidData = true;

        const arrInputs = this.template.querySelectorAll('lightning-input-field');

        for (const data of arrInputs) {

            if (!data.reportValidity()) {
                // Error Toast
                this.showToast("Error", data.fieldName + " is required", "error");

                bolisValidData = false
                break;
            } else if (data.fieldName == "Subject" && (!data.value || data.value.length < 5)) {


                // Error Toast
                this.showToast("Error", "Subject must contain at least 5 characters.", "error");

                bolisValidData = false
                break;
            }
        }

        if (bolisValidData) {

            // Show Data in console if valid
            arrInputs.forEach((data) => {
                console.log("Field Name : " + data.fieldName + "Value : " + data.value);
                this.objCase[data.fieldName] = data.value;
            });

            checkSameCaseSubject({ objCase: this.objCase })
                .then(result => {

                    // Check if same case subject exists or not
                    if (result.bolIsSameCase) {

                        // Warning Toast
                        this.showToast("Warning", "A case with the same subject already exists.", "warning");
                    } else {
                        createCase({ objCase: this.objCase })
                            .then(result => {

                                // Success Toast
                                this.showToast("Success", "Case Created Successfully", "success");

                                // Navigate to the Same Contact Record Page
                                this[NavigationMixin.Navigate]({
                                    type: 'standard__recordPage',
                                    attributes: {
                                        recordId: this.recordId,
                                        objectApiName: 'Contact',
                                        actionName: 'view'
                                    }
                                });
                            }).catch(error => {

                                // Error Toast
                                console.error(error);

                                this.showToast('Error', error.body.message, 'error');

                            });


                    }
                }).catch(error => {
                    // Error Toast
                    this.showToast("Error", "An error occurred while checking the case subject.", "error");
                    console.error("Error in checkSameCaseSubject: ", error);
                });
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
}