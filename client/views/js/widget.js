GameChat.find().observe({
	added: function(doc) {
		var message = UI.renderWithData(Template.message, doc);
		var container = document.getElementById('chat-message-container');
		if (!container) {
			setTimeout(function() {
				UI.insert(message, container);
			}, 500);
		} else {
			UI.insert(message, container);
		}
		Session.set("countNewMessages", Session.get("countNewMessages") + 1);
	}
});
GameMoves.find().observe({
	addedAt: function(doc, ind) {
		if (ind % 2 === 0) {
			$('#moves-container').append('<div class="row move-row"></div>');
		}
		$('#moves-container').children().last().append('<div class="col-md-6">' + doc.move + '</div>');
		$('#moves-container').scrollTop($('#moves-container')[0].scrollHeight);
	}
});

Template.widget.rendered = function() {
	Session.set("countNewMessages", 0);
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		var tab = e.target // activated tab
		Session.set("countNewMessages", 0);
	})
}


Template.widget.destroyed = function() {
	$("#chat-message-container").html("");
	$("#moves-container").html("");
}

Template.widget.messages = function() {
	return GameChat.find({
		game_id: Session.get("game_id")
	});
}

Template.widget.inPlay = function() {
	var game = Games.findOne(Session.get("game_id"));
	return game && !game.won && !game.draw;
}

Template.widget.isWaiting = function() {
	var game = Games.findOne(Session.get("game_id"));
	return game && !game.won && typeof game.draw === 'object';
}

Template.widget.isDrawDisabled = function() {
	var game = Games.findOne(Session.get("game_id"));
	return (game.draw === false) ? true : false;
}

Template.widget.isGameDrawn = function() {
	var game = Games.findOne(Session.get("game_id"));
	return game && game.draw === true
}

Template.widget.pieces = function() {
	var game = Games.findOne(Session.get("game_id"));
	if (!game)
		return;
	var board = game.board;
	var pieces = [];
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			if (board[i][j].placed.piece) {
				pieces.push({
					piece: board[i][j].placed.piece,
					color: board[i][j].placed.piece[0]
				});
			}
		}
	}
	return sortPieces(pieces);
}

Template.widget.isWhite = function(color) {
	return (color === 'w') ? true : false;
}

Template.widget.isBlack = function(color) {
	return (color === 'b') ? true : false;
}

Template.widget.countNewMessages = function() {
	return !!Session.get("countNewMessages") && !$("#chat").hasClass("active") && Session.get("countNewMessages");
}

Template.message.rendered = function() {
	$('#chat-message-container').scrollTop($('#chat-message-container')[0].scrollHeight);
}
Template.alert.rendered = function() {
	$('#alerts').scrollTop($('#alerts')[0].scrollHeight);
}

Template.widget.events({
	'keyup #send-message': function(evt) {
		value = evt.target.value;
		if (evt.keyCode === 13 && value.replace(/\s+/, '') !== '' && evt.shiftKey !== true) {
			var user = Meteor.user();
			GameChat.insert({
				'game_id': Session.get("game_id"),
				'user_id': user._id,
				'name': user.profile.name,
				'message': value,
				created_at: new Date()
			});
			evt.target.value = '';
			evt.preventDefault();
			return false;
		}
	},
	'click #resign-button': function(evt) {
		Meteor.call("resign", Session.get("game_id"), function(err, res) {
			if (err) {
				console.warn(err);
				alert(err);
			}
		});
	},
	'click #draw-button': function(evt) {
		Meteor.call("draw", Session.get("game_id"), DRAW_REQUEST, function(err, res) {
			if (err) {
				alert(err);
			}
		});
	}
});

function sortPieces(pieces) {
	return _.sortBy(pieces, function(el) {
		switch (el.piece[1]) {
			case 'P':
				return 1;
				break;
			case 'N':
				return 2;
				break;
			case 'B':
				return 3;
				break;
			case 'R':
				return 4;
				break;
			case 'Q':
				return 5;
				break;
			case 'K':
				return 6;
				break;
		}
	});
}