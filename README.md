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
3. Keep your change granularly. That means, don't put a hodgepodge of functionalities in one PR. If you think it is possible, keep the code size small for the convenience of code reviewers.
4. After creating a PR, link it to an existing issue if there is, and request review to your peer working on a related feature.
5. Make sure your change pass all Eslint rules.
6. (Optional) Write Jest test for each functionality you made. This would help increasing test coverage.
7. (For code owner) For each week, please pull the stage branch and check whether all linked issues are resolved. If yes, review it and merge to the main branch.