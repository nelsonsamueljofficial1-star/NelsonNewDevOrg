import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
    intParentPercentage;

    handlePercentage(event) {
        this.intParentPercentage = event.target.value;
    }
}