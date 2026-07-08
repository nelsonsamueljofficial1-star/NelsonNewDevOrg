/* Purpose: This class is used to handle all server logic for PB Banks
 * Created By: Nelson Samuel J
 * Created On: 10-06-2026
 */
public with sharing class PbBanksLWCController {
    
    // This method is used to validate Loginner and return the object
    @AuraEnabled
    public static Object checkValidCustomer(String strCustomerId, Integer strPinNumber){
        try {
            Contact objCon = [SELECT Id, LastName FROM Contact WHERE LastName = :strCustomerId AND Pin_Number__c = :strPinNumber LIMIT 1];
            return objCon;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // This method is used to get Amount by Account type and Customer Id
    @AuraEnabled
    public static Object getBankAcc(Id idCustomer, String strCustomerType){
        try {
            Bank_Account__c objBankAcc = [SELECT Id,Amount__c ,Account_Type__c, Contact__c  
                                        FROM Bank_Account__c  
                                        WHERE Account_Type__c = :strCustomerType AND Contact__c = :idCustomer LIMIT 1];
            return objBankAcc;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // This method is used to get History Data
    @AuraEnabled
    public static List<Object> getBankHistory(Id idCustomer, String strStartDate, String strEndDate){
        
        // Dynamic Query
        String strQuery =
            'SELECT Bank_Account__r.Account_Type__c, Amount__c, Created_Date__c, Transaction_Type__c ' +
            'FROM Bank_Account_History__c ' +
            'WHERE Bank_Account__r.Contact__c = \'' + idCustomer + '\'';
        
        // From start date onwards
        if (String.isNotBlank(strStartDate)) {
            Date datStart = Date.valueOf(strStartDate.trim());
            strQuery += ' AND Created_Date__c >= :datStart';
        }
        
        // Until end date
        if (String.isNotBlank(strEndDate)) {
            Date datEnd = Date.valueOf(strEndDate.trim());
            strQuery += ' AND Created_Date__c <= :datEnd';
        }
        
        // Order transactions by newest first
        strQuery += ' ORDER BY CreatedDate DESC';
        
        try {
            List<Bank_Account_History__c>  lstBankAccHistory = Database.query(strQuery);
            return lstBankAccHistory;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}