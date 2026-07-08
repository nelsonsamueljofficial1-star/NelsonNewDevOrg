/* Purpose: This Class is used to Handle Generate Certificate and get all data in UI and show Certificate
 * Created By: Nelson Samuel J
 * Created On: 18-06-2026
 */
public with sharing class GenerateCertificateController {
    
    public GenerateCertificateController.CertificateWrapper objCertData { get; set; }
    public String strRenderMode { get; set; }
    public String formattedCompletionDate { get; set; }
    public String strToday { get; set; }
    
    public GenerateCertificateController() {
        
        // Initialise the object
        objCertData = new GenerateCertificateController.CertificateWrapper();
        strRenderMode = null;
        
        // Format Date
        DateTime todayDT = DateTime.newInstance(Date.today(), Time.newInstance(0, 0, 0, 0));
        strToday = todayDT.format('dd MMMM yyyy');
    }
    
    // Change the render string to pdf to visualise the pdf
    public PageReference generateCertificate() {
        strRenderMode = 'pdf';

         if (String.isNotBlank(objCertData.CompletionDate)) {
            try {
                Date d = Date.valueOf(objCertData.CompletionDate);
                DateTime dt = DateTime.newInstance(d, Time.newInstance(0, 0, 0, 0));
                formattedCompletionDate = dt.format('dd MMMM yyyy');
            } catch(Exception e) {
                formattedCompletionDate = objCertData.CompletionDate;
            }
        }
        return null;
    }
    
    // Wrapper Call declaration
    public class CertificateWrapper {
        public String StudentName { get; set; }
        public String CourseName { get; set; }
        public String BatchNumber { get; set; }
        public String CompletionDate { get; set; }
        public String TrainerName { get; set; }
    }
}