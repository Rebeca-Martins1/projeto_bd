import pool from "../config/db.js";

export const recursosHumanos = async (req, res) => {
  const { periodo, departamento, turno } = req.query;

  try {
    // MÉTRICAS PRINCIPAIS
    
    const metricas = {
      totalFuncionarios: 0,
      horasTrabalhadas: 0,
      trendHoras: 'neutral',
      variacaoHoras: '0h',
      plantoesAtivos: 0,
      trendPlantoes: 'neutral',
      variacaoPlantoes: '0',
      alertasSobrecarga: 0,
      trendAlertas: 'neutral',
      variacaoAlertas: '0',
      mediaEnfermeiro: 0,
      trendMediaEnfermeiro: 'neutral',
      variacaoMediaEnfermeiro: '0h',
      taxaAbsenteismo: 0,
      trendAbsenteismo: 'neutral',
      variacaoAbsenteismo: '0%',
      horasExtras: 0,
      trendHorasExtras: 'neutral',
      variacaoHorasExtras: '0h',
      turnover: 0,
      trendTurnover: 'neutral',
      variacaoTurnover: '0%',
      capacidadeOciosa: 0,
      trendCapacidadeOciosa: 'neutral',
      variacaoCapacidadeOciosa: '0%'
    };

    // 1. Total de funcionários 
    try {
      const totalFuncionariosQuery = `
        SELECT 
          (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as total_medicos,
          (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as total_enfermeiros
      `;

      const totalResult = await pool.query(totalFuncionariosQuery);
      const row = totalResult.rows[0] || {};
      
      metricas.totalFuncionarios = 
        (parseInt(row.total_medicos) || 0) + 
        (parseInt(row.total_enfermeiros) || 0);
    } catch (error) {
      console.error('Erro ao buscar total de funcionários:', error.message);
    }

    // 2. Plantões ativos (enfermeiros não disponíveis)
    try {
      const plantoesAtivosQuery = `
        SELECT COUNT(*) as total_plantoes
        FROM public."ENFERMEIRO" 
        WHERE disponivel = false AND ativo = true
      `;

      const plantoesResult = await pool.query(plantoesAtivosQuery);
      metricas.plantoesAtivos = parseInt(plantoesResult.rows[0]?.total_plantoes) || 0;
    } catch (error) {
      console.error('Erro ao buscar plantões ativos:', error.message);
    }

    // 3. Alertas de sobrecarga (enfermeiros trabalhando no turno da manhã)
    try {
      const sobrecargaQuery = `
        SELECT COUNT(*) as sobrecarga_count
        FROM public."ENFERMEIRO"
        WHERE disponivel = false 
          AND ativo = true
          AND inicio_plantao IS NOT NULL 
          AND EXTRACT(HOUR FROM inicio_plantao) BETWEEN 6 AND 18
      `;

      const sobrecargaResult = await pool.query(sobrecargaQuery);
      metricas.alertasSobrecarga = parseInt(sobrecargaResult.rows[0]?.sobrecarga_count) || 0;
    } catch (error) {
      console.error('Erro ao buscar alertas de sobrecarga:', error.message);
    }

    // 4. Média de horas por enfermeiro (estimativa baseada em plantões)
    try {
      const mediaHorasQuery = `
        SELECT 
          COALESCE(
            COUNT(*) * 12 / NULLIF((SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true), 0), 
            0
          ) as media_horas
        FROM public."ENFERMEIRO"
        WHERE disponivel = false 
          AND ativo = true
      `;

      const mediaResult = await pool.query(mediaHorasQuery);
      metricas.mediaEnfermeiro = Math.round(parseFloat(mediaResult.rows[0]?.media_horas) || 0);
    } catch (error) {
      console.error('Erro ao calcular média de horas:', error.message);
    }

    // 5. Horas trabalhadas totais (estimativa)
    try {
      const horasTrabalhadasQuery = `
        SELECT 
          (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false AND ativo = true) * 12 
          + 
          (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) * 40 
          as total_horas
      `;

      const horasResult = await pool.query(horasTrabalhadasQuery);
      metricas.horasTrabalhadas = parseInt(horasResult.rows[0]?.total_horas) || 0;
    } catch (error) {
      console.error('Erro ao calcular horas trabalhadas:', error.message);
    }

    // 6. Horas extras (estimativa baseada em enfermeiros em plantão)
    try {
      const horasExtrasQuery = `
        SELECT 
          (SELECT COUNT(*) FROM public."ENFERMEIRO" 
           WHERE disponivel = false 
             AND ativo = true
             AND inicio_plantao IS NOT NULL
             AND EXTRACT(HOUR FROM inicio_plantao) NOT BETWEEN 6 AND 18) * 12 
          as horas_extras
      `;

      const extrasResult = await pool.query(horasExtrasQuery);
      metricas.horasExtras = parseInt(extrasResult.rows[0]?.horas_extras) || 0;
    } catch (error) {
      console.error('Erro ao calcular horas extras:', error.message);
    }

    // DISTRIBUIÇÃO POR DEPARTAMENTO
    let distribuicaoDepartamentos = [];
    
    try {
      const departamentosQuery = `
        -- Enfermagem (usando tabela ENFERMEIRO)
        SELECT 
          'Enfermagem' as departamento,
          COUNT(*) as total_funcionarios,
          COUNT(CASE WHEN disponivel = false THEN 1 END) * 12 * 30 as horas_trabalhadas_mes,
          COUNT(CASE WHEN disponivel = false THEN 1 END) * 12 as horas_medicas,
          COUNT(CASE WHEN disponivel = false THEN 1 END) as plantoes_ativos,
          ROUND((COUNT(CASE WHEN disponivel = false THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 0) as capacidade
        FROM public."ENFERMEIRO"
        WHERE ativo = true
        
        UNION ALL
        
        -- Médicos (usando tabela MEDICO)
        SELECT 
          'Médicos' as departamento,
          COUNT(*) as total_funcionarios,
          COUNT(*) * 160 as horas_trabalhadas_mes, -- Estimativa de 160 horas/mês por médico
          160 as horas_medicas,
          (SELECT COUNT(DISTINCT c.cpf_medico) 
           FROM public."CONSULTA" c 
           WHERE c.data_hora::date = CURRENT_DATE) as plantoes_ativos,
          ROUND((
            (SELECT COUNT(DISTINCT c.cpf_medico) 
             FROM public."CONSULTA" c 
             WHERE c.data_hora::date = CURRENT_DATE) * 100.0 / 
            NULLIF(COUNT(*), 0)
          ), 0) as capacidade
        FROM public."MEDICO"
        WHERE ativo = true
      `;

      const departamentosResult = await pool.query(departamentosQuery);
      
      // Calcular percentual de plantões
      let totalPlantoes = 0;
      departamentosResult.rows.forEach(depto => {
        totalPlantoes += parseInt(depto.plantoes_ativos) || 0;
      });
      
      const cores = ['#3b82f6', '#ef4444'];
      
      distribuicaoDepartamentos = departamentosResult.rows.map((depto, index) => {
        const plantoes = parseInt(depto.plantoes_ativos) || 0;
        let percentual = 0;
        if (totalPlantoes > 0) {
          percentual = Math.round((plantoes / totalPlantoes) * 100);
        }

        return {
          departamento: depto.departamento || 'Não especificado',
          totalfuncionarios: parseInt(depto.total_funcionarios) || 0,
          horastrabalhadas: parseInt(depto.horas_trabalhadas_mes) || 0,
          mediahoras: Math.round(parseFloat(depto.horas_medicas) || 0),
          plantoesativos: plantoes,
          capacidade: parseInt(depto.capacidade) || 0,
          cor: cores[index] || '#6b7280',
          percentual: percentual
        };
      });
    } catch (error) {
      console.error('Erro ao buscar distribuição por departamento:', error.message);
      distribuicaoDepartamentos = [];
    }

    // PLANTÕES ATIVOS
    let plantoesAtivos = [];
    
    try {
      // Primeiro, tentar obter dados de plantões baseados em especialidade
      const plantoesQuery = `
        -- Plantões de UTI (baseado em especialidade)
        SELECT 
          'UTI' as setor,
          COUNT(DISTINCT e.cpf) as profissionais,
          '07:00 - 19:00' as horario,
          COUNT(DISTINCT e.cpf) as capacidade_atual,
          (SELECT COUNT(*) FROM public."ENFERMEIRO" e2 
           WHERE e2.ativo = true 
             AND EXISTS (
               SELECT 1 FROM public."ESPECIALIDADE_ENFERMEIRO" ee2 
               WHERE ee2.cpf_enfermeiro = e2.cpf 
                 AND ee2.especialidade LIKE '%UTI%'
             )) as capacidade_total
        FROM public."ENFERMEIRO" e
        JOIN public."ESPECIALIDADE_ENFERMEIRO" ee ON e.cpf = ee.cpf_enfermeiro
        WHERE e.disponivel = false 
          AND e.ativo = true
          AND ee.especialidade LIKE '%UTI%'
        
        UNION ALL
        
        -- Plantões gerais (todos os enfermeiros em plantão)
        SELECT 
          'Enfermagem Geral' as setor,
          COUNT(DISTINCT e.cpf) as profissionais,
          'Todas' as horario,
          COUNT(DISTINCT e.cpf) as capacidade_atual,
          (SELECT COUNT(*) FROM public."ENFERMEIRO" e2 
           WHERE e2.ativo = true) as capacidade_total
        FROM public."ENFERMEIRO" e
        WHERE e.disponivel = false 
          AND e.ativo = true
          AND NOT EXISTS (
            SELECT 1 FROM public."ESPECIALIDADE_ENFERMEIRO" ee 
            WHERE ee.cpf_enfermeiro = e.cpf 
              AND ee.especialidade LIKE '%UTI%'
          )
      `;

      const plantoesResult = await pool.query(plantoesQuery);
      
      plantoesAtivos = plantoesResult.rows.map(row => {
        const capacidadeAtual = parseInt(row.capacidade_atual) || 0;
        const capacidadeTotal = parseInt(row.capacidade_total) || 1; // Evitar divisão por zero
        const percentualCapacidade = Math.round((capacidadeAtual / capacidadeTotal) * 100);
        
        // Determinar turno baseado no setor e horário
        let turno = 'Variado';
        if (row.setor === 'UTI') {
          turno = 'Manhã';
        } else if (row.horario?.includes('13:00') || row.horario?.includes('14:00')) {
          turno = 'Tarde';
        } else if (row.horario?.includes('19:00') || row.horario?.includes('20:00')) {
          turno = 'Noite';
        }

        return {
          setor: row.setor || 'Não especificado',
          turno: turno,
          profissionais: capacidadeAtual,
          horario: row.horario || '00:00 - 00:00',
          capacidadeAtual: capacidadeAtual,
          capacidadeTotal: capacidadeTotal,
          percentualCapacidade: percentualCapacidade
        };
      });
      
      // Se não encontrar dados específicos, criar um registro geral
      if (plantoesAtivos.length === 0) {
        const totalAtivosQuery = `
          SELECT 
            COUNT(*) as total_ativos
          FROM public."ENFERMEIRO"
          WHERE disponivel = false AND ativo = true
        `;
        
        const totalAtivosResult = await pool.query(totalAtivosQuery);
        const totalAtivos = parseInt(totalAtivosResult.rows[0]?.total_ativos) || 0;
        
        const totalEnfermeirosQuery = `
          SELECT COUNT(*) as total
          FROM public."ENFERMEIRO"
          WHERE ativo = true
        `;
        
        const totalEnfermeirosResult = await pool.query(totalEnfermeirosQuery);
        const totalEnfermeiros = parseInt(totalEnfermeirosResult.rows[0]?.total) || 1;
        
        if (totalAtivos > 0) {
          plantoesAtivos.push({
            setor: 'Enfermagem',
            turno: 'Variado',
            profissionais: totalAtivos,
            horario: '07:00 - 19:00',
            capacidadeAtual: totalAtivos,
            capacidadeTotal: totalEnfermeiros,
            percentualCapacidade: Math.round((totalAtivos / totalEnfermeiros) * 100)
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar plantões ativos:', error.message);
      plantoesAtivos = [];
    }

    // FUNCIONÁRIOS EM SOBRECARGA
    let funcionariosSobrecarga = [];
    
    try {
      // Baseado em enfermeiros com início de plantão em horário estendido
      const sobrecargaQuery = `
        SELECT 
          p.nome,
          p.cpf,
          'Enfermagem' as departamento,
          72 as horas_trabalhadas, -- Estimativa fixa
          60 as limite_horas,
          12 as excesso -- Estimativa fixa
        FROM public."PESSOA" p
        JOIN public."ENFERMEIRO" e ON p.cpf = e.cpf
        WHERE e.disponivel = false 
          AND e.ativo = true
          AND e.inicio_plantao IS NOT NULL
          AND (
            EXTRACT(HOUR FROM e.inicio_plantao) < 6 
            OR EXTRACT(HOUR FROM e.inicio_plantao) > 18
          )
        ORDER BY p.nome
        LIMIT 5
      `;

      const sobrecargaResult = await pool.query(sobrecargaQuery);
      
      funcionariosSobrecarga = sobrecargaResult.rows.map(row => {
        return {
          nome: row.nome || 'Funcionário não identificado',
          cpf: row.cpf || '00000000000',
          departamento: row.departamento || 'Enfermagem',
          horasTrabalhadas: parseInt(row.horas_trabalhadas) || 0,
          limiteHoras: parseInt(row.limite_horas) || 0,
          excesso: parseInt(row.excesso) || 0
        };
      });
    } catch (error) {
      console.error('Erro ao buscar funcionários em sobrecarga:', error.message);
      funcionariosSobrecarga = [];
    }

    // PREVISÃO DE DEMANDAS
    let previsaoDemandas = [];
    
    try {
      // Baseado em leitos ocupados e consultas agendadas
      const previsaoQuery = `
        -- Demanda de UTI (baseada em leitos ocupados)
        SELECT 
          'UTI' as setor,
          (SELECT COUNT(*) FROM public."LEITOS" 
           WHERE tipo = 'UTI' 
             AND quant_paciente > 0) * 2 as demanda_prevista, -- 2 enfermeiros por leito
          (SELECT COUNT(*) FROM public."ENFERMEIRO" e
           WHERE e.disponivel = false 
             AND e.ativo = true
             AND EXISTS (
               SELECT 1 FROM public."ESPECIALIDADE_ENFERMEIRO" ee 
               WHERE ee.cpf_enfermeiro = e.cpf 
                 AND ee.especialidade LIKE '%UTI%'
             )) as recursos_atuais
        
        UNION ALL
        
        -- Demanda geral (baseada em enfermeiros disponíveis vs total)
        SELECT 
          'Enfermagem Geral' as setor,
          (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as demanda_prevista,
          (SELECT COUNT(*) FROM public."ENFERMEIRO" 
           WHERE disponivel = false AND ativo = true) as recursos_atuais
      `;

      const previsaoResult = await pool.query(previsaoQuery);
      
      previsaoDemandas = previsaoResult.rows.map(row => {
        const demanda = parseInt(row.demanda_prevista) || 0;
        const recursos = parseInt(row.recursos_atuais) || 0;
        const gap = recursos - demanda;
        
        let status = 'ok';
        let recomendacao = 'Manter';
        
        if (gap < -3) {
          status = 'critico';
          recomendacao = 'Contratar Plantonistas Urgente';
        } else if (gap < 0) {
          status = 'alerta';
          recomendacao = 'Contratar Plantonistas';
        } else if (gap > 5) {
          status = 'excesso';
          recomendacao = 'Redistribuir';
        }

        return {
          setor: row.setor || 'Não especificado',
          demandaPrevista: demanda,
          recursosAtuais: recursos,
          gap: gap,
          status: status,
          recomendacao: recomendacao
        };
      });
    } catch (error) {
      console.error('Erro ao calcular previsão de demandas:', error.message);
      previsaoDemandas = [];
    }

    // EVOLUÇÃO DE HORAS
    let evolucaoHoras = [];
    
    try {
      // Usando dados fixos baseados em estimativas (já que não temos histórico)
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Calcular base aproximada baseada no total atual
      const baseHoras = metricas.horasTrabalhadas || 8000;
      
      evolucaoHoras = meses.map((mes, index) => {
        // Criar uma progressão crescente
        const horas = Math.round(baseHoras * (0.9 + (index * 0.04)));
        const variacao = index === 0 ? '+0%' : '+3%';
        
        return {
          periodo: mes,
          horas: horas,
          variacao: variacao
        };
      });
    } catch (error) {
      console.error('Erro ao criar evolução de horas:', error.message);
      evolucaoHoras = [];
    }

    // CALCULAR OUTRAS MÉTRICAS
    
    // Calcular taxa de absenteísmo (enfermeiros disponíveis vs total)
    try {
      const absenteismoQuery = `
        SELECT 
          ROUND(
            (COUNT(CASE WHEN disponivel = true THEN 1 END) * 100.0 / 
            NULLIF(COUNT(*), 0)), 1
          ) as taxa_absenteismo
        FROM public."ENFERMEIRO"
        WHERE ativo = true
      `;

      const absenteismoResult = await pool.query(absenteismoQuery);
      metricas.taxaAbsenteismo = parseFloat(absenteismoResult.rows[0]?.taxa_absenteismo) || 0;
    } catch (error) {
      console.error('Erro ao calcular taxa de absenteísmo:', error.message);
    }

    // Calcular capacidade ociosa (enfermeiros disponíveis)
    try {
      const capacidadeOciosaQuery = `
        SELECT 
          ROUND(
            (COUNT(CASE WHEN disponivel = true THEN 1 END) * 100.0 / 
            NULLIF(COUNT(*), 0)), 0
          ) as capacidade_ociosa
        FROM public."ENFERMEIRO"
        WHERE ativo = true
      `;

      const capacidadeResult = await pool.query(capacidadeOciosaQuery);
      metricas.capacidadeOciosa = parseInt(capacidadeResult.rows[0]?.capacidade_ociosa) || 0;
    } catch (error) {
      console.error('Erro ao calcular capacidade ociosa:', error.message);
    }

    // RESPOSTA FINAL
    const dados = {
      metricas,
      distribuicaoDepartamentos,
      plantoesAtivos,
      funcionariosSobrecarga,
      previsaoDemandas,
      evolucaoHoras
    };

    console.log('Enviando resposta com dados ajustados de RH:', {
      metricas: {
        totalFuncionarios: metricas.totalFuncionarios,
        plantoesAtivos: metricas.plantoesAtivos,
        sobrecarga: metricas.alertasSobrecarga,
        absenteismo: metricas.taxaAbsenteismo
      },
      departamentos: distribuicaoDepartamentos.length,
      plantoes: plantoesAtivos.length,
      sobrecarga: funcionariosSobrecarga.length
    });
    
    res.json(dados);
    
  } catch (error) {
    console.error('Erro geral no controller de RH:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const exportRecursosHumanos = async (req, res) => {
  try {
    const { format, periodo, departamento, turno } = req.query;
    
    console.log('Exportando dados de RH:', { format, periodo, departamento, turno });
    
    // Chama a função principal para obter dados reais
    const mockReq = {
      query: { periodo, departamento, turno }
    };
    
    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
        return mockRes;
      },
      status: () => mockRes
    };
    
    await recursosHumanos(mockReq, mockRes);
    
    if (format === 'json') {
      res.json(responseData);
    } else if (format === 'excel' || format === 'pdf') {
      res.json(responseData);
    } else {
      res.status(400).json({ error: 'Formato inválido' });
    }
    
  } catch (error) {
    console.error('Erro ao exportar RH:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};