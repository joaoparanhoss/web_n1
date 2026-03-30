# Kanban Pessoal

Sistema web para gerenciamento de tarefas do dia a dia no formato Kanban, permitindo acompanhar atividades de forma visual e intuitiva.

> **Observação:** Este documento é um planejamento inicial e está sujeito a alterações ao longo do desenvolvimento. Funcionalidades, entidades e requisitos podem ser adicionados, removidos ou modificados conforme o projeto evolui.

---

## 1. Domínio do Problema

No cotidiano, é comum perder o controle sobre as tarefas, o que gera falta de foco e produtividade reduzida. Ferramentas genéricas como listas de texto ou planilhas não oferecem a visibilidade necessária para o fluxo de trabalho pessoal.

### Objetivo do Sistema

Criar uma aplicação web que permita ao usuário:

- Criar e organizar tarefas em colunas
- Mover tarefas entre os estágios do fluxo
- Definir prioridades e prazos para cada tarefa
- Acompanhar o progresso de forma visual

---

## 2. Modelagem

### Entidades

#### Usuário
| Campo | Tipo |
|-------|------|
| id | uuid |
| nome | string |
| email | string |
| senha | string |

#### Lista
| Campo | Tipo |
|-------|------|
| id | uuid |
| titulo | string |
| descricao | string |
| usuario_id | uuid (FK) |
| criado_em | timestamp |

#### Coluna
| Campo | Tipo |
|-------|------|
| id | uuid |
| titulo | string |
| ordem | integer |
| lista_id | uuid (FK) |

#### Tarefa
| Campo | Tipo |
|-------|------|
| id | uuid |
| titulo | string |
| descricao | string |
| prioridade | `BAIXA` \| `MÉDIA` \| `ALTA` |
| status | string |
| coluna_id | uuid (FK) |
| lista_id | uuid (FK) |
| data_limite | date |
| criado_em | timestamp |
| atualizado_em | timestamp |

#### Etiqueta
| Campo | Tipo |
|-------|------|
| id | uuid |
| nome | string |
| cor | string |
| tarefa_id | uuid (FK) |

---

## 3. Requisitos Funcionais (RF)

| ID | Descrição |
|----|-----------|
| RF01 | **Autenticação de Usuário** — Registro e login via e-mail e senha. |
| RF02 | **Gerenciamento de Listas** — Criar, editar e excluir listas. |
| RF03 | **Gerenciamento de Colunas** — Criar, renomear, reordenar e excluir colunas dentro de uma lista. |
| RF04 | **Gerenciamento de Tarefas** — Criar tarefas com título, descrição, prioridade e prazo; editar e excluir tarefas. |
| RF05 | **Mover Tarefas** — Arrastar e soltar tarefas entre colunas (drag and drop). |
| RF06 | **Prioridade Visual** — Exibir indicador visual de prioridade (baixa, média, alta) nas tarefas. |
| RF07 | **Etiquetas** — Adicionar etiquetas às tarefas para categorização. |
| RF08 | **Assistente com IA** *(planejado — sujeito a alterações)* — Integração com um modelo de linguagem (LLM) para auxiliar o usuário na gestão das tarefas. Possíveis funcionalidades: sugerir descrições e prioridades ao criar uma tarefa; resumir o estado atual de uma lista; responder perguntas sobre as tarefas em linguagem natural. |

---

## 4. Requisitos Não Funcionais (RNF)

| ID | Descrição |
|----|-----------|
| RNF01 | **Responsividade** — Interface adaptada para desktop e dispositivos móveis. |
| RNF02 | **Persistência de Dados** — Dados armazenados em banco de dados remoto via Supabase. |
| RNF03 | **Autenticação Segura** — Uso do sistema de autenticação nativo do Supabase. |
| RNF04 | **Experiência do Usuário** — Atualizações na tela em tempo real, sem necessidade de recarregar a página. |

---

## 5. Arquitetura

