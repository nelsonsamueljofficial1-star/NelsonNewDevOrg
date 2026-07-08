/* Purpose: This JS file is used to show the Account and related contact details in the Home page of the user.
 * Created By: Nelson Samuel J
 * Created On: 05-06-2026
 */
public with sharing class AccountAndRelatedContact {
    
    @AuraEnabled
    public static List<Account> getAccountAndRelatedContactDetails() {
        try{
            List<Account> accountList = [SELECT Id, Name, (SELECT Id, Name FROM Contacts) FROM Account];
            return accountList;
        } catch(Exception e) {
            throw new AuraHandledException('Error fetching account and related contact details: ' + e.getMessage());
        }
    }
    
}