document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#game-board');
    const startButton = document.getElementById('start-game');
    let cardsChosen = [];
    let cardsChosenId = [];
    let cardsWon = [];
    let playerId = '';
    let moves = 0;

    function generatePlayerId() {
       return 'player-' + Date.now(); // Simple unique ID
}


    const cardArray = [
        { name: 'card1', img: 'images/tree.png' },
        { name: 'card1', img: 'images/tree.png' },
        { name: 'card2', img: 'images/money.png' },
        { name: 'card2', img: 'images/money.png' },
        { name: 'card3', img: 'images/juice.png' },
        { name: 'card3', img: 'images/juice.png' },
        { name: 'card4', img: 'images/owl.png' },
        { name: 'card4', img: 'images/owl.png' },
        { name: 'card5', img: 'images/lamp.png' },
        { name: 'card5', img: 'images/lamp.png' },
        { name: 'card6', img: 'images/cake.png' },
        { name: 'card6', img: 'images/cake.png' },
        { name: 'card7', img: 'images/bird.png' },
        { name: 'card7', img: 'images/bird.png' },
        // ...add more pairs as needed
    ];

    function shuffle(array) {
        array.sort(() => 0.5 - Math.random());
    }

    function createBoard() {
        shuffle(cardArray);
        grid.innerHTML = '';
        cardsWon = [];

        for (let i = 0; i < cardArray.length; i++) {
            const card = document.createElement('img');
            card.setAttribute('src', 'images/blank.jpg');
            card.setAttribute('data-id', i);
            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        }
    }

    function flipCard() {
        let cardId = this.getAttribute('data-id');
        if (!cardsChosenId.includes(cardId)) {
            cardsChosen.push(cardArray[cardId].name);
            cardsChosenId.push(cardId);
            this.setAttribute('src', cardArray[cardId].img);
            if (cardsChosen.length === 2) {
                moves++
                setTimeout(checkForMatch, 1000);
            }
        }
    }

    function checkForMatch() {
        const cards = document.querySelectorAll('#game-board img');
        const firstCardId = cardsChosenId[0];
        const secondCardId = cardsChosenId[1];

        if (cardsChosen[0] === cardsChosen[1] && firstCardId !== secondCardId) {
            cards[firstCardId].style.visibility = 'hidden';
            cards[secondCardId].style.visibility = 'hidden';
            cards[firstCardId].removeEventListener('click', flipCard);
            cards[secondCardId].removeEventListener('click', flipCard);
            cardsWon.push(cardsChosen);
        } else {
            cards[firstCardId].setAttribute('src', 'images/blank.jpg');
            cards[secondCardId].setAttribute('src', 'images/blank.jpg');
        }

        cardsChosen = [];
        cardsChosenId = [];
        

        if (cardsWon.length === cardArray.length / 2) {
            alert(`Congratulations! You found them all!\nPlayer ID: ${playerId}\nMoves Taken: ${moves}`);
            savePlayerData(playerId, moves); // ✅ Clean and reusable
        }
        
        
    }
    
    function savePlayerData(playerId, moves) {
        fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, moves })
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error('Error:', err));
    }
    
    startButton.addEventListener('click', () => {
        playerId = generatePlayerId();
        moves = 0;
        createBoard();
    });
    
});
