/* Purpose: This Apex class is used to handle server logic of create multiple contacts
 * Created By: Nelson Samuel J
 * Created On: 13-06-2026
 */
public with sharing class createMultipleContactsLWCController {
    
    // Create list of contacts
    @AuraEnabled
    public static void createLstContact(List<Contact> lstContacts){
        try{
            if(!lstContacts.isEmpty()){
                insert lstContacts;
            }
        } catch(Exception exp){
            throw new AuraHandledException('Error in List of Contact Creation Error : ' + exp.getMessage());
        }
    }
    
    // Get all account related contacts
    @AuraEnabled (cacheable=true)
    public static List<Contact> getRelatedContactEmail(Id idAcc){
        try{
            List<Contact> lstCon = [SELECT Email FROM Contact WHERE AccountId = :idAcc];
            return lstCon;
        } catch(Exception exp){
            throw new AuraHandledException('Error in List of Contact Creation Error : ' + exp.getMessage());
        }
    }
}