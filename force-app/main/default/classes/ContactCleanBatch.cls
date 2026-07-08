/* Purpose: This batch is used to clean contact
 * Created By: Nelson Samuel J
 * Created On: 23-05-2026
 */
public class ContactCleanBatch implements Database.Batchable<sObject>, Database.Stateful{
    
    String strErrorMsg = '';
    
    // Start Method: It is use to get Contact which not active more years
    public Database.QueryLocator start(Database.BatchableContext bc){
        return Database.getQueryLocator([SELECT Id, Name, 
        (SELECT Id, Name, CreatedDate FROM Opportunities), 
        (SELECT Id, CaseNumber, CreatedDate FROM Cases)
        FROM Contact 
        WHERE CreatedDate <= LAST_N_YEARS:2 AND (AccountId = null OR (Account.Active__c != 'Yes' AND (NOT Account.Type LIKE '%Customer%'))) AND Email = null 
        AND Id IN (SELECT ContactId FROM Opportunity WHERE CreatedDate <= LAST_N_YEARS:3) 
        AND Id IN (SELECT ContactId FROM Case WHERE CreatedDate <= LAST_N_YEARS:2)]);
    }
    
    // Execute Method: It is used to delete the no active Contact
    public void execute(Database.BatchableContext bc, List<Contact> lstCon){
        System.debug('Data :' + lstCon);
        // Partial delete
        List<Database.DeleteResult> lstConDeleteResult = Database.delete(lstCon, false);
        
        for (Database.DeleteResult objDeleteResult : lstConDeleteResult) {
            if (!objDeleteResult.isSuccess()) {
                for(Database.Error objError : objDeleteResult.getErrors()) {
                    
                    // Store Error
                    strErrorMsg += 'Contact Delete Error Record Error : ' + objError.getMessage() + '\n';
                }
            }
        }
    }
    
    // Finish Method: It is used to show the Error Message
    public void finish(Database.BatchableContext bc){
        System.debug('Error: ' + strErrorMsg);
    }
}