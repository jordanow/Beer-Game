Meteor.methods({
	isValidGameKey: function(key) {
		check(key, String);
		if (key) {

			return {
				success: isValidGameKey(key)
			};
		} else {
			return {
				success: false
			};
		}
	},
	isValidPlayerKey: function(options) {
		check(options, Object);
		let gameInstance = Game.instances.findOne({
			key: Number(options.gamekey),
			state: 'play'
		});
		let player = {};

		if (!!gameInstance && gameInstance._id) {
			player = Game.players.findOne({
				'game.instance': gameInstance._id,
				key: Number(options.playerkey)
			});
		}

		return {
			success: player && player._id
		};
	},
	continuegame: function(options) {
		check(options, {
			gamekey: String,
			playerkey: String
		});

		//Check if the game key is valid
		//Check if this position is available
		//If true, assign the position to this person
		//return success
		if (isValidGameKey(options.gamekey)) {
			let gameInstance = Game.instances.findOne({
				key: Number(options.gamekey),
				state: 'play'
			});

			if (gameInstance && gameInstance._id) {
				let player = Game.players.findOne({
					key: Number(options.playerkey),
					game: {
						instance: gameInstance._id,
						session: gameInstance.session
					}
				});

				if (!!player) {
					return {
						success: player,
						gamekey: gameInstance.key
					};
				} else {
					throw new Meteor.Error(400, 'Player key not found');
				}
			} else {
				throw new Meteor.Error(400, 'Game key not found');
			}
		} else {
			return {
				success: false,
				message: 'The provided key is incorrect'
			};
		}
	},
	getAvailablePositions: function(gamekey) {
		check(gamekey, Match.Optional(String));
		if (!!gamekey) {
			if (isValidGameKey(gamekey)) {
				return {
					success: true,
					positionsAvailable: getAvailablePositions(gamekey)
				};
			} else {
				return {
					success: false,
					message: 'Incorrect game key!'
				};
			}
		} else {
			return {
				success: false,
				message: 'Game key is required!'
			};
		}
	},
	joingame: function(options) {
		check(options, {
			key: String,
			position: String
		});

		//Check if the game key is valid
		//Check if this position is available
		//If true, assign the position to this person
		//return success
		if (isValidGameKey(options.key)) {
			if (isValidRole(options.key, options.position)) {
				let gameInstance = Game.instances.findOne({
					key: Number(options.key),
					state: 'play'
				});

				let gameSession = Game.sessions.findOne({
					_id: gameInstance.session
				});

				let newPlayer = {
					role: options.position,
					game: {
						instance: gameInstance._id,
						session: gameInstance.session
					},
					key: ''
				};

				let playerId = Game.players.insert(newPlayer);

				let player = {};
				if (playerId) {
					player = Game.players.findOne({
						_id: playerId
					});

					let availableInventory = gameSession.settings.initialinventory;

					let week0 = {
						game: {
							instance: gameInstance._id,
							session: gameInstance.session
						},
						player: {
							_id: playerId,
							role: player.role,
							key: player.key
						},
						week: 0,
						order: {
							"in": 0,
							"out": 0
						},
						delivery: {
							"in": 0,
							"out": 0
						},
						cost: 0,
						inventory: availableInventory
					};

					Game.weeks.insert(week0);

					updateRoleInInstance(gameInstance, player, 0);

					return {
						success: playerId,
						gamekey: gameInstance.key,
						playerkey: player && player.key ? player.key : false
					};
				} else {
					return {
						success: false,
						message: 'Error while joining game. Please try again!'
					};
				}

			} else {
				return {
					success: false,
					message: 'Selected role has already been taken!'
				};
			}
		} else {
			return {
				success: false,
				message: 'The provided key is incorrect'
			};
		}


	},
	submitOrder: function(options) {
		if (Meteor.isServer) {
			check(options, Object);

			let gameInstance = Game.instances.findOne({
				key: options.instance
			});

			let player = Game.players.findOne({
				key: options.player
			});

			let currentWeek = gameInstance[player.role].week + 1;

			let weekDetails = Game.weeks.findOne({
				'player._id': player._id,
				week: currentWeek
			});

			if (weekDetails && weekDetails._id) {
				let week = {
					'order.out': options.outOrder
				};

				let update = Game.weeks.update({
					_id: weekDetails._id
				}, {
					$set: week
				});
				if (!!update) {
					return updateRoleInInstance(gameInstance, player, currentWeek);

				} else {
					throw new Meteor.Error(403, 'Something went wrong while submitting order!');
				}
			} else {
				throw new Meteor.Error(403, 'Please wait for your turn!');
			}
		}
	},
	makeNextMove: function(gamekey, playerkey) {
		check(gamekey, Match.Optional(String));
		check(playerkey, Match.Optional(String));

		if (Meteor.isServer) {
			if (!!gamekey && !!playerkey) {
				if (isValidGameKey(gamekey)) {
					return {
						success: allInSameWeek(gamekey)
					};
					// if (allInSameWeek(gamekey)) {
					// 	return {
					// 		success: addNewWeek(gamekey, playerkey)
					// 	};
					// } else {
					// 	return {
					// 		success: false
					// 	};
					// }
				} else {
					return {
						success: false,
						message: 'Invalid game key or the game is over!'
					};
				}
			} else {
				return {
					success: false,
					message: 'Game key is required!'
				};
			}
		} else {
			return;
		}
	},
});

