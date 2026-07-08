import { LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ProductAndDiscountCalculator extends LightningElement {

    arrUIData;
    arrBackupData;
    lstSelectedIds = [];
    lstRestoreSelectedIds = [];

    // Assign Discount and Product to UI Data
    constructor() {
        super();
        this.arrUIData = [];
        this.arrBackupData = [];
    }

    // Load Product Data
    connectedCallback() {
        const lstProductData = [
            {
                Id: 1,
                ProductName: 'Laptop',
                ProductCode: 'LP1001',
                Category: 'Electronics',
                OriginalPrice: 50000
            },
            {
                Id: 2,
                ProductName: 'Mobile',
                ProductCode: 'MB1002',
                Category: 'Electronics',
                OriginalPrice: 30000
            },
            {
                Id: 3,
                ProductName: 'Headphone',
                ProductCode: 'HP1003',
                Category: 'Accessories',
                OriginalPrice: 5000
            },
            {
                Id: 4,
                ProductName: 'Keyboard',
                ProductCode: 'KB1004',
                Category: 'Accessories',
                OriginalPrice: 2000
            },
            {
                Id: 5,
                ProductName: 'Monitor',
                ProductCode: 'MN1005',
                Category: 'Electronics',
                OriginalPrice: 15000
            }
        ];

        this.arrUIData = [...lstProductData];
    }

    // Stop the infinite loop
    isRendered = false

    // Calculate and display discount details after rendering
    renderedCallback() {
        if (this.isRendered) {
            return
        }

        this.isRendered = true;

        this.arrUIData = this.arrUIData.map(data => {

            return {
                ...data,
                DiscountPercentage: 15,
                DiscountedPrice:
                    data.OriginalPrice * (1 - (15 / 100))
            };
        });
    }

    // show Error
    errorCallback(error, stack) {

        console.error('Error : ', error);
        console.error('Stack : ', stack);

        this.showToast('Error', 'Something went wrong', 'error');
    }

    // Empty the Data
    disconnectedCallback() {

        this.arrUIData = [];
        this.arrBackupData = [];

    }

    // input Change Handler
    handleDiscountChange(event) {
        this.arrUIData = this.arrUIData.map(data => {
            if (data.Id === Number(event.target.dataset.id)) {
                return {
                    ...data,
                    DiscountPercentage: Number(event.target.value)
                }
            }
            return data;
        })
    }

    // Action Handler
    actionHandler(event) {

        if (event.target.name == 'Calculate') {

            // Get record Id
            const recordId = Number(event.target.dataset.id);

            // Get that object
            const rowData = this.arrUIData.find(
                data => data.Id === recordId);

            // Change the UI data
            if (rowData.DiscountPercentage >= 0 && rowData.DiscountPercentage <= 100) {
                const discountedPrice = rowData.OriginalPrice * (1 - (rowData.DiscountPercentage / 100))

                this.arrUIData = this.arrUIData.map(data => {
                    if (data.Id === recordId) {
                        return {
                            ...data,
                            DiscountedPrice: discountedPrice
                        }
                    } else {
                        return data;
                    }
                });

                // Success Toast
                this.showToast("Sucesss Toast", "Dicounted Amount Calculated Successfully", "success");
            } else {

                // Error Toast
                this.showToast("Error Toast", "Invalid discount Perentage data", "error")
            }
        } else if (event.target.name == 'Delete') {
            const recordId = Number(event.target.dataset.id);

            const objRecord = this.arrUIData.filter(data => data.Id === recordId);

            this.arrUIData = this.arrUIData.filter(data => data.Id != recordId);
            this.arrBackupData = [...this.arrBackupData, ...objRecord];

        }
    }

    // Restore the data into Product Table
    RestoreHandler(event) {
        const recordId = Number(event.target.dataset.id);
        const objRecord = this.arrBackupData.filter(data => data.Id === recordId);

        this.arrBackupData = this.arrBackupData.filter(data => data.Id != recordId);
        this.arrUIData = [...this.arrUIData, ...objRecord];
    }

    // Getter method Eg to define value in product
    get isProductAvailable() {
        return this.arrUIData && this.arrUIData.length > 0;
    }

    // Getter method to define value in Backup Data
    get isBackupDataAvailable() {
        return this.arrBackupData && this.arrBackupData.length > 0;
    }

    handleCheckboxChange(event) {

        // Get selected Record Id
        const idSelectedId = Number(event.target.dataset.id);

        // Store the checked data
        if (event.target.checked) {
            this.lstSelectedIds = [
                ...this.lstSelectedIds,
                idSelectedId
            ];

        } else { // Rempve unchecked data
            this.lstSelectedIds = this.lstSelectedIds.filter(
                id => id != idSelectedId
            );
        }
    }

    handleHeadCheckboxChange(event) {

        // Find is checked or not
        const bolIsChecked = event.target.checked;

        // Get all table body inside check boxes
        const checkboxes = this.template.querySelectorAll('.rowCheckbox');

        // Checked means make all row check box checked
        if (bolIsChecked) {
            this.lstSelectedIds = [];

            checkboxes.forEach(box => {
                box.checked = true;
                if (box.dataset.id) {
                    this.lstSelectedIds.push(Number(box.dataset.id));
                }
            });
        } else { // Not check means remove all row check box
            checkboxes.forEach(box => {
                box.checked = false;
            });
            this.lstSelectedIds = [];
        }
    }

    // Delete Handler
    actionDeleteHandler() {

        // Base condition Check
        if (this.lstSelectedIds.length === 0) {
            this.showToast("Error", "Select at least one product", "error");
            return;
        }

        // Deleted record
        const deletedRecords = this.arrUIData.filter(data => this.lstSelectedIds.includes(data.Id));

        // Assign UI data without deleted record
        this.arrUIData = this.arrUIData.filter(data => !this.lstSelectedIds.includes(data.Id));

        // Store it in backup list
        this.arrBackupData = [...this.arrBackupData, ...deletedRecords];

        this.lstSelectedIds = [];

        // Show Success Message
        this.showToast("Success", "Selected products deleted", "success");
    }

    //  Restore action Methods for bulk
    bulkRestoreHandler() {

        // Base condition Check
        if (this.lstRestoreSelectedIds.length === 0) {
            this.showToast("Error", "Select at least one product", "error");
            return;
        }

        // Restored Selected record
        const RestoredRecords = this.arrBackupData.filter(data => this.lstRestoreSelectedIds.includes(data.Id));

        // Remove Restored records in Backup list
        this.arrBackupData = this.arrBackupData.filter(data => !this.lstRestoreSelectedIds.includes(data.Id));

        // Store Restored records in UI list
        this.arrUIData = [...this.arrUIData, ...RestoredRecords];

        this.lstRestoreSelectedIds = [];

        // Show Success Message
        this.showToast("Success", "Selected products Restored Successfully", "success");
    }

    handleRestoreHeadCheckboxChange(event) {

        // Find is checked or not
        const bolIsChecked = event.target.checked;

        // Get all table body inside check boxes
        const checkboxes = this.template.querySelectorAll('.rowbackupCheckbox');

        // Checked means make all row check box checked
        if (bolIsChecked) {
            this.lstRestoreSelectedIds = [];

            checkboxes.forEach(box => {
                box.checked = true;
                if (box.dataset.id) {
                    this.lstRestoreSelectedIds.push(Number(box.dataset.id));
                }
            });
        } else { // Not check means remove all row check box
            checkboxes.forEach(box => {
                box.checked = false;
            });
            this.lstRestoreSelectedIds = [];
        }
    }

    // Row check box handler
    handleRestoreCheckboxChange(event) {

        // Get selected Record Id
        const idSelectedId = Number(event.target.dataset.id);

        // Store the checked data
        if (event.target.checked) {
            this.lstRestoreSelectedIds = [
                ...this.lstRestoreSelectedIds,
                idSelectedId
            ];

        } else { // Rempve unchecked data
            this.lstRestoreSelectedIds = this.lstRestoreSelectedIds.filter(
                id => id != idSelectedId
            );
        }
    }

    // Show Toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message:
                message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}