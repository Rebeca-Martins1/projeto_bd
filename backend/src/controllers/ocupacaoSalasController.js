import pool from "../config/db.js";

export const ocupacaoSalas = async (req, res) => {
  const { periodo, tipoSala } = req.query;

  try {
    // MÉTRICAS PRINCIPAIS
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

    // Processar resultados
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
    
    const ocupacaoMedia = totalSalas > 0 ? Math.round((totalOcupadas / totalSalas) * 100 * 100) / 100 : 0;

    // Encontrar tipos específicos
    let consultorios = metricasProcessadas.find(row => row.tipo === 'CONSULTORIO');
    let cirurgia = metricasProcessadas.find(row => row.tipo === 'CIRURGIA');

    // Se não encontrou, criar objetos com zeros
    if (!consultorios) {
      consultorios = { 
        ocupadas: 0, 
        total: 0, 
        ocupacao: 0
      };
    }

    if (!cirurgia) {
      cirurgia = { 
        ocupadas: 0, 
        total: 0, 
        ocupacao: 0
      };
    }

    // Calcular taxa de utilização baseada nos últimos 7 dias
    let taxaUtilizacao = 0;
    try {
      const utilizacaoQuery = `
        SELECT 
          COUNT(DISTINCT 
            CASE 
              WHEN c.data_hora >= NOW() - INTERVAL '7 days' THEN c.n_sala || '|' || c.tipo_sala
              WHEN cir.data_hora >= NOW() - INTERVAL '7 days' THEN cir.n_sala || '|' || cir.tipo_sala
            END
          ) as salas_utilizadas,
          (SELECT COUNT(*) FROM public."SALAS" WHERE ativo = true) as total_salas
        FROM (
          SELECT n_sala, tipo_sala, data_hora FROM public."CONSULTA"
          UNION ALL
          SELECT n_sala, tipo_sala, data_hora FROM public."CIRURGIA"
        ) as todas_utilizacoes
      `;
      
      const utilizacaoResult = await pool.query(utilizacaoQuery);
      const row = utilizacaoResult.rows[0] || {};
      const salasUtilizadas = parseInt(row.salas_utilizadas) || 0;
      const totalSalasSistema = parseInt(row.total_salas) || 1;
      
      taxaUtilizacao = totalSalasSistema > 0 ? Math.round((salasUtilizadas / totalSalasSistema) * 100 * 10) / 10 : 0;
    } catch (error) {
      console.error('Erro ao calcular taxa de utilização:', error.message);
      taxaUtilizacao = ocupacaoMedia;
    }

    // Calcular horário de pico
    let horarioPico = 'N/A';
    try {
      const picoQuery = `
        SELECT 
          EXTRACT(HOUR FROM data_hora) as hora,
          COUNT(*) as atendimentos
        FROM (
          SELECT data_hora FROM public."CONSULTA"
          WHERE data_hora >= NOW() - INTERVAL '7 days'
          UNION ALL
          SELECT data_hora FROM public."CIRURGIA"
          WHERE data_hora >= NOW() - INTERVAL '7 days'
        ) as todos_atendimentos
        GROUP BY EXTRACT(HOUR FROM data_hora)
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `;
      
      const picoResult = await pool.query(picoQuery);
      if (picoResult.rows.length > 0) {
        const hora = parseInt(picoResult.rows[0].hora) || 0;
        const horaFim = hora + 2;
        horarioPico = `${hora.toString().padStart(2, '0')}:00-${horaFim.toString().padStart(2, '0')}:00`;
      }
    } catch (error) {
      console.error('Erro ao calcular horário de pico:', error.message);
    }

    // Calcular média de uso diário
    let mediaUsoDiario = 0;
    try {
      const mediaQuery = `
        SELECT 
          AVG(uso_diario) as media_uso
        FROM (
          SELECT 
            DATE(data_hora) as dia,
            COUNT(DISTINCT n_sala || '|' || tipo_sala) as uso_diario
          FROM (
            SELECT n_sala, tipo_sala, data_hora FROM public."CONSULTA"
            WHERE data_hora >= NOW() - INTERVAL '30 days'
            UNION ALL
            SELECT n_sala, tipo_sala, data_hora FROM public."CIRURGIA"
            WHERE data_hora >= NOW() - INTERVAL '30 days'
          ) as todas_salas
          GROUP BY DATE(data_hora)
        ) as uso_por_dia
      `;
      
      const mediaResult = await pool.query(mediaQuery);
      mediaUsoDiario = mediaResult.rows[0]?.media_uso 
        ? Math.round(parseFloat(mediaResult.rows[0].media_uso) * 10) / 10 
        : 0;
    } catch (error) {
      console.error('Erro ao calcular média de uso diário:', error.message);
    }

    // Calcular salas em manutenção
    let salasManutencao = 0;
    try {
      const manutencaoQuery = `
        SELECT COUNT(*) as total_manutencao
        FROM public."SALAS"
        WHERE ativo = false
      `;
      
      const manutencaoResult = await pool.query(manutencaoQuery);
      salasManutencao = parseInt(manutencaoResult.rows[0]?.total_manutencao) || 0;
    } catch (error) {
      console.error('Erro ao calcular salas em manutenção:', error.message);
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
      taxaUtilizacao: taxaUtilizacao,
      trendUtilizacao: 'neutral',
      variacaoUtilizacao: '0%',
      horarioPico: horarioPico,
      taxaOciosidade: Math.max(0, 100 - taxaUtilizacao),
      trendOciosidade: 'neutral',
      variacaoOciosidade: '0%',
      mediaUsoDiario: mediaUsoDiario,
      trendUsoDiario: 'neutral',
      variacaoUsoDiario: '0h',
      salasManutencao: salasManutencao,
      trendManutencao: 'neutral',
      variacaoManutencao: '0'
    };

    // DETALHAMENTO POR ESPECIALIDADE
    let detalhamentoEspecialidades = [];
    
    try {
      const especialidadesQuery = `
        SELECT 
          em.especialidade,
          COUNT(DISTINCT c.n_sala) as salas_utilizadas,
          COUNT(DISTINCT c.n_sala || '|' || c.tipo_sala) as total_utilizacoes,
          s.tipo as tipo_sala
        FROM public."ESPECIALIDADE_MEDICO" em
        JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
        LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico 
          AND c.data_hora >= NOW() - INTERVAL '7 days'
        LEFT JOIN public."SALAS" s ON c.n_sala = s.n_sala AND c.tipo_sala = s.tipo
        WHERE s.ativo = true OR s.ativo IS NULL
        ${tipoSala !== 'todas' ? `AND s.tipo = '${tipoSala}'` : ''}
        GROUP BY em.especialidade, s.tipo
        HAVING COUNT(DISTINCT c.n_sala) > 0
        ORDER BY COUNT(DISTINCT c.n_sala) DESC
        LIMIT 10
      `;

      const especialidadesResult = await pool.query(especialidadesQuery);
      
      // Buscar totais de salas por especialidade para calcular ocupação
      for (let esp of especialidadesResult.rows) {
        try {
          // Buscar total de salas disponíveis para essa especialidade
          const totalSalasQuery = `
            SELECT COUNT(DISTINCT s.n_sala) as total_salas
            FROM public."SALAS" s
            WHERE s.ativo = true
              AND s.tipo = $1
              ${tipoSala !== 'todas' ? `AND s.tipo = '${tipoSala}'` : ''}
          `;
          
          const totalResult = await pool.query(totalSalasQuery, [esp.tipo_sala]);
          const totalSalasEspecialidade = parseInt(totalResult.rows[0]?.total_salas) || 1;
          
          // Calcular ocupação real
          const salasUtilizadas = parseInt(esp.salas_utilizadas) || 0;
          const ocupacao = Math.round((salasUtilizadas / totalSalasEspecialidade) * 100 * 10) / 10;
          const salasOcupadas = Math.round(salasUtilizadas);
          
          // Calcular distribuição por turno
          const turnosQuery = `
            SELECT 
              CASE 
                WHEN EXTRACT(HOUR FROM c.data_hora) BETWEEN 6 AND 12 THEN 'manha'
                WHEN EXTRACT(HOUR FROM c.data_hora) BETWEEN 13 AND 18 THEN 'tarde'
                ELSE 'noite'
              END as turno,
              COUNT(*) as atendimentos
            FROM public."CONSULTA" c
            JOIN public."MEDICO" m ON c.cpf_medico = m.cpf
            JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
            WHERE em.especialidade = $1
              AND c.data_hora >= NOW() - INTERVAL '7 days'
            GROUP BY 
              CASE 
                WHEN EXTRACT(HOUR FROM c.data_hora) BETWEEN 6 AND 12 THEN 'manha'
                WHEN EXTRACT(HOUR FROM c.data_hora) BETWEEN 13 AND 18 THEN 'tarde'
                ELSE 'noite'
              END
          `;
          
          const turnosResult = await pool.query(turnosQuery, [esp.especialidade]);
          
          let turnos = { manha: 0, tarde: 0, noite: 0 };
          let totalTurnos = 0;
          
          turnosResult.rows.forEach(t => {
            const count = parseInt(t.atendimentos) || 0;
            if (t.turno === 'manha') turnos.manha = count;
            else if (t.turno === 'tarde') turnos.tarde = count;
            else if (t.turno === 'noite') turnos.noite = count;
            totalTurnos += count;
          });
          
          // Calcular percentuais
          if (totalTurnos > 0) {
            turnos.manha = Math.round((turnos.manha / totalTurnos) * 100);
            turnos.tarde = Math.round((turnos.tarde / totalTurnos) * 100);
            turnos.noite = Math.round((turnos.noite / totalTurnos) * 100);
          }
          
          // Definir cor baseada na especialidade
          let cor = '#6b7280';
          const espLower = esp.especialidade?.toLowerCase() || '';
          if (espLower.includes('cardio')) cor = '#ef4444';
          else if (espLower.includes('orto')) cor = '#3b82f6';
          else if (espLower.includes('pediatria')) cor = '#10b981';
          else if (espLower.includes('gineco')) cor = '#f59e0b';
          else if (espLower.includes('cirurgia')) cor = '#8b5cf6';
          else if (espLower.includes('clinica')) cor = '#0ea5e9';
          
          detalhamentoEspecialidades.push({
            especialidade: esp.especialidade || 'Não especificada',
            salas_totais: totalSalasEspecialidade,
            salas_ocupadas: salasOcupadas,
            ocupacao: ocupacao,
            tipo_sala: esp.tipo_sala || 'CONSULTORIO',
            cor: cor,
            turnos: turnos
          });
        } catch (innerError) {
          console.error(`Erro ao processar especialidade ${esp.especialidade}:`, innerError.message);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error.message);
      detalhamentoEspecialidades = [];
    }

    // SALAS DE CIRURGIA
    let salasCirurgia = [];
    
    try {
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
          END as status
        FROM public."SALAS" s
        WHERE s.tipo = 'CIRURGIA' AND s.ativo = true
        ORDER BY s.n_sala
      `;

      const salasCirurgiaResult = await pool.query(salasCirurgiaQuery);
      
      for (const sala of salasCirurgiaResult.rows) {
        try {
          // Buscar especialidade principal baseada nas cirurgias recentes
          const especialidadeQuery = `
            SELECT 
              em.especialidade,
              COUNT(*) as total_cirurgias
            FROM public."CIRURGIA" c
            JOIN public."MEDICO" m ON c.cpf_medico = m.cpf
            JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
            WHERE c.n_sala = $1 
              AND c.data_hora >= NOW() - INTERVAL '30 days'
            GROUP BY em.especialidade
            ORDER BY COUNT(*) DESC
            LIMIT 1
          `;
          
          const especialidadeResult = await pool.query(especialidadeQuery, [sala.n_sala]);
          const especialidadePrincipal = especialidadeResult.rows[0]?.especialidade || 'Cirurgia Geral';
          
          // Calcular capacidade diária baseada na média histórica
          const capacidadeQuery = `
            SELECT 
              AVG(cirurgias_diarias) as capacidade_media,
              MAX(cirurgias_diarias) as capacidade_maxima
            FROM (
              SELECT 
                DATE(data_hora) as dia,
                COUNT(*) as cirurgias_diarias
              FROM public."CIRURGIA"
              WHERE n_sala = $1
                AND data_hora >= NOW() - INTERVAL '90 days'
              GROUP BY DATE(data_hora)
            ) as historico
          `;
          
          const capacidadeResult = await pool.query(capacidadeQuery, [sala.n_sala]);
          const capacidadeMedia = capacidadeResult.rows[0]?.capacidade_media 
            ? Math.round(parseFloat(capacidadeResult.rows[0].capacidade_media)) 
            : 4;
          const capacidadeMaxima = capacidadeResult.rows[0]?.capacidade_maxima 
            ? Math.round(parseFloat(capacidadeResult.rows[0].capacidade_maxima)) 
            : 8;
          
          // Usar a maior entre média e um mínimo razoável
          const capacidadeDiaria = Math.max(capacidadeMedia, 4);
          
          // Buscar próxima cirurgia
          const proximaQuery = `
            SELECT 
              c.data_hora,
              p.nome as paciente_nome,
              em.especialidade
            FROM public."CIRURGIA" c
            JOIN public."PACIENTE" pc ON c.cpf_paciente = pc.cpf
            JOIN public."PESSOA" p ON pc.cpf = p.cpf
            JOIN public."MEDICO" m ON c.cpf_medico = m.cpf
            JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
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
            especialidade_principal: especialidadePrincipal,
            capacidade_diaria: capacidadeDiaria,
            capacidade_maxima: capacidadeMaxima,
            proxima_cirurgia: proximaResult.rows[0] || null
          });
        } catch (innerError) {
          console.error(`Erro ao processar sala ${sala.n_sala}:`, innerError.message);
          
          salasCirurgia.push({
            n_sala: sala.n_sala || 0,
            tipo: sala.tipo || 'CIRURGIA',
            cirurgias_hoje: parseInt(sala.cirurgias_hoje) || 0,
            status: sala.status || 'disponivel',
            especialidade_principal: 'Cirurgia Geral',
            capacidade_diaria: 4,
            capacidade_maxima: 8,
            proxima_cirurgia: null
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar salas de cirurgia:', error.message);
      salasCirurgia = [];
    }

    // OCUPAÇÃO POR TURNO
    let ocupacaoPorTurno = [];
    
    try {
      const turnoQuery = `
        SELECT 
          CASE 
            WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 6 AND 12 THEN 'Manhã'
            WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 13 AND 18 THEN 'Tarde'
            ELSE 'Noite'
          END as turno,
          COUNT(DISTINCT n_sala || '|' || tipo_sala) as salas_ocupadas,
          (SELECT COUNT(*) FROM public."SALAS" WHERE ativo = true) as total_salas
        FROM (
          SELECT n_sala, tipo_sala, data_hora FROM public."CONSULTA"
          WHERE data_hora >= NOW() - INTERVAL '7 days'
          UNION ALL
          SELECT n_sala, tipo_sala, data_hora FROM public."CIRURGIA"
          WHERE data_hora >= NOW() - INTERVAL '7 days'
        ) as todas_salas
        GROUP BY 
          CASE 
            WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 6 AND 12 THEN 'Manhã'
            WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 13 AND 18 THEN 'Tarde'
            ELSE 'Noite'
          END
        ORDER BY 
          CASE 
            WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 6 AND 12 THEN 1
            WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 13 AND 18 THEN 2
            ELSE 3
          END
      `;

      const turnoResult = await pool.query(turnoQuery);
      
      const cores = ['#3b82f6', '#f59e0b', '#6b7280'];
      
      ocupacaoPorTurno = turnoResult.rows.map((row, index) => {
        const salasOcupadas = parseInt(row.salas_ocupadas) || 0;
        const totalSalas = parseInt(row.total_salas) || 1;
        const percentual = Math.round((salasOcupadas / totalSalas) * 100);
        
        return {
          turno: row.turno || `Turno ${index + 1}`,
          percentual: percentual,
          cor: cores[index] || '#6b7280'
        };
      });
    } catch (error) {
      console.error('Erro ao calcular ocupação por turno:', error.message);
      ocupacaoPorTurno = [];
    }

    // EVOLUÇÃO DA OCUPAÇÃO
    let evolucaoOcupacao = [];
    
    try {
      let evolucaoQuery;
      
      if (periodo === 'ano') {
        evolucaoQuery = `
          SELECT 
            TO_CHAR(data_hora, 'Mon') as mes,
            COUNT(DISTINCT n_sala || '|' || tipo_sala) as salas_ocupadas,
            (SELECT COUNT(*) FROM public."SALAS" WHERE ativo = true) as total_salas
          FROM (
            SELECT n_sala, tipo_sala, data_hora FROM public."CONSULTA"
            WHERE data_hora >= DATE_TRUNC('year', NOW())
            UNION ALL
            SELECT n_sala, tipo_sala, data_hora FROM public."CIRURGIA"
            WHERE data_hora >= DATE_TRUNC('year', NOW())
          ) as todas_salas
          GROUP BY TO_CHAR(data_hora, 'Mon'), EXTRACT(MONTH FROM data_hora)
          ORDER BY EXTRACT(MONTH FROM data_hora)
        `;
      } else if (periodo === 'mes') {
        evolucaoQuery = `
          SELECT 
            'Sem ' || (EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', data_hora)) + 1) as semana,
            COUNT(DISTINCT n_sala || '|' || tipo_sala) as salas_ocupadas,
            (SELECT COUNT(*) FROM public."SALAS" WHERE ativo = true) as total_salas
          FROM (
            SELECT n_sala, tipo_sala, data_hora FROM public."CONSULTA"
            WHERE data_hora >= DATE_TRUNC('month', NOW())
            UNION ALL
            SELECT n_sala, tipo_sala, data_hora FROM public."CIRURGIA"
            WHERE data_hora >= DATE_TRUNC('month', NOW())
          ) as todas_salas
          GROUP BY EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', data_hora)) + 1
          ORDER BY EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', data_hora)) + 1
        `;
      } else {
        evolucaoQuery = `
          SELECT 
            TO_CHAR(data_hora, 'Dy') as dia,
            COUNT(DISTINCT n_sala || '|' || tipo_sala) as salas_ocupadas,
            (SELECT COUNT(*) FROM public."SALAS" WHERE ativo = true) as total_salas
          FROM (
            SELECT n_sala, tipo_sala, data_hora FROM public."CONSULTA"
            WHERE data_hora >= DATE_TRUNC('week', NOW())
            UNION ALL
            SELECT n_sala, tipo_sala, data_hora FROM public."CIRURGIA"
            WHERE data_hora >= DATE_TRUNC('week', NOW())
          ) as todas_salas
          GROUP BY TO_CHAR(data_hora, 'Dy'), EXTRACT(DOW FROM data_hora)
          ORDER BY EXTRACT(DOW FROM data_hora)
        `;
      }

      const evolucaoResult = await pool.query(evolucaoQuery);
      
      evolucaoOcupacao = evolucaoResult.rows.map(row => {
        const salasOcupadas = parseInt(row.salas_ocupadas) || 0;
        const totalSalas = parseInt(row.total_salas) || 1;
        const ocupacao = Math.round((salasOcupadas / totalSalas) * 100);
        
        return {
          periodo: periodo === 'ano' ? row.mes : 
                  periodo === 'mes' ? row.semana : 
                  row.dia,
          ocupacao: ocupacao
        };
      });
    } catch (error) {
      console.error('Erro ao buscar evolução da ocupação:', error.message);
      evolucaoOcupacao = [];
    }

    // RESPOSTA FINAL
    const dados = {
      metricas,
      detalhamentoEspecialidades,
      salasCirurgia,
      ocupacaoPorTurno,
      evolucaoOcupacao
    };

    console.log('Enviando resposta com dados reais de salas:', {
      metricas: {
        consultorios: metricas.consultorios.ocupacao,
        cirurgia: metricas.cirurgia.ocupacao,
        total: metricas.total.ocupacao
      },
      especialidades: detalhamentoEspecialidades.length,
      salasCirurgia: salasCirurgia.length,
      turnos: ocupacaoPorTurno.length
    });
    
    res.json(dados);
    
  } catch (error) {
    console.error('Erro ao buscar dados de salas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const exportSalas = async (req, res) => {
  try {
    const { formato, periodo, tipoSala } = req.query;
    
    console.log('Exportando dados de salas:', { formato, periodo, tipoSala });
    
    // Chama a função principal para obter dados reais
    const mockReq = {
      query: { periodo, tipoSala }
    };
    
    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
        return mockRes;
      },
      status: () => mockRes
    };
    
    await ocupacaoSalas(mockReq, mockRes);
    
    if (formato === 'json') {
      res.json(responseData);
    } else if (formato === 'excel' || formato === 'pdf') {
      // O frontend gera o PDF/Excel
      res.json(responseData);
    } else {
      res.status(400).json({ error: 'Formato inválido' });
    }
    
  } catch (error) {
    console.error('Erro ao exportar dados de salas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};