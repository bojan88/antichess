BoardMatrix = function(game_id, userId) {
	this.game_id = game_id;
	this.game = Games.findOne(this.game_id);
	this.board_id = this.game.board_id

	if(Meteor.isServer) {
		this.setStart(); //start the timers
	}

	this.matrix = GameBoard.findOne(this.board_id);
	this.matrix_with_pieces = [];
	this.next_move = this.game.next_move;
	this.userId = userId;

	this.whitePlayerId = this.game.players.white;
	this.blackPlayerId = this.game.players.black;

	this.move = [];

	this.chech_from;

	this._generateMatrixWithPieces();
}

BoardMatrix.prototype._validatePlayer = function() {
	if (this._getPieceColor() !== this.next_move) {
		throw new Meteor.Error(NOT_MY_MOVE, "Not your move");
	}
	//needs to be commented out on testing
	if (this.next_move === 'w' && this.whitePlayerId !== this.userId)
		throw new Meteor.Error(NOT_MY_MOVE, "User exception");
	if (this.next_move === 'b' && this.blackPlayerId !== this.userId)
		throw new Meteor.Error(NOT_MY_MOVE, "User exception");
}

BoardMatrix.prototype.setMove = function(m) {
	this.move = m;
}

BoardMatrix.prototype._validateTakings = function() {
	var takings = this._getAllTakings();
	var taking_move = false;
	var self = this;

	for (var i = 0; i < takings.length; i++) {
		if (this.move.to[0] === takings[i].to[0] && this.move.to[1] === takings[i].to[1])
			taking_move = true;
	}

	var old_move = this.move, old_chech_from = this.chech_from;
	for(var i = 0; take_move = takings[i]; i++) {
		this.move = take_move;
		this._moveOnBoard();
		if(this._isChech()) {
			takings.splice(i, 1);
			i--;
		}
		this._invalidateMoveOnBoard();
	}
	this.move = old_move;
	this.chech_from = old_chech_from;
	if (takings.length > 0 && !taking_move) {
		throw new Meteor.Error(TAKE_ERROR, "You must take!!!!!!", takings);
	}
}

BoardMatrix.prototype._getAllTakings = function(opponent) {
	var moves, player;
	if (opponent) {
		player = (this.next_move === 'w') ? 'b' : 'w';
		moves = this._getAllMoves(player);
	} else {
		player = this.next_move;
		moves = this._getAllMoves(player);
	}
	var takings = [];
	for (var i = 0; i < moves.length; i++) {
		if (this.matrix_with_pieces[moves[i].to[0]][moves[i].to[1]] && this.matrix_with_pieces[moves[i].to[0]][moves[i].to[1]].color != player) {
			takings.push({
				from: moves[i].from,
				to: moves[i].to
			})
		}
	}
	return takings;
}

BoardMatrix.prototype._isChech = function(opponent_check) {
	var king_position, moves;
	var opponent = (this.next_move === 'w') ? 'b' : 'w';
	if (opponent_check) {
		king_position = this._getKingPosition(opponent);
		moves = this._getAllMoves(this.next_move);
	} else {
		king_position = this._getKingPosition(this.next_move);
		moves = this._getAllMoves(opponent);
	}

	for (var i = 0; i < moves.length; i++) {
		if (moves[i].to[0] === king_position[0] && moves[i].to[1] === king_position[1]) {
			this.chech_from = moves[i].from;
			return true;
		}
	}

	this.chech_from = null;
	return false;
}

BoardMatrix.prototype._getAllMoves = function(color) {
	var moves = [];
	var pieces = this._getAllPieces(color);
	var matrix = this.matrix;

	_.each(pieces, function(piece) {
		moves = _.union(moves, piece.getMoves(matrix));
	});

	return moves;
}

BoardMatrix.prototype._getAllPieces = function(color) {
	var pieces = [];
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			if (this.matrix_with_pieces[i][j] && (!color || this.matrix_with_pieces[i][j].color === color)) {
				pieces.push(this.matrix_with_pieces[i][j]);
			}
		}
	}
	return pieces;
}

