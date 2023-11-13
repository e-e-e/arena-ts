import { ArenaClient } from '../src';
import fetchMock from 'jest-fetch-mock';

function expectHttpError(message: string, status: number) {
  return expect.objectContaining({
    name: 'HttpError',
    message,
    status,
  });
}

describe('ArenaClient', () => {
  const fakeResponseBody = { some: 'data' };
  const fakeDate = { now: () => 12345 };

  function createFetchMockWithSimpleResponse() {
    return fetchMock.mockResponse(JSON.stringify(fakeResponseBody), {
      status: 200,
    });
  }

  function createFetchMockWithErrorResponse(status: number) {
    return fetchMock.mockResponse(JSON.stringify(''), {
      status,
    });
  }

  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('me', () => {
    it('throws 401 HttpError when not authenticated', async () => {
      const fetch = createFetchMockWithErrorResponse(401);
      const client = new ArenaClient({ fetch });
      await expect(client.me()).rejects.toThrowError(
        expectHttpError('Unauthorized', 401)
      );
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith('https://api.are.na/v2/me', {
        headers: expect.objectContaining({
          Authorization: '',
          'Content-Type': 'application/json',
        }),
        method: 'GET',
      });
    });

    it('calls GET /me with authentication and returns body as JSON', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({ token: 'MY_API_TOKEN', fetch });
      await expect(client.me()).resolves.toMatchObject(fakeResponseBody);
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith('https://api.are.na/v2/me', {
        headers: expect.objectContaining({
          Authorization: 'Bearer MY_API_TOKEN',
          'Content-Type': 'application/json',
        }),
        method: 'GET',
      });
    });
  });

  describe('channels', () => {
    describe('with user id', () => {
      it('calls GET /users/:user/channel', async () => {
        const fetch = createFetchMockWithSimpleResponse();
        const client = new ArenaClient({
          token: 'MY_API_TOKEN',
          fetch,
          date: fakeDate,
        });
        await expect(
          client.user(123456).channels()
        ).resolves.toMatchObject(fakeResponseBody);
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toBeCalledWith(
          expect.stringMatching(
            'https://api.are.na/v2/users/123456/channels?'
          ),
          {
            headers: {
              Authorization: 'Bearer MY_API_TOKEN',
              'Content-Type': 'application/json',
            },
            method: 'GET',
          }
        );
      });
    });

    describe('without user id', () => {
      it('calls GET /channels', async () => {
        const fetch = createFetchMockWithSimpleResponse();
        const client = new ArenaClient({
          token: 'MY_API_TOKEN',
          fetch,
          date: fakeDate,
        });
        await expect(client.channels()).resolves.toMatchObject(
          fakeResponseBody
        );
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toBeCalledWith(
          expect.stringMatching('https://api.are.na/v2/channels?'),
          {
            headers: {
              Authorization: 'Bearer MY_API_TOKEN',
              'Content-Type': 'application/json',
            },
            method: 'GET',
          }
        );
      });
    });
    describe('pagination options', () => {
      it('appends date as query string if forceRefresh option is true', async () => {
        const fetch = createFetchMockWithSimpleResponse();
        const client = new ArenaClient({
          token: 'MY_API_TOKEN',
          fetch,
          date: fakeDate,
        });
        await expect(
          client.channels({ forceRefresh: true })
        ).resolves.toMatchObject(fakeResponseBody);
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toBeCalledWith(expect.stringContaining('date=12345'), {
          headers: {
            Authorization: 'Bearer MY_API_TOKEN',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });
      });
    });
  });

  describe('channel', () => {
    it('calls GET /channel/:channel', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        token: 'MY_API_TOKEN',
        fetch,
        date: fakeDate,
      });
      await expect(
        client.channel('fake-channel-id').get()
      ).resolves.toMatchObject(fakeResponseBody);
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        expect.stringMatching('https://api.are.na/v2/channels/fake-channel-id'),
        {
          headers: {
            Authorization: 'Bearer MY_API_TOKEN',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
    });
    it('accepts pagination parameters', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        fetch,
        date: fakeDate,
      });
      await expect(
        client
          .channel('fake-channel-id')
          .get({ per: 1, page: 1, direction: 'asc' })
      ).resolves.toMatchObject(fakeResponseBody);
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id?page=1&per=1&sort=position&direction=asc',
        {
          headers: {
            Authorization: '',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
    });

    describe('pagination options', () => {
      it('appends date as query string if forceRefresh option is true', async () => {
        const fetch = createFetchMockWithSimpleResponse();
        const client = new ArenaClient({
          token: 'MY_API_TOKEN',
          fetch,
          date: fakeDate,
        });
        await expect(
          client.channel('test').get({ forceRefresh: true })
        ).resolves.toMatchObject(fakeResponseBody);
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toBeCalledWith(expect.stringContaining('date=12345'), {
          headers: {
            Authorization: 'Bearer MY_API_TOKEN',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });
      });
    });
  });

  describe('block', () => {
    it('calls GET /block/:block', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        token: 'MY_API_TOKEN',
        fetch,
        date: fakeDate,
      });
      await expect(client.block(3).get()).resolves.toMatchObject(
        fakeResponseBody
      );
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        expect.stringMatching('https://api.are.na/v2/blocks/3'),
        {
          headers: {
            Authorization: 'Bearer MY_API_TOKEN',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
    });
  });

  describe('connect', () => {
    it('throws 401 HttpError when not authenticated', async () => {
      const fetch = createFetchMockWithErrorResponse(401);
      const client = new ArenaClient({ fetch });
      await expect(
        client.channel('fake-channel-id').connect.block(4)
      ).rejects.toThrowError(expectHttpError('Unauthorized', 401));
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id/connections',
        {
          body: '{"connectable_type":"Block","connectable_id":4}',
          headers: {
            Authorization: '',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      );
    });

    it('calls POST /channels/:channel/connections', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        token: 'MY_API_TOKEN',
        fetch,
        date: fakeDate,
      });
      await expect(
        client.channel('fake-channel-id').connect.channel(3)
      ).resolves.toMatchObject(fakeResponseBody);
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id/connections',
        {
          body: '{"connectable_type":"Channel","connectable_id":3}',
          headers: {
            Authorization: 'Bearer MY_API_TOKEN',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      );
    });
    describe('remove', () => {
      it('throws 401 HttpError when not authenticated', async () => {
        const fetch = createFetchMockWithErrorResponse(401);
        const client = new ArenaClient({ fetch });
        await expect(
          client.channel('fake-channel-id').delete()
        ).rejects.toThrowError(expectHttpError('Unauthorized', 401));
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toBeCalledWith(
          'https://api.are.na/v2/channels/fake-channel-id',
          {
            headers: {
              Authorization: '',
              'Content-Type': 'application/json',
            },
            method: 'DELETE',
          }
        );
      });

      describe('with block id', () => {
        it('calls DELETE /channels/:channel/', async () => {
          const fetch = createFetchMockWithSimpleResponse();
          const client = new ArenaClient({
            token: 'MY_API_TOKEN',
            fetch,
            date: fakeDate,
          });
          await expect(
            client.channel('fake-channel-id').disconnect.block(3)
          ).resolves.toBeUndefined();
          expect(fetch).toBeCalledTimes(1);
          expect(fetch).toBeCalledWith(
            'https://api.are.na/v2/channels/fake-channel-id/blocks/3',
            {
              headers: {
                Authorization: 'Bearer MY_API_TOKEN',
                'Content-Type': 'application/json',
              },
              method: 'DELETE',
            }
          );
        });
      });

      describe('without block id', () => {
        it('calls DELETE /channels/:channel/', async () => {
          const fetch = createFetchMockWithSimpleResponse();
          const client = new ArenaClient({
            token: 'MY_API_TOKEN',
            fetch,
            date: fakeDate,
          });
          await expect(
            client.channel('fake-channel-id').delete()
          ).resolves.toBeUndefined();
          expect(fetch).toBeCalledTimes(1);
          expect(fetch).toBeCalledWith(
            'https://api.are.na/v2/channels/fake-channel-id',
            {
              headers: {
                Authorization: 'Bearer MY_API_TOKEN',
                'Content-Type': 'application/json',
              },
              method: 'DELETE',
            }
          );
        });
      });
    });
  });
});
