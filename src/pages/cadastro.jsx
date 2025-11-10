import {Container, h1, Form, Button, Form_cadastro} from './styles';
import * as S from "../pages/Medico/Home/styles";
import Footer from "../components/Footer";
import Header from "../components/header";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function Cadastro() {
    const [cpf, setCpf] = useState("");
    const [nome, setNome] = useState("");
    const [sexo, setSexo] = useState("");
    const [data, setData] = useState(""); 
    const [email, setEmail] = useState(""); 
    const [telefone, setTelefone] = useState("");
    const [telefoneAcompanhante, setTelefoneAcompanhante] = useState("");
    const [cpfAcompanhante, setCpfAcompanhante] = useState("");
    const [empresa_plano, setEmpresaPlano] = useState("");
    const [numero_carteirinha, setNumeroCarteirinha] = useState("");
    const [senha, setSenha] = useState(""); 
    const navigate = useNavigate();   

    const handleCadastro = async () => {
        try {
        await axios.post("http://localhost:5000/paciente", {
        nome,
        email,
        sexo,
        cpf,
        data_nascimento: data,        
        telefone,
        R_telefone: telefoneAcompanhante, 
        R_cpf: cpfAcompanhante,
        empresa_plano,
        numero_carteirinha,
        senha
        });

        setCpf("");
        setNome("");
        setData("");
        setEmail("");
        setSexo("");
        setTelefone("");
        setTelefoneAcompanhante("");
        setCpfAcompanhante("");
        setEmpresaPlano("");
        setNumeroCarteirinha("");
        setSenha("");
        navigate('/');
        } catch (err) {
        alert("Erro ao cadastrar!");
        console.error(err);
        }
    };

    return (
        <>
        <S.GlobalStyles />
        <S.MedicoPortalContainer>
            <Header />
            <Container>
                <Form_cadastro>
                    <h2>Cadastro de Usuário</h2>
                    <form>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
                        <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                        <option value="">Selecione o sexo</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        </select>
                        <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="CPF" />
                        <input value={data} onChange={(e) => setData(e.target.value)} type="date" />
                        <input value={empresa_plano} onChange={(e) => setEmpresaPlano(e.target.value)} placeholder="Nome do Plano" />
                        <input value={numero_carteirinha} onChange={(e) => setNumeroCarteirinha(e.target.value)} placeholder="Número da Carteirinha" />
                        <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone" />
                        <input value={telefoneAcompanhante} onChange={(e) => setTelefoneAcompanhante(e.target.value)} placeholder="Telefone do acompanhante" />
                        <input value={cpfAcompanhante} onChange={(e) => setCpfAcompanhante(e.target.value)} placeholder="CPF do acompanhante" />
                        <input value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" type="password" />
                        <button type="button" onClick={handleCadastro}>Cadastrar</button>
                    </form>
                    </Form_cadastro>

            </Container>
        <Footer />
    </S.MedicoPortalContainer>
    </>
    )
}
