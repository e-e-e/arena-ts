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
          client.channels({ userId: 'fake-user-id' })
        ).resolves.toMatchObject(fakeResponseBody);
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toBeCalledWith(
          expect.stringMatching(
            'https://api.are.na/v2/users/fake-user-id/channels?'
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
  });

  describe('channel', () => {
    it('calls GET /channel/:channel', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        token: 'MY_API_TOKEN',
        fetch,
        date: fakeDate,
      });
      await expect(client.channel('fake-channel-id')).resolves.toMatchObject(
        fakeResponseBody
      );
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
      await expect(client.channel('fake-channel-id', { per: 1, page: 1, direction: "asc" })).resolves.toMatchObject(
        fakeResponseBody
      );
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id?page=1&per=1&sort=position&direction=asc&date=12345',
        {
          headers: {
            Authorization: '',
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
    })
  });

  describe('block', () => {
    it('calls GET /block/:block', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        token: 'MY_API_TOKEN',
        fetch,
        date: fakeDate,
      });
      await expect(client.block('fake-block-id')).resolves.toMatchObject(
        fakeResponseBody
      );
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        expect.stringMatching('https://api.are.na/v2/blocks/fake-block-id'),
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

  describe('sort', () => {
    it('throws 401 HttpError when not authenticated', async () => {
      const fetch = createFetchMockWithErrorResponse(401);
      const client = new ArenaClient({ fetch });
      await expect(
        client.sort('fake-channel-id', ['1', '3', '2'])
      ).rejects.toThrowError(expectHttpError('Unauthorized', 401));
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id/sort',
        {
          body: '{"ids":["1","3","2"]}',
          headers: {
            Authorization: '',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        }
      );
    });

    it('calls PUT /channels/:channel/sort', async () => {
      const fetch = createFetchMockWithSimpleResponse();
      const client = new ArenaClient({
        token: 'MY_API_TOKEN',
        fetch,
        date: fakeDate,
      });
      await expect(client.sort('fake-channel-id', ['1', '3', '2'])).resolves
        .toBeUndefined;
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id/sort',
        {
          body: '{"ids":["1","3","2"]}',
          headers: {
            Authorization: 'Bearer MY_API_TOKEN',
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        }
      );
    });
  });

  describe('connect', () => {
    it('throws 401 HttpError when not authenticated', async () => {
      const fetch = createFetchMockWithErrorResponse(401);
      const client = new ArenaClient({ fetch });
      await expect(
        client.connect('fake-channel-id', 'another-id', 'Block')
      ).rejects.toThrowError(expectHttpError('Unauthorized', 401));
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id/connections',
        {
          body: '{"connectable_type":"Block","connectable_id":"another-id"}',
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
      await expect(client.connect('fake-channel-id', 'another-id', 'Channel'))
        .resolves.toBeUndefined;
      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toBeCalledWith(
        'https://api.are.na/v2/channels/fake-channel-id/connections',
        {
          body: '{"connectable_type":"Channel","connectable_id":"another-id"}',
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
        await expect(client.remove('fake-channel-id')).rejects.toThrowError(
          expectHttpError('Unauthorized', 401)
        );
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
          await expect(client.remove('fake-channel-id', 'block-id')).resolves
            .toBeUndefined;
          expect(fetch).toBeCalledTimes(1);
          expect(fetch).toBeCalledWith(
            'https://api.are.na/v2/channels/fake-channel-id/blocks/block-id',
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
          await expect(client.remove('fake-channel-id')).resolves.toBeUndefined;
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
