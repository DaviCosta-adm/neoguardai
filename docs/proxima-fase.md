# Próxima fase — ordem revisada

Base do SaaS na seguinte ordem:

1. Modelo de dados mínimo (Instituição, Usuário, Aluno, Alerta, Intervenção, Risco) ✅
2. Layout do dashboard + sidebar e header ✅
3. Home da coordenação + lista + ficha do aluno (mock tipado) ✅
4. Score de risco explicável + alertas + intervenções ✅
5. Autenticação + multi-tenant ✅
6. Persistência e integração de dados reais ← próximo (store em memória já preparado)
7. Relatórios → módulo de especialistas → IA avançada / modelo preditivo

## Auth demo

Senha de todas as contas: `demo123`

| E-mail | Perfil | Instituição |
| --- | --- | --- |
| ana@horizonte.edu.br | Coordenação | Colégio Horizonte |
| carlos@horizonte.edu.br | Especialista | Colégio Horizonte |
| admin@horizonte.edu.br | Admin instituição | Colégio Horizonte |
| maria@aurora.edu.br | Coordenação | Escola Aurora |
| suporte@neoguard.ai | Admin NeoGuardAI | — |

Configure `AUTH_SECRET` (veja `.env.example`).
