GameChat.allow({
	insert: function(userId, doc) {
		var game = Games.findOne(doc.game_id);
		return (userId && game && (userId === game.players.white || userId === game.players.black));
	}
});

GameMoves.allow({
	insert: function(userId, doc) {
		var game = Games.findOne(doc.game_id);
		var last_move = GameMoves.findOne({game_id: doc.game_id}, {sort: {$natural: -1}});
		var next_move = last_move ? (last_move.player === 'w' ? 'b' : 'w') : 'w';
		return (userId === game.players.white || userId === game.players.black) && doc.player === next_move;
	}
});

Meteor.publish(null, function() {
	return Meteor.users.find({
		_id: this.userId
	}, {
		fields: {
			profile: 1,
			status: 1
		}
	});
});

Meteor.publish("game", function(game_id) {
	var gameCursor = Games.find({
		_id: game_id
	});
	var game = gameCursor.fetch()[0];
	var boardCursor = GameBoard.find({_id: game.board_id});
	return [
		gameCursor,
		boardCursor
	];
});

Meteor.publish("pendingGames", function() {
	var self = this;
	var games = Games.find({
		won: {
			$exists: false
		},
		draw: {
			$exists: false
		},
		status: 'waiting',
		creator: {
			$ne: self.userId
		},
		online: true
	});
	var handler = games.observe({
		added: function(doc) {
			var player;
			player = Meteor.users.findOne(doc.creator, {
				fields: {
					profile: 1,
					status: 1
				}
			});
			if(player)
				self.added("users", player._id, player);
		}
	});
	self.onStop(function() {
		handler.stop();
	});
	return games;
});

Meteor.publish("gameChat", function(game_id) {
	return GameChat.find({
		game_id: game_id
	});
});

Meteor.publish("gameUsers", function(user_ids) {
	return Meteor.users.find({
		_id: {
			$in: user_ids
		}
	}, {
		fields: {
			profile: 1,
			status: 1
		}
	});
});

Meteor.publish('gameMoves', function(game_id) {
	return GameMoves.find({
		game_id: game_id
	}, {
		profile: 1,
		status: 1
	});
});

Meteor.users.find().observe({
	changed: function(newDoc, oldDoc) {
		if(!newDoc.status || !oldDoc.status)
			return;
		if(newDoc.status.online === oldDoc.status.online)
			return;
		Games.update({
			creator: newDoc._id,
			status: 'waiting'
		}, {
			$set: {
				online: newDoc.status.online
			}
		}, {
			multi: true
		});
	}
});

Meteor.publish("timers", function(game_id) {
	var game = Games.findOne(game_id);
	return GameTimers.find({_id: game.timer_id});
});

Games.find({status: "playing"}).observe({
	added: function(doc) {
		startTimer(doc.timer_id, doc._id);
	}
});

function startTimer(timer_id, game_id) {
	var playing = Games.findOne(game_id).next_move;
	var start, end, diff;
	start = new Date().getTime();
	var observeHandler = Games.find({
		_id: game_id
	}).observeChanges({
		changed: function(_id, fields) {
			if(fields.won || fields.draw === true) {
				stopTimer(intervalHandler, observeHandler);
			}
			if(!fields.next_move)
				return;
			
			end = new Date().getTime();
			diff = start - end;
			start = new Date().getTime();
			playing = fields.next_move;
			if (playing === 'w') {
				GameTimers.update(timer_id, {
					$inc: {
						white: diff
					}
				});
			} else {
				GameTimers.update(timer_id, {
					$inc: {
						black: diff
					}
				});
			}
		}
	});
	var intervalHandler = Meteor.setInterval(function() {
		end = new Date().getTime();
		diff = start - end;
		start = new Date().getTime();
		if (playing === 'w') {
			GameTimers.update(timer_id, {
				$inc: {
					white: diff
				}
			});
		} else {
			GameTimers.update(timer_id, {
				$inc: {
					black: diff
				}
			});
		}
		var timer = GameTimers.findOne(timer_id);
		if(timer.white < 0 || timer.black < 0) {
			stopTimer(intervalHandler, observeHandler);
		}
	}, 1000);
}

function stopTimer(intervalHandler, observeHandler) {
	Meteor.clearInterval(intervalHandler);
	observeHandler.stop();
}