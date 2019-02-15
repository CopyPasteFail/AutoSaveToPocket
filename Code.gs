// ===========================================================================
// POCKET - AUTOMATICALLY ADD NEW ARTICLES FROM SUBSCRIBED BLOGS TO POCKET
// ===========================================================================

/* This script will automatically add new articles from the the subscribed blogs to Pocket */


// ------------------------------------------------------------------------------------------------------------------------------
// Set variables
// ------------------------------------------------------------------------------------------------------------------------------
  
// Set email search criteria. Written just like a gmail search.
var emailQueries = [];
// The label name under the blogs mail can be found:
var emailLabel = 'podcasts---blogs';
// The name of the blogs as appear as sender in the email
var blogsNameArray = ['(בעיקר כלכלה‎)', '(המדריך לעתיד - הבלוג של ד ר רועי צזנה‎)', "(מורה בפיג'מה)", "(דעת מיעוט)"];
var emailQueryString = BuildEmailQueryString();
emailQueries.push(emailQueryString);
var pocketSaveToemailAddress = 'add@getpocket.com'

// Set Google Sheets IDs for logging (comment out if not needed along with logging section below)
var logSpreadsheetId = '1Yw9oBp-m6duPf14LUydrKXJucVa97sywUrC4NFfoZAk'; // For logging playlist additions
var errSpreadsheetId = '1bVK5FoxtYvIwz0JgpNQeUU6HMHELSIH-9BGAiKJSn5s'; // For logging errors - using same doc as above but different tab

// Get date var for logging
var currentTime = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss" ) // change the timezone if you need to

// Set regex to find the article link in email - you shouldn't need to change this.
//  var regExpString = '(href="(.*?)"..קרא עוד מהפוסט הזה)';
var regExpString = '(להמשך קריאה..href="(.*?)")|(href="(.*?)"..קרא עוד מהפוסט הזה)';
var regexp = new RegExp(regExpString);


// Run this function once to grant script access and add trigger automatically.
// Automatically adds new subscription videos from youtube to watch later list (if you have email notifications for those turned on)
function CreateAddNewPostsToPocketTrigger()
{
  ScriptApp.newTrigger('AddNewPostsToPocket')
  .timeBased()
  .everyHours(6)    // Runs script every X days/hours/min...
  .create();
}



