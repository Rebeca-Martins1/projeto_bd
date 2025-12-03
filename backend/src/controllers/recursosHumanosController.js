import pool from "../config/db.js";

export const recursosHumanos = async (req, res) => {
  const { periodo, departamento, turno } = req.query;

  try {
    // Métricas principais 
    const metricasQuery = `
      SELECT 
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as totalMedicos,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as totalEnfermeiros,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false) as plantoesAtivos,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false 
          AND inicio_plantao IS NOT NULL 
          AND EXTRACT(HOUR FROM inicio_plantao) BETWEEN 6 AND 18) as sobrecargaCount
    `;

    const metricasResult = await pool.query(metricasQuery);
    const row = metricasResult.rows[0] || {};

    const metricas = {
      horasTrabalhadas: 8432,
      trendHoras: 'up',
      variacaoHoras: '+320h',
      plantoesAtivos: parseInt(row.plantoesativos) || 0,
      trendPlantoes: 'neutral',
      variacaoPlantoes: '0',
      alertasSobrecarga: parseInt(row.sobrecargacount) || 0,
      trendAlertas: 'down',
      variacaoAlertas: '-2',
      mediaEnfermeiro: 42,
      trendMediaEnfermeiro: 'down',
      variacaoMediaEnfermeiro: '-3h',
      taxaAbsenteismo: 4.2,
      trendAbsenteismo: 'down',
      variacaoAbsenteismo: '-0.8%',
      horasExtras: 320,
      trendHorasExtras: 'up',
      variacaoHorasExtras: '+45h',
      turnover: 8,
      trendTurnover: 'down',
      variacaoTurnover: '-2%',
      capacidadeOciosa: 15,
      trendCapacidadeOciosa: 'up',
      variacaoCapacidadeOciosa: '+3%'
    };

    // Distribuição por departamento
    const departamentosQuery = `
      SELECT 
        'Enfermagem' as departamento,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as totalFuncionarios,
        4250 as horasTrabalhadas,
        50 as mediaHoras,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false) as plantoesAtivos,
        85 as capacidade
      UNION ALL
      SELECT 
        'Médicos' as departamento,
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as totalFuncionarios,
        2880 as horasTrabalhadas,
        64 as mediaHoras,
        8 as plantoesAtivos,
        90 as capacidade
      UNION ALL
      SELECT 
        'Administrativo' as departamento,
        32 as totalFuncionarios,
        1280 as horasTrabalhadas,
        40 as mediaHoras,
        4 as plantoesAtivos,
        60 as capacidade
    `;

    const departamentosResult = await pool.query(departamentosQuery);

    // Calcular percentual
    let totalPlantoes = 0;
    departamentosResult.rows.forEach(depto => {
      totalPlantoes += parseInt(depto.plantoesativos) || 0;
    });
    
    const distribuicaoDepartamentos = departamentosResult.rows.map(depto => {
      const plantoes = parseInt(depto.plantoesativos) || 0;
      let percentual = 0;
      if (totalPlantoes > 0) {
        percentual = Math.round((plantoes / totalPlantoes) * 100);
      }

      let cor = '#10b981';
      if (depto.departamento === 'Enfermagem') {
        cor = '#3b82f6';
      } else if (depto.departamento === 'Médicos') {
        cor = '#ef4444';
      }

      return {
        ...depto,
        cor: cor,
        percentual: percentual
      };
    });

    // Plantões ativos
    const plantoesQuery = `
      SELECT 
        p.nome,
        e.inicio_plantao,
        e.inicio_folga,
        ee.especialidade
      FROM public."ENFERMEIRO" e
      LEFT JOIN public."PESSOA" p ON e.cpf = p.cpf
      LEFT JOIN public."ESPECIALIDADE_ENFERMEIRO" ee ON e.cpf = ee.cpf_enfermeiro
      WHERE e.disponivel = false
      AND e.ativo = true
    `;

    const plantoesResult = await pool.query(plantoesQuery);

    // Dados estáticos para plantões ativos
    const plantoesAtivos = [
      {
        setor: 'UTI Adulto',
        turno: 'Manhã',
        profissionais: 8,
        horario: '07:00 - 19:00',
        capacidadeAtual: 10,
        capacidadeTotal: 12,
        percentualCapacidade: 83
      },
      {
        setor: 'Pronto Socorro',
        turno: 'Tarde',
        profissionais: 12,
        horario: '13:00 - 01:00',
        capacidadeAtual: 15,
        capacidadeTotal: 15,
        percentualCapacidade: 100
      }
    ];

    // Funcionários em sobrecarga
    const sobrecargaQuery = `
      SELECT 
        p.nome,
        p.cpf,
        'Enfermagem' as departamento,
        72 as horasTrabalhadas,
        60 as limiteHoras,
        12 as excesso
      FROM public."ENFERMEIRO" e
      LEFT JOIN public."PESSOA" p ON e.cpf = p.cpf
      WHERE e.disponivel = false
      AND e.ativo = true
      LIMIT 3
    `;

    const sobrecargaResult = await pool.query(sobrecargaQuery);

    // Tratar valores nulos nos resultados
    const funcionariosSobrecarga = sobrecargaResult.rows.map(row => {
      return {
        nome: row.nome || 'Funcionário não identificado',
        cpf: row.cpf || '00000000000',
        departamento: row.departamento || 'Enfermagem',
        horasTrabalhadas: row.horastrabalhadas || 0,
        limiteHoras: row.limitehoras || 0,
        excesso: row.excesso || 0
      };
    });

    // Previsão de demandas (dados estáticos)
    const previsaoDemandas = [
      {
        setor: 'Pronto Socorro',
        demandaPrevista: 18,
        recursosAtuais: 15,
        gap: -3,
        status: 'alerta',
        recomendacao: 'Contratar Plantonistas'
      },
      {
        setor: 'UTI',
        demandaPrevista: 12,
        recursosAtuais: 10,
        gap: -2,
        status: 'alerta',
        recomendacao: 'Redistribuir'
      }
    ];

    // Evolução de horas (dados estáticos)
    const evolucaoHoras = [
      { periodo: 'Jan', horas: 7800, variacao: '+5%' },
      { periodo: 'Fev', horas: 8200, variacao: '+3%' },
      { periodo: 'Mar', horas: 8432, variacao: '+2%' }
    ];

    const dados = {
      metricas,
      distribuicaoDepartamentos,
      plantoesAtivos,
      funcionariosSobrecarga,
      previsaoDemandas,
      evolucaoHoras
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados de RH:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportRH = async (req, res) => {
  try {
    const { format, periodo, departamento, turno } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=recursos-humanos-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório de RH exportado');
  } catch (error) {
    console.error('Erro ao exportar dados de RH:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};