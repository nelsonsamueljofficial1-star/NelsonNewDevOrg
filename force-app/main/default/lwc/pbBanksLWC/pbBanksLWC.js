/* Purpose: This JS file is used to handle PB Banks Logics
 * Created By: Nelson Samuel J
 * Created On: 10-06-2026
 */
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';

import checkValidCustomer from '@salesforce/apex/PbBanksLWCController.checkValidCustomer';
import getBankAcc from '@salesforce/apex/PbBanksLWCController.getBankAcc';
import getBankHistory from '@salesforce/apex/PbBanksLWCController.getBankHistory';

export default class PbBanksLWC extends LightningElement {
    @track bolLoginPage = true;
    @track bolWelcomePage = false;
    @track bolBalancePage = false;
    @track bolWithdrawPage = false;
    @track bolHistoryPage = false;
    @track strCustomerId = "";
    @track strPinNumber = "";
    @track objLogin = {};
    @track decBalanceAmount = 0.00;
    @track hasBalanceAmount = true;
    @track strWithAccType = "";
    @track decWithBalanceAmount = 0.00;
    @track strDateStart = "";
    @track strDateEnd = "";
    @track isLoading = false;
    @track lstHistoryData = [];
    @track lstHistoryColumns = [
        { label: 'Account Type', fieldName: 'accountTypeField', type: 'text' },
        { label: 'Amount', fieldName: 'Amount__c', type: 'currency', typeAttributes: { currencyCode: 'INR' } },
        { label: 'Transaction Type', fieldName: 'Transaction_Type__c', type: 'text' },
        { label: 'Date', fieldName: 'Created_Date__c', type: 'date-local' }
    ];

    // Account Type options
    get lstAccTypeOptions() {
        return [
            { label: "Saving Account", value: "Saving Account" },
            { label: "Current Account", value: "Current Account" }
        ]
    }

    // Check Table and then show the Bank History
    get hasTableHistory() {
        return this.lstHistoryData && this.lstHistoryData.length > 0;
    }

    //Login Fields Change Handler
    loginChangeHandler(event) {

        // Get Field Name and Value
        const strFieldName = event.target.name;
        const strFieldValue = event.target.value;

        if (strFieldName === "CustomerId") {
            this.strCustomerId = strFieldValue;
        } else {
            this.strPinNumber = strFieldValue;
        }
    }

    // Handle Login 
    loginHandler() {
        // Check valid Loginner
        if (this.strCustomerId && this.strPinNumber) {
            this.isLoading = true;
            checkValidCustomer({ strCustomerId: this.strCustomerId, strPinNumber: parseInt(this.strPinNumber) })
                .then((result) => {
                    this.objLogin = result;
                    this.bolWelcomePage = true;
                    this.bolLoginPage = false;

                    this.showToast('Success', 'Logged In Successfully', 'success');
                }).catch((error) => {
                    this.showToast('Error', "Invalid Customer ", 'error');
                    console.log(" Login Fetch Error : ", error.body.message)
                }).finally(() => {
                    this.isLoading = false;
                })
        } else {
            this.showToast('Error', "Kindly enter Customer Id and Pin Number", 'error');
        }
    }

    // Handle Welcome Page Buttons
    handleWelcomeButtons(event) {
        const strFieldName = event.currentTarget.name;

        this.bolWelcomePage = false;

        console.log('Clicked Button:', strFieldName);

        // Show the relavant Page
        if (strFieldName === "Withrawal") {
            this.strWithAccType = ""
            this.decWithBalanceAmount = 0;
            this.bolWithdrawPage = true;
        } else if (strFieldName === "LogOut") {
            this.showToast('Success', 'Logged Out Successfully', 'success');
            this.bolLoginPage = true;
        } else if (strFieldName === "History") {
            this.bolHistoryPage = true;

            // Fetch Bank History
            this.fetchBankHistory();
        } else if (strFieldName === "Balance") {
            this.hasBalanceAmount = true;
            this.decBalanceAmount = 0.00;

            this.bolBalancePage = true;
        }
    }

    // Handle Balance Page Change
    handleBalanceChange(event) {
        const strFieldValue = event.target.value;

        console.log("objecta dn Field Type " + this.objLogin.Id + strFieldValue)

        // Get Balance Amount
        if (strFieldValue != null) {
            this.isLoading = true;
            getBankAcc({ idCustomer: this.objLogin.Id, strCustomerType: strFieldValue })
                .then((result) => {
                    this.decBalanceAmount = parseFloat(result.Amount__c);
                    this.hasBalanceAmount = true;
                })
                .catch((error) => {
                    this.hasBalanceAmount = false;
                    console.log(" Login Fetch Error : ", error.body.message);
                }).finally(() => {
                    this.isLoading = false;
                })
        } else {
            this.decBalanceAmount = 0;
        }
    }

    // Handle Balance Buttons
    handleBalanceButtons(event) {
        const strFieldName = event.currentTarget.name;

        this.bolBalancePage = false;

        // Navigate to the page which the user clicked
        if (strFieldName === "Previous") {
            this.bolWelcomePage = true;
        } else {
            this.showToast('Success', 'Logged Out Successfully', 'success');
            this.bolLoginPage = true;
        }
    }

