import React, { useState, useEffect } from "react";
import * as S from "./styles";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AlocarEnfermeiro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cpf: "",
    n_sala: "",
    tipo_leito: "",
  });


  const [leitos, setLeitos] = useState([]);
  const [enfermeiros, setEnfermeiros] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leitosRes = await axios.get("http://localhost:5000/alocaenfermeiro/listarLeitos");
        setLeitos(leitosRes.data);

        const enfermeirosRes = await axios.get(
          "http://localhost:5000/alocaenfermeiro/listarEnfermeiros"
        );
        setEnfermeiros(enfermeirosRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.put(
      `http://localhost:5000/alocaenfermeiro/alocar/enfermeiro/${formData.cpf}/${formData.tipo_leito}/${formData.n_sala}`
    );


    navigate("/homeadm");
  } catch (err) {
    console.error("Erro ao alocar enfermeiro:", err);
    alert("Erro ao alocar enfermeiro. Verifique os dados e tente novamente.");
  }
};


  return (
    <S.PageContainer>
      <S.GlobalStyles />
      <Header />

      <S.FormContainer>
        <S.FormCard onSubmit={handleSubmit}>
          <S.FormHeader>
            <h2>Alocar Enfermeiro</h2>
            <p>Selecione o tipo de leito, o leito e o enfermeiro para alocação</p>
          </S.FormHeader>

          <S.InputGroup>
            <label>Tipo de Leito</label>
            <select
              name="tipo_leito"
              value={formData.tipo_leito}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              <option value="UTI">UTI</option>
              <option value="ENFERMARIA">Enfermaria</option>
            </select>

          </S.InputGroup>

          <S.InputGroup>
            <label>Leito</label>
            <select
              name="n_sala"
              value={formData.n_sala}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o leito</option>
              {leitos
                .filter((leito) => leito.tipo === formData.tipo_leito)
                .map((leito) => (
                  <option key={leito.n_sala} value={leito.n_sala}>
                    Sala {leito.n_sala}
                  </option>
                ))}
            </select>

          </S.InputGroup>

          <S.InputGroup>
            <label>Enfermeiro</label>
            <select
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o enfermeiro</option>
              {enfermeiros.map((enf) => (
                <option key={enf.cpf} value={enf.cpf}>
                  {enf.nome} - COREN: {enf.coren}
                </option>
              ))}
            </select>

          </S.InputGroup>

          <S.SubmitBtn type="submit">Alocar Enfermeiro</S.SubmitBtn>
        </S.FormCard>
      </S.FormContainer>

      <Footer />
    </S.PageContainer>
  );
}
