import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; 

class ExportSalasService {
  static async exportData(format, dadosAtuais, periodo, tipoSala) {
    console.log('🔄 Exportando salas:', format);
    console.log('📊 Dados recebidos:', {
      metricas: dadosAtuais.metricas,
      especialidadesCount: dadosAtuais.detalhamentoEspecialidades?.length || 0,
      salasCirurgiaCount: dadosAtuais.salasCirurgia?.length || 0
    });
    
    // Preparar dados para exportação
    const data = {
      periodo: periodo || 'mes',
      tipoSala: tipoSala === 'todas' ? 'Todas' : tipoSala,
      metricas: {
        consultorios: dadosAtuais.metricas?.consultorios || { ocupadas: 0, total: 0, ocupacao: 0 },
        cirurgia: dadosAtuais.metricas?.cirurgia || { ocupadas: 0, total: 0, ocupacao: 0 },
        total: dadosAtuais.metricas?.total || { ocupadas: 0, total: 0, ocupacao: 0 }
      },
      especialidades: dadosAtuais.detalhamentoEspecialidades || [],
      salasCirurgia: dadosAtuais.salasCirurgia || [],
      ocupacaoPorTurno: dadosAtuais.ocupacaoPorTurno || [],
      evolucaoOcupacao: dadosAtuais.evolucaoOcupacao || []
    };

    console.log('📦 Dados preparados para exportação:', {
      periodo: data.periodo,
      tipoSala: data.tipoSala,
      consultorios: data.metricas.consultorios,
      cirurgia: data.metricas.cirurgia,
      especialidades: data.especialidades.length,
      salasCirurgia: data.salasCirurgia.length
    });

    const fileName = `ocupacao_salas_${periodo}_${tipoSala}`;
    
    if (format === 'pdf') {
      return await this.exportToPdf(data, fileName);
    } else if (format === 'excel') {
      return this.exportToExcel(data, fileName);
    } else {
      throw new Error(`Formato não suportado: ${format}`);
    }
  }

