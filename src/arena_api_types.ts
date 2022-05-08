export type ArenaUser = {
  /** The internal ID of the user */
  id: number;
  /** The slug of the user. This is used for the user's default profile channel */
  slug: string;
  /** Currently this will be equivalent to "full_name" */
  username: string;
  /** The first name of the user */
  first_name: string;
  /** The last name of the user */
  last_name: string;
  /**  The gravatar URL to the user's avatar */
  avatar: string;
  avatar_image: ArenaImage[] | null;
  /**  The number of channels the user owns or is a collaborator on */
  channel_count: number;
  /**  The number of channels and users a user is following */
  following_count: number;
  /**  The internal ID of the user's profile channel */
  profile_id: number;
  /**  The number of users following the user */
  follower_count: number;
  /**  Will always be "User" */
  class: 'User';
  /**  The initials of a user. Derived from the user's first and last name */
  initials: string;
};

export type ArenaUserWithDetails = ArenaUser & {
  avatar_image: {
    display: string;
    thumb: string;
  };
  can_index: boolean;
  badge: null | string;
  created_at: string;
  is_confirmed: boolean;
  is_exceeding_private_connections_limit?: boolean;
  is_lifetime_premium: boolean;
  is_pending_confirmation: boolean;
  is_pending_reconfirmation: boolean;
  is_premium: boolean;
  is_supporter: boolean;
  metadata: { description: null | string };
};

export type MeApiResponse = ArenaUserWithDetails & {
  channels: GetChannelsApiResponse[];
};

export type GetUserApiResponse = ArenaUserWithDetails;
export type GetUserFollowersApiResponse = {
  length: number;
  total_pages: number;
  current_page: number;
  per: number;
  base_class: 'User';
  class: 'User';
  users: ArenaUserWithDetails[];
};
export type GetUserFollowingApiResponse = GetUserFollowersApiResponse;

export type GetUserChannelsApiResponse = {
  length: number;
  total_pages: number;
  current_page: number;
  per: number;
  base_class: 'User';
  class: 'User';
  channels: ArenaChannelWithDetails[];
};

export type ArenaAttachment = {
  content_type: string;
  extension: string;
  file_name: string;
  file_size: number;
  file_size_display: string;
  url: string;
};

export type ArenaEmbed = {
  author_name: string | null;
  author_url: string | null; // https://soundcloud.com/dkmntl"
  height: number;
  html: string | null;
  source_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  type: 'rich' | null;
  url: string | null;
  width: number;
};

export type ArenaImage = {
  /**  (String)  Name of the file as it appears on the Arena filesystem */
  filename: string;
  /**  (String)  MIME type of the image (e.g. 'image/png') */
  content_type: string;
  /**(Timestamp)  Timestamp of the last time the file was updated */
  updated_at: string;
  /** (Hash)  Only contains url which is a URL of the thumbnail sized image (200x200) */
  thumb: { url: string };
  /**(Hash)  Only contains url which is a URL of the display sized image (same aspect ratio as original image but with a maximim width of 600px or a maximum height of 600px, whichever comes first) */
  display: { url: string };
  large: { url: string };
  square: { url: string };
  /**  (Hash)  Contains url which is a URL of the original image as well file_size (an integer representation in bytes) and file_size_display (a nicer string representation of the file_size) */
  original: {
    file_size: number;
    file_size_display: string;
    url: string;
  };
};

