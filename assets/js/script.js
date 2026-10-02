const wordField = document.querySelector('#word_selected')
const translationField = document.querySelector('#translation')
const sendButton = document.querySelector('#btn-send')
const fieldResponse = document.querySelector('#response')
const messageResponse = document.querySelector('#message')

// MODALS
const configModal = document.querySelector('#config-modal')
const gameModal = document.querySelector('#game-modal')

// DADOS DO JOGO
const modal = document.querySelector('#modal')
const fieldName = document.querySelector('#nome')
const fieldDifficulty = document.getElementsByName('difficulty')

// MODAL END GAME
const endModal = document.querySelector('#end-modal')
const playerName = document.querySelector('#player-name')
const levelGame = document.querySelector('#level-game')
const correctWords = document.querySelector('#correct-words')
const wrongWords = document.querySelector('#wrong-words')
const saveButton = document.querySelector('#btn-save')
const cancelButton = document.querySelector('#btn-cancel')
const wrongWordsContainer = document.querySelector('#wrong-words-container')

let palavra
let wrongWordsList = []

let tempoRestante = 600
let cronometro
let jogoAtivo = true

let tempo = document.querySelector('#tempo')
let startButton = document.querySelector('#btn-start')

let dataGame = {
    player_name: '',
    correct_words: 0,
    wrong_words: 0,
    difficulty: 0
}

let URL = 'https://backend-language-game.onrender.com'
let URL_LOCAL = 'http://localhost:3530'

function startGame() {
    randomWord()

    cronometro = setInterval(() => {
        tempoRestante--
        updateDisplayTime()

        if(tempoRestante <= 0) {
            gameModal.style.display = 'none'
            endModal.style.display = 'flex'
            endGame()
        }
    }, 1000)
}

function updateDisplayTime() {
    let minutos = Math.floor(tempoRestante / 60)
    let segundos = tempoRestante % 60

    let segundosFormatados = segundos < 10 ? '0' + segundos : segundos
    tempo.innerText = `${minutos}:${segundosFormatados}`
}

function endGame() {
    jogoAtivo = false
    clearInterval(cronometro)

    if(fieldResponse) fieldResponse.disabled = true
    if(sendButton) sendButton.disabled = true

    endModal.style.display = 'flex'
    playerName.innerHTML += `<em>${dataGame.player_name}</em>`
    if(dataGame.difficulty == 1) {
        levelGame.innerHTML += `<em>Fácil</em>`
    } else if (dataGame.difficulty == 2) {
        levelGame.innerHTML += `<em>Médio</em>`
    } else {
        levelGame.innerHTML += `<em>Dificil</em>`
    }
    correctWords.innerHTML += `<em>${dataGame.correct_words}</em>`
    wrongWords.innerHTML += `<em>${dataGame.wrong_words}</em>`
    
    for(item of wrongWordsList) {
        const answerKey = document.createElement('p')
        answerKey.innerHTML = `<span>${item.word}</span> <span>${item.translations}</span>`
        wrongWordsContainer.appendChild(answerKey)
    }

    tempo.style.color = 'red'
}

saveButton.addEventListener('click', async () => {
    await fetch(`${URL}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataGame)
    })
    window.location.reload()
})

cancelButton.addEventListener('click', () => {
    window.location.reload()
})

const randomWord = async () => {
    const response = await fetch(`${URL}?difficulty=${dataGame.difficulty}`)
    const data = await response.json()
    palavra = data

    wordField.innerText = palavra.word
}

sendButton.addEventListener('click', async () => {
    sendButton.disabled = true
    const dados = {
        id_word: palavra.id_word,
        userResponse: fieldResponse.value
    }

    const response = await fetch(`${URL}/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })

    const data = await response.json()

    if(data.correct == true) {
        messageResponse.classList.add('true')
        messageResponse.classList.remove('false')
        messageResponse.innerText = 'CORRETO'
        dataGame.correct_words++
    } else {
        messageResponse.classList.add('false')
        messageResponse.classList.remove('true')
        messageResponse.innerText = 'ERRADO'
        dataGame.wrong_words++

        translationField.innerText = data.translations
        wrongWordsList.push({word: data.word, translations: data.translations})
    }
    setTimeout(() => {
        sendButton.disabled = false
        fieldResponse.value = ''
        translationField.innerText = ''
        randomWord()
    }, 3000)
})

startButton.addEventListener('click', () => {
    if(fieldName.value == '') {
        alert('Por favor, insira seu nome para iniciar o jogo.')
        return
    }

    if(!Array.from(fieldDifficulty).some(radio => radio.checked)) {
        alert('Por favor, selecione uma dificuldade para iniciar o jogo.')
        return
    }

    configModal.style.display = 'none'
    gameModal.style.display = 'flex'

    dataGame.player_name = fieldName.value

    fieldDifficulty.forEach((radio) => {
        if(radio.checked) {
            dataGame.difficulty = radio.value
        }
    })

    startGame()
})