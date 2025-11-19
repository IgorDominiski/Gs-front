import { writeFile } from 'node:fs/promises';

const firstNames = [
  'Ana','Bruno','Carlos','Daniela','Eduardo','Fernanda','Guilherme','Helena','Igor','Juliana',
  'Karina','Luiz','Marina','Nicolas','Olivia','Paulo','Queila','Rafael','Sofia','Tiago',
  'Ursula','Vitor','Willian','Ximena','Yago','Zuleica'
];

const lastNames = [
  'Silva','Souza','Almeida','Oliveira','Costa','Rocha','Fernandes','Moraes','Barbosa','Carvalho',
  'Dias','Esteves','Farias','Gomes','Henrique','Ibiapina','Jesus','Lima','Macedo','Novaes'
];

const roles = [
  'Engenheiro(a) de Software','UX/UI Designer','Product Manager','Cientista de Dados','Desenvolvedor(a) Front-end',
  'Desenvolvedor(a) Back-end','Analista de Segurança','Especialista em IA','Arquiteto(a) Cloud','Tech Lead'
];

const areas = ['Tecnologia', 'Design', 'Dados', 'Produto', 'Inovação'];

const locations = [
  'São Paulo/SP','Rio de Janeiro/RJ','Belo Horizonte/MG','Curitiba/PR','Porto Alegre/RS',
  'Brasília/DF','Recife/PE','Salvador/BA','Florianópolis/SC','Fortaleza/CE'
];

const techStacks = [
  ['React','TypeScript','Tailwind','Node.js','GraphQL'],
  ['Vue.js','JavaScript','Sass','Firebase','Figma'],
  ['Python','TensorFlow','Pandas','SQL','Docker'],
  ['Java','Spring Boot','Kubernetes','Azure','Microservices'],
  ['Go','PostgreSQL','gRPC','AWS Lambda','Terraform'],
  ['Flutter','Dart','Supabase','CI/CD','Jest'],
];

const softSkills = [
  'Comunicação','Colaboração','Adaptabilidade','Pensamento crítico','Resiliência','Criatividade','Liderança','Gestão do tempo'
];

const hobbies = ['Fotografia','Ciclismo','Culinária','Corrida','Yoga','Xadrez','Música','Voluntariado'];

const interests = ['IA ética','Educação','Saúde digital','Cidades inteligentes','Sustentabilidade','Futuro do trabalho'];

const certifications = [
  'AWS Certified Solutions Architect','Scrum Master','Design Thinking Expert','Google Data Engineer','Azure AI Fundamentals'
];

const degrees = [
  { curso: 'Engenharia de Computação', instituicao: 'FIAP', ano: 2020 },
  { curso: 'Design Digital', instituicao: 'PUC-SP', ano: 2021 },
  { curso: 'Ciência da Computação', instituicao: 'USP', ano: 2019 },
  { curso: 'Análise e Desenvolvimento de Sistemas', instituicao: 'SENAI', ano: 2018 },
  { curso: 'Sistemas de Informação', instituicao: 'Mackenzie', ano: 2022 }
];

const companies = ['Nubank','Itaú','Magazine Luiza','Loft','Stone','Wildlife','Sebrae','XP Inc.'];

const languages = [
  { idioma: 'Inglês', nivel: 'Avançado' },
  { idioma: 'Espanhol', nivel: 'Intermediário' },
  { idioma: 'Francês', nivel: 'Básico' }
];

function pickRandom(arr, idx) {
  return arr[idx % arr.length];
}

function getSubset(arr, size) {
  const result = [];
  for (let i = 0; i < size; i += 1) {
    result.push(arr[(i + Math.floor(Math.random() * arr.length)) % arr.length]);
  }
  return Array.from(new Set(result));
}

const profiles = Array.from({ length: 60 }, (_, index) => {
  const first = pickRandom(firstNames, index);
  const last = pickRandom(lastNames, index + 3);
  const fullName = `${first} ${last}`;
  const role = pickRandom(roles, index + 5);
  const area = pickRandom(areas, index + 7);
  const location = pickRandom(locations, index + 11);
  const tech = pickRandom(techStacks, index);
  const degree = degrees[index % degrees.length];

  return {
    id: index + 1,
    nome: fullName,
    foto: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
    cargo: role,
    resumo: `${role} com foco em soluções que unam impacto social e inovação para o futuro do trabalho.`,
    localizacao: location,
    area,
    habilidadesTecnicas: tech,
    softSkills: getSubset(softSkills, 4),
    experiencias: [
      {
        empresa: pickRandom(companies, index + 2),
        cargo: role,
        inicio: '2022-01',
        fim: 'Atual',
        descricao: 'Liderança de squads multidisciplinares e construção de produtos centrados em pessoas.'
      },
      {
        empresa: pickRandom(companies, index + 4),
        cargo: 'Consultor(a) Especialista',
        inicio: '2019-03',
        fim: '2021-12',
        descricao: 'Implementação de boas práticas de colaboração remota e automação de fluxos.'
      }
    ],
    formacao: [degree],
    projetos: [
      {
        titulo: 'Plataforma Colab Futuro',
        link: 'https://example.com/projeto-colab',
        descricao: 'Marketplace de competências para projetos de impacto socioambiental.'
      },
      {
        titulo: 'Mentoria Talentos 4.0',
        link: 'https://example.com/mentoria40',
        descricao: 'Programa de apoio à recolocação com foco em soft skills.'
      }
    ],
    certificacoes: [pickRandom(certifications, index), pickRandom(certifications, index + 2)],
    idiomas: [languages[index % languages.length], languages[(index + 1) % languages.length]],
    areaInteresses: getSubset(interests, 3),
    hobbies: getSubset(hobbies, 2)
  };
});

const outputUrl = new URL('../public/data/professionals.json', import.meta.url);
await writeFile(outputUrl, JSON.stringify(profiles, null, 2));
console.log(`Gerados ${profiles.length} perfis em ${outputUrl.pathname}`);
