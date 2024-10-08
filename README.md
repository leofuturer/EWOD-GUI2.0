# EWOD-GUI2.0

The 2nd generation of EWOD Graphic User Interface (GUI)

To run on your local machine:

1. Open your terminal/command line and navigate to whatever directory you want the EWOD-GUI2.0 folder to be in.
2. If you haven't already, install Node.js [here](https://nodejs.org/en/download/). (You can check whether you have npm by typing ```npm --version``` into your terminal/command line.)

    Note: Currently, we are using Node.js v14, as this was the LTS when the project was started. We will look into migrating to the current LTS release, v16, but in the meantime, please be sure to download/install version 14.18.1 of Node.js [here](https://nodejs.org/download/release/latest-v14.x/).

3. Type in ```git clone https://github.com/leofuturer/EWOD-GUI2.0.git``` (to pull the code from Github onto your local machine)
4. Type in ```npm install --global yarn``` (to install yarn, our package manager)
5. Type in ```yarn``` (to install the needed 3rd-party libraries)
6. Run with ```yarn start```
7. If your default browser is not Chrome, navigate to localhost:3000 using Chrome to see the app.

    Note: Due to the specific framework that we use to access USB devices locally (WebHID), the only web browser that works with our app is Chrome.

8. For running end-to-end test, type ```yarn e2e```. If you want to use cypress test runner to debug your code, type ```yarn e2e-gui```.

## Instructions for submitting code changes

Please read this section and follow the instructions before creating a *Pull Request*.

1. If you have any branches based on `main` branch that you want to create a PR, rebase off the `stage` branch and resolve all conflicts.
2. When making a new PR, be sure to choose the target branch as `stage`, otherwise github workflow will yell at you.
3. Make your changes at a granular level. That means, try to have each PR concerned with only one feature/bug fix. Always try to keep the git diff small for the convenience of code reviewers, and refrain from committing unrelated changes (i.e. yarn.lock commit when no packages are added/removed/updated).
4. Make sure your change passes all Eslint rules.
5. After creating a PR, link it to an existing issue if there is one, and request reviews from other contributors who are working on a related feature.
6. (Optional) Write Jest test for each functionality you made. This would help increasing test coverage.
7. (For code owner) Each week, please pull the `stage` branch and check whether all linked issues are resolved. If yes, review it and merge the `stage` into the `main` branch.
