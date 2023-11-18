const { google } = require('googleapis');
const fs = require('fs');

// Carregue as credenciais do arquivo JSON
const credentials = JSON.parse(fs.readFileSync('credentials.json'));

// Configuração do cliente OAuth
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Se as credenciais não existirem, inicie o fluxo de autorização.
const tokenPath = 'token.json';

// Verifique se já temos um token de acesso
fs.readFile(tokenPath, (err, token) => {
  if (err) {
    return getAccessToken(oAuth2Client);
  }
  oAuth2Client.setCredentials(JSON.parse(token));
  criarEvento(oAuth2Client);
});

// Função para obter o token de acesso
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });

  console.log('Autorize este aplicativo visitando esta URL:', authUrl);

  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Digite o código da autenticação do navegador:', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Erro ao obter token de acesso:', err);
      oAuth2Client.setCredentials(token);
      // Salve o token para posterior uso
      fs.writeFileSync(tokenPath, JSON.stringify(token));
      criarEvento(oAuth2Client);
    });
  });
}

// Função para criar um evento
function criarEvento(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  const evento = {
    'summary': 'Nome do Evento',
    'description': 'Descrição do Evento',
    'start': {
      'dateTime': '2023-01-01T10:00:00', // Substitua com a data e hora de início desejadas
      'timeZone': 'America/Sao_Paulo', // Substitua com o fuso horário desejado
    },
    'end': {
      'dateTime': '2023-01-01T12:00:00', // Substitua com a data e hora de término desejadas
      'timeZone': 'America/Sao_Paulo', // Substitua com o fuso horário desejado
    },
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };

  calendar.events.insert({
    calendarId: 'primary',
    resource: evento,
  }, (err, res) => {
    if (err) return console.error('Erro ao criar evento:', err);
    console.log('Evento criado:', res.data);
  });
}
