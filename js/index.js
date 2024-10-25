navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
});

loadRegistros();

const diaSemana = document.getElementById("diaSemana");
const diaMesAno = document.getElementById("diaMesAno");
const horario = document.getElementById("horario");

const btnBaterPonto = document.getElementById("btn-bater-ponto");
const dialogPonto = document.getElementById("dialog-ponto");

const dialogData = document.getElementById("dialog-data");
const dialogHora = document.getElementById("dialog-hora");

const dataPonto = document.getElementById("dataPonto");
dataPonto.max = getCurrentDateForInput();

btnBaterPonto.addEventListener("click", () => {
    dialogPonto.showModal();
    dialogData.textContent = "Data: " + getCurrentDate();
    dialogHora.textContent = "Hora: " + getCurrentTime();

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

const btnFechar = document.getElementById("btn-fechar");
btnFechar.addEventListener("click", () => {
    dialogPonto.close();
});

const btnRegistrarPonto = document.getElementById("btn-registrar");
btnRegistrarPonto.addEventListener("click", () => {
    console.log("Botão de registrar ponto clicado.");
    RegistroPonto();
    dialogPonto.close();
});

const btnIrRelatorio = document.getElementById("btn-ir-relatorio");
btnIrRelatorio.addEventListener("click", () => {
    window.location.href = "relatorio.html"; 
});

diaMesAno.textContent = getCurrentDate();
horario.textContent = getCurrentTime();
diaSemana.textContent = getCurrentWeekDay();

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

function getCurrentDateForInput() {
    const date = new Date();
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - timezoneOffset).toISOString().split("T")[0];
    return localISOTime;
}

function getCurrentWeekDay() {
    const date = new Date();
    const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return weekDays[date.getDay()];
}

function getCurrentTime() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return hours + ":" + minutes + ":" + seconds;
}

setInterval(() => {
    const currentTime = getCurrentTime();
    horario.textContent = currentTime;
    if (dialogPonto.open) {
        dialogHora.textContent = "Hora: " + currentTime;
    }
}, 1000);

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

let registroPonto = [];
let ultimoRegistro = null;

function RegistroPonto() {
    const agora = new Date();
    const id = Date.now();
    const dataSelecionada = dataPonto.value ? formatDateForDisplay(dataPonto.value) : getCurrentDate();
    const dataAtual = getCurrentDateForInput();
    
    if (dataPonto.value > dataAtual) {
        alert("Não é possível registrar um ponto em uma data futura.");
        return;
    }
    
    const hora = getCurrentTime();
    const select = document.getElementById("tipos-ponto").value;

    const nome = document.getElementById("nome").value;
    const sobrenome = document.getElementById("sobrenome").value;
    const cpf = document.getElementById("cpf").value;

    if (nome == '') {
        alert("O nome é um campo obrigatório");
        return;
    }

    if (sobrenome == '') {
        alert("O sobrenome é um campo obrigatório");
        return;
    }

    if (!validarCPF(cpf)) {
        alert("CPF inválido. Por favor, insira um CPF válido.");
        return;
    }

    const justificativa = document.getElementById("justificativa").value;
    let nomeArquivo = '';

    const arquivo = document.getElementById('arquivo').files[0];
    let arquivoUrl = '';

    if (arquivo) {
        nomeArquivo = arquivo.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            arquivoUrl = e.target.result;
        };
        reader.readAsDataURL(arquivo);
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        const registro = {
            id: id,
            select: select,
            data: dataSelecionada,
            hora: hora,
            latitude: latitude,
            longitude: longitude,
            nome: nome,
            sobrenome: sobrenome,
            cpf: cpf,
            justificativa: justificativa || '',
            arquivoUrl: arquivoUrl || '',
            nomeArquivo: nomeArquivo || ''
        };
        
        registroPonto.push(registro);
        ultimoRegistro = registro;
        console.log('Ponto registrado:', registro);
        
        saveRegistroPonto(registro);
        showNotification(registro);
    }, (error) => {
        console.error("Erro ao obter localização: ", error);
    });
}

function saveRegistroPonto(registro) {
    let registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    registros.push(registro);
    localStorage.setItem('registroPonto', JSON.stringify(registros));
}

function loadRegistros() {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    console.log('Registros carregados:', registros);
}

function showNotification(registro) {
    const notification = document.getElementById("notification");
    const notificationContent = document.getElementById("notification-content");
    
    notificationContent.textContent = `Ponto registrado! Tipo: ${registro.select}, Data: ${registro.data}, Hora: ${registro.hora}`;
    
    notification.classList.add("show");
    
    setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hide");
    }, 5000);
    
    setTimeout(() => {
        notification.classList.remove("hide");
    }, 3500);
}

function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}
