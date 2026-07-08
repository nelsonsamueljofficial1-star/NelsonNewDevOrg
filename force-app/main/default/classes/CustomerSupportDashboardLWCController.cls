/* Purpose: This JS file is used to handle the Customer Support Dashboard backend Logics.
 * Created By: Nelson Samuel J
 * Created On: 15-06-2026
 */
public with sharing class CustomerSupportDashboardLWCController {
    
    // Get All Case Details
    @AuraEnabled
    public static List<Case> getComplaints() {
        try {
            
            // Query to fetch all complaints (Cases) from the database
            List<Case> lstComplaints = [SELECT Id, CaseNumber, Account.Name, Subject, Status, Priority, Owner.Name, CreatedBy.Name, CreatedDate 
                                        FROM Case 
                                        LIMIT 50000];
            return lstComplaints;
        } catch (Exception e) {
            
            // Handle any exceptions that occur during the query
            throw new AuraHandledException('Error fetching complaints: ' + e.getMessage());
        }
    }
    
    // Check for related contacts of the selected account
    @AuraEnabled
    public static Integer checkRelatedContacts(Id accountId) {
        try {
            if (accountId == null) {
                return 0;
            }
            
            return [
                SELECT COUNT() 
                FROM Contact 
                WHERE AccountId = :accountId
                WITH USER_MODE
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error running account contact confirmation: ' + e.getMessage());
        }
    }
    
    // Update selected Case to close
    @AuraEnabled
    public static void closeSelectedComplaints(List<Id> caseIds){
        try {
            if (caseIds == null || caseIds.isEmpty()) {
                return;
            }
            
            List<Case> casesToUpdate = new List<Case>();
            for (Id caseId : caseIds) {
                casesToUpdate.add(new Case(
                    Id = caseId,
                Status = 'Closed'
                    ));
            }
            
            if (!casesToUpdate.isEmpty()) {
                update casesToUpdate;
            }
            
        } catch (Exception error) {
            throw new AuraHandledException(error.getMessage());
        }
    }
    
}