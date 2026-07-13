/* Purpose: This class is used to handle the case related logic
 * Created By: Nelson Samuel J
 * Created On: 03-06-2026
 */
public with sharing class CaseHandler {
    
    // Wrapper Class
    public class SameCaseCheckWrapper {
        @AuraEnabled public Boolean bolIsSameCase;
    }
    
    // Check the same case subject under same contact
    @AuraEnabled
    public static SameCaseCheckWrapper checkSameCaseSubject(Case objCase){
        SameCaseCheckWrapper objWrapper = new SameCaseCheckWrapper();
        try{
            List<Case> lstCase = [SELECT Id, CaseNumber,Description,Subject FROM Case WHERE ContactId = :objCase.ContactId AND Subject = :objCase.Subject];
            if(lstCase.size() > 0){
                objWrapper.bolIsSameCase = true;
            } else {
                objWrapper.bolIsSameCase = false;
            }
        }catch(Exception ex){
            System.debug('Exception in checkSameCaseSubject: ' + ex.getMessage());
            objWrapper.bolIsSameCase = false; // Default to false in case of exception
        }
        return objWrapper;
    }
    
    // Method to create a new case
    @AuraEnabled
    public static Case createCase(Case objCase){
        // throw new AuraHandledException('Testing Error Message');
        try{
            if(objCase == null){
                throw new AuraHandledException('Case object cannot be null');
            }
            insert objCase;
            return objCase;
        }catch(Exception ex){
            System.debug('Exception in createCase: ' + ex.getMessage());
            throw new AuraHandledException('Error creating case: ' + ex.getMessage());
        }
    }
}