/* Purpose: This JS file is used to do logic for ModalUILWC
 * Created By: Nelson Samuel J
 * Created On: 27-05-20226
 */

import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ModalUILWC extends LightningElement {

    Table1 = [];
    Table2 = [];
    tempTable2 = [];

    Table1Columns = [
        {
            label: 'Product Name',
            fieldName: 'Product Name',
            type: 'text'
        },
        {
            label: 'Unit Price',
            fieldName: 'Unit Price',
            type: 'currency'
        },
        {
            label: 'Quantity',
            fieldName: 'Quantity',
            type: 'number',
        }
    ];

    Table2Columns = [
        ...this.Table1Columns,
        {
            label: 'Action',
            type: 'button',
            typeAttributes: {
                label: 'Delete',
                name: 'delete',
                variant: 'destructive'
            }
        }
    ];

    @track isShowModal = false;

    // Options
    rateCategoryOptions = [
        { label: 'Standard', value: 'Standard' },
        { label: 'Premium', value: 'Premium' },
        { label: 'Enterprise', value: 'Enterprise' }
    ];

    platformOptions = [
        { label: 'Facebook', value: 'Facebook' },
        { label: 'Instagram', value: 'Instagram' },
        { label: 'Google Ads', value: 'Google Ads' },
        { label: 'YouTube', value: 'YouTube' },
        { label: 'LinkedIn', value: 'LinkedIn' }
    ];

    adTypeOptions = [
        { label: 'Banner', value: 'Banner' },
        { label: 'Video', value: 'Video' },
        { label: 'Carousel', value: 'Carousel' },
        { label: 'Sponsored Post', value: 'Sponsored Post' }
    ];

    unitTypeOptions = [
        { label: 'Day', value: 'Day' },
        { label: 'Week', value: 'Week' },
        { label: 'Month', value: 'Month' },
        { label: 'Impression', value: 'Impression' },
        { label: 'Click', value: 'Click' }
    ];

    // Make visible modal
    showModalBox() {
        this.isShowModal = true;
    }

    // Make hide modal
    hideModalBox() {
        this.isShowModal = false;
    }

    // Show in log
    handleData() {
        let bolIsValidData = true;

        const inputs = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ];

        for (const data of inputs) {
            if (!data.reportValidity()) {
                bolIsValidData = false;
                break;
            }
        }

        if (bolIsValidData) {
            let objData = {
                Id: this.Table1.length + 1
            };

            for (let data of inputs) {
                console.log("Name : " + data.name + " | Value : " + data.value);
                objData[data.name] = data.value;
            }

            this.Table1 = [...this.Table1, objData];

            console.log("Data :", JSON.stringify(this.Table1));
            this.showToast("Sucesss Toast", "Data Store Successfully", "success");
            this.hideModalBox();

        } else {
            this.showToast("Error Toast", "Invalid Data", "error")
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

    // Find selected row
    handleRowSelectionTable1(event) {
        this.tempTable2 = [...event.detail.selectedRows];
    }

    // Assign in Table 2
    showData() {
        const tempTable2Ids = this.tempTable2.map(data => data.Id);

        this.Table2 = [...this.Table2, ...this.tempTable2];
        this.Table1 = this.Table1.filter(data => !tempTable2Ids.includes(data.Id))
        this.tempTable2 = [];
    }

    // Cancel Event
    handleCancel() {

        this.dispatchEvent(
            new CustomEvent('cancel')
        );
    }

    // Delete the row
    handleRowActionTable2(event) {

        console.log('event ' + JSON.stringify(event));
        if (event.detail.action.name == 'delete') {
            this.Table2 = this.Table2.filter(data => data.Id != event.detail.row.Id);
            this.Table1 = [...this.Table1, event.detail.row];
        }
    }
}