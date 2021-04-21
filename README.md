# EWOD-GUI2.0

The 2nd generation of EWOD Graphic User Interface (GUI)

To run on your local machine:

1. Open your terminal/command line and navigate to whatever directory you want the EWOD-GUI2.0 folder to be in.
2. If you haven't already, install Node.js so that you can get npm [here](https://nodejs.org/en/download/). (You can check whether you have npm by typing ```npm --version``` into your terminal/command line.)
3. Type in ```git clone https://github.com/leofuturer/EWOD-GUI2.0.git``` (to pull the code from Github onto your local machine)
4. Type in ```npm install --global yarn``` (to install yarn, our package manager)
5. Type in ```yarn``` (to install the needed 3rd-party libraries)
6. Run with ```yarn start```
7. If it doesn't automatically pop up for you, point your favorite browser to localhost:3000 to see the app.

## Instructions for submitting code changes

Please read this section and follow the instructions before creating a *Pull Request*.

1. If you have any branches based on `main` branch that you want to create a PR, rebase off the `stage` branch and resolve all conflicts.
2. When making a new PR, be sure to choose the target branch as `stage`, otherwise github workflow will yell at you.
3. Make your changes at a granular level. That means, try to have each PR concerned with only one feature/bug fix. Always try to keep the git diff small for the convenience of code reviewers, and refrain from committing unrelated changes (i.e. yarn.lock commit when no packages are added/removed/updated).
4. Make sure your change passes all Eslint rules.
5. After creating a PR, link it to an existing issue if there is one, and request reviews from other contributors who are working on a related feature.
6. (Optional) Write Jest test for each functionality you made. This would help increasing test coverage.
7. (For code owner) Each week, please pull the `stage` branch and check whether all linked issues are resolved. If yes, review it and merge the `stage` into the `main` branch.

## What you can test for actuation sequence
1. Add blocks by clicking the add button
2. Create a loop by right click and type frame range in the pop-up dialog
3. Check whether you can create multiple loops
4. Check whether you can update one loop
5. Check whether invalid inputs (incorrect range, loop overlapping, etc.) will be alerted by a banner.
6. Deletion/Copy/Paste of sequence blocks inside/outside loops
7. Try to delete all loops and see whether the banner popped up.
8. Set the duration of all sequence at once
9. Play/Stop/Pause/Repeat function of actuation sequence
10. Check whether errors occur when deleting while playing.
11. Click the trash bin button to delete all actuation sequences and loops.

*Note*: This is a basic guideline of testing the actuation sequence. Feel free to add additional test cases as more features are introduced. These procedures will be automatized by Cypress.io.