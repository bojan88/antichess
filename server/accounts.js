Accounts.onCreateUser(function(options, user) {
	if (user.services.facebook) {
		user.profile = {
			avatar_url: 'http://graph.facebook.com/' + user.services.facebook.id + '/picture',
			name: user.services.facebook.name
		}
	}

	if (user.services.twitter) {
		user.profile = {
			avatar_url: user.services.twitter.profile_image_url,
			name: user.services.twitter.screenName
		}
		delete user.services.twitter.profile_image_url;
		delete user.services.twitter.profile_image_url_https;
	}

	return user;
});