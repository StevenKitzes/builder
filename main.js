// Note to observers: this code is a rapid prototype; a cleaner,
// more organized codebase will be generated if this project
// is greenlit

var SPADE = 0;
var HEART = 1;
var CLUB = 2;
var DIAMOND = 3;
var SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
var HIGHEST_STARTER = 4;
var RANKS = ['error', 'ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

var gameLoop = true;
var turn = 0;
var offerDiscards = [];
var offerDeck = [];
var offer = [];
var playerDecks = [[], []];
var playerTables = [[], []];
var playerHands = [[], []];
var playerDiscards = [[], []];

var piles = [];

//-- Initial Game Setup Begin

// populate each rank pile
for(var rank = 0; rank < 4; rank++) {
	piles.push([]);
	for(var suit = 0; suit < 4; suit++) {
		piles[rank].push({rank: rank+1, suit: suit});	// rank+1 is because there is no card with 0 value
	}
}

// shuffle the cards in each rank pile
for(var rank = 0; rank < 4; rank++) {
	piles[rank] = shuffle(piles[rank]);
}

// populate each player deck from rank piles
for(var pile = 0; pile < 4; pile++) {
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
shuffle(playerDecks[0]);
shuffle(playerDecks[1]);

// populate rest of offer deck
for(var rank = 5; rank <= 13; rank++) {
	for(var suit = 0; suit < 4; suit++) {
		offerDeck.push({rank: rank, suit: suit});
	}
}
shuffle(offerDeck);

offer = offerDeck.splice(0,5);

console.log('game setup complete!');

document.addEventListener('DOMContentLoaded', function(event) {
	updateGameState();
});

//-- Initial Game Setup End

// shuffle array and return ref to it by splicing out random indices into it from an old array
function shuffle(arr) {
	for(var i = 0; i < arr.length; i++) {
		var swapIndex = Math.floor(Math.random() * Math.floor(arr.length));
		var temp = arr[i];
		arr[i] = arr[swapIndex];
		arr[swapIndex] = temp;
	}
	return arr;
}

function checkWinner(player) {
	// get the table for the selected player
	var table = playerTables[player];

	var faceCounter = 0;
	
	table.forEach(function(card) {
		if(card.rank > 10) faceCounter++;
	});
	
	// if three faces detected, this player is a winner!
	if(faceCounter >= 3) {
		console.log('player ' + (player+1) + ' win detected!');
		return true;
	}
	
	console.log('no win detected');
	return false;
}

// shuffle source, then pop all source cards onto destination deck
function restockFromSource(source, destination) {
	shuffle(source);
	while(source.length) {
		destination.push(source.pop());
	}
}

function deckEmpty(deck) {
	if(deck.length < 1) return true;
	return false;
}

function logDeck(name, deck) {
	console.log(name + ':');
	deck.forEach(function(card) {
		console.log('  ' + RANKS[card.rank] + ' of ' + SUITS[card.suit]);
	});
}

function cardName(card) {
	return RANKS[card.rank] + '_of_' + SUITS[card.suit];
}

function updateGameState() {
	// replenish offer if needed
	while(offer.length < 5) {
		console.log('offer length was less than five!');
		// if offer deck empty, replenish that too
		if(offerDeck.length < 1) {
			console.log('offer deck length was less than 1!');
			restockFromSource(offerDiscards, offerDeck);
		}
		offer.splice(0,0,offerDeck.splice(0,1)[0]);
	}
	
	// draw player hand if needed
	drawHand();
	
	// announce turn
	document.getElementById('announce').innerHTML = 'Player ' + (turn+1) + ' turn!';
	
	// draw offer discard
	var offerDiscardsElement = document.querySelector('#offer-discards .card-content');
	if(offerDiscards.length < 1) {
		offerDiscardsElement.innerHTML = cardEmptyAsString();
	}
	else {
		offerDiscardsElement.innerHTML = cardImageAsString(offerDiscards[offerDiscards.length-1], offerDiscards.length);
	}
	
	// draw offer deck
	var offerDeckElement = document.querySelector('#offer-deck .card-content');
	if(offerDeck.length < 1) {
		offerDeckElement.innerHTML = cardEmptyAsString();
	}
	else {
		offerDeckElement.innerHTML = cardBackAsString(offerDeck.length);
	}
	
	// draw offer
	var offerElement = document.querySelector('#offer .card-content');
	offerElement.innerHTML = '';
	if(offer.length > 5) {
		console.log('ERROR: offer had more than five cards in it');
		for(var i = 0; i < 5; i++) {
			offerElement.innerHTML += cardBackAsString();
		}
		return;
	}
	// for each offer slot
	for(var i = 0; i < 5; i++) {
		// draw card if there's a card in this slot
		if(offer[i]) {
			offerElement.innerHTML += cardImageAsString(offer[i]);
		}
		// else, draw empty spot
		else {
			offerDeckElement.innerHTML = cardEmptyAsString();
		}
	}
	
	// draw p1 and p2 discards
	var p1DiscardsElement = document.querySelector('#p1-discards .card-content');
	var p2DiscardsElement = document.querySelector('#p2-discards .card-content');
	if(playerDiscards[0].length < 1) {
		p1DiscardsElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1DiscardsElement.innerHTML = cardImageAsString(playerDiscards[0][playerDiscards[0].length-1], playerDiscards[0].length);
	}
	if(playerDiscards[1].length < 1) {
		p2DiscardsElement.innerHTML = cardEmptyAsString();
	}
	else {
		p2DiscardsElement.innerHTML = cardImageAsString(playerDiscards[1][playerDiscards[1].length-1], playerDiscards[1].length);
	}
	
	// draw p1 and p2 decks
	var p1DeckElement = document.querySelector('#p1-deck .card-content');
	var p2DeckElement = document.querySelector('#p2-deck .card-content');
	if(playerDecks[0].length < 1) {
		p1DeckElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1DeckElement.innerHTML = cardBackAsString(playerDecks[0].length);
	}
	if(playerDecks[1].length < 1) {
		p2DeckElement.innerHTML = cardEmptyAsString();
	}
	else {
		p2DeckElement.innerHTML = cardBackAsString(playerDecks[1].length);
	}
	
	// draw p1 and p2 hands
	var p1HandElement = document.querySelector('#p1-hand .card-content');
	var p2HandElement = document.querySelector('#p2-hand .card-content');
	if(playerHands[0].length < 1) {
		p1HandElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1HandElement.innerHTML = '';
		playerHands[0].forEach(function(card) {
			p1HandElement.innerHTML += cardImageAsString(card);
		});
	}
	if(playerHands[1].length < 1) {
		p2HandElement.innerHTML = cardEmptyAsString();
	}
	else {
		p2HandElement.innerHTML = '';
		playerHands[1].forEach(function(card) {
			p2HandElement.innerHTML += cardImageAsString(card);
		});
	}
	
	// draw p1 and p2 tables
	var p1TableElement = document.querySelector('#p1-table .card-content');
	var p2TableElement = document.querySelector('#p2-table .card-content');
	if(playerTables[0].length < 1) {
		p1TableElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1TableElement.innerHTML = '';
		playerTables[0].forEach(function(card) {
			p1TableElement.innerHTML += cardImageAsString(card);
		});
	}
	if(playerTables[1].length < 1) {
		p2TableElement.innerHTML = cardEmptyAsString();
	}
	else {
		p2TableElement.innerHTML = '';
		playerTables[1].forEach(function(card) {
			p2TableElement.innerHTML += cardImageAsString(card);
		});
	}
	
	setupListeners();
}

function setupListeners() {
	// setup listeners on offer cards
	offer.forEach(function(card) {
		if(!card) return;
		var element = document.getElementById(cardName(card));
		element.removeEventListener('click', handleOfferClick);
		element.addEventListener('click', handleOfferClick);
	});
	
	// a player's own deck is clickable, meaning they want to draw instead of buying
	var deck1Element = document.getElementById('p1-deck');
	var deck2Element = document.getElementById('p2-deck');
	if(turn == 0) {
		deck1Element.addEventListener('click', handleDeckClick);
		deck2Element.removeEventListener('click', handleDeckClick);
	}
	else {
		deck2Element.addEventListener('click', handleDeckClick);
		deck1Element.removeEventListener('click', handleDeckClick);
	}
	
	// tabled enemy faces are clickable, meaning they can be destroyed
	if(turn == 0) {
		playerTables[0].forEach(function(card) {
			var element = document.getElementById(cardName(card));
			element.removeEventListener('click', handleTableClick);
		});
		playerTables[1].forEach(function(card) {
			var element = document.getElementById(cardName(card));
			element.addEventListener('click', handleTableClick);
		});
	}
	else {
		playerTables[1].forEach(function(card) {
			var element = document.getElementById(cardName(card));
			element.removeEventListener('click', handleTableClick);
		});
		playerTables[0].forEach(function(card) {
			var element = document.getElementById(cardName(card));
			element.addEventListener('click', handleTableClick);
		});
	}
}

// draw current player's hand if needed
function drawHand() {
	// if hand is empty
	if(playerHands[turn].length < 1) {
		// shuffle in discards if necessary
		if(playerDecks[turn].length < 2) {
			restockFromSource(playerDiscards[turn], playerDecks[turn]);
		}
		// if still not enough available in player deck, fill from offer deck
		while(playerDecks[turn].length < 2) {
			if(offerDeck.length < 1) {
				restockFromSource(offerDiscards, offerDeck);
			}
			playerDecks[turn].push(offerDeck.splice(0,1)[0]);
		}
		// populate hand with top 2 cards from player deck
		playerDecks[turn].splice(0,2).forEach(function(card) {
			playerHands[turn].push(card);
		});
		// any face in hand goes to table instead of hand
		for(var i = playerHands[turn].length - 1; i >= 0; i--) {
			if(playerHands[turn][i].rank > 10) {
				playerTables[turn].push(playerHands[turn].splice(i,1)[0]);
			}
		}
	}
	
	// if hand not empty, do nothing, wait for player input
}

function handleOfferClick(e) {
	// storage space for vars needed later
	var target;
	var targetIndex;
	var cost;

	// find the clicked offer card in the physical offer
	var iterator = 0;
	for(; iterator < offer.length; iterator++) {
		if(cardName(offer[iterator]) == e.target.id) {
			target = offer[iterator];
			targetIndex = iterator;
			cost = (target.rank <= 10 ? target.rank : 20);
			break;
		}
	}
	if(iterator >= offer.length) {
		console.log('ERROR: clicked offer card not found in offer somehow');
		return;
	}

	// add up hand total with respect to selected offer card
	var handTotal = 0;
	playerHands[turn].forEach(function(card) {
		if(card.suit == target.suit) {
			handTotal += (2 * Math.min(card.rank, 10));
		}
		else {
			handTotal += Math.min(card.rank, 10);
		}
	});
	// don't forget to add tabled cards
	playerTables[turn].forEach(function(card) {
		if(card.suit == target.suit) {
			handTotal += 5;
		}
		else {
			handTotal += 3;
		}
	});
	
	// now see if player can afford the purchase
	if(handTotal >= cost) {
		// move card from offer to player discard
		playerDiscards[turn].push(offer.splice(targetIndex,1)[0]);
		// if offer deck empty, replenish that before trying to replenish offer
		if(offerDeck.length < 1) {
			restockFromSource(offerDiscards, offerDeck);
		}
		// replenish offer
		offer.splice(0,0,offerDeck.splice(0,1)[0]);
		// empty player hand into discard
		while(playerHands[turn].length) {
			playerDiscards[turn].splice(0,0,playerHands[turn].pop());
		}
	}
	else {	
		alert('With hand value of ' + handTotal + ' you cannot afford this card of cost ' + cost + '!');
		return;
	}
	
	endTurn();
}
function handleDeckClick(e) {
	// shuffle in discards if necessary
	if(playerDecks[turn].length < 2) {	// 2 needed; one for tax, one for draw
		restockFromSource(playerDiscards[turn], playerDecks[turn]);
	}
	// if still not enough available in player deck, fill from offer deck
	while(playerDecks[turn].length < 2) {
		if(offerDeck.length < 1) {
			restockFromSource(offerDiscards, offerDeck);
		}
		playerDecks[turn].push(offerDeck.splice(0,1)[0]);
	}
	// burn tax
	offerDiscards.push(playerDecks[turn].splice(0,1)[0]);
	// draw 1 card into hand from deck
	playerHands[turn].push(playerDecks[turn].splice(0,1)[0]);
	// any face in hand goes to table instead of hand
	for(var i = playerHands[turn].length - 1; i >= 0; i--) {
		if(playerHands[turn][i].rank > 10) {
			playerTables[turn].push(playerHands[turn].splice(i,1)[0]);
		}
	}
	
	// cycle the offer!! splice the cycled card to keep taxed card visible
	offerDiscards.splice(0,0,offer.pop());
	// draw new card from offer deck onto close slot of offer
	offer.splice(0,0,offerDeck.splice(0,1)[0]);
	
	endTurn();
}
function handleTableClick(e) {
	// must have at least 2 cards in hand
	if(playerHands[turn].length < 2) {
		alert('You must have hand size at least 2 to use this power!');
		return;
	}
	// for each card in the current player's hand
	var suit = playerHands[turn][0].suit;
	console.log('evaluating current player hand based on suit ' + SUITS[suit]);
	for(var i = 1; i < playerHands[turn].length; i++) {
		// if any difference in suits is detected, this power fails
		if(playerHands[turn][i].suit != suit) {
			alert('This power only works if all cards in your hand have matching suits!');
			return;
		}
		else {
			console.log('found same suit... okay!');
		}
	}
	console.log('all hand same suit... okay!');
	
	// once power validitiy is established, find the clicked card and move it to offer discard
	var enemy = (turn == 0 ? 1 : 0);
	var iterator = 0;
	console.log('iterating to look for ' + e.target.id);
	for(; iterator < playerTables[enemy].length; iterator++) {
		console.log('iterator index: ' + iterator);
		if(e.target.id == cardName(playerTables[enemy][iterator])) {
			console.log('found match! target: ' + e.target.id + '; good match: ' + cardName(playerTables[enemy][iterator]));
			offerDiscards.push(playerTables[enemy].splice(iterator,1)[0]);
			// empty player hand into discard
			while(playerHands[turn].length) {
				playerDiscards[turn].push(playerHands[turn].splice(0,1)[0]);
			}
			endTurn();
			return;
		}
		else {
			console.log('non-match. target: ' + e.target.id + '; bad match: ' + cardName(playerTables[enemy][iterator]));
		}
	}
	if(iterator >= playerTables[enemy].length) {
		console.log('ERROR: clicked enemy table face not found in enemy table');
		return;
	}
	
	endTurn();
}

function endTurn() {
	if(checkWinner(turn)) {
		alert('Player ' + (turn+1) + ' wins!');
		updateGameState();
		return;
	}
	
	if(turn == 0) {
		turn = 1;
	} else {
		turn = 0;
	}
	updateGameState();
}

function cardImageAsString(card, count) {
	var name = cardName(card);
	var title = (count ? "title='" + count + " cards in pile'" : '');
	var tag = "<img class='card' " + title + " id='" +  name + "' src='img/" + name + ".png'>";
	return tag;
}
function cardEmptyAsString() {
	return "<img class='card' src='img/card_empty.png'>";
}
function cardBackAsString(count) {
	var title = (count ? "title='" + count + " cards remaining'" : '');
	return "<img class='card' " + title + " src='img/card_back.png'>";
}