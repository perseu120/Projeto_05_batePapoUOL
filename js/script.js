let token; //token para salvar o codigo do setInverval para depois poder para o contador de tempo

// objeto para salvar o nome de usuario digitado pelo cliente
const usuario = { 
    name: ''
}

//serve para armazenas as mensagens que estão na api
let listaMensagens = [];

// fica atualizando as mensagens na tela a cada 1s
const token2 = setInterval(()=>{
    promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages')
    promise.then(carregarMensagens)

},1000 )

promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages') //buscar as mensagens no servidor
promise.then(carregarMensagens)

//busca as mensagens na api e coloca na lista, ae já chama a renderizar para colocar elas para ser exibida
function carregarMensagens(resposta) {
    listaMensagens = resposta.data;
    renderizarMensagem(listaMensagens);

    let ultimoElemento = document.querySelectorAll(".mensagem");
    ultimoElemento = ultimoElemento[ultimoElemento.length - 1];
    ultimoElemento.scrollIntoView();
}

//adiciona a div no html com as mensagens dos usuarios
function criaMensagem(mensagem) { //na hora que adiciona o texto para ele buga as mensagens
    
    
    if(mensagem.type === 'status'){
        return `
        <div class="mensagem fundoCinza">
            <p class="time">${mensagem.time}</p>
            <p class="nome"> <strong> ${mensagem.from}</strong></p>
            <p class="destinatario">para<strong>&nbsp;${mensagem.to}</strong>:</p> 
            <p class="msg">${mensagem.text}</p>
        </div>
        `;
    }else if(mensagem.type === 'private_message' &&( mensagem.to === usuario.name || mensagem.from === usuario.name) ){
        return `
        <div class="mensagem fundoRosa">
            <p class="time">${mensagem.time}</p>
            <p class="nome"> <strong> ${mensagem.from}</strong></p>
            <p class="destinatario"> para <strong>&nbsp;${mensagem.to}</strong>:</p> 
            <p class="msg">${mensagem.text}</p>
        </div>
        `;
    }
    
    return `
    <div class="mensagem fundoBranco">
        <p class="time">${mensagem.time}</p>
        <p class="nome"> <strong> ${mensagem.from}</strong></p>
        <p class="destinatario"> para <strong>&nbsp;${mensagem.to}</strong>:</p> 
        <p class="msg">${mensagem.text}</p>
    </div>
    `;
}


//essa função serve para adicionar as mensagens no html 
function renderizarMensagem(mensagem) {
    let app = document.querySelector(".container");
    app.innerHTML = "";
   
    for (let i = 0; i < mensagem.length; i++) {
      const usuario = mensagem[i];
      app.innerHTML += criaMensagem(usuario);
    }

}

//essa é a função inicial para entra no batepapo ele quem chama a função para pedir o nome do usuario e fazr a requisição para a api
function entraNOBatePapo(){
    const usuario = pedirNomeUsuario();

    promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', usuario);

    promise.then((response)=>{
        console.log('conectou')
        manterConexao(usuario);
        
    });

    promise.catch((err)=>{
        console.log(err.response);
        pedirNomeUsuario();
    });
    
}

//função para ficar pingando para a api assim ela não desconecta o usuario, chamo essa função com o setInterval a cada 3 segundos
function manterConexao(usuario){

    token = setInterval( ()=>{
        console.log("conectado")
        promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', usuario);
        
    }, 3000);
    
    promise.catch(()=>{
        alert("conexao caiu");
        clearInterval(token2);
    })

}

//função que pedi o nome do usuario e retorna o usuario com o nome
function pedirNomeUsuario(){
    usuario.name = prompt("nome de Usuario");

    return usuario;
}
//a função que retorna o usuario
function getUsuario(){
    return usuario;
}

//essa função server para enviar a mensagem ele montar o objeto mensagem e manda para a api atravez so metodo post
function enviarMensagem(element){

    let divPaiButton = element.parentNode; // atravez desse codigo eu pego o componente html que esta incluso o botão que foi clicado faço isso para conseguir pegar o que o usuario escreveru
    
    mensagem = {
        from: getUsuario().name,
        to: "Todos",
        text: divPaiButton.querySelector('input').value, // aqui eu pego o que o usuario digitou no campo
        type: "message" // ou "private_message" para o bônus
    }

    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem );

    promise.then(carregarMensagens);//aqui eu chamo a função para carregar as mensagens na tela assim que foi enviada

    divPaiButton.querySelector('input').value = ""; // depois da mensagem enviada eu limpo o campo

    promise.catch(()=>{ // se a mensagem não for enviada eu paro o token para desativar o setinterval, e recarrego a pagina pra digitar um novo usuario
        alert("mensagem não enviada")
        clearInterval(token);
        window.location.reload()
        
    })
}

document.addEventListener("keypress", function(e) {//evento que verifica se a tecla precionada foi um enter para enviar com enter
    if(e.key === 'Enter') {
    
        var btn = document.querySelector("#submit");
        
        btn.click(this);
    }
});

entraNOBatePapo(); //entra no bate papo
