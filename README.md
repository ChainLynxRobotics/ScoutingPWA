# C.L.A.W. (**C**hain **L**ynx **A**nalytics **W**ebtool)

A Progressive Web App (PWA) built with React to scout FIRST robotics competition matches.

<img src="./repo/scout_match.png?raw=true" alt="A screenshot showing the scouting application in-use" width="250px" /> <img src="./repo/analytics_graph.png?raw=true" alt="A screenshot showing the analytics section scouting application in-use" width="250px" /> <img src="./repo/analytics_picklist.png?raw=true" alt="A screenshot showing the pick list" width="250px" />

## Features
- Once installed, it can work <u>fully</u>
- Everything can be done on a phone, built for mobile compatibility
- Scouts with time based data for more information (such as time of button presses being recorded)
- All data can be sent via QR codes 
  - Including scouting data, match schedule, and pick list
  - Data is heavily compressed to make transfer as fast as possible
- Calculations and graphs are integrated in-app
  - They can also be exported into excel/json files for easy data transfer and custom statistic calculations
- Team Pick List with easy data viewing
  - Draggable teams for the current competition
  - The Pick List can be 
- If Internet is available, match schedule and team rankings can be pulled from [TBA API](https://www.thebluealliance.com/apidocs)

### Limitations
- As this app is built to be used offline, all scouters must share qr codes with the scout lead every so often for them to collect the data
- UI is not super intuitive, and requires some practice before using in-competition
- Two scouters can not scout the same team during the same match
  - Due to its time-based nature, the data cannot be combined or averaged out in any reasonable way
- Managing of who is scouting and their Client ID must be done manually
- May not work on old phones/tablets, requires modern browser features
- Although everything *can* be transferred with just text codes/files over slack or alter platforms, a high res phone camera is highly recommended for the scout lead to gather data from scouters quickly.
