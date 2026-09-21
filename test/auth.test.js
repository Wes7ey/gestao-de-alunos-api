import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import app from '../src/app.js';
import {
  loginAsAdmin,
  loginAsAluno,
  createAlunoAsAdmin,
  createDisciplinaAsAdmin,
  matricularAlunoEmDisciplina,
  registrarTrabalhoComoAluno,
} from './helpers/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'data', 'api-flow-data.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

describe('API - autenticação e fluxo principal', () => {
  for (const scenario of testData.adminLoginScenarios) {
    it(`deve validar login do admin com cenário: ${scenario.name}`, async () => {
      if (scenario.expectedStatus === 200) {
        const resultado = await loginAsAdmin(app, scenario.credentials);
        expect(resultado).to.have.property('token');
        expect(resultado.usuario).to.include({ email: scenario.credentials.email, role: 'admin' });
        return;
      }

      const resposta = await (await import('supertest')).default(app)
        .post('/api/auth/login')
        .send(scenario.credentials);

      expect(resposta.status).to.equal(scenario.expectedStatus);
      if (scenario.expectedStatus === 401) {
        expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
      }
    });
  }

  it('deve permitir que o administrador cadastre um aluno, o aluno faça login e registre entrega de trabalho', async () => {
    const admin = await loginAsAdmin(app, testData.adminLoginScenarios[0].credentials);
    const alunoPayload = testData.studentRegistration;

    const alunoCriado = await createAlunoAsAdmin(app, admin.token, alunoPayload);
    expect(alunoCriado).to.have.property('id');
    expect(alunoCriado.email).to.equal(alunoPayload.email);

    const alunoLogin = await loginAsAluno(app, {
      email: alunoPayload.email,
      senha: alunoPayload.senha,
    });

    expect(alunoLogin.usuario).to.include({ email: alunoPayload.email, role: 'aluno' });

    const disciplina = await createDisciplinaAsAdmin(app, admin.token, testData.disciplina);
    const disciplinaId = disciplina.id ?? disciplina._id;

    await matricularAlunoEmDisciplina(app, admin.token, disciplinaId, alunoCriado.id);

    const respostaTrabalho = await registrarTrabalhoComoAluno(app, alunoLogin.token, alunoCriado.id, {
      disciplinaId,
      titulo: testData.trabalho.titulo,
      descricao: testData.trabalho.descricao,
    });

    expect(respostaTrabalho.status).to.equal(201);
    expect(respostaTrabalho.body).to.include({
      titulo: testData.trabalho.titulo,
      alunoId: alunoCriado.id,
      disciplinaId,
    });
  });
});
