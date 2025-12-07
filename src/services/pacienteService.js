import pool from '../../backend/src/config/db.js'; 

export async function buscarCirurgiasDoPaciente(cpfPaciente) {

    const query = `
        SELECT
            c.data_hora,
            p_pac.nome AS paciente_nome,
            STRING_AGG(p_med.nome, ', ') AS medicos, -- agora retorna vários nomes juntos
            c.duracao_minutos,
            c.n_sala,
            c.tipo_sala,
            c.status,
            c.aprovada
        FROM "CIRURGIA" c
        INNER JOIN "PACIENTE" pac ON c.cpf_paciente = pac.cpf
        INNER JOIN "PESSOA" p_pac ON pac.cpf = p_pac.cpf
        LEFT JOIN "ALOCA_MEDICO_CIRURGIA" amc 
            ON c.data_hora = amc.data_hora AND c.cpf_paciente = amc.cpf_paciente
        LEFT JOIN "MEDICO" med ON amc.cpf_medico = med.cpf
        LEFT JOIN "PESSOA" p_med ON med.cpf = p_med.cpf
        WHERE 
            c.cpf_paciente = $1
        GROUP BY 
            c.data_hora, p_pac.nome, c.duracao_minutos, c.n_sala, c.tipo_sala, c.status, c.aprovada
        ORDER BY 
            c.data_hora DESC;
    `;

    try {
        const resultado = await pool.query(query, [cpfPaciente]);
        
        return resultado.rows.map(cirurgia => ({
            ...cirurgia,
            data_hora: cirurgia.data_hora ? new Date(cirurgia.data_hora).toISOString() : null
        }));

    } catch (erro) {
        console.error("❌ Erro ao buscar cirurgias no DB:", erro);
        throw new Error("Falha na busca de cirurgias.");
    }
}
// 1. Função para BUSCAR o perfil completo (Lógica de Banco)
export async function getPerfilCompleto(cpf) {
    const query = `
        SELECT 
            p.nome, p.telefone, p.email, p.sexo,
            pac.data_nascimento, pac."R_telefone", pac."R_cpf", pac.empresa_plano, pac.numero_carteirinha,
            (SELECT STRING_AGG(alergia, ', ') FROM "ALERGIAS_PACIENTE" WHERE cpf_paciente = p.cpf) as alergias,
            (SELECT STRING_AGG(medicamento, ', ') FROM "MEDICAMENTOS_PACIENTE" WHERE cpf_paciente = p.cpf) as medicamentos,
            (SELECT STRING_AGG(doenca, ', ') FROM "DOENCAS_PACIENTE" WHERE cpf_paciente = p.cpf) as historico_medico
        FROM "PESSOA" p
        JOIN "PACIENTE" pac ON p.cpf = pac.cpf
        WHERE p.cpf = $1;
    `;
    
    const res = await pool.query(query, [cpf]);
    return res.rows[0];
}

// 2. Função para ATUALIZAR o perfil completo (Lógica de Banco com Transação)
export async function updatePerfilCompleto(cpf, dados) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Atualizar PESSOA
        await client.query(
            `UPDATE "PESSOA" SET nome = $1, telefone = $2, email = $3 WHERE cpf = $4`,
            [dados.nome, dados.telefone, dados.email, cpf]
        );

        // Atualizar PACIENTE
        await client.query(
            `UPDATE "PACIENTE" SET 
                data_nascimento = $1, "R_telefone" = $2, "R_cpf" = $3, 
                empresa_plano = $4, numero_carteirinha = $5 
             WHERE cpf = $6`,
            [dados.data_nascimento, dados.R_telefone, dados.R_cpf, dados.empresa_plano, dados.numero_carteirinha, cpf]
        );

        // Atualizar Listas (Delete + Insert estratégia)
        
        // Alergias
        await client.query('DELETE FROM "ALERGIAS_PACIENTE" WHERE cpf_paciente = $1', [cpf]);
        if (dados.alergias) {
            const lista = dados.alergias.split(',').map(s => s.trim()).filter(s => s);
            for (const item of lista) await client.query('INSERT INTO "ALERGIAS_PACIENTE" (cpf_paciente, alergia) VALUES ($1, $2)', [cpf, item]);
        }

        // Medicamentos
        await client.query('DELETE FROM "MEDICAMENTOS_PACIENTE" WHERE cpf_paciente = $1', [cpf]);
        if (dados.medicamentos) {
            const lista = dados.medicamentos.split(',').map(s => s.trim()).filter(s => s);
            for (const item of lista) await client.query('INSERT INTO "MEDICAMENTOS_PACIENTE" (cpf_paciente, medicamento) VALUES ($1, $2)', [cpf, item]);
        }

        // Histórico
        await client.query('DELETE FROM "DOENCAS_PACIENTE" WHERE cpf_paciente = $1', [cpf]);
        if (dados.historicoMedico) {
            const lista = dados.historicoMedico.split(',').map(s => s.trim()).filter(s => s);
            for (const item of lista) await client.query('INSERT INTO "DOENCAS_PACIENTE" (cpf_paciente, doenca) VALUES ($1, $2)', [cpf, item]);
        }

        await client.query('COMMIT');
        return { success: true };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}