/* Purpose: This handler is used to handle all Lead related Logic
 * Created By: Nelson Samuel J
 * Created On: 22-05-2026
 */
public with sharing class LeadTriggerHandler {
    
    // This method is used to prevent Lead insert or update without valid data
    public static void preventLeadInsertOrUpdate(List<Lead> lstLead, Map<Id, Lead> mapOldLead){
        
        try{
            // Get Queue object
             Group objGroup = [SELECT Id, DeveloperName, Type 
                            FROM Group 
                            WHERE Type = 'Queue'  AND DeveloperName = :System.Label.Lead_Queue_Name  LIMIT 1];

            for(Lead objLead : lstLead){
                Lead objOldLead = mapOldLead != null ? mapOldLead.get(objLead.Id) : null ;
                
                if(objLead.Status == 'Qualified' && (mapOldLead == null ||
                (objLead.AnnualRevenue != objOldLead.AnnualRevenue || objLead.Status != objOldLead.Status || objLead.Company != objOldLead.Company || objLead.Email != objOldLead.Email || objLead.Phone != objOldLead.Phone || objLead.Rating != objOldLead.Rating) )){ // Entry Condition
                    
                    // Show appropriate error to user
                    if(objLead.AnnualRevenue == null || objLead.AnnualRevenue <= 5000000){
                        objLead.AnnualRevenue.addError('Error: Annual Revenue must be greater than 50 Lakhs for Enterprise qualification.');
                    } else if(objLead.Company == null){
                        objLead.Company.addError('Error: Company information is mandatory for qualified leads.');
                    } else if(objLead.Phone == null || objLead.Phone.length() != 10 || !objLead.Phone.isNumeric()){
                        objLead.Phone.addError('Error: Phone should be number and must be 10 digits');
                    } else if(objLead.Email == null || !Pattern.matches('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$', objLead.Email)){
                        objLead.Email.addError('Error: Email should be valid eg: \'compay@gmail.com\'');
                    } else{ 
                        
                        // Valid Lead, Assign rating Hot
                        if(objLead.Rating != 'Hot'){
                        objLead.Rating = 'Hot';
                        }

                        // Assign Queue
                        if(objLead.OwnerId != objGroup.Id){
                            objLead.OwnerId = objGroup.Id;
                        }
                    }                
                }
            }
        }catch(Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin with this Error - ' + exp.getMessage());
        }
    }
    
}