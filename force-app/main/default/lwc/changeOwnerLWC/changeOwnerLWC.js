/* Purpose: This JS file is used to handle change owner in Account record action logics
 * Created By: Nelson Samuel J
 * Created On: 11-06-2026
 */
import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';

import getUser from '@salesforce/apex/changeOwnerLWCController.getUser';
import getAllAccRelatedObject from '@salesforce/apex/changeOwnerLWCController.getAllAccRelatedObject';
import changeOwner from '@salesforce/apex/changeOwnerLWCController.changeOwner';
import getOneUserByAcc from '@salesforce/apex/changeOwnerLWCController.getOneUserByAcc';
import sendEmailByHtmlFormat from '@salesforce/apex/changeOwnerLWCController.sendEmailByHtmlFormat';

export default class ChangeOwnerLWC extends NavigationMixin(LightningElement) {
    @api recordId;

    @track strSelectedOwnerId = "";
    @track lstUserOptions = [];
    @track bolContacts = false;
    @track bolOpportunities = false;
    @track bolCases = false;
    @track bolNotifyEmail = false;
    @track intContact = 0;
    @track intOpportunity = 0;
    @track intCase = 0;
    @track objEmailDataStorage = {};

    strPreviousUserName = "";
    strNewUserName = "";


    // Get all User for Options 
    @wire(getUser)
    wiredUsers({ error, data }) {
        if (data) {
            this.lstUserOptions = data;
            console.log('User options wired successfully:', this.lstUserOptions);
        } else if (error) {
            console.error('Error wiring user options:', error);
        }
    }

    // Get all Accont related records to get count of each related object
    @wire(getAllAccRelatedObject, { idAcc: '$recordId' })
    wiredRelatedObjects({ error, data }) {
        if (data) {

            this.intContact = data.Contacts ? data.Contacts.length : 0;
            this.intOpportunity = data.Opportunities ? data.Opportunities.length : 0;
            this.intCase = data.Cases ? data.Cases.length : 0;

            // console.log("Get All Related Object ", JSON.stringify(data));
        } else if (error) {
            console.error('Error wiring getAllAccRelatedObject:', error);
        }
    }

    // Get Previous User Name
    @wire(getOneUserByAcc, { idAcc: '$recordId' })
    wiredGetUserName({ error, data }) {
        if (data) {
            this.objEmailDataStorage["PreviousUserName"] = data.Owner.Name;
            this.objEmailDataStorage["Account"] = data.Name;
            this.strPreviousUserName = data.Owner.Name;
            console.log("Get One User wireing Fetch one User Name : " + data);
        } else if (error) {
            console.error('Error wiring get one user name', error);
        }
    }

    // Handle all event Change and store in respective variable
    handleChange(event) {
        const strName = event.target.name;
        const strType = event.target.type;

        // Assign value through type of input box
        const strValue = (strType === 'checkbox') ? event.target.checked : event.target.value;

        console.log(`Field Modified: ${strName} | New Value: ${strValue}`);

        // Dynamically store values
        if (strName === "ownerPicklist") {
            this.strSelectedOwnerId = strValue;
        } else if (strName === "Contacts") {
            this.bolContacts = strValue;
        } else if (strName === "Opportunities") {
            this.bolOpportunities = strValue;
        } else if (strName === "Cases") {
            this.bolCases = strValue;
        } else if (strName === "Email") {
            this.bolNotifyEmail = strValue;
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

    // Call Change Owner Apex for reduce redundancy
    changeOwnerMethod(strObjName) {
        changeOwner({
            strObjName: strObjName,
            idAcc: this.recordId,
            idOwner: this.strSelectedOwnerId
        }).then()
            .catch((error) => {
                console.log("Error in change Owner - Object Name " + strObjName + " Error " + error.body.message);
            })
    }

    // Handle Click 
    handleClick(event) {
        const strFieldName = event.currentTarget.name;

        if (strFieldName === "Cancel") {
            this.navigateToRecordPage();
        } else {

            if (this.strSelectedOwnerId !== "") {
                // According to select checkBox call apex class 
                try {

                    // Update Account
                    updateRecord({
                        fields: {
                            Id: this.recordId,
                            OwnerId: this.strSelectedOwnerId
                        }
                    }).then()
                        .catch((error) => {
                            console.log("Error while Update Account Error : " + error.getMessage());
                        })

                    if (this.bolContacts) {
                        this.changeOwnerMethod('Contact');
                    }

                    if (this.bolOpportunities) {
                        this.changeOwnerMethod('Opportunity');
                    }

                    if (this.bolCases) {
                        this.changeOwnerMethod('Case');
                    }

                    if (this.bolNotifyEmail) {

                        // Store Email Needed value in single object and pass to the apex;
                        this.strNewUserName = this.lstUserOptions.find((option) => option.value === this.strSelectedOwnerId).label;
                        this.objEmailDataStorage["NewUserName"] = this.strNewUserName;
                        this.objEmailDataStorage["ContactCount"] = this.intContact;
                        this.objEmailDataStorage["OpportunityCount"] = this.intOpportunity;
                        this.objEmailDataStorage["CaseCount"] = this.intCase;
                        this.objEmailDataStorage["AccountId"] = this.recordId;
                        this.objEmailDataStorage["bolContacts"] = String(this.bolContacts);
                        this.objEmailDataStorage["bolOpportunities"] = String(this.bolOpportunities);
                        this.objEmailDataStorage["bolCases"] = String(this.bolCases);

                        console.log(" Previous User : " + this.strPreviousUserName + " New User : " + this.strNewUserName);

                        // Call Apex send Email
                        sendEmailByHtmlFormat({ objEmailDatas: this.objEmailDataStorage })
                            .then(() => {
                                console.log("Email Send Successfully");
                            })
                            .catch((error) => {
                                this.showToast('Error', 'Error while Send Email' , 'error');
                                console.log("Error while Send Email " + error.body.message);
                            })

                        console.log("Overall Email Details : " + JSON.stringify(this.objEmailDataStorage));
                    }

                    this.showToast('Success', 'Changed Owner Successfully', 'success');
                    this.navigateToRecordPage();
                } catch (error) {
                    this.showToast('Error', 'Error while update Record' + error, 'error');
                    console.error('Owner Transfer Error : ', error);
                }
            } else {
                this.showToast('Error', 'Kindly Select User', 'error');
            }
        }
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