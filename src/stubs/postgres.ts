// Browser stub: the Agent-Native action graph statically imports a database
// driver module, but ProposalPilot's actions never open a database connection
// (they are pure functions plus browser localStorage). This stub exists only
// so the browser bundle can build; it must never be used to claim a database
// is connected.
export default function postgres(): never {
  throw new Error("Postgres is not available in the browser demo.");
}
export const sql = postgres;
