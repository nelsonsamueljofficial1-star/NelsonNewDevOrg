/* Prupose: This trigger is used to call the Leave Request Handler
 * Created By: Nelson Samuel J
 * Created On: 19-05-2026
 */
Trigger LeaveRequestTrigger on Leave_Request__c(before insert, before update, after update) {
    
    LeaveRequestHandler objLeaveHandler = new LeaveRequestHandler();
    
    if(Trigger.isBefore && Trigger.isInsert){
        // This method is used to prevent Leave application which exceed the leave balance
        objLeaveHandler.preventExceedBalanceLeave(Trigger.new);
    } else if(Trigger.isBefore && Trigger.isUpdate){
        // This method is used to prevent Leave application which exceed the leave balance
        // objLeaveHandler.preventExceedBalanceLeave(Trigger.new);
        // This method is used to prevent leave status change to withdraw or Cancel when status already in Approved
        objLeaveHandler.preventStatusChange(Trigger.new, Trigger.oldMap);
        
    } else if (Trigger.isAfter && Trigger.isUpdate) {
        // This method is used to update the Leave field
        objLeaveHandler.updateContactLeaveBalance(Trigger.new, Trigger.oldMap);
    }
}