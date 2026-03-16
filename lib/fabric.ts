/**
 * Microsoft Fabric SQL endpoint connection helper.
 *
 * In production, this connects to the Fabric SQL Analytics Endpoint using
 * the mssql package with Azure AD / Entra ID authentication.
 *
 * For development, it returns mock data based on the SQL content.
 * Replace the executeQuery implementation when you have a real Fabric endpoint.
 *
 * Required env vars (production):
 *   FABRIC_SQL_ENDPOINT   - e.g. abc123.datawarehouse.fabric.microsoft.com
 *   AZURE_CLIENT_ID       - Service principal or managed identity client ID
 *   AZURE_TENANT_ID       - Azure tenant ID
 *   AZURE_CLIENT_SECRET   - (if using service principal)
 */

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
};

const IS_MOCK = !process.env.FABRIC_SQL_ENDPOINT;

export async function executeQuery(sql: string): Promise<QueryResult> {
  if (IS_MOCK) {
    return executeMockQuery(sql);
  }

  return executeRealQuery(sql);
}

async function executeMockQuery(_sql: string): Promise<QueryResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400));

  // The actual mock results are driven by the question in sql-generator.ts
  // This is a fallback if no mock matched
  return {
    columns: ["Result"],
    rows: [["No mock data for this query — connect to Fabric for real results"]],
  };
}

async function executeRealQuery(sql: string): Promise<QueryResult> {
  // TODO: Replace with real mssql + Fabric connection
  // Example using mssql package (add to dependencies: npm install mssql @azure/identity):
  //
  // import sql from 'mssql';
  // import { DefaultAzureCredential } from '@azure/identity';
  //
  // const credential = new DefaultAzureCredential();
  // const token = await credential.getToken('https://database.windows.net/.default');
  //
  // const pool = await sql.connect({
  //   server: process.env.FABRIC_SQL_ENDPOINT!,
  //   authentication: {
  //     type: 'azure-active-directory-access-token',
  //     options: { token: token.token },
  //   },
  //   options: { encrypt: true, trustServerCertificate: false },
  // });
  //
  // const result = await pool.request().query(sql);
  // const columns = result.recordset.columns ? Object.keys(result.recordset.columns) : [];
  // const rows = result.recordset.map(row => columns.map(col => row[col]));
  // return { columns, rows };

  console.warn("[fabric.ts] Real Fabric query not yet implemented — returning empty result");
  return { columns: [], rows: [] };
}
