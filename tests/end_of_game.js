assert = require('assert');
suite('end of game test', function() {
    test('end with only king left', function(done, server, client) {
        server.eval(function() {
            Meteor.methods({
                getBoard: function(game_id) {
                    return Games.findOne(game_id);
                }
            })
        });
        client.eval(function() {
            Meteor.call('createGame', 'white', '10', function(err, res) {
                if(!err) {
                    var game_id = res;
                    Meteor.apply('joinGame', [game_id], true, function(err, res) {
                        if (err) {
                            emit('create', false);
                        } else {
                            emit('create', true);
                        }
                    });
                    var moves = [
                        { from: [ 3, 1 ], to: [ 3, 3 ] },
                        { from: [ 4, 6 ], to: [ 4, 4 ] },
                        { from: [ 3, 3 ], to: [ 4, 4 ] },
                        { from: [ 5, 6 ], to: [ 5, 5 ] },
                        { from: [ 4, 4 ], to: [ 5, 5 ] },
                        { from: [ 6, 6 ], to: [ 5, 5 ] },
                        { from: [ 2, 0 ], to: [ 6, 4 ] },
                        { from: [ 3, 0 ], to: [ 3, 6 ] },
                        { from: [ 3, 7 ], to: [ 3, 6 ] },
                        { from: [ 2, 0 ], to: [ 6, 4 ] },
                        { from: [ 5, 5 ], to: [ 7, 4 ] },
                        { from: [ 5, 5 ], to: [ 6, 4 ] },
                        { from: [ 7, 1 ], to: [ 7, 3 ] },
                        { from: [ 6, 4 ], to: [ 7, 3 ] },
                        { from: [ 7, 0 ], to: [ 7, 3 ] },
                        { from: [ 3, 6 ], to: [ 3, 0 ] },
                        { from: [ 7, 3 ], to: [ 7, 4 ] },
                        { from: [ 4, 0 ], to: [ 3, 0 ] },
                        { from: [ 5, 7 ], to: [ 7, 5 ] },
                        { from: [ 7, 3 ], to: [ 7, 5 ] },
                        { from: [ 6, 7 ], to: [ 7, 5 ] },
                        { from: [ 6, 1 ], to: [ 6, 3 ] },
                        { from: [ 2, 7 ], to: [ 6, 3 ] },
                        { from: [ 6, 0 ], to: [ 5, 2 ] },
                        { from: [ 6, 3 ], to: [ 5, 2 ] },
                        { from: [ 4, 1 ], to: [ 5, 2 ] },
                        { from: [ 7, 5 ], to: [ 6, 3 ] },
                        { from: [ 5, 2 ], to: [ 6, 3 ] },
                        { from: [ 5, 0 ], to: [ 5, 0 ] },
                        { from: [ 1, 6 ], to: [ 1, 4 ] },
                        { from: [ 5, 0 ], to: [ 1, 4 ] },
                        { from: [ 1, 7 ], to: [ 2, 5 ] },
                        { from: [ 1, 4 ], to: [ 2, 5 ] },
                        { from: [ 7, 6 ], to: [ 7, 4 ] },
                        { from: [ 4, 7 ], to: [ 5, 7 ] },
                        { from: [ 2, 5 ], to: [ 0, 7 ] },
                        { from: [ 7, 6 ], to: [ 7, 4 ] },
                        { from: [ 6, 3 ], to: [ 6, 3 ] },
                        { from: [ 6, 3 ], to: [ 7, 4 ] },
                        { from: [ 7, 7 ], to: [ 7, 4 ] },
                        { from: [ 3, 0 ], to: [ 4, 0 ] },
                        { from: [ 7, 4 ], to: [ 7, 0 ] },
                        { from: [ 4, 0 ], to: [ 4, 1 ] },
                        { from: [ 0, 7 ], to: [ 7, 0 ] },
                        { from: [ 2, 6 ], to: [ 2, 5 ] },
                        { from: [ 7, 0 ], to: [ 2, 5 ] },
                        { from: [ 0, 6 ], to: [ 0, 4 ] },
                        { from: [ 2, 5 ], to: [ 3, 6 ] },
                        { from: [ 0, 4 ], to: [ 0, 3 ] },
                        { from: [ 3, 6 ], to: [ 0, 3 ] }
                    ];
                    _.each(moves, function(move, ind) {
                        Meteor.apply('movePiece', [move, game_id], true, function(err, res) {
                            if (err) {
                                emit('move', err, ind);
                            } else {
                                emit('move', res, ind);
                            }
                        });
                        if(ind === moves.length - 1) {
                            Meteor.call('getBoard', game_id, function(err, res) {
                                if (err) {
                                    emit('end', err);
                                } else {
                                    emit('end', res);
                                }
                            });
                        }
                    });
                }
            });
        });
        client.once('create', function(res){
            assert.equal(res, true, 'We got error on board init');
        });
        client.on('move', function(res, ind) {
            if(res && res.error && (res.error !== 1 && res.error !== 2 && res.error !==3 && res.error !== 5)) {
                assert.fail(null, null, 'Got unexpected error ' + res.reason, '###');
            }
        });
        client.once('end', function(game) {
            if(!game) {
                assert.fail(null, null, 'Got undefined for game', null);
            } else if(!game.won) {
                assert.fail(null, null, 'Won not updated', null);
            } else {
                done();
            }
        });
    });
    test('Resign', function(done, server, client) {
        server.eval(function() {
            Meteor.methods({
                getBoard: function(game_id) {
                    return Games.findOne(game_id);
                }
            })
        });
        client.eval(function() {
            Meteor.call('createGame', 'white', '10', function(err, res) {
                if(!err) {
                    var game_id = res;
                    Meteor.apply('joinGame', [game_id], true, function(err, res) {
                        if (err) {
                            emit('create', false);
                        } else {
                            emit('create', true);
                        }
                    });
                    
                    Meteor.call('resign', game_id, function(err, res) {
                        if(err) {
                            emit('resign', err);
                        }
                    });
                    Meteor.call('getBoard', game_id, function(err, res) {
                        if (err) {
                            emit('end', err);
                        } else {
                            emit('end', res);
                        }
                    });
                }
            });
        });
        client.once('create', function(res){
            assert.equal(res, true, 'We got error on board init');
        });
        client.once('end', function(game) {
            if(!game) {
                assert.fail(null, null, 'Got undefined for game', null);
            } else if(!game.won) {
                assert.fail(null, null, 'Won not updated', null);
            } else {
                done();
            }
        });
        client.once('resign', function(err) {
            assert.fail(null, null, 'We got error forom resign method call', null)
        })
    });
})