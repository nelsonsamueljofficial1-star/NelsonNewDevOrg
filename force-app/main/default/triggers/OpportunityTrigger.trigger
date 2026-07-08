/* Purpose: This trigger is used to call Opportunity handler
 * Created By: Nelson Samuel J
 * Created On: 21-05-2026
 */
Trigger OpportunityTrigger on Opportunity (after insert, after update, after delete) {
    
    OpportunityHandler objOppHandler = new OpportunityHandler();
    
    
    if(Trigger.isBefore){ // To call the before events related methods
        
    }else if(Trigger.isAfter){ // To call the after events related methods
        if(Trigger.isInsert){
            
             // This method is used to call the Future method to convert Amount
            OpportunityHandler.updateConvertedAmount(Trigger.new);

            // This method is used to change Account priority to high when High Opportunity created under related Account.
            objOppHandler.updateAccountPriorityToHigh(Trigger.new, Trigger.oldMap);
            
            // This method is used to call the future method to assign Product and create Task
            objOppHandler.assignProductAndCreateTask(Trigger.new);
        }else if(Trigger.isUpdate){
            
            // This method is used to change Account priority to high when High Opportunity updated under related Account.
            objOppHandler.updateAccountPriorityToHigh(Trigger.new, Trigger.oldMap);
            
            // This method is used to change Account priority to Normal when Opportunity stage move to closed won or closed lost.
            objOppHandler.updateAccountPriorityToNormal(Trigger.new, Trigger.oldMap);
        } else if (Trigger.isDelete) {
            
            // This method is used to update Account Priority to Normal when High Opportunity Delete
            objOppHandler.updateAccountPriorityOppDelete(Trigger.old);
        }
    }
    
}