const API_USUARIO = "http://localhost:3000/usuario/cadastrar";

const formUsuario = document.getElementById("formUsuario");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const mensagem = document.getElementById("mensagem");
const botaoCadastrar = document.getElementById("btnCadastrar");

formUsuario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagem.textContent = "";
    mensagem.className = "";

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();

    if (!nome || !email) {
        exibirMensagem("Preencha todos os campos.", "erro");
        return;
    }

    if (!campoEmail.validity.valid) {
        exibirMensagem("Digite um e-mail válido.", "erro");
        campoEmail.focus();
        return;
    }

    botaoCadastrar.disabled = true;

    try {
        const resposta = await fetch(API_USUARIO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email })
        });

        if (!resposta.ok) {
            let detalhe = "Não foi possível cadastrar o usuário.";
            if (resposta.status === 409) detalhe = "Este e-mail já está cadastrado.";
            exibirMensagem(detalhe, "erro");
            return;
        }

        formUsuario.reset();
        exibirMensagem("cadastro concluído com sucesso", "sucesso");
        alert("cadastro concluído com sucesso");
    } catch (erro) {
        exibirMensagem("Erro ao conectar com o servidor. Verifique se a API está em execução.", "erro");
    } finally {
        botaoCadastrar.disabled = false;
    }
});

function exibirMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}
