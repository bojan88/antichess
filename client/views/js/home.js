Template.home.games = function() {
	console.log(Games.find().fetch())
	return Games.find({}, {sort: {createdAt: 1}});
}

Template.home.usersOnline = function() {
	var player;
	if(this.players.white) {
		player = Meteor.users.findOne(this.players.white);
	} else {
		player = Meteor.users.findOne(this.players.black);
	}
	this.player_name = player && player.profile.name;
	return this;
}

Template.home.getNewPlayerColor = function() {
	if(!this.players.white) {
		return "White";
	} else {
		return "Black";
	}
}

Template.home.getGameUrl = function(id) {
	return Router.path("game", {_id: id});
}

Template.home.events({
	'click #create-game-btn': function(evt) {
		$('#login-modal').modal();
	}
});

Template.login_modal.events({
	'click #create-game': function(evt) {
		var color = $('#login-modal .active > input[name=color]').val();
		var duration = $('#login-modal .active > input[name=duration]').val();
		Meteor.call("createGame", color, duration, function(err, res) {
			if(err) {
				console.warn(err);
				return;
			}
			Router.go("game", {_id: res});
		});
	}
});

Template.login_modal.destroyed = function() {
	$('#login-modal').modal('hide');
	$(".modal-backdrop").hide();
}