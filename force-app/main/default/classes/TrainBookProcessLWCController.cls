/* Purpose: This class is used to handle all server logic for Train Book Process LWC
 * Created By: Nelson Samuel J
 * Created On: 08-06-2026
 */
public with sharing class TrainBookProcessLWCController {
    
    // This method is used to Create Train Booking Process
    @AuraEnabled
    public static void saveBookingWithPassengers(Train_Booking__c objParentBooking, List<Train_Booking_Person__c> lstChildPassengers) {
        try {

            // 1. Insert Parent Booking Record
            if (objParentBooking != null) {
                insert objParentBooking;
            } else {
                throw new AuraHandledException('Booking data cannot be empty.');
            }
            
            // 2. Map Parent ID to Child Passenger Records
            if (lstChildPassengers != null && !lstChildPassengers.isEmpty()) {
                List<Train_Booking_Person__c> lstPassengerInsert = new List<Train_Booking_Person__c>();
                
                for (Train_Booking_Person__c objPassenger : lstChildPassengers) {
                    // Update 'Train_Booking__c' field to point to your actual Relationship lookup field name
                    objPassenger.Train_Booking__c = objParentBooking.Id;
                    lstPassengerInsert.add(objPassenger);
                }
                
                // 3. Bulk Insert Child Records
                if (!lstPassengerInsert.isEmpty()) {
                    insert lstPassengerInsert;
                }
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}