// Carrega os registros ao abrir a página
document.addEventListener('DOMContentLoaded', loadRegistros);

function loadRegistros() {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    const tabela = document.getElementById('tabela-registros');

    // Limpa a tabela antes de adicionar novos registros
    tabela.innerHTML = '';

    const dataAtual = new Date().toISOString().split('T')[0]; // Formato yyyy-mm-dd

    registros.forEach((registro, index) => {
        const tr = document.createElement('tr');
        const observacaoClass = registro.observacao ? 'observado' : '';
        const editadoClass = registro.editado ? 'editado' : '';
        const dataRegistro = registro.data.split('/').reverse().join('-'); // Formato dd/mm/yyyy para yyyy-mm-dd

        // Verifica se a data é passada
        const dataPassadaClass = dataRegistro < dataAtual ? 'data-passada' : '';

        tr.className = `${observacaoClass} ${editadoClass} ${dataPassadaClass}`;
        tr.innerHTML = `
            <td>${registro.select}</td>
            <td>${registro.data}</td>
            <td>${registro.hora}</td>
            <td>${registro.latitude}</td>
            <td>${registro.longitude}</td>
            <td>
                <input type="text" value="${registro.observacao || ''}" 
                       onchange="adicionarObservacao(${index}, this.value)" placeholder="Adicionar observação">
            </td>
            <td>
                <button onclick="abrirModalEdicao(${index})">Editar</button>
                <button onclick="deletarRegistro(${index})">Deletar</button> <!-- Botão para deletar -->
            </td>
        `;
        tabela.appendChild(tr);
    });
}

function adicionarObservacao(index, observacao) {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    registros[index].observacao = observacao;

    // Atualiza a flag de editado
    registros[index].editado = observacao !== ''; // Se a observação estiver vazia, não é editado

    localStorage.setItem('registroPonto', JSON.stringify(registros));
    loadRegistros(); // Recarrega a tabela
}

function abrirModalEdicao(index) {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    const registro = registros[index];

    // Preenche o modal com os dados do registro
    document.getElementById('modal-select').value = registro.select;
    document.getElementById('modal-data').value = registro.data;
    
    // Divide a hora em horas, minutos e segundos
    const [hora, minuto, segundo] = registro.hora.split(':');
    document.getElementById('modal-hora').value = hora || '00';
    document.getElementById('modal-minuto').value = minuto || '00';
    document.getElementById('modal-segundo').value = segundo || '00';

    document.getElementById('modal-latitude').value = registro.latitude;
    document.getElementById('modal-longitude').value = registro.longitude;
    document.getElementById('modal-observacao').value = registro.observacao || '';

    // Define o índice do registro para salvar as edições
    document.getElementById('modal-index').value = index;

    // Abre o modal
    document.getElementById('modal-edicao').showModal();
}

function salvarEdicao() {
    const index = document.getElementById('modal-index').value;
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];

    // Atualiza os valores do registro
    registros[index].select = document.getElementById('modal-select').value;
    
    // Obtém a data e garante que não é futura
    const novaData = document.getElementById('modal-data').value;
    const dataAtual = new Date().toISOString().split('T')[0]; // Formato yyyy-mm-dd
    if (novaData > dataAtual) {
        alert('A data não pode ser no futuro.');
        return; // Não salva se a data for no futuro
    }
    registros[index].data = formatarData(novaData); // Formata a data

    // Obtém a hora, minuto e segundo
    const hora = document.getElementById('modal-hora').value.padStart(2, '0');
    const minuto = document.getElementById('modal-minuto').value.padStart(2, '0');
    const segundo = document.getElementById('modal-segundo').value.padStart(2, '0');

    registros[index].hora = `${hora}:${minuto}:${segundo}`; // Formata a hora

    registros[index].latitude = document.getElementById('modal-latitude').value;
    registros[index].longitude = document.getElementById('modal-longitude').value;
    registros[index].observacao = document.getElementById('modal-observacao').value;

    // Salva as edições no localStorage
    localStorage.setItem('registroPonto', JSON.stringify(registros));
    loadRegistros(); // Recarrega a tabela

    // Fecha o modal
    document.getElementById('modal-edicao').close();
}

// Função para formatar a data para dia/mês/ano
function formatarData(data) {
    const partes = data.split('-'); // Divide a data no formato yyyy-mm-dd
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // Retorna no formato dd/mm/yyyy
}

// Função para deletar registro
function deletarRegistro(index) {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];

    // Remove o registro do array
    registros.splice(index, 1);

    // Atualiza o localStorage
    localStorage.setItem('registroPonto', JSON.stringify(registros));

    // Recarrega a tabela para refletir a remoção
    loadRegistros();
}

// Configura o botão de fechar no modal
document.getElementById('btn-fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-edicao').close();
});
