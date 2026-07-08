/* Purpose: This JS file is used to show the hierarchical relationship between records in a parent-child relationship
 * Created By: Nelson Samuel J
 * Created On: 05-06-2026
 */
import { api, LightningElement, track } from 'lwc';

export default class ParentHierarchicalManagement extends LightningElement {

    @track objChildDatas = {
        "Child-One": "Deselect",
        "Child-Two": "Deselect",
        "Child-Three": "Deselect"
    }

    @api
    get objChilDatasApi() {
        return this.objChildDatas;
    }
    set objChilDatasApi(value) {
        this.objChildDatas = value;
        console.log('Received objChildDatas in Parent via @api:', JSON.stringify(this.objChildDatas));
    }


    // Getters to get the current status of the child records and show it in the UI.
    get childOneData() {
        return this.objChildDatas['Child-One'];
    }

    get childTwoData() {
        return this.objChildDatas['Child-Two'];
    }

    get childThreeData() {
        return this.objChildDatas['Child-Three'];
    }

    // This method is used to handle the data received from the child component and update the objChildDatas object with the current status of the child records.
    handleChildData(event) {
        // console.log('Received child data:', event.detail);
        this.objChildDatas = { ...event.detail };

        console.log('Updated objChildDatas in parent:', JSON.stringify(this.objChildDatas));

        const myEvent = new CustomEvent('senddatatograndparent', {
            detail: this.objChildDatas
        });

        // 2. Dispatch the event
        this.dispatchEvent(myEvent);
    }
}