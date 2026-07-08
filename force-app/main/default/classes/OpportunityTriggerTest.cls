/* Purpose: This Test class is used to test all logics related to Opportunity
 * Created By: Nelson Samuel J
 * Created On: 21-05-2026
 */
@isTest
public class OpportunityTriggerTest {
    
    // This method is used to Account
    @TestSetup
    static void makeDataTest(){
        
        // Insert Account
        Account objAcc = new Account(
            Name = 'Test Acc - 1'
            );
        insert objAcc;
        
    }
    
    
    // This method is used to test already High Opportunity is available
    @isTest
    static void checkAlreadyHighOppTest(){
        Account objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Create 1st Opportunity
        Opportunity objOpp1 = new Opportunity(
            Name = 'Test Opp - 1',
        AccountId = objAcc.Id,
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        insert objOpp1;
        
        // Create 2nd Opportunity
        Opportunity objOpp2 = new Opportunity(
            Name = 'Test Opp - 1',
        AccountId = objAcc.Id,
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        insert objOpp2;
        
        Test.startTest();
        objOpp2.StageName = 'Closed Won';
        update objOpp2;
        
        // Requery the Account
        objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Test Account prioity not change from High
        System.assert(objAcc.Priority__c == 'High');
        Test.stopTest();
        
    }
    
    // This method is used to test Priority change to Normal in Account when New High Opportunity created
    @isTest
    static void checkPriorityToNormalTest(){
        Account objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Create Opportunity
        Opportunity objOpp = new Opportunity(
            Name = 'Test Opp - 1',
        AccountId = objAcc.Id,
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        insert objOpp;
        
        Test.startTest();
        
        objOpp.StageName = 'Closed Won';
        update objOpp;
        
        // Requery the Account
        objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Test Account priority changed when High Opportunity closed
        System.assert(objAcc.Priority__c == 'Normal');
        Test.stopTest();
        
    }
    
    // This method is used to test Priority change to Normal in Account when New High Opportunity Deleted
    @isTest
    static void checkPriorityToNormalWhenDeletedTest(){
        Account objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Create Opportunity
        Opportunity objOpp = new Opportunity(
            Name = 'Test Opp - 1',
        AccountId = objAcc.Id,
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        insert objOpp;
        
        Test.startTest();
        delete objOpp;
        
        // Requery the Account
        objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Test Account priority changed when High Opportunity deleted.
        System.assert(objAcc.Priority__c == 'Normal');
        Test.stopTest();
        
    }
    
    // This method is used to test Priority change to Normal in Account when New High Opportunity Deleted and already High Opportunity available
    @isTest
    static void checkAlreadyHighOppWhenDeletedTest(){
        Account objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Create Opportunity1
        Opportunity objOpp1 = new Opportunity(
            Name = 'Test Opp - 1',
        AccountId = objAcc.Id,
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        insert objOpp1;
        
        // Create Opportunity2
        Opportunity objOpp2 = new Opportunity(
            Name = 'Test Opp - 2',
        AccountId = objAcc.Id,
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        insert objOpp2;
        
        Test.startTest();
        
        delete objOpp1;
        
        // Requery the Account
        objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        // Test Account priority changed when High Opportunity deleted and already High Opportunity available.
        System.assert(objAcc.Priority__c == 'High');
        Test.stopTest();
        
    }
    
    // This method is used to test Future method create task and Product when Opportunity created
    @isTest
    static void checkTaskAndProductCreatedTest(){
        Account objAcc = [SELECT Id, Priority__c FROM Account LIMIT 1];
        
        Product2 objProd1 = new Product2(Name = 'Test Product 1', IsActive = true, Launch_Date__c = System.today());
        insert objProd1;
        
        Product2 objProd2 = new Product2(Name = 'Test Product 2', IsActive = true, Launch_Date__c = System.today());
        insert objProd2;
        
        // Get the standard pricebook ID from Org
        Id idPriceBook = Test.getStandardPricebookId();
        System.debug('Test :' + idPriceBook);
        
        // Make active the standard price book
        Pricebook2 objPB = new Pricebook2(
            Id = idPriceBook,
        IsActive = true
            );
        update objPB;
        
        // Create PricebookEntry for the product
        PricebookEntry objPiceBookEntry1 = new PricebookEntry(
            Pricebook2Id = idPriceBook,
        Product2Id = objProd1.Id,
        UnitPrice = 100,
        IsActive = true
            );
        insert objPiceBookEntry1;
        
        PricebookEntry objPiceBookEntry2 = new PricebookEntry(
            Pricebook2Id = idPriceBook,
        Product2Id = objProd2.Id,
        UnitPrice = 100,
        IsActive = true
            );
        insert objPiceBookEntry2;
        
        // Create Opportunity
        Opportunity objOpp = new Opportunity(
            Name = 'Test Opp - 1',
        AccountId = objAcc.Id,
        Type = 'New Customer',
        isActive__c = true,
        Amount = 300000,
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        
        // Force to complete the async method
        Test.startTest();
        insert objOpp;
        Test.stopTest();
        
        // Test Task created or not
        Task objTask = [SELECT Id, WhatId FROM Task WHERE WhatId = :objOpp.Id LIMIT 1];
        System.assert(objTask != null);
        
        // Test product created or not
        System.debug('Opp Id : ' + objOpp);
        System.Debug('Opp LineItem : ' + [SELECT Id, PricebookEntry.Name, Opportunity.Name FROM OpportunityLineItem]);
        List<OpportunityLineItem> lstOppLineItem = [SELECT Id, PricebookEntryId FROM OpportunityLineItem WHERE OpportunityId = :objOpp.Id];
        System.assert(lstOppLineItem.size() == 2);
        
    }
    
    // This method is used to test Batch, create task for Open Opportunity
    @isTest
    static void checkOpportunityOpenOverTimeBatchTest(){
        
        Opportunity objOpp = new Opportunity(
            Name = 'Test Opp - 1',
        isActive__c = true,
        Amount = 300000,
        Test_LastModifiedDate__c = System.now().addDays(-92),
        StageName = 'Negotiation/Review',
        CloseDate = System.today()
            );
        
        insert objOpp;
        Test.startTest();
        
        // Call the Schedulable Bath
        OppertunityOpenOverTimeSchedule objOppSchedule = new OppertunityOpenOverTimeSchedule();
        System.schedule('No Activitivity for 90 days Opportunity', '0 0 0 1 * ?', objOppSchedule);
        
        Test.stopTest();
        
        Task objTask = [SELECT Id FROM Task WHERE WhatId = :objOpp.Id LIMIT 1];
        
        System.assert(objTask != null);
    }
    
    // This mock class is used to mock Currency API response
    public class CurrencyApiMock implements HttpCalloutMock {
        
        public HttpResponse respond(HttpRequest req){
            
            // Create response API
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"rates":{"INR":90.0}}');
            res.setStatusCode(200);
            
            return res;
        }
    }

    // Test Currency Conversion Future Method
    @isTest
    static void testUpdateConvertedAmount(){
        
        // Create Account
        Account objAcc = new Account(
            Name = 'Test Account'
            );
        insert objAcc;
        
        // Create Opportunity
        Opportunity objOpp = new Opportunity(
            Name = 'Test Opp',
        AccountId = objAcc.Id,
        StageName = 'Prospecting',
        CloseDate = System.today(),
        Amount = 9000,
        CurrencyIsoCode = 'INR'
            );
        
        // Set Mock Response
        Test.setMock(HttpCalloutMock.class, new CurrencyApiMock());
        
        Test.startTest();
        
        // Insert Opportunity
        insert objOpp;
        
        Test.stopTest();
        
        // Get Updated Opportunity
        Opportunity objUpdatedOpp = [SELECT Id, Amount, Converted_Amount__c
                                        FROM Opportunity
                                        WHERE Id = :objOpp.Id];
        
        // Assert Converted Amount
        System.assertEquals(
            100,
        objUpdatedOpp.Converted_Amount__c
            );
    }
    
}