    // Handle Withdraw Change
    handleWithdrawChange(event) {
        const strFieldValue = event.target.value;
        const strFieldName = event.target.name;

        // Assign value
        if (strFieldName === "AccountType") {
            this.strWithAccType = strFieldValue;
        } else {
            this.decWithBalanceAmount = strFieldValue;
        }
    }

    // Handle Withdraw Buttons
    async handleWithdrawButtons(event) {
        const strFieldName = event.currentTarget.name;

        // Navigate to the page which the user clicked
        if (strFieldName === "Proceed") {
            if (!this.strWithAccType || this.strWithAccType === "" || !this.decWithBalanceAmount || this.decWithBalanceAmount <= 0) {
                this.showToast('Error', "Kindly enter a valid Account type and Amount", 'error');
                return;
            }

            this.isLoading = true;
            // Get balance Amount for relevant Account Type and Create History
            getBankAcc({ idCustomer: this.objLogin.Id, strCustomerType: this.strWithAccType })
                .then(async (result) => {
                    this.decBalanceAmount = parseFloat(result.Amount__c);
                    if (parseFloat(this.decBalanceAmount) < parseFloat(this.decWithBalanceAmount)) {
                        this.showToast('Transaction Failed', "Insufficient balance. Please check your account balance.", 'error');
                    } else {

                        // Create Bank Account History
                        const objFields = {
                            Bank_Account__c: result.Id,
                            Amount__c: parseFloat(this.decWithBalanceAmount),
                            Transaction_Type__c: "Withdrawal",
                            Created_Date__c: new Date().toISOString().split('T')[0]
                        }
                        const objRecordInput = { apiName: "Bank_Account_History__c", fields: objFields }
                        await createRecord(objRecordInput);

                        // console.log('Record Id : ' + result.Id);
                        // console.log('Current Amount : ' + this.decBalanceAmount);
                        // console.log('Withdraw Amount : ' + this.decWithBalanceAmount);
                        // console.log(
                        //     'New Amount : ' +
                        //     (parseFloat(this.decBalanceAmount) - parseFloat(this.decWithBalanceAmount))
                        // );

                        // Update Bank Account
                        const objUpdatedBankAcc = {
                            fields: {
                                Id: result.Id,
                                Amount__c: parseFloat(this.decBalanceAmount) - parseFloat(this.decWithBalanceAmount)
                            }
                        };
                        await updateRecord(objUpdatedBankAcc);

                        this.showToast('Success', 'Amount Withdrawn Successfully', 'success');
                        this.strWithAccType = null;
                        this.decWithBalanceAmount = 0.00;
                    }
                })
                .catch((error) => {
                    this.showToast('Error', "This Account type is not Created for this Customer", 'error');
                    console.log("Withdraw Fetch Error : ", error.body.message);
                }).finally(() => {
                    this.isLoading = false;
                })
        } else if (strFieldName === "Previous") {
            this.bolWithdrawPage = false;
            this.bolWelcomePage = true;
        } else {
            this.showToast('Success', 'Logged Out Successfully', 'success');
            this.bolWithdrawPage = false;
            this.bolLoginPage = true;
        }
    }

    // Handle History Change
    handleHistoryChange(event) {
        const strFieldValue = event.target.value;
        const strFieldName = event.target.name;

        if (strFieldName === "StartDate") {
            this.strDateStart = strFieldValue;
        } else {
            this.strDateEnd = strFieldValue;
        }
    }

    // Handle History Buttons
    handleHistoryButtons(event) {
        const strFieldName = event.currentTarget.name;

        if (strFieldName == "ShowHistory") {
            if (this.strDateStart && this.strDateEnd) {

                // Convert the date strings ("YYYY-MM-DD") into comparable Date objects
                const datStart = new Date(this.strDateStart);
                const datEnd = new Date(this.strDateEnd);

                //Check if Start Date greater than End Date
                if (datStart > datEnd) {
                    this.showToast('Invalid Date Range', 'Start Date cannot be later than End Date. Please select a valid range.', 'error');
                    this.lstHistoryData = [];
                    this.strDateStart = "";
                    this.strDateEnd = "";

                    return;
                }
            }

            // Fetch Bank History
            this.fetchBankHistory();

        } else if (strFieldName === "Previous") {
            this.bolHistoryPage = false;
            this.bolWelcomePage = true;
        } else if (strFieldName === "Clear") {
            this.strDateStart = "";
            this.strDateEnd = "";

            this.lstHistoryData = [];
        } else {
            this.showToast('Success', 'Logged Out Successfully', 'success');
            this.bolHistoryPage = false;
            this.bolLoginPage = true;
        }
    }

    // Fetch Bank History Data
    fetchBankHistory() {

        this.isLoading = true;
        getBankHistory({ idCustomer: this.objLogin.Id, strStartDate: this.strDateStart, strEndDate: this.strDateEnd })
            .then((result) => {
                this.lstHistoryData = result.map(row => {
                    return {
                        Id: row.Id,
                        Amount__c: row.Amount__c,
                        Transaction_Type__c: row.Transaction_Type__c,
                        Created_Date__c: row.Created_Date__c,
                        accountTypeField: row.Bank_Account__r ? row.Bank_Account__r.Account_Type__c : ''
                    };
                });
            })
            .catch((error) => {
                console.log("PbBanks LWC - Fetch Bank Account History Error : " + error.body.message)
            }).finally(() => {
                this.isLoading = false;
            })
        this.bolHistoryPage = true;
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