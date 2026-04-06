const fs = require('fs');
const path = require('path');

const R = '\uFFFD';

// Regex fixes: handle 1 or more FFFD for compound accents (ção, ções, ão, etc.)
const regexFixes = [
  // ção / ções endings
  [/Configura\uFFFD+es/g,      'Configurações'],
  [/configura\uFFFD+es/g,      'configurações'],
  [/CONFIGURA\uFFFD+ES/g,      'CONFIGURAÇÕES'],
  [/Confirma\uFFFD+o/g,        'Confirmação'],
  [/confirma\uFFFD+o/g,        'confirmação'],
  [/Remarca\uFFFD+o/g,         'Remarcação'],
  [/remarca\uFFFD+o/g,         'remarcação'],
  [/Indica\uFFFD+o/g,          'Indicação'],
  [/indica\uFFFD+o/g,          'indicação'],
  [/Altera\uFFFD+es/g,         'Alterações'],
  [/altera\uFFFD+es/g,         'alterações'],
  [/Informa\uFFFD+es/g,        'Informações'],
  [/informa\uFFFD+es/g,        'informações'],
  [/INFORMA\uFFFD+ES/g,        'INFORMAÇÕES'],
  [/Permiss\uFFFD+es/g,        'Permissões'],
  [/permiss\uFFFD+es/g,        'permissões'],
  [/Evolu\uFFFD+es/g,          'Evoluções'],
  [/evolu\uFFFD+es/g,          'evoluções'],
  [/Fun\uFFFD+o/g,             'Função'],
  [/fun\uFFFD+o/g,             'função'],
  [/Op\uFFFD+o/g,              'Opção'],
  [/op\uFFFD+o/g,              'opção'],
  [/Observa\uFFFD+es/g,        'Observações'],
  [/observa\uFFFD+es/g,        'observações'],
  [/notifica\uFFFD+es/g,       'notificações'],
  [/Notifica\uFFFD+es/g,       'Notificações'],
  [/Notifica\uFFFD+o/g,        'Notificação'],
  [/notifica\uFFFD+o/g,        'notificação'],
  [/Salvar Altera\uFFFD+es/g,  'Salvar Alterações'],
  [/salvar altera\uFFFD+es/g,  'salvar alterações'],
  [/Salvar Configura\uFFFD+es/g, 'Salvar Configurações'],
  // ão endings (ã = E3 → 1 FFFD before o when followed by o)
  [/Mensagens Padr\uFFFD+o/g,  'Mensagens Padrão'],
  [/Padr\uFFFD+o/g,            'Padrão'],
  [/padr\uFFFD+o/g,            'padrão'],
  // á → 1 FFFD  
  [/Autom\uFFFD+ticos/g,       'Automáticos'],
  [/autom\uFFFD+ticos/g,       'automáticos'],
  [/Autom\uFFFD+tico/g,        'Automático'],
  [/autom\uFFFD+tico/g,        'automático'],
  [/Autom\uFFFD+tica/g,        'Automática'],
  [/autom\uFFFD+tica/g,        'automática'],
  [/Hor\uFFFD+rios/g,          'Horários'],
  [/hor\uFFFD+rios/g,          'horários'],
  [/Hor\uFFFD+rio/g,           'Horário'],
  [/hor\uFFFD+rio/g,           'horário'],
  [/Agendam\uFFFD+nto/g,       'Agendamento'],
  // ç → 1 FFFD
  [/presen\uFFFD+a/g,          'presença'],
  [/Presen\uFFFD+a/g,          'Presença'],
  [/Fa\uFFFD+a login/g,        'Faça login'],
  [/Servi\uFFFD+os/g,          'Serviços'],
  [/servi\uFFFD+os/g,          'serviços'],
  [/SERVI\uFFFD+OS/g,          'SERVIÇOS'],
  [/Servi\uFFFD+o/g,           'Serviço'],
  [/servi\uFFFD+o/g,           'serviço'],
  [/cobran\uFFFD+a/g,          'cobrança'],
  [/Cobran\uFFFD+a/g,          'Cobrança'],
  [/agradecimento ap\uFFFD+s/g,'agradecimento após'],
  [/ap\uFFFD+s as/g,           'após as'],
  [/Conv\uFFFD+nio/g,          'Convênio'],
  [/conv\uFFFD+nio/g,          'convênio'],
  // other
  [/Anivers\uFFFD+rios/g,      'Aniversários'],
  [/anivers\uFFFD+rios/g,      'aniversários'],
  [/Anivers\uFFFD+rio/g,       'Aniversário'],
  [/anivers\uFFFD+rio/g,       'aniversário'],
  [/Cl\uFFFD+nica/g,           'Clínica'],
  [/cl\uFFFD+nica/g,           'clínica'],
  [/CL\uFFFD+NICA/g,           'CLÍNICA'],
  [/N\uFFFD+mero/g,            'Número'],
  [/n\uFFFD+mero/g,            'número'],
  [/N\uFFFD+MERO/g,            'NÚMERO'],
  [/In\uFFFD+cio/g,            'Início'],
  [/in\uFFFD+cio/g,            'início'],
  [/G\uFFFD+nero/g,            'Gênero'],
  [/g\uFFFD+nero/g,            'gênero'],
  [/Sa\uFFFD+de/g,             'Saúde'],
  [/sa\uFFFD+de/g,             'saúde'],
  [/respons\uFFFD+vel/g,       'responsável'],
  [/Respons\uFFFD+vel/g,       'Responsável'],
  [/Par\uFFFD+grafo/g,         'Parágrafo'],
  [/T\uFFFD+tulo/g,            'Título'],
  [/t\uFFFD+tulo/g,            'título'],
  [/d\uFFFD+bitos/g,           'débitos'],
  [/D\uFFFD+bitos/g,           'Débitos'],
  [/M\uFFFD+todo/g,            'Método'],
  [/m\uFFFD+todo/g,            'método'],
  [/Mar\uFFFD+o/g,             'Março'],
  [/obrigat\uFFFD+rio/g,       'obrigatório'],
  [/Obrigat\uFFFD+rio/g,       'Obrigatório'],
  [/hist\uFFFD+rico/g,         'histórico'],
  [/Hist\uFFFD+rico/g,         'Histórico'],
  [/Voc\uFFFD+ /g,             'Você '],
  [/n\uFFFD+o /g,              'não '],
  [/N\uFFFD+o /g,              'Não '],
  [/n\uFFFD+o-/g,              'não-'],
  [/armazen\uFFFD+-las/g,      'armazená-las'],
  [/Todo dia \uFFFD+ 7h/g,     'Todo dia às 7h'],
  [/Todo dia \uFFFD+/g,        'Todo dia às'],
  [/ \uFFFD+ \{/g,             '° {'],
  [/grupo: '\uFFFD+'/g,        "grupo: '♦'"],
  [/'\uFFFD+',/g,              "'♦',"],
  [/ \uFFFD+ obrig/g,          ' é obrig'],
];

const files = [
  'components/clientes/clientes-view.tsx',
  'components/clientes/tab-financeiro.tsx',
  'components/clientes/tab-anamnese.tsx',
  'components/clientes/tab-linha-do-tempo.tsx',
  'components/clientes/tab-evolucoes.tsx',
  'components/clientes/tab-documentos.tsx',
  'components/clientes/documento-editor.tsx',
  'components/calendario/calendario-view.tsx',
  'components/configuracoes/configuracoes-view.tsx',
  'components/configuracoes/tab-mensagens.tsx',
  'components/configuracoes/senha-form-dialog.tsx',
  'components/configuracoes/shared.tsx',
  'components/configuracoes/signature-dialog.tsx',
  'components/configuracoes/tab-agenda.tsx',
  'components/configuracoes/tab-anamneses.tsx',
  'components/configuracoes/tab-conta.tsx',
  'components/configuracoes/tab-creditos.tsx',
  'components/configuracoes/tab-nfse.tsx',
  'components/configuracoes/tab-salas.tsx',
  'components/configuracoes/tab-senhas.tsx',
  'components/configuracoes/tab-servicos.tsx',
  'components/configuracoes/tab-unidades.tsx',
  'components/configuracoes/tab-whatsapp.tsx',
  'components/dashboard/dashboard-view.tsx',
  'components/financeiro/financeiro-view.tsx',
  'components/financeiro/tab-contas-pagar.tsx',
  'components/financeiro/tab-mensalidades.tsx',
  'components/marketing/marketing-shared.tsx',
  'components/marketing/marketing-view.tsx',
  'components/mensagens/sistema-mensagens-modal.tsx',
  'components/produtos/produtos-view.tsx',
  'components/shell/em-construcao.tsx',
  'components/shell/sidebar.tsx',
  'components/shell/sidebar-context.tsx',
  'components/sites/empresa-agendamento-view.tsx',
  'components/sites/profissional-agendamento-view.tsx',
  'components/avisos/tab-avisos-table.tsx',
  'components/avisos/avisos-view.tsx',
  'components/avisos/tab-aniversarios.tsx',
];

for (const rel of files) {
  const f = path.join(__dirname, rel);
  if (!fs.existsSync(f)) { console.log(`MISSING: ${rel}`); continue; }
  let c = fs.readFileSync(f, 'utf8');
  const before = (c.match(/\uFFFD/g) || []).length;
  if (before === 0) { continue; }

  for (const [re, repl] of regexFixes) {
    c = c.replace(re, repl);
  }

  const after = (c.match(/\uFFFD/g) || []).length;
  fs.writeFileSync(f, c, 'utf8');
  console.log(`${rel}: ${before} -> ${after} FFFD remaining`);
  if (after > 0) {
    const re2 = /(.{0,15})\uFFFD+(.{0,15})/g;
    let m;
    const seen = new Set();
    while ((m = re2.exec(c)) !== null) {
      const k = JSON.stringify(m[1] + '[R]' + m[2]);
      if (!seen.has(k)) { seen.add(k); console.log('  STILL: ' + k); }
    }
  }
}

const R = '\uFFFD';

const fixes = [
  [R + R + 'ES', 'ÕES'],      // AÇ~OES -> AÇÕES  
  ['A' + R + R + 'ES', 'AÇÕES'],
  ['SESS' + R + 'ES', 'SESSÕES'],
  ['Cl' + R + 'nica', 'Clínica'],
  ['cl' + R + 'nica', 'clínica'],
  ['Informa' + R + R + 'es', 'Informações'],
  ['informa' + R + R + 'es', 'informações'],
  ['INFORMA' + R + R + 'ES', 'INFORMAÇÕES'],
  ['Altera' + R + R + 'es', 'Alterações'],
  ['altera' + R + R + 'es', 'alterações'],
  ['Observa' + R + R + 'es', 'Observações'],
  ['observa' + R + R + 'es', 'observações'],
  ['Mar' + R + 'o', 'Março'],
  ['Conv' + R + 'nio', 'Convênio'],
  ['N' + R + 'mero', 'Número'],
  ['In' + R + 'cio', 'Início'],
  ['in' + R + 'cio', 'início'],
  ['SERVI' + R + 'OS', 'SERVIÇOS'],
  ['servi' + R + 'o', 'serviço'],
  ['Servi' + R + 'o', 'Serviço'],
  ['M' + R + 'todo', 'Método'],
  ['m' + R + 'todo', 'método'],
  ['G' + R + 'nero', 'Gênero'],
  ['g' + R + 'nero', 'gênero'],
  ['Sa' + R + 'de', 'Saúde'],
  ['sa' + R + 'de', 'saúde'],
  ['indica' + R + 'o', 'indicação'],
  ['Indica' + R + 'o', 'Indicação'],
  [' ' + R + ' obrig', ' é obrig'],
  [' ' + R + ' ', ' é '],
  ['Confirma' + R + 'o', 'Confirmação'],
  ['confirma' + R + 'o', 'confirmação'],
  ['Remarca' + R + 'o', 'Remarcação'],
  ['remarca' + R + 'o', 'remarcação'],
  ['Indica' + R + 'o', 'Indicação'],
  ['indica' + R + 'o', 'indicação'],
  ['Cobran' + R + 'a', 'Cobrança'],
  ['cobran' + R + 'a', 'cobrança'],
  ['d' + R + 'bitos', 'débitos'],
  ['D' + R + 'bitos', 'Débitos'],
  ['ap' + R + 's', 'após'],
  ['Ap' + R + 's', 'Após'],
  ['Anivers' + R + 'rios', 'Aniversários'],
  ['anivers' + R + 'rios', 'aniversários'],
  ['Anivers' + R + 'rio', 'Aniversário'],
  ['anivers' + R + 'rio', 'aniversário'],
  ['respons' + R + 'vel', 'responsável'],
  ['Respons' + R + 'vel', 'Responsável'],
  ['Par' + R + 'grafo', 'Parágrafo'],
  ['par' + R + 'grafo', 'parágrafo'],
  [R + 'tulo', 'ítulo'],
  ['T' + R + 'tulo', 'Título'],
  ['t' + R + 'tulo', 'título'],
  ['Evolu' + R + R + 'es', 'Evoluções'],
  ['evolu' + R + R + 'es', 'evoluções'],
  ['Fun' + R + R + 'o', 'Função'],
  ['fun' + R + R + 'o', 'função'],
  ['aten' + R + 'o', 'atenção'],
  ['Aten' + R + 'o', 'Atenção'],
  ['op' + R + R + 'o', 'opção'],
  ['Op' + R + R + 'o', 'Opção'],
  ['Colora' + R + R + 'o', 'Coloração'],
  ['n' + R + 'o ', 'não '],
  ['N' + R + 'o ', 'Não '],
  [' n' + R + 'o\n', ' não\n'],
  [' N' + R + 'o\n', ' Não\n'],
  ['Voc' + R + ' ', 'Você '],
  ['voc' + R + ' ', 'você '],
  ['n' + R + 'o-', 'não-'],
  ['armazen' + R + '-las', 'armazená-las'],
  ['Armazen' + R, 'Armazenar'],
  [' ' + R + ' {', '° {'],
  ['grupo: \'' + R + '\'', "grupo: '♦'"],
  ['\'' + R + '\',', "'♦',"],
  ['?? \'' + R + '\'', "?? '♦'"],
  ['a' + R + 'da', 'ainda'],
  ['j' + R, 'já'],
  ['obrigat' + R + 'rio', 'obrigatório'],
  ['Obrigat' + R + 'rio', 'Obrigatório'],
  ['hist' + R + 'rico', 'histórico'],
  ['Hist' + R + 'rico', 'Histórico'],
  ['n' + R + 'mero', 'número'],
  ['profiss' + R + 'o', 'profissão'],
  ['Profiss' + R + 'o', 'Profissão'],
  ['conex' + R + 'o', 'conexão'],
  ['Conex' + R + 'o', 'Conexão'],
  ['configura' + R + R + 'o', 'configuração'],
  ['Configura' + R + R + 'o', 'Configuração'],
  ['notifica' + R + R + 'o', 'notificação'],
  ['Notifica' + R + R + 'o', 'Notificação'],
];

const files = [
  'components/clientes/clientes-view.tsx',
  'components/clientes/tab-financeiro.tsx',
  'components/clientes/tab-anamnese.tsx',
  'components/clientes/tab-linha-do-tempo.tsx',
  'components/clientes/tab-evolucoes.tsx',
  'components/clientes/tab-documentos.tsx',
  'components/clientes/documento-editor.tsx',
  'components/calendario/calendario-view.tsx',
  'components/configuracoes/configuracoes-view.tsx',
  'components/configuracoes/senha-form-dialog.tsx',
  'components/configuracoes/shared.tsx',
  'components/configuracoes/signature-dialog.tsx',
  'components/configuracoes/tab-agenda.tsx',
  'components/configuracoes/tab-anamneses.tsx',
  'components/configuracoes/tab-conta.tsx',
  'components/configuracoes/tab-creditos.tsx',
  'components/configuracoes/tab-nfse.tsx',
  'components/configuracoes/tab-salas.tsx',
  'components/configuracoes/tab-senhas.tsx',
  'components/configuracoes/tab-servicos.tsx',
  'components/configuracoes/tab-unidades.tsx',
  'components/configuracoes/tab-mensagens.tsx',
  'components/configuracoes/tab-whatsapp.tsx',
  'components/dashboard/dashboard-view.tsx',
  'components/financeiro/financeiro-view.tsx',
  'components/financeiro/tab-contas-pagar.tsx',
  'components/financeiro/tab-mensalidades.tsx',
  'components/marketing/marketing-shared.tsx',
  'components/marketing/marketing-view.tsx',
  'components/mensagens/sistema-mensagens-modal.tsx',
  'components/produtos/produtos-view.tsx',
  'components/shell/em-construcao.tsx',
  'components/shell/sidebar.tsx',
  'components/shell/sidebar-context.tsx',
  'components/sites/empresa-agendamento-view.tsx',
  'components/sites/profissional-agendamento-view.tsx',
  'components/avisos/tab-avisos-table.tsx',
  'components/avisos/avisos-view.tsx',
  'components/avisos/tab-aniversarios.tsx',
];

for (const rel of files) {
  const f = path.join(__dirname, rel);
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const before = (c.match(/\uFFFD/g) || []).length;
  if (before === 0) { console.log(`SKIP (clean): ${rel}`); continue; }

  for (const [from, to] of fixes) {
    while (c.includes(from)) c = c.replace(from, to);
  }
  // qualquer FFFD restante: substituir por ? para pelo menos não quebrar o browser
  const after = (c.match(/\uFFFD/g) || []).length;
  fs.writeFileSync(f, c, 'utf8');
  console.log(`${rel}: ${before} -> ${after} FFFD remaining`);
}
