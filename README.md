# AutoSaveToPocket
Automatically add new articles from subscribed blogs to Pocket

## Description 
This script will automatically add new posts on subscribed blogs (typically worpress based) to Pocket.
You need to be subscribed to the blogs with email notifications.

## Instructions
Visit script.google.com to open the script editor. (You'll need to be signed in to your Google account.) If this is the first time you've been to script.google.com, you'll be redirected to a page that introduces Apps Script. Click Start Scripting to proceed to the script editor.
A welcome screen will ask what kind of script you want to create. Click Blank Project.
Delete any code in the script editor and paste in the code and file names in this project.

Enable the YouTube Data API, Gmail API & Drive API...
Go to menu 'Resources' -> 'Advanced Google Services' and turn on 'YouTube Data API', etc.
On first run you'll get a warning about not having the relevant APIs enabled. Follow the link in the warning to get to the Google API Console and enable the YouTube Data API for your project.
Do same on Google Cloud Platform with an assosiated project.

## How It Works
Using the Gmail API, the script searches for unread email from new blog posts under a certain label, extract the link and save it to Pocket.

## Google Quota
Each API operation has a quota, the cost for each operation is mentioned in a comment

## Maintainers
This project is mantained by:
* [Omer Reznik](http://github.com/GipsyBeggar)

## Contributing
1. Fork it
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -m 'Add some feature')
4. Push your branch (git push origin my-new-feature)
5. Create a new Pull Request

## License
This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details
