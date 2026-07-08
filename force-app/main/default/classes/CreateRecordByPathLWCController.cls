/* Purpose: This class is used to handle all server logic for createRecordByPathLWC
 * Created By: Nelson Samuel J
 * Created On: 09-06-2026
 */
public class CreateRecordByPathLWCController {
    
    // This method is used to get all Fields which select
    @AuraEnabled
    public static List<Map<String,String>>  getFields(String strObjectName){
        List<Map<String,String>> lstFields = new List<Map<String,String>>();
        try {
            if(!String.isBlank(strObjectName)){
                
                // Get Fields
                Map<String, Schema.SObjectField> mapField =
                    Schema.getGlobalDescribe()
                    .get(strObjectName)
                    .getDescribe()
                    .fields.getMap();
                
                // Get Label and Field and assign in list of object
                for(String strApiName : mapField.keySet()) {
                    
                    Schema.DescribeFieldResult dfr =
                        mapField.get(strApiName).getDescribe();
                    
                    lstFields.add(
                    new Map<String,String>{
                        'label' => dfr.getLabel(),
                        'value' => dfr.getName()
                    }
                    );
                }
            } else {
                throw new AuraHandledException('Object Should not be null');
            }
            
            return lstFields;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // This method is used to get all objects
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getAllObjects() {
        
        List<Map<String,String>> lstObjects = new List<Map<String,String>>();
        
        Map<String, Schema.SObjectType> objMap = Schema.getGlobalDescribe();
        
        for(String strApiName : objMap.keySet()) {
            Schema.DescribeSObjectResult dObj = objMap.get(strApiName).getDescribe();
            
            if (dObj.isQueryable() && dObj.isCreateable() && !strApiName.endsWith('__feed') && !strApiName.endsWith('__history')) {
                lstObjects.add(
                new Map<String,String>{
                    'label' => dObj.getLabel(),
                    'value' => dObj.getName()
                }
                );
            }
        }
        
        return lstObjects;
    }
}