addNewWeek = function(gamekey, playerkey) {
	//For the player add a new week
	//For retailer -> order in comes from settings
	//For Distributor -> order in comes from retailer's prev order out
	//For Wholesaler -> order in comes from distributor's prev order out
	//For Manufacturer -> order in comes from wholesaler's prev order out
	//
	//Also, find the delivery in for all the people
	//For retailer -> delivery in comes from distributor's prev delivery out
	//For Distributor -> delivery in comes from distributor's prev delivery out
	//For Wholesaler -> delivery in comes from Manufacturer's prev delivery out
	//For Manufacturer -> delivery in comes from Manufacturer's (prev*delay)order out

	//Bugs:
	//Wholesaler's order in is becoming delivery in
	//Manufacturer's week is not added
	//Always check if the player can make next move or not

	if (Meteor.isServer) {
		let gameInstance = Game.instances.findOne({
			key: Number(gamekey)
		});
		let gameSession = Game.sessions.findOne({
			_id: gameInstance.session
		});

		let player = Game.players.findOne({
			key: Number(playerkey),
			'game.instance': gameInstance._id
		});

		let thisWeek = gameInstance[player.role].week;

		let currentWeek = Game.weeks.findOne({
			'player._id': player._id,
			week: thisWeek
		});

		//New order must be created only if the previous weeks order was submitted
		let inDelivery = getIncomingDelivery(player, gameSession, gameInstance);
		let inOrder = getIncomingOrder(player, gameSession, gameInstance);

		let availableInventory = currentWeek.inventory + inDelivery;
		let toShip = currentWeek.backorder + inOrder;
		let outDelivery = toShip > availableInventory ? availableInventory : toShip;
		let backorder = toShip - outDelivery;

		let currentInventory = availableInventory - outDelivery;
		let currentBackorder = backorder;

		let cost = calculateCostForWeek(gameSession.settings, currentBackorder, currentInventory, currentWeek.cost);

		let week = {
			week: thisWeek + 1,
			cost: cost,
			delivery: {
				"in": inDelivery,
				"out": outDelivery
			},
			order: {
				"in": inOrder
			},
			backorder: currentBackorder,
			inventory: currentInventory,
			game: {
				instance: gameInstance._id,
				session: gameInstance.session
			},
			player: {
				_id: player._id,
				role: player.role,
				key: player.key
			}
		};

		return Game.weeks.insert(week);
	}

};


getCustomerRole = function(myRole) {
	let customer = null;
	switch (myRole) {
		case 'Retailer':
			customer = 'Customer';
			break;
		case 'Wholesaler':
			customer = 'Retailer';
			break;
		case 'Distributor':
			customer = 'Wholesaler';
			break;
		case 'Manufacturer':
			customer = 'Distributor';
			break;
	}
	return customer;
};

getSellerRole = function(myRole) {
	let seller = null;
	switch (myRole) {
		case 'Retailer':
			seller = 'Wholesaler';
			break;
		case 'Wholesaler':
			seller = 'Distributor';
			break;
		case 'Distributor':
			seller = 'Manufacturer';
			break;
		default:
			seller = 'Manufacturer';
	}
	return seller;
};

