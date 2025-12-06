import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

class ExportCirurgiasService {
  static async exportData(format, dadosAtuais, periodo, tipoCirurgia, especialidade) {
    console.log('🔄 Exportando atividade cirúrgica:', format);
    console.log('📊 Dados recebidos:', {
      metricas: dadosAtuais.metricas,
      especialidadesCount: dadosAtuais.cirurgiasPorEspecialidade?.length || 0,
      cirurgioesCount: dadosAtuais.topCirurgioes?.length || 0,
      proximasCirurgiasCount: dadosAtuais.proximasCirurgias?.length || 0
    });

    // Preparar dados para exportação
    const data = {
      periodo: periodo || 'mes',
      tipoCirurgia: tipoCirurgia === 'todas' ? 'Todas' : tipoCirurgia,
      especialidade: especialidade === 'todas' ? 'Todas' : especialidade,
      metricas: {
        totalCirurgias: dadosAtuais.metricas?.totalCirurgias || 0,
        taxaAprovacao: dadosAtuais.metricas?.taxaAprovacao || 0,
        tempoMedio: dadosAtuais.metricas?.tempoMedio || 0,
        taxaOcupacao: dadosAtuais.metricas?.taxaOcupacao || 0,
        taxaCancelamento: dadosAtuais.metricas?.taxaCancelamento || 0,
        tempoPreparacao: dadosAtuais.metricas?.tempoPreparacao || 0,
        cirurgiasEmergencia: dadosAtuais.metricas?.cirurgiasEmergencia || 0,
        percentualEmergencia: dadosAtuais.metricas?.percentualEmergencia || 0,
        reintervencoes: dadosAtuais.metricas?.reintervencoes || 0,
        percentualReintervencoes: dadosAtuais.metricas?.percentualReintervencoes || 0
      },
      cirurgiasPorEspecialidade: dadosAtuais.cirurgiasPorEspecialidade || [],
      topCirurgioes: dadosAtuais.topCirurgioes || [],
      proximasCirurgias: dadosAtuais.proximasCirurgias || [],
      evolucaoMensal: dadosAtuais.evolucaoMensal || [],
      distribuicaoTipo: dadosAtuais.metricas?.distribuicaoTipo || []
    };

    console.log('📦 Dados preparados para exportação:', {
      periodo: data.periodo,
      tipoCirurgia: data.tipoCirurgia,
      especialidade: data.especialidade,
      totalCirurgias: data.metricas.totalCirurgias,
      especialidades: data.cirurgiasPorEspecialidade.length,
      cirurgioes: data.topCirurgioes.length
    });

    const fileName = `atividade_cirurgica_${periodo}`;
    
    if (format === 'pdf') {
      return await this.exportToPdf(data, fileName);
    } else if (format === 'excel') {
      return this.exportToExcel(data, fileName);
    } else {
      throw new Error(`Formato não suportado: ${format}`);
    }
  }

