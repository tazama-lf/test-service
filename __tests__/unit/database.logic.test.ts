import type { QueryResult } from 'pg';
import handleExecuteSqlStatement from '../../src/database.logic.service';

jest.mock('../../src', () => {
  const rawHistoryQuery = jest.fn();
  const eventHistoryQuery = jest.fn();
  const evaluationQuery = jest.fn();

  return {
    databaseManager: {
      _rawHistory: { query: rawHistoryQuery },
      _eventHistory: { query: eventHistoryQuery },
      _evaluation: { query: evaluationQuery },
    },
    loggerService: {
      log: jest.fn(),
    },
    __mocks__: {
      rawHistoryQuery,
      eventHistoryQuery,
      evaluationQuery,
    },
  };
});

const { loggerService, __mocks__ } = jest.requireMock('../../src');

describe('handleExecuteSqlStatement', () => {
  const baseQuery = { text: 'SELECT 1 WHERE $1 = $2', values: [1, 1] as any[] };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes to _rawHistory when databaseName = "raw_history"', async () => {
    const rows = [{ ok: true }];
    __mocks__.rawHistoryQuery.mockResolvedValue({
      rows,
      rowCount: rows.length,
    } as QueryResult<any>);

    const res = await handleExecuteSqlStatement(baseQuery, 'raw_history');

    expect(__mocks__.rawHistoryQuery).toHaveBeenCalledWith(baseQuery.text, baseQuery.values);
    expect(__mocks__.eventHistoryQuery).not.toHaveBeenCalled();
    expect(__mocks__.evaluationQuery).not.toHaveBeenCalled();

    expect(res.rows).toEqual(rows);

    expect(loggerService.log).toHaveBeenCalledWith('Started handling execution of the sql statement');
    expect(loggerService.log).not.toHaveBeenCalledWith(expect.stringContaining('Failed executing the query'), expect.any(String));
  });

  it('routes to _eventHistory when databaseName = "event_history"', async () => {
    __mocks__.eventHistoryQuery.mockResolvedValue({
      rows: [{ e: 1 }],
      rowCount: 1,
    } as QueryResult<any>);

    const res = await handleExecuteSqlStatement(baseQuery, 'event_history');

    expect(__mocks__.eventHistoryQuery).toHaveBeenCalledWith(baseQuery.text, baseQuery.values);
    expect(res.rowCount).toBe(1);
  });

  it('routes to _evaluation when databaseName = "evaluation"', async () => {
    __mocks__.evaluationQuery.mockResolvedValue({
      rows: [{ ev: 1 }],
      rowCount: 1,
    } as QueryResult<any>);

    const res = await handleExecuteSqlStatement(baseQuery, 'evaluation');

    expect(__mocks__.evaluationQuery).toHaveBeenCalledWith(baseQuery.text, baseQuery.values);
    expect(res.rows).toEqual([{ ev: 1 }]);
  });

  it('throws if databaseName is unknown (switch default)', async () => {
    await expect(handleExecuteSqlStatement(baseQuery, 'does_not_exist' as any)).rejects.toThrow('Specified database was not found.');

    expect(loggerService.log).toHaveBeenCalledWith('Started handling execution of the sql statement');
  });

  it('rethrows query errors with original message and logs failure', async () => {
    __mocks__.evaluationQuery.mockRejectedValue(new Error('test!'));

    await expect(handleExecuteSqlStatement(baseQuery, 'evaluation')).rejects.toThrow('test!');

    expect(loggerService.log).toHaveBeenCalledWith('Started handling execution of the sql statement');

    expect(loggerService.log).toHaveBeenCalledWith(
      'Failed executing the query from database service with error message: test!',
      'handlePostExecuteSqlStatement()',
    );
  });
});