getPlayerDetails = function(role, instanceId) {
	return Game.players.findOne({
		role: role,
		'game.instance': instanceId
	});
};

getIncomingDelivery = function(player, session, instance) {
	let sellerRole = getSellerRole(player.role);
	let seller = getPlayerDetails(sellerRole, instance._id);


	//In case he is the manufacturer
	if (sellerRole === player.role) {
		let sellerPrevWeek = getDelayedWeekDetails(seller, instance, session.settings.delay + 1);
		return sellerPrevWeek && sellerPrevWeek.order && sellerPrevWeek.order.out ? sellerPrevWeek.order.out : 0;
	} else {
		let sellerPrevWeek = getDelayedWeekDetails(seller, instance, session.settings.delay);
		return sellerPrevWeek && sellerPrevWeek.delivery && sellerPrevWeek.delivery.out ? sellerPrevWeek.delivery.out : 0;
	}
};

getIncomingOrder = function(player, session, instance) {
	let customerRole = getCustomerRole(player.role);

	if (customerRole === 'Customer') {
		let week = instance.Retailer.week;
		//get from game settings
		let demand = session.settings.customerdemand[week];
		return demand && demand.value ? demand.value : 0;
	} else {
		let customer = getPlayerDetails(customerRole, instance._id);
		let customerPrevWeek = getCurrentWeekDetails(customer, instance);

		return customerPrevWeek && customerPrevWeek.order && customerPrevWeek.order.out ? customerPrevWeek.order.out : 0;
	}
};

getDelayedWeekDetails = function(player, instance, delay) {
	if (!!player && player.role) {
		let week = instance[player.role].week;
		let delayedWeek = week - delay;

		return Game.weeks.findOne({
			'player._id': player._id,
			week: delayedWeek
		});
	} else {
		return null;
	}
};

getCurrentWeekDetails = function(player, instance) {
	let week = instance[player.role].week;

	let thisWeek = Game.weeks.findOne({
		'player._id': player._id,
		week: week
	});

	if (thisWeek && thisWeek._id) {
		return thisWeek;
	} else {
		return {
			week: 0
		};
	}
};

calculateCostForWeek = function(settings, backorder = 0, inventory = 0, prevWeekCost = 0) {
	return prevWeekCost + (backorder * settings.cost.backorder) + (inventory * settings.cost.inventory);
};

getWeekDetails = function(playerId, week) {
	return Game.weeks.findOne({
		'player._id': playerId,
		week: week
	});
};

allInSameWeek = function(gamekey) {
	let gameInstance = Game.instances.findOne({
		key: Number(gamekey),
		state: 'play'
	});
	if (gameInstance.Retailer && !!gameInstance.Distributor && !!gameInstance.Manufacturer && !!gameInstance.Wholesaler) {
		if (gameInstance.Retailer.week === gameInstance.Distributor.week && gameInstance.Manufacturer.week === gameInstance.Wholesaler.week && gameInstance.Retailer.week === gameInstance.Wholesaler.week) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}

};

getCustomerDemand = function(session, week) {
	let demandArr = session.settings.customerdemand;
	let demand = 0;

	demand = _.find(demandArr, function(d) {
		return d.week === week;
	});
	return demand.value;
};

let isValidGameKey = function(key) {
	let count = Game.instances.find({
		key: Number(key),
		state: 'play'
	}).count();

	return count === 1;
};

let isValidRole = function(gamekey, role) {
	let positionsAvailable = getAvailablePositions(gamekey);
	return positionsAvailable.indexOf(role) >= 0;
};

updateRoleInInstance = function(instance, player, week) {

	let role = player.role;

	instance[role] = {
		week: week,
		state: 'joined',
		player: {
			_id: player._id,
			key: player.key
		}
	};

	return Game.instances.update({
		_id: instance._id
	}, {
		$set: instance
	})
};

let getAvailablePositions = function(gamekey) {
	let gameInstance = Game.instances.findOne({
		key: Number(gamekey),
		state: 'play'
	});

	let positionsAvailable = ['Retailer', 'Manufacturer', 'Wholesaler', 'Distributor'];
	let positionsTaken = [];

	positionsAvailable.forEach(function(position) {
		if (!!gameInstance && (gameInstance[position] && gameInstance[position].state === 'joined')) {
			positionsTaken.push(position);
		}
	});

	return _.difference(positionsAvailable, positionsTaken);
};