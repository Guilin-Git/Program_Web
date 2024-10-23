document.addEventListener('DOMContentLoaded', loadRegistros);

function loadRegistros() {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    const tabela = document.getElementById('tabela-registros');

    tabela.innerHTML = '';

    const filtroPeriodo = document.getElementById('filtro-periodo').value;
    const hoje = new Date(); // A data e hora local do sistema

    let dataLimite;
    if (filtroPeriodo === 'ultima-semana') {
        dataLimite = new Date(hoje);
        dataLimite.setDate(hoje.getDate() - 7);
    } else if (filtroPeriodo === 'ultimo-mes') {
        dataLimite = new Date(hoje);
        dataLimite.setMonth(hoje.getMonth() - 1);
    } else {
        dataLimite = null;
    }

    registros.forEach((registro, index) => {
        // Converte a data do registro de dd/mm/yyyy para um objeto Date
        const partesData = registro.data.split('/');
        const dataRegistro = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}T00:00:00`); // Horário definido para meia-noite

        // Verifica se a data está dentro do período selecionado e não é futura
        if ((!dataLimite || dataRegistro >= dataLimite) && dataRegistro <= hoje) {
            const tr = document.createElement('tr');
            const observacaoClass = registro.observacao ? 'observado' : '';

            // Verifica se a data é a data de hoje ou é passada
            const dataHojeClass = dataRegistro.toDateString() === hoje.toDateString() ? 'data-hoje' : '';
            const dataPassadaClass = dataRegistro < hoje && dataHojeClass === '' ? 'data-passada' : '';

            const tdData = `<td class="${dataPassadaClass || dataHojeClass}">${registro.data}</td>`;
            const tdObservacao = `<td class="${observacaoClass}">
                <input type="text" value="${registro.observacao || ''}" 
                       onchange="adicionarObservacao(${index}, this.value)" placeholder="Adicionar observação">
            </td>`;

            tr.innerHTML = `
                <td>${registro.nome}</td>
                <td>${registro.sobrenome}</td>
                <td>${registro.cpf}</td>
                <td>${registro.select}</td>
                ${tdData}
                <td>${registro.hora}</td>
                <td>${registro.latitude}</td>
                <td>${registro.longitude}</td>
                ${tdObservacao}
                <td>
                    <button onclick="abrirModalEdicao(${index})">Editar</button>
                    <button onclick="deletarRegistro(${index})">Deletar</button>
                </td>
            `;
            tabela.appendChild(tr);
        }
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
    document.getElementById('modal-data').value = registro.data.split('/').reverse().join('-'); // Corrigido para o formato yyyy-mm-dd

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

    const hoje = new Date();
    const timezoneOffset = hoje.getTimezoneOffset() * 60000;
    const dataAtual = new Date(Date.now() - timezoneOffset).toISOString().split('T')[0]; // Formato yyyy-mm-dd

    if (novaData > dataAtual) {
        alert('A data não pode ser no futuro.');
        return; // Não salva se a data for no futuro
    }

    registros[index].data = formatarData(novaData); // Formata a data para dd/mm/yyyy

    registros[index].hora = `${document.getElementById('modal-hora').value}:${document.getElementById('modal-minuto').value}:${document.getElementById('modal-segundo').value}`;
    registros[index].latitude = document.getElementById('modal-latitude').value;
    registros[index].longitude = document.getElementById('modal-longitude').value;
    registros[index].observacao = document.getElementById('modal-observacao').value;

    // Atualiza a flag de editado
    registros[index].editado = true;

    localStorage.setItem('registroPonto', JSON.stringify(registros));
    loadRegistros(); // Recarrega a tabela
    document.getElementById('modal-edicao').close(); // Fecha o modal
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`; // Formato dd/mm/yyyy
}

document.getElementById('btn-fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-edicao').close();
});

function filtrarRegistros() {
    loadRegistros(); // Recarrega os registros com base no filtro selecionado
}

function deletarRegistro(index) {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    registros.splice(index, 1); // Remove o registro pelo índice

    localStorage.setItem('registroPonto', JSON.stringify(registros));
    loadRegistros(); // Recarrega a tabela após a exclusão
}