### Nível 1 — Contexto
![C4 Context](https://www.plantuml.com/plantuml/png/NPDBRXD148RtFaMHrLXAR26nOXMJM2J22KF6KSJAgkafJphfHzCF9x3Y45m0iSYA9IVmJJW9rHFRZBDoJtLL_Nz_LJuE4NrCMWrUIIDKQWXkOtJXxNZiyM7KodYRwXJ82siYcJWILe-TGfDhZa9ibAp79s-EoXowlfYDDOP8daEBarpn64SkTn_C9fy_NiyND-VpiyLi-dvwULeC1uCeeo8ubTXwr0YilgcoK5okVwz8mUiX_Ft-0pwWgT50II5Ov7ub-M1DaK92B-qX75o7jFx9nmC-FsV1bqIGebJo6uA58DaPYpZq22rvCaAY1suGW27GadzTLoW360jBwpL6kr4U7R3TwcjkKTnt4TRPDvML9qv9WUkdzIyB3rJ3CYd5YCKz5DeQwydP8J13PpaApdf86fQ-Wzi0QRWY5168mmYJyXokfjKynozjGwExa6jX-kWyI_OiBQQFiGZ9OOs1s4QrENOm54Ri7WFl4AkE2dyQ4WJiNjYClS761YZPLUkf-ZGx14nvthl7S4xQ40v03DC8Tirak-lia6qu2vvGlJIcb6OV-JNSPJQx00wIDzseAl8hkNxg13I_KNKd9KsRiEMk1VBtKXhfXzjPDXPSpiFGZPJHvPBpoVDaGsefnFKVoZOPKz8syFrsn2CeylhI7RSPPfzNfFvlqMwo4y604LOImU2AMixssUxPV5vMN9QhjiazxYNvx6d3imTn3vvdz3K1hVZEXdrsEn4OmmtLbHNt55y8FlEScknERFylJM-DTn8z64qVM5ybRnWB79DfabR_0000)

### Nível 2 — Containers
![C4 Container](https://www.plantuml.com/plantuml/png/VPJFRjj64CRlUegfJp9YKq3HKqzHOZbHAokgA3VeIHWkHzGcorrc_oYsYm9zY3v0YnwA5kYfw1FmJVeadQLeIYBYdBHSpiptc_c6UkuyMXzADVX2Qg52Jh3rld9VZqOMFoQ5zDkG1KTM6Er9-qIOSbGfr37dqlbSoMpqyglBHRowlPcDIdIUB5-jNt86IaqsgMBzmMpymvlRrVhjTFLwFPkyciolXkU3WPTU4Ln9B2oM2ApVvJaOpkk_TwJWotFux-TVu5lK6MfOa7C6kUA2OumU1XVGIdC1PxSkrB_nyOpF-oZu40WAigI5HE101zmmRVYtQWAaIyuO8xrdx7BzmWITexqVlc-akCofvjav_3WO0C21ShYnpMXo3hvkZr5_IIWyF8FLVKMfiBAA3zzBJ_7bbCFi1WN1HyeWDn1QyWGcTp8ZK9ADSHSWZ0gQOQd3rWOsnfReJJkF1D9G6UjvU1OBG9tpmLISWZwWaWzO_r7_Re1Au1Oh0vPGSTFzFZ8Kx_TjZ1TJM4xILIITcvoITmwUCLXboRcJbff1MoFu7e7XB7q8qaaM_9TSxEjnE4aZLFzPDb6cwSqIUyvH19gA-XyXcH5sJ9pZOm4kMYafzXqqp3zrNatk_D252ZDqjCRWjyoIjiymvkS8z-hHUXFbUAWsYYXJICruhfkxWnq7qMM9Kd608xr5rlkqM9uTIrsXRmvHxWLgOM97ESRg2-DyOIdzRfR0c3rx88q7oOk-onUToGJa9QykltsI8jhePKd7BClsBh9S6wj9d6m1p_Hq3PgktrAM6lRUyyV2ssDQU1UNXikHRHwrWInsr-THgcnNXjkUpMw0Bybg4n5kU7bKCmybTH6mOF4ARNG3dUFcINkAhwVZ18RnRuNUiTXvb5YIEdpPHz_Ok5cs1bpZZWgEjr7hzMgrI3anvXt23qjzZG-zzQn_1SRkSc7KB3t_V9E-cRULklp-fer3X9VYoCy-HJ-tNPnP_LVqrmbBktPHdkR_bDjB4fHztjTOiBErZxDtRABZ24KKklE6YUo-h0i5EHzBzYV3TPvpWL2g_m40)

### Nível 3 — Componentes (Frontend)
![C4 Component](https://www.plantuml.com/plantuml/png/VLNDSYD53BxxAKHEsSAn3t3QqswSG58ah8aTE51KIfvMnarwkeUMsYHBKSL3y08B1sgfuiY5gz-49w75_6JMtir9BPMa_gHFhNx1Wb5IvKOVML-uP0ZM8ZK_dquZ_ZWfhQpJAZ758dWXBvCYLDFQeTUO8nRZx6ew-_HehgRhoujfXImKi-bc5gewU8sfDVz8h3Y24ujbn0h14FGUn73uvVQl3Jduv1dy-ykly5aCUf-1Bz2lqCESc0FcB7EA7FnXueJHXZ4SN7FQlid7WtnklE27H51I95zOXEp881ZfDikQrC7ovE3PQBHuOA7gvlHU3ZdLk4AcbqdMES-YLK5rJVnvbmsJTi4MkFrZ-tk0JJRHKONM0G6JNwDcVa_Ya-DXsXCKFP2cFaPV1Es6GHCOve6bZBJuwk83cQu8dTYAXlawc-PxAGcTVQq0_oO6ga0ejnbYzW75-msj5g6u8z4BHhFW1QsdU7CSaZSO7mvlszxdP3qDt-Oh2e6FOVbGqwA8jbRbQolqtS4p-6aq0e17FWzhB8cL49MAgWdl7LXj5w6qVfp1brPdPWndGSkQkgpYzBar-SnK7QcE4tWLCwyi4IjOXt37G50C1gZ6Y51fDH6KSNAeDEy0qp6cUr5ioksiKOS8UyCbUjc-hI00iQ09KBgmGWU6TgPW0gVtTMusi2tzUQv8vNNTo5T9W210M7rF4a2VqZughKSXdQaSW4aieOBUceClB2luzgG7cWMNAjyObyXtF85kNAiEkWi5kd4MQAmlWO1Y30nrYA2563IqZuefRcn12cpH7XN5O08kWqckiIf9hTSOYg2GUbKogbQPm3a7XnL8CAZy9T-rKJK8q0tr-xXhJugeDtzmlCu8ZKxLFDeD2bs591dBGb0I7wCfAVFcgChkWM5ZEQ5bY9J4vkUpVRCXo_iO91VFRHDskt7kXU8jjcqoA4qTmXFGiOge5st_oGLdQP3xrlDpK3Pn3CgbptAf-ohBwsRDxUFeji7CsQmETq5ZKGIwchdhPjEJSy-o_Kr7em62O08KaL3QJ1FGEp2ATMiqg1EYL0M6mD0D113Kv08CNf0Y_7aqkYBtk9gx9Q1zYVaCIZ22xThqFqdBvNoHOpMmzHyyqOljd-q4xx-wTuEw5pHROuMDzivqxruncAGhyeQYVOt3TTBwjscxmliBgktRfYkcRqiVyuX_ZwHhHjrJUzy8GV3QJ1rEoZVuiWFSvduoMLwBqHA33x12NtITsGtO-UEo640OSF5ayCbnHmiG5v4sxR_LnyCKhauNowVJ33-nKowI8D2cUOY6W8cvXTJ_LVfLlI1lKkN-0m00)

### Frontend
- **React** — biblioteca para construção da interface
- **TypeScript** — tipagem estática
- **TailwindCSS** — estilização utilitária
- **Vite** — bundler e servidor de desenvolvimento

### Backend
- **Node.js** — runtime JavaScript server-side
- **Express** — framework para criação de rotas e middlewares da API REST
- **TypeScript** — tipagem estática
- **Supabase (PostgreSQL + Auth + Realtime)** — banco de dados, autenticação e sincronização em tempo real

### IA *(planejado)*
- API de um LLM externo (a definir)

---

## 6. Organização de Tarefas

### Ferramentas
- **ClickUp** — gerenciamento de tarefas e sprints
- **Git + GitHub** — versionamento do código