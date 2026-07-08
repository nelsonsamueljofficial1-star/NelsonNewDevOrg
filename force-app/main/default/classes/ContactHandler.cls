/* Purpose: This class is used to handle the contact related operations.
 * Created By: Nelson Samuel J
 * Created On: 03-06-2026
 */
public with sharing class ContactHandler {
    
    @AuraEnabled
    public static List<Contact> getContactsByAccountId(Id accountId) {
        try {
            return [SELECT Id, Name, Phone, Title, Email FROM Contact WHERE AccountId = :accountId];
        } catch (Exception ex) {
            System.debug('Exception in getContactsByAccountId: ' + ex.getMessage());
            return new List<Contact>(); // Return an empty list in case of exception
        }
    }
    
    @AuraEnabled
    public static void deleteContact(Contact objContact) {
        try {
            if (objContact == null || objContact.Id == null) {
                throw new AuraHandledException('Contact object or Contact Id cannot be null');
            }
            delete objContact;
        } catch (Exception ex) {
            System.debug('Exception in deleteContact: ' + ex.getMessage());
            throw new AuraHandledException('Error deleting contact: ' + ex.getMessage());
        }
    }
}