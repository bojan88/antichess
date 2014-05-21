assert = require('assert');
suite('pawn promotion test', function() {
    test('promote pawn', function(done, server, client) {
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
                        { from: [ 2, 1 ], to: [ 2, 3 ] }, //0
                        { from: [ 3, 6 ], to: [ 3, 4 ] }, //1
                        { from: [ 2, 3 ], to: [ 3, 4 ] }, //2
                        { from: [ 4, 6 ], to: [ 4, 5 ] }, //3
                        { from: [ 3, 7 ], to: [ 3, 4 ] }, //4
                        { from: [ 4, 1 ], to: [ 4, 3 ] }, //5
                        { from: [ 3, 4 ], to: [ 3, 1 ] }, //6
                        { from: [ 3, 0 ], to: [ 3, 1 ] }, //7
                        { from: [ 5, 6 ], to: [ 5, 6 ] }, //8
                        { from: [ 2, 7 ], to: [ 5, 4 ] }, //9
                        { from: [ 4, 3 ], to: [ 5, 4 ] }, //10
                        { from: [ 6, 6 ], to: [ 6, 5 ] }, //11
                        { from: [ 5, 4 ], to: [ 6, 5 ] }, //12
                        { from: [ 5, 6 ], to: [ 6, 5 ] }, //13
                        { from: [ 3, 1 ], to: [ 3, 7 ] }, //14
                        { from: [ 4, 7 ], to: [ 5, 6 ] }, //15
                        { from: [ 4, 7 ], to: [ 3, 7 ] }, //16
                        { from: [ 2, 0 ], to: [ 7, 5 ] }, //17
                        { from: [ 5, 7 ], to: [ 7, 5 ] }, //18
                        { from: [ 1, 0 ], to: [ 3, 1 ] }, //19
                        { from: [ 7, 5 ], to: [ 3, 1 ] }, //20
                        { from: [ 4, 0 ], to: [ 3, 1 ] }, //21
                        { from: [ 5, 0 ], to: [ 0, 5 ] }, //22
                        { from: [ 1, 6 ], to: [ 1, 4 ] }, //23
                        { from: [ 5, 0 ], to: [ 1, 4 ] }, //24
                        { from: [ 1, 7 ], to: [ 2, 5 ] }, //25
                        { from: [ 1, 4 ], to: [ 2, 5 ] }, //26
                        { from: [ 6, 7 ], to: [ 5, 5 ] }, //27
                        { from: [ 2, 5 ], to: [ 0, 7 ] }, //28
                        { from: [ 6, 1 ], to: [ 6, 3 ] }, //29
                        { from: [ 5, 5 ], to: [ 3, 6 ] }, //30
                        { from: [ 0, 7 ], to: [ 5, 2 ] }, //31
                        { from: [ 2, 6 ], to: [ 2, 4 ] }, //32
                        { from: [ 3, 1 ], to: [ 4, 0 ] }, //33
                        { from: [ 2, 4 ], to: [ 2, 3 ] }, //34
                        { from: [ 1, 1 ], to: [ 1, 2 ] }, //35
                        { from: [ 2, 3 ], to: [ 1, 2 ] }, //36
                        { from: [ 0, 1 ], to: [ 1, 2 ] }, //37
                        { from: [ 3, 6 ], to: [ 2, 4 ] }, //38
                        { from: [ 5, 2 ], to: [ 1, 6 ] }, //39
                        { from: [ 0, 0 ], to: [ 0, 6 ] }, //40
                        { from: [ 2, 4 ], to: [ 1, 6 ] }, //41
                        { from: [ 2, 4 ], to: [ 1, 2 ] }, //42
                        { from: [ 0, 6 ], to: [ 0, 4 ] }, //43
                        { from: [ 0, 6 ], to: [ 4, 6 ] }, //44
                        { from: [ 5, 2 ], to: [ 5, 2 ] }, //45
                        { from: [ 1, 2 ], to: [ 0, 4 ] }, //46
                        { from: [ 3, 7 ], to: [ 4, 6 ] }, //47
                        { from: [ 1, 2 ], to: [ 1, 2 ] }, //48
                        { from: [ 7, 6 ], to: [ 7, 4 ] }, //49
                        { from: [ 5, 2 ], to: [ 7, 4 ] }, //50
                        { from: [ 6, 5 ], to: [ 7, 4 ] }, //51
                        { from: [ 6, 0 ], to: [ 5, 2 ] }, //52
                        { from: [ 7, 4 ], to: [ 7, 3 ] }, //53
                        { from: [ 5, 2 ], to: [ 7, 3 ] }, //54
                        { from: [ 7, 6 ], to: [ 7, 5 ] }, //55
                        { from: [ 5, 1 ], to: [ 5, 3 ] }, //56
                        { from: [ 4, 6 ], to: [ 3, 5 ] }, //57
                        { from: [ 7, 3 ], to: [ 6, 5 ] }, //58
                        { from: [ 1, 2 ], to: [ 0, 4 ] }, //59
                        { from: [ 5, 3 ], to: [ 5, 4 ] }, //60
                        { from: [ 6, 5 ], to: [ 7, 7 ] }, //61
                        { from: [ 5, 3 ], to: [ 5, 4 ] }, //62
                        { from: [ 7, 5 ], to: [ 7, 4 ] }, //63
                        { from: [ 5, 3 ], to: [ 5, 4 ] }, //64
                        { from: [ 0, 4 ], to: [ 1, 6 ] }, //65
                        { from: [ 5, 4 ], to: [ 5, 5 ] }, //66
                        { from: [ 1, 6 ], to: [ 0, 4 ] }, //67
                        { from: [ 5, 5 ], to: [ 5, 6 ] }, //68
                        { from: [ 0, 4 ], to: [ 1, 6 ] }, //69
                        { from: [ 5, 6 ], to: [ 5, 7 ] }, //70
                        { from: [ 7, 4 ], to: [ 7, 3 ] } //71
                    ];
                    _.each(moves, function(move, ind) {
                        Meteor.apply('movePiece', [move, game_id], true, function(err, res) {
                            if (err) {
                                emit('move', err, ind);
                            } else {
                                emit('move', res, ind);
                            }
                        });
                        if(ind === 70) {
                            Meteor.call('getBoard', game_id, function(err, res) {
                                if (err) {
                                    emit('promote', err);
                                } else {
                                    emit('promote', res.board[5][7]);
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
        client.once('promote', function(el) {
            if(!el.placed.promote) {
                assert.fail(null, null, 'Not promoted', null);
            } else {
                done();
            }
        });
    })
})