gameController = RouteController.extend({
	game: function() {
		if (Meteor.loggingIn() || !this.ready()) {
			return this.render('loading');
		}
		if(!Meteor.user()) {
			return AccountsEntry.signInRequired(this);
		}
		return this.render(this.route.name);
	},
	home: function() {
		return this.render(this.route.name);
	}
});
Router.map(function() {
	this.route('game', {
		path: '/game/:_id',
		controller: 'gameController',
		action: 'game',
		layoutTemplate: 'layout',
		onBeforeAction: function(a) {
			var self = this;
			Session.set("game_id", this.params._id);
			if(!Meteor.user()){
				return;
			}
			Meteor.call('joinGame', self.params._id, function(err, res) {
				if (err) {
					console.warn(err);
					return;
				}
				self.games_handle = Meteor.subscribe("game", self.params._id);
				self.game_moves_handle = Meteor.subscribe("gameMoves", self.params._id);
				self.game_chat_handle = Meteor.subscribe('gameChat', self.params._id);
				self.game_timer_handle = Meteor.subscribe('timers', self.params._id);
			});
			Session.set("countOldMessages", 0);
		},
		waitOn: function() {
			return [
				this.games_handle,
				this.game_moves_handle,
				this.game_chat_handle,
				this.game_timer_handle
			];
		},
		onStop: function() {
			if(Meteor.user()) {
				this.games_handle.stop();
				this.game_moves_handle.stop();
				this.game_chat_handle.stop();
				this.game_timer_handle.stop();
			}
		},
	}),
	this.route('home', {
		path: '/',
		controller: 'gameController',
		action: 'home',
		layoutTemplate: 'layout',
		onBeforeAction: function() {
			this.pending_games_handle = Meteor.subscribe("pendingGames");
		},
		waitOn: function() {
			return this.pending_games_handle;
		},
		onStop: function() {
			this.pending_games_handle.stop();
		}
	})
});