Antichess = function(_id, userId) {
	var game_id = _id;
	var self = this;

	var Board = new BoardMatrix(game_id, userId);

	this.move = function(move) {
		Board.setMove(move);
		Board.executeMove();

	}
}

function Piece(position) {
	this.position = position;
	this.color;
	this.moves;

	this.getMoves = function(board_matrix) {
		return this.generateMoves(board_matrix);
	}
}

Piece.prototype._getNormalMoves = function(board_matrix) {
	var moves = [];
	var player = this.color;
	var opponent = (this.color === 'w') ? 'b' : 'w';

	for (var i = this.position[0] + 1; i < 8; i++) { //right
		if (board_matrix[i][this.position[1]].placed.piece && board_matrix[i][this.position[1]].placed.piece[0] === player) {
			break;
		} else if (!board_matrix[i][this.position[1]].placed.piece || (board_matrix[i][this.position[1]].placed.piece && board_matrix[i][this.position[1]].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [i, this.position[1]]
			});
		}
		if (board_matrix[i][this.position[1]].placed.piece)
			break;
	}
	for (var i = this.position[0] - 1; i >= 0; i--) { //left
		if (board_matrix[i][this.position[1]].placed.piece && board_matrix[i][this.position[1]].placed.piece[0] === player) {
			break;
		} else if (!board_matrix[i][this.position[1]].placed.piece || (board_matrix[i][this.position[1]].placed.piece && board_matrix[i][this.position[1]].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [i, this.position[1]]
			});
		}
		if (board_matrix[i][this.position[1]].placed.piece)
			break;
	}
	for (var j = this.position[1] + 1; j < 8; j++) { //up
		if (board_matrix[this.position[0]][j].placed.piece && board_matrix[this.position[0]][j].placed.piece[0] === player) {
			break;
		} else if (!board_matrix[this.position[0]][j].placed.piece || (board_matrix[this.position[0]][j].placed.piece && board_matrix[this.position[0]][j].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [this.position[0], j]
			});
		}
		if (board_matrix[this.position[0]][j].placed.piece)
			break;
	}
	for (var j = this.position[1] - 1; j >= 0; j--) { //down
		if (board_matrix[this.position[0]][j].placed.piece && board_matrix[this.position[0]][j].placed.piece[0] === player) {
			break;
		} else if (!board_matrix[this.position[0]][j].placed.piece || (board_matrix[this.position[0]][j].placed.piece && board_matrix[this.position[0]][j].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [this.position[0], j]
			});
		}
		if (board_matrix[this.position[0]][j].placed.piece)
			break;
	}
	return moves
}

Piece.prototype._getDiegonalMoves = function(board_matrix) {
	var i, j;
	var moves = [];
	var player = this.color;
	var opponent = (this.color === 'w') ? 'b' : 'w';


	i = this.position[0] + 1;
	j = this.position[1] + 1;
	while (i < 8 && j < 8) {
		if (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === player)
			break;
		if (!board_matrix[i][j].placed.piece || (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [i, j]
			});
		}
		if (board_matrix[i][j].placed.piece)
			break;
		i++;
		j++;
	}
	i = this.position[0] + 1;
	j = this.position[1] - 1;
	while (i < 8 && j >= 0) {
		if (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === player)
			break;
		if (!board_matrix[i][j].placed.piece || (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [i, j]
			});
		}
		if (board_matrix[i][j].placed.piece)
			break;
		i++;
		j--;
	}
	i = this.position[0] - 1;
	j = this.position[1] + 1;
	while (i >= 0 && j < 8) {
		if (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === player)
			break;
		if (!board_matrix[i][j].placed.piece || (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [i, j]
			});
		}
		if (board_matrix[i][j].placed.piece)
			break;
		i--;
		j++;
	}
	i = this.position[0] - 1;
	j = this.position[1] - 1;
	while (i >= 0 && j >= 0) {
		if (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === player)
			break;
		if (!board_matrix[i][j].placed.piece || (board_matrix[i][j].placed.piece && board_matrix[i][j].placed.piece[0] === opponent)) {
			moves.push({
				from: this.position,
				to: [i, j]
			});
		}
		if (board_matrix[i][j].placed.piece)
			break;
		i--;
		j--;
	}
	return moves;
}

