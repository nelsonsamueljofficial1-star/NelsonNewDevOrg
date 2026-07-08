import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class CredentialGeneration extends LightningElement {

    @api
    arrData = [];

    strUsername;
    strPassword;
    strCPassword;

    objData = {};

    clear() {

    }
    changeHandler(event) {
        this.objData = {
            ...this.objData,
            [event.target.name]: event.target.value
        };
    }

    generateLoginMethod() {
        if (this.objData != null && this.objData.UserName && this.objData.Password && this.objData.Password.length >= 8 && this.objData.Password === this.objData.ConfirmPassword) {
            this.showToast("Sucesss Toast", "Credential Generated Successfully", "success");
            this.arrData.push({...this.objData});

              const inputs = this.template.querySelectorAll('lightning-input') ;

              inputs.forEach((data)=>{
                data.value = null;
              })
        }
        else {
            this.showToast("Error Toast", "Username is mandatory and Password should be match", "error")
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