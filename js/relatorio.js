document.addEventListener('DOMContentLoaded', loadRegistros);

function loadRegistros() {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    const tabela = document.getElementById('tabela-registros');

    tabela.innerHTML = '';

    const filtroPeriodo = document.getElementById('filtro-periodo').value;
    const hoje = new Date();

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
        const partesData = registro.data.split('/');
        const dataRegistro = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}T00:00:00`);

        if ((!dataLimite || dataRegistro >= dataLimite) && dataRegistro <= hoje) {
            const tr = document.createElement('tr');

            if (registro.editado) {
                tr.classList.add('registro-editado');
            }
            
            const observacaoClass = registro.observacao ? 'observado' : '';

            const dataHojeClass = dataRegistro.toDateString() === hoje.toDateString() ? 'data-hoje' : '';
            const dataPassadaClass = dataRegistro < hoje && dataHojeClass === '' ? 'data-passada' : '';

            const tdData = `<td class="${dataPassadaClass || dataHojeClass}">${registro.data}</td>`;
            const tdObservacao = `<td class="${observacaoClass}">
                <input type="text" value="${registro.observacao || ''}" 
                       onchange="adicionarObservacao(${index}, this.value)" placeholder="Adicionar observação">
            </td>`;

            const tdJustificativa = `<td>${registro.justificativa || ''}</td>`;
            const tdArquivo = registro.arquivoUrl ? `<td><a href="${registro.arquivoUrl}" download="${registro.nomeArquivo}">Baixar Arquivo</a></td>` : '<td></td>';

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
                ${tdJustificativa}
                ${tdArquivo}
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

    registros[index].editado = observacao !== '';

    localStorage.setItem('registroPonto', JSON.stringify(registros));
    loadRegistros();
}

function abrirModalEdicao(index) {
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];
    const registro = registros[index];

    document.getElementById('modal-select').value = registro.select;
    document.getElementById('modal-data').value = registro.data.split('/').reverse().join('-');

    const [hora, minuto, segundo] = registro.hora.split(':');
    document.getElementById('modal-hora').value = hora || '00';
    document.getElementById('modal-minuto').value = minuto || '00';
    document.getElementById('modal-segundo').value = segundo || '00';

    document.getElementById('modal-latitude').value = registro.latitude;
    document.getElementById('modal-longitude').value = registro.longitude;
    document.getElementById('modal-observacao').value = registro.observacao || '';

    document.getElementById('modal-index').value = index;

    document.getElementById('modal-edicao').showModal();
}

function salvarEdicao() {
    const index = document.getElementById('modal-index').value;
    const registros = JSON.parse(localStorage.getItem('registroPonto')) || [];

    registros[index].select = document.getElementById('modal-select').value;

    const novaData = document.getElementById('modal-data').value;

    const hoje = new Date();
    const timezoneOffset = hoje.getTimezoneOffset() * 60000;
    const dataAtual = new Date(Date.now() - timezoneOffset).toISOString().split('T')[0];

    if (novaData > dataAtual) {
        alert('A data não pode ser no futuro.');
        return;
    }

    registros[index].data = formatarData(novaData);

    registros[index].hora = `${document.getElementById('modal-hora').value}:${document.getElementById('modal-minuto').value}:${document.getElementById('modal-segundo').value}`;
    registros[index].latitude = document.getElementById('modal-latitude').value;
    registros[index].longitude = document.getElementById('modal-longitude').value;
    registros[index].observacao = document.getElementById('modal-observacao').value;

    registros[index].editado = true;

    localStorage.setItem('registroPonto', JSON.stringify(registros));
    loadRegistros();
    document.getElementById('modal-edicao').close();
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

document.getElementById('btn-fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-edicao').close();
});

function filtrarRegistros() {
    loadRegistros();
}

function deletarRegistro(index) {
    alert('Não é possivel deletar um ponto já cadastrado no sistema.');
}
