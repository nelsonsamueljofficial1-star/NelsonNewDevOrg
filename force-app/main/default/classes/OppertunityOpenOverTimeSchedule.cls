/* Purpose: This Schedule is used schedule the OppertunityOpenOverTimeBatch monthly first day
 * Created By: Nelson Samuel J
 * Created On: 21-05-2026
 */
public class OppertunityOpenOverTimeSchedule implements Schedulable {
    
    // This method is used to call the OppertunityOpenOverTimeBatch Batch
    public void execute(SchedulableContext context){
        OppertunityOpenOverTimeBatch objOppBatch = new OppertunityOpenOverTimeBatch();

        // Call the Batch
        Database.executeBatch(objOppBatch, 100);
    }
}

// System.schedule('No Activitivity for 90 days Opportunity ', '0 0 0 1 * ?', objOppSchedule);