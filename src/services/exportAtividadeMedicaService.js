import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; 

class ExportAtividadeMedicaService {
  static async exportData(format, dadosAtuais, periodo, especialidade) {
    console.log('🔄 Exportando atividade médica:', format);
    console.log('📊 Dados recebidos:', {
      metricas: dadosAtuais.metricas,
      especialidadesCount: dadosAtuais.especialidades?.length || 0,
      topMedicosCount: dadosAtuais.topMedicos?.length || 0
    });
    
    // Preparar dados para exportação
    const data = {
      periodo: periodo || 'mes',
      especialidade: especialidade === 'todas' ? 'Todas' : especialidade,
      metricas: {
        totalConsultas: dadosAtuais.metricas?.totalConsultas || 0,
        tempoMedio: dadosAtuais.metricas?.tempoMedio || 0,
        taxaComparecimento: dadosAtuais.metricas?.taxaComparecimento || 0,
        medicosAtivos: dadosAtuais.metricas?.medicosAtivos || 0,
        horarioPico: dadosAtuais.metricas?.horarioPico || '09:00-11:00',
        periodoPico: dadosAtuais.metricas?.periodoPico || 'Manhã',
        taxaRemarcacao: dadosAtuais.metricas?.taxaRemarcacao || 12.5,
        consultasRetorno: dadosAtuais.metricas?.consultasRetorno || 45,
        novosPacientes: dadosAtuais.metricas?.novosPacientes || 156
      },
      especialidades: dadosAtuais.especialidades || [],
      topMedicos: dadosAtuais.topMedicos || [],
      evolucaoMensal: dadosAtuais.evolucaoMensal || []
    };

    console.log('📦 Dados preparados para exportação:', {
      periodo: data.periodo,
      especialidade: data.especialidade,
      totalConsultas: data.metricas.totalConsultas,
      especialidades: data.especialidades.length,
      topMedicos: data.topMedicos.length
    });

    const fileName = `atividade_medica_${periodo}_${especialidade}`;
    
    if (format === 'pdf') {
      return await this.exportToPdf(data, fileName);
    } else if (format === 'excel') {
      return this.exportToExcel(data, fileName);
    } else {
      throw new Error(`Formato não suportado: ${format}`);
    }
  }

