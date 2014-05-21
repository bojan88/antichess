assert = require('assert');
console.warn('You must comment out user check in server/validators/antichess.js:BoardMatrix.prototype._validatePlayer');
suite('check and checkmate', function() {
    test('checkmate with rock on 7,0', function(done, server, client) {
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
                        { from: [ 7, 1 ], to: [ 7, 3 ] },
                        { from: [ 6, 6 ], to: [ 6, 4 ] },
                        { from: [ 7, 3 ], to: [ 6, 4 ] },
                        { from: [ 0, 6 ], to: [ 0, 5 ] },
                        { from: [ 7, 0 ], to: [ 7, 6 ] },
                        { from: [ 7, 7 ], to: [ 7, 6 ] },
                        { from: [ 6, 0 ], to: [ 5, 2 ] },
                        { from: [ 7, 6 ], to: [ 7, 7 ] },
                        { from: [ 5, 2 ], to: [ 3, 3 ] },
                        { from: [ 7, 7 ], to: [ 7, 6 ] },
                        { from: [ 6, 1 ], to: [ 6, 3 ] },
                        { from: [ 7, 6 ], to: [ 7, 7 ] },
                        { from: [ 5, 0 ], to: [ 7, 2 ] },
                        { from: [ 7, 7 ], to: [ 7, 2 ] },
                        { from: [ 3, 3 ], to: [ 5, 4 ] },
                        { from: [ 7, 2 ], to: [ 7, 0 ] }
                    ]
                    _.each(moves, function(move, ind) {
                        Meteor.apply('movePiece', [move, game_id], true, function(err, res) {
                            if (err) {
                                emit('move', err, ind);
                            } else {
                                emit('move', res, ind);
                            }
                        });
                    });
                }
            });
        });
        client.once('create', function(res){
            assert.equal(res, true, 'We got error on board init');
        });
        client.on('move', function(res, ind) {
            if(res && res.error) {
                assert.equal(ind, 15, 'We got error before we expected it');
                assert.equal(res.error, 3, 'We got some other error');
                done();
            }
            if(ind === 15 && !res) {
                assert.fail(null, null, 'We expected chech mate, got nothing');
            } else if(ind === 15 && res.error !== 3) {
                assert.fail(null, null, 'We expected chech mate, got another error');
            }
        });
    });

    test('check with mask', function(done, server, client) {
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
                        { from: [ 3, 1 ], to: [ 3, 3 ] }, //0
                        { from: [ 4, 6 ], to: [ 4, 4 ] }, //1
                        { from: [ 3, 3 ], to: [ 3, 4 ] }, //2
                        { from: [ 3, 3 ], to: [ 4, 4 ] }, //3
                        { from: [ 5, 6 ], to: [ 5, 5 ] }, //4
                        { from: [ 6, 1 ], to: [ 6, 2 ] }, //5
                        { from: [ 3, 0 ], to: [ 3, 6 ] }, //6
                        { from: [ 5, 5 ], to: [ 4, 4 ] }, //7
                        { from: [ 2, 7 ], to: [ 3, 6 ] }, //8
                        { from: [ 4, 4 ], to: [ 5, 5 ] }, //9
                        { from: [ 6, 6 ], to: [ 5, 5 ] }, //10
                        { from: [ 4, 0 ], to: [ 3, 0 ] }, //11
                        { from: [ 1, 7 ], to: [ 0, 5 ] }, //12
                        { from: [ 2, 0 ], to: [ 3, 1 ] }, //13
                        { from: [ 3, 6 ], to: [ 2, 7 ] }, //14
                        { from: [ 3, 1 ], to: [ 2, 0 ] }, //15
                        { from: [ 3, 1 ], to: [ 7, 5 ] }, //16
                        { from: [ 3, 0 ], to: [ 4, 0 ] }, //17
                        { from: [ 0, 5 ], to: [ 1, 7 ] }, //18
                        { from: [ 3, 7 ], to: [ 3, 1 ] }, //19
                        { from: [ 4, 0 ], to: [ 3, 0 ] }, //20
                        { from: [ 4, 0 ], to: [ 3, 1 ] } //21
                    ];

                    _.each(moves, function(move, ind) {
                        Meteor.apply('movePiece', [move, game_id], true, function(err, res) {
                            if (err) {
                                emit('move', err, ind);
                            } else {
                                emit('move', res, ind);
                            }
                        });
                    }); 
                }
            });
        });
        client.once('create', function(res){
            assert.equal(res, true, 'We got error on board init');
        });
        client.on('move', function(res, ind) {
            if(ind === 2 && !res) {
                assert.fail(null, 1, 'Expected taking error', '###');
            }
            if(ind === 5 && !res) {
                assert.fail(null, 1, 'Expected taking error', '###');
            }
            if(ind === 7 && !res) {
                assert.fail(null, 3, 'Expected chech error', '###');
            }
            if(ind === 15 && !res) {
                assert.fail(null, 3, 'Expected chech error', '###');
            }
            if(ind === 16 && !res) {
                assert.fail(null, 3, 'Expected chech error', '###');
            }
            if(ind === 18 && !res) {
                assert.fail(null, 1, 'Expected taking error', '###');
            }
            if(ind === 20 && !res) {
                //this should be changed to taking error because we can take the piece that's makig check
                assert.fail(null, 1, 'Expected taking error', '###');
            }
            if(ind === 21) {
                done();
            }
        });
    });
    test('another checkmate test', function(done, server, client) {
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
                        { from: [ 3, 1 ], to: [ 3, 3 ] }, //0
                        { from: [ 4, 6 ], to: [ 4, 4 ] }, //1
                        { from: [ 3, 3 ], to: [ 4, 4 ] }, //2
                        { from: [ 5, 6 ], to: [ 5, 5 ] }, //3
                        { from: [ 3, 0 ], to: [ 3, 6 ] }, //4
                        { from: [ 3, 7 ], to: [ 3, 6 ] }, //5
                        { from: [ 4, 4 ], to: [ 5, 5 ] }, //6
                        { from: [ 6, 6 ], to: [ 5, 5 ] }, //7
                        { from: [ 2, 0 ], to: [ 7, 5 ] }, //8
                        { from: [ 5, 7 ], to: [ 7, 5 ] }, //9
                        { from: [ 5, 1 ], to: [ 5, 3 ] }, //10
                        { from: [ 7, 5 ], to: [ 5, 3 ] }, //11
                        { from: [ 6, 1 ], to: [ 6, 2 ] }, //12
                        { from: [ 5, 3 ], to: [ 6, 2 ] }, //13
                        { from: [ 4, 0 ], to: [ 3, 0 ] }, //14
                        { from: [ 7, 1 ], to: [ 6, 2 ] } //15
                    ];

                    _.each(moves, function(move, ind) {
                        Meteor.apply('movePiece', [move, game_id], true, function(err, res) {
                            if (err) {
                                emit('move', err, ind);
                            } else {
                                emit('move', res, ind);
                            }
                        });
                    });
                }
            });
        });
        client.once('create', function(res){
            assert.equal(res, true, 'We got error on board init');
        });
        client.on('move', function(res, ind) {
            if(ind === 14 && res && res.error !== 1) {
                assert.equal(res.error, 1, 'Expected taking error on move ' + ind + ' got ' + res.message, '###');
            }
            if(ind === 13 && res && res.error === 3) {
                assert.fail(res.error, 3, 'Unexpected checkmate error on move ' + ind, '###');
            } else if(ind !== 13 && ind !== 14 && res) {
                assert.equal(res.error, 3, 'Unexpected error on move ' + ind, '###');
            }
            if(ind === 15) {
                done();
            }
        });
    });
    test('protect king under chech', function(done, server, client) {
        client.eval(function() {
            Meteor.call('createGame', 'white', '10', function(err, res) {
                if(!err) {
                    var game_id = res
                    Meteor.apply('joinGame', [game_id], true, function(err, res) {
                        if (err) {
                            emit('create', false);
                        } else {
                            emit('create', true);
                        }
                    });
                    var moves = [
                        { from: [ 2, 1 ], to: [ 2, 3 ] }, //0
                        { from: [ 3, 6 ], to: [ 3, 4 ] }, //1
                        { from: [ 2, 3 ], to: [ 3, 4 ] }, //2
                        { from: [ 3, 7 ], to: [ 3, 4 ] }, //3
                        { from: [ 4, 1 ], to: [ 4, 3 ] }, //4
                        { from: [ 3, 4 ], to: [ 4, 3 ] }, //5
                        { from: [ 5, 0 ], to: [ 4, 1 ] } //6
                    ];

                    _.each(moves, function(move, ind) {
                        Meteor.apply('movePiece', [move, game_id], true, function(err, res) {
                            if (err) {
                                emit('move', err, ind);
                            } else {
                                emit('move', res, ind);
                            }
                        });
                    });
                }
            });
        });
        client.once('create', function(res){
            assert.equal(res, true, 'We got error on board init');
        });
        client.on('move', function(res, ind) {
            if(res) {
                assert.fail(null, null, 'Got unexpected error on move ' + ind);
            }
            if(ind === 6) {
                done();
            }
        });
    });
});