function King(position) {
	this.type = 'K';
	Piece.apply(this, arguments);
}

King.prototype.generateMoves = function(board_matrix) {
	var moves = [];
	var opponent = (this.color === 'w') ? 'b' : 'w';
	var self = this;

	var possible = [
		[this.position[0] + 1, this.position[1] + 1],
		[this.position[0] + 1, this.position[1] - 1],
		[this.position[0] - 1, this.position[1] + 1],
		[this.position[0] - 1, this.position[1] - 1],
		[this.position[0], this.position[1] + 1],
		[this.position[0], this.position[1] - 1],
		[this.position[0] + 1, this.position[1]],
		[this.position[0] - 1, this.position[1]],
	];
	_.each(possible, function(p) {
		if (board_matrix[p[0]] && board_matrix[p[0]][p[1]] && (_.isEmpty(board_matrix[p[0]][p[1]].placed) || board_matrix[p[0]][p[1]].placed.piece[0] === opponent)) {
			moves.push({
				from: self.position,
				to: p
			});
		}
	});
	return moves;
}

function Queen(position) {
	this.type = 'Q';
	Piece.apply(this, arguments);
}
Queen.prototype = Object.create(Piece.prototype);
Queen.prototype.constructor = Queen;

Queen.prototype.generateMoves = function(board_matrix) {
	var moves = _.union(this._getDiegonalMoves(board_matrix), this._getNormalMoves(board_matrix));
	return moves;
}

function Rock(position) {
	this.type = 'R';
	Piece.apply(this, arguments);
}
Rock.prototype = Object.create(Piece.prototype);
Rock.prototype.constructor = Rock;

Rock.prototype.generateMoves = function(board_matrix) {
	var moves = this._getNormalMoves(board_matrix);
	return moves;
}

function Bishop(position) {
	this.type = 'B';
	Piece.apply(this, arguments);
}
Bishop.prototype = Object.create(Piece.prototype);
Bishop.prototype.constructor = Bishop;

Bishop.prototype.generateMoves = function(board_matrix) {
	var moves = this._getDiegonalMoves(board_matrix);
	return moves;
}

function Knight(position) {
	this.type = 'N';
	Piece.apply(this, arguments);
}

Knight.prototype.generateMoves = function(board_matrix) {
	var moves = [];
	var opponent = (this.color === 'w') ? 'b' : 'w';
	var self = this;

	var possible = [
		[this.position[0] + 1, this.position[1] + 2],
		[this.position[0] + 1, this.position[1] - 2],
		[this.position[0] - 1, this.position[1] + 2],
		[this.position[0] - 1, this.position[1] - 2],
		[this.position[0] + 2, this.position[1] + 1],
		[this.position[0] + 2, this.position[1] - 1],
		[this.position[0] - 2, this.position[1] + 1],
		[this.position[0] - 2, this.position[1] - 1],
	];
	_.each(possible, function(p) {
		if (board_matrix[p[0]] && board_matrix[p[0]][p[1]] && (!board_matrix[p[0]][p[1]].placed.piece || board_matrix[p[0]][p[1]].placed.piece[0] === opponent)) {
			moves.push({
				from: self.position,
				to: p
			});
		}
	});
	return moves;
}