export type ArenaBlock = {
  /**  (Integer)  The internal ID of the block */
  id: number;
  /**  (String, can be null)  The title of the block */
  title: string | null;
  /**  (Timestamp)  Timestamp when the block was last updated */
  updated_at: string;
  /**  (Timestamp)  Timestamp when the block was created */
  created_at: string;
  /** (String)  Represents the state of the blocks processing lifecycle (this will most often "Available" but can also be "Failure", "Processed", "Processing") */
  state:
    | 'available'
    | 'failure'
    | 'processed'
    | 'processing'
    | 'remote_processing';
  visibility?: 'private' | 'public'; // from create Block
  /**  (Integer)  The number of comments on a block */
  comment_count: number;
  /**  (String)  If the title is present on the block, this will be identical to the title. Otherwise it will be a truncated string of the *description* or *content*. If neither of those are present, it will be "Untitled" */
  generated_title: string;
  /**  (String)  The type of block. Can be "Image", "Text", "Link", "Media", or "Attachment" */
  class: 'Image' | 'Text' | 'Link' | 'Media' | 'Attachment';
  /**  (String)  This will always be "Block" */
  base_class: 'Block';
  /**(String, can be null)  If the block is of class "Text", this will be the text content as markdown */
  content: string | null;
  /**  (String, can be null)  If the block is of class "Text", this will be the text content as HTML */
  content_html: string | null;
  /**  (String, can be null)  This is used for captioning any type of block. Returns markdown. */
  description: string | null;
  /** (String, can be null)  This is used for captioning any type of block. Returns HTML */
  description_html: string | null;
  source: {
    title?: string;
    /**  (String) The url of the source */
    url: string;
    /**  (Hash)  A hash of more info about the provider name: (String) The name of the source provider url: (String) The hostname of the source provider */
    provider: {
      url: string;
      name: string;
    } | null;
  } | null;
  image: ArenaImage | null;
  /**  (Hash)  Representation of the author of the block */
  user: ArenaUserWithDetails; // can be user when returning
  attachment?: ArenaAttachment | null;
  embed?: ArenaEmbed | null;
  connections?: ArenaChannel[]; // connection type
};

export type ArenaCommentEntity = {
  type: 'user';
  user_id: number;
  user_slug: string;
  user_name: string;
  start: number;
  end: number;
};

export type ArenaBlockComment = {
  id: number;
  created_at: string;
  updated_at: string;
  commentable_id: number;
  commentable_type: 'Block';
  body: string;
  user_id: string;
  deleted: boolean | null;
  entities: ArenaCommentEntity[];
  base_class: 'Comment';
  user: ArenaUserWithDetails;
};

export type GetBlockCommentApiResponse = {
  length: number;
  total_pages: null | number;
  current_page: number;
  per: number;
  channel_title: null | string;
  comments: ArenaBlockComment[];
};

export type CreateBlockCommentApiResponse = ArenaBlockComment;

export type GetBlockApiResponse = ArenaBlock & {
  /**  (Array)  An array of hash representations of each of the channels the block appears in */
  connections: ArenaChannel[];
};

export type CreateBlockApiResponse = ArenaBlock & ConnectionData;

export type GetBlockChannelsApiResponse = {
  length: number;
  total_pages: number;
  current_page: number;
  per: number;
  channels: (ArenaChannel & ArenaOwnerInfo)[];
};

export type ConnectionData = {
  /**  (Integer)  The position of the block inside the channel (as determined by the channel's author and collaborators) */
  position: number;
  /**  (Boolean)  Block is marked as selected inside the channel (this is an initial attempt to allow users to "feature" some content over others, can be used for moderation, introduction text, etc) */
  selected: boolean;
  /**  (Timestamp)  Time when block was connected to the channel (if the block was created at the same time as the channel this will be identical to created_at) */
  connected_at: string;
  /**  (Integer)  ID of the user who connected the block to the channel (if the block was not reused by another user, this will be identical to user_id) */
  connected_by_user_id: number;
  connection_id?: number;
  connected_by_username?: string;
  connected_by_user_slug?: string;
};

export type ArenaGroup = {
  id: number;
  class: 'Group';
  base_class: 'Group';
  created_at: string;
  updated_at: string;
  name: string;
  description?: string | null;
  visibility?: number;
  slug: string;
};

export type GetGroupApiResponse = ArenaGroup & {
  title: string;
  user: ArenaUserWithDetails;
  users: ArenaUserWithDetails[];
  member_ids: number[];
  accessible_by_ids: number[];
  published: boolean;
};

