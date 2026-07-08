/* Prupose: This test class is used to handle all the Leave Request method
 * Created By: Nelson Samuel J
 * Created On: 20-05-2026
 */
@isTest
private class LeaveRequestHandlerTest {
    
    // This method is used to create LeaveRequestHandlerTest and Contact
    @TestSetup
    static void makeData(){
        // Contact Creatiom
        Contact objCon = new Contact(
            LastName = 'Test Con - 1',
        Casual_Leave__c = 3.0,
        Earned_Leave__c = 2.0,
        Sick_Leave__c = 1.0,
        Permission_Hours__c = 2.0
            );
        
        insert objCon;
    }
    
    // Test contact balance update after Cancelled
    @isTest
    static void testUpdateContactLeaveBalanceAdd(){
            Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
            Leave_Request__c  objLeaveRequest= new Leave_Request__c(
                Contact__c = objCon.Id,
            Leave_Type__c = 'Earned Leave',
            Leave_Status__c = 'Submitted for Approval',
            Start_Date__c = Date.today().addDays(3),
            End_Date__c = Date.today().addDays(3),
            Start_Date_Session__c = 'Session 1',
            End_Date_Session__c = 'Session 1'
                );
            try{
                    insert objLeaveRequest;
            } catch(Exception exp){
                    System.debug(exp.getMessage());
            }
        
            objLeaveRequest.Leave_Status__c = 'Approved';
        
            Test.startTest();
            try{
                    update objLeaveRequest;
                    objLeaveRequest.Leave_Status__c = 'Cancelled';
                    update objLeaveRequest;
            } catch(Exception exp){
                    System.Debug(exp.getMessage());
            }
            Test.stopTest();
    }
    
    // Test duplicate leave prevention
    @isTest
    static void testPreventExceedLeaveBalance(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        Leave_Request__c objLeaveRequest1 = new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Casual Leave',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today(),
        End_Date__c = Date.today(),
        Start_Date_Session__c = 'Session 1',
        End_Date_Session__c = 'Session 1'
            );
        insert objLeaveRequest1;
        
        Leave_Request__c objNewLeaveRequest = new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Casual Leave',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today(),
        End_Date__c = Date.today(),
        Start_Date_Session__c = 'Session 1',
        End_Date_Session__c = 'Session 1'
            );
        
        Test.startTest();
        try {
            insert objNewLeaveRequest;
        } catch (Exception exp) {
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }
    
    // Test withdraw prevention
    @isTest
    static void testPreventWithdraw(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
        Leave_Request__c  objLeaveRequest= new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Sick Leave',
        Leave_Status__c = 'Approved',
        Start_Date__c = Date.today(),
        End_Date__c = Date.today(),
        Start_Date_Session__c = 'Session 1',
        End_Date_Session__c = 'Session 1'
            );
        
        insert objLeaveRequest;
        
        // update the status
        objLeaveRequest.Leave_Status__c = 'Withdraw';
        
        Test.startTest();
        try{
            update objLeaveRequest;
        }catch(Exception exp){
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }
    
    // Test prevention of Sick Leave exceed balance Leave
    @isTest
    static void testPreventSickLeaveExceedBalance(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
        Leave_Request__c  objLeaveRequest= new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Sick Leave',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today().addDays(1),
        End_Date__c = Date.today().addDays(3),
        Start_Date_Session__c = 'Session 1',
        End_Date_Session__c = 'Session 2'
            );
        
        Test.startTest();
        
        // Negative Scenario
        try{
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        try{
            objLeaveRequest.Start_Date_Session__c = 'Session 2';
            objLeaveRequest.End_Date_Session__c = 'Session 1';
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        
        // Positive Scenario
        objLeaveRequest.End_Date__c = Date.today();
        insert objLeaveRequest;
        Test.stopTest();
    }
    
    // Test prevention of Casual Leave exceed balance Leave
    @isTest
    static void testPreventCasualLeaveExceedBalance(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
        Leave_Request__c  objLeaveRequest= new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Casual Leave',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today().addDays(1),
        End_Date__c = Date.today().addDays(5),
        Start_Date_Session__c = 'Session 2',
        End_Date_Session__c = 'Session 1'
            );
        
        Test.startTest();
        
        // Negative Scenario
        try{
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        try{
            objLeaveRequest.Start_Date_Session__c = 'Session 1';
            objLeaveRequest.End_Date_Session__c = 'Session 2';
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        
        // Positive Scenario
        objLeaveRequest.End_Date__c = Date.today();
        insert objLeaveRequest;
        Test.stopTest();
    }
    
    // Test prevention of Earned Leave exceed balance Leave
    @isTest
    static void testPreventEarnedLeaveExceedBalance(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
        Leave_Request__c  objLeaveRequest = new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Earned Leave',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today().addDays(1),
        End_Date__c = Date.today().addDays(4),
        Start_Date_Session__c = 'Session 2',
        End_Date_Session__c = 'Session 1'
            );
        
        Test.startTest();
        
        // Negative Scenario
        try{
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        try{
            objLeaveRequest.Start_Date_Session__c = 'Session 1';
            objLeaveRequest.End_Date_Session__c = 'Session 2';
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        try{
            objLeaveRequest.Start_Date_Session__c = 'Session 1';
            objLeaveRequest.End_Date_Session__c = 'Session 1';
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        
        
        // Positive Scenario
        objLeaveRequest.End_Date__c = Date.today();
        insert objLeaveRequest;
        Test.stopTest();
    }
    
    // Test prevention of Permission Hours exceed balance Leave
    @isTest
    static void testPreventPermissionHoursExceedBalance(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
        Leave_Request__c  objLeaveRequest = new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Permission Hours',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today().addDays(1),
        Start_Time__c = System.now().time(),
        End_Time__c = System.now().time().addHours(5)
            );
        
        Test.startTest();
        
        // Negative Scenario
        try{
            insert objLeaveRequest;
        } catch(Exception exp){
            System.debug(exp);
        }
        
        // Positive Scenario
        objLeaveRequest.End_Time__c = System.now().time().addHours(2);
        insert objLeaveRequest;
        Test.stopTest();
    }
    
    // Test contact balance update after approval
    @isTest
    static void testUpdateContactLeaveBalance(){
        Contact objCon = [SELECT Id FROM Contact LIMIT 1];
        
        Leave_Request__c  objLeaveRequest= new Leave_Request__c(
            Contact__c = objCon.Id,
        Leave_Type__c = 'Earned Leave',
        Leave_Status__c = 'Submitted for Approval',
        Start_Date__c = Date.today(),
        End_Date__c = Date.today(),
        Start_Date_Session__c = 'Session 1',
        End_Date_Session__c = 'Session 1'
            );
        
        Test.startTest();
        
        // insert Leave
        insert objLeaveRequest;
        
        // update Leave
        objLeaveRequest.Leave_Status__c = 'Approved';
        try{
            update objLeaveRequest;
        }catch(Exception exp){
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }
}