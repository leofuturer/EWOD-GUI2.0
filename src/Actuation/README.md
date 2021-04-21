# What you can test for actuation sequence
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