/* Purpose: This Test class is used to test all Lead related Logics
 * Created By: Nelson Samuel J
 * Created On: 23-05-2026
 */
@isTest
private class LeadTriggerTest {
    
    // This method is used to create data test
    @TestSetup
    static void makeData(){
        Lead objLead = new Lead(
        LastName = 'Test Lead',
        Status = 'Qualified',
        AnnualRevenue = 8000000,
        Company = 'Test Company',
        Email = 'Test@gmail.com',
        Phone = '8778432734'
            );
        
        // Insert Lead
        insert objLead;
        
        // Test the change
        Lead objInsertedLead = [SELECT Id, Rating FROM Lead LIMIT 1];
        System.assert(objInsertedLead.Rating == 'Hot');
    }
    
    // This is used to test Annual Revenue prevention
    @isTest
    static void checkAnnualRevenuePreventTest() {
        
        Lead objLead = [SELECT Id, AnnualRevenue FROM Lead LIMIT 1];
        
        Test.startTest();
        // update Lead
        objLead.AnnualRevenue = 100;
        try{
            update objLead;
        } catch(Exception exp){
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }
    
    // This is used to test Company field prevention
    @isTest
    static void checkCompanyPreventTest() {
        
        Lead objLead = [SELECT Id, Company FROM Lead LIMIT 1];
        
        Test.startTest();
        
        // Update Lead
        objLead.Company = '';
        try{
            update objLead;
        } catch(Exception exp){
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }

    // This is used to test Email field prevention
    @isTest
    static void checkEmailPreventTest() {
        
        Lead objLead = [SELECT Id, Email FROM Lead LIMIT 1];
        
        Test.startTest();
        
        // Update Lead
        objLead.email = 'nelson@gmail.c';
        try{
            update objLead;
        } catch(Exception exp){
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }

    // This is used to test Phone field prevention
    @isTest
    static void checkPhonePreventTest() {
        
        Lead objLead = [SELECT Id, Phone FROM Lead LIMIT 1];
        
        Test.startTest();
        
        // Update Lead
        objLead.Phone = '899373';
        try{
            update objLead;
        } catch(Exception exp){
            System.debug(exp.getMessage());
        }
        Test.stopTest();
    }
}