BoardMatrix.prototype.setStart = function() {
	if (this.game.startedAt === null) {
		Games.update({
			_id: this.game_id
		}, {
			$set: {
				startedAt: new Date().getTime(),
				status: "playing"
			}
		})
	}
}

BoardMatrix.prototype.executeMove = function() {
	this._validatePlayer();

	this._validateTakings();

	this._validateMove();

	this._moveOnBoard();

	if (this._isChech()) {
		throw new Meteor.Error(CHESS_ERROR, "Chech!!!");
	}

	this._writeToDb();

	if (this._isChechMate()) {
		this._endGame();
		throw new Meteor.Error(CHESS_ERROR, "Chech Mate!!!");
	}

	this._validatePromotion();
	if (this._isEnd()) {
		this._endGame();
	}

	if (this._isStaleMate()) {
		this._endGameWithDraw();
	}
}

BoardMatrix.prototype._isStaleMate = function() {
	var opponent = (this.next_move === 'w') ? 'b' : 'w';
	var pieces = this._getAllPieces(opponent);
	var moves = this._getAllMoves(opponent);
	var king_position = this._getKingPosition(opponent);
	for (var i = 0; i < moves.length; i++) {
		if (king_position[0] != moves[i].from[0] && king_position[1] != moves[i].from[1])
			return false;
	}
	for (var i = 0; i < moves.length; i++) {
		this.move = moves[i];
		this._moveOnBoard();
		if (!this._isChech(true))
			return false;
		this._invalidateMoveOnBoard();
	}
	return true;
}

BoardMatrix.prototype._endGameWithDraw = function() {
	Games.update(this.game_id, {
		$set: {
			draw: true
		}
	});
}

BoardMatrix.prototype._isEnd = function() {
	var opponent = (this.next_move === 'w') ? 'b' : 'w';
	var pieces = this._getAllPieces(opponent);
	if (pieces.length === 1) {
		return true;
	} else {
		return false;
	}
}

BoardMatrix.prototype._endGame = function() {
	var winner_color = (this.next_move === 'w') ? 'b' : 'w';
	var winner_id = (winner_color === 'w') ? this.whitePlayerId : this.blackPlayerId;
	Games.update(this.game_id, {
		$set: {
			won: {
				color: winner_color,
				winner_id: winner_id,
			}
		}
	});
}

BoardMatrix.prototype._validatePromotion = function() {
	var piece = this.matrix_with_pieces[this.move.to[0]][this.move.to[1]];
	if (piece && piece.type === 'P') {
		var move_obj = {};
		move_obj["board." + this.move.to[0] + '.' + this.move.to[1] + '.placed.promote'] = true;
		if (this.move.to[1] === 7 && this.matrix_with_pieces[this.move.to[0]][this.move.to[1]].color === 'w') {
			Games.update(this.game_id, {
				$set: move_obj
			});
		} else if (this.move.to[1] === 0 && this.matrix_with_pieces[this.move.to[0]][this.move.to[1]].color === 'b') {
			Games.update(this.game_id, {
				$set: move_obj
			});
		}
	}
}

BoardMatrix.prototype._isChechMate = function() {
	if (!this._isChech(true))
		return false;
	var initial_check_from = this.chech_from;

	var opponent = (this.next_move === 'w') ? 'b' : 'w';

	var king_position = this._getKingPosition(opponent);
	var moves = this.matrix_with_pieces[king_position[0]][king_position[1]].getMoves(this.matrix);

	var takings = this._getAllTakings(true);
	for (var i = 0; i < takings.length; i++) {
		if (takings[i] && initial_check_from && takings[i].to[0] === initial_check_from[0] && takings[i].to[1] === initial_check_from[1]) {
			return false;
		}
	}

	//try to protect the king
	var opponent = (this.next_move === 'w') ? 'b' : 'w';
	var moves = this._getAllMoves(opponent);
	for (var i = 0; i < moves.length; i++) {
		this.move = moves[i];
		this._moveOnBoard();
		if (!this._isChech(true)) {
			this._invalidateMoveOnBoard();
			return false;
		} else {
			this._invalidateMoveOnBoard();
		}
	}

	if (_.isEmpty(moves))
		return true;

	//try to run
	for (var i = 0; i < moves.length; i++) {
		this.move = moves[i];
		this._moveOnBoard();
		if (!this._isChech(true)) {
			this._invalidateMoveOnBoard();
			return false;
		} else {
			this._invalidateMoveOnBoard();
		}
	}

	return true;
}

BoardMatrix.prototype._writeToDb = function() {
	var columns = 'abcdefgh'.split('');
	var capture;
	var move_obj = {};
	var piece_letter = this.moved_on_matrix.from.piece[1];

	if (this.moved_on_matrix.to.piece) {
		capture = true;
	}
	var move_str = (piece_letter !== 'P' ? piece_letter : '') + (capture ? 'x' : '') + columns[this.move.to[0]] + (this.move.to[1] + 1);

	if (this._isChech(true))
		move_str += '+';

	GameMoves.insert({
		game_id: this.game._id,
		move: move_str,
		move_coordinates: this.move,
		player: this.next_move
	});

	move_obj["board." + this.move.from[0] + '.' + this.move.from[1] + '.placed'] = {};
	move_obj["board." + this.move.to[0] + '.' + this.move.to[1] + '.placed'] = this.matrix[this.move.to[0]][this.move.to[1]].placed;

	move_obj.next_move = (this.next_move === 'w') ? 'b' : 'w';

	Games.update(this.game_id, {
		$set: move_obj
	});
}