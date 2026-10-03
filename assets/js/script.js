const wordField = document.querySelector('#word_selected') // Campo onde a palavra aleatória será exibida
const translationField = document.querySelector('#translation') // Campo onde a tradução será exibida
const sendButton = document.querySelector('#btn-send') // Botão para enviar a resposta do usuário
const fieldResponse = document.querySelector('#response') // Campo onde p usuário digita a resposta
const messageResponse = document.querySelector('#message') // Campo onde a mensagem (correto/errado) será exibida

// MODALS
const configModal = document.querySelector('#config-modal') // Modal de configuração da partida
const gameModal = document.querySelector('#game-modal') // Modal da partida em andamento
const endModal = document.querySelector('#end-modal') // Modal de fim de partida

// DADOS DO JOGO
const fieldName = document.querySelector('#nome') // Campo onde o usuário digita seu nome
const fieldDifficulty = document.getElementsByName('difficulty') // Campo onde o usuário seleciona a dificuldade do jogo
const fieldTime = document.getElementsByName('time') // Campo onde o usuário seleciona o tempo da partida

// DADOS DO FIM DA PARTIDA
const playerName = document.querySelector('#player-name') // Campo onde o nome do jogador será exibido no fim da partida
const levelGame = document.querySelector('#level-game') // Campo onde o nível do jogo será exibido
const correctWords = document.querySelector('#correct-words') // Campo onde o número de palavras corretas será exibido
const wrongWords = document.querySelector('#wrong-words') // Campo onde o número de palavras erradas será exibido
const saveButton = document.querySelector('#btn-save') // Botão para salvar os resultados
const cancelButton = document.querySelector('#btn-cancel') // Botão para cancelar e fechar o modal
const wrongWordsContainer = document.querySelector('#wrong-words-container') // Campo onde as palavras erradas serão exibidas

let palavra
let wrongWordsList = []

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

// FUNÇÃO QUE INICIA O JOGO
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

// FUNÇÃO QUE BUSCA UMA PALAVRA ALEATÓRIA NA API
const randomWord = async () => {
    const response = await fetch(`${URL}?difficulty=${dataGame.difficulty}`)
    const data = await response.json()
    palavra = data

    wordField.innerText = palavra.word
}

// FUNÇÃO QUE ATUALIZA O TEMPO DO CRONOMETRO NA TELA
function updateDisplayTime() {
    let minutos = Math.floor(tempoRestante / 60)
    let segundos = tempoRestante % 60

    let segundosFormatados = segundos < 10 ? '0' + segundos : segundos
    let minutosFormatados = minutos < 10 ? '0' + minutos : minutos
    tempo.innerText = `${minutosFormatados}:${segundosFormatados}`
}

// FUNÇÃO QUE FINALIZA O JOGO
function endGame() {
    jogoAtivo = false
    clearInterval(cronometro)

    if(fieldResponse) fieldResponse.disabled = true
    if(sendButton) sendButton.disabled = true

    showEndModal()

    tempo.style.color = 'red'
}

// FUNÇÃO QUE EXIBE O MODAL DE FIM DA PARTIDA E OS RESULTADOS
function showEndModal() {
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
}

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

    fieldTime.forEach((time) => {
        if(time.checked) {
            tempoRestante = parseInt(time.value)
        }
    })

    tempo.innerText = (tempoRestante / 60 < 10 ? '0' + (tempoRestante / 60) : tempoRestante / 60) + ':00'
    startGame()
})

sendButton.addEventListener('click', async () => {
    sendButton.disabled = true

    if(fieldResponse.value == '') {
        alert('Por favor, insira uma resposta antes de enviar.')
        sendButton.disabled = false
        return
    }
    
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

        wrongWordsList.push({word: data.word, translations: data.translations})
    }

    translationField.innerText = data.translations

    setTimeout(() => {
        sendButton.disabled = false
        fieldResponse.value = ''
        translationField.innerText = ''
        messageResponse.classList.remove('true')
        messageResponse.classList.remove('false')
        messageResponse.innerText = ''
        randomWord()
    }, 3000)
})

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