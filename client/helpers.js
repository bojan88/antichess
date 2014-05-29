Deps.autorun(function() {
	if(!Meteor.userId())
		return;
	stream.on(Meteor.userId(), function(message) {
		if(message.event === 'rematch') {
			if(message.action === 'request' && !Session.get("rejected-rematch")) {
				$('#end-game-modal').modal();
				Session.set("requested-rematch", true);
			} else if(message.action === 'accept') {
				var game = Games.findOne(Session.get("game_id"));
				Meteor.call("createGame", 'white', game.duration, function(err, res) {
					if(err) {
						console.warn(err);
						return;
					}
					stream.emit("events", {
						event: 'rematch',
						action: 'join',
						game_id: Session.get("game_id"),
						new_game_id: res
					});
					Router.go("game", {_id: res});
				});
			} else if(message.action === 'join' && Session.get("accepted-rematch")) {
				Router.go("game", {_id: message.new_game_id});
			} else if(message.action === 'reject') {
				Session.set("rejected-rematch", true);
				$('#alerts').append('<p>Rematch rejected</p>');
			}
		}
	});
})

UI.registerHelper('session', function(val) {
	return Session.get(val);
});