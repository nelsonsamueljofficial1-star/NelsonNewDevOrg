/* Purpose: This Batch is used to create task which Open Opportunity without any activity more than 90 days
 * Created By: Nelson Samuel J
 * Created On: 21-05-2026
 */
public class OppertunityOpenOverTimeBatch implements Database.Batchable<sObject>, Database.stateful{
    
    String strOppErrorMsg = '';
    String strTaskErrorMsg = '';
    Integer intSuccessCount = 0;
    Integer intErrorCount = 0;
    List<Database.SaveResult> lstOppSaveResult = new List<Database.SaveResult>();
    List<Database.SaveResult> lstTaskSaveResult = new List<Database.SaveResult>();
    
    // Start method : It is used to get Open Opportunity which no activity for past 90 days
    public Database.QueryLocator start(Database.BatchableContext bc){
        
        String strQuery = 'SELECT Id, OwnerId FROM Opportunity WHERE IsClosed = false AND Follow_Up_Required__c = false';
        
        // Dynamic Query for Testing purpose
        if(Test.isRunningTest()){
            strQuery += ' AND Test_LastModifiedDate__c < LAST_90_DAYS';
        }
        else{
            strQuery += ' AND LastModifiedDate < LAST_90_DAYS';
        }
        
        return Database.getQueryLocator(strQuery);
    }
    
    // Execute method : It is used to send task and update follow up required
    public void execute(Database.BatchableContext bc, List<Opportunity> lstOpp){
        List<Task> lstTask = new List<Task>();
        
        try{
            for(Opportunity objOpp : lstOpp){
                
                // Create Task
                Task objTask = new Task(
                    WhatId = objOpp.Id,
                OwnerId = objOpp.OwnerId,
                Subject = ' Review this Opportunity not active more than 90 days'
                    );
                lstTask.add(objTask);
                
                // Update Follow up to True
                objOpp.Follow_Up_Required__c = true;
            }
            
            // Partial Update Opportunity
            lstOppSaveResult = Database.update(lstOpp, false);
            
            // Store Success and Error for Opportunity
            for(Database.SaveResult objSaveResult : lstOppSaveResult) {
                if (objSaveResult.isSuccess()) {
                    // Operation success, so store count
                    intSuccessCount += 1;
                } else {
                    // Operation failed, so store all errors and store error count
                    for(Database.Error objError : objSaveResult.getErrors()) {
                        // Count Error
                        intErrorCount += 1;
                        
                        // Store Error
                        strOppErrorMsg += 'Opp Error Record Id : ' +  objSaveResult.getId() + ' | Error : ' + objError.getMessage() + '\n';
                    }
                }
            }
            
            // Partial Insert Task
            lstTaskSaveResult = Database.insert(lstTask, false);
            
            // Store Success and Error for Task
            for (Database.SaveResult objSaveResult : lstTaskSaveResult) {
                if (objSaveResult.isSuccess()) {
                    // Operation success, so store count
                    intSuccessCount += 1;
                } else {
                    // Operation failed, so store all errors and store error count
                    for(Database.Error objError : objSaveResult.getErrors()) {
                        // Count Error
                        intErrorCount += 1;
                        
                        // Store Error
                        strTaskErrorMsg += 'Task Error Record Id : ' +  objSaveResult.getId() + ' | Error : ' + objError.getMessage() + '\n';
                    }
                }
            }
        } catch (Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin Regarding this issue - ' + exp.getMessage());
        }
        
    }
    
    // Finish method : This method is used to show the error, success and error count
    public void finish(Database.BatchableContext bc){
        System.Debug('Count \n ' + 'Success Count : ' + intSuccessCount + ' \n '
            + 'Error Count : ' + intErrorCount + '\n Opportunity Error : \n' + strOppErrorMsg + '\n Task Error : \n' + strTaskErrorMsg );
    }
}