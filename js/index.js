import { CARDS, IMAGES, CARDS_SPECIAL_GUESTS } from "./data.js";
import {cardHover, cardLeave} from "./card-animation.js";

// Game constants
const MYTHIC_CARDS = CARDS.filter((item) => item.Rarity === "M");
const RARE_CARDS = CARDS.filter((item) => item.Rarity === "R");
const UNCOMMON_CARDS = CARDS.filter((item) => item.Rarity === "U");
const COMMON_CARDS = CARDS.filter((item) => item.Rarity === "C");

// Rarity Constants
const WILDCARD_RARITY = {
	M: {
		array: MYTHIC_CARDS,
		probability: 0.0173,
	},
	R: {
		array: RARE_CARDS,
		probability: 0.1216,
	},
	U: {
		array: UNCOMMON_CARDS,
		probability: 0.4816,
	},
	C: {
		array: COMMON_CARDS,
		probability: 1,
	},
};
const SPECIAL_RARITY = 0.015625;
const MYTHIC_RARITY = 0.143;
const DUAL_LANDS_RARITY = 0.5;
const rarityOrder = { M: 0, R: 1, U: 2, C: 3 };

const CHOSEN_CARDS = chooseInitialCards();
const CHOSEN_CARDS_SORTED = [...CHOSEN_CARDS].sort(
	(a, b) => parseFloat(b["GIH WR"] || 0) - (parseFloat(a["GIH WR"]) || 0)
);

function loadCounter() {
	let counter = localStorage.getItem("counter") || 0;
	document.getElementById("counterDiv").innerText = "STREAK: " + counter;
}

// Function to increment the counter and update localStorage
function updateCounter(counter) {
	localStorage.setItem("counter", counter); // Save updated counter to localStorage
	document.getElementById("counterDiv").innerText = "STREAK: " + counter;
}

// Game variables
let gameDone = false;

window.onload = () => {
	loadCounter();
	correctData(CARDS); // Fix data: missing properties, etc
	createEventListeners(); // Create user actions
	createCardElements(CHOSEN_CARDS); // Generate cards
};

// console.log(CARDS);
// console.log(IMAGES);
// console.log(CHOSEN_CARDS);
// console.log(CHOSEN_CARDS_SORTED);

function correctData(cards) {
	for (let card in cards) {
		for (let property in cards[card]) {
			if (!cards[card][property]) {
				cards[card][property] = 0;
			}
		}
	}
}

function getRandomItem(items) {
	// Pick a random item from the filtered array
	if (items.length > 0) {
		const randomIndex = Math.floor(Math.random() * items.length);
		let returnItem = items[randomIndex];
		items.splice(randomIndex, 1); // Remove 1 element at cardIndex
		return returnItem;
	} else {
		return null; // No item with the specified rarity found
	}
}

function chooseWildcard(isSplice, chosenCards) {
	let randomValue = Math.random();

	// Loop through each rarity type in WILDCARD_RARITY
	for (let rarityType in WILDCARD_RARITY) {
		let rarityProbability = WILDCARD_RARITY[rarityType]["probability"];

		// If the random value is less than the current rarity's probability
		if (randomValue < rarityProbability) {
			let cardArray = WILDCARD_RARITY[rarityType]["array"];

			let selectedCard = getRandomItem(cardArray);

			// Add the selected card to the chosenCards array
			chosenCards.push(selectedCard);

			if (!isSplice) {
				cardArray.push(selectedCard);
			}

			break;
		}
	}
}

function chooseInitialCards() {
	let chosenCards = [];

	//Choose Wildcards
	// Generate a random value between 0 and 1 to determine rarity

	chooseWildcard(false, chosenCards);
	chooseWildcard(true, chosenCards);

	//choose rare/mythic
	if (Math.random() < MYTHIC_RARITY) {
		chosenCards.push(getRandomItem(WILDCARD_RARITY["M"]["array"]));
	} else {
		chosenCards.push(getRandomItem(WILDCARD_RARITY["R"]["array"]));
	}

	//choose 3 uncommons
	for (let i = 0; i < 3; i++) {
		chosenCards.push(getRandomItem(WILDCARD_RARITY["U"]["array"]));
	}

	//choose special guest or common
	if (Math.random() < SPECIAL_RARITY) {
		chosenCards.push(getRandomItem(CARDS_SPECIAL_GUESTS));
	} else {
		chosenCards.push(getRandomItem(WILDCARD_RARITY["C"]["array"]));
	}

	//choose 6 commons
	for (let i = 0; i < 6; i++) {
		chosenCards.push(getRandomItem(WILDCARD_RARITY["C"]["array"]));
	}

	//choose land

	let firstItem = chosenCards[0];

	let sortedRest = chosenCards.slice(1).sort((a, b) => {
		// First, compare by rarity
		const rarityComparison =
			rarityOrder[a["Rarity"]] - rarityOrder[b["Rarity"]];

		// If rarities are the same, compare by cardIndex
		if (rarityComparison === 0) {
			return a["cardIndex"] - b["cardIndex"];
		}

		return rarityComparison; // Otherwise, return the result of rarity comparison
	});
	return [firstItem, ...sortedRest];
}

