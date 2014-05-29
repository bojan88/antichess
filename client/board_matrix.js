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
	var move_obj = {};
	var piece_letter = this.moved_on_matrix.from.piece[1];

	move_obj["board." + this.move.from[0] + '.' + this.move.from[1] + '.placed'] = {};
	move_obj["board." + this.move.to[0] + '.' + this.move.to[1] + '.placed'] = this.matrix[this.move.to[0]][this.move.to[1]].placed;

	move_obj.next_move = (this.next_move === 'w') ? 'b' : 'w';

	Games._collection.update(this.game_id, {
		$set: move_obj
	});
}