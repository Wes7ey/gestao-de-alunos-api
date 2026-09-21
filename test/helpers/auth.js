import request from 'supertest';

export async function loginAsAdmin(app, credentials) {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);

  if (response.status !== 200) {
    throw new Error(`Falha ao logar como admin: ${response.status} - ${response.body?.error || response.text}`);
  }

  return response.body;
}

export async function loginAsAluno(app, credentials) {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);

  if (response.status !== 200) {
    throw new Error(`Falha ao logar como aluno: ${response.status} - ${response.body?.error || response.text}`);
  }

  return response.body;
}

export async function createAlunoAsAdmin(app, token, alunoPayload) {
  const response = await request(app)
    .post('/api/admin/alunos')
    .set('Authorization', `Bearer ${token}`)
    .send(alunoPayload);

  if (response.status !== 201) {
    throw new Error(`Falha ao criar aluno: ${response.status} - ${response.body?.error || response.text}`);
  }

  return response.body;
}

export async function createDisciplinaAsAdmin(app, token, disciplinaPayload) {
  const response = await request(app)
    .post('/api/admin/disciplinas')
    .set('Authorization', `Bearer ${token}`)
    .send(disciplinaPayload);

  if (response.status !== 201) {
    throw new Error(`Falha ao criar disciplina: ${response.status} - ${response.body?.error || response.text}`);
  }

  return response.body;
}

export async function matricularAlunoEmDisciplina(app, token, disciplinaId, alunoId) {
  const response = await request(app)
    .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
    .set('Authorization', `Bearer ${token}`)
    .send({ alunoId });

  if (response.status !== 201) {
    throw new Error(`Falha ao matricular aluno: ${response.status} - ${response.body?.error || response.text}`);
  }

  return response.body;
}

export async function registrarTrabalhoComoAluno(app, token, alunoId, payload) {
  const response = await request(app)
    .post(`/api/alunos/${alunoId}/trabalhos`)
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  return response;
}
