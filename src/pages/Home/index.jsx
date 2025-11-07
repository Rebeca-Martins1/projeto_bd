import axios from "axios";
import { useState } from "react";

export default function Cadastro() {
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState(""); 

  const handleCadastro = async () => {
    try {
      await axios.post("http://localhost:5000/paciente", {
        cpf,
        nome,
        telefone,
        email,
      });
      alert("Cadastro realizado com sucesso!");
    } catch (err) {
      alert("Erro ao cadastrar!");
      console.error(err);
    }
  };
//rebeca
  return (
    <div>
      <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleCadastro}>Cadastrar</button>
    </div>
  );
}
