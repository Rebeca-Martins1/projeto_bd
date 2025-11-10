import React, { useState } from "react";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";

export default function AgendarCirurgia() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipoProcedimento: "",
    grauUrgencia: "",
    duracao: "",
    necessidades: "",
    dataPreferencial: "",
    profissionais: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Solicitação enviada:", formData);
    alert("Solicitação de cirurgia enviada com sucesso!");
    navigate("/medico/home");
  };

  return (
    <>
      <S.GlobalStyles />
      <S.PageContainer>
        <Header />

        <S.MainContent>
          <S.TitleSection>
            <h1>Agendar Cirurgia</h1>
            <p>Preencha os detalhes abaixo para solicitar o agendamento da cirurgia.</p>
          </S.TitleSection>

          <S.FormContainer onSubmit={handleSubmit}>
            <S.FormGroup>
              <label>Tipo de procedimento</label>
              <input
                type="text"
                name="tipoProcedimento"
                value={formData.tipoProcedimento}
                onChange={handleChange}
                placeholder="Ex: Colonoscopia"
                required
              />
            </S.FormGroup>

            <S.FormGroup>
              <label>Grau de urgência</label>
              <select
                name="grauUrgencia"
                value={formData.grauUrgencia}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="Eletiva">Eletiva</option>
                <option value="Emergencial">Emergencial</option>
                <option value="Urgente">Urgente</option>
              </select>
            </S.FormGroup>

            <S.FormGroup>
              <label>Tempo estimado de duração</label>
              <input
                type="text"
                name="duracao"
                value={formData.duracao}
                onChange={handleChange}
                placeholder="Ex: 2 horas"
              />
            </S.FormGroup>

            <S.FormGroup>
              <label>Necessidades especiais</label>
              <textarea
                name="necessidades"
                value={formData.necessidades}
                onChange={handleChange}
                placeholder="Ex: equipamento de vídeo, anestesia geral..."
                rows={3}
              />
            </S.FormGroup>

            <S.FormGroup>
              <label>Data preferencial</label>
              <input
                type="date"
                name="dataPreferencial"
                value={formData.dataPreferencial}
                onChange={handleChange}
              />
            </S.FormGroup>

            <S.FormGroup>
              <label>Profissionais participantes</label>
              <input
                type="text"
                name="profissionais"
                value={formData.profissionais}
                onChange={handleChange}
                placeholder="Ex: Dr. Silva (cirurgião), Dra. Costa (anestesista)"
              />
            </S.FormGroup>

            <S.ButtonGroup>
              <S.SubmitButton type="submit">Enviar Solicitação</S.SubmitButton>
              <S.CancelButton type="button" onClick={() => navigate("/medico/home")}>
                Cancelar
              </S.CancelButton>
            </S.ButtonGroup>
          </S.FormContainer>
        </S.MainContent>

        <Footer />
      </S.PageContainer>
    </>
  );
}
