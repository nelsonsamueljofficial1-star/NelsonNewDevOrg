import { LightningElement } from 'lwc';

export default class ListTaskLWC extends LightningElement {
    columns1 = [
        {
            label: 'Task Name',
            fieldName: 'Name',
            type: 'text'
        },
        {
            label: 'Status',
            fieldName: 'Status',
            type: 'text'
        },
        {
            label: 'Priority',
            fieldName: 'Priority',
            type: 'text',

            // Dynamic class assign
            cellAttributes: {
                class: { fieldName: 'ClassName' }
            }
        },
        {
            label: 'Subject',
            fieldName: 'Subject',
            type: 'text'
        }

    ];

    arrTaskData = [
        {
            Id: 1,
            Name: 'Task 1',
            Status: 'Completed',
            Priority: 'High',
            Subject: 'Nice Task 1'
        },
        {
            Id: 2,
            Name: 'Task 2',
            Status: 'Pending',
            Priority: 'High',
            Subject: 'Nice Task 2'
        },
        {
            Id: 3,
            Name: 'Task 3',
            Status: 'Completed',
            Priority: 'Medium',
            Subject: 'Nice Task 3'
        },
        {
            Id: 4,
            Name: 'Task 4',
            Status: 'Pending',
            Priority: 'Medium',
            Subject: 'Nice Task 4'
        },
        {
            Id: 5,
            Name: 'Task 5',
            Status: 'Completed',
            Priority: 'Low',
            Subject: 'Nice Task 5'
        },
        {
            Id: 6,
            Name: 'Task 6',
            Status: 'Pending',
            Priority: 'High',
            Subject: 'Nice Task 6'
        }
    ];

    connectedCallback() {
        this.generateActualData();
    }

    generateActualData() {
        for (let objTask of this.arrTaskData) {
            if (objTask.Priority == 'High') {
                objTask.ClassName = 'slds-theme_error';
            } else if (objTask.Priority == 'Medium') {
                objTask.ClassName = 'slds-theme_success';
            }
            else if (objTask.Priority == 'Low') {
                objTask.ClassName = 'slds-theme_warning';
            }
        }
        this.arrTaskData = [...this.arrTaskData];
    }

    get isDataAvailable() {
        return this.arrTaskData && this.arrTaskData.length > 0;
    }

}