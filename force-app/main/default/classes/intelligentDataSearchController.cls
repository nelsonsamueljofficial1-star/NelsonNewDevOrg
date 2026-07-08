/* Purpose: This JS file is used to fetch the data for the Intelligent Data Search component in the App page of the user.
 * Created By: Nelson Samuel J
 * Created On: 06-06-2026
 */
public with sharing class intelligentDataSearchController {
    
    @AuraEnabled
    public static List<sObject> executeDynamicSOQL(String strSoql) {
        System.debug('Recieved Query ' + strSoql);
        
        try {
            
            // Validate the SOQL query to prevent injection attacks
            if (isValidSOQL(strSoql)) {
                return Database.query(strSoql);
            } else {
                throw new AuraHandledException('Invalid SOQL query.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error executing SOQL query: ' + e.getMessage());
        }
    }
    
    // Basic validation to ensure the query starts with 'SELECT' and is not null
    private static Boolean isValidSOQL(String soql) {
        return soql != null &&
            soql.trim().toLowerCase().startsWith('select');
    }
    
}