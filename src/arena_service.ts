import {
  BlockApiType,
  ChannelApiType,
  ConnectionApiType,
  MeApiType,
  PaginationAttributes,
  UserApiType,
} from './arena_api_types';

export class HttpError extends Error {
  readonly name = 'HttpError';

  constructor(message?: string, readonly status: number = 500) {
    super(message);
  }
}

interface ArenaBlockApi {
  get(): Promise<BlockApiType>;

  channels(options?: PaginationAttributes): Promise<ChannelApiType[]>;
}

interface ArenaUserApi {
  get(): Promise<UserApiType>;

  channels(options?: PaginationAttributes): Promise<ChannelApiType[]>;

  following(): Promise<UserApiType[]>;

  followers(): Promise<UserApiType[]>;
}

type ChannelStatus = 'public' | 'closed' | 'private';

interface ArenaChannelApi {
  create(status?: ChannelStatus): Promise<any>;

  get(options?: PaginationAttributes): Promise<ChannelApiType>;

  delete(): Promise<void>;

  update(data: { title: string; status?: ChannelStatus }): Promise<any>;

  thumb(): Promise<ChannelApiType>;

  contents(options?: PaginationAttributes): Promise<any>;

  createBlock(data: {
    source?: string;
    content?: string;
  }): Promise<BlockApiType>;

  connect: {
    block(id: string): Promise<void>;
    channel(slug: string): Promise<void>;
  };
  disconnect: {
    block(id: string): Promise<void>;
    channel(id: string): Promise<void>;
  };

  connections(options?: PaginationAttributes): Promise<ConnectionApiType[]>;
}

interface ArenaSearchApi {
  everything(query: string): Promise<any>;

  users(query: string): Promise<any>;

  channels(query: string): Promise<any>;

  blocks(query: string): Promise<any>;
}

interface ArenaApi {
  /**
   *  Fetch information about current authenticated user.
   */
  me(): Promise<MeApiType>;

  channels(options: PaginationAttributes): Promise<ChannelApiType>;

  user(id: string): ArenaUserApi;

  channel(slug: string): ArenaChannelApi;

  block(id: string): ArenaBlockApi;

  search(): ArenaSearchApi;
}

type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
type Date = { now(): number };

export class ArenaClient implements ArenaApi {
  private readonly domain = 'https://api.are.na/v2/';
  private readonly headers: HeadersInit;
  private readonly fetch: Fetch;
  private readonly date: Date;

  private static defaultPaginationOptions: PaginationAttributes = {
    sort: 'position',
    direction: 'desc',
    per: 50,
  };

