import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; 

class ExportHistoricoPacientesService {
  static async exportData(format, dadosAtuais, periodo, tipoAtendimento, faixaEtaria) {
    console.log('🔄 Exportando histórico de pacientes:', format);
    console.log('📊 Dados recebidos:', {
      metricas: dadosAtuais.metricas,
      especialidadesCount: dadosAtuais.atendimentosPorEspecialidade?.length || 0,
      internacoesCount: dadosAtuais.internacoesAtivas?.length || 0
    });
    
    // Preparar dados para exportação
    const data = {
      periodo: periodo || 'mes',
      tipoAtendimento: tipoAtendimento || 'todos',
      faixaEtaria: faixaEtaria || 'todas',
      metricas: dadosAtuais.metricas || {
        totalAtendidos: 0,
        taxaRemarcacao: 0,
        permanenciaMedia: 0,
        taxaRetorno: 0,
        taxaOcupacaoLeitos: 0,
        totalAltas: 0,
        tempoMedioEspera: 0,
        taxaSatisfacao: 0
      },
      atendimentosPorEspecialidade: dadosAtuais.atendimentosPorEspecialidade || [],
      internacoesAtivas: dadosAtuais.internacoesAtivas || [],
      procedimentosRealizados: dadosAtuais.procedimentosRealizados || [],
      origemPacientes: dadosAtuais.origemPacientes || [],
      distribuicaoFaixaEtaria: dadosAtuais.distribuicaoFaixaEtaria || [],
      evolucaoAtendimentos: dadosAtuais.evolucaoAtendimentos || []
    };

    console.log('📦 Dados preparados para exportação:', {
      periodo: data.periodo,
      tipoAtendimento: data.tipoAtendimento,
      faixaEtaria: data.faixaEtaria,
      metricas: data.metricas,
      atendimentosPorEspecialidade: data.atendimentosPorEspecialidade.length,
      internacoesAtivas: data.internacoesAtivas.length
    });

    const fileName = `historico_pacientes_${periodo}_${tipoAtendimento}_${faixaEtaria}`;
    
    if (format === 'pdf') {
      return await this.exportToPdf(data, fileName);
    } else if (format === 'excel') {
      return this.exportToExcel(data, fileName);
    } else {
      throw new Error(`Formato não suportado: ${format}`);
    }
  }

