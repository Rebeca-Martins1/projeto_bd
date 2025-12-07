import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./style"; 
import { FaHeartbeat, FaCalendarAlt } from "react-icons/fa";

export default function MarcarConsulta() {
  const navigate = useNavigate();

  // Pegar CPF do paciente logado
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const cpfPaciente = usuario ? usuario.cpf : "";

  // 🆕 Estado inicial separado para facilitar o reset
  const initialFormState = {
    data: "",
    hora: "",
    tipoConsulta: "",
    especialidade: "",
    cpf_medico: "", 
    observacoes: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]); 
  const [horarios, setHorarios] = useState([]);

  // 1. Carregar Especialidades do Backend
  useEffect(() => {
    async function fetchEspecialidades() {
      try {
        const res = await fetch("http://localhost:5000/consultas/especialidades");
        if (res.ok) {
          const data = await res.json();
          setEspecialidades(data);
        }
      } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
      }
    }
    fetchEspecialidades();
  }, []);

  // 2. Carregar Médicos quando a Especialidade mudar
  useEffect(() => {
    async function fetchMedicos() {
      if (!formData.especialidade) {
        setMedicos([]);
        setFormData((prev) => ({ ...prev, cpf_medico: "" }));
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/consultas/medicos/${formData.especialidade}`);
        if (res.ok) {
          const data = await res.json();
          setMedicos(data); 
        }
      } catch (error) {
        console.error("Erro ao buscar médicos:", error);
      }
    }
    fetchMedicos();
  }, [formData.especialidade]);

  // 3. Gerar horários fixos 
  useEffect(() => {
    if (!formData.cpf_medico) {
      setHorarios([]);
      return;
    }
    const horariosDisponiveis = [
      "08:00", "09:00", "10:00", "11:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00"
    ];
    setHorarios(horariosDisponiveis);
  }, [formData.cpf_medico]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpfPaciente) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }

    const payload = {
      data: formData.data,
      hora: formData.hora,
      tipoConsulta: formData.tipoConsulta,
      cpf_medico: formData.cpf_medico,
      cpf_paciente: cpfPaciente,
      observacoes: formData.observacoes
    };

    try {
      const response = await fetch("http://localhost:5000/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Consulta marcada com sucesso!");
        
        // 🆕 LÓGICA DE LIMPEZA DO FORMULÁRIO
        setFormData(initialFormState); // Reseta os campos
        setMedicos([]); // Limpa a lista de médicos
        setHorarios([]); // Limpa a lista de horários
        
      } else {
        // 🆕 Exibe a mensagem de erro específica vinda do Backend
        // (Ex: "Você já possui uma consulta marcada neste horário.")
        alert("Atenção: " + (data.error || "Falha ao agendar"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <S.PageContainer>
      <S.GlobalStyles />

      <S.TopHeader>
        <S.TopHeaderContent>
          <S.Logo>
            <FaHeartbeat size={24} />
            <S.LogoTitle>MED MAIS</S.LogoTitle>
          </S.Logo>
          <S.BackBtn onClick={() => navigate("/homepaciente")}>Voltar</S.BackBtn>
        </S.TopHeaderContent>
      </S.TopHeader>

      <S.FormContainer>
        <S.FormCard onSubmit={handleSubmit}>
          <S.FormHeader>
            <FaCalendarAlt size={32} color="#1c2541" />
            <h2>Marcar Consulta</h2>
            <p>Selecione os dados abaixo</p>
          </S.FormHeader>

          {/* DATA */}
          <S.InputGroup>
            <label>Data</label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]} 
              required
            />
          </S.InputGroup>

          {/* TIPO CONSULTA */}
          <S.InputGroup>
            <label>Tipo de Consulta</label>
            <select
              name="tipoConsulta"
              value={formData.tipoConsulta}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="Rotina">Rotina</option>
              <option value="Retorno">Retorno</option>
              <option value="Emergencial">Emergencial</option>
            </select>
          </S.InputGroup>

          {/* ESPECIALIDADE */}
          <S.InputGroup>
            <label>Especialidade</label>
            <select
              name="especialidade"
              value={formData.especialidade}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {especialidades.map((esp, i) => (
                <option key={i} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </S.InputGroup>

          {/* MÉDICO */}
          <S.InputGroup>
            <label>Médico</label>
            <select
              name="cpf_medico"
              value={formData.cpf_medico}
              onChange={handleChange}
              disabled={!formData.especialidade}
              required
            >
              <option value="">
                {formData.especialidade
                  ? "Selecione o médico..."
                  : "Escolha uma especialidade primeiro"}
              </option>
              {medicos.map((m, i) => (
                <option key={i} value={m.cpf}>
                  {m.nome}
                </option>
              ))}
            </select>
          </S.InputGroup>

          {/* HORÁRIO */}
          <S.InputGroup>
            <label>Horário</label>
            <select
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              disabled={!formData.cpf_medico}
              required
            >
              <option value="">Selecione um horário...</option>
              {horarios.map((h, i) => (
                <option key={i} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </S.InputGroup>

          <S.InputGroup>
            <label>Observações</label>
            <textarea
              name="observacoes"
              placeholder="Ex: Sintomas, alergias..."
              value={formData.observacoes}
              onChange={handleChange}
            />
          </S.InputGroup>

          <S.SubmitBtn type="submit">Confirmar Consulta</S.SubmitBtn>
        </S.FormCard>
      </S.FormContainer>
      
      <S.Footer>
        <S.FooterGrid>
          <S.FooterCol>
            <h5>Sobre nós</h5>
            <p>Informações sobre o Hospital.</p>
          </S.FooterCol>
          <S.FooterCol>
            <h5>Contato</h5>
            <ul>
              <li>Rua do Hospital</li>
              <li>Cidade, estado, CEP</li>
              <li>(11) 99999-9999</li>
              <li>contato@hospital.com</li>
            </ul>
          </S.FooterCol>
        </S.FooterGrid>
      </S.Footer>
    </S.PageContainer>
  );
}