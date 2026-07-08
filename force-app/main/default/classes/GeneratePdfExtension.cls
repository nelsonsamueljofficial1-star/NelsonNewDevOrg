/* Purpose: This Class is used to Handle Generate pdf and get size of contact
 * Created By: Nelson Samuel J
 * Created On: 18-06-2026
 */
public class GeneratePdfExtension {
    
    // Get Account object
    public Account objAcc;
    
    // Get Contact count
    public Integer intContactCount { get; set; }
    
    // Constructor to get Account and find related contact count
    public GeneratePdfExtension(ApexPages.StandardController stdController) {
        this.objAcc = (Account)stdController.getRecord();
        
        this.intContactCount = [SELECT COUNT() FROM Contact WHERE AccountId = :objAcc.Id];
    }
}