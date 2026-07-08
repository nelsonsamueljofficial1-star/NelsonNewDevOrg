/* Purpose: This Test class is used to test contact clean batch
 * Created By: Nelson Samuel J
 * Created On: 23-05-2026
 */
@isTest
public class ContactCleanBatchTest {
    
    // This method is used to create data
    @TestSetup
    static void makeData(){
        
        // Create Contact
        Contact objCon = new Contact();
        objCon.LastName = 'Nelson';
        insert objCon;

        // Create Opportunity related to Contact
        Opportunity objOpp = new Opportunity();
        objOpp.Name = 'Test Opp';
        objOpp.CloseDate = System.today();
        objOpp.StageName = 'Prospecting';
        objOpp.ContactId = objCon.Id;
        insert objOpp;
        
        // Create Case related to Contact
        Case objCase = new Case();
        objCase.ContactId = objCon.Id;
        objCase.Origin = 'Phone';
        insert objCase;

        // Set CreatedDate 2 years ago
        Test.setCreatedDate(objOpp.Id, System.now().addYears(-3).addDays(-2));

        // Set CreatedDate 3 years ago
        Test.setCreatedDate(objCase.Id, System.now().addYears(-2).addDays(-2));
        
    }
    
    // This method is used to check contact deleted or not
    @isTest
    static void contactBatchTest(){
        
        Test.startTest();
        
        // This concept is used to call the schedule
        ContactCleanSchedule objSchedule = new ContactCleanSchedule();
        System.schedule('Clean the Contact', '0 0 0 1 * ?', objSchedule);
        
        Test.stopTest();
        
        // Query the Contact
        Contact objCon = [SELECT Id, Name FROM Contact];
        System.Debug('Contact : ' + objCon);
    }
    
}