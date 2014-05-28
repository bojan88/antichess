Antichess
=========

Antichess is a chess variant developed in Meteor.js.
The app is running on http://antichess.meteor.com/

**Running on local machine**
* install meteor
* clone the repo
* run "meteor" inside the project

**Testing with Laika**
* install laika
* comment out the code in server/validators/antichess.js:BoardMatrix.prototype._validatePlayer
* run Laika inside the project


**TODO**
* implement En Passant
* implement Castling
* better latency compensation
* server offload
* design


Feel free to report any bugs, post suggestions, open issues, and fork. Pull requests are wellcome.
Deploying to a public domain is not permitted.