// PROJETO_BD/backend/src/controllers/pacienteController.js

import pool from "../config/db.js"; 
// Importamos as funções do Service (Service lida com a lógica pesada de SQL)
import { 
    buscarCirurgiasDoPaciente, 
    getPerfilCompleto,      
    updatePerfilCompleto    
} from '../../../src/services/pacienteService.js'; 


// 1. Função cadastrarPaciente
export async function cadastrarPaciente(req, res) { 
  // Note que 'cosmeticos' NÃO está nesta lista, o que é correto.
  const {
    nome,
    email,
    sexo,
    cpf,
    data_nascimento,
    telefone,
    R_telefone,
    R_cpf,
    empresa_plano,
    numero_carteirinha,
    senha
  } = req.body;

  const client = await pool.connect(); 

  try {
    await client.query("BEGIN");

    // Verifica se a PESSOA já existe
    const existe_pessoa = await client.query(
      'SELECT 1 FROM public."PESSOA" WHERE cpf = $1',
      [cpf]
    );
    
    if (existe_pessoa.rows.length > 0) {
      // Se pessoa existe, verifica se já é PACIENTE
      const existe_paciente = await client.query(
        'SELECT 1 FROM public."PACIENTE" WHERE cpf = $1',
        [cpf]
      );

      if (existe_paciente.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).send("CPF já cadastrado como paciente.");
      } else {
        // Pessoa existe, insere apenas na tabela PACIENTE
        await client.query(
          `INSERT INTO public."PACIENTE" (cpf, data_nascimento, "R_telefone", "R_cpf", empresa_plano, numero_carteirinha)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [cpf, data_nascimento, R_telefone, R_cpf, empresa_plano, numero_carteirinha]
        );
      }
    } else {
      // Pessoa não existe: insere em PESSOA e PACIENTE
      await client.query(
        `INSERT INTO public."PESSOA" (cpf, nome, telefone, email, senha, sexo)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [cpf, nome, telefone, email, senha, sexo]
      );

      await client.query(
        `INSERT INTO public."PACIENTE" (cpf, data_nascimento, "R_telefone", "R_cpf", empresa_plano, numero_carteirinha)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [cpf, data_nascimento, R_telefone, R_cpf, empresa_plano, numero_carteirinha]
      );
    }

    await client.query("COMMIT");
    res.status(200).send("✅ Paciente cadastrado com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao cadastrar paciente:", err);
    res.status(500).send("Erro ao cadastrar paciente.");
  } finally {
    client.release();
  }
}

// 2. Função getMinhasCirurgias
export async function getMinhasCirurgias(req, res) { 
    const cpfPaciente = req.params.cpf; 

    if (!cpfPaciente) {
        return res.status(400).json({ erro: "CPF do paciente é obrigatório na URL." });
    }

    try {
        const cirurgias = await buscarCirurgiasDoPaciente(cpfPaciente); 
        res.status(200).json(cirurgias);
    } catch (erro) {
        console.error(`❌ Erro ao buscar cirurgias para o CPF ${cpfPaciente}:`, erro.message);
        res.status(500).json({ erro: "Erro interno do servidor ao buscar cirurgias." });
    }
}

// 3. GET: /paciente/:cpf/perfil
export async function getPerfil(req, res) {
    const { cpf } = req.params;
    try {
        // O Service busca Alergias, Medicamentos e Doenças (Cosméticos não existe no DB, então não vem)
        const dados = await getPerfilCompleto(cpf);
        
        if (!dados) {
            return res.status(404).json({ erro: "Paciente não encontrado" });
        }
        res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ erro: "Erro ao buscar perfil." });
    }
}

// 4. PUT: /paciente/:cpf/perfil
export async function updatePerfil(req, res) {
    const { cpf } = req.params;
    const dados = req.body; // Se o frontend mandar 'cosmeticos', o Service irá ignorá-lo se não houver código para salvar lá.
    try {
        await updatePerfilCompleto(cpf, dados);
        res.status(200).json({ mensagem: "Perfil atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ erro: "Erro ao atualizar perfil." });
    }
}
// 5. Listar Consultas do Paciente (NOVA FUNÇÃO)
export async function getMinhasConsultas(req, res) {
    const { cpf } = req.params;

    try {
        // Buscamos a consulta, o nome do médico e a especialidade
        const query = `
            SELECT 
                c.data_hora,
                c.tipo_consulta,
                c.n_sala,
                c.tipo_sala,
                c.observacoes,
                p.nome AS medico_nome,
                em.especialidade
            FROM "CONSULTA" c
            JOIN "MEDICO" m ON c.cpf_medico = m.cpf
            JOIN "PESSOA" p ON m.cpf = p.cpf
            -- Fazemos um JOIN simples para pegar a especialidade. 
            -- Se o médico tiver mais de uma, pode duplicar, então usamos DISTINCT na aplicação ou assumimos a principal.
            LEFT JOIN "ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
            WHERE c.cpf_paciente = $1
            ORDER BY c.data_hora DESC
        `;

        const result = await pool.query(query, [cpf]);
        
        // Tratamento simples para evitar duplicatas se o médico tiver 2 especialidades
        // (Opcional, mas garante limpeza visual)
        const consultasUnicas = result.rows.reduce((acc, current) => {
            const x = acc.find(item => item.data_hora.toString() === current.data_hora.toString());
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        res.status(200).json(consultasUnicas);

    } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        res.status(500).json({ error: "Erro interno ao buscar consultas." });
    }
}