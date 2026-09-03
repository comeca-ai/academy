import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { isProduction, requireDatabaseUrl } from '@/lib/env'

import * as schema from './schema'

/**
 * Conexão única e preguiçosa com o Postgres.
 *
 * O cliente só é criado no primeiro acesso, para que importar este módulo não
 * force a existência de um banco — importa para build e para testes que não
 * tocam persistência. Em desenvolvimento a instância é guardada no escopo
 * global porque o hot reload do Next reavalia os módulos e, sem isso, cada
 * recarga abriria um pool novo até estourar as conexões do servidor.
 */

type Database = ReturnType<typeof criarCliente>

function criarCliente() {
  const sql = postgres(requireDatabaseUrl(), {
    max: isProduction ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
  })
  return drizzle(sql, { schema, casing: 'snake_case' })
}

const cache = globalThis as unknown as { __academyDb?: Database }

let instancia: Database | undefined = cache.__academyDb

export function getDb(): Database {
  if (!instancia) {
    instancia = criarCliente()
    if (!isProduction) cache.__academyDb = instancia
  }
  return instancia
}

export { schema }