  constructor(config?: { token?: string | null; fetch?: Fetch; date?: Date }) {
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: config?.token ? `Bearer ${config.token}` : '',
    };
    this.fetch = config?.fetch || window?.fetch.bind(window);
    this.date = config?.date || Date;
  }

  me() {
    return this.getJson('me');
  }

  channels(options?: PaginationAttributes): Promise<ChannelApiType> {
    const qs = this.paginationQueryString(options);
    const url = `channels/`;
    return this.getJson(`${url}?${qs}`);
  }

  user(id: string): ArenaUserApi {
    return {
      get: (): Promise<UserApiType> => this.getJson(`users/${id}`),
      channels: (options?: PaginationAttributes) =>
        this.getJsonWithPaginationQuery(`users/${id}/channels`, options),
      following: (): Promise<UserApiType[]> =>
        this.getJson(`users/${id}/following`),
      followers: (): Promise<UserApiType[]> =>
        this.getJson(`users/${id}/followers`),
    };
  }

  channel(slug: string): ArenaChannelApi {
    return {
      connect: {
        block: (blockId: string) =>
          this.createConnection(slug, blockId, 'Block'),
        channel: (channelId: string) =>
          this.createConnection(slug, channelId, 'Channel'),
      },
      disconnect: {
        block: (blockId: string) =>
          this.del(`channels/${slug}/blocks/${blockId}`),
        channel: (channelId: string) => {
          throw new Error('Method Not Implemented');
        },
      },
      contents: (options?: PaginationAttributes): Promise<BlockApiType> => {
        return this.getJsonWithPaginationQuery(
          `channels/${slug}/contents`,
          options
        );
      },
      connections: (
        options?: PaginationAttributes
      ): Promise<ConnectionApiType[]> => {
        return this.getJsonWithPaginationQuery(
          `channels/${slug}/connections`,
          options
        );
      },
      create: (status?: ChannelStatus): Promise<any> => {
        return this.postJson('channels', {
          title: slug,
          status,
        });
      },
      update: (data: {
        title: string;
        status?: ChannelStatus;
      }): Promise<any> => {
        return this.putJson(`channels/${slug}`, data);
      },
      createBlock: (data: {
        source?: string;
        content?: string;
      }): Promise<BlockApiType> => {
        return this.postJson(`channels/${slug}/blocks`, data);
      },
      get: (options?: PaginationAttributes): Promise<ChannelApiType> =>
        this.getJsonWithPaginationQuery(`channels/${slug}`, options),
      delete: (): Promise<void> => this.del(`channels/${slug}`),
      thumb: (): Promise<ChannelApiType> =>
        this.getJson(`channels/${slug}/thumb`),
    };
  }

  block(id: string): ArenaBlockApi {
    return {
      channels: (options?: PaginationAttributes): Promise<ChannelApiType[]> =>
        this.getJsonWithPaginationQuery(`blocks/${id}/channels`, options),
      get: (): Promise<BlockApiType> => this.getJson(`blocks/${id}`),
    };
  }

  search(): ArenaSearchApi {
    return {
      everything: (query: string): Promise<any> =>
        this.getJson(`/search?q=${query}`),
      blocks: (query: string): Promise<any> =>
        this.getJson(`/search/blocks?q=${query}`),
      channels: (query: string): Promise<any> =>
        this.getJson(`/search/channels?q=${query}`),
      users: (query: string): Promise<any> =>
        this.getJson(`/search/users?q=${query}`),
    };
  }

  private createConnection(
    channelSlug: string,
    id: string,
    type: 'Block' | 'Channel'
  ) {
    return this.postJson(`channels/${channelSlug}/connections`, {
      connectable_type: type,
      connectable_id: id,
    });
  }

  private getJsonWithPaginationQuery(
    url: string,
    options?: PaginationAttributes
  ) {
    const qs = this.paginationQueryString(options);
    return this.getJson(`${url}?${qs}`);
  }

  private async getJson(endpoint: string) {
    return this.fetch(`${this.domain}${endpoint}`, {
      method: 'GET',
      headers: this.headers,
    }).then((res: Response) => {
      if (res.status === 200) {
        return res.json();
      }
      throw new HttpError(res.statusText, res.status);
    });
  }

  private async putJson(endpoint: string, data?: unknown) {
    return this.fetch(`${this.domain}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined,
    }).then((res) => {
      if (res.status === 200) {
        return undefined;
      }
      throw new HttpError(res.statusText, res.status);
    });
  }

  private async postJson(endpoint: string, data?: unknown) {
    return this.fetch(`${this.domain}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined,
    }).then((res) => {
      if (res.status === 200) {
        return res.json();
      }
      throw new HttpError(res.statusText, res.status);
    });
  }

  private async del(endpoint: string) {
    return this.fetch(`${this.domain}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers,
    }).then((res) => {
      if (res.status === 200) {
        return undefined;
      }
      throw new HttpError(res.statusText, res.status);
    });
  }

  private paginationQueryString(options?: PaginationAttributes) {
    const { page, per, sort, direction, forceRefresh } = {
      ...ArenaClient.defaultPaginationOptions,
      ...options,
    };
    const attrs = [];
    if (page) attrs.push(`page=${page}`);
    if (per) attrs.push(`per=${per}`);
    if (sort) attrs.push(`sort=${sort}`);
    if (direction) attrs.push(`direction=${direction}`);
    if (forceRefresh) attrs.push(`date=${this.date.now()}`);
    return attrs.join('&');
  }
}
