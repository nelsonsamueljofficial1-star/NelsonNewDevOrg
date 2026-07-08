/* Purpose: This Class is used to Handle Contact Create VF page
 * Created By: Nelson Samuel J
 * Created On: 16-06-2026
 */
public with sharing class createContactVFHandler {
    
    public Contact newContact { get; set; }
    private Id currentAccountId;
    
    public createContactVFHandler() {
        this.newContact = new Contact();
        this.currentAccountId = ApexPages.currentPage().getParameters().get('id');
    }
    
    public PageReference saveContact() {
        try {
            // Automatically capture the Parent Account ID from the current page context
            newContact.AccountId = this.currentAccountId;
            
            insert newContact;
            
            // Navigation 
            PageReference accountPage = new PageReference('/' + currentAccountId);
            
            // Clear the Page Cache
            accountPage.setRedirect(true);
            
            // Fire the redirection command sequence directly to the user's browser viewport
            return accountPage;
        } catch(Exception e) {
            
            // Catch formatting errors or validation rule exceptions gracefully
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, e.getMessage()));
            return null;
        }
    }
}