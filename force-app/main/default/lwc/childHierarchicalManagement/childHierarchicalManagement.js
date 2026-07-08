/* Purpose: This JS file is used to show the hierarchical relationship between records in a child relationship
 * Created By: Nelson Samuel J
 * Created On: 05-06-2026
 */
import { api, LightningElement, track } from 'lwc';

export default class ChildHierarchicalManagement extends LightningElement {

   @api
   get objChilDatasApi() {
      console.log('Received objChildDatas in child via @api:', JSON.stringify(this.objChildDatas));
      return this.objChildDatas;
   }
   set objChilDatasApi(value) {
      this.objChildDatas = value;
      console.log('Received objChildDatas in child via @api:', JSON.stringify(this.objChildDatas));
   }

   @track objChildDatas = {
      "Child-One": "Deselect",
      "Child-Two": "Deselect",
      "Child-Three": "Deselect"
   }

   // Getters for Label of the child records to show in the UI.
   get childOneLabel() {
      return this.objChildDatas['Child-One'] === 'Select' ? 'Deselected' : 'Select';
   }

   get childTwoLabel() {
      return this.objChildDatas['Child-Two'] === 'Select' ? 'Deselected' : 'Select';
   }

   get childThreeLabel() {
      return this.objChildDatas['Child-Three'] === 'Select' ? 'Deselected' : 'Select';
   }

   // This method is used to select/deselect the child record and update the objChildDatas object with the current status of the child record.
   childAction(event) {
      console.log('Current objChildDatas in child before update:', JSON.stringify(this.objChildDatas));
      let label = event.target.label;
      if (label === 'Select') {
         event.target.label = 'Deselected';

         this.objChildDatas = {
            ...this.objChildDatas,
            [event.target.name]: 'Select'
         };
      } else {
         event.target.label = 'Select';

         this.objChildDatas = {
            ...this.objChildDatas,
            [event.target.name]: 'Deselect'
         };
      }

      console.log('Updated objChildDatas in child:', JSON.stringify(this.objChildDatas));

      const myEvent = new CustomEvent('senddatatoparent', {
         detail: this.objChildDatas
      });

      // 2. Dispatch the event
      this.dispatchEvent(myEvent);
   }

}