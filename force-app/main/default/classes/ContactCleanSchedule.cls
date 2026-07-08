/* Purpose: This Schedule is used to call the ContactCleanBatch every start month
 * Created By: Nelson Samuel J
 * Created On: 23-05-2026
 */
public class ContactCleanSchedule implements Schedulable{

    // This execute Method is used to call the Batch
    public void execute(SchedulableContext context){
        ContactCleanBatch objConBatch = new ContactCleanBatch();
        Database.executeBatch(objConBatch, 50);
    }

}
//  System.schedule('Clean the Contact', '0 0 0 1 * ?', schedulable);