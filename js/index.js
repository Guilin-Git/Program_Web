navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
})



// Obtém referências aos elementos do DOM
const diaSemana = document.getElementById("diaSemana");
const diaMesAno = document.getElementById("diaMesAno");
const horario = document.getElementById("horario");

// Obtém referência ao botão e ao dialog
const btnBaterPonto = document.getElementById("btn-bater-ponto");
const dialogPonto = document.getElementById("dialog-ponto");

// Obtém referência da hora e data no dialog
const dialogData = document.getElementById("dialog-data"); // Atualizado para o ID correto
const dialogHora = document.getElementById("dialog-hora"); // Atualizado para o ID correto

// Adiciona o evento de clique ao botão "Bater Ponto!"
btnBaterPonto.addEventListener("click", () => {
    dialogPonto.showModal(); // Abre o dialog
    // Atualiza as informações de data e hora no dialog ao abrir
    dialogData.textContent = "Data: " + getCurrentDate();
    dialogHora.textContent = "Hora: " + getCurrentTime();
});

// Configura o botão de fechar no dialog
const btnFechar = document.getElementById("btn-fechar");
btnFechar.addEventListener("click", () => {
    dialogPonto.close(); // Fecha o dialog
});

// Atualiza as informações de data e hora fora do dialog
diaMesAno.textContent = getCurrentDate();
horario.textContent = getCurrentTime();
diaSemana.textContent = getCurrentWeekDay();

// Função para obter a data atual formatada
function getCurrentDate() {
    const date = new Date();
    return (
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) +
        "/" +
        (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) +
        "/" +
        date.getFullYear()
    );
}

// Função para obter o dia da semana atual
function getCurrentWeekDay() {
    const date = new Date();
    const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return weekDays[date.getDay()];
}

// Função para obter a hora atual formatada
function getCurrentTime() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Adiciona zero à esquerda se necessário
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return hours + ":" + minutes + ":" + seconds;
}

// Atualiza a hora a cada 1000 milissegundos (1 segundo)
setInterval(() => {
    const currentTime = getCurrentTime();
    horario.textContent = currentTime; // Atualiza a hora fora do dialog
    if (dialogPonto.open) { // Verifica se o dialog está aberto
        dialogHora.textContent = "Hora: " + currentTime; // Atualiza a hora dentro do dialog
    }
}, 1000);
