/* Purpose: This JS file is used to show the hierarchical relationship between records in a grandparent-child relationship
 * Created By: Nelson Samuel J
 * Created On: 05-06-2026
 */
import { LightningElement, track } from 'lwc';

export default class GrandParentHierarchicalManagement extends LightningElement {
    @track objChildDatas = {
        "Child-One": "Deselect",
        "Child-Two": "Deselect",
        "Child-Three": "Deselect"
    };

    objChildDatasReset = {
        "Child-One": "Deselect",
        "Child-Two": "Deselect",
        "Child-Three": "Deselect"
    };
    intValue = 0;

    // Handle parent data received from the parent component and update the value variable with the number of child records selected.
    handleParentData(event) {

        let objData = event.detail;
        this.objChildDatas = { ...objData };
        let count = 0;
        for (let key in objData) {
            if (objData[key] === 'Select') {
                count++;
            }
        }
        this.intValue = count;
    }

    // This method is used to reset the selection of the child records and update the value variable to 0.
    handleReset() {
        this.intValue = 0;
        this.objChildDatas = {
            "Child-One": "Deselect",
            "Child-Two": "Deselect",
            "Child-Three": "Deselect"
        };
    }

}