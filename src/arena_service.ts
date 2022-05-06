import {
  GetChannelsApiResponse,
  GetConnectionsApiResponse,
  MeApiResponse,
  PaginationAttributes,
  GetGroupApiResponse,
  GetGroupChannelsApiResponse,
  SearchApiResponse,
  GetBlockApiResponse,
  CreateBlockApiResponse,
  GetBlockChannelsApiResponse,
  CreateChannelApiResponse,
  GetChannelThumbApiResponse,
  GetChannelContentsApiResponse,
  ChannelConnectBlockApiResponse,
  ChannelConnectChannelApiResponse,
  GetUserChannelsApiResponse,
  GetUserApiResponse,
  GetUserFollowersApiResponse,
  GetUserFollowingApiResponse,
} from './arena_api_types';

export class HttpError extends Error {
  readonly name = 'HttpError';

  constructor(message?: string, readonly status: number = 500) {
    super(message);
  }
}

export interface ArenaBlockApi {
  get(): Promise<GetBlockApiResponse>;

  channels(
    options?: PaginationAttributes
  ): Promise<GetBlockChannelsApiResponse[]>;

  update(data: {
    title?: string;
    description?: string;
    content?: string;
  }): Promise<undefined>;
}

export interface ArenaUserApi {
  get(): Promise<GetUserApiResponse>;

  channels(
    options?: PaginationAttributes
  ): Promise<GetUserChannelsApiResponse[]>;

  following(): Promise<GetUserFollowingApiResponse[]>;

  followers(): Promise<GetUserFollowersApiResponse[]>;
}

export type ChannelStatus = 'public' | 'closed' | 'private';

export interface ArenaGroupApi {
  get(): Promise<GetGroupApiResponse>;

  channels(
    options?: PaginationAttributes
  ): Promise<GetGroupChannelsApiResponse>;
}

export interface ArenaChannelApi {
  create(status?: ChannelStatus): Promise<CreateChannelApiResponse>;

  get(options?: PaginationAttributes): Promise<GetChannelsApiResponse>;

  delete(): Promise<undefined>;

  update(data: { title: string; status?: ChannelStatus }): Promise<undefined>;

  thumb(): Promise<GetChannelThumbApiResponse>;

  contents(
    options?: PaginationAttributes
  ): Promise<GetChannelContentsApiResponse>;

  createBlock(data: {
    source?: string;
    content?: string;
    description?: string;
  }): Promise<CreateBlockApiResponse>;

  connect: {
    block(id: number): Promise<ChannelConnectBlockApiResponse>;
    channel(id: number): Promise<ChannelConnectChannelApiResponse>;
  };
  disconnect: {
    block(id: number): Promise<void>;
    channel(id: number): Promise<void>;
  };

  connections(
    options?: PaginationAttributes
  ): Promise<GetConnectionsApiResponse[]>;
}

export interface ArenaSearchApi {
  everything(
    query: string,
    options?: PaginationAttributes
  ): Promise<SearchApiResponse>;

  users(
    query: string,
    options?: PaginationAttributes
  ): Promise<SearchApiResponse>;

  channels(
    query: string,
    options?: PaginationAttributes
  ): Promise<SearchApiResponse>;

  blocks(
    query: string,
    options?: PaginationAttributes
  ): Promise<SearchApiResponse>;
}

export interface ArenaApi {
  /**
   *  Fetch information about current authenticated user.
   */
  me(): Promise<MeApiResponse>;

  channels(options?: PaginationAttributes): Promise<GetChannelsApiResponse>;

  user(id: string): ArenaUserApi;

  group(slug: string): ArenaGroupApi;

  channel(slug: string): ArenaChannelApi;

  block(id: number): ArenaBlockApi;

