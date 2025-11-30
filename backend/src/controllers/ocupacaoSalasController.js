import pool from "../config/db.js";

export const getOcupacaoSalas = async (req, res) => {
  const { periodo, tipoSala } = req.query;

  try {
    // Métricas principais
    const metricasQuery = `
      SELECT 
        tipo,
        COUNT(*) as total,
        COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM public."CONSULTA" c 
          WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
          AND c.data_hora >= NOW() - INTERVAL '1 day'
        ) OR EXISTS (
          SELECT 1 FROM public."CIRURGIA" c 
          WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
          AND c.data_hora >= NOW() - INTERVAL '1 day'
        ) THEN 1 END) as ocupadas,
        ROUND((
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM public."CONSULTA" c 
            WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
            AND c.data_hora >= NOW() - INTERVAL '1 day'
          ) OR EXISTS (
            SELECT 1 FROM public."CIRURGIA" c 
            WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
            AND c.data_hora >= NOW() - INTERVAL '1 day'
          ) THEN 1 END) * 100.0 / COUNT(*)
        ), 2) as ocupacao
      FROM public."SALAS" s
      WHERE s.ativo = true
      ${tipoSala !== 'todas' ? `AND s.tipo = '${tipoSala}'` : ''}
      GROUP BY tipo
    `;

    const metricasResult = await pool.query(metricasQuery);

    const metricas = {
      consultorios: metricasResult.rows.find(row => row.tipo === 'CONSULTORIO') || { ocupadas: 0, total: 0, ocupacao: 0, tendencia: 'neutral', variacao: '0%' },
      cirurgia: metricasResult.rows.find(row => row.tipo === 'CIRURGIA') || { ocupadas: 0, total: 0, ocupacao: 0, tendencia: 'neutral', variacao: '0%' },
      total: {
        ocupadas: metricasResult.rows.reduce((sum, row) => sum + parseInt(row.ocupadas), 0),
        total: metricasResult.rows.reduce((sum, row) => sum + parseInt(row.total), 0),
        ocupacao: metricasResult.rows.reduce((sum, row) => sum + parseFloat(row.ocupacao), 0) / metricasResult.rows.length,
        tendencia: 'neutral',
        variacao: '0%'
      },
      taxaUtilizacao: 78.5,
      trendUtilizacao: 'up',
      variacaoUtilizacao: '+3.2%',
      horarioPico: '09:00-11:00',
      taxaOciosidade: 21.5,
      trendOciosidade: 'down',
      variacaoOciosidade: '-2.1%',
      mediaUsoDiario: 6.8,
      trendUsoDiario: 'up',
      variacaoUsoDiario: '+0.3h',
      salasManutencao: 2,
      trendManutencao: 'neutral',
      variacaoManutencao: '0'
    };

    // Detalhamento por especialidade
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(DISTINCT s.n_sala) as salas_totais,
        COUNT(DISTINCT CASE WHEN EXISTS (
          SELECT 1 FROM public."CONSULTA" c 
          WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
          AND c.data_hora >= NOW() - INTERVAL '1 day'
          AND c.cpf_medico IN (
            SELECT cpf_medico FROM public."ESPECIALIDADE_MEDICO" 
            WHERE especialidade = em.especialidade
          )
        ) THEN s.n_sala END) as salas_ocupadas,
        ROUND((
          COUNT(DISTINCT CASE WHEN EXISTS (
            SELECT 1 FROM public."CONSULTA" c 
            WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
            AND c.data_hora >= NOW() - INTERVAL '1 day'
            AND c.cpf_medico IN (
              SELECT cpf_medico FROM public."ESPECIALIDADE_MEDICO" 
              WHERE especialidade = em.especialidade
            )
          ) THEN s.n_sala END) * 100.0 / COUNT(DISTINCT s.n_sala)
        ), 2) as ocupacao,
        s.tipo as tipo_sala
      FROM public."SALAS" s
      CROSS JOIN public."ESPECIALIDADE_MEDICO" em
      WHERE s.ativo = true
      ${tipoSala !== 'todas' ? `AND s.tipo = '${tipoSala}'` : ''}
      GROUP BY em.especialidade, s.tipo
      ORDER BY ocupacao DESC
      LIMIT 10
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    const detalhamentoEspecialidades = especialidadesResult.rows.map(esp => ({
      ...esp,
      cor: esp.especialidade === 'Cardiologia' ? '#ef4444' :
           esp.especialidade === 'Ortopedia' ? '#3b82f6' :
           esp.especialidade === 'Pediatria' ? '#10b981' :
           esp.especialidade === 'Ginecologia' ? '#f59e0b' : '#6b7280',
      turnos: {
        manha: Math.round(Math.random() * 100),
        tarde: Math.round(Math.random() * 100),
        noite: Math.round(Math.random() * 100)
      }
    }));

    // Salas de cirurgia
    const salasCirurgiaQuery = `
      SELECT 
        s.n_sala,
        s.tipo,
        COUNT(c.data_hora) as cirurgias_hoje,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM public."CIRURGIA" c 
            WHERE c.n_sala = s.n_sala 
            AND c.data_hora::date = CURRENT_DATE
          ) THEN 'ocupada'
          ELSE 'disponivel'
        END as status,
        (
          SELECT json_build_object(
            'data_hora', c.data_hora,
            'tipo', 'Cirurgia Programada'
          )
          FROM public."CIRURGIA" c 
          WHERE c.n_sala = s.n_sala 
          AND c.data_hora > NOW()
          ORDER BY c.data_hora ASC
          LIMIT 1
        ) as proxima_cirurgia,
        'Cirurgia Geral' as especialidade_principal,
        8 as capacidade_diaria
      FROM public."SALAS" s
      WHERE s.tipo = 'CIRURGIA' AND s.ativo = true
      ORDER BY s.n_sala
    `;

    const salasCirurgiaResult = await pool.query(salasCirurgiaQuery);

    // Ocupação por turno
    const ocupacaoPorTurno = [
      { turno: 'Manhã', percentual: 65, cor: '#3b82f6' },
      { turno: 'Tarde', percentual: 45, cor: '#f59e0b' },
      { turno: 'Noite', percentual: 25, cor: '#6b7280' }
    ];

    // Evolução da ocupação
    const evolucaoOcupacao = [
      { periodo: 'Jan', ocupacao: 62 },
      { periodo: 'Fev', ocupacao: 68 },
      { periodo: 'Mar', ocupacao: 72 }
    ];

    const dados = {
      metricas,
      detalhamentoEspecialidades,
      salasCirurgia: salasCirurgiaResult.rows,
      ocupacaoPorTurno,
      evolucaoOcupacao
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados de salas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportSalas = async (req, res) => {
  try {
    const { format, periodo, tipoSala } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=ocupacao-salas-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório de salas exportado');
  } catch (error) {
    console.error('Erro ao exportar dados de salas:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};