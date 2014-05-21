Meteor.startup(function() {
	AccountsEntry.config({
		homeRoute: '/',
		dashboardRoute: '/',
		passwordSignupFields: 'USERNAME_AND_EMAIL'
	});
})