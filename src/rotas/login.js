const express = require('express')
const app = express()
const router = express.Router();
const jwt = require('jsonwebtoken')
require('dotenv').config();


router.post('/', (req,resp)=>{
    const email = req.body.email
    const senha = req.body.senha
  
    fetch('https://chat-acdd0-default-rtdb.firebaseio.com/user.json').
    then(response=>{if(!response.ok){
        return resp.status(400).json({message:'Requisição falhou'})
    }else{
       return response.json()
    }
}).
    then(dados=>{
        // Validar se o email e senha passados estão no banco
        const values = Object.values(dados)
         const obj = values.find((element)=> { return element.email == email && element.senha == senha})
         
        // Gera um token caso ache e envia para o usuário
        if(obj != undefined){
            
            const token = jwt.sign({email:email},process.env.TOKEN_SECRET,{expiresIn: 3600 })
            resp.setHeader('Access-Control-Expose-Headers', 'tokenid');
            return resp.header('tokenid', token).json({nome:obj.nome})

        }else{
            // Mensagem de erro caso não encontre
            return resp.status(400).json({message:'Usuário/senha incorreta!'})
        }
        
    }).catch((erro)=>{
        resp.status(500).json({message:`Erro no servidor! ${erro}`})
    })



})

router.post('/validar', (req,res)=>{
    try{
            
   
    const token = req.headers.authorization
    if(!token){
        res.status(400).json({message:'Token não fornecido!'})
    }else{
        const result =  jwt.verify(token,process.env.TOKEN_SECRET)
        if('exp' in result){
            
            res.status(200).header('authorization','true').send()
        }
    }
 } catch{
    res.status(400).header('authorization','false').json({message:'token expirado!'})
    }
    
    
})


module.exports = router;