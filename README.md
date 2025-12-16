<!-- Include gif of project here -->
***
# OceanOne

*A Cybersecurity Engagement Project* that endeavours to educate users that don't, or rather, don't have the resources to understand online risks and
for those naive enough to believe that they will never be in a vulnerable position. 

To accommodate all ages, this project has taken a gamified route to capture 

Below are the current features exhibited in this project, and the more granular functions each include.

| Features                    | Constituents                                                                                                                                                                                                                                                                                                         |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Weather forecast widget** | Tells the temperature in an adjustable degree Celsius or Fahrenheit manner.<br/><br/>Shows the location related to the weather                                                                                                                                                                                       |
| **Windows**                 | Many functionalities like being able to:<ul><li>Drag it around the screen</li><li>Resize it from any side</li><li>Close the window</li><li>Minimise the window</li></ul>Additionally, each open window can be previewed when hovering over it's apps icon.<br/><br/>New windows can be created via the preview area. |
| **Dynamic Background**      | A background that smoothly changes based on the hour of the day.                                                                                                                                                                                                                                                     |
| **Email System**            | By taking inspiration to games like ShenzhenIO, this project has utilised an email based system to reveal new lessons the user will take.                                                                                                                                                                            |
| **Page Loader**             | A loader that appears before the main home page to ensure any API call made on page load has been completed.                                                                                                                                                                                                         |


### Future fixes
If there was more time given for this project, the following table describes the next steps to fix or add to the project:

<!-- Tabulate -->
| Feature             | Fix or Addition                                                                                                                 |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **Windows**         | When the contents of the window change, update the preview corresponding to it.                                                 |
| **Emails**          | Change the headers of an email to be either not sticky or have their own background.                                            |
| **Progress**        | When the user makes a mistake, instead of restarting the course from the beginning, restore the last progress the user had made |
| **Favicon**         | Edit it to only include the shield logo.                                                                                        |
| **Weather Widget**  | Add weather icons to show the type of weather in the area.                                                                      |
| **Content**         | Of course, there should be more content that also vary in complexity.                                                           |
| **Task Completion** | Make it clear that a task has been completed.                                                                                   |

### Libraries
```
flask          >= 3.1.2
asgiref        >= 3.10.0   (flask[async])
python-weather >= 2.1.0
requests       >= 2.32.5
```