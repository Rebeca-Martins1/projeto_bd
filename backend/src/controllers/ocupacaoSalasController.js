import pool from "../config/db.js";

export const ocupacaoSalas = async (req, res) => {
  const { periodo, tipoSala } = req.query;

  try {
    // Métricas principais 
    const metricasQuery = `
      SELECT 
        s.tipo,
        COUNT(*) as total,
        SUM(CASE 
          WHEN EXISTS (
            SELECT 1 FROM public."CONSULTA" c 
            WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
            AND c.data_hora >= NOW() - INTERVAL '1 day'
          ) OR EXISTS (
            SELECT 1 FROM public."CIRURGIA" c 
            WHERE c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
            AND c.data_hora >= NOW() - INTERVAL '1 day'
          ) THEN 1 ELSE 0
        END) as ocupadas
      FROM public."SALAS" s
      WHERE s.ativo = true
      ${tipoSala !== 'todas' ? `AND s.tipo = '${tipoSala}'` : ''}
      GROUP BY s.tipo
    `;

    const metricasResult = await pool.query(metricasQuery);

    // Processar resultados manualmente para evitar null
    const metricasProcessadas = metricasResult.rows.map(row => {
      const total = parseInt(row.total) || 0;
      const ocupadas = parseInt(row.ocupadas) || 0;
      const ocupacao = total > 0 ? Math.round((ocupadas / total) * 100 * 100) / 100 : 0;
      
      return {
        ...row,
        total: total,
        ocupadas: ocupadas,
        ocupacao: ocupacao
      };
    });

    // Calcular totais
    let totalOcupadas = 0;
    let totalSalas = 0;
    
    metricasProcessadas.forEach(row => {
      totalOcupadas += parseInt(row.ocupadas) || 0;
      totalSalas += parseInt(row.total) || 0;
    });
    
    const ocupacaoMedia = metricasProcessadas.length > 0 ? 
      metricasProcessadas.reduce((sum, row) => sum + (parseFloat(row.ocupacao) || 0), 0) / metricasProcessadas.length : 0;

    // Encontrar tipos específicos
    let consultorios = metricasProcessadas.find(row => row.tipo === 'CONSULTORIO');
    let cirurgia = metricasProcessadas.find(row => row.tipo === 'CIRURGIA');

    // Se não encontrou, criar objetos padrão
    if (!consultorios) {
      consultorios = { 
        ocupadas: 0, 
        total: 0, 
        ocupacao: 0, 
        tendencia: 'neutral', 
        variacao: '0%' 
      };
    }

    if (!cirurgia) {
      cirurgia = { 
        ocupadas: 0, 
        total: 0, 
        ocupacao: 0, 
        tendencia: 'neutral', 
        variacao: '0%' 
      };
    }

    const metricas = {
      consultorios: {
        ...consultorios,
        tendencia: 'neutral',
        variacao: '0%'
      },
      cirurgia: {
        ...cirurgia,
        tendencia: 'neutral',
        variacao: '0%'
      },
      total: {
        ocupadas: totalOcupadas,
        total: totalSalas,
        ocupacao: ocupacaoMedia,
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

    // Query de especialidades - SEM COALESCE
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(DISTINCT s.n_sala) as salas_totais,
        s.tipo as tipo_sala
      FROM public."SALAS" s
      CROSS JOIN public."ESPECIALIDADE_MEDICO" em
      WHERE s.ativo = true
      ${tipoSala !== 'todas' ? `AND s.tipo = '${tipoSala}'` : ''}
      GROUP BY em.especialidade, s.tipo
      ORDER BY em.especialidade
      LIMIT 10
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    // Processar resultados manualmente
    const detalhamentoEspecialidades = especialidadesResult.rows.map(esp => {
      const salasTotais = parseInt(esp.salas_totais) || 0;
      const ocupacao = salasTotais > 0 ? Math.round((Math.random() * 100) * 100) / 100 : 0;
      const salasOcupadas = Math.round(salasTotais * (ocupacao / 100));
      
      let cor = '#6b7280';
      if (esp.especialidade === 'Cardiologia') {
        cor = '#ef4444';
      } else if (esp.especialidade === 'Ortopedia') {
        cor = '#3b82f6';
      } else if (esp.especialidade === 'Pediatria') {
        cor = '#10b981';
      } else if (esp.especialidade === 'Ginecologia') {
        cor = '#f59e0b';
      }
      
      return {
        especialidade: esp.especialidade || 'Não especificada',
        salas_totais: salasTotais,
        salas_ocupadas: salasOcupadas,
        ocupacao: ocupacao,
        tipo_sala: esp.tipo_sala || 'CONSULTORIO',
        cor: cor,
        turnos: {
          manha: Math.round(Math.random() * 100),
          tarde: Math.round(Math.random() * 100),
          noite: Math.round(Math.random() * 100)
        }
      };
    });

    // Query de salas de cirurgia - SEM COALESCE
    const salasCirurgiaQuery = `
      SELECT 
        s.n_sala,
        s.tipo,
        (
          SELECT COUNT(*) 
          FROM public."CIRURGIA" c 
          WHERE c.n_sala = s.n_sala 
          AND c.data_hora::date = CURRENT_DATE
        ) as cirurgias_hoje,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM public."CIRURGIA" c 
            WHERE c.n_sala = s.n_sala 
            AND c.data_hora::date = CURRENT_DATE
          ) THEN 'ocupada'
          ELSE 'disponivel'
        END as status,
        'Cirurgia Geral' as especialidade_principal,
        8 as capacidade_diaria
      FROM public."SALAS" s
      WHERE s.tipo = 'CIRURGIA' AND s.ativo = true
      ORDER BY s.n_sala
    `;

    const salasCirurgiaResult = await pool.query(salasCirurgiaQuery);

    // Processar salas de cirurgia
    const salasCirurgia = [];
    
    for (const sala of salasCirurgiaResult.rows) {
      try {
        // Buscar próxima cirurgia
        const proximaQuery = `
          SELECT 
            c.data_hora,
            'Cirurgia Programada' as tipo
          FROM public."CIRURGIA" c 
          WHERE c.n_sala = $1 
          AND c.data_hora > NOW()
          ORDER BY c.data_hora ASC
          LIMIT 1
        `;
        
        const proximaResult = await pool.query(proximaQuery, [sala.n_sala]);
        
        salasCirurgia.push({
          n_sala: sala.n_sala || 0,
          tipo: sala.tipo || 'CIRURGIA',
          cirurgias_hoje: parseInt(sala.cirurgias_hoje) || 0,
          status: sala.status || 'disponivel',
          especialidade_principal: sala.especialidade_principal || 'Cirurgia Geral',
          capacidade_diaria: parseInt(sala.capacidade_diaria) || 8,
          proxima_cirurgia: proximaResult.rows[0] || null
        });
      } catch (error) {
        // Em caso de erro, adicionar sala sem próxima cirurgia
        salasCirurgia.push({
          n_sala: sala.n_sala || 0,
          tipo: sala.tipo || 'CIRURGIA',
          cirurgias_hoje: parseInt(sala.cirurgias_hoje) || 0,
          status: sala.status || 'disponivel',
          especialidade_principal: sala.especialidade_principal || 'Cirurgia Geral',
          capacidade_diaria: parseInt(sala.capacidade_diaria) || 8,
          proxima_cirurgia: null
        });
      }
    }

    // Dados estáticos
    const ocupacaoPorTurno = [
      { turno: 'Manhã', percentual: 65, cor: '#3b82f6' },
      { turno: 'Tarde', percentual: 45, cor: '#f59e0b' },
      { turno: 'Noite', percentual: 25, cor: '#6b7280' }
    ];

    const evolucaoOcupacao = [
      { periodo: 'Jan', ocupacao: 62 },
      { periodo: 'Fev', ocupacao: 68 },
      { periodo: 'Mar', ocupacao: 72 }
    ];

    const dados = {
      metricas,
      detalhamentoEspecialidades,
      salasCirurgia,
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