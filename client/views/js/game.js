var columns = 'abcdefgh'.split('');

Template.game.rendered = function() {
	Deps.autorun(function() {
		var game = Games.findOne(Session.get("game_id"));
		if (game && game.won) {
			var winner = Meteor.users.findOne(game.won.winner_id);
			if (winner) {
				Session.set("winner", winner.profile.name);
				$('#end-game-modal').modal();
			}
		}
		if (game && typeof game.draw === 'object') {
			var opponent_id = (game.draw.requested !== game.players.white) ? game.players.white : game.players.black;
			if (opponent_id === Meteor.user()._id && Meteor.users.find().count() === 2) {
				Session.set("draw_requester", Meteor.users.findOne(game.draw.requested).profile.name);
				$('#draw-request-modal').modal();
			}
		}
		if(game)
			Meteor.subscribe("gameUsers", [game.players.white, game.players.black]);
	});
	setTimeout(function() {
		if(Object.keys(Games.findOne().players).length < 2)
			$("#invite-friend-modal").modal();
	}, 20000);
}
Template.end_game_modal.winning_message = function() {
	return Session.get("winner");
}
Template.draw_request_modal.player = function() {
	return Session.get("draw_requester");
}

Template.end_game_modal.destroyed = function() {
	$('#end-game-modal').modal('hide');
	$(".modal-backdrop").hide();
}
Template.draw_request_modal.destroyed = function() {
	$('#draw-request-modal').modal('hide');
	$(".modal-backdrop").hide();
}
Template.invite_friend_modal.destroyed = function() {
	$('#invite-friend-modal').modal('hide');
	$(".modal-backdrop").hide();
}

Template.game.cells = function() {
	var cells_array = [];
	var game = Games.findOne(Session.get("game_id"));
	if (!game) {
		return;
	}
	board_matrix = GameBoard.findOne({_id: game.board_id});
	if(!board_matrix)
		return;
	for (var j = 7; j >= 0; j--) {
		for (var i = 0; i < 8; i++) {
			if(board_matrix[i][j].placed.promote) {
				if(board_matrix[i][j].placed.piece[0] === 'w' && Meteor.user()._id !== game.players.white)
					delete board_matrix[i][j].placed.promote;
				else if(board_matrix[i][j].placed.piece[0] === 'b' && Meteor.user()._id !== game.players.black)
					delete board_matrix[i][j].placed.promote;
			}
			cells_array.push({
				id: columns[i] + (j + 1),
				color: board_matrix[i][j].color,
				piece: board_matrix[i][j].placed.piece,
				clicked: board_matrix[i][j].clicked,
				promote: board_matrix[i][j].placed.promote
			});
		}
	}
	return cells_array;
}

Deps.autorun(function() {
	$('.cell.last-move-from').removeClass('last-move-from');
	$('.cell.last-move-to').removeClass('last-move-to');
	var moves = GameMoves.find().fetch();
	var last_move = moves.pop();
	if(!last_move)
		return;
	var from_id = getPositionId(last_move.move_coordinates.from);
	var to_id = getPositionId(last_move.move_coordinates.to);
	$(from_id).addClass("last-move-from");
	$(to_id).addClass("last-move-to");
});

Template.draw_request_modal.events({
	'click #accept-draw': function() {
		Meteor.call("draw", Session.get("game_id"), DRAW_ACCEPT, function(err, res) {
			if (err) {
				alert(err);
			}
		});
	},
	'click #reject-draw': function() {
		Meteor.call("draw", Session.get("game_id"), DRAW_REJECT, function(err, res) {
			if (err) {
				alert(err);
			}
		});
	}
});

Template.end_game_modal.events({
	'click #request-rematch': function() {
		stream.emit('events', {
			game_id: Session.get("game_id"),
			event: 'rematch',
			action: 'request'
		});
	},
	'click #accept-rematch': function() {
		stream.emit('events', {
			game_id: Session.get("game_id"),
			event: 'rematch',
			action: 'accept'
		});
		Session.set("accepted-rematch", true);
	},
	'click #reject-rematch': function() {
		stream.emit('events', {
			game_id: Session.get("game_id"),
			event: 'rematch',
			action: 'reject'
		});
		Session.set("rejected-rematch", true);
	}
});

Template.report_bug_modal.events({
	'click #submit-bug-report': function(evt) {
		var text = $('#bug-problem-text').val();
		Meteor.call("reportBug", Session.get("game_id"), text, function(err, res) {
			if(err) {
				alert(err);
			}
		})
	}
})