export type ArenaChannel = {
  /**  (Integer)  The internal ID of the channel */
  id: number;
  /**  (String)  The title of the channel */
  title: string;
  /**  (Timestamp)  Timestamp when the channel was created */
  created_at: string;
  /**  (Timestamp)  Timestamp when the channel was last updated */
  updated_at: string;
  /**  (Timestamp)  Timestamp when the channel was last added to */
  added_to_at?: string;
  /**  (Boolean)  If channel is visible to all members of arena or not */
  published: boolean;
  /**  (Boolean)  If channel is open to other members of arena for adding blocks */
  open: boolean;
  /**  (Boolean)  If the channel has collaborators or not */
  collaboration: boolean;
  /**  (String)  The slug of the channel used in the url (e.g. http://are.na/arena-influences) */
  slug: string;
  /**  (Integer)  The number of items in a channel (blocks and other channels) */
  length: number;
  /**  (String)  Can be either "default" (a standard channel) or "profile" the default channel of a user */
  kind: 'default' | 'profile';
  /**  (String)  Can be "private" (only open for reading and adding to the channel by channel author and collaborators), "closed" (open for reading by everyone, only channel author and collaborators can add) or "public" (everyone can read and add to the channel) */
  status: 'private' | 'public' | 'closed';
  state: 'available';
  'nsfw?': boolean;
  metadata: { description: null | string } | null;
  /**  (Integer)  Internal ID of the channel author */
  user_id: number;
  /**  (String)  Will always be "Channel" */
  class: 'Channel';
  /**  (String)  Will always be "Channel" */
  base_class: 'Channel';
};

export type ArenaOwnerInfo = {
  owner_type: 'Group' | 'User';
  owner_id: string;
  owner_slug?: string;
};

export type CreateChannelApiResponse = ArenaChannel & ArenaOwnerInfo;

export type GetChannelThumbApiResponse = ArenaChannel &
  ArenaOwnerInfo & {
    contents: ReadonlyArray<
      (ArenaBlock | Omit<ArenaChannelWithDetails, 'contents'>) & ConnectionData
    > | null;
  };

export type ArenaChannelContents = (ArenaBlock | ArenaChannelWithDetails) &
  ConnectionData;

export type GetChannelContentsApiResponse = {
  contents: ReadonlyArray<ArenaChannelContents>;
};

export type ChannelConnectBlockApiResponse = ArenaBlock & ConnectionData;
export type ChannelConnectChannelApiResponse = ArenaChannelWithDetails &
  ConnectionData;

export type ArenaChannelWithDetails = ArenaOwnerInfo & {
  /**  (Object)  More information on the channel author. Contains id, slug, first_name, last_name, full_name, avatar, email, channel_count, following_count, follower_count, and profile_id */
  user?: ArenaUserWithDetails;
  group?: ArenaGroup;
  // /**  (Integer)  If pagination is used, how many total pages there are in your request */
  // total_pages: number;
  // /**  (Integer)  If pagination is used, page requested */
  // current_page: number;
  // /**  (Integer)  If pagination is used, items per page requested */
  // per: number;
  // /**  (Integer)  Number of followers the channel has */
  follower_count: number;
  can_index: boolean;
  /** (Array, can be null)  Array of blocks and other channels in the channel. Note: If the request is authenticated, this will include any private channels included in the requested channel that you have access to. If not, only public channels included in the requested channel will be shown. */
  contents: ReadonlyArray<ArenaChannelContents> | null;
};

export type GetGroupChannelsApiResponse = {
  length: number;
  total_pages: null | number;
  current_page: number;
  per: number;
  channel_title: null | string;
  channels: ArenaChannelWithDetails[];
};

export type GetChannelsApiResponse = ArenaChannelWithDetails & {
  per: number;
  page: number;
  owner: ArenaUserWithDetails | null;
  collaborators: ReadonlyArray<ArenaUser>[] | null;
};

export type GetConnectionsApiResponse = (ArenaBlock | GetChannelsApiResponse) &
  ConnectionData;

/**
 *  Options available for paginating requests to channel endpoints.
 */
export type PaginationAttributes = {
  /** Number of items returned per page. */
  per?: number;
  /** The page to fetch. */
  page?: number;
  /** The field to sort results by. */
  sort?: string;
  /** The direction of returned results. */
  direction?: 'asc' | 'desc';
  /** Force refresh of the server cache. */
  forceRefresh?: boolean;
};

export type SearchApiResponse = {
  term: string;
  per: number;
  current_page: number;
  total_pages: number;
  length: number;
  authenticated: boolean;
  channels: ArenaChannel[];
  blocks: ArenaBlock[];
  users: ArenaUserWithDetails[];
};