  readonly search: ArenaSearchApi;
}

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
export type Date = { now(): number };

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
    this.fetch = config?.fetch || (window?.fetch.bind(window) as any as Fetch);
    this.date = config?.date || Date;
  }

  me() {
    return this.getJson('me');
  }

  channels(options?: PaginationAttributes): Promise<GetChannelsApiResponse> {
    return this.getJsonWithPaginationQuery('channels', options);
  }

  user(id: string): ArenaUserApi {
    return {
      get: (): Promise<GetUserApiResponse> => this.getJson(`users/${id}`),
      channels: (options?: PaginationAttributes) =>
        this.getJsonWithPaginationQuery(`users/${id}/channels`, options),
      following: (): Promise<GetUserFollowingApiResponse[]> =>
        this.getJson(`users/${id}/following`),
      followers: (): Promise<GetUserFollowersApiResponse[]> =>
        this.getJson(`users/${id}/followers`),
    };
  }

  group(slug: string): ArenaGroupApi {
    return {
      get: () => this.getJson(`groups/${slug}`),
      channels: (options?: PaginationAttributes): Promise<any> => {
        return this.getJsonWithPaginationQuery(
          `groups/${slug}/channels`,
          options
        );
      },
    };
  }

  channel(slug: string): ArenaChannelApi {
    return {
      connect: {
        block: (blockId: number) =>
          this.createConnection(slug, blockId, 'Block'),
        channel: (channelId: number) =>
          this.createConnection(slug, channelId, 'Channel'),
      },
      disconnect: {
        block: (blockId: number) =>
          // 204 on success
          this.del(`channels/${slug}/blocks/${blockId}`),
        channel: () => {
          throw new Error('Method Not Implemented');
        },
      },
      contents: (
        options?: PaginationAttributes
      ): Promise<GetChannelContentsApiResponse> => {
        return this.getJsonWithPaginationQuery(
          `channels/${slug}/contents`,
          options
        );
      },
      connections: (
        options?: PaginationAttributes
      ): Promise<GetConnectionsApiResponse[]> => {
        return this.getJsonWithPaginationQuery(
          `channels/${slug}/connections`,
          options
        );
      },
      create: (status?: ChannelStatus): Promise<CreateChannelApiResponse> => {
        return this.postJson('channels', {
          title: slug,
          status,
        });
      },
      update: (data: {
        title: string;
        status?: ChannelStatus;
      }): Promise<undefined> => {
        return this.putJson(`channels/${slug}`, data);
      },
      createBlock: (data: {
        source?: string;
        content?: string;
        description?: string;
      }): Promise<CreateBlockApiResponse> => {
        return this.postJson(`channels/${slug}/blocks`, data);
      },
      get: (options?: PaginationAttributes): Promise<GetChannelsApiResponse> =>
        this.getJsonWithPaginationQuery(`channels/${slug}`, options),
      delete: (): Promise<undefined> => {
        return this.del(`channels/${slug}`);
      },
      thumb: (): Promise<GetChannelThumbApiResponse> =>
        this.getJson(`channels/${slug}/thumb`),
    };
  }

  block(id: number): ArenaBlockApi {
    return {
      channels: (
        options?: PaginationAttributes
      ): Promise<GetBlockChannelsApiResponse[]> =>
        this.getJsonWithPaginationQuery(`blocks/${id}/channels`, options),
      get: (): Promise<GetBlockApiResponse> => {
        return this.getJson(`blocks/${id}`);
      },
      update: (data: {
        title?: string;
        description?: string;
        content?: string;
      }): Promise<undefined> => {
        return this.putJson(`blocks/${id}`, data);
      },
    };
  }

  get search(): ArenaSearchApi {
    return {
      everything: (
        query: string,
        options?: PaginationAttributes
      ): Promise<any> =>
        this.getJsonWithSearchAndPaginationQuery(`/search`, {
          q: query,
          ...options,
        }),
      blocks: (query: string, options?: PaginationAttributes): Promise<any> =>
        this.getJsonWithSearchAndPaginationQuery(`/search/blocks`, {
          q: query,
          ...options,
        }),
      channels: (query: string, options?: PaginationAttributes): Promise<any> =>
        this.getJsonWithSearchAndPaginationQuery(`/search/channels`, {
          q: query,
          ...options,
        }),
      users: (query: string, options?: PaginationAttributes): Promise<any> =>
        this.getJsonWithSearchAndPaginationQuery(`/search/users`, {
          q: query,
          ...options,
        }),
    };
  }

  private createConnection(
    channelSlug: string,
    id: number,
    type: 'Block' | 'Channel'
  ) {
    return this.postJson(`channels/${channelSlug}/connections`, {
      connectable_type: type,
      connectable_id: id,
    });
  }

  private getJsonWithSearchAndPaginationQuery(
    url: string,
    options?: PaginationAttributes & { q?: string }
  ) {
    const qs = this.paginationQueryString(options);
    const searchQuery =
      options && options.q ? `q=${options.q}${qs ? '&' : ''}` : '';
    return this.getJson(`${url}?${searchQuery}${qs}`);
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
      if (res.ok) {
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
      if (res.ok) {
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
      if (res.ok) {
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
      if (res.ok) {
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