  static async exportToPdf(data, fileName = 'relatorio_historico_pacientes') {
    try {
      console.log('📄 Criando PDF de histórico de pacientes...');
      
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
      doc.text('RELATÓRIO DE HISTÓRICO DE PACIENTES', pageWidth / 2, yPos, { align: 'center' });
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
      
      const tipoAtendimentoTexto = {
        todos: 'Todos os Atendimentos',
        consulta: 'Consultas',
        emergencia: 'Emergência',
        internacao: 'Internação',
        cirurgia: 'Cirurgias'
      }[data.tipoAtendimento] || data.tipoAtendimento;
      
      const faixaEtariaTexto = {
        todas: 'Todas as Idades',
        criancas: '0-12 anos',
        adolescentes: '13-17 anos',
        adultos: '18-59 anos',
        idosos: '60+ anos'
      }[data.faixaEtaria] || data.faixaEtaria;
      
      doc.text(`Período: ${periodoTexto} | Tipo: ${tipoAtendimentoTexto} | Faixa: ${faixaEtariaTexto}`, pageWidth / 2, yPos, { align: 'center' });
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
      
      doc.text(`• Total de Atendimentos: ${data.metricas.totalAtendidos || 0} pacientes`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Taxa de Remarcação: ${data.metricas.taxaRemarcacao || 0}%`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Permanência Média: ${data.metricas.permanenciaMedia || 0} dias`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Taxa de Retorno: ${data.metricas.taxaRetorno || 0}%`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Taxa de Ocupação Leitos: ${data.metricas.taxaOcupacaoLeitos || 0}%`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Altas no Período: ${data.metricas.totalAltas || 0} pacientes`, margin + 5, yPos);
      yPos += 6;
      doc.text(`• Taxa de Satisfação: ${data.metricas.taxaSatisfacao || 0}%`, margin + 5, yPos);
      yPos += 15;

      // ATENDIMENTOS POR ESPECIALIDADE
      if (data.atendimentosPorEspecialidade && data.atendimentosPorEspecialidade.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ATENDIMENTOS POR ESPECIALIDADE', margin, yPos);
        yPos += 10;
        
        const especialidadeData = {
          head: [['Especialidade', 'Total Atend.', 'Novos', 'Retornos', 'Média Idade', 'Crescimento']],
          body: data.atendimentosPorEspecialidade.map(item => {
            const crescimentoNum = parseFloat(item.crescimento?.toString().replace(/[^0-9.-]/g, '') || item.crescimento || 0);
            return [
              item.especialidade || 'Não especificada',
              item.totalAtendimentos?.toString() || '0',
              item.novosPacientes?.toString() || '0',
              item.retornos?.toString() || '0',
              `${item.mediaIdade || 0} anos`,
              `${crescimentoNum >= 0 ? '+' : ''}${crescimentoNum}%`
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
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // INTERNAÇÕES ATIVAS
      if (data.internacoesAtivas && data.internacoesAtivas.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('INTERNAÇÕES ATIVAS', margin, yPos);
        yPos += 10;
        
        const calcularIdade = (dataNascimento) => {
          if (!dataNascimento) return 'N/A';
          try {
            const nascimento = new Date(dataNascimento);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
              idade--;
            }
            return idade;
          } catch (error) {
            return 'N/A';
          }
        };

        const internacoesData = {
          head: [['Paciente', 'Idade', 'Setor', 'Diagnóstico', 'Dias Internado', 'Status']],
          body: data.internacoesAtivas.map(item => {
            const idade = calcularIdade(item.data_nascimento);
            const dias = item.dias_internado || 0;
            let status = 'Estável';
            if (dias >= 30) status = 'Crítico';
            else if (dias >= 15) status = 'Alerta';
            else if (dias >= 7) status = 'Estável';
            else status = 'Baixo';
            
            return [
              item.paciente_nome || 'Não informado',
              `${idade} anos`,
              item.tipo_leito === 'UTI' ? 'UTI' : `Enfermaria ${item.n_sala || 'N/A'}`,
              item.diagnostico_principal || 'Em observação',
              `${dias} dias`,
              status
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: internacoesData.head,
          body: internacoesData.body,
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
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // ORIGEM DOS PACIENTES
      if (data.origemPacientes && data.origemPacientes.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ORIGEM DOS PACIENTES', margin, yPos);
        yPos += 10;
        
        const origemData = {
          head: [['Origem', 'Quantidade', 'Percentual', 'Crescimento', 'Tipo Principal']],
          body: data.origemPacientes.map(item => {
            return [
              item.origem || 'Não especificada',
              item.quantidade?.toString() || '0',
              `${item.percentual || 0}%`,
              `${item.crescimento >= 0 ? '+' : ''}${item.crescimento || 0}%`,
              item.tipo_principal || 'N/A'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: origemData.head,
          body: origemData.body,
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
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // DISTRIBUIÇÃO POR FAIXA ETÁRIA
      if (data.distribuicaoFaixaEtaria && data.distribuicaoFaixaEtaria.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DISTRIBUIÇÃO POR FAIXA ETÁRIA', margin, yPos);
        yPos += 10;
        
        const faixaEtariaData = {
          head: [['Faixa Etária', 'Quantidade', 'Percentual']],
          body: data.distribuicaoFaixaEtaria.map(item => {
            return [
              item.faixa || 'Não especificada',
              item.quantidade?.toString() || '0',
              `${item.percentual || 0}%`
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: faixaEtariaData.head,
          body: faixaEtariaData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [255, 193, 7],
            textColor: 0,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // PROCEDIMENTOS REALIZADOS
      if (data.procedimentosRealizados && data.procedimentosRealizados.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROCEDIMENTOS REALIZADOS', margin, yPos);
        yPos += 10;
        
        const procedimentosData = {
          head: [['Procedimento', 'Quantidade', 'Especialidade', 'Tempo Médio', 'Crescimento']],
          body: data.procedimentosRealizados.map(item => {
            return [
              item.procedimento || 'Não especificado',
              item.quantidade?.toString() || '0',
              item.especialidade || 'N/A',
              `${item.tempo_medio || 0} min`,
              `${item.crescimento || 0}%`
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: procedimentosData.head,
          body: procedimentosData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [111, 66, 193],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // OBSERVAÇÕES
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
      
      if (data.metricas.taxaRemarcacao >= 20) {
        doc.text('• ALTA TAXA DE REMARCAÇÃO (>20%)', margin, obsY);
        obsY += 6;
        doc.text('  - Avaliar sistema de agendamento', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Verificar disponibilidade de horários', margin + 5, obsY);
        obsY += 8;
      }
      
      if (data.metricas.permanenciaMedia >= 15) {
        doc.text('• PERMANÊNCIA MÉDIA ELEVADA (>15 dias)', margin, obsY);
        obsY += 6;
        doc.text('  - Analisar processos de alta hospitalar', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Otimizar fluxo de cuidados', margin + 5, obsY);
        obsY += 8;
      }
      
      if (data.metricas.taxaSatisfacao < 70) {
        doc.text('• BAIXA TAXA DE SATISFAÇÃO (<70%)', margin, obsY);
        obsY += 6;
        doc.text('  - Revisar qualidade do atendimento', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Implementar melhorias no acolhimento', margin + 5, obsY);
        obsY += 8;
      }
      
      // Recomendações gerais
      doc.text('• RECOMENDAÇÕES GERAIS:', margin, obsY);
      obsY += 6;
      doc.text('  - Monitorar indicadores de qualidade continuamente', margin + 5, obsY);
      obsY += 6;
      doc.text('  - Avaliar distribuição etária dos pacientes', margin + 5, obsY);
      obsY += 6;
      doc.text('  - Otimizar fluxo de atendimento', margin + 5, obsY);
      
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
      
      console.log('✅ PDF de histórico de pacientes salvo com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF de histórico de pacientes:', error);
      throw error;
    }
  }

  static exportToExcel(data, fileName = 'relatorio_historico_pacientes') {
    console.log('📊 Criando Excel de histórico de pacientes...');
    
    try {
      // Criar um novo workbook
      const wb = XLSX.utils.book_new();
      
      // CAPA DO RELATÓRIO
      const cabecalho = [
        ['RELATÓRIO DE HISTÓRICO DE PACIENTES'],
        [''],
        ['Período:', data.periodo === 'semana' ? 'Última Semana' : 
                     data.periodo === 'mes' ? 'Último Mês' :
                     data.periodo === 'trimestre' ? 'Último Trimestre' : 
                     data.periodo === 'ano' ? 'Último Ano' : data.periodo],
        ['Tipo de Atendimento:', {
          todos: 'Todos os Atendimentos',
          consulta: 'Consultas',
          emergencia: 'Emergência',
          internacao: 'Internação',
          cirurgia: 'Cirurgias'
        }[data.tipoAtendimento] || data.tipoAtendimento],
        ['Faixa Etária:', {
          todas: 'Todas as Idades',
          criancas: '0-12 anos',
          adolescentes: '13-17 anos',
          adultos: '18-59 anos',
          idosos: '60+ anos'
        }[data.faixaEtaria] || data.faixaEtaria],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['RESUMO EXECUTIVO'],
        [''],
        ['Total de Atendimentos:', `${data.metricas.totalAtendidos || 0} pacientes`],
        ['Taxa de Remarcação:', `${data.metricas.taxaRemarcacao || 0}%`],
        ['Permanência Média:', `${data.metricas.permanenciaMedia || 0} dias`],
        ['Taxa de Retorno:', `${data.metricas.taxaRetorno || 0}%`],
        ['Taxa de Ocupação Leitos:', `${data.metricas.taxaOcupacaoLeitos || 0}%`],
        ['Altas no Período:', `${data.metricas.totalAltas || 0} pacientes`],
        ['Tempo Médio de Espera:', `${data.metricas.tempoMedioEspera || 0} min`],
        ['Taxa de Satisfação:', `${data.metricas.taxaSatisfacao || 0}%`],
        [''],
        ['']
      ];
      
      const wsCapa = XLSX.utils.aoa_to_sheet(cabecalho);
      wsCapa['!cols'] = [
        { wch: 25 },
        { wch: 40 }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsCapa, "Capa");
      
      // ATENDIMENTOS POR ESPECIALIDADE
      if (data.atendimentosPorEspecialidade && data.atendimentosPorEspecialidade.length > 0) {
        const especialidadeData = [
          ['ATENDIMENTOS POR ESPECIALIDADE'],
          [''],
          ['Especialidade', 'Total Atendimentos', 'Novos Pacientes', 'Retornos', 'Média Idade', 'Crescimento'],
        ];
        
        data.atendimentosPorEspecialidade.forEach(item => {
          const crescimentoNum = parseFloat(item.crescimento?.toString().replace(/[^0-9.-]/g, '') || item.crescimento || 0);
          especialidadeData.push([
            item.especialidade || 'Não especificada',
            item.totalAtendimentos || 0,
            item.novosPacientes || 0,
            item.retornos || 0,
            item.mediaIdade || 0,
            `${crescimentoNum >= 0 ? '+' : ''}${crescimentoNum}%`
          ]);
        });
        
        const wsEspecialidade = XLSX.utils.aoa_to_sheet(especialidadeData);
        wsEspecialidade['!cols'] = [
          { wch: 25 },
          { wch: 18 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEspecialidade, "Especialidades");
      }
      
      // INTERNAÇÕES ATIVAS
      if (data.internacoesAtivas && data.internacoesAtivas.length > 0) {
        const internacoesData = [
          ['INTERNAÇÕES ATIVAS'],
          [''],
          ['Paciente', 'Idade', 'Setor', 'Diagnóstico', 'Dias Internado', 'Status'],
        ];
        
        const calcularIdade = (dataNascimento) => {
          if (!dataNascimento) return 'N/A';
          try {
            const nascimento = new Date(dataNascimento);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
              idade--;
            }
            return idade;
          } catch (error) {
            return 'N/A';
          }
        };

        data.internacoesAtivas.forEach(item => {
          const idade = calcularIdade(item.data_nascimento);
          const dias = item.dias_internado || 0;
          let status = 'Estável';
          if (dias >= 30) status = 'Crítico';
          else if (dias >= 15) status = 'Alerta';
          else if (dias >= 7) status = 'Estável';
          else status = 'Baixo';
          
          internacoesData.push([
            item.paciente_nome || 'Não informado',
            `${idade} anos`,
            item.tipo_leito === 'UTI' ? 'UTI' : `Enfermaria ${item.n_sala || 'N/A'}`,
            item.diagnostico_principal || 'Em observação',
            dias,
            status
          ]);
        });
        
        const wsInternacoes = XLSX.utils.aoa_to_sheet(internacoesData);
        wsInternacoes['!cols'] = [
          { wch: 25 },
          { wch: 10 },
          { wch: 20 },
          { wch: 30 },
          { wch: 15 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsInternacoes, "Internações");
      }
      
      // ORIGEM DOS PACIENTES
      if (data.origemPacientes && data.origemPacientes.length > 0) {
        const origemData = [
          ['ORIGEM DOS PACIENTES'],
          [''],
          ['Origem', 'Quantidade', 'Percentual', 'Crescimento', 'Tipo Principal'],
        ];
        
        data.origemPacientes.forEach(item => {
          origemData.push([
            item.origem || 'Não especificada',
            item.quantidade || 0,
            `${item.percentual || 0}%`,
            `${item.crescimento >= 0 ? '+' : ''}${item.crescimento || 0}%`,
            item.tipo_principal || 'N/A'
          ]);
        });
        
        const wsOrigem = XLSX.utils.aoa_to_sheet(origemData);
        wsOrigem['!cols'] = [
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 15 },
          { wch: 20 }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsOrigem, "Origem");
      }
      
      // DISTRIBUIÇÃO POR FAIXA ETÁRIA
      if (data.distribuicaoFaixaEtaria && data.distribuicaoFaixaEtaria.length > 0) {
        const faixaData = [
          ['DISTRIBUIÇÃO POR FAIXA ETÁRIA'],
          [''],
          ['Faixa Etária', 'Quantidade', 'Percentual'],
        ];
        
        data.distribuicaoFaixaEtaria.forEach(item => {
          faixaData.push([
            item.faixa || 'Não especificada',
            item.quantidade || 0,
            `${item.percentual || 0}%`
          ]);
        });
        
        const wsFaixa = XLSX.utils.aoa_to_sheet(faixaData);
        wsFaixa['!cols'] = [
          { wch: 20 },
          { wch: 15 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsFaixa, "Faixa Etária");
      }
      
      // PROCEDIMENTOS REALIZADOS
      if (data.procedimentosRealizados && data.procedimentosRealizados.length > 0) {
        const procedimentosData = [
          ['PROCEDIMENTOS REALIZADOS'],
          [''],
          ['Procedimento', 'Quantidade', 'Especialidade', 'Tempo Médio (min)', 'Crescimento'],
        ];
        
        data.procedimentosRealizados.forEach(item => {
          procedimentosData.push([
            item.procedimento || 'Não especificado',
            item.quantidade || 0,
            item.especialidade || 'N/A',
            item.tempo_medio || 0,
            `${item.crescimento || 0}%`
          ]);
        });
        
        const wsProcedimentos = XLSX.utils.aoa_to_sheet(procedimentosData);
        wsProcedimentos['!cols'] = [
          { wch: 25 },
          { wch: 15 },
          { wch: 20 },
          { wch: 18 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsProcedimentos, "Procedimentos");
      }
      
      // EVOLUÇÃO DOS ATENDIMENTOS
      if (data.evolucaoAtendimentos && data.evolucaoAtendimentos.length > 0) {
        const evolucaoData = [
          ['EVOLUÇÃO DOS ATENDIMENTOS'],
          [''],
          ['Período', 'Atendimentos'],
        ];
        
        data.evolucaoAtendimentos.forEach(item => {
          evolucaoData.push([
            item.mes || 'Período',
            item.atendimentos || 0
          ]);
        });
        
        const wsEvolucao = XLSX.utils.aoa_to_sheet(evolucaoData);
        wsEvolucao['!cols'] = [
          { wch: 20 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEvolucao, "Evolução");
      }
      
      // OBSERVAÇÕES
      const observacoesData = [
        ['OBSERVAÇÕES E RECOMENDAÇÕES'],
        [''],
      ];
      
      if (data.metricas.taxaRemarcacao >= 20) {
        observacoesData.push(['• ALTA TAXA DE REMARCAÇÃO (>20%)']);
        observacoesData.push(['  - Avaliar sistema de agendamento']);
        observacoesData.push(['  - Verificar disponibilidade de horários']);
        observacoesData.push(['']);
      }
      
      if (data.metricas.permanenciaMedia >= 15) {
        observacoesData.push(['• PERMANÊNCIA MÉDIA ELEVADA (>15 dias)']);
        observacoesData.push(['  - Analisar processos de alta hospitalar']);
        observacoesData.push(['  - Otimizar fluxo de cuidados']);
        observacoesData.push(['']);
      }
      
      if (data.metricas.taxaSatisfacao < 70) {
        observacoesData.push(['• BAIXA TAXA DE SATISFAÇÃO (<70%)']);
        observacoesData.push(['  - Revisar qualidade do atendimento']);
        observacoesData.push(['  - Implementar melhorias no acolhimento']);
        observacoesData.push(['']);
      }
      
      observacoesData.push(['• RECOMENDAÇÕES GERAIS:']);
      observacoesData.push(['  - Monitorar indicadores de qualidade continuamente']);
      observacoesData.push(['  - Avaliar distribuição etária dos pacientes']);
      observacoesData.push(['  - Otimizar fluxo de atendimento']);
      
      const wsObservacoes = XLSX.utils.aoa_to_sheet(observacoesData);
      wsObservacoes['!cols'] = [{ wch: 80 }];
      
      XLSX.utils.book_append_sheet(wb, wsObservacoes, "Observações");
      
      // GERAR E SALVAR ARQUIVO
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, finalFileName);
      
      console.log('✅ Excel (XLSX) exportado com sucesso!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      throw error;
    }
  }
}

export { ExportHistoricoPacientesService };
export default ExportHistoricoPacientesService;