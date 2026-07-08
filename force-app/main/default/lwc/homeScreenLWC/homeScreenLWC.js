import { LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class HomeScreenLWC extends LightningElement {
    bolHomeScreen = true;
    bolCredentialGenerate = false;
    bolLoginPage = false;
    bolDataEntry = false;
    objData = {};
    objLoginData = {};
    arrData = [];

    generateCredentialMethod() {
        this.bolHomeScreen = false;
        this.bolCredentialGenerate = true;
    }

    loginPageMethod() {
        this.bolHomeScreen = false;
        this.bolLoginPage = true;
    }

    // Credential Logics
    changeHandler(event) {
        this.objData = {
            ...this.objData,
            [event.target.name]: event.target.value
        };
    }

    generateLoginMethod() {
        if (this.objData != null && this.objData.UserName && this.objData.Password && this.objData.Password.length >= 8 && this.objData.Password === this.objData.ConfirmPassword) {
            this.showToast("Sucesss Toast", "Credential Generated Successfully", "success");
            this.arrData.push({ ...this.objData });

            const inputs = this.template.querySelectorAll('lightning-input');

            // Emty the data
            inputs.forEach((data) => {
                data.value = null;
            });

            this.bolLoginPage = true;
            this.bolCredentialGenerate = false;
        } else {
            this.showToast("Error Toast", "Username is mandatory, Password should be match and Password should be more than 8 character", "error")
        }
    }

    cancelLoginMethod() {
        this.bolCredentialGenerate = false;
        this.bolHomeScreen = true;
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

    // Login page Logics
    loginChangeHandler(event) {
        this.objLoginData = {
            ...this.objLoginData,
            [event.target.name]: event.target.value
        };
    }

    cancelMethod() {
        this.bolLoginPage = false;
        this.bolHomeScreen = true;
    }

    SaveMethod() {
        const user = this.arrData.find(
            data =>
                data.UserName === this.objLoginData.UserName &&
                data.Password === this.objLoginData.Password
        );

        if (user) {
            this.showToast("Sucesss Toast", "Login Successfully", "success");

            this.bolLoginPage = false;
            this.bolDataEntry = true;

        } else {
            this.showToast("Error Toast", "Username or Password invalid", "error")
        }
    }

    // Child Cancel Handler
    handleChildCancel() {
        this.bolDataEntry = false;
        this.bolHomeScreen = true;
    }

}