  static async exportToPdf(data, fileName = 'relatorio_salas') {
    try {
      console.log('📄 Criando PDF de salas...');
      
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
      doc.text('RELATÓRIO DE OCUPAÇÃO DE SALAS', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Preto
      
      const periodoTexto = {
        semana: 'Última Semana',
        mes: 'Último Mês',
        trimestre: 'Último Trimestre',
        ano: 'Último Ano'
      }[data.periodo] || data.periodo;
      
      const tipoSalaTexto = data.tipoSala === 'CONSULTORIO' ? 'Consultórios' : 
                           data.tipoSala === 'CIRURGIA' ? 'Salas de Cirurgia' : 
                           data.tipoSala;
      
      doc.text(`Período: ${periodoTexto} | Tipo de Sala: ${tipoSalaTexto}`, pageWidth / 2, yPos, { align: 'center' });
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
      
      // Consultórios
      const ocupacaoConsultorios = data.metricas.consultorios?.ocupacao || 0;
      doc.text(`• Consultórios: ${data.metricas.consultorios?.ocupadas || 0}/${data.metricas.consultorios?.total || 0} salas ocupadas (${ocupacaoConsultorios.toFixed(1)}%)`, margin + 5, yPos);
      yPos += 6;
      
      // Salas de Cirurgia
      const ocupacaoCirurgia = data.metricas.cirurgia?.ocupacao || 0;
      doc.text(`• Salas de Cirurgia: ${data.metricas.cirurgia?.ocupadas || 0}/${data.metricas.cirurgia?.total || 0} salas ocupadas (${ocupacaoCirurgia.toFixed(1)}%)`, margin + 5, yPos);
      yPos += 6;
      
      // Total Geral
      const ocupacaoTotal = data.metricas.total?.ocupacao || 0;
      doc.text(`• Total Geral: ${data.metricas.total?.ocupadas || 0}/${data.metricas.total?.total || 0} salas ocupadas (${ocupacaoTotal.toFixed(1)}%)`, margin + 5, yPos);
      yPos += 10;
      
      // Salas Disponíveis
      const salasDisponiveis = (data.metricas.total?.total || 0) - (data.metricas.total?.ocupadas || 0);
      doc.text(`• Salas Disponíveis: ${salasDisponiveis} salas livres`, margin + 5, yPos);
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
        head: [['Tipo de Sala', 'Ocupadas', 'Totais', 'Ocupação %', 'Status']],
        body: [
          [
            'Consultórios',
            data.metricas.consultorios?.ocupadas?.toString() || '0',
            data.metricas.consultorios?.total?.toString() || '0',
            `${ocupacaoConsultorios.toFixed(1)}%`,
            this.getStatusText(ocupacaoConsultorios)
          ],
          [
            'Salas de Cirurgia',
            data.metricas.cirurgia?.ocupadas?.toString() || '0',
            data.metricas.cirurgia?.total?.toString() || '0',
            `${ocupacaoCirurgia.toFixed(1)}%`,
            this.getStatusText(ocupacaoCirurgia)
          ],
          [
            'Total Geral',
            data.metricas.total?.ocupadas?.toString() || '0',
            data.metricas.total?.total?.toString() || '0',
            `${ocupacaoTotal.toFixed(1)}%`,
            this.getStatusText(ocupacaoTotal)
          ]
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
          0: { cellWidth: 50 }, // Tipo de Sala
          1: { cellWidth: 25, halign: 'center' }, // Ocupadas
          2: { cellWidth: 25, halign: 'center' }, // Totais
          3: { cellWidth: 30, halign: 'center' }, // Ocupação
          4: { cellWidth: 30, halign: 'center' }  // Status
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // OCUPAÇÃO POR TURNO
      if (data.ocupacaoPorTurno && data.ocupacaoPorTurno.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('OCUPAÇÃO POR TURNO', margin, yPos);
        yPos += 10;
        
        const turnoData = {
          head: [['Turno', 'Ocupação %', 'Status']],
          body: data.ocupacaoPorTurno.map(item => {
            const percentual = item.percentual || 0;
            return [
              item.turno || 'Não especificado',
              `${percentual.toFixed(1)}%`,
              this.getStatusText(percentual)
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: turnoData.head,
          body: turnoData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
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
            0: { cellWidth: 50 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' }
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // ESPECIALIDADES
      if (data.especialidades && data.especialidades.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALHAMENTO POR ESPECIALIDADE', margin, yPos);
        yPos += 10;
        
        const especialidadeData = {
          head: [['Especialidade', 'Salas Totais', 'Salas Ocupadas', 'Ocupação %', 'Status']],
          body: data.especialidades.map(item => {
            const ocupacao = item.ocupacao || 0;
            return [
              item.especialidade || 'Não especificada',
              item.salas_totais?.toString() || '0',
              item.salas_ocupadas?.toString() || '0',
              `${ocupacao.toFixed(1)}%`,
              this.getStatusText(ocupacao)
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
            fillColor: [219, 39, 119], // Rosa
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 45 }, // Especialidade
            1: { cellWidth: 25, halign: 'center' }, // Totais
            2: { cellWidth: 30, halign: 'center' }, // Ocupadas
            3: { cellWidth: 30, halign: 'center' }, // Ocupação
            4: { cellWidth: 30, halign: 'center' }  // Status
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // SALAS DE CIRURGIA
      if (data.salasCirurgia && data.salasCirurgia.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SALAS DE CIRURGIA - AGENDAMENTOS', margin, yPos);
        yPos += 10;
        
        const cirurgiaData = {
          head: [['Sala', 'Cirurgias Hoje', 'Status', 'Especialidade', 'Capacidade']],
          body: data.salasCirurgia.map(item => {
            return [
              `Sala ${item.n_sala || 'N/A'}`,
              `${item.cirurgias_hoje || 0}`,
              item.status === 'ocupada' ? 'Ocupada' : 'Disponível',
              item.especialidade_principal || 'Não especificada',
              item.capacidade_diaria?.toString() || '0'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: cirurgiaData.head,
          body: cirurgiaData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [220, 53, 69], // Vermelho
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 25 }, // Sala
            1: { cellWidth: 25, halign: 'center' }, // Cirurgias
            2: { cellWidth: 30, halign: 'center' }, // Status
            3: { cellWidth: 40 }, // Especialidade
            4: { cellWidth: 25, halign: 'center' }  // Capacidade
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // EVOLUÇÃO DA OCUPAÇÃO
      if (data.evolucaoOcupacao && data.evolucaoOcupacao.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EVOLUÇÃO DA OCUPAÇÃO', margin, yPos);
        yPos += 10;
        
        const evolucaoData = {
          head: [['Período', 'Ocupação %', 'Status', 'Tendência']],
          body: data.evolucaoOcupacao.map((item, index) => {
            const ocupacao = item.ocupacao || 0;
            let tendencia = 'Estável';
            
            if (index > 0) {
              const anterior = data.evolucaoOcupacao[index - 1].ocupacao || 0;
              if (ocupacao > anterior + 5) tendencia = 'Crescimento';
              else if (ocupacao < anterior - 5) tendencia = 'Queda';
            }
            
            return [
              item.periodo || `Período ${index + 1}`,
              `${ocupacao.toFixed(1)}%`,
              this.getStatusText(ocupacao),
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
      const taxaConsultorios = data.metricas.consultorios?.ocupacao || 0;
      const taxaCirurgia = data.metricas.cirurgia?.ocupacao || 0;
      
      if (taxaConsultorios >= 90) {
        doc.text('• CONSULTÓRIOS EM NÍVEL CRÍTICO (>90%)', margin, obsY);
        obsY += 6;
        doc.text('  - Considerar ampliação de horários de atendimento', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Avaliar necessidade de novos consultórios', margin + 5, obsY);
        obsY += 8;
      } else if (taxaConsultorios >= 80) {
        doc.text('• Consultórios em nível de ALERTA (80-90%)', margin, obsY);
        obsY += 6;
        doc.text('  - Otimizar agendamentos para evitar picos', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Considerar horários estendidos', margin + 5, obsY);
        obsY += 8;
      }
      
      if (taxaCirurgia >= 90) {
        doc.text('• SALAS DE CIRURGIA EM NÍVEL CRÍTICO (>90%)', margin, obsY);
        obsY += 6;
        doc.text('  - Revisar capacidade cirúrgica disponível', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Priorizar cirurgias de urgência', margin + 5, obsY);
        obsY += 8;
      } else if (taxaCirurgia >= 80) {
        doc.text('• Salas de cirurgia em nível de ALERTA (80-90%)', margin, obsY);
        obsY += 6;
        doc.text('  - Planejar contingências para emergências', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Otimizar tempo entre cirurgias', margin + 5, obsY);
        obsY += 8;
      }
      
      // Recomendações gerais
      doc.text('• RECOMENDAÇÕES GERAIS:', margin, obsY);
      obsY += 6;
      doc.text('  - Manter monitoramento contínuo da ocupação', margin + 5, obsY);
      obsY += 6;
      doc.text(`  - ${salasDisponiveis} salas disponíveis para contingência`, margin + 5, obsY);
      obsY += 6;
      doc.text('  - Revisar periodicamente capacidade operacional', margin + 5, obsY);
      
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
      
      console.log('✅ PDF de salas salvo com sucesso!');
      console.log('📄 Nome do arquivo:', finalFileName);
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF de salas:', error);
      throw error;
    }
  }

  static exportToExcel(data, fileName = 'relatorio_salas') {
    console.log('📊 Criando Excel de salas...');
    
    try {
      // Criar um novo workbook
      const wb = XLSX.utils.book_new();
      
      // CAPA DO RELATÓRIO
      const cabecalho = [
        ['RELATÓRIO DE OCUPAÇÃO DE SALAS'],
        [''],
        ['Período:', data.periodo === 'semana' ? 'Última Semana' : 
                     data.periodo === 'mes' ? 'Último Mês' :
                     data.periodo === 'trimestre' ? 'Último Trimestre' : 
                     data.periodo === 'ano' ? 'Último Ano' : data.periodo],
        ['Tipo de Sala:', data.tipoSala === 'CONSULTORIO' ? 'Consultórios' : 
                         data.tipoSala === 'CIRURGIA' ? 'Salas de Cirurgia' : 
                         data.tipoSala],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['RESUMO EXECUTIVO'],
        [''],
        ['Consultórios:', `${data.metricas.consultorios?.ocupadas || 0}/${data.metricas.consultorios?.total || 0} salas (${(data.metricas.consultorios?.ocupacao || 0).toFixed(1)}%)`],
        ['Salas de Cirurgia:', `${data.metricas.cirurgia?.ocupadas || 0}/${data.metricas.cirurgia?.total || 0} salas (${(data.metricas.cirurgia?.ocupacao || 0).toFixed(1)}%)`],
        ['Total Geral:', `${data.metricas.total?.ocupadas || 0}/${data.metricas.total?.total || 0} salas (${(data.metricas.total?.ocupacao || 0).toFixed(1)}%)`],
        ['Salas Disponíveis:', `${(data.metricas.total?.total || 0) - (data.metricas.total?.ocupadas || 0)} salas livres`],
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
      
      // MÉTRICAS PRINCIPAIS
      const metricasData = [
        ['MÉTRICAS DETALHADAS'],
        [''],
        ['Tipo de Sala', 'Salas Ocupadas', 'Salas Totais', 'Ocupação (%)', 'Status'],
      ];
      
      if (data.metricas.consultorios) {
        metricasData.push([
          'Consultórios',
          data.metricas.consultorios.ocupadas,
          data.metricas.consultorios.total,
          (data.metricas.consultorios.ocupacao || 0).toFixed(1),
          this.getStatusText(data.metricas.consultorios.ocupacao || 0)
        ]);
      }
      
      if (data.metricas.cirurgia) {
        metricasData.push([
          'Salas de Cirurgia',
          data.metricas.cirurgia.ocupadas,
          data.metricas.cirurgia.total,
          (data.metricas.cirurgia.ocupacao || 0).toFixed(1),
          this.getStatusText(data.metricas.cirurgia.ocupacao || 0)
        ]);
      }
      
      metricasData.push([
        'Total Geral',
        data.metricas.total.ocupadas,
        data.metricas.total.total,
        (data.metricas.total.ocupacao || 0).toFixed(1),
        this.getStatusText(data.metricas.total.ocupacao || 0)
      ]);
      
      const wsMetricas = XLSX.utils.aoa_to_sheet(metricasData);
      wsMetricas['!cols'] = [
        { wch: 25 }, // Tipo de Sala
        { wch: 18 }, // Ocupadas
        { wch: 15 }, // Totais
        { wch: 15 }, // Ocupação
        { wch: 15 }  // Status
      ];
      
      // Mesclar título
      wsMetricas['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsMetricas, "Métricas");
      
      // OCUPAÇÃO POR TURNO
      if (data.ocupacaoPorTurno && data.ocupacaoPorTurno.length > 0) {
        const turnoData = [
          ['OCUPAÇÃO POR TURNO'],
          [''],
          ['Turno', 'Ocupação (%)', 'Status'],
        ];
        
        data.ocupacaoPorTurno.forEach(item => {
          turnoData.push([
            item.turno || 'Não especificado',
            item.percentual || 0,
            this.getStatusText(item.percentual || 0)
          ]);
        });
        
        const wsTurno = XLSX.utils.aoa_to_sheet(turnoData);
        wsTurno['!cols'] = [
          { wch: 20 }, // Turno
          { wch: 15 }, // Ocupação
          { wch: 15 }  // Status
        ];
        
        wsTurno['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsTurno, "Turnos");
      }
      
      // ESPECIALIDADES
      if (data.especialidades && data.especialidades.length > 0) {
        const especialidadeData = [
          ['DETALHAMENTO POR ESPECIALIDADE'],
          [''],
          ['Especialidade', 'Salas Totais', 'Salas Ocupadas', 'Ocupação (%)', 'Status'],
        ];
        
        data.especialidades.forEach(item => {
          especialidadeData.push([
            item.especialidade || 'Não especificada',
            item.salas_totais || 0,
            item.salas_ocupadas || 0,
            item.ocupacao || 0,
            this.getStatusText(item.ocupacao || 0)
          ]);
        });
        
        const wsEspecialidade = XLSX.utils.aoa_to_sheet(especialidadeData);
        wsEspecialidade['!cols'] = [
          { wch: 30 }, // Especialidade
          { wch: 15 }, // Totais
          { wch: 18 }, // Ocupadas
          { wch: 15 }, // Ocupação
          { wch: 15 }  // Status
        ];
        
        wsEspecialidade['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEspecialidade, "Especialidades");
      }
      
      // SALAS DE CIRURGIA
      if (data.salasCirurgia && data.salasCirurgia.length > 0) {
        const cirurgiaData = [
          ['SALAS DE CIRURGIA - AGENDAMENTOS'],
          [''],
          ['Sala', 'Cirurgias Hoje', 'Status', 'Especialidade Principal', 'Capacidade Diária'],
        ];
        
        data.salasCirurgia.forEach(item => {
          cirurgiaData.push([
            `Sala ${item.n_sala || 'N/A'}`,
            item.cirurgias_hoje || 0,
            item.status === 'ocupada' ? 'Ocupada' : 'Disponível',
            item.especialidade_principal || 'Não especificada',
            item.capacidade_diaria || 0
          ]);
        });
        
        const wsCirurgia = XLSX.utils.aoa_to_sheet(cirurgiaData);
        wsCirurgia['!cols'] = [
          { wch: 15 }, // Sala
          { wch: 18 }, // Cirurgias
          { wch: 15 }, // Status
          { wch: 30 }, // Especialidade
          { wch: 20 }  // Capacidade
        ];
        
        wsCirurgia['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsCirurgia, "Cirurgias");
      }
      
      // EVOLUÇÃO DA OCUPAÇÃO
      if (data.evolucaoOcupacao && data.evolucaoOcupacao.length > 0) {
        const evolucaoData = [
          ['EVOLUÇÃO DA OCUPAÇÃO'],
          [''],
          ['Período', 'Ocupação (%)', 'Status', 'Tendência'],
        ];
        
        data.evolucaoOcupacao.forEach((item, index) => {
          let tendencia = 'Estável';
          
          if (index > 0) {
            const anterior = data.evolucaoOcupacao[index - 1].ocupacao || 0;
            if (item.ocupacao > anterior + 5) tendencia = 'Crescimento';
            else if (item.ocupacao < anterior - 5) tendencia = 'Queda';
          }
          
          evolucaoData.push([
            item.periodo || `Período ${index + 1}`,
            item.ocupacao || 0,
            this.getStatusText(item.ocupacao || 0),
            tendencia
          ]);
        });
        
        const wsEvolucao = XLSX.utils.aoa_to_sheet(evolucaoData);
        wsEvolucao['!cols'] = [
          { wch: 20 }, // Período
          { wch: 15 }, // Ocupação
          { wch: 15 }, // Status
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
      
      const taxaConsultorios = data.metricas.consultorios?.ocupacao || 0;
      const taxaCirurgia = data.metricas.cirurgia?.ocupacao || 0;
      
      if (taxaConsultorios >= 90) {
        observacoesData.push(['• CONSULTÓRIOS EM NÍVEL CRÍTICO (>90%)']);
        observacoesData.push(['  - Considerar ampliação de horários de atendimento']);
        observacoesData.push(['  - Avaliar necessidade de novos consultórios']);
        observacoesData.push(['']);
      } else if (taxaConsultorios >= 80) {
        observacoesData.push(['• Consultórios em nível de ALERTA (80-90%)']);
        observacoesData.push(['  - Otimizar agendamentos para evitar picos']);
        observacoesData.push(['  - Considerar horários estendidos']);
        observacoesData.push(['']);
      }
      
      if (taxaCirurgia >= 90) {
        observacoesData.push(['• SALAS DE CIRURGIA EM NÍVEL CRÍTICO (>90%)']);
        observacoesData.push(['  - Revisar capacidade cirúrgica disponível']);
        observacoesData.push(['  - Priorizar cirurgias de urgência']);
        observacoesData.push(['']);
      } else if (taxaCirurgia >= 80) {
        observacoesData.push(['• Salas de cirurgia em nível de ALERTA (80-90%)']);
        observacoesData.push(['  - Planejar contingências para emergências']);
        observacoesData.push(['  - Otimizar tempo entre cirurgias']);
        observacoesData.push(['']);
      }
      
      // Recomendações gerais
      observacoesData.push(['• RECOMENDAÇÕES GERAIS:']);
      observacoesData.push(['  - Manter monitoramento contínuo da ocupação']);
      observacoesData.push([`  - ${(data.metricas.total?.total || 0) - (data.metricas.total?.ocupadas || 0)} salas disponíveis para contingência`]);
      observacoesData.push(['  - Revisar periodicamente capacidade operacional']);
      
      const wsObservacoes = XLSX.utils.aoa_to_sheet(observacoesData);
      wsObservacoes['!cols'] = [{ wch: 80 }]; // Coluna única larga
      
      wsObservacoes['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsObservacoes, "Observações");
      
      // GERAR E SALVAR ARQUIVO
      // Nome do arquivo com data
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

  // Método auxiliar para determinar status
  static getStatusText(percentual) {
    if (percentual >= 90) return 'Crítico';
    if (percentual >= 80) return 'Alerta';
    if (percentual >= 60) return 'Estável';
    return 'Baixa';
  }
}

export { ExportSalasService };
export default ExportSalasService;