function AddNewPostsToPocket()
{
  // For debugging
  Logger.log('regExpString: "' + regExpString + '"');
  Logger.log('Email Search: ' + emailQueries);
  Logger.log('Log Sheet: ' + logSpreadsheetId);
  Logger.log('Error Log Sheet: ' + errSpreadsheetId);
  Logger.log('Date_Time: ' + currentTime);


  // ------------------------------------------------------------------------------------------------------------------------------
  // Search email for YouTube emails
  // ------------------------------------------------------------------------------------------------------------------------------ 

  // Search email based on criteria set above
  var threads = [];
  for(var queryIndex = 0; queryIndex < emailQueries.length; queryIndex++)
  {
    if(queryIndex == 0)
    { // for first email search query
      threads = GmailApp.search(emailQueries[queryIndex]);
    }
    else
    { // for successive search criteria
      var additionalThreads = GmailApp.search(emailQueries[queryIndex]);
      for(var i in additionalThreads)
      {
        threads.push(additionalThreads[i]);
      }
    }
  }
//  Utilities.sleep(1000); // Required to avoid YT error about too many calls too close together
  Logger.log('#' + threads.length + ' Emails found'); // For debugging
  AppendToLogSpreadsheet(currentTime, "", "", "Found " + threads.length + " emails to parse");

  
  // ------------------------------------------------------------------------------------------------------------------------------
  // Process YouTube emails and add videos to playlists
  // ------------------------------------------------------------------------------------------------------------------------------ 
 
  // For each email in results of email search, process any video ID
  for (var i in threads)
  {
    try
    {      
      messages = threads[i].getMessages()
      for (var k in messages)
      {
        Logger.log('Email #: ' + (parseInt(k)+1) + ' of ' + threads.length);  // For debugging
        
        var msg = messages[k];
        var subject = messages[k].getSubject();
        var from = messages[k].getFrom();
//        Logger.log('Mail body: ' + msg.getBody());  // For debugging
        var linksRegExResults = regexp.exec(msg.getBody());
        var linkToSave;
        
        if (linksRegExResults != null)
        {
          for(var match = 0; match < linksRegExResults.length; match++)
          {
            try
            {
              //convert '&amp;' to '&'
              linksRegExResults[match] = linksRegExResults[match].replace(/amp;/g,'');
            }
            catch(e)
            {
              Logger.log('"' + linksRegExResults[match] + '" - Not a valid string, skipping to next one');
              AppendToErrorSpreadsheet(e);
              continue;
            }

            Logger.log('linksRegExResults['+match+']: "' + linksRegExResults[match] + '"');  // For debugging
            
            try
            {
              // check validity of URL
              var response = UrlFetchApp.fetch(linksRegExResults[match], { 
                muteHttpExceptions: true,
                validateHttpsCertificates: false,
                followRedirects: true 
              });
              
              var siteStatus = response.getResponseCode(); 
              Logger.log('siteStatus: ' + siteStatus);
            }
            catch(e)
            {
              Logger.log('"' + linksRegExResults[match] + '" - Not a valid URL, skipping to next one');
              AppendToErrorSpreadsheet(e);
              continue;
            }

            linkToSave = linksRegExResults[match];
            break;
          }
          
          if (linkToSave != null)
          {
            Logger.log('Found a valid URL - "' + linkToSave + '"');  // For debugging
            
            // Logging (comment out if not needed)
            AppendToLogSpreadsheet(currentTime, from, subject, linkToSave);
            
            // send the link to Pocket - cost 100 units
            MailApp.sendEmail(pocketSaveToemailAddress, "", linkToSave);
            
            // Marks notification email as read and archives it
            threads[i].markRead();    // Comment line if you don't want to mark email as read in gmail after processing
            //    threads[i].moveToArchive();    // Uncomment line if you want to archive notification emails. 
          }
        }
      } // end of message loop
      
    } //end try
    // This logs any errors in a Drive sheet. Set sheet ID at top of function.
    catch(e)
    {
      Logger.log(e.message);
      AppendToErrorSpreadsheet(e);
    }
  } // end of threads loop 
} // end of function

function AppendToErrorSpreadsheet(e)
{
    Logger.log(e.message);
    var errorSheet = SpreadsheetApp.openById(errSpreadsheetId).getSheets()[0];
    lastRow = errorSheet.getLastRow();
    var cell = errorSheet.getRange('A1');
    cell.offset(lastRow, 0).setValue(currentTime);
    cell.offset(lastRow, 1).setValue(e.message);
    cell.offset(lastRow, 2).setValue(e.fileName);
    cell.offset(lastRow, 3).setValue(e.lineNumber);
}

function AppendToLogSpreadsheet(currentTime, from, subject, linkToSave)
{
  var logSheet = SpreadsheetApp.openById(logSpreadsheetId).getSheets()[0];
  lastRow = logSheet.getLastRow();
  var cell = logSheet.getRange('A1');
  cell.offset(lastRow, 0).setValue(currentTime);  // Email processed time
  cell.offset(lastRow, 1).setValue(from);  // 
  cell.offset(lastRow, 2).setValue(subject);  // Email subject
  cell.offset(lastRow, 3).setValue(linkToSave);  // link To Save
}

function BuildEmailQueryString()
{
  var emailQueryString = "label:" + emailLabel + " is:unread from:{‎";
  var index = 0;
  for(; index < blogsNameArray.length-1; index++)
  {
    emailQueryString = emailQueryString + blogsNameArray[index] + " OR ";
  }
  emailQueryString = emailQueryString + blogsNameArray[index] + "}";
  return emailQueryString;
}
