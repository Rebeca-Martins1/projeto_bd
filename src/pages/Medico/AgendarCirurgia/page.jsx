import React, { useState, useEffect } from "react";
import * as S from "./styles";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";

export default function AgendarCirurgia() {
  const navigate = useNavigate();
  const [listaMedicos, setListaMedicos] = useState([]);
  const [listaEnfermeiros, setListaEnfermeiros] = useState([]);
  const [listaSalas, setListaSalas] = useState([]);
  const [listaLeitosDisponiveis, setListaLeitosDisponiveis] = useState([]);

  const [formData, setFormData] = useState({
    cpfPaciente: "",
    tipoProcedimento: "",
    grauUrgencia: "",
    duracao: "",
    necessidades: "",
    dataPreferencial: "",
    n_sala: "",
    tipoLeito: "",       
    numeroLeito: "",     
    diasInternacao: "1"  
  });

  const [medicosSelecionados, setMedicosSelecionados] = useState([]);
  const [enfermeirosSelecionados, setEnfermeirosSelecionados] = useState([]);
  useEffect(() => {
    async function carregarDados() {
      try {
        const respMed = await fetch("http://localhost:5000/solicitacaocirurgia/medicos");
        setListaMedicos(await respMed.json());
        const respEnf = await fetch("http://localhost:5000/solicitacaocirurgia/enfermeiros");
        setListaEnfermeiros(await respEnf.json());
        const respSalas = await fetch("http://localhost:5000/solicitacaocirurgia/salas");
        setListaSalas(await respSalas.json());

      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
        alert("Erro ao conectar com o servidor.");
      }
    }
    carregarDados();
  }, []);
  useEffect(() => {
    async function buscarLeitos() {
      if (!formData.tipoLeito) {
        setListaLeitosDisponiveis([]);
        return;
      }

      try {
        const resp = await fetch(`http://localhost:5000/solicitacaocirurgia/leitos?tipo=${formData.tipoLeito}`);
        const dados = await resp.json();
        setListaLeitosDisponiveis(dados);
      } catch (err) {
        console.error("Erro ao buscar leitos:", err);
      }
    }

    buscarLeitos();
  }, [formData.tipoLeito]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMedico = (cpf) => {
    if (medicosSelecionados.includes(cpf)) {
      setMedicosSelecionados(medicosSelecionados.filter((id) => id !== cpf));
    } else {
      setMedicosSelecionados([...medicosSelecionados, cpf]);
    }
  };

  const toggleEnfermeiro = (cpf) => {
    if (enfermeirosSelecionados.includes(cpf)) {
      setEnfermeirosSelecionados(enfermeirosSelecionados.filter((id) => id !== cpf));
    } else {
      setEnfermeirosSelecionados([...enfermeirosSelecionados, cpf]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      equipeMedica: medicosSelecionados,
      equipeEnfermagem: enfermeirosSelecionados
    };

    try {
      const response = await fetch("http://localhost:5000/solicitacaocirurgia/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Solicitação enviada com sucesso!");
        navigate("/homemedico");
      } else {
        alert("Erro ao agendar: " + (data.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão com o backend.");
    }
  };

  return (
    <>
      <S.GlobalStyles />
      <S.PageContainer>
        <Header />

        <S.MainContent>
          <S.TitleSection>
            <h1>Agendar Cirurgia</h1>
            <p>Preencha os detalhes, escolha a sala e aloque a equipe.</p>
          </S.TitleSection>

          <S.FormContainer onSubmit={handleSubmit}>
            <S.FormGroup>
              <label>CPF do Paciente</label>
              <input 
                type="text" 
                name="cpfPaciente" 
                value={formData.cpfPaciente} 
                onChange={handleChange} 
                placeholder="000.000.000-00" 
                required 
              />
            </S.FormGroup>

            <S.FormGroup>
              <label>Tipo de Procedimento</label>
              <input 
                type="text" 
                name="tipoProcedimento" 
                value={formData.tipoProcedimento} 
                onChange={handleChange} 
                placeholder="Ex: Apendicectomia" 
                required 
              />
            </S.FormGroup>
            <S.FormGroup>
              <label>Sala de Cirurgia</label>
              <select name="n_sala" value={formData.n_sala} onChange={handleChange} required>
                <option value="">Selecione uma sala...</option>
                {listaSalas.map((sala) => (
                  <option key={sala.n_sala} value={sala.n_sala}>
                    Sala {sala.n_sala} - {sala.tipo}
                  </option>
                ))}
              </select>
            </S.FormGroup>

            <div style={{ display: "flex", gap: "20px" }}>
              <S.FormGroup style={{ flex: 1 }}>
                <label>Grau de Urgência</label>
                <select name="grauUrgencia" value={formData.grauUrgencia} onChange={handleChange} required>
                  <option value="">Selecione...</option>
                  <option value="Eletiva">Eletiva</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Emergencia">Emergência</option>
                </select>
              </S.FormGroup>

              <S.FormGroup style={{ flex: 1 }}>
                <label>Duração (minutos)</label>
                <input 
                  type="number" 
                  name="duracao" 
                  value={formData.duracao} 
                  onChange={handleChange} 
                  placeholder="Ex: 120" 
                  required
                />
              </S.FormGroup>
            </div>

            <S.FormGroup>
              <label>Data Preferencial (Início)</label>
              <input 
                type="datetime-local" 
                name="dataPreferencial" 
                value={formData.dataPreferencial} 
                onChange={handleChange} 
                required 
              />
            </S.FormGroup>

            <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
              <h3 style={{fontSize: "1.1rem", marginBottom: "15px", color: "#444"}}>Recuperação Pós-Cirúrgica</h3>
              
              <div style={{ display: "flex", gap: "20px" }}>
                <S.FormGroup style={{ flex: 1 }}>
                  <label>Necessita de Leito?</label>
                  <select name="tipoLeito" value={formData.tipoLeito} onChange={handleChange}>
                    <option value="">Não (Alta imediata)</option>
                    <option value="ENFERMARIA">Enfermaria</option>
                    <option value="UTI">UTI</option>
                  </select>
                </S.FormGroup>

                {formData.tipoLeito && (
                  <>
                    <S.FormGroup style={{ flex: 1 }}>
                      <label>Selecione o Leito</label>
                      <select name="numeroLeito" value={formData.numeroLeito} onChange={handleChange} required>
                        <option value="">Selecione...</option>
                        {listaLeitosDisponiveis.map((leito) => (
                          <option key={leito.n_sala} value={leito.n_sala}>
                            Leito {leito.n_sala} (Cap: {leito.capacidade})
                          </option>
                        ))}
                      </select>
                    </S.FormGroup>

                    <S.FormGroup style={{ flex: 1 }}>
                      <label>Dias de Internação</label>
                      <input 
                        type="number" 
                        name="diasInternacao" 
                        value={formData.diasInternacao} 
                        onChange={handleChange} 
                        min="1"
                        required 
                      />
                    </S.FormGroup>
                  </>
                )}
              </div>
            </div>

            <S.FormGroup style={{marginTop: "20px"}}>
              <label>Médicos Auxiliares</label>
              <S.SelectionBox>
                {listaMedicos.length > 0 ? listaMedicos.map((medico) => (
                  <S.CheckboxLabel key={medico.cpf}>
                    <input 
                      type="checkbox" 
                      checked={medicosSelecionados.includes(medico.cpf)} 
                      onChange={() => toggleMedico(medico.cpf)} 
                    />
                    {medico.nome}
                  </S.CheckboxLabel>
                )) : <p>Carregando médicos...</p>}
              </S.SelectionBox>
            </S.FormGroup>

            <S.FormGroup>
              <label>Equipe de Enfermagem</label>
              <S.SelectionBox>
                {listaEnfermeiros.length > 0 ? listaEnfermeiros.map((enf) => (
                  <S.CheckboxLabel key={enf.cpf}>
                    <input 
                      type="checkbox" 
                      checked={enfermeirosSelecionados.includes(enf.cpf)} 
                      onChange={() => toggleEnfermeiro(enf.cpf)} 
                    />
                    {enf.nome}
                  </S.CheckboxLabel>
                )) : <p>Carregando enfermeiros...</p>}
              </S.SelectionBox>
            </S.FormGroup>

            <S.FormGroup>
              <label>Observações / Necessidades Especiais</label>
              <textarea 
                name="necessidades" 
                value={formData.necessidades} 
                onChange={handleChange} 
                rows={3} 
              />
            </S.FormGroup>

            <S.ButtonGroup>
              <S.SubmitButton type="submit">Enviar Solicitação</S.SubmitButton>
              <S.CancelButton type="button" onClick={() => navigate("/homemedico")}>
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