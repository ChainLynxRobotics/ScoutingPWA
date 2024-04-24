# C.L.A.W. (**C**hain **L**ynx **A**nalytics **W**ebtool)

![Vercel](https://vercelbadge.vercel.app/api/ChainLynxRobotics/ScoutingPWA?style=for-the-badge)

### *A Progressive Web App (PWA) built with React to scout FIRST robotics competition matches.*

---
### ⚠️ Note: This application is only to be used by FRC Team 8248 ⚠️
This may change in the future, but for now we ask that usage of this app is closed to other teams.


## Screenshots:
<img src="./repo/scout_match.png?raw=true" alt="A screenshot showing the scouting application in-use" width="200px" /> <img src="./repo/analytics_graph.png?raw=true" alt="A screenshot showing the analytics section of the scouting application in-use" width="200px" /> <img src="./repo/analytics_picklist.png?raw=true" alt="A screenshot showing the pick list" width="200px" />

## Features
- Once installed, it can work <u>fully</u> offline
- Everything can be done on a phone, built for mobile compatibility
- Scouts with time based data for more information (such as time of button presses being recorded)
- All data can be sent via QR codes 
  - Including scouting data, match schedule, and pick list
  - Data is heavily compressed to make transfer as fast as possible
- Calculations and graphs are integrated in-app
  - They can also be exported into excel/json files for easy data transfer and custom statistic calculations
- Team Pick List with easy data viewing
  - Draggable teams for the current competition
  - The Pick List can be shared with others via a QR code for collaborative ranking.
- If Internet is available, match schedule and team rankings can be pulled from [TBA API](https://www.thebluealliance.com/apidocs)

### Limitations
- As this app is built to be used offline, all scouters must share qr codes with the scout lead every so often for them to collect the data
- UI is not super intuitive, and requires some practice before using in-competition
- Two scouters can not scout the same team during the same match
  - Due to its time-based nature, the data cannot be combined or averaged out in any reasonable way
- Managing of who is scouting and their Client ID must be done manually
- May not work on old phones/tablets, requires modern browser features
- Although everything *can* be transferred with just text codes/files over slack or alt platforms, a high res phone camera is highly recommended for the scout lead to gather data from scouters quickly.
- No way of pit scouting (for now...)


## How to Scout

### Getting Set Up

The majority of a scouter's time will be spent on the main scouting page page, this is where the data is collected and most inputs are located.

When you pull out your phone or are given a tablet to start scouting, you must verify these things:
- You have selected the correct <a href="#managing-client-ids">Client ID</a>, changed in settings
- You are on the right match number, change this in the select menu on the pre-scout page
- You have set your name on the Settings Page, this is not required but used to track your contributions

---

### Pre Match

The Pre-match screen is for filling in data/notes for before the match starts. <u>**Pay attention for that buzzer because the moment autonomous starts, you need to hit the "Start Match" button to ensure all the time-based data is synced.**</u>

---

### During the Match

When that button is pressed, you will be navigated to the during-match screen, displaying buttons at the different field elements to press when your assigned robot completes different tasks. Everything recorded in the first 18 seconds is assumed to be in autonomous mode, however you may forcefully skip into tele-op with a skip button in the top right.

The timing of the button presses is recorded, but its ok if the timing is off. Whats more important is that the button gets pressed at all, even if its five seconds delayed or a hundred seconds delayed. Remember that this data is recorded by humans and interpreted by humans, its OK to make mistakes!

**TIP:** Depending on the perspective you are currently viewing the field from, a rotate button in the top left will flip around the diagram and buttons to account for where you may be in the stands.

Additionally, an editable Event Log is provided to make quick edits/deletions during the match. However it is recommended to make those edits once the match is over due to the fast paced nature of the games.

---

### Post Match

This is the time to fill in extra notes, observations, and end-game data. Additionally, this is the prime time to create/edit/delete any events in the event log before the data is submitted.

---

### Onto the next scouter

After you have scouted a few times, you should relinquish the task to another team member. If the scouting lead is nearby or available, be sure to navigate to the Data Page and <a href="#transferring-data">generate QR Codes</a> so they can collect your data. 

**TIP:** If the lead is not available, you can also share this data with the next scouter who can then pass it on to the lead when they have a chance.

Next you want to notify your replacement of your Client ID, and make sure they set the correct one in settings. Also make sure they have the correct match number selected.

Finally give them a pat on the back, wish them luck, and enjoy your sweet sweet escape to freedom (or the pits... I still get shivers just thinking about that dreadful place...)

<img src="./repo/scout_pre.png?raw=true" alt="A screenshot showing the scouting pre-match page of the application" width="200px" /> <img src="./repo/scout_match.png?raw=true" alt="A screenshot showing the during match page of scouting application in-use" width="200px" /> <img src="./repo/scout_post.png?raw=true" alt="A screenshot showing the post match page of the scouting application in-use" width="200px" />


# As a Scout Lead

### Getting the Event Schedule

All schedule management is done on the Settings Page.

If internet access is available nearby, its recommended to tell your scouters to use the "Download From BlueAlliance" button to get a copy of the schedule from TBA API. Those who have the schedule can also <a href="#transferring-data">share it with others</a> with a similar QR system to the matches, using the "Scan" and "Share" buttons above the match schedule.

<img src="./repo/settings_schedule.png?raw=true" alt="A screenshot showing the schedule section of the settings page" width="200px" />

---

### Managing Client IDs

The Client ID (1-6) determines what robot each person will be scouting, and must be unique for every active scouter to avoid duplicate data. A good method our team found, was to get 6 pieces of paper with the numbers 1-6 on them and each active scouter would hold on to the piece, both so the lead new who they needed data from, and so when scouters were replaced they knew what Client ID to use.

---

### Transferring data

Every few matches during the competition, ask each of your scouters to share their data with you. This is done by navigating to the Data Page and pressing the blue "Share" button at the top. This will generate QR Codes that contain all of their new match data. As a lead you want to press the "Collect" button to open a QR Scanner to scan those codes.

**NOTE:** The "Share" button will only generate codes for matches that have not already been shared (aka "New" matches). To include other matches, select them in the Data Page and press the "Mark As New" button before generating.

For transferring large amounts of data, you may also export everything as a .zip file with the "Export" button. That file may then be sent to another person via slack or alt application to the receiver who can when import that file with the "Import" button to get a copy of all those matches.

<img src="./repo/data.png?raw=true" alt="A screenshot data page of the scouting application in-use" width="200px" />

---

### Visualizing the Data

The analytics page is built just for this! It uses the data on the current device to calculate statistics and generate colorful charts to easily take advantage of the data your team has collected.

**TIP:** While it is compatible with mobile devices, its recommended to use a landscape device for maximum data consumption.

The "Teams" and "Matches" tabs on the main Analytics Page show a list of all known teams and matches you have data on. A checkbox at the top of the page will limit this to only include data from the current competition. The teams can be starred for repeated access and clicking on them will lead you to all the colorful numbers you could ever need.

The Pick List tab is similar to the Teams tab but allows you to reorder and rank different teams for alliance selection. You may also cross off teams for your convenience during the selection itself. Your order of teams can be shared with other members both with the <a href="#transferring-data">QR system described earlier</a> and copy+pasting a short Data Transfer Code.

<img src="./repo/analytics_base.png?raw=true" alt="A screenshot showing the default Teams tab of the analytics page." width="200px" /> <img src="./repo/analytics_team.png?raw=true" alt="A screenshot showing the data visualization for an example team" width="200px" /> <img src="./repo/analytics_picklist.png?raw=true" alt="A screenshot showing the pick list tab of the analytics page" width="200px" />

<img src="./repo/analytics_full.png?raw=true" alt="A screenshot showing the full analytics visualization in a landscape view" width="600px" />