  static async exportToPdf(data, fileName = 'relatorio_cirurgias') {
    try {
      console.log('📄 Criando PDF de atividade cirúrgica...');
      
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
      doc.setTextColor(41, 128, 185);
      doc.text('RELATÓRIO DE ATIVIDADE CIRÚRGICA', pageWidth / 2, yPos, { align: 'center' });
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
      
      doc.text(`Período: ${periodoTexto} | Tipo de Cirurgia: ${data.tipoCirurgia} | Especialidade: ${data.especialidade}`, 
               pageWidth / 2, yPos, { align: 'center' });
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
      
      // Total de Cirurgias
      doc.text(`• Total de Cirurgias: ${data.metricas.totalCirurgias} procedimentos`, margin + 5, yPos);
      yPos += 6;
      
      // Taxa de Aprovação
      doc.text(`• Taxa de Aprovação: ${data.metricas.taxaAprovacao}%`, margin + 5, yPos);
      yPos += 6;
      
      // Tempo Médio
      doc.text(`• Tempo Médio por Cirurgia: ${data.metricas.tempoMedio} minutos`, margin + 5, yPos);
      yPos += 6;
      
      // Taxa de Ocupação
      doc.text(`• Taxa de Ocupação das Salas: ${data.metricas.taxaOcupacao}%`, margin + 5, yPos);
      yPos += 6;
      
      // Cirurgias de Emergência
      doc.text(`• Cirurgias de Emergência: ${data.metricas.cirurgiasEmergencia} (${data.metricas.percentualEmergencia}%)`, margin + 5, yPos);
      yPos += 10;

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
        head: [['Indicador', 'Valor', 'Status']],
        body: [
          ['Total de Cirurgias', `${data.metricas.totalCirurgias}`, this.getStatusCirurgias(data.metricas.totalCirurgias)],
          ['Taxa de Aprovação', `${data.metricas.taxaAprovacao}%`, this.getStatusTaxa(data.metricas.taxaAprovacao)],
          ['Tempo Médio', `${data.metricas.tempoMedio} min`, this.getStatusTempo(data.metricas.tempoMedio)],
          ['Taxa de Ocupação', `${data.metricas.taxaOcupacao}%`, this.getStatusTaxa(data.metricas.taxaOcupacao)],
          ['Taxa Cancelamento', `${data.metricas.taxaCancelamento}%`, this.getStatusCancelamento(data.metricas.taxaCancelamento)],
          ['Cirurgias Emergência', `${data.metricas.cirurgiasEmergencia}`, this.getStatusEmergencia(data.metricas.percentualEmergencia)],
          ['Reintervenções', `${data.metricas.reintervencoes}`, this.getStatusReintervencoes(data.metricas.percentualReintervencoes)]
        ]
      };

      autoTable(doc, {
        startY: yPos,
        head: metricasTableData.head,
        body: metricasTableData.body,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [41, 128, 185],
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
          0: { cellWidth: 70 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // DISTRIBUIÇÃO POR TIPO DE CIRURGIA
      if (data.distribuicaoTipo && data.distribuicaoTipo.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DISTRIBUIÇÃO POR TIPO DE CIRURGIA', margin, yPos);
        yPos += 10;
        
        const tipoData = {
          head: [['Tipo', 'Quantidade', 'Percentual (%)', 'Status']],
          body: data.distribuicaoTipo.map(item => {
            let status = 'Normal';
            if (item.tipo === 'Emergência' && item.percentual > 30) status = 'Alto';
            else if (item.tipo === 'Emergência' && item.percentual > 20) status = 'Moderado';
            
            return [
              item.tipo || 'Não especificado',
              item.quantidade?.toString() || '0',
              `${item.percentual || 0}%`,
              status
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: tipoData.head,
          body: tipoData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [219, 39, 119],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // CIRURGIAS POR ESPECIALIDADE
      if (data.cirurgiasPorEspecialidade && data.cirurgiasPorEspecialidade.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CIRURGIAS POR ESPECIALIDADE', margin, yPos);
        yPos += 10;
        
        const especialidadeData = {
          head: [['Especialidade', 'Total', 'Eletivas', 'Emergência', 'Tempo Médio (min)', 'Taxa Sucesso (%)']],
          body: data.cirurgiasPorEspecialidade.map(item => {
            return [
              item.especialidade || 'Não especificada',
              item.totalCirurgias?.toString() || '0',
              item.eletivas?.toString() || '0',
              item.emergencia?.toString() || '0',
              item.tempoMedio?.toString() || '0',
              item.taxaSucesso?.toString() || '0'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: especialidadeData.head,
          body: especialidadeData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [106, 17, 203],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // TOP CIRURGIÕES
      if (data.topCirurgioes && data.topCirurgioes.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOP CIRURGIÕES', margin, yPos);
        yPos += 10;
        
        const cirurgioesData = {
          head: [['Nome', 'Especialidade', 'Total Cirurgias', 'Tempo Médio (min)', 'Taxa Sucesso (%)', 'Disponível']],
          body: data.topCirurgioes.map(item => {
            return [
              item.nome || 'Não identificado',
              item.especialidade || 'Não especificada',
              item.totalCirurgias?.toString() || '0',
              item.tempoMedio?.toString() || '0',
              `${item.taxaSucesso || 0}%`,
              item.disponivel ? 'Sim' : 'Não'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: cirurgioesData.head,
          body: cirurgioesData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [220, 53, 69],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // PRÓXIMAS CIRURGIAS
      if (data.proximasCirurgias && data.proximasCirurgias.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PRÓXIMAS CIRURGIAS AGENDADAS', margin, yPos);
        yPos += 10;
        
        const proximasData = {
          head: [['Data/Hora', 'Paciente', 'Procedimento', 'Cirurgião', 'Sala', 'Status']],
          body: data.proximasCirurgias.map(item => {
            const dataHora = item.data_hora ? new Date(item.data_hora).toLocaleString('pt-BR') : 'N/A';
            return [
              dataHora,
              item.paciente_nome || 'Não identificado',
              item.procedimento || 'Procedimento Cirúrgico',
              item.cirurgiao_nome || 'Cirurgião não identificado',
              item.n_sala ? `Sala ${item.n_sala}` : 'N/A',
              item.status === 'confirmada' ? 'Confirmada' : 'Agendada'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: proximasData.head,
          body: proximasData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [40, 167, 69],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
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
        doc.text('EVOLUÇÃO MENSAL', margin, yPos);
        yPos += 10;
        
        const evolucaoData = {
          head: [['Mês', 'Cirurgias', 'Status', 'Tendência']],
          body: data.evolucaoMensal.map((item, index) => {
            let tendencia = 'Estável';
            let status = 'Normal';
            
            if (index > 0) {
              const anterior = data.evolucaoMensal[index - 1].cirurgias || 0;
              if (item.cirurgias > anterior + 10) tendencia = 'Crescimento';
              else if (item.cirurgias < anterior - 10) tendencia = 'Queda';
            }
            
            if (item.cirurgias > 80) status = 'Alto';
            else if (item.cirurgias > 60) status = 'Moderado';
            
            return [
              item.mes || `Mês ${index + 1}`,
              item.cirurgias?.toString() || '0',
              status,
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
            fillColor: [52, 58, 64],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
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
      if (data.metricas.taxaAprovacao >= 95) {
        doc.text('• ALTA TAXA DE APROVAÇÃO (>95%) - Excelente desempenho', margin, obsY);
        obsY += 6;
        doc.text('  - Manter padrões de qualidade', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Compartilhar melhores práticas entre equipes', margin + 5, obsY);
        obsY += 8;
      } else if (data.metricas.taxaAprovacao < 80) {
        doc.text('• TAXA DE APROVAÇÃO BAIXA (<80%) - Necessidade de análise', margin, obsY);
        obsY += 6;
        doc.text('  - Revisar critérios de aprovação', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Avaliar necessidade de treinamento', margin + 5, obsY);
        obsY += 8;
      }
      
      if (data.metricas.percentualEmergencia > 30) {
        doc.text('• ALTA TAXA DE CIRURGIAS DE EMERGÊNCIA (>30%)', margin, obsY);
        obsY += 6;
        doc.text('  - Avaliar capacidade de resposta a emergências', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Planejar reserva de recursos para emergências', margin + 5, obsY);
        obsY += 8;
      }
      
      if (data.metricas.tempoMedio > 180) {
        doc.text('• TEMPO MÉDIO DE CIRURGIA ELEVADO (>3h)', margin, obsY);
        obsY += 6;
        doc.text('  - Otimizar processos pré e pós-operatórios', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Avaliar eficiência das equipes cirúrgicas', margin + 5, obsY);
        obsY += 8;
      }
      
      // Recomendações gerais
      doc.text('• RECOMENDAÇÕES GERAIS:', margin, obsY);
      obsY += 6;
      doc.text('  - Monitorar continuamente a taxa de reintervenções', margin + 5, obsY);
      obsY += 6;
      doc.text('  - Manter equilíbrio entre cirurgias eletivas e emergência', margin + 5, obsY);
      obsY += 6;
      doc.text('  - Otimizar uso das salas de cirurgia', margin + 5, obsY);
      
      // RODAPÉ EM TODAS AS PÁGINAS
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Texto à esquerda
        doc.text('Sistema Hospitalar - Relatório Gerencial', margin, doc.internal.pageSize.getHeight() - 10);
        
        // Número da página no centro
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Data à direita
        doc.text(dataGeracao, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      // Salvar arquivo
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(finalFileName);
      
      console.log('✅ PDF de atividade cirúrgica salvo com sucesso!');
      console.log('📄 Nome do arquivo:', finalFileName);
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF de atividade cirúrgica:', error);
      throw error;
    }
  }

  static exportToExcel(data, fileName = 'relatorio_cirurgias') {
    console.log('📊 Criando Excel de atividade cirúrgica...');
    
    try {
      // Criar um novo workbook
      const wb = XLSX.utils.book_new();
      
      // CAPA DO RELATÓRIO
      const cabecalho = [
        ['RELATÓRIO DE ATIVIDADE CIRÚRGICA'],
        [''],
        ['Período:', data.periodo === 'semana' ? 'Última Semana' : 
                     data.periodo === 'mes' ? 'Último Mês' :
                     data.periodo === 'trimestre' ? 'Último Trimestre' : 
                     data.periodo === 'ano' ? 'Último Ano' : data.periodo],
        ['Tipo de Cirurgia:', data.tipoCirurgia || 'Todas'],
        ['Especialidade:', data.especialidade || 'Todas'],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['RESUMO EXECUTIVO'],
        [''],
        ['Total de Cirurgias:', `${data.metricas.totalCirurgias || 0} procedimentos`],
        ['Taxa de Aprovação:', `${data.metricas.taxaAprovacao || 0}%`],
        ['Tempo Médio por Cirurgia:', `${data.metricas.tempoMedio || 0} minutos`],
        ['Taxa de Ocupação das Salas:', `${data.metricas.taxaOcupacao || 0}%`],
        ['Cirurgias de Emergência:', `${data.metricas.cirurgiasEmergencia || 0} (${data.metricas.percentualEmergencia || 0}%)`],
        ['Taxa de Cancelamento:', `${data.metricas.taxaCancelamento || 0}%`],
        ['Reintervenções:', `${data.metricas.reintervencoes || 0} (${data.metricas.percentualReintervencoes || 0}%)`],
        [''],
        ['']
      ];
      
      const wsCapa = XLSX.utils.aoa_to_sheet(cabecalho);
      
      // Estilizar a capa (largura das colunas)
      wsCapa['!cols'] = [
        { wch: 25 },
        { wch: 40 }
      ];
      
      // Mesclar células do título
      wsCapa['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsCapa, "Capa");
      
      // MÉTRICAS DETALHADAS
      const metricasData = [
        ['MÉTRICAS DETALHADAS'],
        [''],
        ['Indicador', 'Valor', 'Status'],
        ['Total de Cirurgias', data.metricas.totalCirurgias, this.getStatusCirurgias(data.metricas.totalCirurgias)],
        ['Taxa de Aprovação', `${data.metricas.taxaAprovacao}%`, this.getStatusTaxa(data.metricas.taxaAprovacao)],
        ['Tempo Médio', `${data.metricas.tempoMedio} min`, this.getStatusTempo(data.metricas.tempoMedio)],
        ['Taxa de Ocupação', `${data.metricas.taxaOcupacao}%`, this.getStatusTaxa(data.metricas.taxaOcupacao)],
        ['Taxa de Cancelamento', `${data.metricas.taxaCancelamento}%`, this.getStatusCancelamento(data.metricas.taxaCancelamento)],
        ['Cirurgias de Emergência', data.metricas.cirurgiasEmergencia, this.getStatusEmergencia(data.metricas.percentualEmergencia)],
        ['Reintervenções', data.metricas.reintervencoes, this.getStatusReintervencoes(data.metricas.percentualReintervencoes)],
        ['Tempo de Preparação', `${data.metricas.tempoPreparacao} min`, 'Normal']
      ];
      
      const wsMetricas = XLSX.utils.aoa_to_sheet(metricasData);
      wsMetricas['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 }
      ];
      
      wsMetricas['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsMetricas, "Métricas");
      
      // DISTRIBUIÇÃO POR TIPO DE CIRURGIA
      if (data.distribuicaoTipo && data.distribuicaoTipo.length > 0) {
        const tipoData = [
          ['DISTRIBUIÇÃO POR TIPO DE CIRURGIA'],
          [''],
          ['Tipo', 'Quantidade', 'Percentual (%)', 'Status'],
        ];
        
        data.distribuicaoTipo.forEach(item => {
          let status = 'Normal';
          if (item.tipo === 'Emergência' && item.percentual > 30) status = 'Alto';
          else if (item.tipo === 'Emergência' && item.percentual > 20) status = 'Moderado';
          
          tipoData.push([
            item.tipo,
            item.quantidade || 0,
            item.percentual || 0,
            status
          ]);
        });
        
        const wsTipo = XLSX.utils.aoa_to_sheet(tipoData);
        wsTipo['!cols'] = [
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 }
        ];
        
        wsTipo['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsTipo, "Tipos");
      }
      
      // CIRURGIAS POR ESPECIALIDADE
      if (data.cirurgiasPorEspecialidade && data.cirurgiasPorEspecialidade.length > 0) {
        const especialidadeData = [
          ['CIRURGIAS POR ESPECIALIDADE'],
          [''],
          ['Especialidade', 'Total', 'Eletivas', 'Emergência', 'Tempo Médio (min)', 'Taxa Sucesso (%)'],
        ];
        
        data.cirurgiasPorEspecialidade.forEach(item => {
          especialidadeData.push([
            item.especialidade || 'Não especificada',
            item.totalCirurgias || 0,
            item.eletivas || 0,
            item.emergencia || 0,
            item.tempoMedio || 0,
            item.taxaSucesso || 0
          ]);
        });
        
        const wsEspecialidade = XLSX.utils.aoa_to_sheet(especialidadeData);
        wsEspecialidade['!cols'] = [
          { wch: 25 },
          { wch: 10 },
          { wch: 10 },
          { wch: 12 },
          { wch: 15 },
          { wch: 15 }
        ];
        
        wsEspecialidade['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEspecialidade, "Especialidades");
      }
      
      // TOP CIRURGIÕES
      if (data.topCirurgioes && data.topCirurgioes.length > 0) {
        const cirurgioesData = [
          ['TOP CIRURGIÕES'],
          [''],
          ['Nome', 'Especialidade', 'Total Cirurgias', 'Tempo Médio (min)', 'Taxa Sucesso (%)', 'Disponível'],
        ];
        
        data.topCirurgioes.forEach(item => {
          cirurgioesData.push([
            item.nome || 'Não identificado',
            item.especialidade || 'Não especificada',
            item.totalCirurgias || 0,
            item.tempoMedio || 0,
            item.taxaSucesso || 0,
            item.disponivel ? 'Sim' : 'Não'
          ]);
        });
        
        const wsCirurgioes = XLSX.utils.aoa_to_sheet(cirurgioesData);
        wsCirurgioes['!cols'] = [
          { wch: 25 },
          { wch: 20 },
          { wch: 12 },
          { wch: 15 },
          { wch: 15 },
          { wch: 12 }
        ];
        
        wsCirurgioes['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsCirurgioes, "Cirurgiões");
      }
      
      // PRÓXIMAS CIRURGIAS
      if (data.proximasCirurgias && data.proximasCirurgias.length > 0) {
        const proximasData = [
          ['PRÓXIMAS CIRURGIAS AGENDADAS'],
          [''],
          ['Data/Hora', 'Paciente', 'Procedimento', 'Cirurgião', 'Sala', 'Status'],
        ];
        
        data.proximasCirurgias.forEach(item => {
          const dataHora = item.data_hora ? new Date(item.data_hora).toLocaleString('pt-BR') : 'N/A';
          proximasData.push([
            dataHora,
            item.paciente_nome || 'Não identificado',
            item.procedimento || 'Procedimento Cirúrgico',
            item.cirurgiao_nome || 'Cirurgião não identificado',
            item.n_sala || 'N/A',
            item.status === 'confirmada' ? 'Confirmada' : 'Agendada'
          ]);
        });
        
        const wsProximas = XLSX.utils.aoa_to_sheet(proximasData);
        wsProximas['!cols'] = [
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 10 },
          { wch: 15 }
        ];
        
        wsProximas['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsProximas, "Próximas");
      }
      
      // EVOLUÇÃO MENSAL
      if (data.evolucaoMensal && data.evolucaoMensal.length > 0) {
        const evolucaoData = [
          ['EVOLUÇÃO MENSAL'],
          [''],
          ['Mês', 'Cirurgias', 'Status', 'Tendência'],
        ];
        
        data.evolucaoMensal.forEach((item, index) => {
          let tendencia = 'Estável';
          let status = 'Normal';
          
          if (index > 0) {
            const anterior = data.evolucaoMensal[index - 1].cirurgias || 0;
            if (item.cirurgias > anterior + 10) tendencia = 'Crescimento';
            else if (item.cirurgias < anterior - 10) tendencia = 'Queda';
          }
          
          if (item.cirurgias > 80) status = 'Alto';
          else if (item.cirurgias > 60) status = 'Moderado';
          
          evolucaoData.push([
            item.mes || `Mês ${index + 1}`,
            item.cirurgias || 0,
            status,
            tendencia
          ]);
        });
        
        const wsEvolucao = XLSX.utils.aoa_to_sheet(evolucaoData);
        wsEvolucao['!cols'] = [
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 }
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
      
      if (data.metricas.taxaAprovacao >= 95) {
        observacoesData.push(['• ALTA TAXA DE APROVAÇÃO (>95%) - Excelente desempenho']);
        observacoesData.push(['  - Manter padrões de qualidade']);
        observacoesData.push(['  - Compartilhar melhores práticas entre equipes']);
        observacoesData.push(['']);
      } else if (data.metricas.taxaAprovacao < 80) {
        observacoesData.push(['• TAXA DE APROVAÇÃO BAIXA (<80%) - Necessidade de análise']);
        observacoesData.push(['  - Revisar critérios de aprovação']);
        observacoesData.push(['  - Avaliar necessidade de treinamento']);
        observacoesData.push(['']);
      }
      
      if (data.metricas.percentualEmergencia > 30) {
        observacoesData.push(['• ALTA TAXA DE CIRURGIAS DE EMERGÊNCIA (>30%)']);
        observacoesData.push(['  - Avaliar capacidade de resposta a emergências']);
        observacoesData.push(['  - Planejar reserva de recursos para emergências']);
        observacoesData.push(['']);
      }
      
      if (data.metricas.tempoMedio > 180) {
        observacoesData.push(['• TEMPO MÉDIO DE CIRURGIA ELEVADO (>3h)']);
        observacoesData.push(['  - Otimizar processos pré e pós-operatórios']);
        observacoesData.push(['  - Avaliar eficiência das equipes cirúrgicas']);
        observacoesData.push(['']);
      }
      
      observacoesData.push(['• RECOMENDAÇÕES GERAIS:']);
      observacoesData.push(['  - Monitorar continuamente a taxa de reintervenções']);
      observacoesData.push(['  - Manter equilíbrio entre cirurgias eletivas e emergência']);
      observacoesData.push(['  - Otimizar uso das salas de cirurgia']);
      
      const wsObservacoes = XLSX.utils.aoa_to_sheet(observacoesData);
      wsObservacoes['!cols'] = [{ wch: 80 }];
      
      wsObservacoes['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsObservacoes, "Observações");
      
      // GERAR E SALVAR ARQUIVO
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Gerar arquivo XLSX
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
  static getStatusCirurgias(total) {
    if (total > 100) return 'Alto volume';
    if (total > 60) return 'Moderado';
    if (total > 30) return 'Normal';
    return 'Baixo volume';
  }

  static getStatusTaxa(percentual) {
    if (percentual >= 95) return 'Excelente';
    if (percentual >= 85) return 'Bom';
    if (percentual >= 75) return 'Regular';
    return 'Necessita melhoria';
  }

  static getStatusTempo(minutos) {
    if (minutos > 180) return 'Longo';
    if (minutos > 120) return 'Moderado';
    if (minutos > 60) return 'Normal';
    return 'Rápido';
  }

  static getStatusCancelamento(percentual) {
    if (percentual > 10) return 'Alto';
    if (percentual > 5) return 'Moderado';
    if (percentual > 2) return 'Normal';
    return 'Baixo';
  }

  static getStatusEmergencia(percentual) {
    if (percentual > 30) return 'Alto';
    if (percentual > 20) return 'Moderado';
    if (percentual > 10) return 'Normal';
    return 'Baixo';
  }

  static getStatusReintervencoes(percentual) {
    if (percentual > 10) return 'Preocupante';
    if (percentual > 5) return 'Atenção';
    if (percentual > 2) return 'Normal';
    return 'Baixo';
  }
}

export { ExportCirurgiasService };
export default ExportCirurgiasService;