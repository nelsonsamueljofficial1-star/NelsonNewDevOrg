/* Purpose: This JS file is used to handle create which object and which field
 * Created By: Nelson Samuel J
 * Created On: 09-06-2026
 */
import { LightningElement, track, wire } from 'lwc';
import getFields from '@salesforce/apex/CreateRecordByPathLWCController.getFields';
import getAllObjects from '@salesforce/apex/CreateRecordByPathLWCController.getAllObjects';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateRecordByPathLWC extends LightningElement {

    @track lstObjectFields = [];
    @track lstObjectOptions = [];
    @track strPathValue = "1";
    @track lstSelectedFieldsUI = [];
    @track lstSelectedFields = [];
    @track bolFieldSelect = false;
    @track hasFormOpen = false;
    @track strObjectName = '';
    @track isLoading = false;
    @track bolFormDisable = true;
    @track bolFieldDisable = true;


    // Get All Objects
    @wire(getAllObjects)
    wiredObjects({ error, data }) {
        if (data) {

            // Store it in lstObjectOption and sort by label
            this.lstObjectOptions = [...data].sort((a, b) =>
                a.label.localeCompare(b.label)
            );

        } else if (error) {
            console.error('Error fetching global objects via wire:', error);
        }
    }

    // Handle change of Object and Fields
    handleChange(event) {

        // Show Spinner
        this.isLoading = true;

        // Get Field Name and Value
        const strFieldName = event.target.name;
        const strFieldValue = event.target.value;

        // console.log("LWC createRecordByPathLwc : object Name " + strFieldValue + "Field Name : " + strFieldName);

        // For Object and Get field Datas
        if (strFieldName == "Sobject") {
            console.log('LWC createRecordByPathLwc : object Name' + strFieldName);

            // Store Object Name for Record Form
            this.strObjectName = strFieldValue;
            console.log("LWC createRecordByPathLwc : object Name - " + this.strObjectName);

            getFields({ strObjectName: strFieldValue })
                .then((result) => {

                    // Empty the fields
                    this.lstSelectedFieldsUI = [];
                    this.lstSelectedFields = [];

                    // Add object
                    this.lstObjectFields = result;

                    // console.log("LWC createRecordByPathLwc : Fetch Raw Data " + JSON.stringify(result))
                    this.strPathValue = "2";

                    // Show Fields
                    this.bolFieldSelect = true;

                    this.bolFieldDisable = false;
                    this.bolFormDisable = true;

                    // Success Toast
                    this.showToast('Success', 'Fetch Field Successfully', 'success');
                }).catch((error) => {

                    // Error Toast
                    this.showToast('Error Fetch Fields', error.body.message, 'error');
                }).finally(() => {
                    this.isLoading = false;
                })
        } else { // Handle field change logics
            const strFieldLabel = this.lstObjectFields.find(option => option.value === strFieldValue).label;
            if (!this.lstSelectedFields.includes(strFieldValue)) {
                this.lstSelectedFields = [...this.lstSelectedFields, strFieldValue];
                this.lstSelectedFieldsUI = [...this.lstSelectedFieldsUI, strFieldLabel];
            }

            if (this.lstSelectedFields && this.lstSelectedFields.length > 0) {
                this.bolFormDisable = false;
            } else {
                this.bolFormDisable = true;
            }
            
            this.isLoading = false;
        }
    }

    // Handle Sucess
    handleSucess() {
        this.lstObjectFields = [];
        this.bolFieldSelect = false;
        this.lstSelectedFields = [];
        this.lstSelectedFieldsUI = [];

        // UnShow the Form
        this.hasFormOpen = false;

        // Success Toast
        this.showToast('Success', 'Record Created Successfully', 'success');

        // Navigate to 1st path
        this.strPathValue = "1";

        // UnShow Spinner
        this.isLoading = false;

        this.bolFormDisable = true;
        this.bolFieldDisable = true;
    }

    // Handle Error while submit
    handleError(event) {

        // Extract the error message string from the event detail
        const strErrorMessage = event.detail.message || 'An unknown error occurred.';
        const strDetailedError = event.detail.detail || '';

        // Error Toast
        this.showToast('Error Record Create', strErrorMessage + " : " + strDetailedError, 'error');

        // UnShow Spinner
        this.isLoading = false;
    }

    // HanldeCancel
    hanldeCancel() {

        this.strPathValue = "2";

        // UnShow the Form
        this.hasFormOpen = false;

    }

    // Handle Form
    handleForm() {
        this.strPathValue = "3";
        this.hasFormOpen = true;

        this.isLoading = true
    }

    // Handle Submit
    handleSubmit() {
        this.isLoading = true;
    }

    handleLoad() {
        this.isLoading = false;
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