var clicked;
Template.game.events({
	'click .cell': function(e) {
		var game = Games.findOne(Session.get("game_id"));
		if (game.won || game.draw)
			return;

		if (!clicked) {
			if (this.piece && this.piece[0] !== game.next_move)
				return;
			if (this.piece && this.piece[0] === 'w' && game.players.white !== Meteor.user()._id)
				return;
			if (this.piece && this.piece[0] === 'b' && game.players.black !== Meteor.user()._id)
				return;
			clicked = getPosition(e.currentTarget.id);
			if (!board_matrix[clicked[0]][clicked[1]].placed.piece) {
				clicked = false;
			} else {
				var update_obj = {};
				update_obj[clicked[0] + '.' + clicked[1] + '.clicked'] = true;
				GameBoard._collection.update(game.board_id, { //client only with _collection
					$set: update_obj
				});
			}
		} else {
			var position = getPosition(e.currentTarget.id);
			var update_obj = {};
			update_obj[clicked[0] + '.' + clicked[1] + '.clicked'] = false;
			GameBoard._collection.update(game.board_id, { //client only with _collection
				$set: update_obj
			});

			var Board = new BoardMatrix(Session.get("game_id"), Meteor.userId());
			Board.setMove({
				from: clicked,
				to: position
			});
			try {
				Board.executeMove();
				Meteor.call('movePiece', {
					from: clicked,
					to: position
				}, Session.get("game_id"), function(err, res) {
					if (err) {
						insertAlert(err);
					} else {
						removeTakingMoves();
					}
				});
			} catch(err) {
				insertAlert(err);
			}
			clicked = false;
		}
	}
});

Template.game.getColor = function(color, clicked) {
	var game = Games.findOne(Session.get("game_id"));
	var user_id = Meteor.user()._id;
	if (this.piece && this.piece[0] === 'w' && game.players.white !== user_id)
		return color;
	if (this.piece && this.piece[0] === 'b' && game.players.black !== user_id)
		return color;
	if (clicked)
		return 'clicked';
	else
		return color;
}

Template.promotion_box.getPieceColor = function(piece) {
	return piece[0];
}

Template.promotion_box.events({
	'click .promotion-box': function(e) {
		e.stopPropagation();
		var piece = e.currentTarget.id;
		var position = getPosition(this.id);
		Meteor.call("promote", piece, position, Session.get("game_id"), function(err, res) {
			if (err) {
				console.warn(err);
			}
		})
	}
});

Template.game.whitePlayerData = function() {
	var game = Games.findOne(Session.get("game_id"));
	if (!game) {
		return;
	}
	var user = Meteor.users.findOne(game.players.white);
	if (!user) {
		return;
	}
	var timer = GameTimers.findOne({
		_id: game.timer_id
	});
	if(!timer) {
		return;
	}
	var time = getTimeFromMs(timer.white);
	return {
		name: user.profile.name,
		avatar_url: user.profile.avatar_url,
		status: user.status.online,
		time: time
	};
}

Template.game.blackPlayerData = function() {
	var game = Games.findOne(Session.get("game_id"));
	if (!game) {
		return;
	}
	var user = Meteor.users.findOne(game.players.black);
	if (!user) {
		return;
	}
	var timer = GameTimers.findOne({
		_id: game.timer_id
	});
	if(!timer) {
		return;
	}
	var time = getTimeFromMs(timer.black);
	return {
		name: user.profile.name,
		avatar_url: user.profile.avatar_url,
		status: user.status.online,
		time: time
	};
}

function getTimeFromMs(time_ms) {
	if(time_ms < 0) {
		return {
			minutes: 0,
			seconds: "00"
		}
	}
	var minutes = Math.floor(time_ms / (60 *1000));
	var seconds = Math.round(time_ms / 1000 - minutes * 60);
	if(seconds < 10) {
		seconds = "0" + seconds;
	}
	return {
		minutes: minutes,
		seconds: seconds
	}
}

UI.registerHelper("getUserStatus", function(status) {
	if(status === undefined)
		return "none"
	return status ? "online" : "offline";
});

function insertAlert(err) {
	if (err.error !== ILLEGAL_MOVE_ERROR) {
		var frag = UI.renderWithData(Template.alert, {
			message: err.reason
		});
		UI.insert(frag, $('#alerts')[0]);
	}
	if (err.error === TAKE_ERROR) {
		showTakingMoves(err.details);
	}
}

function showTakingMoves(moves) {
	var from_id, to_id;
	for (var i = 0; i < moves.length; i++) {
		from_id = getPositionId(moves[i].from);
		to_id = getPositionId(moves[i].to);

		$(from_id).children('.cell-inner').addClass('taking-from');
		$(to_id).children('.cell-inner').addClass('taking-to');
	}
}

function removeTakingMoves() {
	$('.cell-inner').removeClass("taking-from taking-to")
}

function getPosition(field) {
	if (typeof field !== 'string')
		throw new Error("Position must be string")
	var position = field.split('');
	return [columns.indexOf(position[0]), parseInt(position[1] - 1)];
}

function getPositionId(position) {
	return '#' + columns[position[0]] + (position[1] + 1);
}