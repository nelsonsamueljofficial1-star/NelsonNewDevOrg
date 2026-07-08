import { LightningElement } from 'lwc';

export default class TabPageLWC extends LightningElement {
    
     // Show in log
    showData() {
        const inputs = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ];

        for(let data of inputs){
            console.log("Name : " + data.name + " | Value : " + data.value);
        }
        this.hideModalBox();
    }
}