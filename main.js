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
	updateDisplay();
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
	source = shuffle(source);
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

function updateDisplay() {
	// draw offer discard
	var offerDiscardsElement = document.querySelector('#offer-discards .card-content');
	if(offerDiscards.length < 1) {
		offerDiscardsElement.innerHTML = cardEmptyAsString();
	}
	else {
		offerDiscardsElement.innerHTML = cardImageAsString(offerDiscards[offerDiscards.length-1]);
	}
	
	// draw offer deck
	var offerDeckElement = document.querySelector('#offer-deck .card-content');
	if(offerDeck.length < 1) {
		offerDeckElement.innerHTML = cardEmptyAsString();
	}
	else {
		offerDeckElement.innerHTML = cardBackAsString();
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
	
	// draw p1 discard
	var p1DiscardsElement = document.querySelector('#p1-discards .card-content');
	if(playerDiscards[0].length < 1) {
		p1DiscardsElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1DiscardsElement.innerHTML = cardImageAsString(playerDiscards[0][playerDiscards[0].length-1]);
	}
	
	// draw p1 deck
	var p1DeckElement = document.querySelector('#p1-deck .card-content');
	if(playerDecks[0].length < 1) {
		p1DeckElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1DeckElement.innerHTML = cardBackAsString();
	}
	
	// draw p1 hand
	var p1HandElement = document.querySelector('#p1-hand .card-content');
	if(playerHands[0].length < 1) {
		p1HandElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1HandElement.innerHTML = '';
		playerHands[0].forEach(function(card) {
			p1HandElement.innerHTML += cardImageAsString(card);
		});
	}
	
	// draw p1 table
	var p1TableElement = document.querySelector('#p1-table .card-content');
	if(playerTables[0].length < 1) {
		p1TableElement.innerHTML = cardEmptyAsString();
	}
	else {
		p1TableElement.innerHTML = '';
		playerTables[0].forEach(function(card) {
			p1TableElement.innerHTML += cardImageAsString(card);
		});
	}
}

function cardImageAsString(card) {
	var name = cardName(card);
	var tag = "<img class='card' id='" +  name + "' src='img/" + name + ".png'>";
	return tag;
}
function cardEmptyAsString() {
	return "<img class='card' src='img/card_empty.png'>";
}
function cardBackAsString() {
	return "<img class='card' src='img/card_back.png'>";
}