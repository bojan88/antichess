BoardMatrix.prototype.executeMove = function() {
	this._validatePlayer();

	this._validateTakings();

	this._validateMove();

	this._moveOnBoard();

	if (this._isChech()) {
		throw new Meteor.Error(CHESS_ERROR, "Chech!!!");
	}

	this._writeToDb();
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

	move_obj[this.move.from[0] + '.' + this.move.from[1] + '.placed'] = {};
	move_obj[this.move.to[0] + '.' + this.move.to[1] + '.placed'] = this.matrix[this.move.to[0]][this.move.to[1]].placed;

	var next_move = (this.next_move === 'w') ? 'b' : 'w';

	GameBoard._collection.update(this.board_id, {
		$set: move_obj
	});
	Games._collection.update(this.game_id, {
		$set: {
			next_move: next_move
		}
	})

	GameMoves.insert({
		game_id: this.game._id,
		move: move_str,
		move_coordinates: this.move,
		player: this.next_move
	});
}