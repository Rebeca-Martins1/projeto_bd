import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./style";
import { FaHeartbeat, FaCalendarAlt } from "react-icons/fa";

export default function MarcarConsulta() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    tipoConsulta: "",
    especialidade: "",
    medico: "",
    observacoes: "",
  });

  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horarios, setHorarios] = useState([]);

  // 🔹 Simulação de dados (futuro: backend)
  useEffect(() => {
    setEspecialidades([
      "Cardiologia",
      "Ortopedia",
      "Dermatologia",
      "Pediatria",
      "Neurologia",
    ]);
  }, []);

  // 🔹 Filtra médicos pela especialidade
  useEffect(() => {
    if (!formData.especialidade) {
      setMedicos([]);
      setFormData((prev) => ({ ...prev, medico: "", hora: "" }));
      return;
    }

    const todosMedicos = [
      { nome: "Dr. João Silva", especialidade: "Cardiologia" },
      { nome: "Dra. Maria Souza", especialidade: "Dermatologia" },
      { nome: "Dr. Paulo Lima", especialidade: "Ortopedia" },
      { nome: "Dra. Fernanda Alves", especialidade: "Pediatria" },
      { nome: "Dr. Rafael Nunes", especialidade: "Neurologia" },
    ];

    const filtrados = todosMedicos.filter(
      (m) => m.especialidade === formData.especialidade
    );
    setMedicos(filtrados);
  }, [formData.especialidade]);

  // 🔹 Gera horários disponíveis quando o médico é selecionado
  useEffect(() => {
    if (!formData.medico) {
      setHorarios([]);
      setFormData((prev) => ({ ...prev, hora: "" }));
      return;
    }

    const horariosDisponiveis = [
      "08:00",
      "09:00",
      "10:30",
      "13:00",
      "14:30",
      "16:00",
    ];
    setHorarios(horariosDisponiveis);
  }, [formData.medico]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/consultas ", {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });


    const data = await response.json();

    if (response.ok) {
      alert("Consulta marcada com sucesso!");
      navigate("/homepaciente");
    } else {
      alert("Erro: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
};

  return (
    <S.PageContainer>
      <S.GlobalStyles />

      {/* 🔹 Cabeçalho */}
      <S.TopHeader>
        <S.TopHeaderContent>
          <S.Logo>
            <FaHeartbeat size={24} />
            <S.LogoTitle>MED MAIS</S.LogoTitle>
          </S.Logo>
          <S.BackBtn onClick={() => navigate("/homepaciente")}>Voltar</S.BackBtn>
        </S.TopHeaderContent>
      </S.TopHeader>

      {/* 🔹 Conteúdo principal */}
      <S.FormContainer>
        <S.FormCard onSubmit={handleSubmit}>
          <S.FormHeader>
            <FaCalendarAlt size={32} color="#1c2541" />
            <h2>Marcar Consulta</h2>
            <p>Preencha os dados abaixo para agendar</p>
          </S.FormHeader>

          <S.InputGroup>
            <label>Data</label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </S.InputGroup>

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

          <S.InputGroup>
            <label>Médico</label>
            <select
              name="medico"
              value={formData.medico}
              onChange={handleChange}
              disabled={!formData.especialidade}
              required
            >
              <option value="">
                {formData.especialidade
                  ? "Selecione..."
                  : "Escolha uma especialidade primeiro"}
              </option>
              {medicos.map((m, i) => (
                <option key={i} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </S.InputGroup>

          {/* 🔹 Campo horário (só aparece depois de selecionar médico) */}
          {formData.medico && (
            <S.InputGroup>
              <label>Horário</label>
              <select
                name="hora"
                value={formData.hora}
                onChange={handleChange}
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
          )}

          <S.InputGroup>
            <label>Observações</label>
            <textarea
              name="observacoes"
              placeholder="Ex: sintomas, preferências..."
              value={formData.observacoes}
              onChange={handleChange}
            />
          </S.InputGroup>

          <S.SubmitBtn type="submit">Confirmar Consulta</S.SubmitBtn>
        </S.FormCard>
      </S.FormContainer>

      {/* 🔹 Rodapé */}
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
