var SPADE = 0;
var HEART = 1;
var CLUB = 2;
var DIAMOND = 3;
var SUITS = ['spade', 'heart', 'club', 'diamond'];

var gameLoop = true;
var turn = 0;

var offerDeck = [];
var offer = [];
var playerDecks = [[], []];
var playerTables = [[], []];
var playerHands = [[], []];
var playerDiscards = [[], []];

var piles = [];

// populate each rank pile
for(var rank = 0; rank < 5; rank++) {
	piles.push([]);
	for(var suit = 0; suit < 4; suit++) {
		piles[rank].push({rank: rank+1, suit: suit});
	}
}

// shuffle the cards in each rank pile
for(var rank = 0; rank < 5; rank++) {
	piles[rank] = shuffle(piles[rank]);
}

// populate each player deck from rank piles
for(var pile = 0; pile < 5; pile++) {
	for(var card = 0; card < 4; card++) {
		// put this card in player one or two's deck by odd/even
		if(card % 2 == 0) {
			playerDecks[0].push(piles[pile][card]);
		}
		else {
			playerDecks[1].push(piles[pile][card]);
		}
	}
}

// shuffle player decks
playerDecks[0] = shuffle(playerDecks[0]);
playerDecks[1] = shuffle(playerDecks[1]);

// populate rest of offer deck
for(var rank = 6; rank <= 13; rank++) {
	for(var suit = 0; suit < 4; suit++) {
		offerDeck.push({rank: rank, suit: suit});
	}
}
offerDeck = shuffle(offerDeck);

offer = offerDeck.splice(0,5);

console.log('offer: ' + JSON.stringify(offer));
console.log('offer deck remaining: ' + offerDeck.length);

console.log('game setup complete!');

// start game loop!
var SAFETY = 0;
while(gameLoop) {
	++SAFETY; if(SAFETY > 1000) {console.log('safety break'); break;}
	var winner = checkWinner(turn);
	if(winner) {
		gameLoop = false;
	}
	
	// if player saved their hand, draw one more into it
	if(playerHands[turn].length > 0) {
		// if deck empty, shuffle discard back in
		if(playerDecks[turn].length < 1) {
			restock(playerDiscards[turn], playerDecks[turn]);
		}
		playerHands[turn].push(playerDecks[turn].splice(0,1)[0]);
	}
	// otherwise, draw two into empty hand
	else {
		if(playerDecks[turn].length < 2) {
			restock(playerDiscards[turn], playerDecks[turn]);
		}
		var pull = playerDecks[turn].splice(0,2);
		pull.forEach(function(card) {
			playerHands[turn].push(card);
		});
	}
	
	console.log('player ' + turn + ' hand: ' + JSON.stringify(playerHands[turn]));
	break;
}


// return a new array by splicing out random indices into it from an old array
function shuffle(arr) {
	var output = [];
	var removalIndex = -1;
	var SAFETY_COUNTER = 0;
	while(arr.length > 0) {
		SAFETY_COUNTER++; if(SAFETY_COUNTER > 100) {console.log('safety break'); break;}
		
		// set removal index from remaining array length
		removalIndex = Math.floor(Math.random() * Math.floor(arr.length));
		// splice out at removal index and push onto output array
		output.push(arr.splice(removalIndex, 1)[0]);
	}
	return output;
}

function checkWinner(player) {
	// get the table for the selected player
	var table = playerTables[player];

	// init trackers to all false
	var jack = false;
	var queen = false;
	var king = false;

	// for each card, flag its face as true
	table.forEach(function(card) {
		switch(card.rank) {
			case 11:
				jack = true;
				break;
			case 12:
				queen = true;
				break;
			case 13:
				king = true;
				break;
			default:
				console.log('ERROR: a non-face card ended up tabled for player ' + player + '!');
				return 0;
		}
	});
	
	// if all faces flagged, this player is a winner!
	if(jack && queen && king) {
		return player;
	}
	
	// if any face not flagged, this player hasn't won
	return 0;
}

// shuffle player discards, then pop all onto deck
function restock(source, destination) {
	source = shuffle(source);
	while(source.length) {
		destination.push(source.pop());
	}
}