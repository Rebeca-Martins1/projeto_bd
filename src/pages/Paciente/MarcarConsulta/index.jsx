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

  // 🔹 simulação de dados (posteriormente vem do backend)
  useEffect(() => {
    setEspecialidades([
      "Cardiologia",
      "Ortopedia",
      "Dermatologia",
      "Pediatria",
      "Neurologia",
    ]);
  }, []);

  // 🔹 filtra médicos pela especialidade
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

  // 🔹 gera horários disponíveis quando o médico é selecionado
  useEffect(() => {
    if (!formData.medico) {
      setHorarios([]);
      setFormData((prev) => ({ ...prev, hora: "" }));
      return;
    }

    // exemplo fixo — depois você pode puxar do backend
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Consulta marcada (simulação):", formData);
    alert("Consulta marcada com sucesso! (simulação)");
    navigate("/homepaciente");
  };

  return (
    <>
      <S.GlobalStyles />
      <S.PageContainer>
        {/* 🔵 Topo */}
        <S.TopHeader>
          <S.TopHeaderContent>
            <S.Logo>
              <FaHeartbeat size={24} />
              <S.LogoTitle>MED MAIS</S.LogoTitle>
            </S.Logo>
            <S.BackBtn onClick={() => navigate("/homepaciente")}>
              Voltar
            </S.BackBtn>
          </S.TopHeaderContent>
        </S.TopHeader>

        {/* Conteúdo */}
        <S.FormContainer>
          <S.FormCard onSubmit={handleSubmit}>
            <S.FormHeader>
              <FaCalendarAlt size={32} />
              <h2>Marcar Consulta</h2>
              <p>Preencha os dados abaixo</p>
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
                {especialidades.map((esp, index) => (
                  <option key={index} value={esp}>
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
                {medicos.map((m, index) => (
                  <option key={index} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </S.InputGroup>

            {/* 🔹 campo horário aparece somente após escolher médico */}
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
                  {horarios.map((h, index) => (
                    <option key={index} value={h}>
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
      </S.PageContainer>
    </>
  );
}
