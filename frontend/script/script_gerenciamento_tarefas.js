const API_TAREFAS = "http://localhost:3000/tarefa";
const statusPorColuna = {
    A_FAZER: "coluna-a-fazer",
    FAZENDO: "coluna-fazendo",
    PRONTO: "coluna-pronto"
};
const nomesStatus = { A_FAZER: "A Fazer", FAZENDO: "Fazendo", PRONTO: "Pronto" };
const mensagem = document.getElementById("mensagem");

carregarTarefas();

async function carregarTarefas() {
    Object.values(statusPorColuna).forEach((id) => {
        document.getElementById(id).replaceChildren();
    });

    try {
        const resposta = await fetch(`${API_TAREFAS}/listar`);
        if (!resposta.ok) throw new Error("Falha ao carregar tarefas.");
        const tarefas = await resposta.json();

        if (!Array.isArray(tarefas)) throw new Error("Resposta inválida da API.");
        tarefas.forEach((tarefa) => {
            const coluna = statusPorColuna[tarefa.status];
            if (coluna) document.getElementById(coluna).append(criarCartao(tarefa));
        });

        Object.values(statusPorColuna).forEach((id) => {
            const lista = document.getElementById(id);
            if (!lista.childElementCount) {
                const vazio = document.createElement("p");
                vazio.className = "vazio";
                vazio.textContent = "Nenhuma tarefa";
                lista.append(vazio);
            }
        });
    } catch (erro) {
        exibirMensagem("Não foi possível carregar as tarefas. Verifique se a API está em execução.", "erro");
    }
}

function criarCartao(tarefa) {
    const cartao = document.createElement("article");
    cartao.className = "cartao-tarefa";

    const descricao = document.createElement("p");
    descricao.innerHTML = `<strong>Descrição:</strong> ${escapar(tarefa.descricao || "Sem descrição")}`;
    const setor = document.createElement("p");
    setor.innerHTML = `<strong>Setor:</strong> ${escapar(tarefa.nome_setor)}`;
    const prioridade = document.createElement("p");
    prioridade.innerHTML = `<strong>Prioridade:</strong> ${formatarEnum(tarefa.prioridade)}`;
    const usuario = document.createElement("p");
    usuario.innerHTML = `<strong>Vinculado a:</strong> ${escapar(tarefa.usuario?.nome || `Usuário ${tarefa.usuarioId}`)}`;

    const acoes = document.createElement("div");
    acoes.className = "acoes";
    const editar = document.createElement("a");
    editar.className = "botao";
    editar.href = `cadastro.tarefa.html?id=${encodeURIComponent(tarefa.id)}`;
    editar.textContent = "Editar";
    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.textContent = "Excluir";
    excluir.addEventListener("click", () => excluirTarefa(tarefa.id));
    acoes.append(editar, excluir);

    const controlesStatus = document.createElement("div");
    controlesStatus.className = "controles-status";
    const seletor = document.createElement("select");
    seletor.setAttribute("aria-label", `Status de ${tarefa.descricao || `tarefa ${tarefa.id}`}`);
    Object.entries(nomesStatus).forEach(([valor, rotulo]) => {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = rotulo;
        opcao.selected = tarefa.status === valor;
        seletor.append(opcao);
    });
    const atualizar = document.createElement("button");
    atualizar.type = "button";
    atualizar.textContent = "Alterar Status";
    atualizar.addEventListener("click", () => atualizarStatus(tarefa.id, seletor.value, atualizar));
    controlesStatus.append(seletor, atualizar);

    cartao.append(descricao, setor, prioridade, usuario, acoes, controlesStatus);
    return cartao;
}

async function excluirTarefa(id) {
    if (!window.confirm("Tem certeza de que deseja excluir esta tarefa?")) return;

    try {
        const resposta = await fetch(`${API_TAREFAS}/excluir/${id}`, { method: "DELETE" });
        if (!resposta.ok) throw new Error("Falha ao excluir tarefa.");
        await carregarTarefas();
        exibirMensagem("Tarefa excluída com sucesso.", "sucesso");
    } catch (erro) {
        exibirMensagem("Não foi possível excluir a tarefa.", "erro");
    }
}

async function atualizarStatus(id, status, botao) {
    botao.disabled = true;
    try {
        const resposta = await fetch(`${API_TAREFAS}/atualizar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (!resposta.ok) throw new Error("Falha ao atualizar status.");
        await carregarTarefas();
        exibirMensagem("Status atualizado com sucesso.", "sucesso");
    } catch (erro) {
        exibirMensagem("Não foi possível atualizar o status.", "erro");
    } finally {
        botao.disabled = false;
    }
}

function formatarEnum(valor) {
    return ({ BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta" })[valor] || valor || "—";
}

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caractere]);
}

function exibirMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "";
}
