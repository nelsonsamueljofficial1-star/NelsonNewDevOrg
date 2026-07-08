/* Purpose: This JS file is used to validate the train booking process in the LWC component.
 * Created By: Nelson Samuel J
 * Created On: 08-06-2026
 */
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveBookingWithPassengers from '@salesforce/apex/TrainBookProcessLWCController.saveBookingWithPassengers';
export default class TrainBookingProcess extends LightningElement {

    @track bolhasSpinner = true;
    @track lstAddCount = [];
    @track intBookingCount = 0;
    @track StrTrainName = "";
    @track intFareValue = 0;
    @track objBookingData = {};

    // Check Count of Data
    get hasAdditionalBookCount() {

        console.log("Data", this.lstAddCount);
        return this.lstAddCount && this.lstAddCount.length > 0;
    }

    // Create options for Gender
    get genderOptions() {
        return [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' }
        ];
    }

    // Calculate Fare amount
    calculateFare() {
        if (this.StrTrainName == "Coimbatore Express") {
            this.intFareValue = 250;
        } else if (this.StrTrainName == "Chennai Express") {
            this.intFareValue = 150;
        } else {
            this.intFareValue = 0;
        }

        this.intFareValue *= (parseInt(this.intBookingCount) + 1);
    }

    // Handle booking count
    handleBookingCount(event) {
        this.intBookingCount = event.target.value;
        this.lstAddCount = [];

        // Calculate Fare amount
        this.calculateFare();

        if (this.intBookingCount && this.intBookingCount > 0) {
            const intcount = parseInt(this.intBookingCount)

            for (let i = 1; i <= intcount; i++) {

                // To show fields according to passenger count
                this.lstAddCount.push(i);
            }
        } else if (this.intBookingCount < 0) {
            this.showToast('Validation Error', 'Additional Passenger Count cannot be negative', 'error');
        }
    }

    // Handle trian name change
    handleTrainChange(event) {
        this.StrTrainName = event.target.value;

        // Calculate Fare amount
        this.calculateFare();
    }

    // Handle Submit
    handleSubmit() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        const todayStr = new Date().toISOString().split('T')[0];

        // Validate for Train Booking process
        for (const field of inputFields) {
            this.objBookingData[field.fieldName] = field.value;

            // Report Validity Check Required details filled
            if (!field.reportValidity()) {
                this.showToast('Validation Error', 'Kindly enter value for required fields', 'error');
                return;
            } else if (field.fieldName === 'Travelling_Date__c' && field.value && field.value < todayStr) {
                this.showToast('Validation Error', 'Travel Date cannot be earlier than the current date.', 'error');
                return;
            } else if (field.fieldName === 'Phone__c' && field.value && field.value.length != 10) {
                this.showToast('Validation Error', 'Phone Number must contain exactly 10 digits.', 'error');
                return;
            }
        }

        if (this.objBookingData['To__c'] === this.objBookingData['From__c']) {
            this.showToast('Error', 'From and To Address should be difference', 'error');
            return;
        }

        // Validate for Passenger
        const lwcInputs = this.template.querySelectorAll('lightning-input,lightning-combobox');
        for (const input of lwcInputs) {
            if (!input.reportValidity()) {
                this.showToast('Validation Error', 'Passenger Name, Date of Birth and Gender is mandatory', 'error');
                return;
            }
        }

        // Additionally Add Passenger Data
        const lstAdditionalPassenger = [];
        const nameElements = this.template.querySelectorAll('lightning-input[data-type="passenger-name"]');
        const dobElements = this.template.querySelectorAll('lightning-input[data-type="passenger-dob"]');
        const genderElements = this.template.querySelectorAll('lightning-combobox[data-type="passenger-gender"]');


        for (let i = 0; i < this.lstAddCount.length; i++) {
            lstAdditionalPassenger.push({
                Name: nameElements[i] ? nameElements[i].value : '',
                Date_of_Birth__c: dobElements[i] ? dobElements[i].value : null,
                Gender__c: genderElements[i] ? genderElements[i].value : null,
            });

            console.log("Passenger Data : " + JSON.stringify(lstAdditionalPassenger))
        }

        // Show Spinner
        this.bolhasSpinner = true;

        // Call Apex Controller to Save Data
        saveBookingWithPassengers({
            objParentBooking: this.objBookingData,
            lstChildPassengers: lstAdditionalPassenger
        }).then((result) => {
            this.showToast('Success', 'Booking confirmed successfully!', 'success');
            this.handleReset();
        }).catch((error) => {
            this.showToast('Error Saving Records', error.body.message, 'error');
        });

        // Unshow Spinner 
        this.bolhasSpinner = false;

        console.log("Resceived Submit Data :", JSON.stringify(this.objBookingData));
    }

    // Handle Reset
    handleReset() {
        this.objBookingData = {};
        this.lstAddCount = [];
        this.intBookingCount = 0;

        // Reset lightning-input-fields
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        inputFields.forEach(field => field.reset());

        // Clear lightning-inputs manually
        const LwcInputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        LwcInputs.forEach(input => {
            input.value = null;
        });
    }

    // Handle Load
    handleLoad() {
        this.bolhasSpinner = false;
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