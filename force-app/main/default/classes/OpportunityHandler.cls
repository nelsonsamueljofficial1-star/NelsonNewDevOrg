/* Purpose: Opportunity handler is used to implements all logic related to Opportunity
 * Created By: Nelson Samuel J
 * Created On: 21-05-2026
 */
public with sharing class OpportunityHandler {
    
    // This method is used to change Account priority to high when High Opportunity created under related Account.
    public void updateAccountPriorityToHigh(List<Opportunity> lstNewOpp, Map<Id, Opportunity> mapOldOpp){
        Set<Id> setAccId = new Set<Id>();
        
        try{
            for(Opportunity objOpp : lstNewOpp){
                Opportunity objOldOpp = mapOldOpp != null ? mapOldOpp.get(objOpp.Id) : null ;
                
                // store Account Id, which moved to Negotiation stage and Amount > 1 lakh
                if(objOpp.StageName == 'Negotiation/Review' && objOpp.Amount > 100000 && objOpp.isActive__c && (objOldOpp == null ||
                objOldOpp.StageName != objOpp.StageName)){
                    if(objOpp.AccountId != null){
                        setAccId.add(objOpp.AccountId);
                    }
                }
                
            }
            
            // store particular Account data which not change to High priority
            List<Account> lstUpdateAcc = [SELECT Id, Priority__c  
                                    FROM Account
                                    WHERE Id IN :setAccId AND Priority__c != 'High'];
            
            // update to high priority Account
            if(lstUpdateAcc != null && lstUpdateAcc.size() > 0){
                for(Account objAcc :  lstUpdateAcc){
                    objAcc.Priority__c = 'High';
                }
                
                update lstUpdateAcc;
            }
            
        } catch(Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin Regarding this issue - ' + exp.getMessage());
        }
    }
    
    // This method is used to change Account priority to Normal when Opportunity stage move to closed won or closed lost.
    public void updateAccountPriorityToNormal(List <Opportunity> lstNewOpp, Map<Id, Opportunity> mapOldOpp){
        Set<Id> setAccId = new Set<Id>();
        
        try{
            for(Opportunity objOpp : lstNewOpp){
                Opportunity objOldOpp = mapOldOpp != null ? mapOldOpp.get(objOpp.Id) : null ;
                
                // store Account Id, which moved to Closed Won or Closed Lost stage and Amount > 1 lakh
                if((objOpp.StageName == 'Closed Won' || objOpp.StageName == 'Closed Lost') && objOpp.Amount > 100000 && objOpp.isActive__c && (objOldOpp == null ||
                objOldOpp.StageName != objOpp.StageName)){
                    if(objOpp.AccountId != null){
                        setAccId.add(objOpp.AccountId);
                    }
                }
            }
            
            // Remove accountId which account have high related opporunity
            if(setAccId != null && setAccId.size() > 0){
                for(Opportunity objOpp : [SELECT Id, AccountId, StageName, isActive__c , Amount 
                                FROM Opportunity 
                                WHERE AccountId IN :setAccId AND StageName = 'Negotiation/Review' AND isActive__c = true AND Amount > 100000]){
                    if(setAccId.contains(objOpp.AccountId)){
                        setAccId.remove(objOpp.AccountId);
                    }
                }
            }
            
            // Store particular Account data which not change to Normal priority
            List<Account> lstUpdateAcc = [SELECT Id, Priority__c  
                                    FROM Account
                                    WHERE Id IN :setAccId AND Priority__c != 'Normal'];
            
            // Update to Normal priority Account
            if(lstUpdateAcc != null && lstUpdateAcc.size() > 0){
                for(Account objAcc :  lstUpdateAcc){
                    objAcc.Priority__c = 'Normal';
                }
                
                update lstUpdateAcc;
            }
            
        } catch(Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin Regarding this issue - ' + exp.getMessage());
        }
        
    }
    
    // This method is used to update Account Priority to Normal when High Opportunity Delete
    public void updateAccountPriorityOppDelete(List <Opportunity> lstOldOpp){
        Set<Id> setAccId = new Set<Id>();
        
        try{
            for(Opportunity objOpp : lstOldOpp){
                
                // store Account Id, which Negotiation stage and Amount > 1 lakh Opportunity deleted
                if(objOpp.StageName == 'Negotiation/Review' && objOpp.Amount > 100000 && objOpp.isActive__c ){
                    if(objOpp.AccountId != null){
                        setAccId.add(objOpp.AccountId);
                    }
                }
            }
            
            // Remove accountId which account have high related opporunity
            if(setAccId != null && setAccId.size() > 0){
                for(Opportunity objOpp : [SELECT Id, AccountId, StageName, isActive__c , Amount 
                                FROM Opportunity 
                                WHERE AccountId IN :setAccId AND StageName = 'Negotiation/Review' AND isActive__c = true AND Amount > 100000]){
                    if(setAccId.contains(objOpp.AccountId)){
                        setAccId.remove(objOpp.AccountId);
                    }
                }
            }
            
            // store particular Account data which not change to Normal priority
            List<Account> lstUpdateAcc = [SELECT Id, Priority__c  
                                    FROM Account
                                    WHERE Id IN :setAccId AND Priority__c != 'Normal'];
            
            // update to Normal priority Account
            if(lstUpdateAcc != null && lstUpdateAcc.size() > 0){
                for(Account objAcc :  lstUpdateAcc){
                    objAcc.Priority__c = 'Normal';
                }
                
                update lstUpdateAcc;
            }
            
        } catch(Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin Regarding this issue - ' + exp.getMessage());
        }
        
    }
    
    // This method is used to call the future method to assign Product and create Task
    public void assignProductAndCreateTask(List<Opportunity> lstOpp){
        List<Id> lstId = new List<Id>();
        
        // Assign id
        for(Opportunity objOpp : lstOpp){
            if(objOpp.Type == 'New Customer' && objOpp.Amount > 10000){
                lstId.add(objOpp.Id);
            }
        }
        
        // Call the Future method to create Product and Create Task
        if(lstId != null && lstId.size() > 0){
            OpportunityHandler.createProductAndTaskFuture(lstId);
        }
        
    }
    
    // This future method is used to create product and Task when Opportunity created
    @Future
    public static void createProductAndTaskFuture(List<Id> lstOppId){
        List<Task> lstTask = new List<Task>();
        List<OpportunityLineItem> lstAllLineItems = new List<OpportunityLineItem>();
        
        try{
            // Get New Opportunity using give Id
            List<Opportunity> lstOpp = [SELECT Id, OwnerId, Type, Amount
                                    FROM Opportunity
                                    WHERE Id IN :lstOppId];
            
            // Get 1 standard PriceBook
            Pricebook2 objPriceBook = [SELECT Id, Name  FROM Pricebook2 WHERE IsStandard = TRUE AND IsActive = true LIMIT 1];
            System.debug('Handler : ' + objPriceBook);
            
            // Get 2 active PriceBookEntry related to standard Price Book
            List<PricebookEntry> lstPriceBookEntry = [SELECT Id, Name, Pricebook2Id, IsActive, UnitPrice 
                                                    FROM PricebookEntry 
                                                    WHERE Pricebook2Id = :objPriceBook.Id AND IsActive = true LIMIT 2];
            System.debug('Entry : ' + lstPriceBookEntry);
            
            // Set price book Id to Opportunity
            for(Opportunity objOpp : lstOpp){
                objOpp.Pricebook2Id = objPriceBook.Id;
            }
            update lstOpp;
            
            for(Opportunity objOpp : lstOpp){
                
                // call this method to create OpportunityLineItem and store all in list
                List<OpportunityLineItem> lsOppLineItem = OpportunityHandler.createOppLineItems(objOpp.Id, lstPriceBookEntry);
                lstAllLineItems.addAll(lsOppLineItem);
                
                // Create task
                Task objTask = new Task(
                    OwnerId = objOpp.OwnerId,
                WhatId = objOpp.Id,
                Subject = 'Review and Validate the Opportunity Line Items'
                    );
                lstTask.add(objTask);
            }
            
            // Insert products for all new Opportunity
            if(lstAllLineItems != null && lstAllLineItems.size() > 0){
                insert lstAllLineItems;
            }
            
            // Insert Task for all new Opportnity
            if(lstTask != null && lstTask.size() > 0){
                insert lstTask;
            }
            
        } catch(Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin Regarding this issue - ' + exp.getMessage());
        }
        
    }
    
    // This method is used to create Opportunity Line Items.
    public static List<OpportunityLineItem> createOppLineItems(Id idOpp, List<PricebookEntry> lstPriceBookEntry){
        List<OpportunityLineItem> lstOppLineItem = new List<OpportunityLineItem>();
        
        for(PricebookEntry objPriceBookEntry : lstPriceBookEntry){
            OpportunityLineItem objOppLineItem = new OpportunityLineItem();
            objOppLineItem.OpportunityId = idOpp;
            objOppLineItem.PricebookEntryId = objPriceBookEntry.Id;
            objOppLineItem.Quantity = 1;
            objOppLineItem.UnitPrice = objPriceBookEntry.UnitPrice;
            
            lstOppLineItem.add(objOppLineItem);
        }
        
        return lstOppLineItem;
    }
    
    // This method is used to call the Future method to convert Amount
    public static void updateConvertedAmount(List<Opportunity> lstOpp){
        Set<Id> setOppId = new Set<Id>();
        
        for(Opportunity objOpp : lstOpp){
            if(objOpp.CurrencyIsoCode.contains('INR') && objOpp.Amount != null){
                setOppId.add(objOpp.Id);
            }
        }
        
        if(setOppId != null && setOppId.size() > 0){
            OpportunityHandler.updateOppAmountFuture(setOppId);
        }
    }
    
    // Future method : This method is used to Convert Opportunity ammount
    @Future(callout = true)
    public static void updateOppAmountFuture(Set<Id> setOppId){
        
        // Create HttpObject
        Http objHttp = new Http();
        
        // Create HttpRequest
        HttpRequest objRequest = new HttpRequest();
        
        // It return API exchange rates
        objRequest.setEndpoint('https://open.er-api.com/v6/latest/USD');
        
        // Set only get Data
        objRequest.setMethod('GET');
        try{
            // It send request and get Data
            HttpResponse objResponse = objHttp.send(objRequest);
            System.debug('Http Response : ' + objResponse);
            
            // Convert JSON String into Map
            Map<String, Object> mapResponse = (Map<String, Object>)JSON.deserializeUntyped(objResponse.getBody());
            System.debug('Get Body in map : ' + mapResponse);
            
            // Get Rate section
            Map<String, Object> mapRates = (Map<String, Object>)mapResponse.get('rates');
            System.debug('Rate Map : ' + mapRates);
            
            // Store INR rate
            Decimal decINRRate = Decimal.valueOf(String.valueOf(mapRates.get('INR')));
            
            // Get Opportunities
            List<Opportunity> lstOpp = [SELECT Id, Amount, Converted_Amount__c
                                    FROM Opportunity
                                    WHERE Id IN :setOppId];
            
            // Convert Amount for Each
            for(Opportunity objOpp : lstOpp){
                Decimal decUSD = objOpp.Amount / decINRRate;
                objOpp.Converted_Amount__c = decUSD.setScale(2);
            }
            
            update lstOpp;
        } catch(Exception exp){
            System.debug('Error : ' + exp.getMessage());
        }
    }
    
    // This method is used to get all related Opportunity by account Id
    @AuraEnabled
    public static List<Opportunity> getAllRelatedOpportunity(Id idAccId){
        try{
            if(idAccId != null){
                return [SELECT Id, Name, StageName, Amount, ownerId, CloseDate
                    FROM Opportunity 
                    WHERE AccountId = :idAccId];
            } else {
                throw new AuraHandledException('Account Id is null, Kindly provide valid Account Id');
            }
        } catch(Exception exp){
            throw new AuraHandledException('Kinldy report to System Admin Regarding this issue - ' + exp.getMessage());
        }
    }
}