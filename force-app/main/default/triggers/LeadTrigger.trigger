/* Purpose: This Trigger is used to handle the trigger logic
 * Created By: Nelson Samuel J
 * Created On: 22-05-2026
 */
Trigger LeadTrigger on Lead (before insert, before update, after insert, after update) {
    
    if(Trigger.isBefore){ // To call the before events related methods
        if(Trigger.isInsert){
            
            // This method is used to prevent Lead insert without valid data
            LeadTriggerHandler.preventLeadInsertOrUpdate(Trigger.new, Trigger.oldMap);
        }else if(Trigger.isUpdate){

            // This method is used to prevent Lead update without valid data
            LeadTriggerHandler.preventLeadInsertOrUpdate(Trigger.new, Trigger.oldMap);
        } else if (Trigger.isDelete) {
            
        }
        
    }else if(Trigger.isAfter){ // To call the after events related methods
        if(Trigger.isInsert){
            
        }else if(Trigger.isUpdate){
            
        } else if (Trigger.isDelete) {
            
        }
        
    }
    
}