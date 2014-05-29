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

King = function(position) {
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

Queen = function(position) {
	this.type = 'Q';
	Piece.apply(this, arguments);
}
Queen.prototype = Object.create(Piece.prototype);
Queen.prototype.constructor = Queen;

Queen.prototype.generateMoves = function(board_matrix) {
	var moves = _.union(this._getDiegonalMoves(board_matrix), this._getNormalMoves(board_matrix));
	return moves;
}

Rock = function(position) {
	this.type = 'R';
	Piece.apply(this, arguments);
}
Rock.prototype = Object.create(Piece.prototype);
Rock.prototype.constructor = Rock;

Rock.prototype.generateMoves = function(board_matrix) {
	var moves = this._getNormalMoves(board_matrix);
	return moves;
}

Bishop = function(position) {
	this.type = 'B';
	Piece.apply(this, arguments);
}
Bishop.prototype = Object.create(Piece.prototype);
Bishop.prototype.constructor = Bishop;

Bishop.prototype.generateMoves = function(board_matrix) {
	var moves = this._getDiegonalMoves(board_matrix);
	return moves;
}

Knight = function(position) {
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

Pawn = function(position) {
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