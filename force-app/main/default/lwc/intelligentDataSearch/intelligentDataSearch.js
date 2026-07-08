/* Purpose: This JS file is used to show the Intelligent Data Search component in the App page of the user.
 * Created By: Nelson Samuel J
 * Created On: 06-06-2026
 */
import { LightningElement, track } from 'lwc';
import executeDynamicSOQL from '@salesforce/apex/intelligentDataSearchController.executeDynamicSOQL';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class IntelligentDataSearch extends LightningElement {

    isShowModal = false;
    currentPage = 1;
    pageSize = 10;
    totalPages = 0;
    objectApiName = '';

    @track lstQueryResults = [];
    @track lstColumns = [];
    @track strQuery = '';
    @track isLoading = false;
    @track strError = '';
    @track lstAllQueryResults = [];

    // Getter to check if there are query results to display
    get hasResults() {
        return this.lstQueryResults && this.lstQueryResults.length > 0;
    }

    get hasError() {
        return this.strError && this.strError.length > 0;
    }

    // Keeps strQuery in sync as the user types
    handleInputChange(event) {
        this.strQuery = event.target.value;
    }

    // Clear the search results and columns
    handleClear() {

        this.lstQueryResults = [];
        this.lstColumns = [];
        this.lstAllQueryResults = [];
        this.strError = '';

        this.currentPage = 1;
        this.totalPages = 0;

        const textarea = this.template.querySelector('lightning-textarea');

        if (textarea) {
            textarea.value = '';
        }

        this.strQuery = '';
    }

    // Fetch data based on the current page and page size
    fetchDatas() {
        executeDynamicSOQL({ strSoql: this.strQuery.trim() })
            .then(result => {

                // This concept is used to set objectApi Name
                const lstQuerySplit = this.strQuery.toLowerCase().split(/ from /i);
                console.log("Query :", this.strQuery);
                const objectTempApiName = lstQuerySplit[1].trim().split(' ')[0];

                this.objectApiName = objectTempApiName.charAt(0).toUpperCase() + objectTempApiName.slice(1);

                this.lstAllQueryResults = result;
                const total = result.length;
                this.totalPages = Math.ceil(total / this.pageSize);

                if (result.length > 0) {
                    this.strError = '';

                    // Store All Keys using set and flatMap(Combine and send as a lst)
                    let setKeys = [...new Set(result.flatMap(row => Object.keys(row)))];

                    // Dynamically generate columns based on the keys of the first record
                    this.lstColumns = setKeys.map(key => ({
                        label: key,
                        fieldName: key,
                        type: 'text'
                    }));

                    // Initialize the first page of results
                    this.updatePaginatedData();

                    // Show success toast message
                    this.showToast('Success', 'Query executed successfully!', 'success');
                } else {

                    this.lstQueryResults = [];
                    this.lstColumns = [];
                    this.strError = 'No records found.';
                }
            })
            .catch(error => {
                this.lstQueryResults = [];
                this.lstColumns = [];
                this.lstAllQueryResults = [];
                this.strError = error?.body?.message ? 'Invalid Query, Error : ' + error.body.message : 'An error occurred while executing the query.';

                this.showToast('Error', this.strError, 'error');
            }).finally(() => {
                this.isLoading = false;
            });
    }

    // Handle How it works
    handleHowWork() {
        this.isShowModal = true;
    }

    // Hide the Modal
    handleHide() {
        this.isShowModal = false;
    }

    // Update the displayed data based on the current page
    updatePaginatedData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        console.log("lstAllQueryResults ", JSON.stringify(this.lstAllQueryResults));

        this.lstQueryResults = this.lstAllQueryResults.slice(start, end);
        console.log("lstQueryResults ", JSON.stringify(this.lstQueryResults));
    }

    // Handle previous page button click
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePaginatedData();
        }
    }

    // Handle next page button click
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePaginatedData();
        }
    }

    // Disable previous button on the first page and next button on the last page
    get isPreviousDisabled() {
        return this.currentPage === 1;
    }

    // Disable next button on the last page
    get isNextDisabled() {
        return this.currentPage === this.totalPages;
    }

    // Execute the SOQL query and fetch results
    handleRunQuery() {

        this.isLoading = true;
        this.strError = '';
        this.lstQueryResults = [];
        this.lstColumns = [];

        if (!this.strQuery || this.strQuery.trim() === '') {

            this.strError = 'Please enter a valid SOQL query.';
            this.isLoading = false;

            this.showToast('Error', this.strError, 'error');
            return;
        }

        this.currentPage = 1;
        this.fetchDatas();
    }

    // Show Toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}