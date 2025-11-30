import pool from "../config/db.js";

export const login = async (req, res) => {
  const { cpf, senha, tipo } = req.body;

  try {
    //vê se CPF e senha existem em PESSOA
    const pessoaResult = await pool.query(
      `SELECT cpf, nome, telefone, email, sexo, senha
       FROM public."PESSOA"
       WHERE cpf = $1 AND senha = $2`,
      [cpf, senha]
    );

    if (pessoaResult.rows.length === 0) {
      return res.status(401).send("CPF ou senha incorretos.");
    }

    //verifica se o CPF realmente pertence ao tipo selecionado
    const tabelaPorTipo = {
      paciente: `"PACIENTE"`,
      medico: `"MEDICO"`,
      enfermeiro: `"ENFERMEIRO"`,
      conselho: `"CONSELHO_PRESIDENTE"`,
      adm: `"ADMINISTRADOR"`
    };

    const tabela = tabelaPorTipo[tipo];

    const tipoResult = await pool.query(
      `SELECT * FROM ${tabela} WHERE cpf = $1`,
      [cpf]
    );

    if (tipoResult.rows.length === 0) {
      return res.status(403).send("Esta pessoa não possui este tipo de acesso.");
    }

    //vê se medico ou enfermeiro está ativo
    if ((tipo === "medico" || tipo === "enfermeiro")) {
      const registro = tipoResult.rows[0];
      if (registro.ativo !== true) {
        return res.status(403).send("Seu cadastro não está ativo.");
      }
    }


    const user = pessoaResult.rows[0];
    res.status(200).json({
      user: {
        cpf: user.cpf,
        nome: user.nome,
        telefone: user.telefone,
        email: user.email,
        sexo: user.sexo,
        tipo: tipo,

        dadosTipo: tipoResult.rows[0] || null
      },
    });

  } catch (err) {
    console.error("❌ Erro ao fazer login:", err);
    res.status(500).send("Erro ao fazer login.");
  }
};
