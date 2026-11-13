const API_TAREFA = "http://localhost:3000/tarefa";
const API_USUARIOS = "http://localhost:3000/usuario/listar";

const formTarefa = document.getElementById("formTarefa");
const campoDescricao = document.getElementById("descricao");
const campoSetor = document.getElementById("nome_setor");
const campoUsuario = document.getElementById("usuarioId");
const campoPrioridade = document.getElementById("prioridade");
const mensagem = document.getElementById("mensagem");
const botaoCadastrar = document.getElementById("btnCadastrar");
const idEdicao = new URLSearchParams(window.location.search).get("id");

const usuariosCarregados = carregarUsuarios();
if (idEdicao) {
    document.querySelector("main h2").textContent = "Editar Tarefa";
    botaoCadastrar.textContent = "Salvar Alterações";
    carregarTarefaParaEdicao();
}

formTarefa.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limparMensagem();

    const descricao = campoDescricao.value.trim();
    const nome_setor = campoSetor.value.trim();
    const usuarioId = Number(campoUsuario.value);
    const prioridade = campoPrioridade.value;

    if (!descricao || !nome_setor || !usuarioId || !prioridade) {
        exibirMensagem("Preencha todos os campos.", "erro");
        return;
    }

    botaoCadastrar.disabled = true;

    try {
        const resposta = await fetch(idEdicao ? `${API_TAREFA}/atualizar/${idEdicao}` : `${API_TAREFA}/cadastrar`, {
            method: idEdicao ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, nome_setor, usuarioId, prioridade })
        });

        if (!resposta.ok) {
            exibirMensagem("Não foi possível cadastrar a tarefa.", "erro");
            return;
        }

        formTarefa.reset();
        const confirmacao = idEdicao ? "Tarefa atualizada com sucesso." : "cadastro concluído com sucesso";
        exibirMensagem(confirmacao, "sucesso");
        alert(confirmacao);
    } catch (erro) {
        exibirMensagem("Erro ao conectar com o servidor. Verifique se a API está em execução.", "erro");
    } finally {
        botaoCadastrar.disabled = false;
    }
});

async function carregarUsuarios() {
    campoUsuario.disabled = true;

    try {
        const resposta = await fetch(API_USUARIOS);
        if (!resposta.ok) {
            throw new Error("Falha ao carregar usuários.");
        }

        const usuarios = await resposta.json();
        if (!Array.isArray(usuarios)) {
            throw new Error("Resposta inválida ao carregar usuários.");
        }

        campoUsuario.replaceChildren();

        const opcaoInicial = document.createElement("option");
        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione";
        opcaoInicial.disabled = true;
        opcaoInicial.selected = true;
        campoUsuario.append(opcaoInicial);

        usuarios.forEach((usuario) => {
            const opcao = document.createElement("option");
            opcao.value = usuario.id;
            opcao.textContent = usuario.nome;
            campoUsuario.append(opcao);
        });

        if (usuarios.length === 0) {
            exibirMensagem("Cadastre um usuário antes de registrar uma tarefa.", "erro");
            return false;
        }

        campoUsuario.disabled = false;
        return true;
    } catch (erro) {
        campoUsuario.replaceChildren();
        const opcaoErro = document.createElement("option");
        opcaoErro.value = "";
        opcaoErro.textContent = "Não foi possível carregar usuários";
        opcaoErro.disabled = true;
        opcaoErro.selected = true;
        campoUsuario.append(opcaoErro);
        exibirMensagem("Erro ao carregar usuários. Verifique se a API está em execução.", "erro");
        return false;
    }
}

async function carregarTarefaParaEdicao() {
    botaoCadastrar.disabled = true;
    try {
        const resposta = await fetch(`${API_TAREFA}/buscar/${idEdicao}`);
        if (!resposta.ok) throw new Error("Falha ao carregar tarefa.");
        const tarefa = await resposta.json();
        if (!tarefa) throw new Error("Tarefa não encontrada.");

        campoDescricao.value = tarefa.descricao || "";
        campoSetor.value = tarefa.nome_setor || "";
        campoPrioridade.value = tarefa.prioridade || "";

        const carregouUsuarios = await usuariosCarregados;
        if (!carregouUsuarios || !campoUsuario.querySelector(`option[value="${tarefa.usuarioId}"]`)) {
            throw new Error("Usuário vinculado não encontrado.");
        }
        campoUsuario.value = String(tarefa.usuarioId);
        botaoCadastrar.disabled = false;
    } catch (erro) {
        botaoCadastrar.disabled = false;
        exibirMensagem("Não foi possível carregar a tarefa para edição.", "erro");
    }
}

function exibirMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "";
}
