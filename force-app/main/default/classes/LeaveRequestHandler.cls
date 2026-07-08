/* Prupose: This class is used to handle all the Leave Request Logic
 * Created By: Nelson Samuel J
 * Created On: 19-05-2026
 */
public with sharing class LeaveRequestHandler {
    
    // This method is used to prevent Leave application which exceed the leave balance
    public void preventExceedBalanceLeave(List<Leave_Request__c> lstNewLeaveRequest){
        if(lstNewLeaveRequest != null){
            Set<Id> setLeaveAlreadyApplied = new Set<Id>();
            Map<Id, Contact> mapContactDetails = new Map<Id, Contact>();
            
            try{
                for(Leave_Request__c objLeaveRequest : lstNewLeaveRequest){
                    mapContactDetails.put(objLeaveRequest.Contact__c, null);
                }
                
                for(Leave_Request__c objLeaveRequest : [SELECT Id,Contact__c 
                                                    FROM Leave_Request__c 
                                                    WHERE Contact__c IN :mapContactDetails.keySet() AND Leave_Status__c = 'Submitted for Approval']){
                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                }
                for(Contact objCon : [SELECT Id, Permission_Hours__c, Earned_Leave__c, Casual_Leave__c, Sick_Leave__c
                                FROM Contact 
                                WHERE Id IN :mapContactDetails.keySet()]){
                    mapContactDetails.put(objCon.Id, objCon);
                }
                
                for(Leave_Request__c objLeaveRequest : lstNewLeaveRequest){
                    Contact objContact = mapContactDetails.get(objLeaveRequest.Contact__c);
                    Decimal decDaysBtwnStartAndEndDate = 0.0;
                    Decimal decActualDayLeave = 0.0;
                    
                    // To show error when already apply leave in process
                    if(setLeaveAlreadyApplied != null && setLeaveAlreadyApplied.contains((Id)objLeaveRequest.Contact__c)){
                        objLeaveRequest.addError('You already applied for Leave. So can\'t create another leave before it closed.');
                    }
                    
                    // This concept is used to show error for Permission Hours Type
                    if(objLeaveRequest.Leave_Type__c == 'Permission Hours'){
                        Decimal decAskPermissionHrs = (objLeaveRequest.End_Time__c.hour() + (objLeaveRequest.End_Time__c.minute() / 60.0)) - (objLeaveRequest.Start_Time__c.hour() + (objLeaveRequest.Start_Time__c.minute() / 60.0));
                        if(objContact.Permission_Hours__c == null || decAskPermissionHrs > objContact.Permission_Hours__c){
                            objLeaveRequest.addError('Your Balance hours is ' + objContact.Permission_Hours__c + ', but you apply for ' + decAskPermissionHrs + ' hours. So, your leave not applicabe');
                        }else{
                            setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                            objLeaveRequest.Permission_Hours__c = decAskPermissionHrs;
                        }
                        
                    } else if(objLeaveRequest.Leave_Type__c == 'Casual Leave'){ // This concept is used to show error for Casual Leave Type
                        decDaysBtwnStartAndEndDate = objLeaveRequest.Start_Date__c.daysBetween(objLeaveRequest.End_Date__c) + 1;
                        if(objLeaveRequest.Start_Date_Session__c == objLeaveRequest.End_Date_Session__c){
                            decActualDayLeave = decDaysBtwnStartAndEndDate - 0.5;
                            if(objContact.Casual_Leave__c == null || decActualDayLeave > objContact.Casual_Leave__c){
                                objLeaveRequest.addError('Your Balance Days are ' + objContact.Casual_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                            }else{
                                setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                objLeaveRequest.Leave_Days__c = decActualDayLeave;
                            }
                        }
                        else {
                            if(objLeaveRequest.Start_Date_Session__c == 'Session 1'){
                                decActualDayLeave = decDaysBtwnStartAndEndDate;
                                if(objContact.Casual_Leave__c == null || decActualDayLeave > objContact.Casual_Leave__c){
                                    objLeaveRequest.addError('Your Balance Days are ' + objContact.Casual_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                                }else{
                                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                    objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                }
                            } else {
                                decActualDayLeave = decDaysBtwnStartAndEndDate - 1;
                                if(objContact.Casual_Leave__c == null || decActualDayLeave > objContact.Casual_Leave__c){
                                    objLeaveRequest.addError('Your Balance Days are ' + objContact.Casual_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                                }else{
                                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                    objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                }
                            }
                        }
                        
                    }else if(objLeaveRequest.Leave_Type__c == 'Sick Leave'){  // This concept is used to show error for Sick Leave Type
                        decDaysBtwnStartAndEndDate = objLeaveRequest.Start_Date__c.daysBetween(objLeaveRequest.End_Date__c) + 1;
                        if(objLeaveRequest.Start_Date_Session__c == objLeaveRequest.End_Date_Session__c){
                            decActualDayLeave = decDaysBtwnStartAndEndDate - 0.5;
                            if(objContact.Sick_Leave__c == null || decActualDayLeave > objContact.Sick_Leave__c){
                                objLeaveRequest.addError('Your Balance Days are ' + objContact.Sick_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                            }else{
                                setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                objLeaveRequest.Leave_Days__c = decActualDayLeave;
                            }
                        }
                        else {
                            if(objLeaveRequest.Start_Date_Session__c == 'Session 1'){
                                decActualDayLeave = decDaysBtwnStartAndEndDate;
                                if(objContact.Sick_Leave__c == null || decActualDayLeave > objContact.Sick_Leave__c){
                                    objLeaveRequest.addError('Your Balance Days are ' + objContact.Sick_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                                }else{
                                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                    objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                }
                            } else {
                                decActualDayLeave = decDaysBtwnStartAndEndDate - 1;
                                if(objContact.Sick_Leave__c == null || decActualDayLeave > objContact.Sick_Leave__c){
                                    objLeaveRequest.addError('Your Balance Days are ' + objContact.Sick_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                                }else{
                                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                    objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                }
                            }
                        }
                        
                    }else if(objLeaveRequest.Leave_Type__c == 'Earned Leave'){ // This concept is used to show error for Earned Leave Type
                        decDaysBtwnStartAndEndDate = objLeaveRequest.Start_Date__c.daysBetween(objLeaveRequest.End_Date__c) + 1;
                        if(objLeaveRequest.Start_Date_Session__c == objLeaveRequest.End_Date_Session__c){
                            decActualDayLeave = decDaysBtwnStartAndEndDate - 0.5;
                            if(objContact.Earned_Leave__c == null || decActualDayLeave > objContact.Earned_Leave__c){
                                objLeaveRequest.addError('Your Balance Days are ' + objContact.Earned_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                            }else{
                                setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                
                            }
                        }
                        else {
                            if(objLeaveRequest.Start_Date_Session__c == 'Session 1'){
                                decActualDayLeave = decDaysBtwnStartAndEndDate;
                                if(objContact.Earned_Leave__c == null || decActualDayLeave > objContact.Earned_Leave__c){
                                    objLeaveRequest.addError('Your Balance Days are ' + objContact.Earned_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                                }else{
                                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                    objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                }
                            } else {
                                decActualDayLeave = decDaysBtwnStartAndEndDate - 1;
                                if(objContact.Earned_Leave__c == null || decActualDayLeave > objContact.Earned_Leave__c){
                                    objLeaveRequest.addError('Your Balance Days are ' + objContact.Earned_Leave__c + ', but you apply for ' + decActualDayLeave + ' Days. So, your leave not applicabe');
                                }else{
                                    setLeaveAlreadyApplied.add((Id)objLeaveRequest.Contact__c);
                                    objLeaveRequest.Leave_Days__c = decActualDayLeave;
                                }
                            }
                        }
                    }
                }
            } catch(Exception exp){
                throw new AuraHandledException('Kindly report to System Admin with this error - ' + exp.getMessage());
            }
        }
    }
    
    // This method is used to prevent leave status change to withdraw or Cancel when status already in Approved
    public void preventStatusChange(List<Leave_Request__c> lstNewLeaveRequest, Map<Id, Leave_Request__c> mapOldLeaveRequest){
        for(Leave_Request__c objLeaveRequest : lstNewLeaveRequest){
            Leave_Request__c objOldLeaveRequest = mapOldLeaveRequest.get(objLeaveRequest.Id);
            if(objLeaveRequest.Leave_Status__c == 'Withdraw' && objOldLeaveRequest.Leave_Status__c == 'Approved'){
                objLeaveRequest.addError('You can\'t withdraw After Approved');
            } else if(objLeaveRequest.Leave_Status__c == 'Cancelled' && objOldLeaveRequest.Leave_Status__c == 'Approved'){
                if( System.today() >= objLeaveRequest.Start_Date__c.addDays(-1)){
                    objLeaveRequest.addError('Cancellation locked. You cannot cancel a leave within 24 hours of its start date or after it begins.');
                }
            }
        }
    }
    
    // This method is used to update the Leave field
    public void updateContactLeaveBalance(List<Leave_Request__c> lstNewLeaveRequest, Map<Id, Leave_Request__c> mapOldLeaveRequest){
        Set<Id> setConId = new Set<Id>();
        Map<Id, Contact> mapIdAndCon = new Map<Id, Contact>();
        Map<Id, Contact> mapUpdateContact = new Map<Id, Contact>();
        
        try{
            for(Leave_Request__c objLeaveRequest : lstNewLeaveRequest){
                Leave_Request__c objOldLeaveRequest = mapOldLeaveRequest.get(objLeaveRequest.Id);
                setConId.add(objLeaveRequest.Contact__c);
            }
            
            for(Contact objCon : [SELECT Id, Earned_Leave__c, Sick_Leave__c, Casual_Leave__c, Permission_Hours__c
                            FROM Contact 
                            WHERE Id IN :setConId]){
                mapIdAndCon.put(objCon.Id, objCon);
            }
            
            for(Leave_Request__c objLeaveRequest : lstNewLeaveRequest){
                Leave_Request__c objOldLeaveRequest = mapOldLeaveRequest.get(objLeaveRequest.Id);
                Contact objCon = mapIdAndCon.get(objLeaveRequest.Contact__c);
                
                // This concept is used to update Appproved Leave to contact Leave field
                if(objLeaveRequest.Leave_Status__c == 'Approved' && objOldLeaveRequest.Leave_Status__c != 'Approved'){
                    if(objLeaveRequest.Leave_Type__c == 'Permission Hours'){
                        objCon.Permission_Hours__c = objCon.Permission_Hours__c - objLeaveRequest.Permission_Hours__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    } else if(objLeaveRequest.Leave_Type__c == 'Casual Leave') {
                        objCon.Casual_Leave__c = objCon.Casual_Leave__c - objLeaveRequest.Leave_Days__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    } else if(objLeaveRequest.Leave_Type__c == 'Sick Leave') {
                        objCon.Sick_Leave__c = objCon.Sick_Leave__c - objLeaveRequest.Leave_Days__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    } else if(objLeaveRequest.Leave_Type__c == 'Earned Leave') {
                        objCon.Earned_Leave__c = objCon.Earned_Leave__c - objLeaveRequest.Leave_Days__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    }
                } else if(objLeaveRequest.Leave_Status__c == 'Cancelled' && objOldLeaveRequest.Leave_Status__c == 'Approved'){ // This concept is used to update cancelled Leave to contact Leave field
                    if(objLeaveRequest.Leave_Type__c == 'Permission Hours'){
                        objCon.Permission_Hours__c = objCon.Permission_Hours__c + objLeaveRequest.Permission_Hours__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    } else if(objLeaveRequest.Leave_Type__c == 'Casual Leave') {
                        objCon.Casual_Leave__c = objCon.Casual_Leave__c + objLeaveRequest.Leave_Days__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    } else if(objLeaveRequest.Leave_Type__c == 'Sick Leave') {
                        objCon.Sick_Leave__c = objCon.Sick_Leave__c + objLeaveRequest.Leave_Days__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    } else if(objLeaveRequest.Leave_Type__c == 'Earned Leave') {
                        objCon.Earned_Leave__c = objCon.Earned_Leave__c + objLeaveRequest.Leave_Days__c;
                        mapUpdateContact.put(objCon.Id, objCon);
                    }
                }
            }
            
        } catch(Exception exp){
            throw new AuraHandledException('Kindly report to System Admin with this error - ' + exp.getMessage());
        }
        System.debug(mapUpdateContact);
        if(mapUpdateContact != null && mapUpdateContact.size() > 0){
            update mapUpdateContact.values();
        }
    }
    
}