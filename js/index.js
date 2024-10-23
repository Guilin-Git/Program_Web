navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
});

loadRegistros();

// Obtém referências aos elementos do DOM
const diaSemana = document.getElementById("diaSemana");
const diaMesAno = document.getElementById("diaMesAno");
const horario = document.getElementById("horario");

// Obtém referência ao botão e ao dialog
const btnBaterPonto = document.getElementById("btn-bater-ponto");
const dialogPonto = document.getElementById("dialog-ponto");

// Obtém referência da hora e data no dialog
const dialogData = document.getElementById("dialog-data");
const dialogHora = document.getElementById("dialog-hora");

// Configura o campo de data para não permitir datas futuras
const dataPonto = document.getElementById("dataPonto");
dataPonto.max = getCurrentDateForInput(); // Configura o valor máximo

// Atualiza o conteúdo do diálogo ao clicar no botão
btnBaterPonto.addEventListener("click", () => {
    dialogPonto.showModal(); // Abre o dialog
    
    // Atualiza as informações de data e hora no dialog ao abrir
    dialogData.textContent = "Data: " + getCurrentDate();
    dialogHora.textContent = "Hora: " + getCurrentTime();
    
    // Atualiza o modal com o último registro, se disponível
    if (ultimoRegistro) {
        document.getElementById("ultimoRegistroTipo").textContent = "Tipo: " + ultimoRegistro.select;
        document.getElementById("ultimoRegistroData").textContent = "Data: " + ultimoRegistro.data;
        document.getElementById("ultimoRegistroHora").textContent = "Hora: " + ultimoRegistro.hora;
        document.getElementById("ultimoRegistroTitulo").textContent = "Último ponto registrado:";
    } else {
        document.getElementById("ultimoRegistroTitulo").textContent = "Último ponto registrado:";
        document.getElementById("ultimoRegistroTipo").textContent = "";
        document.getElementById("ultimoRegistroData").textContent = "";
        document.getElementById("ultimoRegistroHora").textContent = "";
    } 
});

// Configura o botão de fechar no dialog
const btnFechar = document.getElementById("btn-fechar");
btnFechar.addEventListener("click", () => {
    dialogPonto.close(); // Fecha o dialog
});

// Configura o botão de registrar ponto
const btnRegistrarPonto = document.getElementById("btn-registrar");
btnRegistrarPonto.addEventListener("click", () => {
    console.log("Botão de registrar ponto clicado."); // Log para verificar se o botão foi clicado
    RegistroPonto();
    dialogPonto.close(); // Fecha o dialog após registrar o ponto
});

// Função para ir para a página de relatório
const btnIrRelatorio = document.getElementById("btn-ir-relatorio");
btnIrRelatorio.addEventListener("click", () => {
    window.location.href = "relatorio.html"; // Altere "relatorio.html" para o caminho do seu arquivo de relatório
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

// Função para obter a data atual no formato YYYY-MM-DD, ajustado para o fuso horário local
function getCurrentDateForInput() {
    const date = new Date();
    const timezoneOffset = new Date().getTimezoneOffset() * 60000; // Converte o offset para milissegundos
    const localISOTime = new Date(Date.now() - timezoneOffset).toISOString().split("T")[0];
    return localISOTime;
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

// Inicializa a lista para armazenar os registros de ponto
let registroPonto = [];

// Inicializa a variável global para armazenar o último ponto registrado
let ultimoRegistro = null;

function RegistroPonto() {
    const agora = new Date();
    const id = Date.now(); // ID único baseado no timestamp atual
    
    // Verifica se o usuário selecionou uma data ou usa a atual
    const dataSelecionada = dataPonto.value ? formatDateForDisplay(dataPonto.value) : getCurrentDate();
    
    // Obtém a data atual com fuso horário ajustado
    const dataAtual = getCurrentDateForInput(); // Usa o formato YYYY-MM-DD
    
    // Verifica se a data selecionada é maior que a data atual
    if (dataPonto.value > dataAtual) {
        alert("Não é possível registrar um ponto em uma data futura.");
        return; // Interrompe a execução se a data for inválida
    }
    
    // Obtém a hora atual
    const hora = getCurrentTime();
    const select = document.getElementById("tipos-ponto").value;

    // Obtém o nome, sobrenome e CPF
    const nome = document.getElementById("nome").value;
    const sobrenome = document.getElementById("sobrenome").value;
    const cpf = document.getElementById("cpf").value;
    
    // Obtém a localização
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Cria o objeto de registro
        const registro = {
            id: id,
            select: select,
            data: dataSelecionada,
            hora: hora,
            latitude: latitude,
            longitude: longitude,
            nome: nome,
            sobrenome: sobrenome,
            cpf: cpf 
        };
        
        // Adiciona o registro à lista
        registroPonto.push(registro);
        ultimoRegistro = registro; // Atualiza o último registro
        console.log('Ponto registrado:', registro);
        
        // Salva o registro no localStorage
        saveRegistroPonto(registro);

        // Exibe a notificação
        showNotification(registro);
    }, (error) => {
        console.error("Erro ao obter localização: ", error);
    });
}


// Função para salvar o registro no localStorage
function saveRegistroPonto(registro) {
    // Obtém a lista de registros existente ou inicializa uma nova
    let registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    
    // Adiciona o novo registro
    registros.push(registro);
    
    // Salva a lista atualizada no localStorage
    localStorage.setItem('registroPonto', JSON.stringify(registros));
}

// Função para carregar registros do localStorage
function loadRegistros() {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    console.log('Registros carregados:', registros);
}

// Função para exibir a notificação
function showNotification(registro) {
    const notification = document.getElementById("notification");
    const notificationContent = document.getElementById("notification-content");
    
    // Define o conteúdo da notificação
    notificationContent.textContent = `Ponto registrado! Tipo: ${registro.select}, Data: ${registro.data}, Hora: ${registro.hora}`;
    
    // Exibe a notificação
    notification.classList.add("show");
    
    // Oculta a notificação após 5 segundos
    setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hide");
    }, 5000);
    
    // Remove a classe de ocultar após o efeito de fade-out ter terminado
    setTimeout(() => {
        notification.classList.remove("hide");
    }, 3500);
}

// Função para formatar a data no estilo brasileiro (dd/mm/yyyy)
function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

