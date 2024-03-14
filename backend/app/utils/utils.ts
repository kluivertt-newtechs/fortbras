
export function formatarData(data: Date) {
    // Certifique-se de que a entrada seja um objeto Date
    if (!(data instanceof Date)) {
        console.error('A entrada deve ser um objeto Date.');
        return;
    }

    // Obtém os componentes da data
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    // Monta a string formatada
    const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos}`;

    return dataFormatada;
}