  static async exportToPdf(data, fileName = 'relatorio_atividade_medica') {
    try {
      console.log('📄 Criando PDF de atividade médica...');
      
      // Criar documento
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = margin;

      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185); // Azul escuro
      doc.text('RELATÓRIO DE ATIVIDADE MÉDICA', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const periodoTexto = {
        semana: 'Última Semana',
        mes: 'Último Mês',
        trimestre: 'Último Trimestre',
        ano: 'Último Ano'
      }[data.periodo] || data.periodo;
      
      doc.text(`Período: ${periodoTexto} | Especialidade: ${data.especialidade}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Data de geração
      const dataGeracao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${dataGeracao}`, margin, yPos);
      yPos += 15;

      // RESUMO EXECUTIVO
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO EXECUTIVO', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Total de Consultas
      doc.text(`• Total de Consultas: ${data.metricas.totalConsultas || 0} consultas`, margin + 5, yPos);
      yPos += 6;
      
      // Tempo Médio
      const tempoMedio = data.metricas.tempoMedio || 0;
      doc.text(`• Tempo Médio por Consulta: ${tempoMedio} minutos`, margin + 5, yPos);
      yPos += 6;
      
      // Taxa de Comparecimento
      doc.text(`• Taxa de Comparecimento: ${data.metricas.taxaComparecimento || 0}%`, margin + 5, yPos);
      yPos += 6;
      
      // Médicos Ativos
      doc.text(`• Médicos Ativos: ${data.metricas.medicosAtivos || 0} médicos`, margin + 5, yPos);
      yPos += 6;
      
      // Horário Pico
      doc.text(`• Horário de Pico: ${data.metricas.horarioPico} (${data.metricas.periodoPico})`, margin + 5, yPos);
      yPos += 15;

      // MÉTRICAS DETALHADAS
      if (yPos > 200) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTRICAS DETALHADAS', margin, yPos);
      yPos += 10;
      
      // Tabela de métricas
      const metricasTableData = {
        head: [['Indicador', 'Valor', 'Unidade', 'Status']],
        body: [
          [
            'Total de Consultas',
            data.metricas.totalConsultas?.toString() || '0',
            'consultas',
            this.getStatusVolume(data.metricas.totalConsultas)
          ],
          [
            'Tempo Médio por Consulta',
            `${tempoMedio.toFixed(1)}`,
            'minutos',
            this.getStatusTempo(tempoMedio)
          ],
          [
            'Taxa de Comparecimento',
            `${data.metricas.taxaComparecimento?.toFixed(1) || 0}%`,
            'percentual',
            this.getStatusPercentual(data.metricas.taxaComparecimento)
          ],
          [
            'Médicos Ativos',
            data.metricas.medicosAtivos?.toString() || '0',
            'médicos',
            'Ativo'
          ],
          [
            'Taxa de Remarcação',
            `${data.metricas.taxaRemarcacao?.toFixed(1) || 0}%`,
            'percentual',
            this.getStatusPercentualInvertido(data.metricas.taxaRemarcacao)
          ],
          [
            'Consultas de Retorno',
            data.metricas.consultasRetorno?.toString() || '0',
            'consultas',
            'Normal'
          ],
          [
            'Novos Pacientes',
            data.metricas.novosPacientes?.toString() || '0',
            'pacientes',
            this.getStatusVolume(data.metricas.novosPacientes)
          ]
        ]
      };

      autoTable(doc, {
        startY: yPos,
        head: metricasTableData.head,
        body: metricasTableData.body,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185], // Azul
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: 0
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 60 }, // Indicador
          1: { cellWidth: 25, halign: 'center' }, // Valor
          2: { cellWidth: 30, halign: 'center' }, // Unidade
          3: { cellWidth: 25, halign: 'center' }  // Status
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // ESPECIALIDADES
      if (data.especialidades && data.especialidades.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DESEMPENHO POR ESPECIALIDADE', margin, yPos);
        yPos += 10;
        
        const especialidadeData = {
          head: [['Especialidade', 'Consultas', 'Tempo Médio (min)', 'Comparecimento (%)', 'Crescimento (%)', 'Status']],
          body: data.especialidades.map(item => {
            const comparecimento = item.taxaComparecimento || 0;
            return [
              item.especialidade || 'Não especificada',
              item.totalConsultas?.toString() || '0',
              `${(item.tempoMedio || 0).toFixed(1)}`,
              `${comparecimento.toFixed(1)}%`,
              `${(item.crescimento || 0).toFixed(1)}%`,
              this.getStatusPercentual(comparecimento)
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: especialidadeData.head,
          body: especialidadeData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [106, 17, 203], // Roxo
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 40 }, // Especialidade
            1: { cellWidth: 20, halign: 'center' }, // Consultas
            2: { cellWidth: 25, halign: 'center' }, // Tempo Médio
            3: { cellWidth: 25, halign: 'center' }, // Comparecimento
            4: { cellWidth: 25, halign: 'center' }, // Crescimento
            5: { cellWidth: 25, halign: 'center' }  // Status
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // TOP MÉDICOS
      if (data.topMedicos && data.topMedicos.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOP MÉDICOS - MAIOR NÚMERO DE CONSULTAS', margin, yPos);
        yPos += 10;
        
        const medicosData = {
          head: [['Nome', 'Especialidade', 'Consultas', 'Tempo Médio (min)', 'Eficiência (%)', 'Disponível']],
          body: data.topMedicos.map(item => {
            return [
              item.nome || 'Não identificado',
              item.especialidade || 'Não especificada',
              item.totalConsultas?.toString() || '0',
              `${(item.tempoMedio || 0).toFixed(1)}`,
              `${(item.eficiencia || 0).toFixed(1)}%`,
              item.disponivel ? 'Sim' : 'Não'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: medicosData.head,
          body: medicosData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [219, 39, 119], // Rosa
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 45 }, // Nome
            1: { cellWidth: 35 }, // Especialidade
            2: { cellWidth: 20, halign: 'center' }, // Consultas
            3: { cellWidth: 25, halign: 'center' }, // Tempo Médio
            4: { cellWidth: 25, halign: 'center' }, // Eficiência
            5: { cellWidth: 20, halign: 'center' }  // Disponível
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // EVOLUÇÃO MENSAL
      if (data.evolucaoMensal && data.evolucaoMensal.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EVOLUÇÃO MENSAL DE CONSULTAS', margin, yPos);
        yPos += 10;
        
        const evolucaoData = {
          head: [['Mês', 'Consultas', 'Variação (%)', 'Tendência']],
          body: data.evolucaoMensal.map((item, index) => {
            let variacao = '0%';
            let tendencia = 'Estável';
            
            if (index > 0) {
              const anterior = data.evolucaoMensal[index - 1].consultas || 0;
              const atual = item.consultas || 0;
              variacao = `${(((atual - anterior) / anterior) * 100).toFixed(1)}%`;
              tendencia = atual > anterior ? 'Crescimento' : atual < anterior ? 'Queda' : 'Estável';
            }
            
            return [
              item.mes || `Mês ${index + 1}`,
              item.consultas?.toString() || '0',
              variacao,
              tendencia
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: evolucaoData.head,
          body: evolucaoData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [40, 167, 69], // Verde
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Mês
            1: { cellWidth: 30, halign: 'center' }, // Consultas
            2: { cellWidth: 30, halign: 'center' }, // Variação
            3: { cellWidth: 40, halign: 'center' }  // Tendência
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // OBSERVAÇÕES E RECOMENDAÇÕES
      if (yPos > 200) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES E RECOMENDAÇÕES', margin, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      let obsY = yPos;
      
      // Análise baseada nos dados
      const taxaComparecimento = data.metricas.taxaComparecimento || 0;
      const taxaRemarcacao = data.metricas.taxaRemarcacao || 0;
      
      if (taxaComparecimento >= 90) {
        doc.text('• EXCELENTE TAXA DE COMPARECIMENTO (>90%)', margin, obsY);
        obsY += 6;
        doc.text('  - Manter estratégias de comunicação com pacientes', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Estabelecer padrões de excelência', margin + 5, obsY);
        obsY += 8;
      } else if (taxaComparecimento >= 80) {
        doc.text('• Boa taxa de comparecimento (80-90%)', margin, obsY);
        obsY += 6;
        doc.text('  - Rever sistema de lembretes de consulta', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Avaliar horários mais convenientes', margin + 5, obsY);
        obsY += 8;
      } else if (taxaComparecimento < 70) {
        doc.text('• TAXA DE COMPARECIMENTO BAIXA (<70%)', margin, obsY);
        obsY += 6;
        doc.text('  - Implementar sistema de confirmação de consultas', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Oferecer horários mais flexíveis', margin + 5, obsY);
        obsY += 8;
      }
      
      if (taxaRemarcacao > 15) {
        doc.text('• TAXA DE REMARCAÇÃO ALTA (>15%)', margin, obsY);
        obsY += 6;
        doc.text('  - Avaliar disponibilidade de horários', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Melhorar comunicação de reagendamento', margin + 5, obsY);
        obsY += 8;
      }
      
      // Recomendações gerais
      doc.text('• RECOMENDAÇÕES GERAIS:', margin, obsY);
      obsY += 6;
      doc.text('  - Monitorar horários de pico para otimização', margin + 5, obsY);
      obsY += 6;
      doc.text(`  - ${data.metricas.medicosAtivos || 0} médicos ativos no período`, margin + 5, obsY);
      obsY += 6;
      doc.text(`  - ${data.metricas.novosPacientes || 0} novos pacientes atendidos`, margin + 5, obsY);
      obsY += 6;
      doc.text('  - Revisar periodicamente tempos médios de consulta', margin + 5, obsY);
      
      // RODAPÉ EM TODAS AS PÁGINAS
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Texto à esquerda
        doc.text('Sistema Hospitalar - Relatório Médico', margin, doc.internal.pageSize.getHeight() - 10);
        
        // Número da página no centro
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Data à direita
        doc.text(dataGeracao, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      // Salvar arquivo
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(finalFileName);
      
      console.log('✅ PDF de atividade médica salvo com sucesso!');
      console.log('📄 Nome do arquivo:', finalFileName);
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF de atividade médica:', error);
      throw error;
    }
  }

  static exportToExcel(data, fileName = 'relatorio_atividade_medica') {
    console.log('📊 Criando Excel de atividade médica...');
    
    try {
      // Criar um novo workbook
      const wb = XLSX.utils.book_new();
      
      // CAPA DO RELATÓRIO
      const cabecalho = [
        ['RELATÓRIO DE ATIVIDADE MÉDICA'],
        [''],
        ['Período:', data.periodo === 'semana' ? 'Última Semana' : 
                     data.periodo === 'mes' ? 'Último Mês' :
                     data.periodo === 'trimestre' ? 'Último Trimestre' : 
                     data.periodo === 'ano' ? 'Último Ano' : data.periodo],
        ['Especialidade:', data.especialidade],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['RESUMO EXECUTIVO'],
        [''],
        ['Total de Consultas:', `${data.metricas.totalConsultas || 0} consultas`],
        ['Tempo Médio por Consulta:', `${data.metricas.tempoMedio || 0} minutos`],
        ['Taxa de Comparecimento:', `${data.metricas.taxaComparecimento || 0}%`],
        ['Médicos Ativos:', `${data.metricas.medicosAtivos || 0} médicos`],
        ['Horário de Pico:', `${data.metricas.horarioPico || 'N/A'} (${data.metricas.periodoPico || 'N/A'})`],
        ['Taxa de Remarcação:', `${data.metricas.taxaRemarcacao || 0}%`],
        ['Consultas de Retorno:', `${data.metricas.consultasRetorno || 0} consultas`],
        ['Novos Pacientes:', `${data.metricas.novosPacientes || 0} pacientes`],
        [''],
        ['']
      ];
      
      const wsCapa = XLSX.utils.aoa_to_sheet(cabecalho);
      
      // Estilizar a capa (largura das colunas)
      wsCapa['!cols'] = [
        { wch: 25 }, // Coluna A
        { wch: 40 }  // Coluna B
      ];
      
      // Mesclar células do título
      wsCapa['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Título
        { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }  // RESUMO EXECUTIVO
      ];
      
      XLSX.utils.book_append_sheet(wb, wsCapa, "Capa");
      
      // MÉTRICAS DETALHADAS
      const metricasData = [
        ['MÉTRICAS DETALHADAS'],
        [''],
        ['Indicador', 'Valor', 'Unidade', 'Status'],
        ['Total de Consultas', data.metricas.totalConsultas || 0, 'consultas', this.getStatusVolume(data.metricas.totalConsultas)],
        ['Tempo Médio por Consulta', data.metricas.tempoMedio || 0, 'minutos', this.getStatusTempo(data.metricas.tempoMedio)],
        ['Taxa de Comparecimento', data.metricas.taxaComparecimento || 0, '%', this.getStatusPercentual(data.metricas.taxaComparecimento)],
        ['Médicos Ativos', data.metricas.medicosAtivos || 0, 'médicos', 'Ativo'],
        ['Taxa de Remarcação', data.metricas.taxaRemarcacao || 0, '%', this.getStatusPercentualInvertido(data.metricas.taxaRemarcacao)],
        ['Consultas de Retorno', data.metricas.consultasRetorno || 0, 'consultas', 'Normal'],
        ['Novos Pacientes', data.metricas.novosPacientes || 0, 'pacientes', this.getStatusVolume(data.metricas.novosPacientes)]
      ];
      
      const wsMetricas = XLSX.utils.aoa_to_sheet(metricasData);
      wsMetricas['!cols'] = [
        { wch: 35 }, // Indicador
        { wch: 15 }, // Valor
        { wch: 15 }, // Unidade
        { wch: 15 }  // Status
      ];
      
      wsMetricas['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsMetricas, "Métricas");
      
      // ESPECIALIDADES
      if (data.especialidades && data.especialidades.length > 0) {
        const especialidadeData = [
          ['DESEMPENHO POR ESPECIALIDADE'],
          [''],
          ['Especialidade', 'Consultas', 'Tempo Médio (min)', 'Comparecimento (%)', 'Crescimento (%)', 'Status'],
        ];
        
        data.especialidades.forEach(item => {
          especialidadeData.push([
            item.especialidade || 'Não especificada',
            item.totalConsultas || 0,
            item.tempoMedio || 0,
            item.taxaComparecimento || 0,
            item.crescimento || 0,
            this.getStatusPercentual(item.taxaComparecimento || 0)
          ]);
        });
        
        const wsEspecialidade = XLSX.utils.aoa_to_sheet(especialidadeData);
        wsEspecialidade['!cols'] = [
          { wch: 30 }, // Especialidade
          { wch: 15 }, // Consultas
          { wch: 20 }, // Tempo Médio
          { wch: 20 }, // Comparecimento
          { wch: 20 }, // Crescimento
          { wch: 15 }  // Status
        ];
        
        wsEspecialidade['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEspecialidade, "Especialidades");
      }
      
      // TOP MÉDICOS
      if (data.topMedicos && data.topMedicos.length > 0) {
        const medicosData = [
          ['TOP MÉDICOS - MAIOR NÚMERO DE CONSULTAS'],
          [''],
          ['Nome', 'Especialidade', 'Consultas', 'Tempo Médio (min)', 'Eficiência (%)', 'Disponível'],
        ];
        
        data.topMedicos.forEach(item => {
          medicosData.push([
            item.nome || 'Não identificado',
            item.especialidade || 'Não especificada',
            item.totalConsultas || 0,
            item.tempoMedio || 0,
            item.eficiencia || 0,
            item.disponivel ? 'Sim' : 'Não'
          ]);
        });
        
        const wsMedicos = XLSX.utils.aoa_to_sheet(medicosData);
        wsMedicos['!cols'] = [
          { wch: 35 }, // Nome
          { wch: 25 }, // Especialidade
          { wch: 15 }, // Consultas
          { wch: 20 }, // Tempo Médio
          { wch: 20 }, // Eficiência
          { wch: 15 }  // Disponível
        ];
        
        wsMedicos['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsMedicos, "Médicos");
      }
      
      // EVOLUÇÃO MENSAL
      if (data.evolucaoMensal && data.evolucaoMensal.length > 0) {
        const evolucaoData = [
          ['EVOLUÇÃO MENSAL DE CONSULTAS'],
          [''],
          ['Mês', 'Consultas', 'Variação (%)', 'Tendência'],
        ];
        
        data.evolucaoMensal.forEach((item, index) => {
          let variacao = '0%';
          let tendencia = 'Estável';
          
          if (index > 0) {
            const anterior = data.evolucaoMensal[index - 1].consultas || 0;
            const atual = item.consultas || 0;
            variacao = `${(((atual - anterior) / anterior) * 100).toFixed(1)}%`;
            tendencia = atual > anterior ? 'Crescimento' : atual < anterior ? 'Queda' : 'Estável';
          }
          
          evolucaoData.push([
            item.mes || `Mês ${index + 1}`,
            item.consultas || 0,
            variacao,
            tendencia
          ]);
        });
        
        const wsEvolucao = XLSX.utils.aoa_to_sheet(evolucaoData);
        wsEvolucao['!cols'] = [
          { wch: 20 }, // Mês
          { wch: 15 }, // Consultas
          { wch: 15 }, // Variação
          { wch: 15 }  // Tendência
        ];
        
        wsEvolucao['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEvolucao, "Evolução");
      }
      
      // OBSERVAÇÕES
      const observacoesData = [
        ['OBSERVAÇÕES E RECOMENDAÇÕES'],
        [''],
      ];
      
      const taxaComparecimento = data.metricas.taxaComparecimento || 0;
      const taxaRemarcacao = data.metricas.taxaRemarcacao || 0;
      
      if (taxaComparecimento >= 90) {
        observacoesData.push(['• EXCELENTE TAXA DE COMPARECIMENTO (>90%)']);
        observacoesData.push(['  - Manter estratégias de comunicação com pacientes']);
        observacoesData.push(['  - Estabelecer padrões de excelência']);
        observacoesData.push(['']);
      } else if (taxaComparecimento >= 80) {
        observacoesData.push(['• Boa taxa de comparecimento (80-90%)']);
        observacoesData.push(['  - Rever sistema de lembretes de consulta']);
        observacoesData.push(['  - Avaliar horários mais convenientes']);
        observacoesData.push(['']);
      } else if (taxaComparecimento < 70) {
        observacoesData.push(['• TAXA DE COMPARECIMENTO BAIXA (<70%)']);
        observacoesData.push(['  - Implementar sistema de confirmação de consultas']);
        observacoesData.push(['  - Oferecer horários mais flexíveis']);
        observacoesData.push(['']);
      }
      
      if (taxaRemarcacao > 15) {
        observacoesData.push(['• TAXA DE REMARCAÇÃO ALTA (>15%)']);
        observacoesData.push(['  - Avaliar disponibilidade de horários']);
        observacoesData.push(['  - Melhorar comunicação de reagendamento']);
        observacoesData.push(['']);
      }
      
      // Recomendações gerais
      observacoesData.push(['• RECOMENDAÇÕES GERAIS:']);
      observacoesData.push(['  - Monitorar horários de pico para otimização']);
      observacoesData.push([`  - ${data.metricas.medicosAtivos || 0} médicos ativos no período`]);
      observacoesData.push([`  - ${data.metricas.novosPacientes || 0} novos pacientes atendidos`]);
      observacoesData.push(['  - Revisar periodicamente tempos médios de consulta']);
      
      const wsObservacoes = XLSX.utils.aoa_to_sheet(observacoesData);
      wsObservacoes['!cols'] = [{ wch: 80 }]; // Coluna única larga
      
      wsObservacoes['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsObservacoes, "Observações");
      
      // GERAR E SALVAR ARQUIVO
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, finalFileName);
      
      console.log('✅ Excel (XLSX) exportado com sucesso!');
      console.log('📊 Nome do arquivo:', finalFileName);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      throw error;
    }
  }

  // Métodos auxiliares para determinar status
  static getStatusVolume(valor) {
    if (!valor) return 'Baixo';
    if (valor >= 1000) return 'Muito Alto';
    if (valor >= 500) return 'Alto';
    if (valor >= 100) return 'Moderado';
    return 'Baixo';
  }

  static getStatusTempo(minutos) {
    if (!minutos) return 'Normal';
    if (minutos >= 60) return 'Longo';
    if (minutos >= 45) return 'Moderado';
    if (minutos >= 30) return 'Normal';
    if (minutos >= 15) return 'Rápido';
    return 'Muito Rápido';
  }

  static getStatusPercentual(valor) {
    if (!valor) return 'Baixo';
    if (valor >= 90) return 'Excelente';
    if (valor >= 80) return 'Bom';
    if (valor >= 70) return 'Regular';
    if (valor >= 60) return 'Aceitável';
    return 'Baixo';
  }

  static getStatusPercentualInvertido(valor) {
    if (!valor) return 'Excelente';
    if (valor >= 20) return 'Alto';
    if (valor >= 15) return 'Moderado';
    if (valor >= 10) return 'Normal';
    if (valor >= 5) return 'Baixo';
    return 'Muito Baixo';
  }
}

export { ExportAtividadeMedicaService };
export default ExportAtividadeMedicaService;
