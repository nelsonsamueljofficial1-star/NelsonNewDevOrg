/* Purpose: This Apex class is used to handle server logic of create case for crease case from Account and Contact LWC
 * Created By: Nelson Samuel J
 * Created On: 13-06-2026
 */
public with sharing class CreateCaseFromAccAndConLWCController {
    
    // Get Account Related Contact and return as option
    @AuraEnabled
    public static List<Map<String, String>> getAccRelContacts(Id idAcc){
        List<Map<String, String>> lstOptions = new List<Map<String, String>>();
        
        try{
            for (Contact objCon : [SELECT Id, Name FROM Contact WHERE AccountId = :idAcc]) {
                
                Map<String, String> option = new Map<String, String>();
                option.put('label', objCon.Name);
                option.put('value', objCon.Id);
                
                lstOptions.add(option);
            }
            return lstOptions;
            
        } catch(Exception exp){
            throw new AuraHandledException('Error while fetch Account relate Contact  : ' + exp.getMessage());
        }
    }

    // Get Contacts 
    @AuraEnabled
    public static Contact getContactDetails(Id idCon){
        try {
            return [SELECT Id, AccountId, Name FROM Contact WHERE Id = :idCon LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException('Error while fetch Contact Details : ' + e.getMessage());
        }
    }
}