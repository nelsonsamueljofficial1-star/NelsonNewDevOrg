/* Purpose: This JS file is used to handle change owner in Account record action backends logic
 * Created By: Nelson Samuel J
 * Created On: 11-06-2026
 */
public with sharing class changeOwnerLWCController {
    
    // Get user for Options
    @AuraEnabled(cacheable =true)
    public static List<Map<String, String>> getUser(){
        List<Map<String, String>> lstUserOptions = new List<Map<String, String>>();
        
        try{
            // Query active users to show as dropdown choices
            for (User objUser : [SELECT Id, Name FROM User WHERE IsActive = true AND UserType = 'Standard' ORDER BY Name ASC LIMIT 50]) {
                Map<String, String> mapOption = new Map<String, String>();
                mapOption.put('label', objUser.Name);
                mapOption.put('value', objUser.Id);
                lstUserOptions.add(mapOption);
            }
            
            return lstUserOptions;
        } catch (Exception error) {
            throw new AuraHandledException(error.getMessage());
        }
    }
    
    // Get all Account Related Objects to get size;
    @AuraEnabled (cacheable =true)
    public static Account getAllAccRelatedObject(Id idAcc){
        try{
            Account objAcc = [SELECT Id, Name, 
                            (SELECT Id, Name FROM Opportunities), 
                            (SELECT Id,Name  FROM Contacts), 
                            (SELECT Id FROM Cases) 
                            FROM Account 
                            WHERE Id = :idAcc LIMIT 1];
            return objAcc;
        }  catch (Exception error) {
            throw new AuraHandledException(error.getMessage());
        }
    }
    
    // Change Owner according to Object
    @AuraEnabled
    public static void changeOwner(String strObjName, Id idAcc, Id idOwner) {
        
        List<SObject> lstToUpdate = new List<SObject>();
        try {
            
            // Get List of sObject related to Account
            String strQuery = 'SELECT Id, OwnerId FROM ' + strObjName + ' WHERE AccountId = :idAcc LIMIT 50000';
            List<SObject> lstRecords = Database.query(strQuery);
            
            for(SObject objRec : lstRecords){
                Id currentOwnerId = (Id)objRec.get('OwnerId');
                
                // Skip if already same owner
                if(currentOwnerId == idOwner){
                    continue;
                }
                
                objRec.put('OwnerId', idOwner);
                lstToUpdate.add(objRec);
            }
            
            if(!lstToUpdate.isEmpty()){
                update lstToUpdate;
            }
            
        } catch(Exception error){
            throw new AuraHandledException(error.getMessage());
        }
    }
    
    // Get one user by account Id
    @AuraEnabled (cacheable = true)
    public static Account getOneUserByAcc(Id idAcc){
        try{
            Account objAcc= [SELECT Id, Name, Owner.Name, Owner.Email FROM Account WHERE Id = :idAcc];
            return objAcc;
        }  catch(Exception error){
            throw new AuraHandledException(error.getMessage());
        }
    }
    
    // Send Email to New Change user
    @AuraEnabled
    public static void sendEmailByHtmlFormat(Map<String, String> objEmailDatas){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        
        System.debug('Apex Data ' + objEmailDatas);
        try {
            Id idAcc = (Id)objEmailDatas.get('AccountId');
            
            // To get New Owner Email
            Account objAcc = [SELECT Owner.Email FROM Account WHERE Id = :idAcc LIMIT 1];
            
            System.debug('Apex Account ' + objAcc);
            
            mail.setToAddresses(new String[] { objAcc.Owner.Email });
            mail.setSubject('Account Ownership Changed - ' + objEmailDatas.get('Account'));
            
            // Build Html body
            String strHtmlBody = '<html>'
                + '<body>'
                + '<p> Hello '+ objEmailDatas.get('NewUserName') + '</p>'
                + '<p> You are now the new owner of the following account </p>'
                + '<table  cellpadding="10" style= "width:100%; border:2px solid black; border-collapse: collapse;">'
                + '<tr> <td style="border:2px solid black;"><strong> Account Name: </strong></td> <td style="border:2px solid black;"> ' + objEmailDatas.get('Account') + '</td>'
                + '</tr>'
                + '<tr> <td style="border:2px solid black;"> <strong> Previous Owner: </strong> </td> <td style="border:2px solid black;"> ' + objEmailDatas.get('PreviousUserName') + '</td>'
                + '</tr>'
                + '<tr> <td style="border:2px solid black;"> <strong> New Owner </strong> </td> <td style="border:2px solid black;"> ' + objEmailDatas.get('NewUserName') + '</td>'
                + '</tr>'
                + '<tr> <td style="border:2px solid black;"> <strong> Transfer Date </strong> </td> <td style="border:2px solid black;"> ' + System.now().format('MMMM d, yyyy hh:mm a') + '</td>'
                + '</tr>'
                + '<tr>'
                + '<td colspan="2" style="border:2px solid black;">'
                + '<h3>Related Records Reassigned: </h3>'
                + '<ul>';
            
            // Check if User Click or not if user clicks show data
            if(objEmailDatas.get('bolContacts') == 'true'){
                strHtmlBody += '<li> Contacts: ' + objEmailDatas.get('ContactCount') + '</li>';
            }
            if(objEmailDatas.get('bolOpportunities') == 'true'){
                strHtmlBody  += '<li> Opportunities: ' + objEmailDatas.get('OpportunityCount') + '</li>';
            }
            if(objEmailDatas.get('bolCases') == 'true'){
                strHtmlBody += '<li> Cases: ' + objEmailDatas.get('CaseCount') + '</li>';
            }
            strHtmlBody += '</ul>'
                + '</td>'
                + '</tr>'
                + '</table>'
                + '<p> Please log in to Salesforce to view the records </p>'
                + '<br/>'
                + '<p> Thank you, </p>'
                + '<p> Salesforce Team </p>'
                + '</body>'
                + '</html>';
            
            // System.debug('Html Data ' + strHtmlBody);
            mail.setHtmlBody(strHtmlBody);
            
            Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            
            if(results[0].isSuccess()){
                System.debug('Sending Email to: ' + objAcc.Owner.Email);
                System.debug('Email Sent Successfully');
            } else {
                System.debug('Email Failed: ' +
                    results[0].getErrors()[0].getMessage());
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}