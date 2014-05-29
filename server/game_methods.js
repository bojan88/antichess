Meteor.methods({
	createGame: function(color, duration) {
		var columns = 'abcdefgh'.split('');
		var board_matrix = {};
		for (var i = 0; i < 8; i++) {
			board_matrix[i] = [];
			for (var j = 0; j < 8; j++) {
				board_matrix[i][j] = {
					color: ((i + j) % 2 === 0) ? 'black' : 'white'
				};
				board_matrix[i][j].letter = columns[i];
				board_matrix[i][j].placed = {};
			}
		}
		board_matrix[7][0].placed.piece = 'wR';
		board_matrix[7][0].placed.ind = 0;
		board_matrix[6][0].placed.piece = 'wN';
		board_matrix[6][0].placed.ind = 0;
		board_matrix[5][0].placed.piece = 'wB';
		board_matrix[5][0].placed.ind = 0;
		board_matrix[4][0].placed.piece = 'wK';
		board_matrix[3][0].placed.piece = 'wQ';
		board_matrix[2][0].placed.piece = 'wB';
		board_matrix[2][0].placed.ind = 1;
		board_matrix[1][0].placed.piece = 'wN';
		board_matrix[1][0].placed.ind = 1;
		board_matrix[0][0].placed.piece = 'wR';
		board_matrix[0][0].placed.ind = 0;

		board_matrix[7][7].placed.piece = 'bR';
		board_matrix[7][7].placed.ind = 0;
		board_matrix[6][7].placed.piece = 'bN';
		board_matrix[6][7].placed.ind = 0;
		board_matrix[5][7].placed.piece = 'bB';
		board_matrix[5][7].placed.ind = 0;
		board_matrix[4][7].placed.piece = 'bK';
		board_matrix[3][7].placed.piece = 'bQ';
		board_matrix[2][7].placed.piece = 'bB';
		board_matrix[2][7].placed.ind = 1;
		board_matrix[1][7].placed.piece = 'bN';
		board_matrix[1][7].placed.ind = 1;
		board_matrix[0][7].placed.piece = 'bR';
		board_matrix[0][7].placed.ind = 0;

		for (var i = 0; i < 8; i++) {
			board_matrix[i][1].placed.piece = 'wP';
			board_matrix[i][1].placed.ind = i;

			board_matrix[i][6].placed.piece = 'bP';
			board_matrix[i][6].placed.ind = i;
		}

		var players = {};
		if(color === 'white') {
			players.white = this.userId;
		} else if(color === 'black') {
			players.black = this.userId;
		} else {
			throw new Meteor.Error("You must set color");
		}

		var duration_ms = duration * 60 * 1000;
		var timer_id = GameTimers.insert({
			white: duration_ms,
			black: duration_ms
		});
		return Games.insert({
			next_move: 'w',
			players: players,
			board: board_matrix,
			creator: this.userId,
			online: true,
			status: 'waiting',
			createdAt: new Date().getTime(),
			startedAt: null,
			duration: duration,
			timer_id: timer_id
		});
	},
	joinGame: function(game_id) {
		var userId = this.userId;
		var game = Games.findOne(game_id);
		if(!game) {
			throw new Meteor.Error("Game doesn't exist");
		}

		Meteor.users.update(userId, {
			$set: {
				playing: {
					game_id: game_id,
					color: 'w'
				},
			}
		});

		if (game.players.white && game.players.black)
			return;

		if (game.players.white === userId || game.players.black === userId)
			return;
		if (!game.players.white) {
			game.players.white = userId;
		} else if (!game.players.black) {
			game.players.black = userId;
		}
		Games.update(game_id, {
			$set: {
				players: game.players
			}
		});

		Games.update(game_id, {
			$set: {
				status: 'ready'
			}
		});
	},
	movePiece: function(move, game_id) {
		if (move && typeof move !== 'object' || Object.keys(move).length !== 2)
			throw new Error("Move object is not correct");
		if (move.from.length !== 2 || move.to.length !== 2)
			throw new Error("Move position must be array of two");

		var Board = new BoardMatrix(game_id, this.userId);
		Board.setMove(move);
		Board.executeMove();
	},
	promote: function(piece, position, game_id) {
		var game = Games.findOne(game_id);
		var matrix = game.board;
		if(matrix[position[0]][position[1]].placed.piece[0] === 'b' && this.userId !== game.players.black)
			return;
		if(matrix[position[0]][position[1]].placed.piece[0] === 'w' && this.userId !== game.players.white)
			return;

		var update_obj = {};
		update_obj['board.' + position[0] + '.' + position[1] + '.placed.piece'] = matrix[position[0]][position[1]].placed.piece[0] + piece;
		var unset_obj = {};
		unset_obj['board.' + position[0] + '.' + position[1] + '.placed.promote'] = 1;
		Games.update(game_id, {
			$set: update_obj,
			$unset: unset_obj
		});
	},
	resign: function(game_id) {
		var winner_color, winner_id;
		var game = Games.findOne(game_id);
		if (this.userId === game.players.white) {
			winner_color = 'b';
			winner_id = game.players.black;
		} else if (this.userId === game.players.black) {
			winner_color = 'w';
			winner_id = game.players.white;
		}
		Games.update(game_id, {
			$set: {
				won: {
					color: winner_color,
					winner_id: winner_id,
				}
			}
		});
	},
	'draw': function(game_id, action) {
		var game = Games.findOne(game_id);
		if (game.players.white !== this.userId && game.players.black !== this.userId)
			return false;

		if (game.draw === undefined) {
			Games.update(game_id, {
				$set: {
					"draw.requested": this.userId
				}
			});
			return DRAW_WAITING_CONFIRMATION;
		} else if (typeof game.draw === 'object' && game.draw.requested) {
			var opponent_id = (game.draw.requested !== game.players.white) ? game.players.white : game.players.black;
			if (this.userId === opponent_id) {
				if (action === DRAW_ACCEPT) {
					Games.update(game_id, {
						$set: {
							draw: true
						}
					});
				} else {
					Games.update(game_id, {
						$set: {
							draw: false
						}
					});
				}
				return DRAW_DONE;
			}
		}
	}
});
