import { api, LightningElement } from 'lwc';

export default class ChildAccountLWC extends LightningElement {
    @api objChildAccount;

    get isDataAvailable(){
        return this.objChildAccount && Object.keys(this.objChildAccount).length > 0;
    }
}