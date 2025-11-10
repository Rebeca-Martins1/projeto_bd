import { useState } from "react";
import axios from "axios";
import { Container, Form, Button, TitleSection } from "./styles";
import { useNavigate } from 'react-router-dom';
import * as S from "../pages/Medico/Home/styles";
import Footer from "../components/Footer";
import Header from "../components/header";
import { FaHeartbeat } from "react-icons/fa";

export default function Login() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("paciente");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        cpf,
        senha,
        tipo,
      });
      console.log("Usuário logado:", response.data.user);

      switch (tipo) {
        case "paciente":
          navigate('/homepaciente');
          break;
        case "medico":
          navigate('/homemedico');
          break;
        case "enfermeiro":
          navigate('/homeenfermeiro');
          break;
        case "conselho":
          navigate('/homeconselhopresidente');
          break;

        case "adm":
          navigate('/homeadm');
          break;
        default:
          navigate('/');
      }

    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Cpf ou senha incorretos!");
      } else {
        alert("Erro ao fazer login!");
      }
      console.error(err);
    }
  };

  return (
    <>
      <S.GlobalStyles />
      <S.MedicoPortalContainer>
        <Header isLogin={true} />
        <Container>
          <TitleSection>
            <h2>Bem-vindo de volta ao</h2> <h1> MED MAIS <FaHeartbeat size={24} color="#e63946" /> </h1>
          </TitleSection>
          <Form>
            <h1>Entrar</h1>
            <input
              type="number"
              placeholder="Cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
              <option value="enfermeiro">Enfermeiro</option>
              <option value="conselho">Conselho Presidente</option>
              <option value="adm">Administrador</option>
            </select>
            <Button type="button" onClick={handleLogin}>
              Entrar
            </Button>
            {/*<div style={{  }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/cadastro")}
              >
                Esqueceu senha?
              </button>
            </div>*/}
          </Form>
        </Container>
      <Footer />
    </S.MedicoPortalContainer>
    </>
  );
}
