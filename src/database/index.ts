import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (): Promise<Connection> => {
  const options = await getConnectionOptions();

  return createConnection(
    Object.assign(options, {
      database: process.env.NODE_ENV === 'test' ? 'fin_api_test' : options.database
    })
  );
}