function createCardElements(chosenCards) {
	let cardsContainerElement = document.getElementById("cards-container");

	for (let i = 0; i < chosenCards.length; i++) {
		// Create card HTML element
		let cardElement = document.createElement("div");
		cardElement.classList.add("card");
		if (i == 0) {
			cardElement.classList.add("holo");
		}
		cardElement.id = CARDS.findIndex((x) => x.Name === chosenCards[i].Name);

		// Create card's image
		let cardImageElement = document.createElement("img");
		cardImageElement.classList.add("card-image");
		cardImageElement.src = getCardImage(chosenCards[i].Name);
		cardImageElement.style.pointerEvents = "none";
		cardElement.appendChild(cardImageElement);

		// Rotate card if it is a double card
		if (chosenCards[i].Name.includes("//")) {
			cardElement.classList.add("rotate90");
		}

		// Add card details that will be revealed
		let cardDetailsElement = document.createElement("div");
		cardDetailsElement.classList.add("cardDetails");
		cardDetailsElement.innerText =
			"ALSA: " +
			chosenCards[i].ALSA +
			"\nIWD: " +
			chosenCards[i].IWD +
			"\nGIH WR: " +
			chosenCards[i]["GIH WR"];
		cardDetailsElement.style.pointerEvents = "none";
		cardElement.appendChild(cardDetailsElement);

		// Add event listeners
		cardElement.addEventListener("click", chooseCard);
		cardElement.addEventListener("mousemove", cardHover);
		cardElement.addEventListener("mouseleave", cardLeave);

		// Append to body(cards-container)
		cardsContainerElement.appendChild(cardElement);
	}

	// Append cards-container to body
	document.body.appendChild(cardsContainerElement);
}

function getCardImage(cardName) {
	let cardImage = IMAGES.find((card) => card.Name == cardName);

	return cardImage ? cardImage.URL : ""; //TODO: add placeholder image?
}

function chooseCard(e) {
	// Check if a card was already chosen
	if (gameDone) return;

	console.log("Chosen card id: ", e.target.id); // TODO: print card info

	// Set game to done
	gameDone = true;

	let correctCard = CHOSEN_CARDS_SORTED[0]["cardIndex"];

	let counter = localStorage.getItem("counter") || 0;
	if (e.target.id == correctCard) {
		counter++;
		e.target.style.zIndex = "100";
		e.target.style.border = "5px solid green";
		e.target.style.boxShadow = "0px 0px 20px 5px green";
	} else {
		counter = 0;
		
		// Highlight the (wrong) selected card
		e.target.style.border = "5px solid red";
		e.target.style.boxShadow = "0px 0px 20px 5px red";
	}

	updateCounter(counter);

	// Highlight the correct card
	let correctCardElement = document.getElementById(correctCard);
	if (correctCardElement.classList.contains("rotate90")) {
		correctCardElement.style.transform = "scale(1) rotate(90deg)"; //TODO fix this, is not working, if the winning card is a double card, it isn't rotated once highlighted
		correctCardElement.style.transform = "scale(1)";
		correctCardElement.style.border = "2px solid green";
	} else {
		correctCardElement.style.transform = "scale(1)";
	}
	correctCardElement.style.border = "5px solid green";
	correctCardElement.style.boxShadow = "0px 0px 20px 5px green";

	// Reveal info // TODO: maybe move this to its own function if the logic here will grow
	let cardDetailsElements = document.getElementsByClassName("cardDetails");
	for (let item of cardDetailsElements) {
		item.style.display = "block";
	}

	// Display the next round button // TODO: move to own function
	let resetButtonElement = document.getElementById("resetBtn");
	resetButtonElement.style.visibility = "visible";
}

function createEventListeners() {
	// Reset button
	document.getElementById("resetBtn").addEventListener("click", reset);
}

function reset() {
	location.reload();
}
