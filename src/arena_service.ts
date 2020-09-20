import {
  BlockApiType,
  ChannelApiType,
  ConnectionApiType,
  MeApiType,
  PaginationAttributes,
} from './arena_api_types';

export class HttpError extends Error {
  readonly name = 'HttpError';
  constructor(message?: string, readonly status: number = 500) {
    super(message);
  }
}

export interface Arena_service {
  /**
   *  Fetch information about current authenticated user.
   */
  me(): Promise<MeApiType>;

  /**
   *  Fetch list of channels.
   */
  channels(
    opts: { userId: string } & PaginationAttributes
  ): Promise<ChannelApiType>;

  /**
   *  Fetch channel details.
   */
  channel(slug: string, params?: PaginationAttributes): Promise<ChannelApiType>;

  /**
   *  Update the sort order of the target channel.
   */
  sort(slug: string, ids: string[]): Promise<unknown>;

  /**
   *  Retrieve the contents of a specific Block.
   */
  block(id: string): Promise<BlockApiType>;

  /**
   * Connect a Block or a Channel to another Channel.
   *  Requires authentication.
   */
  connect(
    channelSlug: string,
    id: string,
    type: 'Block' | 'Channel'
  ): Promise<ConnectionApiType>;

  /**
   *  Delete a Channel, or removes a block from a channel.
   *  Requires authentication.
   */
  remove(channelSlug: string, blockId?: string): Promise<void>;
}

type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
type Date = { now(): number };

export class ArenaClient implements Arena_service {
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

  channels(params?: { userId?: string } & PaginationAttributes) {
    const qs = this.paginationQueryString(params);
    const url = params?.userId
      ? `users/${params.userId}/channels`
      : `channels/`;
    return this.getJson(`${url}?${qs}`);
  }

  channel(slug: string, params?: PaginationAttributes) {
    const qs = this.paginationQueryString(params);
    return this.getJson(`channels/${slug}?${qs}`);
  }

  sort(slug: string, ids: string[]) {
    return this.putJson(`channels/${slug}/sort`, { ids });
  }

  block(id: string) {
    return this.getJson(`blocks/${id}`);
  }

  connect(channelSlug: string, id: string, type: 'Block' | 'Channel') {
    return this.postJson(`channels/${channelSlug}/connections`, {
      connectable_type: type,
      connectable_id: id,
    });
  }

  remove(channelSlug: string, blockId?: string) {
    const url = blockId
      ? `channels/${channelSlug}/blocks/${blockId}`
      : `channels/${channelSlug}`;
    return this.del(url);
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
        return undefined
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
        return undefined
      }
      throw new HttpError(res.statusText, res.status);
    });
  }

  private paginationQueryString(options?: PaginationAttributes) {
    const { page, per, sort, direction } = {
      ...ArenaClient.defaultPaginationOptions,
      ...options,
    };
    const attrs = [];
    if (page) attrs.push(`page=${page}`);
    if (per) attrs.push(`per=${per}`);
    if (sort) attrs.push(`sort=${sort}`);
    if (direction) attrs.push(`direction=${direction}`);
    attrs.push(`date=${this.date.now()}`);
    return attrs.join('&');
  }
}