BoardMatrix.prototype._moveOnBoard = function() {
	var move = this.move;
	this.moved_on_matrix = {
		from: this.matrix[move.from[0]][move.from[1]].placed,
		to: this.matrix[move.to[0]][move.to[1]].placed
	}

	this.matrix[move.to[0]][move.to[1]].placed = this.matrix[move.from[0]][move.from[1]].placed;
	this.matrix[move.from[0]][move.from[1]].placed = {};


	this.moved_on_matrix_with_pieces = {
		from: this.matrix_with_pieces[move.from[0]][move.from[1]],
		to: this.matrix_with_pieces[move.to[0]][move.to[1]]
	}

	this.matrix_with_pieces[move.from[0]][move.from[1]].position = move.to;
	this.matrix_with_pieces[move.to[0]][move.to[1]] = null;

	this.matrix_with_pieces[move.to[0]][move.to[1]] = this.matrix_with_pieces[move.from[0]][move.from[1]];
	this.matrix_with_pieces[move.from[0]][move.from[1]] = null;
}

BoardMatrix.prototype._invalidateMoveOnBoard = function() {
	var move = this.move;
	this.matrix[move.from[0]][move.from[1]].placed = this.moved_on_matrix.from;
	this.matrix[move.to[0]][move.to[1]].placed = this.moved_on_matrix.to;


	this.matrix_with_pieces[move.from[0]][move.from[1]] = this.moved_on_matrix_with_pieces.from;
	this.matrix_with_pieces[move.to[0]][move.to[1]] = this.moved_on_matrix_with_pieces.to;

	this.matrix_with_pieces[move.from[0]][move.from[1]].position = move.from;
	if (this.matrix_with_pieces[move.to[0]][move.to[1]])
		this.matrix_with_pieces[move.to[0]][move.to[1]].position = move.to;
}

BoardMatrix.prototype._validateMove = function() {
	var move = this.move;
	var moving_piece = this.matrix_with_pieces[move.from[0]][move.from[1]];
	var valid_piece_moves = moving_piece.getMoves(this.matrix);
	if (!_.find(valid_piece_moves, findMove))
		throw new Meteor.Error(ILLEGAL_MOVE_ERROR, "Illegal move");

	function findMove(el) {
		if (el.to[0] === move.to[0] && el.to[1] === move.to[1])
			return true;
	}
}

BoardMatrix.prototype._generateMatrixWithPieces = function() {
	for (var i = 0; i < 8; i++) {
		this.matrix_with_pieces[i] = [];
		for (var j = 0; j < 8; j++) {
			if (this.matrix[i][j].placed && this.matrix[i][j].placed.piece) {
				var type = this.matrix[i][j].placed.piece[1];
				switch (type) {
					case 'R':
						this.matrix_with_pieces[i][j] = new Rock([i, j]);
						break;
					case 'P':
						this.matrix_with_pieces[i][j] = new Pawn([i, j]);
						break;
					case 'N':
						this.matrix_with_pieces[i][j] = new Knight([i, j]);
						break;
					case 'B':
						this.matrix_with_pieces[i][j] = new Bishop([i, j]);
						break;
					case 'Q':
						this.matrix_with_pieces[i][j] = new Queen([i, j]);
						break;
					case 'K':
						this.matrix_with_pieces[i][j] = new King([i, j]);
						break;
					default:
						return;
				}
				var color = this.matrix[i][j].placed.piece[0];
				this.matrix_with_pieces[i][j].color = color;
			} else {
				this.matrix_with_pieces[i][j] = null;
			}
		}
	}
}

BoardMatrix.prototype._getPieceColor = function() {
	return this.matrix[this.move.from[0]][this.move.from[1]].placed.piece[0];
}


BoardMatrix.prototype._getKingPosition = function(color) {
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			if (this.matrix_with_pieces[i][j] && this.matrix_with_pieces[i][j].color === color && this.matrix_with_pieces[i][j].type === 'K')
				return this.matrix_with_pieces[i][j].position
		}
	}
}