function Pawn(position) {
	this.type = 'P';
	Piece.apply(this, arguments);
}
Pawn.prototype.generateMoves = function(board_matrix) {
	var moves = [];
	var possible;
	var opponent = (this.color === 'w') ? 'b' : 'w';
	var self = this;

	if (this.color === 'w') {
		possible = [
			[this.position[0] + 1, this.position[1] + 1],
			[this.position[0] - 1, this.position[1] + 1],
			[this.position[0], this.position[1] + 1],
		];
		if (this.position[1] === 1) {
			possible.push([this.position[0], this.position[1] + 2]);
		}
	} else {
		possible = [
			[this.position[0] + 1, this.position[1] - 1],
			[this.position[0] - 1, this.position[1] - 1],
			[this.position[0], this.position[1] - 1],
		];
		if (this.position[1] === 6) {
			possible.push([this.position[0], this.position[1] - 2]);
		}
	}
	_.each(possible, function(p, ind) {
		if (!board_matrix[p[0]] || (board_matrix[p[0]] && !board_matrix[p[0]][p[1]]))
			return;

		if (ind < 2 && !_.isEmpty(board_matrix[p[0]][p[1]].placed.piece) && board_matrix[p[0]][p[1]].placed.piece[0] === opponent) {
			moves.push({
				from: self.position,
				to: p
			});
		} else if (ind === 2 && _.isEmpty(board_matrix[p[0]][p[1]].placed)) {
			moves.push({
				from: self.position,
				to: p
			});
		} else if (ind === 3 && _.isEmpty(board_matrix[possible[ind][0]][possible[ind][1]].placed) && _.isEmpty(board_matrix[possible[ind - 1][0]][possible[ind - 1][1]].placed)) {
			moves.push({
				from: self.position,
				to: p
			});
		}
	});
	return moves;
}


function BoardMatrix(game_id, userId) {
	this.game_id = game_id;
	this.game = Games.findOne(this.game_id);

	this.setStart();

	this.matrix = this.game.board;
	this.matrix_with_pieces = [];
	this.next_move = this.game.next_move;
	this.userId = userId;

	this.whitePlayerId = this.game.players.white;
	this.blackPlayerId = this.game.players.black;

	this.move = [];

	this.chech_from;

	this._generateMatrixWithPieces();
}

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

BoardMatrix.prototype.setMove = function(m) {
	this.move = m;
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

BoardMatrix.prototype._validateTakings = function() {
	var takings = this._getAllTakings();
	var taking_move = false;
	var self = this;
	if (this._isChech()) {
		if (this.move.to[0] !== this.chech_from[0] && this.move.to[1] !== this.chech_from[1]) {
			var chech_takings = [];
			var is_take_move = false;
			_.each(takings, function(take_move) {
				if (take_move.to[0] === self.chech_from[0] && take_move.to[1] === self.chech_from[1]) { //we can take it - true
					var old_move = self.move, old_chech_from = self.chech_from;
					self.move = take_move;
					self._moveOnBoard();
					if(!self._isChech())
						chech_takings.push(take_move);
					self._invalidateMoveOnBoard();
					self.move = old_move;
					self.chech_from = old_chech_from;
				}
			});
			if (chech_takings.length > 0) {
				throw new Meteor.Error(TAKE_ERROR, "You must take!!!!!!", chech_takings);
			} else {
				return;
			}
		}
	}

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

BoardMatrix.prototype._getKingPosition = function(color) {
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			if (this.matrix_with_pieces[i][j] && this.matrix_with_pieces[i][j].color === color && this.matrix_with_pieces[i][j].type === 'K')
				return this.matrix_with_pieces[i][j].position
		}
	}
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

BoardMatrix.prototype._validatePlayer = function() {
	if (this._getPieceColor() !== this.next_move) {
		throw new Meteor.Error(NOT_MY_MOVE, "Not your move");
	}
	//needs to be commented out on testing
	// if (this.next_move === 'w' && this.whitePlayerId !== this.userId)
	// 	throw new Meteor.Error(NOT_MY_MOVE, "User exception");
	// if (this.next_move === 'b' && this.blackPlayerId !== this.userId)
	// 	throw new Meteor.Error(NOT_MY_MOVE, "User exception");
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