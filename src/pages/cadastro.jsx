import { Container, h1, Form, Button, Form_cadastro } from './styles';
import * as S from "../pages/Medico/Home/styles";
import Footer from "../components/Footer";
import Header from "../components/Header";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const [erros, setErros] = useState({});

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

  const validarFormulario = () => {
    const novosErros = {};
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexCpf = /^\d{11}$/;
    const regexTelefone = /^\d{10,11}$/;

    if (!nome) novosErros.nome = "O nome é obrigatório.";
    if (!email) novosErros.email = "O email é obrigatório.";
    else if (!regexEmail.test(email)) novosErros.email = "Email inválido.";

    if (!sexo) novosErros.sexo = "O sexo é obrigatório.";

    if (!cpf) novosErros.cpf = "O CPF é obrigatório.";
    else if (!regexCpf.test(cpf)) novosErros.cpf = "O CPF deve conter 11 números.";

    if (!data) novosErros.data = "A data de nascimento é obrigatória.";

    if (!empresa_plano) novosErros.empresa_plano = "O nome do plano é obrigatório.";

    if (!numero_carteirinha) novosErros.numero_carteirinha = "O número da carteirinha é obrigatório.";

    if (!telefone) novosErros.telefone = "O telefone é obrigatório.";
    else if (!regexTelefone.test(telefone))
      novosErros.telefone = "Telefone inválido (10 ou 11 dígitos).";

    if (!telefoneAcompanhante) novosErros.telefoneAcompanhante = "O telefone do acompanhante é obrigatório.";
    if (telefoneAcompanhante && !regexTelefone.test(telefoneAcompanhante))
      novosErros.telefoneAcompanhante = "Telefone do acompanhante inválido.";

    if (!cpf) novosErros.cpfAcompanhante = "O CPF do acompanhante é obrigatório.";
    if (cpfAcompanhante && !regexCpf.test(cpfAcompanhante))
      novosErros.cpfAcompanhante = "CPF do acompanhante inválido.";

    if (!senha) novosErros.senha = "A senha é obrigatória.";
    else if (senha.length < 6)
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleCadastro = async () => {
    if (!validarFormulario()) return;
    try {
      await axios.post("http://localhost:5000/cadastrar", {
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
        senha,
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
              <div className="input-group">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome"
                  className={erros.nome ? "erro-input" : ""}
                />
                <span className="erro">{erros.nome || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className={erros.email ? "erro-input" : ""}
                />
                <span className="erro">{erros.email || ""}</span>
              </div>

              <div className="input-group">
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className={erros.sexo ? "erro-input" : ""}
                >
                  <option value="">Selecione o sexo</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
                <span className="erro">{erros.sexo || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="CPF"
                  className={erros.cpf ? "erro-input" : ""}
                />
                <span className="erro">{erros.cpf || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  type="date"
                  className={erros.data ? "erro-input" : ""}
                />
                <span className="erro">{erros.data || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={empresa_plano}
                  onChange={(e) => setEmpresaPlano(e.target.value)}
                  placeholder="Nome do Plano"
                  className={erros.empresa_plano ? "erro-input" : ""}
                />
                <span className="erro">{erros.empresa_plano || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={numero_carteirinha}
                  onChange={(e) => setNumeroCarteirinha(e.target.value)}
                  placeholder="Número da Carteirinha"
                  className={erros.numero_carteirinha ? "erro-input" : ""}
                />
                <span className="erro">{erros.numero_carteirinha || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Telefone"
                  className={erros.telefone ? "erro-input" : ""}
                />
                <span className="erro">{erros.telefone || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={telefoneAcompanhante}
                  onChange={(e) => setTelefoneAcompanhante(e.target.value)}
                  placeholder="Telefone do acompanhante"
                  className={erros.telefoneAcompanhante ? "erro-input" : ""}
                />
                <span className="erro">{erros.telefoneAcompanhante || ""}</span>
              </div>

              <div className="input-group">
                <input
                  value={cpfAcompanhante}
                  onChange={(e) => setCpfAcompanhante(e.target.value)}
                  placeholder="CPF do acompanhante"
                  className={erros.cpfAcompanhante ? "erro-input" : ""}
                />
                <span className="erro">{erros.cpfAcompanhante || ""}</span>
              </div>

              <div className="input-group full">
                <input
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha"
                  type="password"
                  className={erros.senha ? "erro-input" : ""}
                />
                <span className="erro">{erros.senha || ""}</span>
              </div>

              <div className="input-group full">
                <button type="button" onClick={handleCadastro}>Cadastrar</button>
              </div>
            </form>
          </Form_cadastro>
        </Container>
        <Footer />
      </S.MedicoPortalContainer>
    </>
  );
}
